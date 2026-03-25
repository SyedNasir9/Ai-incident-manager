-- Incident root causes table
CREATE TABLE IF NOT EXISTS incident_root_causes (
    id SERIAL PRIMARY KEY,
    incident_id INTEGER NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    root_cause TEXT NOT NULL,
    analysis_model VARCHAR(100),
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for root cause queries
CREATE INDEX IF NOT EXISTS idx_incident_root_causes_incident_id ON incident_root_causes(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_root_causes_created_at ON incident_root_causes(created_at);

-- Unique constraint to ensure one root cause per incident (can be updated)
CREATE UNIQUE INDEX IF NOT EXISTS idx_incident_root_causes_unique_incident 
    ON incident_root_causes(incident_id);
