-- Seed automation schedules for key bots
INSERT INTO bot_automation_schedule (bot_id, name, frequency_type, frequency_value, posts_per_cycle, time_slots, seo_keywords, is_active, next_execution_at)
SELECT 
  ab.id,
  'Daily Content Generation',
  'daily',
  1,
  8,
  ARRAY['09:00', '12:00', '15:00', '18:00'],
  ARRAY['career growth', 'job search', 'professional development'],
  true,
  now() + interval '1 hour'
FROM ai_bots ab WHERE ab.name IN ('Sana', 'Ishaan', 'Raj', 'Zoya')
ON CONFLICT DO NOTHING;