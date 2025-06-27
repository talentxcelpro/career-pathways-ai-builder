
-- Enable Row Level Security on the tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts and recreate them properly
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Participants can update conversations" ON public.conversations;

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

DROP POLICY IF EXISTS "Users can view their own message reads" ON public.message_reads;
DROP POLICY IF EXISTS "Users can create their own message reads" ON public.message_reads;
DROP POLICY IF EXISTS "Users can update their own message reads" ON public.message_reads;

-- Create new RLS policies for conversations table
CREATE POLICY "Users can view conversations they participate in" ON public.conversations 
FOR SELECT USING (auth.uid() = ANY(participants));

CREATE POLICY "Users can create conversations" ON public.conversations 
FOR INSERT WITH CHECK (auth.uid() = ANY(participants));

CREATE POLICY "Participants can update conversations" ON public.conversations 
FOR UPDATE USING (auth.uid() = ANY(participants));

-- Create RLS policies for messages table
CREATE POLICY "Users can view messages in their conversations" ON public.messages 
FOR SELECT USING (
  conversation_id IN (
    SELECT id FROM public.conversations 
    WHERE auth.uid() = ANY(participants)
  )
);

CREATE POLICY "Users can create messages in their conversations" ON public.messages 
FOR INSERT WITH CHECK (
  conversation_id IN (
    SELECT id FROM public.conversations 
    WHERE auth.uid() = ANY(participants)
  )
);

CREATE POLICY "Users can update their own messages" ON public.messages 
FOR UPDATE USING (auth.uid() = sender_id);

-- Create RLS policies for message_reads table
CREATE POLICY "Users can view their own message reads" ON public.message_reads 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own message reads" ON public.message_reads 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own message reads" ON public.message_reads 
FOR UPDATE USING (auth.uid() = user_id);
