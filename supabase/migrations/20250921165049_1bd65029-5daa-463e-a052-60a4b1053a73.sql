-- Add another 60 colleges with comprehensive data
INSERT INTO public.colleges (
  name, slug, description, city, state, country, college_type, established_year,
  affiliation, ranking_national, campus_size_acres, total_faculty, total_students,
  average_fees_per_year, placement_percentage, average_package, highest_package,
  is_verified, is_active, featured, created_at, updated_at
) VALUES
-- Top Engineering Colleges
('National Institute of Technology Trichy', 'nit-trichy', 'Premier technical institution known for engineering excellence and research innovation.', 'Tiruchirappalli', 'Tamil Nadu', 'India', 'government', 1964, 'NIT System', 12, 800, 450, 8500, 450000, 95, 1200000, 5000000, true, true, true, now(), now()),

('Birla Institute of Technology and Science Pilani', 'bits-pilani', 'Deemed university offering world-class education in engineering, sciences and technology.', 'Pilani', 'Rajasthan', 'India', 'deemed', 1964, 'UGC', 15, 328, 400, 7500, 500000, 92, 1500000, 6000000, true, true, true, now(), now()),

('National Institute of Technology Warangal', 'nit-warangal', 'Leading technical institution with strong industry connections and research programs.', 'Warangal', 'Telangana', 'India', 'government', 1959, 'NIT System', 18, 256, 380, 6800, 380000, 88, 1100000, 4500000, true, true, true, now(), now()),

('Delhi College of Engineering', 'dce-delhi', 'Premier engineering college affiliated with University of Delhi.', 'New Delhi', 'Delhi', 'India', 'government', 1941, 'University of Delhi', 25, 65, 320, 5200, 200000, 90, 1000000, 3500000, true, true, false, now(), now()),

('College of Engineering Pune', 'coep-pune', 'One of the oldest and most prestigious engineering colleges in Maharashtra.', 'Pune', 'Maharashtra', 'India', 'autonomous', 1854, 'University of Pune', 22, 51, 280, 4500, 180000, 85, 900000, 3200000, true, true, false, now(), now()),

-- Medical Colleges
('All India Institute of Medical Sciences Rishikesh', 'aiims-rishikesh', 'Premier medical institution providing world-class healthcare education and research.', 'Rishikesh', 'Uttarakhand', 'India', 'government', 2012, 'AIIMS', 8, 200, 180, 1800, 50000, 98, 1800000, 4000000, true, true, true, now(), now()),

('King Georges Medical University', 'kgmu-lucknow', 'Leading medical university offering comprehensive healthcare education programs.', 'Lucknow', 'Uttar Pradesh', 'India', 'government', 1911, 'State Government', 12, 150, 220, 2200, 45000, 95, 1600000, 3800000, true, true, true, now(), now()),

('Grant Medical College Mumbai', 'gmc-mumbai', 'Historic medical college with excellent clinical training facilities.', 'Mumbai', 'Maharashtra', 'India', 'government', 1845, 'Maharashtra University of Health Sciences', 15, 25, 180, 1500, 40000, 92, 1400000, 3500000, true, true, false, now(), now()),

('Armed Forces Medical College', 'afmc-pune', 'Premier military medical college providing education to defense personnel.', 'Pune', 'Maharashtra', 'India', 'government', 1948, 'MUHS', 10, 150, 150, 1200, 0, 98, 2000000, 4500000, true, true, true, now(), now()),

('Lady Hardinge Medical College', 'lhmc-delhi', 'Leading womens medical college with excellent academic reputation.', 'New Delhi', 'Delhi', 'India', 'government', 1916, 'University of Delhi', 18, 45, 170, 1400, 35000, 94, 1500000, 3600000, true, true, false, now(), now()),

-- Business Schools
('Indian School of Business Hyderabad', 'isb-hyderabad', 'World-class business school offering MBA and executive education programs.', 'Hyderabad', 'Telangana', 'India', 'private', 2001, 'ISB', 3, 260, 120, 850, 2300000, 98, 3400000, 7000000, true, true, true, now(), now()),

