CREATE TABLE IF NOT EXISTS incident_embeddings (
    id UUID PRIMARY KEY,
    incident_id UUID NOT NULL,
    embedding JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incident_embeddings_incident_id
    ON incident_embeddings(incident_id);

