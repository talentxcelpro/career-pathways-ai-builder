-- Add more comprehensive college data to reach 70+ colleges
INSERT INTO colleges (
  name, slug, description, logo_url, cover_image_url, website, email, phone, 
  city, state, country, established_year, college_type, ranking_national, 
  ranking_nirf, placement_percentage, average_fees_per_year, average_package, 
  highest_package, total_students, total_faculty, is_verified, is_active, featured
) VALUES 
-- IITs
('Indian Institute of Technology Bombay', 'iit-bombay', 'Premier technical institute known for engineering excellence and innovation.', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=400&fit=crop', 'https://www.iitb.ac.in', 'info@iitb.ac.in', '+91-22-2572-2545', 'Mumbai', 'Maharashtra', 'India', 1958, 'government', 1, 3, 98.2, 250000, 1800000, 5500000, 12000, 650, true, true, true),
('Indian Institute of Technology Kharagpur', 'iit-kharagpur', 'First IIT established in India, renowned for engineering and technology.', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=400&fit=crop', 'https://www.iitkgp.ac.in', 'info@iitkgp.ac.in', '+91-3222-282020', 'Kharagpur', 'West Bengal', 'India', 1951, 'government', 3, 5, 97.8, 240000, 1750000, 4800000, 13000, 700, true, true, true),
('Indian Institute of Technology Kanpur', 'iit-kanpur', 'Leading technical institute with strong research focus.', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=400&fit=crop', 'https://www.iitk.ac.in', 'info@iitk.ac.in', '+91-512-259-0001', 'Kanpur', 'Uttar Pradesh', 'India', 1959, 'government', 4, 6, 96.5, 245000, 1650000, 4200000, 8500, 550, true, true, true),
('Indian Institute of Technology Madras', 'iit-madras', 'Premier technical institution in South India.', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=400&fit=crop', 'https://www.iitm.ac.in', 'info@iitm.ac.in', '+91-44-2257-4011', 'Chennai', 'Tamil Nadu', 'India', 1959, 'government', 2, 1, 97.2, 235000, 1900000, 5800000, 11000, 600, true, true, true),
('Indian Institute of Technology Roorkee', 'iit-roorkee', 'Historic engineering institution with heritage campus.', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=400&fit=crop', 'https://www.iitr.ac.in', 'info@iitr.ac.in', '+91-1332-285311', 'Roorkee', 'Uttarakhand', 'India', 1847, 'government', 5, 7, 95.8, 238000, 1550000, 3800000, 9500, 480, true, true, true),
('Indian Institute of Technology Guwahati', 'iit-guwahati', 'Leading technical institute in Northeast India.', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=400&fit=crop', 'https://www.iitg.ac.in', 'info@iitg.ac.in', '+91-361-258-2748', 'Guwahati', 'Assam', 'India', 1994, 'government', 6, 8, 94.2, 242000, 1450000, 3500000, 6500, 420, true, true, true),

-- NITs
('National Institute of Technology Trichy', 'nit-trichy', 'Premier technical institute known for engineering excellence.', 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&h=400&fit=crop', 'https://www.nitt.edu', 'info@nitt.edu', '+91-431-250-3000', 'Tiruchirappalli', 'Tamil Nadu', 'India', 1964, 'government', 8, 10, 92.5, 125000, 1200000, 2800000, 8000, 480, true, true, true),
('National Institute of Technology Warangal', 'nit-warangal', 'Leading engineering college in Telangana.', 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&h=400&fit=crop', 'https://www.nitw.ac.in', 'info@nitw.ac.in', '+91-870-246-2011', 'Warangal', 'Telangana', 'India', 1959, 'government', 10, 12, 91.8, 120000, 1150000, 2600000, 7500, 450, true, true, true),
('National Institute of Technology Surathkal', 'nit-surathkal', 'Coastal engineering institute with modern facilities.', 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&h=400&fit=crop', 'https://www.nitk.ac.in', 'info@nitk.ac.in', '+91-824-247-3000', 'Surathkal', 'Karnataka', 'India', 1960, 'government', 12, 15, 90.5, 118000, 1100000, 2400000, 6800, 400, true, true, true),
('National Institute of Technology Rourkela', 'nit-rourkela', 'Leading technical institute in Eastern India.', 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&h=400&fit=crop', 'https://www.nitrkl.ac.in', 'info@nitrkl.ac.in', '+91-661-246-2001', 'Rourkela', 'Odisha', 'India', 1961, 'government', 15, 18, 89.2, 115000, 1050000, 2200000, 7200, 420, true, true, true),

-- IIITs
('Indian Institute of Information Technology Hyderabad', 'iiit-hyderabad', 'Premier IT institute known for computer science excellence.', 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=800&h=400&fit=crop', 'https://www.iiit.ac.in', 'info@iiit.ac.in', '+91-40-6653-1000', 'Hyderabad', 'Telangana', 'India', 1998, 'government', 18, 22, 95.5, 350000, 1850000, 4500000, 1500, 120, true, true, true),
('International Institute of Information Technology Bangalore', 'iiit-bangalore', 'Research-focused IT institute with industry partnerships.', 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=800&h=400&fit=crop', 'https://www.iiitb.ac.in', 'info@iiitb.ac.in', '+91-80-2652-6900', 'Bangalore', 'Karnataka', 'India', 1999, 'government', 20, 25, 94.8, 365000, 1750000, 4200000, 1200, 100, true, true, true),

-- Private Universities
('Birla Institute of Technology and Science Pilani', 'bits-pilani', 'Leading private technical university with multiple campuses.', 'https://images.unsplash.com/photo-1555425673-82d1a0dd5a61?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1555425673-82d1a0dd5a61?w=800&h=400&fit=crop', 'https://www.bits-pilani.ac.in', 'info@bits-pilani.ac.in', '+91-1596-242-531', 'Pilani', 'Rajasthan', 'India', 1964, 'private', 25, 30, 92.5, 425000, 1650000, 3800000, 15000, 800, true, true, true),
('Manipal Institute of Technology', 'mit-manipal', 'Premier private engineering college with global recognition.', 'https://images.unsplash.com/photo-1555425673-82d1a0dd5a61?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1555425673-82d1a0dd5a61?w=800&h=400&fit=crop', 'https://manipal.edu/mit.html', 'info@manipal.edu', '+91-820-292-3000', 'Manipal', 'Karnataka', 'India', 1957, 'private', 32, 38, 88.5, 385000, 1350000, 3200000, 8500, 650, true, true, true),
('SRM Institute of Science and Technology', 'srm-chennai', 'Large private university with diverse programs.', 'https://images.unsplash.com/photo-1555425673-82d1a0dd5a61?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1555425673-82d1a0dd5a61?w=800&h=400&fit=crop', 'https://www.srmist.edu.in', 'info@srmist.edu.in', '+91-44-2741-5000', 'Chennai', 'Tamil Nadu', 'India', 1985, 'private', 35, 42, 85.2, 295000, 950000, 2800000, 38000, 2400, true, true, false),
('Amity University Noida', 'amity-noida', 'Multi-disciplinary private university with modern infrastructure.', 'https://images.unsplash.com/photo-1555425673-82d1a0dd5a61?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1555425673-82d1a0dd5a61?w=800&h=400&fit=crop', 'https://www.amity.edu', 'info@amity.edu', '+91-120-435-9000', 'Noida', 'Uttar Pradesh', 'India', 2005, 'private', 45, 55, 82.5, 365000, 750000, 2200000, 25000, 1800, true, true, false),

-- State Universities
('Anna University', 'anna-university', 'Leading technical university in Tamil Nadu.', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=400&fit=crop', 'https://www.annauniv.edu', 'info@annauniv.edu', '+91-44-2235-8000', 'Chennai', 'Tamil Nadu', 'India', 1978, 'government', 22, 28, 88.8, 65000, 850000, 2800000, 45000, 2200, true, true, true),
('Jadavpur University', 'jadavpur-university', 'Premier state university known for engineering and arts.', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=400&fit=crop', 'https://www.jaduniv.edu.in', 'info@jaduniv.edu.in', '+91-33-2414-6666', 'Kolkata', 'West Bengal', 'India', 1955, 'government', 28, 35, 86.5, 12000, 750000, 2500000, 12000, 850, true, true, true),
('Osmania University', 'osmania-university', 'Historic university with diverse academic programs.', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=400&fit=crop', 'https://www.osmania.ac.in', 'info@osmania.ac.in', '+91-40-2709-8000', 'Hyderabad', 'Telangana', 'India', 1918, 'government', 42, 48, 78.5, 25000, 650000, 1800000, 28000, 1200, true, true, false),
('University of Mumbai', 'mumbai-university', 'Leading state university with multiple affiliated colleges.', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=400&fit=crop', 'https://www.mu.ac.in', 'info@mu.ac.in', '+91-22-2652-4082', 'Mumbai', 'Maharashtra', 'India', 1857, 'government', 38, 45, 75.2, 35000, 580000, 1600000, 350000, 1500, true, true, false),

-- Engineering Colleges
('Delhi Technological University', 'dtu-delhi', 'Premier technical university in Delhi.', 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&h=400&fit=crop', 'https://www.dtu.ac.in', 'info@dtu.ac.in', '+91-11-2787-1023', 'New Delhi', 'Delhi', 'India', 1941, 'government', 48, 55, 85.5, 185000, 950000, 2800000, 9500, 650, true, true, true),
('Netaji Subhas University of Technology', 'nsut-delhi', 'Leading engineering university in Delhi.', 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&h=400&fit=crop', 'https://www.nsut.ac.in', 'info@nsut.ac.in', '+91-11-2590-1000', 'New Delhi', 'Delhi', 'India', 1996, 'government', 52, 58, 83.2, 175000, 885000, 2600000, 4500, 350, true, true, true),
('PSG College of Technology', 'psg-coimbatore', 'Premier private engineering college in Tamil Nadu.', 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&h=400&fit=crop', 'https://www.psgtech.edu', 'info@psgtech.edu', '+91-422-257-2177', 'Coimbatore', 'Tamil Nadu', 'India', 1951, 'private', 58, 65, 89.5, 185000, 1150000, 2800000, 3500, 280, true, true, true),
('Thapar Institute of Engineering and Technology', 'tiet-patiala', 'Leading private engineering institute in Punjab.', 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&h=400&fit=crop', 'https://www.thapar.edu', 'info@thapar.edu', '+91-175-239-3021', 'Patiala', 'Punjab', 'India', 1956, 'private', 62, 68, 86.8, 385000, 1250000, 3200000, 8000, 480, true, true, true),

-- Medical Colleges
('All India Institute of Medical Sciences Delhi', 'aiims-delhi', 'Premier medical institute and hospital.', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=400&fit=crop', 'https://www.aiims.edu', 'info@aiims.edu', '+91-11-2659-3333', 'New Delhi', 'Delhi', 'India', 1956, 'government', 7, 2, 100, 1500, 1200000, 2500000, 1500, 850, true, true, true),
('Christian Medical College Vellore', 'cmc-vellore', 'Leading private medical college with excellent reputation.', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=400&fit=crop', 'https://www.cmch-vellore.edu', 'info@cmch-vellore.edu', '+91-416-228-1000', 'Vellore', 'Tamil Nadu', 'India', 1900, 'private', 14, 9, 98.5, 850000, 1450000, 2800000, 2500, 950, true, true, true),
('Armed Forces Medical College', 'afmc-pune', 'Premier military medical college.', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=400&fit=crop', 'https://www.afmc.nic.in', 'info@afmc.nic.in', '+91-20-2630-2200', 'Pune', 'Maharashtra', 'India', 1948, 'government', 16, 11, 100, 50000, 1100000, 2200000, 400, 180, true, true, true),

-- Management Institutes
('Indian Institute of Management Ahmedabad', 'iim-ahmedabad', 'Premier management institute with global recognition.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop', 'https://www.iima.ac.in', 'info@iima.ac.in', '+91-79-6632-4700', 'Ahmedabad', 'Gujarat', 'India', 1961, 'government', 9, 4, 100, 2300000, 2850000, 5500000, 950, 120, true, true, true),
('Indian Institute of Management Bangalore', 'iim-bangalore', 'Leading business school in South India.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop', 'https://www.iimb.ac.in', 'info@iimb.ac.in', '+91-80-2699-3000', 'Bangalore', 'Karnataka', 'India', 1973, 'government', 11, 13, 100, 2400000, 2750000, 5200000, 850, 110, true, true, true),
('Indian Institute of Management Calcutta', 'iim-calcutta', 'Historic business school with excellent alumni network.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop', 'https://www.iimcal.ac.in', 'info@iimcal.ac.in', '+91-33-2467-8300', 'Kolkata', 'West Bengal', 'India', 1961, 'government', 13, 14, 100, 2350000, 2680000, 4800000, 750, 95, true, true, true),

-- Liberal Arts and Science Colleges
('Ashoka University', 'ashoka-university', 'Leading liberal arts university with innovative curriculum.', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=400&fit=crop', 'https://www.ashoka.edu.in', 'info@ashoka.edu.in', '+91-130-231-2345', 'Sonipat', 'Haryana', 'India', 2014, 'private', 55, 62, 85.5, 950000, 1250000, 2800000, 2500, 180, true, true, true),
('Jindal School of Liberal Arts and Humanities', 'jslh-sonipat', 'Premier liberal arts college with global perspective.', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=400&fit=crop', 'https://www.jgu.edu.in/jslh/', 'info@jgu.edu.in', '+91-130-305-9000', 'Sonipat', 'Haryana', 'India', 2009, 'private', 65, 72, 82.5, 850000, 1150000, 2500000, 1800, 120, true, true, false),
('Indian Statistical Institute', 'isi-kolkata', 'Premier institute for statistics and mathematics.', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=400&fit=crop', 'https://www.isical.ac.in', 'info@isical.ac.in', '+91-33-2575-2000', 'Kolkata', 'West Bengal', 'India', 1931, 'government', 38, 43, 92.5, 15000, 1850000, 4200000, 1200, 250, true, true, true),

-- Additional Engineering and Technology Colleges
('Birla Institute of Technology Mesra', 'bit-mesra', 'Leading private technical institute in Eastern India.', 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&h=400&fit=crop', 'https://www.bitmesra.ac.in', 'info@bitmesra.ac.in', '+91-651-227-5444', 'Ranchi', 'Jharkhand', 'India', 1955, 'private', 68, 75, 84.5, 365000, 985000, 2400000, 12000, 750, true, true, false),
('Dhirubhai Ambani Institute of Information and Communication Technology', 'da-iict', 'Premier IT institute with industry focus.', 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=800&h=400&fit=crop', 'https://www.daiict.ac.in', 'info@daiict.ac.in', '+91-79-3051-8888', 'Gandhinagar', 'Gujarat', 'India', 2001, 'government', 72, 78, 88.5, 285000, 1350000, 3500000, 1800, 150, true, true, true),
('Indian Institute of Space Science and Technology', 'iist-trivandrum', 'Specialized institute for space technology.', 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&h=400&fit=crop', 'https://www.iist.ac.in', 'info@iist.ac.in', '+91-471-256-8500', 'Thiruvananthapuram', 'Kerala', 'India', 2007, 'government', 45, 52, 95.8, 185000, 1550000, 3800000, 1200, 95, true, true, true),
('Indian Institute of Engineering Science and Technology Shibpur', 'iiest-shibpur', 'Historic engineering college with strong alumni network.', 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&h=400&fit=crop', 'https://www.iiests.ac.in', 'info@iiests.ac.in', '+91-33-2668-4561', 'Howrah', 'West Bengal', 'India', 1856, 'government', 58, 65, 86.5, 125000, 850000, 2200000, 6500, 420, true, true, true),

-- More State Universities and Colleges
('Pune University', 'pune-university', 'Major state university with diverse programs.', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=400&fit=crop', 'https://www.unipune.ac.in', 'info@unipune.ac.in', '+91-20-2560-1000', 'Pune', 'Maharashtra', 'India', 1949, 'government', 75, 82, 72.5, 45000, 485000, 1500000, 450000, 2200, true, true, false),
('University of Hyderabad', 'uoh-hyderabad', 'Central university known for research and academics.', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=400&fit=crop', 'https://www.uohyd.ac.in', 'info@uohyd.ac.in', '+91-40-2313-4000', 'Hyderabad', 'Telangana', 'India', 1974, 'government', 82, 88, 76.5, 25000, 585000, 1650000, 8500, 450, true, true, false),
('Jawaharlal Nehru University', 'jnu-delhi', 'Premier central university for social sciences and humanities.', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=400&fit=crop', 'https://www.jnu.ac.in', 'info@jnu.ac.in', '+91-11-2670-4000', 'New Delhi', 'Delhi', 'India', 1969, 'government', 65, 75, 78.5, 2500, 650000, 1800000, 8500, 850, true, true, true),
('University of Delhi', 'delhi-university', 'Historic central university with multiple colleges.', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=120&h=120&fit=crop', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=400&fit=crop', 'https://www.du.ac.in', 'info@du.ac.in', '+91-11-2766-7049', 'New Delhi', 'Delhi', 'India', 1922, 'government', 55, 62, 74.5, 15000, 550000, 1500000, 165000, 1800, true, true, true);

-- Create college analytics table
CREATE TABLE IF NOT EXISTS college_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
  analytics_date DATE DEFAULT CURRENT_DATE,
  
  -- Performance Metrics
  placement_rate DECIMAL(5,2),
  state_average_placement DECIMAL(5,2),
  national_average_placement DECIMAL(5,2),
  placement_trend TEXT, -- 'improving', 'declining', 'stable'
  
  -- Popularity Metrics
  monthly_views INTEGER DEFAULT 0,
  monthly_applications INTEGER DEFAULT 0,
  students_searched INTEGER DEFAULT 0,
  popularity_score INTEGER DEFAULT 0,
  
  -- Rankings and Comparisons
  regional_rank INTEGER,
  state_rank INTEGER,
  category_rank INTEGER,
  roi_score INTEGER DEFAULT 0,
  
  -- Financial Metrics
  average_package_trend TEXT, -- 'increasing', 'decreasing', 'stable'
  fee_affordability_score INTEGER DEFAULT 0,
  scholarship_utilization DECIMAL(5,2) DEFAULT 0,
  
  -- Student Metrics
  admission_competition_ratio DECIMAL(8,2),
  student_satisfaction_score DECIMAL(3,1),
  alumni_network_strength INTEGER DEFAULT 0,
  
  -- Infrastructure Metrics
  facilities_score INTEGER DEFAULT 0,
  technology_adoption_score INTEGER DEFAULT 0,
  campus_life_score INTEGER DEFAULT 0,
  
  -- Industry Metrics
  industry_partnerships INTEGER DEFAULT 0,
  research_publications INTEGER DEFAULT 0,
  innovation_score INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(college_id, analytics_date)
);

-- Insert analytics data for existing colleges
INSERT INTO college_analytics (
  college_id, analytics_date, placement_rate, state_average_placement, national_average_placement,
  monthly_views, monthly_applications, students_searched, popularity_score, regional_rank,
  state_rank, roi_score, admission_competition_ratio, student_satisfaction_score,
  facilities_score, technology_adoption_score, campus_life_score, industry_partnerships,
  research_publications, innovation_score, placement_trend, average_package_trend
)
SELECT 
  id as college_id,
  CURRENT_DATE as analytics_date,
  placement_percentage as placement_rate,
  CASE 
    WHEN state = 'Maharashtra' THEN 68.5
    WHEN state = 'Tamil Nadu' THEN 72.3
    WHEN state = 'Karnataka' THEN 71.8
    WHEN state = 'Delhi' THEN 75.2
    WHEN state = 'Gujarat' THEN 69.8
    WHEN state = 'West Bengal' THEN 64.5
    WHEN state = 'Punjab' THEN 66.2
    WHEN state = 'Uttar Pradesh' THEN 62.8
    WHEN state = 'Telangana' THEN 73.5
    WHEN state = 'Kerala' THEN 70.2
    ELSE 65.0
  END as state_average_placement,
  68.5 as national_average_placement,
  FLOOR(RANDOM() * 5000 + 1000)::INTEGER as monthly_views,
  FLOOR(RANDOM() * 500 + 100)::INTEGER as monthly_applications,
  FLOOR(RANDOM() * 800 + 200)::INTEGER as students_searched,
  FLOOR(RANDOM() * 40 + 60)::INTEGER as popularity_score,
  CASE 
    WHEN ranking_national <= 10 THEN FLOOR(RANDOM() * 3 + 1)
    WHEN ranking_national <= 30 THEN FLOOR(RANDOM() * 8 + 1)
    WHEN ranking_national <= 50 THEN FLOOR(RANDOM() * 15 + 1)
    ELSE FLOOR(RANDOM() * 25 + 1)
  END as regional_rank,
  CASE 
    WHEN ranking_national <= 10 THEN FLOOR(RANDOM() * 2 + 1)
    WHEN ranking_national <= 30 THEN FLOOR(RANDOM() * 5 + 1)
    WHEN ranking_national <= 50 THEN FLOOR(RANDOM() * 10 + 1)
    ELSE FLOOR(RANDOM() * 20 + 1)
  END as state_rank,
  FLOOR(RANDOM() * 30 + 70)::INTEGER as roi_score,
  CASE 
    WHEN ranking_national <= 10 THEN RANDOM() * 50 + 100
    WHEN ranking_national <= 30 THEN RANDOM() * 30 + 50
    WHEN ranking_national <= 50 THEN RANDOM() * 20 + 20
    ELSE RANDOM() * 15 + 5
  END as admission_competition_ratio,
  ROUND((RANDOM() * 2 + 3.5)::NUMERIC, 1) as student_satisfaction_score,
  FLOOR(RANDOM() * 30 + 70)::INTEGER as facilities_score,
  FLOOR(RANDOM() * 25 + 75)::INTEGER as technology_adoption_score,
  FLOOR(RANDOM() * 35 + 65)::INTEGER as campus_life_score,
  CASE 
    WHEN college_type = 'government' AND ranking_national <= 20 THEN FLOOR(RANDOM() * 50 + 30)
    WHEN college_type = 'private' AND ranking_national <= 50 THEN FLOOR(RANDOM() * 30 + 20)
    ELSE FLOOR(RANDOM() * 15 + 5)
  END as industry_partnerships,
  CASE 
    WHEN ranking_national <= 10 THEN FLOOR(RANDOM() * 200 + 100)
    WHEN ranking_national <= 30 THEN FLOOR(RANDOM() * 100 + 50)
    WHEN ranking_national <= 50 THEN FLOOR(RANDOM() * 50 + 20)
    ELSE FLOOR(RANDOM() * 25 + 5)
  END as research_publications,
  FLOOR(RANDOM() * 25 + 75)::INTEGER as innovation_score,
  CASE 
    WHEN RANDOM() < 0.4 THEN 'improving'
    WHEN RANDOM() < 0.8 THEN 'stable'
    ELSE 'declining'
  END as placement_trend,
  CASE 
    WHEN RANDOM() < 0.5 THEN 'increasing'
    WHEN RANDOM() < 0.8 THEN 'stable'
    ELSE 'decreasing'
  END as average_package_trend
FROM colleges 
WHERE is_active = true;

-- Enable RLS on college_analytics
ALTER TABLE college_analytics ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public can view college analytics" ON college_analytics
  FOR SELECT USING (true);

-- Create policy for admin management
CREATE POLICY "Admins can manage college analytics" ON college_analytics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND is_active = true
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_college_analytics_college_id ON college_analytics(college_id);
CREATE INDEX idx_college_analytics_date ON college_analytics(analytics_date);
CREATE INDEX idx_colleges_ranking ON colleges(ranking_national) WHERE is_active = true;
CREATE INDEX idx_colleges_state_placement ON colleges(state, placement_percentage) WHERE is_active = true;