-- Create resume versions table for job-specific tailoring (only if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'resume_versions') THEN
        CREATE TABLE resume_versions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          resume_id UUID REFERENCES ai_resumes(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          description TEXT,
          target_role TEXT,
          target_company TEXT,
          version_number INTEGER DEFAULT 1,
          content_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
          is_current BOOLEAN DEFAULT false,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        ALTER TABLE resume_versions ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can manage their resume versions" ON resume_versions
          FOR ALL USING (
            resume_id IN (SELECT id FROM ai_resumes WHERE user_id = auth.uid())
          );
          
        CREATE TRIGGER update_resume_versions_updated_at
          BEFORE UPDATE ON resume_versions
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Create resume sections config table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'resume_sections_config') THEN
        CREATE TABLE resume_sections_config (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          resume_id UUID REFERENCES ai_resumes(id) ON DELETE CASCADE,
          section_type TEXT NOT NULL,
          enabled BOOLEAN DEFAULT true,
          order_index INTEGER NOT NULL,
          section_group TEXT NOT NULL,
          settings JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          UNIQUE(resume_id, section_type)
        );
        
        ALTER TABLE resume_sections_config ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can manage their section configs" ON resume_sections_config
          FOR ALL USING (
            resume_id IN (SELECT id FROM ai_resumes WHERE user_id = auth.uid())
          );
          
        CREATE TRIGGER update_resume_sections_config_updated_at
          BEFORE UPDATE ON resume_sections_config
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Create section templates table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'section_templates') THEN
        CREATE TABLE section_templates (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          section_type TEXT NOT NULL,
          industry TEXT,
          experience_level TEXT,
          template_data JSONB NOT NULL DEFAULT '{}'::jsonb,
          usage_count INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_by UUID,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        ALTER TABLE section_templates ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view active templates" ON section_templates
          FOR SELECT USING (is_active = true);

        CREATE POLICY "Users can create their own templates" ON section_templates
          FOR INSERT WITH CHECK (created_by = auth.uid());

        CREATE POLICY "Users can update their own templates" ON section_templates
          FOR UPDATE USING (created_by = auth.uid());
          
        CREATE TRIGGER update_section_templates_updated_at
          BEFORE UPDATE ON section_templates
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Create section analytics table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'section_analytics') THEN
        CREATE TABLE section_analytics (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          resume_id UUID REFERENCES ai_resumes(id) ON DELETE CASCADE,
          section_type TEXT NOT NULL,
          completion_percentage NUMERIC(5,2) DEFAULT 0,
          effectiveness_score NUMERIC(5,2) DEFAULT 0,
          view_count INTEGER DEFAULT 0,
          edit_count INTEGER DEFAULT 0,
          last_edited TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          UNIQUE(resume_id, section_type)
        );
        
        ALTER TABLE section_analytics ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can manage their section analytics" ON section_analytics
          FOR ALL USING (
            resume_id IN (SELECT id FROM ai_resumes WHERE user_id = auth.uid())
          );
          
        CREATE TRIGGER update_section_analytics_updated_at
          BEFORE UPDATE ON section_analytics
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;