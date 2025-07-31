-- Fix the sync function to use correct post_type
CREATE OR REPLACE FUNCTION sync_bot_wall_to_posts()
RETURNS TABLE(synced_count INTEGER, error_message TEXT) AS $$
DECLARE
    wall_post RECORD;
    sync_count INTEGER := 0;
    error_msg TEXT := NULL;
BEGIN
    -- Loop through all published bot wall posts that aren't already synced
    FOR wall_post IN 
        SELECT bw.*
        FROM bot_wall bw
        WHERE bw.is_draft = false 
        AND bw.published_at IS NOT NULL
        AND NOT EXISTS (
            SELECT 1 FROM posts p 
            WHERE p.origin = 'bot_wall' 
            AND p.created_at = bw.published_at
        )
    LOOP
        BEGIN
            -- Direct insert bypassing RLS since this is a SECURITY DEFINER function
            INSERT INTO public.posts (
                author_id,
                user_id,
                content,
                headline,
                is_public,
                post_type,
                tags,
                status,
                visibility,
                origin,
                created_at,
                updated_at
            ) VALUES (
                wall_post.created_by,
                wall_post.created_by,
                wall_post.content,
                wall_post.title,
                true,
                'text',  -- Use 'text' instead of 'bot_content'
                wall_post.tags,
                'published',
                'public',
                'bot_wall',
                wall_post.published_at,
                wall_post.updated_at
            );
            
            sync_count := sync_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            error_msg := COALESCE(error_msg, '') || 'Error syncing post ' || wall_post.id || ': ' || SQLERRM || '; ';
        END;
    END LOOP;
    
    RETURN QUERY SELECT sync_count, error_msg;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;