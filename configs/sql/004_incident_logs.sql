-- Incident logs table for storing Loki log entries
CREATE TABLE IF NOT EXISTS incident_logs (
    id SERIAL PRIMARY KEY,
    incident_id INTEGER NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    timestamp TIMESTAMP NOT NULL,
    level VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    source VARCHAR(255),
    labels JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for log queries
CREATE INDEX IF NOT EXISTS idx_incident_logs_incident_id ON incident_logs(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_logs_timestamp ON incident_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_incident_logs_level ON incident_logs(level);
CREATE INDEX IF NOT EXISTS idx_incident_logs_source ON incident_logs(source);
