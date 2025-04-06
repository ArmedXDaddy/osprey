
-- Add is_completed field to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false;

-- Create event_announcements table
CREATE TABLE IF NOT EXISTS public.event_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL,
  creator_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies to event_announcements
ALTER TABLE public.event_announcements ENABLE ROW LEVEL SECURITY;

-- Only creators can insert announcements
CREATE POLICY "Creators can insert announcements" ON public.event_announcements
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE id = event_id 
      AND creator_id = auth.uid()
    )
  );

-- Everyone can view announcements for events they are part of
CREATE POLICY "Users can view announcements for their events" ON public.event_announcements
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE id = event_id 
      AND (
        creator_id = auth.uid() OR
        auth.uid() = ANY(attendees)
      )
    )
  );
