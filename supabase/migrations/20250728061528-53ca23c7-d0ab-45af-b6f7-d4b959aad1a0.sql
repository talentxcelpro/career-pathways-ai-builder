-- Add sample activity data for the current user
INSERT INTO public.user_activities (
  user_id, 
  activity_type, 
  activity_title, 
  activity_description, 
  metadata, 
  is_public
) VALUES 
(
  '94a6a9f4-e2d4-4098-82c8-9a83af18d506'::uuid,
  'profile_updated',
  'Updated profile information',
  'Enhanced profile with new title and company details',
  '{"fields_updated": ["title", "company"], "changes_count": 2}'::jsonb,
  true
),
(
  '94a6a9f4-e2d4-4098-82c8-9a83af18d506'::uuid,
  'post_created',
  'Created a new post',
  'Shared insights about TalentXcel platform',
  '{"post_type": "announcement", "has_media": false}'::jsonb,
  true
),
(
  '94a6a9f4-e2d4-4098-82c8-9a83af18d506'::uuid,
  'connection_made',
  'Connected with a professional',
  'Expanded professional network',
  '{"connection_type": "professional", "industry": "marketing"}'::jsonb,
  true
) ON CONFLICT DO NOTHING;