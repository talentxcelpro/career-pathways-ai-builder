-- Add remaining 47 colleges to reach 100 total
INSERT INTO colleges (
  name, slug, description, logo_url, website, email, phone, address, city, state, country,
  established_year, college_type, affiliation, ranking_national, ranking_nirf, accreditation_grade,
  campus_size_acres, total_faculty, total_students, hostels_available, library_books, labs_count,
  average_fees_per_year, scholarship_available, placement_percentage, average_package, highest_package,
  is_verified, is_active, verification_status, featured
) VALUES
-- Engineering Colleges
('Netaji Subhas University of Technology', 'netaji-subhas-university-technology', 'Premier engineering university in Delhi offering diverse technical programs', 'https://example.com/logos/nsut.png', 'http://nsut.ac.in', 'info@nsut.ac.in', '+91-11-25000000', 'Azad Hind Fauj Marg, Sector 3, Dwarka', 'New Delhi', 'Delhi', 'India', 1996, 'government', 'University of Delhi', 35, 28, 'A++', 40, 450, 8500, true, 65000, 85, 120000, true, 92, 850000, 3500000, true, true, 'verified', true),

('Thiagarajar College of Engineering', 'thiagarajar-college-engineering', 'Autonomous engineering college affiliated to Anna University', 'https://example.com/logos/tce.png', 'http://tce.edu', 'principal@tce.edu', '+91-452-2482240', 'Thiruparankundram', 'Madurai', 'Tamil Nadu', 'India', 1957, 'autonomous', 'Anna University', 42, 35, 'A+', 60, 280, 4200, true, 45000, 55, 85000, true, 88, 720000, 2800000, true, true, 'verified', false),

('Birla Institute of Technology Mesra', 'bit-mesra', 'Deemed university offering engineering and technology programs', 'https://example.com/logos/bitmesra.png', 'http://bitmesra.ac.in', 'registrar@bitmesra.ac.in', '+91-651-2275444', 'Mesra', 'Ranchi', 'Jharkhand', 'India', 1955, 'deemed', 'Self', 38, 31, 'A+', 780, 420, 12000, true, 80000, 95, 150000, true, 85, 680000, 2200000, true, true, 'verified', false),

('Army Institute of Technology', 'army-institute-technology', 'Premier military engineering institute', 'https://example.com/logos/ait.png', 'http://aitpune.com', 'info@aitpune.com', '+91-20-24303050', 'Dighi Hills', 'Pune', 'Maharashtra', 'India', 1994, 'autonomous', 'University of Pune', 28, 22, 'A+', 85, 120, 1800, true, 35000, 45, 180000, true, 95, 1200000, 4500000, true, true, 'verified', true),

('Thapar Institute of Engineering and Technology', 'thapar-university', 'Deemed university known for engineering and applied sciences', 'https://example.com/logos/thapar.png', 'http://thapar.edu', 'info@thapar.edu', '+91-175-2393021', 'Bhadson Road', 'Patiala', 'Punjab', 'India', 1956, 'deemed', 'Self', 29, 26, 'A+', 250, 580, 13500, true, 125000, 110, 200000, true, 90, 950000, 3800000, true, true, 'verified', true),

-- Medical Colleges
('King Georges Medical University', 'kgmu-lucknow', 'Premier medical university in Uttar Pradesh', 'https://example.com/logos/kgmu.png', 'http://kgmcindia.edu', 'info@kgmcindia.edu', '+91-522-2257450', 'Chowk', 'Lucknow', 'Uttar Pradesh', 'India', 1905, 'government', 'Medical Council of India', 15, 12, 'A++', 180, 850, 3500, true, 95000, 125, 300000, true, 98, 1800000, 8500000, true, true, 'verified', true),

('Government Medical College Nagpur', 'gmc-nagpur', 'Leading government medical college in Maharashtra', 'https://example.com/logos/gmcnagpur.png', 'http://gmcnagpur.edu.in', 'dean@gmcnagpur.edu.in', '+91-712-2744016', 'Hanuman Nagar', 'Nagpur', 'Maharashtra', 'India', 1946, 'government', 'Maharashtra University of Health Sciences', 18, 15, 'A+', 45, 320, 1500, true, 55000, 85, 250000, true, 96, 1500000, 6500000, true, true, 'verified', false),

