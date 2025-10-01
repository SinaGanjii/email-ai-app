
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE SCHEMA IF NOT EXISTS mail;

SET search_path TO mail, public;

CREATE TABLE labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,         
    type TEXT DEFAULT 'system', 
    color TEXT DEFAULT '#3B82F6', 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


CREATE TABLE threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT,
    snippet TEXT,  
    history_id BIGINT,
    gmail_thread_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    gmail_id TEXT UNIQUE,
    gmail_message_id TEXT,
    from_email TEXT NOT NULL,
    from_name TEXT,
    to_emails TEXT[] NOT NULL,
    cc_emails TEXT[],
    bcc_emails TEXT[],
    subject TEXT,
    body TEXT,
    body_html TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    is_starred BOOLEAN DEFAULT FALSE,
    is_important BOOLEAN DEFAULT FALSE,
    is_sent BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    is_in_trash BOOLEAN DEFAULT FALSE,
    reply_to_message_id UUID REFERENCES messages(id),
    forwarded_from_message_id UUID REFERENCES messages(id), 
    sent_at TIMESTAMP WITH TIME ZONE,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE, -- زمان حذف
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE message_labels (
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    label_id UUID REFERENCES labels(id) ON DELETE CASCADE,
    PRIMARY KEY (message_id, label_id)
);


CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    mime_type TEXT,
    size BIGINT,
    storage_path TEXT, 
    gmail_attachment_id TEXT, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


CREATE TABLE ai_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    prompt TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE agent_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, 
    action_data JSONB, 
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    gmail_sync_enabled BOOLEAN DEFAULT TRUE,
    auto_archive_read BOOLEAN DEFAULT FALSE,
    default_agent_id UUID REFERENCES ai_agents(id),
    theme TEXT DEFAULT 'light',
    language TEXT DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ایندکس‌ها برای سرعت
CREATE INDEX idx_messages_user_id ON mail.messages(user_id);
CREATE INDEX idx_messages_thread_id ON mail.messages(thread_id);
CREATE INDEX idx_messages_gmail_id ON mail.messages(gmail_id);
CREATE INDEX idx_messages_from_email ON mail.messages(from_email);
CREATE INDEX idx_messages_subject ON mail.messages(subject);
CREATE INDEX idx_messages_sent_at ON mail.messages(sent_at);
CREATE INDEX idx_messages_received_at ON mail.messages(received_at);
CREATE INDEX idx_messages_is_read ON mail.messages(is_read);
CREATE INDEX idx_messages_is_starred ON mail.messages(is_starred);
CREATE INDEX idx_messages_is_archived ON mail.messages(is_archived);
CREATE INDEX idx_messages_is_deleted ON mail.messages(is_deleted);
CREATE INDEX idx_messages_is_in_trash ON mail.messages(is_in_trash);
CREATE INDEX idx_messages_reply_to ON mail.messages(reply_to_message_id);
CREATE INDEX idx_messages_forwarded_from ON mail.messages(forwarded_from_message_id);

CREATE INDEX idx_messages_search
ON mail.messages USING GIN (to_tsvector('english', coalesce(subject, '') || ' ' || coalesce(body, '')));

