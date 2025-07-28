-- First, let me fix the update_article_stats function to handle the missing count_words function
CREATE OR REPLACE FUNCTION public.count_words(content_text text)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO ''
AS $$
BEGIN
  IF content_text IS NULL OR TRIM(content_text) = '' THEN
    RETURN 0;
  END IF;
  RETURN array_length(string_to_array(TRIM(content_text), ' '), 1);
END;
$$;

-- Update the article stats function to not fail if fields don't exist
CREATE OR REPLACE FUNCTION public.update_article_stats()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO ''
AS $$
BEGIN
  IF NEW.post_type = 'article' THEN
    -- Only update if columns exist
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'posts' AND column_name = 'word_count') THEN
      NEW.word_count := count_words(NEW.content);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'posts' AND column_name = 'reading_time') THEN
      NEW.reading_time := calculate_reading_time(NEW.content);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;