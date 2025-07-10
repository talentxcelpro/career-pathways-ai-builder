-- Create function to auto-post jobs to network feed
CREATE OR REPLACE FUNCTION create_job_network_post()
RETURNS TRIGGER AS $$
DECLARE
  company_name TEXT;
  post_content TEXT;
BEGIN
  -- Only create network post for active jobs
  IF NEW.is_active = true AND NEW.status = 'published' THEN
    -- Get company name
    SELECT name INTO company_name
    FROM companies 
    WHERE id = NEW.company_id;
    
    -- Create post content
    post_content := 'We are hiring! ' || NEW.title || ' at ' || COALESCE(company_name, 'our company') || 
                   CASE 
                     WHEN NEW.location IS NOT NULL THEN ' - ' || NEW.location
                     ELSE ''
                   END ||
                   CASE 
                     WHEN NEW.job_type IS NOT NULL THEN ' (' || NEW.job_type || ')'
                     ELSE ''
                   END || '. Join our team and grow your career with us!';
    
    -- Insert into posts table for network feed
    INSERT INTO posts (
      author_id,
      content,
      post_type,
      metadata,
      created_at
    ) VALUES (
      NEW.posted_by,
      post_content,
      'job_posting',
      jsonb_build_object(
        'job_id', NEW.id,
        'company_id', NEW.company_id,
        'job_title', NEW.title,
        'company_name', company_name
      ),
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-post jobs to network
DROP TRIGGER IF EXISTS trigger_create_job_network_post ON jobs;
CREATE TRIGGER trigger_create_job_network_post
  AFTER INSERT OR UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION create_job_network_post();