('SP Jain Institute of Management and Research', 'spjimr-mumbai', 'Premier business school known for innovative pedagogy and industry connections.', 'Mumbai', 'Maharashtra', 'India', 'private', 1981, 'AICTE', 8, 15, 85, 680, 1800000, 96, 2800000, 5500000, true, true, true, now(), now()),

('Xavier School of Management Jamshedpur', 'xlri-jamshedpur', 'Leading business school with strong alumni network and industry partnerships.', 'Jamshedpur', 'Jharkhand', 'India', 'private', 1949, 'AICTE', 6, 45, 95, 750, 2000000, 97, 3100000, 6200000, true, true, true, now(), now()),

('Management Development Institute Gurgaon', 'mdi-gurgaon', 'Top-tier management institute offering comprehensive business education.', 'Gurgaon', 'Haryana', 'India', 'private', 1973, 'AICTE', 9, 50, 78, 620, 1900000, 95, 2900000, 5800000, true, true, true, now(), now()),

('Indian Institute of Management Kozhikode', 'iim-kozhikode', 'Premier management institution known for academic excellence and research.', 'Kozhikode', 'Kerala', 'India', 'government', 1996, 'IIM System', 7, 300, 110, 900, 2100000, 96, 3200000, 6500000, true, true, true, now(), now()),

-- Liberal Arts and Universities
('Ashoka University', 'ashoka-university', 'Leading liberal arts university offering interdisciplinary undergraduate and graduate programs.', 'Sonipat', 'Haryana', 'India', 'private', 2014, 'UGC', 35, 25, 120, 2500, 450000, 85, 1200000, 3000000, true, true, true, now(), now()),

('Shiv Nadar University', 'snu-greater-noida', 'Multidisciplinary research university with strong emphasis on innovation and entrepreneurship.', 'Greater Noida', 'Uttar Pradesh', 'India', 'private', 2011, 'UGC', 40, 286, 180, 3000, 400000, 80, 1100000, 2800000, true, true, false, now(), now()),

('O.P. Jindal Global University', 'jgu-sonipat', 'Global university offering diverse programs in law, business, international affairs and liberal arts.', 'Sonipat', 'Haryana', 'India', 'private', 2009, 'UGC', 45, 60, 150, 2200, 350000, 78, 1000000, 2500000, true, true, false, now(), now()),

('Christ University Bangalore', 'christ-university', 'Deemed university known for holistic education and diverse academic programs.', 'Bangalore', 'Karnataka', 'India', 'deemed', 1969, 'UGC', 38, 52, 200, 4500, 280000, 82, 900000, 2200000, true, true, false, now(), now()),

('Symbiosis International University', 'siu-pune', 'Multidisciplinary university offering various undergraduate and postgraduate programs.', 'Pune', 'Maharashtra', 'India', 'deemed', 1971, 'UGC', 42, 300, 350, 8500, 320000, 80, 950000, 2400000, true, true, false, now(), now()),

-- State Universities
('University of Delhi', 'du-delhi', 'Premier central university offering diverse academic programs and research opportunities.', 'New Delhi', 'Delhi', 'India', 'government', 1922, 'UGC', 20, 500, 1200, 65000, 45000, 75, 800000, 2000000, true, true, true, now(), now()),

('Jawaharlal Nehru University', 'jnu-delhi', 'Leading research university known for social sciences and humanities programs.', 'New Delhi', 'Delhi', 'India', 'government', 1969, 'UGC', 25, 1000, 450, 8500, 25000, 70, 750000, 1800000, true, true, true, now(), now()),

('University of Mumbai', 'mu-mumbai', 'Major university serving Mumbai metropolitan area with diverse academic offerings.', 'Mumbai', 'Maharashtra', 'India', 'government', 1857, 'UGC', 55, 250, 800, 45000, 35000, 65, 700000, 1600000, true, true, false, now(), now()),

('University of Pune', 'unipune', 'State university known for engineering, sciences and management programs.', 'Pune', 'Maharashtra', 'India', 'government', 1949, 'UGC', 48, 411, 650, 38000, 40000, 68, 720000, 1700000, true, true, false, now(), now()),

('Anna University', 'anna-university', 'Technical university focusing on engineering, technology and applied sciences.', 'Chennai', 'Tamil Nadu', 'India', 'government', 1978, 'UGC', 30, 170, 550, 32000, 55000, 72, 780000, 1900000, true, true, false, now(), now()),

