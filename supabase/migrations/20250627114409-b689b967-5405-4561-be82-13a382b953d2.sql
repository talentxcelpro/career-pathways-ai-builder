
-- Update default currency values in existing tables
ALTER TABLE public.salary_data ALTER COLUMN salary_currency SET DEFAULT 'INR';
ALTER TABLE public.salary_data ALTER COLUMN currency SET DEFAULT 'INR';
ALTER TABLE public.jobs ALTER COLUMN salary_currency SET DEFAULT 'INR';
ALTER TABLE public.profiles ALTER COLUMN preferred_currency SET DEFAULT 'INR';

-- Update existing records to use INR (approximate conversion rate: 1 USD = 83 INR)
UPDATE public.salary_data 
SET 
  salary_currency = 'INR',
  currency = 'INR',
  salary_range_min = CASE WHEN salary_currency = 'USD' THEN salary_range_min * 83 ELSE salary_range_min END,
  salary_range_max = CASE WHEN salary_currency = 'USD' THEN salary_range_max * 83 ELSE salary_range_max END
WHERE salary_currency = 'USD' OR currency = 'USD';

UPDATE public.jobs 
SET 
  salary_currency = 'INR',
  salary_min = CASE WHEN salary_currency = 'USD' THEN salary_min * 83 ELSE salary_min END,
  salary_max = CASE WHEN salary_currency = 'USD' THEN salary_max * 83 ELSE salary_max END
WHERE salary_currency = 'USD';

UPDATE public.profiles 
SET 
  preferred_currency = 'INR',
  preferred_salary_min = CASE WHEN preferred_currency = 'USD' THEN preferred_salary_min * 83 ELSE preferred_salary_min END,
  preferred_salary_max = CASE WHEN preferred_currency = 'USD' THEN preferred_salary_max * 83 ELSE preferred_salary_max END
WHERE preferred_currency = 'USD';

-- Insert some sample salary data for Indian market
INSERT INTO public.salary_data (job_title, location, salary_range_min, salary_range_max, experience_level, industry, salary_currency, currency, data_source) VALUES
('Software Engineer', 'Bangalore', 600000, 1200000, 'Entry', 'Technology', 'INR', 'INR', 'Market Research'),
('Software Engineer', 'Mumbai', 700000, 1400000, 'Mid', 'Technology', 'INR', 'INR', 'Market Research'),
('Software Engineer', 'Delhi', 800000, 1600000, 'Senior', 'Technology', 'INR', 'INR', 'Market Research'),
('Product Manager', 'Bangalore', 1200000, 2500000, 'Mid', 'Technology', 'INR', 'INR', 'Market Research'),
('Product Manager', 'Mumbai', 1400000, 2800000, 'Senior', 'Technology', 'INR', 'INR', 'Market Research'),
('Data Scientist', 'Bangalore', 800000, 1800000, 'Mid', 'Technology', 'INR', 'INR', 'Market Research'),
('UX Designer', 'Bangalore', 600000, 1400000, 'Mid', 'Design', 'INR', 'INR', 'Market Research'),
('Frontend Developer', 'Pune', 500000, 1100000, 'Entry', 'Technology', 'INR', 'INR', 'Market Research');