('Rajiv Gandhi University of Health Sciences', 'rguhs-bangalore', 'Health sciences university in Karnataka', 'https://example.com/logos/rguhs.png', 'http://rguhs.ac.in', 'registrar@rguhs.ac.in', '+91-80-26961927', 'Jayanagar', 'Bangalore', 'Karnataka', 'India', 1996, 'government', 'Medical Council of India', 22, 18, 'A+', 25, 180, 8500, false, 75000, 95, 280000, true, 94, 1600000, 7200000, true, true, 'verified', false),

-- Business Schools
('Indian School of Business Hyderabad', 'isb-hyderabad', 'World-class business school offering MBA and executive programs', 'https://example.com/logos/isb.png', 'http://isb.edu', 'admissions@isb.edu', '+91-40-23007000', 'Gachibowli', 'Hyderabad', 'Telangana', 'India', 2001, 'private', 'Autonomous', 8, 5, 'A++', 260, 280, 950, true, 85000, 55, 2500000, true, 99, 2850000, 8500000, true, true, 'verified', true),

('XLRI Xavier School of Management', 'xlri-jamshedpur', 'Premier management institute in Jharkhand', 'https://example.com/logos/xlri.png', 'http://xlri.ac.in', 'info@xlri.ac.in', '+91-657-3983000', 'C.H. Area (East)', 'Jamshedpur', 'Jharkhand', 'India', 1949, 'private', 'Autonomous', 12, 8, 'A++', 60, 145, 650, true, 125000, 85, 2200000, true, 98, 2650000, 7800000, true, true, 'verified', true),

('Management Development Institute Gurgaon', 'mdi-gurgaon', 'Leading management institute offering MBA programs', 'https://example.com/logos/mdi.png', 'http://mdi.ac.in', 'info@mdi.ac.in', '+91-124-4560000', 'Mehrauli Road', 'Gurgaon', 'Haryana', 'India', 1973, 'autonomous', 'AICTE', 15, 11, 'A+', 35, 85, 420, true, 65000, 45, 1800000, true, 97, 2200000, 6500000, true, true, 'verified', false),

-- Liberal Arts Colleges
('Ashoka University', 'ashoka-university', 'Liberal arts university offering interdisciplinary education', 'https://example.com/logos/ashoka.png', 'http://ashoka.edu.in', 'admissions@ashoka.edu.in', '+91-130-2300100', 'Plot No. 2, Rajiv Gandhi Education City', 'Sonipat', 'Haryana', 'India', 2014, 'private', 'UGC', 45, 38, 'A+', 25, 180, 2800, true, 95000, 125, 550000, true, 92, 1200000, 4500000, true, true, 'verified', true),

('Flame University', 'flame-university', 'Liberal education university in Pune', 'https://example.com/logos/flame.png', 'http://flame.edu.in', 'info@flame.edu.in', '+91-20-66538100', 'Gat No. 1270, Lavale', 'Pune', 'Maharashtra', 'India', 2015, 'private', 'UGC', 65, 55, 'A', 65, 95, 1850, true, 45000, 85, 420000, true, 88, 850000, 2800000, true, true, 'verified', false),

-- Technology Institutes
('International Institute of Information Technology Bangalore', 'iiitb-bangalore', 'Research-focused IT institute in Bangalore', 'https://example.com/logos/iiitb.png', 'http://iiitb.ac.in', 'info@iiitb.ac.in', '+91-80-26995501', 'Electronics City Phase 1', 'Bangalore', 'Karnataka', 'India', 1999, 'autonomous', 'AICTE', 25, 19, 'A++', 25, 125, 850, true, 85000, 95, 320000, true, 96, 1850000, 6200000, true, true, 'verified', true),

('Institute of Chemical Technology Mumbai', 'ict-mumbai', 'Deemed university specializing in chemical technology', 'https://example.com/logos/ict.png', 'http://ictmumbai.edu.in', 'registrar@ictmumbai.edu.in', '+91-22-33612000', 'Nathalal Parekh Marg, Matunga', 'Mumbai', 'Maharashtra', 'India', 1933, 'deemed', 'UGC', 32, 28, 'A+', 10, 285, 2850, false, 125000, 145, 185000, true, 94, 1250000, 4800000, true, true, 'verified', false),

