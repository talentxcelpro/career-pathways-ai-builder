-- Update all courses to have TalentXcel Academy as instructor
UPDATE courses 
SET instructor_name = 'TalentXcel Academy'
WHERE instructor_name IS NULL OR instructor_name != 'TalentXcel Academy';

-- Also update the instructor field for backward compatibility
UPDATE courses 
SET instructor = 'TalentXcel Academy'
WHERE instructor IS NULL OR instructor != 'TalentXcel Academy';