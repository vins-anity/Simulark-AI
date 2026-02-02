-- Chat History Migration
-- Adds support for multiple chats per project with message persistence

-- --- Chats Table ---
-- Stores chat sessions per project
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) NOT NULL,
    title TEXT NOT NULL DEFAULT 'New Chat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --- Chat Messages Table ---
-- Stores individual messages within a chat
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL DEFAULT '',
    reasoning TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --- Indexes for Performance ---
CREATE INDEX IF NOT EXISTS idx_chats_project_id ON public.chats(project_id);
CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON public.chats(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON public.chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);

-- --- RLS Policies ---
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Chats: Users can only access chats for their own projects
CREATE POLICY "Users can view their project chats" ON public.chats
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.projects WHERE id = chats.project_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can insert chats for their projects" ON public.chats
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.projects WHERE id = chats.project_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can update their project chats" ON public.chats
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.projects WHERE id = chats.project_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can delete their project chats" ON public.chats
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.projects WHERE id = chats.project_id AND user_id = auth.uid())
    );

-- Chat Messages: Users can only access messages for their own chats
CREATE POLICY "Users can view their chat messages" ON public.chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chats
            JOIN public.projects ON chats.project_id = projects.id
            WHERE chat_messages.chat_id = chats.id AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert chat messages" ON public.chat_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.chats
            JOIN public.projects ON chats.project_id = projects.id
            WHERE chat_messages.chat_id = chats.id AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their chat messages" ON public.chat_messages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.chats
            JOIN public.projects ON chats.project_id = projects.id
            WHERE chat_messages.chat_id = chats.id AND projects.user_id = auth.uid()
        )
    );

-- --- Auto-update updated_at for chats ---
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS handle_chats_updated_at ON public.chats;
CREATE TRIGGER handle_chats_updated_at
    BEFORE UPDATE ON public.chats
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