-- Agriculture Universities
('Punjab Agricultural University', 'pau-ludhiana', 'Leading agricultural university in northern India', 'https://example.com/logos/pau.png', 'http://pau.edu', 'registrar@pau.edu', '+91-161-2401960', 'University Campus', 'Ludhiana', 'Punjab', 'India', 1962, 'government', 'ICAR', 48, 42, 'A+', 1510, 685, 8500, true, 185000, 225, 85000, true, 82, 580000, 1850000, true, true, 'verified', false),

('Tamil Nadu Agricultural University', 'tnau-coimbatore', 'Premier agricultural university in Tamil Nadu', 'https://example.com/logos/tnau.png', 'http://tnau.ac.in', 'registrar@tnau.ac.in', '+91-422-6611200', 'Lawley Road', 'Coimbatore', 'Tamil Nadu', 'India', 1971, 'government', 'ICAR', 52, 45, 'A', 650, 450, 6800, true, 95000, 185, 68000, true, 78, 485000, 1250000, true, true, 'verified', false),

-- Pharmacy Colleges
('Jamia Hamdard University', 'jamia-hamdard', 'Deemed university known for pharmacy and medical sciences', 'https://example.com/logos/hamdard.png', 'http://jamiahamdard.edu', 'info@jamiahamdard.edu', '+91-11-26059688', 'Hamdard Nagar', 'New Delhi', 'Delhi', 'India', 1989, 'deemed', 'UGC', 68, 58, 'A', 45, 285, 4500, true, 125000, 165, 125000, true, 85, 650000, 2200000, true, true, 'verified', false),

('Manipal College of Pharmaceutical Sciences', 'mcops-manipal', 'Leading pharmacy college in Karnataka', 'https://example.com/logos/mcops.png', 'http://manipal.edu/mcops', 'mcops@manipal.edu', '+91-820-2922482', 'Madhav Nagar', 'Manipal', 'Karnataka', 'India', 1963, 'deemed', 'Manipal Academy of Higher Education', 25, 22, 'A+', 15, 85, 850, true, 65000, 75, 195000, true, 88, 750000, 2800000, true, true, 'verified', false),

-- Architecture Colleges
('School of Planning and Architecture Delhi', 'spa-delhi', 'Premier architecture and planning institute', 'https://example.com/logos/spa.png', 'http://spa.ac.in', 'director@spa.ac.in', '+91-11-23702375', 'I.P. Estate Ring Road', 'New Delhi', 'Delhi', 'India', 1941, 'government', 'Council of Architecture', 8, 6, 'A++', 12, 95, 650, true, 45000, 85, 85000, true, 95, 1150000, 4200000, true, true, 'verified', true),

('Sir J.J. College of Architecture', 'jj-architecture', 'Historic architecture college in Mumbai', 'https://example.com/logos/jj.png', 'http://jjcoa.ac.in', 'principal@jjcoa.ac.in', '+91-22-22652514', 'Fort', 'Mumbai', 'Maharashtra', 'India', 1913, 'government', 'University of Mumbai', 15, 12, 'A+', 2, 45, 350, false, 25000, 35, 65000, true, 92, 985000, 3500000, true, true, 'verified', false),

-- Fashion and Design
('National Institute of Fashion Technology Delhi', 'nift-delhi', 'Premier fashion and design institute', 'https://example.com/logos/nift.png', 'http://nift.ac.in', 'info@nift.ac.in', '+91-11-27590900', 'Hauz Khas', 'New Delhi', 'Delhi', 'India', 1986, 'government', 'Ministry of Textiles', 3, 2, 'A++', 8, 65, 850, true, 35000, 55, 185000, true, 96, 1450000, 5200000, true, true, 'verified', true),

('Pearl Academy', 'pearl-academy', 'Leading design and fashion institute', 'https://example.com/logos/pearl.png', 'http://pearlacademy.com', 'info@pearlacademy.com', '+91-11-49465000', 'Rajouri Garden', 'New Delhi', 'Delhi', 'India', 1993, 'private', 'UGC', 28, 25, 'A', 15, 125, 2500, true, 85000, 125, 285000, true, 90, 950000, 3200000, true, true, 'verified', false),

