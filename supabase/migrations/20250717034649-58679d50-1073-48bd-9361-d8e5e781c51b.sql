-- Add foreign key constraints to the tables
ALTER TABLE service_testimonials
ADD CONSTRAINT fk_service_testimonials_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE user_verification_requests
ADD CONSTRAINT fk_user_verification_requests_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- Add profiles foreign key reference (user_id should reference profiles.id instead)
ALTER TABLE service_testimonials DROP CONSTRAINT IF EXISTS fk_service_testimonials_user_id;
ALTER TABLE service_testimonials
ADD CONSTRAINT fk_service_testimonials_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(id);

ALTER TABLE user_verification_requests DROP CONSTRAINT IF EXISTS fk_user_verification_requests_user_id;
ALTER TABLE user_verification_requests
ADD CONSTRAINT fk_user_verification_requests_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(id);