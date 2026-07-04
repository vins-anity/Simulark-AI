-- Chat message metadata for architecture generation audit trail
ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_chat_messages_metadata ON chat_messages USING gin (metadata);