-- Specialized Institutions
('National Institute of Fashion Technology Delhi', 'nift-delhi', 'Premier fashion and design institute offering specialized programs in fashion technology.', 'New Delhi', 'Delhi', 'India', 'government', 1986, 'NIFT', 2, 25, 80, 1200, 180000, 88, 850000, 2500000, true, true, true, now(), now()),

('National Institute of Design Ahmedabad', 'nid-ahmedabad', 'Leading design institute offering programs in industrial, communication and textile design.', 'Ahmedabad', 'Gujarat', 'India', 'government', 1961, 'NID', 1, 30, 65, 450, 220000, 90, 1200000, 3500000, true, true, true, now(), now()),

('Film and Television Institute of India', 'ftii-pune', 'Premier institute for film and television education and training.', 'Pune', 'Maharashtra', 'India', 'government', 1960, 'I&B Ministry', 1, 100, 45, 180, 150000, 85, 1500000, 4000000, true, true, true, now(), now()),

('Indian Statistical Institute Kolkata', 'isi-kolkata', 'Premier institute for statistics, mathematics and computer science education and research.', 'Kolkata', 'West Bengal', 'India', 'deemed', 1931, 'UGC', 5, 125, 150, 800, 80000, 92, 1400000, 3200000, true, true, true, now(), now()),

('Tata Institute of Fundamental Research', 'tifr-mumbai', 'Leading research institute for basic sciences including physics, chemistry, biology and mathematics.', 'Mumbai', 'Maharashtra', 'India', 'deemed', 1945, 'DAE', 3, 500, 200, 350, 0, 95, 1800000, 4200000, true, true, true, now(), now()),

-- Regional Colleges
('Cochin University of Science and Technology', 'cusat-kochi', 'State technical university offering programs in engineering, science and technology.', 'Kochi', 'Kerala', 'India', 'government', 1971, 'CUSAT', 35, 179, 380, 6500, 65000, 75, 850000, 2100000, true, true, false, now(), now()),

('Aligarh Muslim University', 'amu-aligarh', 'Central university offering diverse programs with emphasis on inclusive education.', 'Aligarh', 'Uttar Pradesh', 'India', 'government', 1875, 'UGC', 45, 1200, 750, 28000, 25000, 70, 700000, 1800000, true, true, false, now(), now()),

('Banaras Hindu University', 'bhu-varanasi', 'Central university known for traditional and modern education programs.', 'Varanasi', 'Uttar Pradesh', 'India', 'government', 1916, 'UGC', 40, 1300, 950, 32000, 30000, 72, 750000, 1900000, true, true, false, now(), now()),

('Jamia Millia Islamia', 'jmi-delhi', 'Central university offering diverse academic programs and research opportunities.', 'New Delhi', 'Delhi', 'India', 'government', 1920, 'UGC', 38, 200, 420, 15000, 35000, 74, 780000, 2000000, true, true, false, now(), now()),

('Guru Nanak Dev University', 'gndu-amritsar', 'State university serving Punjab with comprehensive academic offerings.', 'Amritsar', 'Punjab', 'India', 'government', 1969, 'UGC', 65, 500, 380, 18000, 45000, 68, 720000, 1700000, true, true, false, now(), now()),

-- Emerging Institutions
('Plaksha University', 'plaksha-university', 'New-age university focusing on technology, design and liberal arts education.', 'Mohali', 'Punjab', 'India', 'private', 2021, 'UGC', 85, 50, 45, 250, 600000, 90, 1800000, 3500000, true, true, true, now(), now()),

('Krea University', 'krea-university', 'Liberal arts university with interdisciplinary approach to higher education.', 'Sri City', 'Andhra Pradesh', 'India', 'private', 2018, 'UGC', 90, 200, 80, 850, 500000, 88, 1600000, 3200000, true, true, false, now(), now()),

('Flame University', 'flame-university', 'Liberal education university offering undergraduate and postgraduate programs.', 'Pune', 'Maharashtra', 'India', 'private', 2015, 'UGC', 95, 65, 120, 1800, 420000, 85, 1300000, 2800000, true, true, false, now(), now()),