-- Mass Communication
('Indian Institute of Mass Communication', 'iimc-delhi', 'Premier mass communication institute', 'https://example.com/logos/iimc.png', 'http://iimc.nic.in', 'director@iimc.nic.in', '+91-11-26962529', 'Aruna Asaf Ali Marg', 'New Delhi', 'Delhi', 'India', 1965, 'government', 'Ministry of I&B', 5, 3, 'A++', 12, 45, 285, true, 25000, 35, 45000, true, 98, 1850000, 6500000, true, true, 'verified', true),

('Symbiosis Institute of Media and Communication', 'simc-pune', 'Leading media and communication institute', 'https://example.com/logos/simc.png', 'http://simc.edu', 'info@simc.edu', '+91-20-28116000', 'Lavale', 'Pune', 'Maharashtra', 'India', 1990, 'deemed', 'Symbiosis International University', 12, 8, 'A+', 25, 65, 450, true, 125000, 85, 285000, true, 94, 1250000, 4200000, true, true, 'verified', false),

-- Veterinary Sciences
('Madras Veterinary College', 'mvc-chennai', 'Leading veterinary college in South India', 'https://example.com/logos/mvc.png', 'http://mvc.edu.in', 'dean@mvc.edu.in', '+91-44-25551555', 'Vepery', 'Chennai', 'Tamil Nadu', 'India', 1903, 'government', 'Tamil Nadu Veterinary and Animal Sciences University', 8, 6, 'A+', 45, 125, 850, true, 65000, 95, 45000, true, 88, 450000, 1250000, true, true, 'verified', false),

('College of Veterinary Science Hyderabad', 'cvs-hyderabad', 'Veterinary college affiliated to PVNRTVU', 'https://example.com/logos/cvs.png', 'http://cvsc.edu.in', 'dean@cvsc.edu.in', '+91-40-24017000', 'Rajendranagar', 'Hyderabad', 'Telangana', 'India', 1946, 'government', 'PVNR Telangana Veterinary University', 12, 9, 'A+', 85, 95, 650, true, 45000, 75, 38000, true, 85, 385000, 985000, true, true, 'verified', false),

-- Arts and Humanities
('Presidency College Chennai', 'presidency-college-chennai', 'Historic liberal arts college in Chennai', 'https://example.com/logos/presidency.png', 'http://presidencychennai.ac.in', 'principal@presidencychennai.ac.in', '+91-44-28544894', 'Egmore', 'Chennai', 'Tamil Nadu', 'India', 1840, 'government', 'University of Madras', 35, 28, 'A+', 8, 185, 2500, false, 15000, 125, 25000, true, 75, 285000, 850000, true, true, 'verified', false),

('Fergusson College', 'fergusson-college', 'Autonomous college affiliated to University of Pune', 'https://example.com/logos/fergusson.png', 'http://fergusson.edu', 'principal@fergusson.edu', '+91-20-25601439', 'F.C. Road', 'Pune', 'Maharashtra', 'India', 1885, 'autonomous', 'University of Pune', 42, 35, 'A', 40, 225, 4500, true, 35000, 185, 28000, true, 78, 325000, 985000, true, true, 'verified', false),

-- Commerce Colleges
('Shri Ram College of Commerce', 'srcc-delhi', 'Premier commerce college in Delhi University', 'https://example.com/logos/srcc.png', 'http://srcc.du.ac.in', 'principal@srcc.du.ac.in', '+91-11-27666613', 'Maurice Nagar', 'New Delhi', 'Delhi', 'India', 1926, 'government', 'University of Delhi', 8, 5, 'A++', 3, 85, 1850, false, 8500, 125, 18500, true, 96, 1450000, 5200000, true, true, 'verified', true),

('Christ University Bangalore', 'christ-university', 'Deemed university offering diverse programs', 'https://example.com/logos/christ.png', 'http://christuniversity.in', 'info@christuniversity.in', '+91-80-40129100', 'Hosur Road', 'Bangalore', 'Karnataka', 'India', 1969, 'deemed', 'UGC', 28, 22, 'A+', 85, 485, 18500, true, 185000, 285, 185000, true, 89, 850000, 2850000, true, true, 'verified', true),

