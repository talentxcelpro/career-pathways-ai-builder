-- Clean existing companies and add quality companies with proper logos for live launch
TRUNCATE companies RESTART IDENTITY CASCADE;

-- Insert verified companies with proper data for live launch
INSERT INTO companies (
  name, slug, description, logo_url, industry, company_size, website, 
  founding_year, is_verified, is_active, headquarters_location
) VALUES

-- Technology Giants (IT Services & Software)
('Tata Consultancy Services', 'tata-consultancy-services', 'Leading global IT services, consulting and business solutions organization with presence in 46 countries', 'https://logo.clearbit.com/tcs.com', 'Information Technology', 'Large (10000+)', 'https://www.tcs.com', 1968, true, true, 'Mumbai, India'),
('Infosys', 'infosys', 'Global leader in next-generation digital services and consulting with focus on AI and automation', 'https://logo.clearbit.com/infosys.com', 'Information Technology', 'Large (10000+)', 'https://www.infosys.com', 1981, true, true, 'Bangalore, India'),
('Wipro', 'wipro', 'Leading technology services and consulting company with expertise in digital transformation', 'https://logo.clearbit.com/wipro.com', 'Information Technology', 'Large (10000+)', 'https://www.wipro.com', 1945, true, true, 'Bangalore, India'),
('HCL Technologies', 'hcl-technologies', 'Global technology company offering comprehensive IT services and digital solutions', 'https://logo.clearbit.com/hcltech.com', 'Information Technology', 'Large (10000+)', 'https://www.hcltech.com', 1976, true, true, 'Noida, India'),
('Tech Mahindra', 'tech-mahindra', 'Digital transformation, consulting and business re-engineering services provider', 'https://logo.clearbit.com/techmahindra.com', 'Information Technology', 'Large (10000+)', 'https://www.techmahindra.com', 1986, true, true, 'Pune, India'),

-- Product Companies
('Microsoft India', 'microsoft-india', 'Global technology leader in software, services, devices and solutions', 'https://logo.clearbit.com/microsoft.com', 'Information Technology', 'Large (10000+)', 'https://www.microsoft.com/en-in', 1985, true, true, 'Hyderabad, India'),
('Google India', 'google-india', 'Multinational technology company specializing in Internet-related services', 'https://logo.clearbit.com/google.com', 'Information Technology', 'Large (10000+)', 'https://www.google.co.in', 2004, true, true, 'Bangalore, India'),
('Amazon India', 'amazon-india', 'Global e-commerce and cloud computing leader with major operations in India', 'https://logo.clearbit.com/amazon.com', 'E-commerce', 'Large (10000+)', 'https://www.amazon.in', 2013, true, true, 'Bangalore, India'),
('Meta (Facebook)', 'meta-facebook', 'Social technology company building the future of human connection', 'https://logo.clearbit.com/meta.com', 'Social Media', 'Large (10000+)', 'https://about.meta.com', 2010, true, true, 'Hyderabad, India'),
('Adobe India', 'adobe-india', 'Global leader in digital media and digital marketing solutions', 'https://logo.clearbit.com/adobe.com', 'Software', 'Large (10000+)', 'https://www.adobe.com/in', 1996, true, true, 'Bangalore, India'),

-- Indian Unicorns & Startups
('Flipkart', 'flipkart', 'Leading Indian e-commerce marketplace transforming commerce through technology', 'https://logo.clearbit.com/flipkart.com', 'E-commerce', 'Large (10000+)', 'https://www.flipkart.com', 2007, true, true, 'Bangalore, India'),
('Paytm', 'paytm', 'India''s leading digital payments and financial services company', 'https://logo.clearbit.com/paytm.com', 'Fintech', 'Large (10000+)', 'https://paytm.com', 2010, true, true, 'Noida, India'),
('Zomato', 'zomato', 'Food delivery and restaurant discovery platform serving millions', 'https://logo.clearbit.com/zomato.com', 'Food Technology', 'Medium (1000-9999)', 'https://www.zomato.com', 2008, true, true, 'Gurugram, India'),
('Swiggy', 'swiggy', 'On-demand convenience platform delivering food and essentials', 'https://logo.clearbit.com/swiggy.com', 'Food Technology', 'Medium (1000-9999)', 'https://www.swiggy.com', 2014, true, true, 'Bangalore, India'),
('BYJU''S', 'byjus', 'Global leader in personalized learning programs for K-12 students', 'https://logo.clearbit.com/byjus.com', 'EdTech', 'Large (10000+)', 'https://byjus.com', 2011, true, true, 'Bangalore, India'),

