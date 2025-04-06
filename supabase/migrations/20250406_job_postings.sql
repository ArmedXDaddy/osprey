
-- Create the job_postings table
CREATE TABLE IF NOT EXISTS public.job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  company_id UUID NOT NULL REFERENCES auth.users(id),
  company_name TEXT NOT NULL,
  company_logo TEXT,
  location TEXT,
  job_type TEXT NOT NULL DEFAULT 'full-time',
  salary_range TEXT,
  skills TEXT[],
  application_url TEXT,
  application_email TEXT,
  application_deadline DATE,
  responsibilities TEXT[],
  requirements TEXT[],
  benefits TEXT[],
  company_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;

-- Everyone can view job postings
CREATE POLICY "Anyone can view job postings" 
ON public.job_postings FOR SELECT 
USING (true);

-- Only the job creator (company) can insert their own job postings
CREATE POLICY "Companies can create job postings" 
ON public.job_postings FOR INSERT 
WITH CHECK (auth.uid() = company_id);

-- Only the job creator (company) can update their own job postings
CREATE POLICY "Companies can update their job postings" 
ON public.job_postings FOR UPDATE 
USING (auth.uid() = company_id);

-- Only the job creator (company) can delete their own job postings
CREATE POLICY "Companies can delete their job postings" 
ON public.job_postings FOR DELETE 
USING (auth.uid() = company_id);

-- Add updated_at trigger
CREATE TRIGGER set_job_posting_updated_at
BEFORE UPDATE ON public.job_postings
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();
