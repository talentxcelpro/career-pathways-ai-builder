-- Add all missing columns first
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS founded_year INTEGER;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS zip_code TEXT;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'USA';
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS accreditation TEXT;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS campus_size INTEGER;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS student_faculty_ratio INTEGER;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS retention_rate NUMERIC(5,2);
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS employment_rate NUMERIC(5,2);
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS average_salary INTEGER;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS research_funding BIGINT;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS endowment BIGINT;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS diversity_index NUMERIC(3,1);
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS sustainability_rating TEXT;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS safety_rating NUMERIC(3,1);
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS sports_division TEXT;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS notable_alumni TEXT[];
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS campus_housing BOOLEAN DEFAULT true;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS online_programs BOOLEAN DEFAULT false;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS international_students NUMERIC(5,2);
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS financial_aid_percentage INTEGER;

-- Insert prestigious universities (Part 1 of 3)
INSERT INTO colleges (
  name, slug, college_type, address, city, state, zip_code, country, phone, website, email, 
  description, founded_year, accreditation, student_population, acceptance_rate, graduation_rate, 
  tuition_out_state, average_gpa, sat_range_low, sat_range_high, act_range_low, act_range_high, 
  application_deadline, ranking_national, programs_offered, campus_size, student_faculty_ratio,
  retention_rate, employment_rate, average_salary, research_funding, endowment, diversity_index, 
  sustainability_rating, safety_rating, sports_division, notable_alumni, campus_housing, 
  online_programs, international_students, financial_aid_percentage, is_active
) VALUES
('University of Chicago', 'university-of-chicago', 'Private Research University', '5801 S Ellis Ave', 'Chicago', 'IL', '60637', 'USA', '(773) 702-1234', 'https://www.uchicago.edu', 'admissions@uchicago.edu', 'A prestigious private research university known for economics and liberal arts.', 1890, 'Higher Learning Commission', 17000, 7.2, 95.0, 59298, 4.0, 1470, 1570, 33, 35, '2024-01-02', 6, ARRAY['Economics', 'Political Science', 'Physics', 'Mathematics'], 217, 5, 99.0, 94.0, 85000, 850000000, 8200000000, 8.5, 'A-', 9.2, 'NCAA Division III', ARRAY['Barack Obama', 'Milton Friedman'], true, false, 18, 85, true),

('Northwestern University', 'northwestern-university', 'Private Research University', '633 Clark St', 'Evanston', 'IL', '60208', 'USA', '(847) 491-3741', 'https://www.northwestern.edu', 'ugadmission@northwestern.edu', 'A highly selective private research university with strong programs in journalism and business.', 1851, 'Higher Learning Commission', 22000, 9.1, 97.0, 58701, 4.0, 1450, 1560, 33, 35, '2024-01-01', 9, ARRAY['Journalism', 'Business', 'Engineering', 'Medicine'], 240, 6, 98.0, 95.0, 87000, 920000000, 14100000000, 8.7, 'A', 9.5, 'NCAA Division I', ARRAY['Stephen Colbert', 'George McGovern'], true, true, 16, 88, true),

('Duke University', 'duke-university', 'Private Research University', '2138 Campus Dr', 'Durham', 'NC', '27708', 'USA', '(919) 684-3214', 'https://www.duke.edu', 'askduke@duke.edu', 'Elite private research university with renowned medical and law schools.', 1838, 'Southern Association of Colleges and Schools', 16000, 8.2, 96.0, 58031, 4.0, 1470, 1570, 33, 35, '2024-01-02', 10, ARRAY['Medicine', 'Law', 'Business', 'Engineering'], 8709, 6, 98.0, 96.0, 86000, 780000000, 12400000000, 8.6, 'A', 9.4, 'NCAA Division I', ARRAY['Melinda Gates', 'Richard Nixon'], true, true, 15, 87, true),

('Dartmouth College', 'dartmouth-college', 'Private Liberal Arts College', '1 Rope Ferry Rd', 'Hanover', 'NH', '03755', 'USA', '(603) 646-2875', 'https://www.dartmouth.edu', 'admissions.office@dartmouth.edu', 'Ivy League liberal arts college known for outdoor programs and strong alumni network.', 1769, 'New England Commission of Higher Education', 6500, 8.8, 95.0, 57638, 4.0, 1440, 1560, 32, 35, '2024-01-01', 12, ARRAY['Liberal Arts', 'Business', 'Engineering', 'Medicine'], 269, 7, 98.0, 95.0, 84000, 420000000, 7900000000, 8.4, 'A-', 9.3, 'NCAA Division I', ARRAY['Timothy Geithner', 'Mindy Kaling'], true, false, 13, 86, true),