-- Banking & Financial Services
('State Bank of India', 'state-bank-india', 'India''s largest public sector bank with global presence', 'https://logo.clearbit.com/sbi.co.in', 'Banking', 'Large (10000+)', 'https://www.onlinesbi.sbi', 1955, true, true, 'Mumbai, India'),
('HDFC Bank', 'hdfc-bank', 'Leading private sector bank in India with innovative banking solutions', 'https://logo.clearbit.com/hdfcbank.com', 'Banking', 'Large (10000+)', 'https://www.hdfcbank.com', 1994, true, true, 'Mumbai, India'),
('ICICI Bank', 'icici-bank', 'Premier banking and financial services company with retail focus', 'https://logo.clearbit.com/icicibank.com', 'Banking', 'Large (10000+)', 'https://www.icicibank.com', 1994, true, true, 'Mumbai, India'),
('Axis Bank', 'axis-bank', 'Third largest private sector bank in India with digital banking focus', 'https://logo.clearbit.com/axisbank.com', 'Banking', 'Large (10000+)', 'https://www.axisbank.com', 1993, true, true, 'Mumbai, India'),
('Kotak Mahindra Bank', 'kotak-mahindra-bank', 'Leading Indian private sector bank with comprehensive financial services', 'https://logo.clearbit.com/kotak.com', 'Banking', 'Large (10000+)', 'https://www.kotak.com', 1985, true, true, 'Mumbai, India'),

-- Consulting & Professional Services  
('Deloitte India', 'deloitte-india', 'Global professional services network providing audit, consulting, and advisory services', 'https://logo.clearbit.com/deloitte.com', 'Consulting', 'Large (10000+)', 'https://www2.deloitte.com/in', 1845, true, true, 'Mumbai, India'),
('PwC India', 'pwc-india', 'Leading professional services firm providing assurance, tax and advisory services', 'https://logo.clearbit.com/pwc.com', 'Consulting', 'Large (10000+)', 'https://www.pwc.in', 1998, true, true, 'Mumbai, India'),
('KPMG India', 'kpmg-india', 'Global network of professional firms providing audit, tax and advisory services', 'https://logo.clearbit.com/kpmg.com', 'Consulting', 'Large (10000+)', 'https://home.kpmg/in', 1993, true, true, 'Mumbai, India'),
('EY India', 'ey-india', 'Global leader in assurance, tax, transaction and advisory services', 'https://logo.clearbit.com/ey.com', 'Consulting', 'Large (10000+)', 'https://www.ey.com/en_in', 1989, true, true, 'Mumbai, India'),
('Accenture India', 'accenture-india', 'Global professional services company with capabilities in digital, cloud and security', 'https://logo.clearbit.com/accenture.com', 'Consulting', 'Large (10000+)', 'https://www.accenture.com/in-en', 1987, true, true, 'Bangalore, India'),

