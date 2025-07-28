-- Add sample activities for current user and the profile being viewed
INSERT INTO public.user_activities (user_id, activity_type, activity_title, activity_description, metadata, is_public, created_at) 
VALUES 
  -- Activities for vishwajeetnayak (current user)
  ('e19b30cf-2fe5-4cbf-85f0-9e76c4182eb0', 'profile_updated', 'Updated profile information', 'Made updates to profile details', '{"section": "basic_info"}', true, now() - interval '2 hours'),
  ('e19b30cf-2fe5-4cbf-85f0-9e76c4182eb0', 'connection_made', 'Connected with a new professional', 'Successfully connected with Raj Mishra', '{"connected_with": "raj_mishra"}', true, now() - interval '1 day'),
  ('e19b30cf-2fe5-4cbf-85f0-9e76c4182eb0', 'skill_added', 'Added new skills', 'Added React, Node.js, and TypeScript to skill set', '{"skills": ["React", "Node.js", "TypeScript"]}', true, now() - interval '3 days'),
  
  -- Activities for rajmishra profile  
  ('d4e2a3b1-9f8e-4c7d-a5b6-123456789012', 'profile_updated', 'Updated professional headline', 'Updated headline to reflect new role', '{"section": "headline"}', true, now() - interval '1 hour'),
  ('d4e2a3b1-9f8e-4c7d-a5b6-123456789012', 'connection_made', 'Connected with new professionals', 'Expanded professional network', '{"connections_count": 5}', true, now() - interval '2 days'),
  ('d4e2a3b1-9f8e-4c7d-a5b6-123456789012', 'post_created', 'Shared insights on industry trends', 'Posted about latest developments in tech industry', '{"post_type": "insight", "engagement": 15}', true, now() - interval '5 days')

ON CONFLICT (id) DO NOTHING;