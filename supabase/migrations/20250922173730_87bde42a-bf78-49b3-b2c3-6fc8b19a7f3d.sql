-- Update all courses to be provided by TalentXcel Academy
UPDATE courses 
SET instructor_name = 'TalentXcel Academy'
WHERE instructor_name IS NULL OR instructor_name != 'TalentXcel Academy';

-- Also update any instructor field if it exists
UPDATE courses 
SET instructor = 'TalentXcel Academy'
WHERE instructor IS NULL OR instructor != 'TalentXcel Academy';