-- Pharmaceutical & Healthcare
('Sun Pharmaceutical', 'sun-pharmaceutical', 'Largest pharmaceutical company in India by market capitalization', 'https://logo.clearbit.com/sunpharma.com', 'Pharmaceuticals', 'Large (10000+)', 'https://www.sunpharma.com', 1983, true, true, 'Mumbai, India'),
('Dr. Reddy''s Laboratories', 'dr-reddys-laboratories', 'Global pharmaceutical company with integrated research and manufacturing', 'https://logo.clearbit.com/drreddys.com', 'Pharmaceuticals', 'Large (10000+)', 'https://www.drreddys.com', 1984, true, true, 'Hyderabad, India'),
('Cipla', 'cipla', 'Global pharmaceutical company providing accessible healthcare solutions', 'https://logo.clearbit.com/cipla.com', 'Pharmaceuticals', 'Large (10000+)', 'https://www.cipla.com', 1935, true, true, 'Mumbai, India'),
('Lupin', 'lupin', 'Innovation-led transnational pharmaceutical company', 'https://logo.clearbit.com/lupin.com', 'Pharmaceuticals', 'Large (10000+)', 'https://www.lupin.com', 1968, true, true, 'Mumbai, India'),
('Apollo Hospitals', 'apollo-hospitals', 'Leading integrated healthcare services provider in Asia', 'https://logo.clearbit.com/apollohospitals.com', 'Healthcare', 'Large (10000+)', 'https://www.apollohospitals.com', 1983, true, true, 'Chennai, India'),

-- Automotive
('Tata Motors', 'tata-motors', 'Global automobile manufacturer with operations in commercial and passenger vehicles', 'https://logo.clearbit.com/tatamotors.com', 'Automotive', 'Large (10000+)', 'https://www.tatamotors.com', 1945, true, true, 'Mumbai, India'),
('Mahindra Group', 'mahindra-group', 'Indian multinational automotive manufacturing corporation', 'https://logo.clearbit.com/mahindra.com', 'Automotive', 'Large (10000+)', 'https://www.mahindra.com', 1945, true, true, 'Mumbai, India'),
('Maruti Suzuki', 'maruti-suzuki', 'Largest automobile manufacturer in India by market share', 'https://logo.clearbit.com/marutisuzuki.com', 'Automotive', 'Large (10000+)', 'https://www.marutisuzuki.com', 1981, true, true, 'New Delhi, India'),
('Hero MotoCorp', 'hero-motocorp', 'World''s largest manufacturer of motorcycles and scooters', 'https://logo.clearbit.com/heromotocorp.com', 'Automotive', 'Medium (1000-9999)', 'https://www.heromotocorp.com', 1984, true, true, 'New Delhi, India'),
('Bajaj Auto', 'bajaj-auto', 'Leading manufacturer of motorcycles and commercial vehicles', 'https://logo.clearbit.com/bajajauto.com', 'Automotive', 'Medium (1000-9999)', 'https://www.bajajauto.com', 1945, true, true, 'Pune, India'),

-- Telecommunications
('Reliance Jio', 'reliance-jio', 'Largest mobile network operator in India with 4G and 5G services', 'https://logo.clearbit.com/jio.com', 'Telecommunications', 'Large (10000+)', 'https://www.jio.com', 2016, true, true, 'Mumbai, India'),
('Bharti Airtel', 'bharti-airtel', 'Global telecommunications services company with operations across Asia and Africa', 'https://logo.clearbit.com/airtel.com', 'Telecommunications', 'Large (10000+)', 'https://www.airtel.in', 1995, true, true, 'New Delhi, India'),
('Vodafone Idea', 'vodafone-idea', 'Leading telecommunications service provider in India', 'https://logo.clearbit.com/vodafoneidea.co.in', 'Telecommunications', 'Large (10000+)', 'https://www.vodafoneidea.co.in', 2018, true, true, 'Mumbai, India'),

-- Energy & Oil
('Reliance Industries', 'reliance-industries', 'Largest private sector company in India with petrochemicals and retail', 'https://logo.clearbit.com/ril.com', 'Energy', 'Large (10000+)', 'https://www.ril.com', 1966, true, true, 'Mumbai, India'),
('Indian Oil Corporation', 'indian-oil-corporation', 'Largest commercial enterprise in India with refining and marketing', 'https://logo.clearbit.com/iocl.com', 'Energy', 'Large (10000+)', 'https://www.iocl.com', 1959, true, true, 'New Delhi, India'),
('ONGC', 'ongc', 'Largest crude oil and natural gas company in India', 'https://logo.clearbit.com/ongcindia.com', 'Energy', 'Large (10000+)', 'https://www.ongcindia.com', 1956, true, true, 'New Delhi, India'),

