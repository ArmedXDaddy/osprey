
-- Create the workshop_registrations table
CREATE TABLE IF NOT EXISTS public.workshop_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_profile_image TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add a unique constraint to prevent duplicate registrations
ALTER TABLE public.workshop_registrations ADD CONSTRAINT unique_workshop_registration UNIQUE (workshop_id, user_id);

-- Add RLS policies
ALTER TABLE public.workshop_registrations ENABLE ROW LEVEL SECURITY;

-- Everyone can view workshop registrations
CREATE POLICY "Anyone can view workshop registrations" 
ON public.workshop_registrations FOR SELECT 
USING (true);

-- Only users can create their own registrations
CREATE POLICY "Users can create their own registrations" 
ON public.workshop_registrations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Only users can update their own registrations
CREATE POLICY "Users can update their own registrations" 
ON public.workshop_registrations FOR UPDATE 
USING (auth.uid() = user_id);

-- Only users can delete their own registrations
CREATE POLICY "Users can delete their own registrations" 
ON public.workshop_registrations FOR DELETE 
USING (auth.uid() = user_id);

-- Workshop creators can also update registrations
CREATE POLICY "Workshop creators can update registrations" 
ON public.workshop_registrations FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM workshops
    WHERE workshops.id = workshop_id
    AND workshops.company_id = auth.uid()
  )
);

-- Add updated_at trigger
CREATE TRIGGER set_workshop_registration_updated_at
BEFORE UPDATE ON public.workshop_registrations
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();
