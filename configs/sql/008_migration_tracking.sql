-- Migration tracking table
CREATE TABLE IF NOT EXISTS schema_migrations (
    id SERIAL PRIMARY KEY,
    version VARCHAR(50) NOT NULL UNIQUE,
    applied_at TIMESTAMP DEFAULT NOW()
);

-- Index for migration queries
CREATE INDEX IF NOT EXISTS idx_schema_migrations_version ON schema_migrations(version);