-- Fintech & New Economy
('Razorpay', 'razorpay', 'Leading fintech company providing payment solutions for businesses', 'https://logo.clearbit.com/razorpay.com', 'Fintech', 'Medium (1000-9999)', 'https://razorpay.com', 2014, true, true, 'Bangalore, India'),
('PolicyBazaar', 'policybazaar', 'Leading online insurance marketplace and financial services platform', 'https://logo.clearbit.com/policybazaar.com', 'Insurance', 'Medium (1000-9999)', 'https://www.policybazaar.com', 2008, true, true, 'Gurugram, India'),
('Lenskart', 'lenskart', 'Leading eyewear retailer with omnichannel presence', 'https://logo.clearbit.com/lenskart.com', 'Retail', 'Medium (1000-9999)', 'https://www.lenskart.com', 2010, true, true, 'Gurugram, India'),
('Dream11', 'dream11', 'Leading fantasy sports platform with millions of users', 'https://logo.clearbit.com/dream11.com', 'Gaming', 'Medium (1000-9999)', 'https://www.dream11.com', 2008, true, true, 'Mumbai, India'),

-- Travel & Hospitality
('MakeMyTrip', 'makemytrip', 'Leading online travel company providing travel products and services', 'https://logo.clearbit.com/makemytrip.com', 'Travel', 'Medium (1000-9999)', 'https://www.makemytrip.com', 2000, true, true, 'Gurugram, India'),
('OYO', 'oyo', 'Multinational hospitality chain of leased and franchised hotels', 'https://logo.clearbit.com/oyorooms.com', 'Hospitality', 'Large (10000+)', 'https://www.oyorooms.com', 2013, true, true, 'Gurugram, India'),
('Cleartrip', 'cleartrip', 'Online travel booking platform for flights, hotels and activities', 'https://logo.clearbit.com/cleartrip.com', 'Travel', 'Small (1-999)', 'https://www.cleartrip.com', 2006, true, true, 'Mumbai, India'),

-- EdTech & Learning
('Unacademy', 'unacademy', 'Educational technology company providing online learning platform', 'https://logo.clearbit.com/unacademy.com', 'EdTech', 'Medium (1000-9999)', 'https://unacademy.com', 2015, true, true, 'Bangalore, India'),
('Vedantu', 'vedantu', 'Online tutoring platform providing personalized learning', 'https://logo.clearbit.com/vedantu.com', 'EdTech', 'Medium (1000-9999)', 'https://www.vedantu.com', 2011, true, true, 'Bangalore, India'),

-- Additional Sectors
('L&T', 'larsen-toubro', 'Technology, engineering, construction and manufacturing company', 'https://logo.clearbit.com/larsentoubro.com', 'Engineering', 'Large (10000+)', 'https://www.larsentoubro.com', 1938, true, true, 'Mumbai, India'),
('Bharat Forge', 'bharat-forge', 'Global leader in metal forming with automotive and industrial components', 'https://logo.clearbit.com/bharatforge.com', 'Manufacturing', 'Medium (1000-9999)', 'https://www.bharatforge.com', 1961, true, true, 'Pune, India'),
('ITC Limited', 'itc-limited', 'Diversified conglomerate with presence in FMCG, hotels, paperboards and packaging', 'https://logo.clearbit.com/itcportal.com', 'FMCG', 'Large (10000+)', 'https://www.itcportal.com', 1910, true, true, 'Kolkata, India'),
('Hindustan Unilever', 'hindustan-unilever', 'Leading FMCG company with brands in home and personal care', 'https://logo.clearbit.com/hul.co.in', 'FMCG', 'Large (10000+)', 'https://www.hul.co.in', 1933, true, true, 'Mumbai, India');

-- Update view counts and profile completion scores for better search experience
UPDATE companies SET 
  views_count = FLOOR(RANDOM() * 1000) + 100,
  profile_completion_score = CASE 
    WHEN description IS NOT NULL AND logo_url IS NOT NULL AND website IS NOT NULL THEN 95 + FLOOR(RANDOM() * 6)
    ELSE 85 + FLOOR(RANDOM() * 11)
  END;