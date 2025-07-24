-- Create storage bucket for article images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('article-images', 'article-images', true);

-- Create storage policies for article images
CREATE POLICY "Users can upload article images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'article-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view article images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'article-images');

CREATE POLICY "Users can update their own article images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'article-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own article images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'article-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add featured_image_url column to career_articles table
ALTER TABLE career_articles 
ADD COLUMN featured_image_url TEXT;

-- Add notification system for admin approval
CREATE OR REPLACE FUNCTION notify_admin_article_submission()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify admins when new article is submitted for approval
  IF TG_OP = 'INSERT' AND NEW.is_published = false THEN
    INSERT INTO notifications (user_id, type, title, message, module, related_id, link, priority, icon, is_read, created_at)
    SELECT 
      ur.user_id,
      'article_submission',
      'New Article Submitted for Review',
      'New article "' || NEW.title || '" submitted by ' || NEW.author_name || ' needs approval',
      'admin',
      NEW.id,
      'https://talentxcel.in/admin/home',
      'medium',
      'file-text',
      false,
      now()
    FROM user_roles ur
    WHERE ur.role IN ('super_admin', 'admin')
    AND ur.is_active = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for admin notifications
CREATE TRIGGER trigger_notify_admin_article_submission
  AFTER INSERT ON career_articles
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_article_submission();