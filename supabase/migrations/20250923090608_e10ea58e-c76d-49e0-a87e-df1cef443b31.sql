-- Update course lessons with proper educational YouTube video URLs
UPDATE public.course_lessons 
SET video_url = CASE 
  WHEN id = '2018be29-271c-44db-9efe-45f9f822f6a1' THEN 'https://www.youtube.com/embed/VqcY22c_eqs'
  WHEN id = '44444444-4444-4444-4444-444444444444' THEN 'https://www.youtube.com/embed/UB1O30fR-EE'
  WHEN id = '55555555-5555-5555-5555-555555555555' THEN 'https://www.youtube.com/embed/qz0aGYrrlhU'
  WHEN id = '66666666-6666-6666-6666-666666666666' THEN 'https://www.youtube.com/embed/1PnVor36_40'
  WHEN id = '77777777-7777-7777-7777-777777777777' THEN 'https://www.youtube.com/embed/hdI2bqOjy3c'
  WHEN id = '88888888-8888-8888-8888-888888888888' THEN 'https://www.youtube.com/embed/TlB_eWDSMt4'
END
WHERE id IN (
  '2018be29-271c-44db-9efe-45f9f822f6a1',
  '44444444-4444-4444-4444-444444444444', 
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777',
  '88888888-8888-8888-8888-888888888888'
);