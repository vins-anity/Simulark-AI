-- RLS Performance Optimization
-- Wrap auth.uid() in SELECT to prevent per-row re-evaluation
-- This significantly improves query performance at scale

-- =============================================
-- CHATS TABLE RLS POLICIES
-- =============================================

DROP POLICY IF EXISTS "Users can view their project chats" ON public.chats;
DROP POLICY IF EXISTS "Users can insert chats for their projects" ON public.chats;
DROP POLICY IF EXISTS "Users can update their project chats" ON public.chats;
DROP POLICY IF EXISTS "Users can delete their project chats" ON public.chats;

CREATE POLICY "Users can view their project chats" ON public.chats
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.projects WHERE id = chats.project_id AND user_id = (SELECT auth.uid()))
    );

CREATE POLICY "Users can insert chats for their projects" ON public.chats
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.projects WHERE id = chats.project_id AND user_id = (SELECT auth.uid()))
    );

CREATE POLICY "Users can update their project chats" ON public.chats
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.projects WHERE id = chats.project_id AND user_id = (SELECT auth.uid()))
    );

CREATE POLICY "Users can delete their project chats" ON public.chats
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.projects WHERE id = chats.project_id AND user_id = (SELECT auth.uid()))
    );

-- =============================================
-- CHAT_MESSAGES TABLE RLS POLICIES
-- =============================================

DROP POLICY IF EXISTS "Users can view their chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete their chat messages" ON public.chat_messages;

CREATE POLICY "Users can view their chat messages" ON public.chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chats
            JOIN public.projects ON chats.project_id = projects.id
            WHERE chat_messages.chat_id = chats.id AND projects.user_id = (SELECT auth.uid())
        )
    );

CREATE POLICY "Users can insert chat messages" ON public.chat_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.chats
            JOIN public.projects ON chats.project_id = projects.id
            WHERE chat_messages.chat_id = chats.id AND projects.user_id = (SELECT auth.uid())
        )
    );

CREATE POLICY "Users can delete their chat messages" ON public.chat_messages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.chats
            JOIN public.projects ON chats.project_id = projects.id
            WHERE chat_messages.chat_id = chats.id AND projects.user_id = (SELECT auth.uid())
        )
    );

-- =============================================
-- Cleanup unused indexes (from performance advisor)
-- =============================================

-- These indexes have never been used according to Supabase advisors
-- DROP INDEX IF EXISTS idx_ai_generations_project_id;
-- DROP INDEX IF EXISTS idx_ai_generations_user_id;
-- DROP INDEX IF EXISTS idx_chat_messages_created_at;
-- Note: Keeping indexes commented out - they may be useful for future queries
