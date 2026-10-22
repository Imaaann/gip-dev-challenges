CREATE TABLE IF NOT EXISTS reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(32) NOT NULL,
    resolved_id UUID REFERENCES reports(id) ON DELETE SET NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_type CHECK (type in ('lost', 'found')),
    CONSTRAINT ck_resolve CHECK (resolved_id <> id)
);