-- Law Colleges
('Rajiv Gandhi School of Intellectual Property Law', 'rgsip-kharagpur', 'Specialized law school for IP law', 'https://example.com/logos/rgsip.png', 'http://rgsiplk.iitkgp.ernet.in', 'rgsiplk@iitkgp.ac.in', '+91-3222-283550', 'IIT Campus', 'Kharagpur', 'West Bengal', 'India', 2006, 'government', 'IIT Kharagpur', 8, 6, 'A++', 5, 25, 85, true, 125000, 45, 185000, true, 98, 2250000, 8500000, true, true, 'verified', false),

('Government Law College Mumbai', 'glc-mumbai', 'Premier government law college in Maharashtra', 'https://example.com/logos/glc.png', 'http://glcmumbai.edu.in', 'principal@glcmumbai.edu.in', '+91-22-22694498', 'Churchgate', 'Mumbai', 'Maharashtra', 'India', 1855, 'government', 'University of Mumbai', 15, 12, 'A+', 2, 65, 850, false, 12500, 85, 35000, true, 92, 1250000, 4200000, true, true, 'verified', false),

-- Science Colleges
('Loyola College Chennai', 'loyola-college', 'Autonomous college known for science programs', 'https://example.com/logos/loyola.png', 'http://loyolacollege.edu', 'principal@loyolacollege.edu', '+91-44-28178200', 'Nungambakkam', 'Chennai', 'Tamil Nadu', 'India', 1925, 'autonomous', 'University of Madras', 25, 18, 'A+', 45, 285, 8500, true, 125000, 285, 85000, true, 88, 650000, 2250000, true, true, 'verified', false),

('St. Stephens College Delhi', 'st-stephens', 'Premier liberal arts college in Delhi University', 'https://example.com/logos/stephens.png', 'http://ststephens.edu', 'principal@ststephens.edu', '+91-11-27667271', 'University Enclave', 'New Delhi', 'Delhi', 'India', 1881, 'autonomous', 'University of Delhi', 12, 8, 'A++', 15, 125, 1250, true, 85000, 185, 65000, true, 94, 1850000, 6500000, true, true, 'verified', true),

-- Computer Science Institutes
('DA-IICT Gandhinagar', 'da-iict', 'Deemed university for ICT and computer science', 'https://example.com/logos/daiict.png', 'http://daiict.ac.in', 'info@daiict.ac.in', '+91-79-30051000', 'Near Indroda Circle', 'Gandhinagar', 'Gujarat', 'India', 2001, 'deemed', 'UGC', 35, 28, 'A+', 50, 125, 1850, true, 285000, 185, 285000, true, 94, 1650000, 5200000, true, true, 'verified', false),

('Institute for Development and Research in Banking Technology', 'idrbt-hyderabad', 'Research institute for banking technology', 'https://example.com/logos/idrbt.png', 'http://idrbt.ac.in', 'director@idrbt.ac.in', '+91-40-23146600', 'Castle Hills', 'Hyderabad', 'Telangana', 'India', 1996, 'autonomous', 'Reserve Bank of India', 18, 15, 'A+', 25, 85, 185, true, 185000, 125, 485000, true, 96, 2250000, 8500000, true, true, 'verified', false),

-- Marine Engineering
('Indian Maritime University', 'imu-chennai', 'Central university for maritime studies', 'https://example.com/logos/imu.png', 'http://imu.edu.in', 'registrar@imu.edu.in', '+91-44-25541912', 'East Coast Road', 'Chennai', 'Tamil Nadu', 'India', 2008, 'government', 'Ministry of Shipping', 22, 18, 'A+', 125, 185, 2850, true, 185000, 225, 285000, true, 92, 1850000, 6500000, true, true, 'verified', false),

-- Nursing Colleges
('College of Nursing AIIMS Delhi', 'con-aiims', 'Premier nursing college attached to AIIMS', 'https://example.com/logos/aiimsnursing.png', 'http://aiims.edu/nursing', 'nursing@aiims.ac.in', '+91-11-26588500', 'Ansari Nagar', 'New Delhi', 'Delhi', 'India', 1960, 'government', 'AIIMS', 2, 1, 'A++', 5, 85, 485, true, 125000, 185, 185000, true, 98, 1250000, 4500000, true, true, 'verified', true),

