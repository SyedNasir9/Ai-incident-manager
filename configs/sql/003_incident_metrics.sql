-- Incident metrics table for storing Prometheus metrics
CREATE TABLE IF NOT EXISTS incident_metrics (
    id SERIAL PRIMARY KEY,
    incident_id INTEGER NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    metric_name VARCHAR(255) NOT NULL,
    metric_value DECIMAL(15,6) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    labels JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for metric queries
CREATE INDEX IF NOT EXISTS idx_incident_metrics_incident_id ON incident_metrics(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_metrics_name_timestamp ON incident_metrics(metric_name, timestamp);
CREATE INDEX IF NOT EXISTS idx_incident_metrics_timestamp ON incident_metrics(timestamp);
