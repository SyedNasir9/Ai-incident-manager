-- Kubernetes events table
CREATE TABLE IF NOT EXISTS incident_k8s_events (
    id SERIAL PRIMARY KEY,
    incident_id INTEGER NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    event_time TIMESTAMP NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    involved_object_kind VARCHAR(100),
    involved_object_name VARCHAR(255),
    involved_object_namespace VARCHAR(255),
    reason VARCHAR(255),
    message TEXT,
    source_component VARCHAR(255),
    labels JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for K8s event queries
CREATE INDEX IF NOT EXISTS idx_incident_k8s_events_incident_id ON incident_k8s_events(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_k8s_events_event_time ON incident_k8s_events(event_time);
CREATE INDEX IF NOT EXISTS idx_incident_k8s_events_event_type ON incident_k8s_events(event_type);
CREATE INDEX IF NOT EXISTS idx_incident_k8s_events_object_kind ON incident_k8s_events(involved_object_kind);
