-- Update post-media bucket to support video files with 50MB limit
UPDATE storage.buckets 
SET 
  file_size_limit = 52428800, -- 50MB in bytes
  allowed_mime_types = ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'video/mp4', 'video/webm', 'video/mov', 'video/avi',
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
WHERE id = 'post-media';

-- Update media bucket to support video files with 50MB limit
UPDATE storage.buckets 
SET 
  file_size_limit = 52428800, -- 50MB in bytes
  allowed_mime_types = ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'video/mp4', 'video/webm', 'video/mov', 'video/avi'
  ]
WHERE id = 'media';

-- Ensure raw_videos bucket has proper limits for video processing
UPDATE storage.buckets 
SET 
  file_size_limit = 52428800, -- 50MB in bytes
  allowed_mime_types = ARRAY[
    'video/mp4', 'video/webm', 'video/mov', 'video/avi', 'video/quicktime'
  ]
WHERE id = 'raw_videos';