CREATE INDEX idx_messages_user_unread ON mail.messages(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_messages_user_starred ON mail.messages(user_id, is_starred) WHERE is_starred = true;
CREATE INDEX idx_messages_user_important ON mail.messages(user_id, is_important) WHERE is_important = true;
CREATE INDEX idx_messages_user_archived ON mail.messages(user_id, is_archived) WHERE is_archived = true;
CREATE INDEX idx_messages_user_trash ON mail.messages(user_id, is_in_trash) WHERE is_in_trash = true;
CREATE INDEX idx_messages_user_sent ON mail.messages(user_id, is_sent) WHERE is_sent = true;

CREATE INDEX idx_labels_user_id ON mail.labels(user_id);
CREATE INDEX idx_labels_type ON mail.labels(type);

CREATE INDEX idx_threads_user_id ON mail.threads(user_id);
CREATE INDEX idx_threads_gmail_thread_id ON mail.threads(gmail_thread_id);
CREATE INDEX idx_threads_updated_at ON mail.threads(updated_at DESC);

CREATE INDEX idx_attachments_message_id ON mail.attachments(message_id);
CREATE INDEX idx_attachments_size ON mail.attachments(size) WHERE size > 0;

CREATE INDEX idx_ai_agents_user_id ON mail.ai_agents(user_id);
CREATE INDEX idx_ai_agents_is_active ON mail.ai_agents(is_active);

CREATE INDEX idx_agent_actions_agent_id ON mail.agent_actions(agent_id);
CREATE INDEX idx_agent_actions_message_id ON mail.agent_actions(message_id);
CREATE INDEX idx_agent_actions_status ON mail.agent_actions(status);

ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own labels" ON labels
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own labels" ON labels
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own labels" ON labels
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own labels" ON labels
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own threads" ON threads
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own threads" ON threads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own threads" ON threads
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own threads" ON threads
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own messages" ON messages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages" ON messages
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages" ON messages
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own message_labels" ON message_labels
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM mail.messages 
            WHERE mail.messages.id = message_labels.message_id 
            AND mail.messages.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own message_labels" ON message_labels
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM mail.messages 
            WHERE mail.messages.id = message_labels.message_id 
            AND mail.messages.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own message_labels" ON message_labels
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM mail.messages 
            WHERE mail.messages.id = message_labels.message_id 
            AND mail.messages.user_id = auth.uid()
        )
    );


CREATE POLICY "Users can view their own attachments" ON attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM mail.messages 
            WHERE mail.messages.id = attachments.message_id 
            AND mail.messages.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own attachments" ON attachments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM mail.messages 
            WHERE mail.messages.id = attachments.message_id 
            AND mail.messages.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own attachments" ON attachments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM mail.messages 
            WHERE mail.messages.id = attachments.message_id 
            AND mail.messages.user_id = auth.uid()
        )
    );


CREATE POLICY "Users can view their own ai_agents" ON ai_agents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ai_agents" ON ai_agents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ai_agents" ON ai_agents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ai_agents" ON ai_agents
    FOR DELETE USING (auth.uid() = user_id);


CREATE POLICY "Users can view their own agent_actions" ON agent_actions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM mail.ai_agents 
            WHERE mail.ai_agents.id = agent_actions.agent_id 
            AND mail.ai_agents.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own agent_actions" ON agent_actions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM mail.ai_agents 
            WHERE mail.ai_agents.id = agent_actions.agent_id 
            AND mail.ai_agents.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own agent_actions" ON agent_actions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM mail.ai_agents 
            WHERE mail.ai_agents.id = agent_actions.agent_id 
            AND mail.ai_agents.user_id = auth.uid()
        )
    );


CREATE POLICY "Users can view their own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_labels_updated_at BEFORE UPDATE ON labels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_threads_updated_at BEFORE UPDATE ON threads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_agents_updated_at BEFORE UPDATE ON ai_agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION mail.create_default_labels_for_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO mail.labels (user_id, name, type, color) VALUES
        (NEW.id, 'INBOX', 'system', '#3B82F6'),
        (NEW.id, 'STARRED', 'system', '#F59E0B'),
        (NEW.id, 'IMPORTANT', 'system', '#EF4444'),
        (NEW.id, 'SENT', 'system', '#10B981'),
        (NEW.id, 'DRAFT', 'system', '#6B7280'),
        (NEW.id, 'SPAM', 'system', '#F97316'),
        (NEW.id, 'TRASH', 'system', '#6B7280');
    
    INSERT INTO mail.user_settings (user_id) VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_default_labels_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION mail.create_default_labels_for_user();
