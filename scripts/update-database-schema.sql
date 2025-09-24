-- Script pour vérifier et ajouter les nouveaux champs à la table messages
-- Ce script doit être exécuté dans Supabase SQL Editor

-- Vérifier si les colonnes existent déjà
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'mail' 
AND table_name = 'messages' 
AND column_name IN ('is_archived', 'is_deleted', 'is_in_trash', 'reply_to_message_id', 'forwarded_from_message_id', 'deleted_at');

-- Ajouter les colonnes manquantes (si elles n'existent pas)
ALTER TABLE mail.messages 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_in_trash BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reply_to_message_id UUID REFERENCES mail.messages(id),
ADD COLUMN IF NOT EXISTS forwarded_from_message_id UUID REFERENCES mail.messages(id),
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Créer les index pour les nouveaux champs
CREATE INDEX IF NOT EXISTS idx_messages_is_archived ON mail.messages(is_archived);
CREATE INDEX IF NOT EXISTS idx_messages_is_deleted ON mail.messages(is_deleted);
CREATE INDEX IF NOT EXISTS idx_messages_is_in_trash ON mail.messages(is_in_trash);
CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON mail.messages(reply_to_message_id);
CREATE INDEX IF NOT EXISTS idx_messages_forwarded_from ON mail.messages(forwarded_from_message_id);

-- Créer les index composites pour les nouveaux champs
CREATE INDEX IF NOT EXISTS idx_messages_user_archived ON mail.messages(user_id, is_archived) WHERE is_archived = true;
CREATE INDEX IF NOT EXISTS idx_messages_user_trash ON mail.messages(user_id, is_in_trash) WHERE is_in_trash = true;
CREATE INDEX IF NOT EXISTS idx_messages_user_sent ON mail.messages(user_id, is_sent) WHERE is_sent = true;

-- Vérifier que tout a été créé correctement
SELECT 'Schema update completed successfully' as status;
