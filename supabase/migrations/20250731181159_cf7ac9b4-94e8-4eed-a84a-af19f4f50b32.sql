-- Create a function to sync existing bot wall posts to the network feed
CREATE OR REPLACE FUNCTION sync_bot_wall_to_posts()
RETURNS TABLE(synced_count INTEGER, error_message TEXT) AS $$
DECLARE
    wall_post RECORD;
    sync_count INTEGER := 0;
    error_msg TEXT := NULL;
BEGIN
    -- Loop through all published bot wall posts that aren't already synced
    FOR wall_post IN 
        SELECT bw.*, ab.user_id as bot_user_id
        FROM bot_wall bw
        LEFT JOIN ai_bots ab ON bw.bot_id = ab.id
        WHERE bw.is_draft = false 
        AND bw.published_at IS NOT NULL
        AND NOT EXISTS (
            SELECT 1 FROM posts p 
            WHERE p.origin = 'bot_wall' 
            AND p.created_at = bw.published_at
        )
    LOOP
        BEGIN
            -- Insert each wall post into the posts table
            INSERT INTO posts (
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
                'bot_content',
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
$$ LANGUAGE plpgsql;