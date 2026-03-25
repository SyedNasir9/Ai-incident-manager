package storage

import (
	"context"
	"fmt"
	"io/fs"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

// RunMigrations executes all SQL migration files in the given directory
// that haven't been applied yet, in alphabetical order.
func RunMigrations(ctx context.Context, db *pgxpool.Pool, migrationsDir string) error {
	// Ensure migrations directory exists
	if _, err := os.Stat(migrationsDir); os.IsNotExist(err) {
		return fmt.Errorf("migrations directory %q does not exist", migrationsDir)
	}

	// Get all migration files
	files, err := fs.ReadDir(os.DirFS(migrationsDir), ".")
	if err != nil {
		return fmt.Errorf("read migrations directory: %w", err)
	}

	// Filter and sort migration files
	var migrationFiles []string
	for _, file := range files {
		if !file.IsDir() && strings.HasSuffix(file.Name(), ".sql") {
			migrationFiles = append(migrationFiles, file.Name())
		}
	}
	sort.Strings(migrationFiles)

	// Create migrations tracking table if it doesn't exist
	if err := createMigrationTable(ctx, db); err != nil {
		return fmt.Errorf("create migration table: %w", err)
	}

	// Get applied migrations
	applied, err := getAppliedMigrations(ctx, db)
	if err != nil {
		return fmt.Errorf("get applied migrations: %w", err)
	}

	// Run pending migrations
	for _, filename := range migrationFiles {
		if applied[filename] {
			log.Printf("Migration %s already applied, skipping", filename)
			continue
		}

		if err := runMigration(ctx, db, migrationsDir, filename); err != nil {
			return fmt.Errorf("run migration %s: %w", filename, err)
		}
		log.Printf("Applied migration: %s", filename)
	}

	log.Printf("All migrations applied successfully")
	return nil
}

// createMigrationTable creates the schema_migrations table if it doesn't exist
func createMigrationTable(ctx context.Context, db *pgxpool.Pool) error {
	const query = `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			id SERIAL PRIMARY KEY,
			version VARCHAR(50) NOT NULL UNIQUE,
			applied_at TIMESTAMP DEFAULT NOW()
		)
	
		CREATE INDEX IF NOT EXISTS idx_schema_migrations_version ON schema_migrations(version)
	`

	_, err := db.Exec(ctx, query)
	return err
}

// getAppliedMigrations returns a map of already applied migration filenames
func getAppliedMigrations(ctx context.Context, db *pgxpool.Pool) (map[string]bool, error) {
	const query = `SELECT version FROM schema_migrations`

	rows, err := db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	applied := make(map[string]bool)
	for rows.Next() {
		var version string
		if err := rows.Scan(&version); err != nil {
			return nil, err
		}
		applied[version] = true
	}

	return applied, rows.Err()
}

// runMigration executes a single migration file within a transaction
func runMigration(ctx context.Context, db *pgxpool.Pool, migrationsDir, filename string) error {
	// Read migration file
	path := filepath.Join(migrationsDir, filename)
	content, err := os.ReadFile(path)
	if err != nil {
		return fmt.Errorf("read migration file: %w", err)
	}

	// Execute within a transaction
	tx, err := db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// Execute migration SQL
	if _, err := tx.Exec(ctx, string(content)); err != nil {
		return fmt.Errorf("execute migration SQL: %w", err)
	}

	// Record migration as applied
	const insertQuery = `INSERT INTO schema_migrations (version) VALUES ($1)`
	if _, err := tx.Exec(ctx, insertQuery, filename); err != nil {
		return fmt.Errorf("record migration: %w", err)
	}

	// Commit transaction
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit migration: %w", err)
	}

	return nil
}
