-- Add all missing columns that are commonly referenced
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS student_population INTEGER;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS acceptance_rate NUMERIC(5,2);
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS graduation_rate NUMERIC(5,2);
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS tuition_in_state INTEGER;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS tuition_out_state INTEGER;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS average_gpa NUMERIC(3,2);
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS sat_range_low INTEGER;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS sat_range_high INTEGER;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS act_range_low INTEGER;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS act_range_high INTEGER;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS application_deadline DATE;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS ranking_national INTEGER;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS ranking_regional INTEGER;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS programs_offered TEXT[];

-- Insert 30 additional prestigious colleges
INSERT INTO colleges (name, slug, college_type, city, state, student_population, acceptance_rate, graduation_rate, tuition_out_state, ranking_national, is_active) VALUES
('University of Chicago', 'university-of-chicago', 'Private Research University', 'Chicago', 'IL', 17000, 7.2, 95.0, 59298, 6, true),
('Northwestern University', 'northwestern-university', 'Private Research University', 'Evanston', 'IL', 22000, 9.1, 97.0, 58701, 9, true),
('Duke University', 'duke-university', 'Private Research University', 'Durham', 'NC', 16000, 8.2, 96.0, 58031, 10, true),
('Dartmouth College', 'dartmouth-college', 'Private Liberal Arts College', 'Hanover', 'NH', 6500, 8.8, 95.0, 57638, 12, true),
('Vanderbilt University', 'vanderbilt-university', 'Private Research University', 'Nashville', 'TN', 13500, 11.2, 93.0, 52070, 14, true),
('University of Virginia', 'university-of-virginia', 'Public Research University', 'Charlottesville', 'VA', 25000, 26.0, 95.0, 51940, 25, true),
('University of North Carolina at Chapel Hill', 'unc-chapel-hill', 'Public Research University', 'Chapel Hill', 'NC', 30000, 22.6, 91.0, 36000, 28, true),
('University of Wisconsin-Madison', 'uw-madison', 'Public Research University', 'Madison', 'WI', 48000, 53.9, 87.0, 38630, 35, true),
('University of Washington', 'university-of-washington', 'Public Research University', 'Seattle', 'WA', 47000, 52.9, 84.0, 39906, 40, true),
('Williams College', 'williams-college', 'Private Liberal Arts College', 'Williamstown', 'MA', 2000, 13.2, 95.0, 59550, 1, true),
('Amherst College', 'amherst-college', 'Private Liberal Arts College', 'Amherst', 'MA', 1800, 11.1, 95.0, 58640, 2, true),
('Swarthmore College', 'swarthmore-college', 'Private Liberal Arts College', 'Swarthmore', 'PA', 1650, 8.7, 94.0, 56500, 3, true),
('California Institute of Technology', 'caltech', 'Private Research University', 'Pasadena', 'CA', 2200, 6.4, 92.0, 58680, 9, true),
('Carnegie Mellon University', 'carnegie-mellon', 'Private Research University', 'Pittsburgh', 'PA', 14500, 17.3, 89.0, 58924, 26, true),
('Emory University', 'emory-university', 'Private Research University', 'Atlanta', 'GA', 14500, 16.2, 91.0, 53868, 21, true),
('Wake Forest University', 'wake-forest', 'Private Research University', 'Winston-Salem', 'NC', 8500, 28.1, 89.0, 56420, 27, true),
('Tulane University', 'tulane-university', 'Private Research University', 'New Orleans', 'LA', 13500, 11.5, 84.0, 58090, 42, true),
('University of Georgia', 'university-of-georgia', 'Public Research University', 'Athens', 'GA', 38000, 45.5, 85.0, 31120, 47, true),
('University of Florida', 'university-of-florida', 'Public Research University', 'Gainesville', 'FL', 52000, 31.1, 88.0, 28658, 29, true),
('Ohio State University', 'ohio-state-university', 'Public Research University', 'Columbus', 'OH', 65000, 54.0, 84.0, 32061, 53, true),
('University of Illinois at Urbana-Champaign', 'uiuc', 'Public Research University', 'Champaign', 'IL', 50000, 59.7, 85.0, 33686, 41, true),
('University of Texas at Austin', 'ut-austin', 'Public Research University', 'Austin', 'TX', 51000, 31.8, 81.0, 40032, 38, true),
('Reed College', 'reed-college', 'Private Liberal Arts College', 'Portland', 'OR', 1500, 30.8, 78.0, 61284, 90, true),
('Middlebury College', 'middlebury-college', 'Private Liberal Arts College', 'Middlebury', 'VT', 2500, 17.0, 94.0, 58792, 7, true),
('Bowdoin College', 'bowdoin-college', 'Private Liberal Arts College', 'Brunswick', 'ME', 1800, 10.9, 95.0, 56350, 5, true),
('Colby College', 'colby-college', 'Private Liberal Arts College', 'Waterville', 'ME', 2000, 12.2, 87.0, 58595, 17, true),
('Grinnell College', 'grinnell-college', 'Private Liberal Arts College', 'Grinnell', 'IA', 1700, 20.5, 86.0, 56216, 19, true),
('Pomona College', 'pomona-college', 'Private Liberal Arts College', 'Claremont', 'CA', 1700, 7.2, 97.0, 54380, 4, true),
('Wellesley College', 'wellesley-college', 'Private Liberal Arts College', 'Wellesley', 'MA', 2500, 19.6, 92.0, 56052, 8, true),
('Carleton College', 'carleton-college', 'Private Liberal Arts College', 'Northfield', 'MN', 2100, 20.7, 93.0, 56685, 11, true);