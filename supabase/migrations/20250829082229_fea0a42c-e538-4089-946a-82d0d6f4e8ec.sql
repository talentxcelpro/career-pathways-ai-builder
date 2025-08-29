-- Create candidate notes table
CREATE TABLE public.candidate_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL,
  employer_id UUID NOT NULL,
  note_content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create candidate tags table
CREATE TABLE public.candidate_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL,
  employer_id UUID NOT NULL,
  tag_name TEXT NOT NULL,
  tag_color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create candidate communications table
CREATE TABLE public.candidate_communications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  communication_type TEXT NOT NULL DEFAULT 'email',
  status TEXT NOT NULL DEFAULT 'sent',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create candidate pipeline stages table
CREATE TABLE public.candidate_pipeline_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL,
  employer_id UUID NOT NULL,
  job_id UUID,
  stage_name TEXT NOT NULL DEFAULT 'Applied',
  stage_order INTEGER DEFAULT 1,
  moved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  moved_by UUID
);

-- Enable RLS
ALTER TABLE public.candidate_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_pipeline_stages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for candidate_notes
CREATE POLICY "Employers can manage their candidate notes"
ON public.candidate_notes
FOR ALL
USING (employer_id = auth.uid());

-- Create RLS policies for candidate_tags
CREATE POLICY "Employers can manage their candidate tags"
ON public.candidate_tags
FOR ALL
USING (employer_id = auth.uid());

-- Create RLS policies for candidate_communications
CREATE POLICY "Users can view their communications"
ON public.candidate_communications
FOR SELECT
USING (sender_id = auth.uid());

CREATE POLICY "Users can create communications"
ON public.candidate_communications
FOR INSERT
WITH CHECK (sender_id = auth.uid());

-- Create RLS policies for candidate_pipeline_stages
CREATE POLICY "Employers can manage candidate pipeline stages"
ON public.candidate_pipeline_stages
FOR ALL
USING (employer_id = auth.uid());

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_candidate_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_candidate_notes_updated_at
BEFORE UPDATE ON public.candidate_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_candidate_notes_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_candidate_notes_candidate_id ON public.candidate_notes(candidate_id);
CREATE INDEX idx_candidate_notes_employer_id ON public.candidate_notes(employer_id);
CREATE INDEX idx_candidate_tags_candidate_id ON public.candidate_tags(candidate_id);
CREATE INDEX idx_candidate_tags_employer_id ON public.candidate_tags(employer_id);
CREATE INDEX idx_candidate_communications_sender_id ON public.candidate_communications(sender_id);
CREATE INDEX idx_candidate_pipeline_stages_candidate_id ON public.candidate_pipeline_stages(candidate_id);
CREATE INDEX idx_candidate_pipeline_stages_employer_id ON public.candidate_pipeline_stages(employer_id);