-- Sports Sciences
('Lakshmibai National Institute of Physical Education', 'lnipe-gwalior', 'Premier institute for physical education and sports', 'https://example.com/logos/lnipe.png', 'http://lnipe.edu.in', 'registrar@lnipe.edu.in', '+91-751-2423020', 'Old Phoolerao Ghat Road', 'Gwalior', 'Madhya Pradesh', 'India', 1957, 'government', 'Ministry of Youth Affairs and Sports', 8, 6, 'A+', 185, 125, 850, true, 25000, 185, 25000, true, 85, 385000, 1250000, true, true, 'verified', false),

-- Dental Colleges
('Manipal College of Dental Sciences', 'mcods-manipal', 'Leading dental college in Karnataka', 'https://example.com/logos/mcods.png', 'http://manipal.edu/mcods', 'mcods@manipal.edu', '+91-820-2922328', 'Madhav Nagar', 'Manipal', 'Karnataka', 'India', 1987, 'deemed', 'Manipal Academy of Higher Education', 18, 15, 'A+', 8, 125, 650, true, 485000, 185, 485000, true, 94, 1250000, 4200000, true, true, 'verified', false),

-- Music and Performing Arts
('Kalakshetra Foundation', 'kalakshetra-chennai', 'Deemed university for performing arts', 'https://example.com/logos/kalakshetra.png', 'http://kalakshetra.in', 'info@kalakshetra.in', '+91-44-24524739', 'Thiruvanmiyur', 'Chennai', 'Tamil Nadu', 'India', 1936, 'deemed', 'Ministry of Culture', 5, 3, 'A+', 100, 85, 285, true, 15000, 125, 8500, true, 88, 285000, 985000, true, true, 'verified', false),

-- Hotel Management
('Institute of Hotel Management Pusa', 'ihm-pusa', 'Premier hotel management institute in Delhi', 'https://example.com/logos/ihmpusa.png', 'http://ihmpusa.com', 'principal@ihmpusa.com', '+91-11-25843395', 'Pusa Road', 'New Delhi', 'Delhi', 'India', 1962, 'government', 'Ministry of Tourism', 8, 6, 'A+', 12, 65, 485, true, 125000, 185, 185000, true, 96, 850000, 2850000, true, true, 'verified', false),

-- Economics and Social Sciences
('Delhi School of Economics', 'dse-delhi', 'Premier economics school in Delhi University', 'https://example.com/logos/dse.png', 'http://econdse.org', 'office@econdse.org', '+91-11-27666591', 'Maurice Nagar', 'New Delhi', 'Delhi', 'India', 1949, 'government', 'University of Delhi', 5, 3, 'A++', 8, 125, 185, false, 8500, 85, 15000, true, 96, 1850000, 6500000, true, true, 'verified', true),

-- Geology and Earth Sciences
('Indian Institute of Technology Roorkee', 'iit-roorkee-geology', 'Geology department at IIT Roorkee', 'https://example.com/logos/iitroorkee.png', 'http://iitr.ac.in/geology', 'geology@iitr.ac.in', '+91-1332-285311', 'Roorkee', 'Roorkee', 'Uttarakhand', 'India', 1847, 'government', 'IIT System', 5, 4, 'A++', 365, 525, 8500, true, 285000, 485, 285000, true, 96, 1850000, 6500000, true, true, 'verified', true),

-- Environmental Sciences
('Centre for Environmental Planning and Technology', 'cept-ahmedabad', 'University for planning, architecture and technology', 'https://example.com/logos/cept.png', 'http://cept.ac.in', 'info@cept.ac.in', '+91-79-26302470', 'Kasturbhai Lalbhai Campus', 'Ahmedabad', 'Gujarat', 'India', 1962, 'deemed', 'UGC', 35, 28, 'A+', 45, 185, 2850, true, 285000, 285, 285000, true, 92, 985000, 3200000, true, true, 'verified', false),

-- Psychology
('Department of Psychology Allahabad University', 'au-psychology', 'Psychology department at Allahabad University', 'https://example.com/logos/allahabaduni.png', 'http://allduniv.ac.in/psychology', 'psychology@allduniv.ac.in', '+91-532-2460818', 'University Road', 'Allahabad', 'Uttar Pradesh', 'India', 1887, 'government', 'University of Allahabad', 25, 18, 'A+', 1200, 485, 12500, true, 25000, 485, 18500, true, 82, 385000, 1250000, true, true, 'verified', false);