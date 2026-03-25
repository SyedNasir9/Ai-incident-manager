-- Incident embeddings table for vector similarity search
CREATE TABLE IF NOT EXISTS incident_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id INTEGER NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    embedding vector(1536) NOT NULL, -- Using pgvector type for better performance
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for embedding similarity search
CREATE INDEX IF NOT EXISTS idx_incident_embeddings_incident_id 
    ON incident_embeddings(incident_id);

-- Vector index for similarity search (requires pgvector extension)
CREATE INDEX IF NOT EXISTS idx_incident_embeddings_embedding_vector 
    ON incident_embeddings USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