('Vanderbilt University', 'vanderbilt-university', 'Private Research University', '2201 West End Ave', 'Nashville', 'TN', '37235', 'USA', '(615) 322-2561', 'https://www.vanderbilt.edu', 'admissions@vanderbilt.edu', 'Private research university known for music, medicine, and strong academic programs.', 1873, 'Southern Association of Colleges and Schools', 13500, 11.2, 93.0, 52070, 3.9, 1430, 1560, 32, 35, '2024-01-01', 14, ARRAY['Music', 'Medicine', 'Education', 'Engineering'], 333, 7, 97.0, 93.0, 82000, 540000000, 6900000000, 8.2, 'A', 9.1, 'NCAA Division I', ARRAY['Al Gore', 'Amy Grant'], true, true, 12, 84, true),

('University of Virginia', 'university-of-virginia', 'Public Research University', '1827 University Ave', 'Charlottesville', 'VA', '22904', 'USA', '(434) 982-3200', 'https://www.virginia.edu', 'undergradadmission@virginia.edu', 'Historic public research university founded by Thomas Jefferson.', 1819, 'Southern Association of Colleges and Schools', 25000, 26.0, 95.0, 51940, 4.0, 1370, 1520, 31, 34, '2024-01-15', 25, ARRAY['Business', 'Law', 'Medicine', 'Engineering'], 1682, 15, 97.0, 93.0, 75000, 380000000, 13400000000, 7.8, 'A', 8.9, 'NCAA Division I', ARRAY['Edgar Allan Poe', 'Tina Fey'], true, true, 11, 82, true),

('University of North Carolina at Chapel Hill', 'unc-chapel-hill', 'Public Research University', '103 South Bldg', 'Chapel Hill', 'NC', '27599', 'USA', '(919) 966-3621', 'https://www.unc.edu', 'unchelp@admissions.unc.edu', 'Premier public research university with strong programs across all disciplines.', 1789, 'Southern Association of Colleges and Schools', 30000, 22.6, 91.0, 36000, 4.0, 1330, 1500, 29, 33, '2024-01-15', 28, ARRAY['Journalism', 'Business', 'Public Health', 'Medicine'], 729, 13, 96.0, 91.0, 73000, 420000000, 4200000000, 7.6, 'A-', 8.7, 'NCAA Division I', ARRAY['Michael Jordan', 'Andy Griffith'], true, true, 9, 79, true),

('University of Wisconsin-Madison', 'uw-madison', 'Public Research University', '500 Lincoln Dr', 'Madison', 'WI', '53706', 'USA', '(608) 262-3961', 'https://www.wisc.edu', 'onwisconsin@admissions.wisc.edu', 'Top-tier public research university known for research and school spirit.', 1848, 'Higher Learning Commission', 48000, 53.9, 87.0, 38630, 3.8, 1370, 1520, 28, 32, '2024-02-01', 35, ARRAY['Engineering', 'Business', 'Agriculture', 'Medicine'], 936, 17, 95.0, 87.0, 68000, 1200000000, 3400000000, 7.2, 'A', 8.5, 'NCAA Division I', ARRAY['Frank Lloyd Wright', 'Joan Cusack'], true, true, 8, 76, true),

('University of Washington', 'university-of-washington', 'Public Research University', '1410 NE Campus Pkwy', 'Seattle', 'WA', '98195', 'USA', '(206) 543-9686', 'https://www.washington.edu', 'askuwadm@uw.edu', 'Leading public research university with strong STEM programs and beautiful campus.', 1861, 'Northwest Commission on Colleges and Universities', 47000, 52.9, 84.0, 39906, 3.8, 1220, 1470, 27, 33, '2024-11-15', 40, ARRAY['Computer Science', 'Medicine', 'Engineering', 'Business'], 703, 19, 94.0, 85.0, 71000, 1800000000, 7400000000, 7.4, 'A-', 8.6, 'NCAA Division I', ARRAY['Bill Gates Sr.', 'Kenny G'], true, true, 15, 78, true),

('Williams College', 'williams-college', 'Private Liberal Arts College', '880 Main St', 'Williamstown', 'MA', '01267', 'USA', '(413) 597-2211', 'https://www.williams.edu', 'admission@williams.edu', 'Elite liberal arts college known for small classes and outdoor recreation.', 1793, 'New England Commission of Higher Education', 2000, 13.2, 95.0, 59550, 4.0, 1430, 1560, 32, 35, '2024-01-01', 1, ARRAY['Liberal Arts', 'Economics', 'Art History', 'Psychology'], 450, 7, 99.0, 95.0, 78000, 45000000, 3000000000, 8.3, 'A', 9.2, 'NCAA Division III', ARRAY['James Garfield', 'Erin Burnett'], true, false, 8, 85, true);