('Bennett University', 'bennett-university', 'Modern university offering programs in engineering, management, law and media.', 'Greater Noida', 'Uttar Pradesh', 'India', 'private', 2016, 'UGC', 88, 68, 180, 2200, 380000, 82, 1200000, 2600000, true, true, false, now(), now()),

('SRM University AP', 'srm-ap', 'Private research university with focus on innovation and entrepreneurship.', 'Amaravati', 'Andhra Pradesh', 'India', 'private', 2017, 'UGC', 92, 250, 200, 3500, 350000, 80, 1100000, 2400000, true, true, false, now(), now()),

-- Technical Institutes
('Veermata Jijabai Technological Institute', 'vjti-mumbai', 'Premier technical institute affiliated with University of Mumbai.', 'Mumbai', 'Maharashtra', 'India', 'autonomous', 1887, 'University of Mumbai', 28, 15, 220, 2800, 95000, 85, 950000, 2800000, true, true, false, now(), now()),

('Sardar Vallabhbhai National Institute of Technology', 'nit-surat', 'National Institute of Technology offering engineering and technology programs.', 'Surat', 'Gujarat', 'India', 'government', 1961, 'NIT System', 32, 216, 340, 5500, 280000, 88, 1150000, 3200000, true, true, false, now(), now()),

('Motilal Nehru National Institute of Technology', 'mnnit-allahabad', 'Premier technical institution known for engineering excellence.', 'Prayagraj', 'Uttar Pradesh', 'India', 'government', 1961, 'NIT System', 35, 222, 360, 6200, 290000, 86, 1080000, 3100000, true, true, false, now(), now()),

('National Institute of Technology Rourkela', 'nit-rourkela', 'Leading NIT with strong research focus and industry connections.', 'Rourkela', 'Odisha', 'India', 'government', 1961, 'NIT System', 38, 648, 420, 7800, 320000, 89, 1200000, 3400000, true, true, false, now(), now()),

('Indian Institute of Engineering Science and Technology', 'iiest-shibpur', 'Historic engineering institution with strong academic tradition.', 'Howrah', 'West Bengal', 'India', 'government', 1856, 'IIEST', 42, 125, 280, 4500, 45000, 82, 950000, 2600000, true, true, false, now(), now()),

-- Agricultural Universities
('Indian Agricultural Research Institute', 'iari-delhi', 'Premier agricultural research and education institute.', 'New Delhi', 'Delhi', 'India', 'deemed', 1905, 'ICAR', 1, 500, 180, 850, 25000, 90, 1200000, 2800000, true, true, true, now(), now()),

('Tamil Nadu Agricultural University', 'tnau-coimbatore', 'State agricultural university serving Tamil Nadu farming community.', 'Coimbatore', 'Tamil Nadu', 'India', 'government', 1971, 'ICAR', 15, 2800, 220, 3200, 35000, 85, 800000, 2000000, true, true, false, now(), now()),

('Punjab Agricultural University', 'pau-ludhiana', 'Leading agricultural university contributing to Green Revolution.', 'Ludhiana', 'Punjab', 'India', 'government', 1962, 'ICAR', 8, 1500, 200, 2800, 30000, 88, 850000, 2200000, true, true, false, now(), now()),

('Acharya N.G. Ranga Agricultural University', 'angrau-hyderabad', 'State agricultural university serving Andhra Pradesh and Telangana.', 'Hyderabad', 'Telangana', 'India', 'government', 1964, 'ICAR', 18, 1200, 180, 2500, 32000, 83, 780000, 1900000, true, true, false, now(), now()),

('University of Agricultural Sciences Bangalore', 'uas-bangalore', 'Premier agricultural university in Karnataka focusing on research and education.', 'Bangalore', 'Karnataka', 'India', 'government', 1964, 'ICAR', 12, 850, 150, 2200, 28000, 86, 820000, 2100000, true, true, false, now(), now()),

-- Pharmacy Colleges
('Jamia Hamdard University', 'jamia-hamdard', 'Deemed university known for pharmacy, medicine and Islamic studies.', 'New Delhi', 'Delhi', 'India', 'deemed', 1989, 'UGC', 45, 40, 180, 2800, 150000, 78, 850000, 2200000, true, true, false, now(), now()),

('Bombay College of Pharmacy', 'bcp-mumbai', 'Premier pharmacy college affiliated with University of Mumbai.', 'Mumbai', 'Maharashtra', 'India', 'private', 1882, 'University of Mumbai', 12, 8, 85, 420, 120000, 85, 950000, 2500000, true, true, false, now(), now()),

('Manipal College of Pharmaceutical Sciences', 'mcops-manipal', 'Leading pharmacy college under Manipal Academy of Higher Education.', 'Manipal', 'Karnataka', 'India', 'deemed', 1963, 'MAHE', 18, 25, 120, 650, 180000, 82, 900000, 2300000, true, true, false, now(), now()),

('National Institute of Pharmaceutical Education and Research', 'niper-mohali', 'Premier institute for pharmaceutical education and research.', 'Mohali', 'Punjab', 'India', 'government', 1998, 'NIPER', 3, 35, 95, 380, 60000, 92, 1400000, 3200000, true, true, true, now(), now()),

('JSS College of Pharmacy', 'jss-pharmacy-mysore', 'Leading pharmacy college known for quality education and research.', 'Mysore', 'Karnataka', 'India', 'private', 1963, 'JSS University', 25, 18, 110, 580, 140000, 80, 880000, 2200000, true, true, false, now(), now()),

-- Arts and Humanities
('Lady Shri Ram College for Women', 'lsr-delhi', 'Premier womens college affiliated with University of Delhi.', 'New Delhi', 'Delhi', 'India', 'government', 1956, 'University of Delhi', 8, 12, 85, 1500, 25000, 88, 1200000, 2800000, true, true, true, now(), now()),

('St. Stephens College', 'st-stephens-delhi', 'Historic college known for liberal arts education and academic excellence.', 'New Delhi', 'Delhi', 'India', 'private', 1881, 'University of Delhi', 5, 15, 95, 1200, 45000, 90, 1400000, 3200000, true, true, true, now(), now()),

('Presidency College Kolkata', 'presidency-kolkata', 'Historic institution known for producing notable alumni in various fields.', 'Kolkata', 'West Bengal', 'India', 'government', 1817, 'Presidency University', 15, 25, 120, 2200, 15000, 85, 1100000, 2600000, true, true, true, now(), now()),

('Loyola College Chennai', 'loyola-chennai', 'Autonomous college known for holistic education and value-based learning.', 'Chennai', 'Tamil Nadu', 'India', 'autonomous', 1925, 'University of Madras', 22, 32, 180, 3800, 65000, 82, 950000, 2300000, true, true, false, now(), now()),

('Ferguson College Pune', 'ferguson-pune', 'Historic college with strong tradition in arts, science and commerce education.', 'Pune', 'Maharashtra', 'India', 'autonomous', 1885, 'University of Pune', 28, 65, 220, 4500, 55000, 80, 900000, 2100000, true, true, false, now(), now()),

-- Commerce and Economics
('Shri Ram College of Commerce', 'srcc-delhi', 'Premier commerce college affiliated with University of Delhi.', 'New Delhi', 'Delhi', 'India', 'government', 1926, 'University of Delhi', 3, 8, 75, 1800, 35000, 92, 1500000, 3500000, true, true, true, now(), now()),

('Hans Raj College', 'hansraj-delhi', 'Leading college offering programs in commerce, science and humanities.', 'New Delhi', 'Delhi', 'India', 'government', 1948, 'University of Delhi', 18, 12, 110, 2200, 28000, 86, 1200000, 2800000, true, true, false, now(), now()),

('HR College of Commerce and Economics', 'hr-college-mumbai', 'Premier commerce college in Mumbai known for academic excellence.', 'Mumbai', 'Maharashtra', 'India', 'private', 1960, 'University of Mumbai', 12, 6, 85, 1650, 95000, 88, 1300000, 2900000, true, true, false, now(), now()),

('Narsee Monjee College of Commerce and Economics', 'nm-college-mumbai', 'Well-established commerce college with strong industry connections.', 'Mumbai', 'Maharashtra', 'India', 'private', 1964, 'University of Mumbai', 25, 8, 120, 2800, 85000, 84, 1100000, 2500000, true, true, false, now(), now());