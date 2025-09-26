-- Update existing companies with logo URLs from our mapping service
-- This will add logos to companies that match our predefined list

-- First, let's update companies that have exact matches in our logo mapping
UPDATE companies 
SET logo_url = CASE 
  WHEN name = 'Tata Consultancy Services' THEN 'https://logo.clearbit.com/tcs.com'
  WHEN name = 'Infosys' THEN 'https://logo.clearbit.com/infosys.com'
  WHEN name = 'Wipro' THEN 'https://logo.clearbit.com/wipro.com'
  WHEN name = 'HCL Technologies' THEN 'https://logo.clearbit.com/hcltech.com'
  WHEN name = 'Tech Mahindra' THEN 'https://logo.clearbit.com/techmahindra.com'
  WHEN name = 'Cognizant' THEN 'https://logo.clearbit.com/cognizant.com'
  WHEN name = 'Accenture' THEN 'https://logo.clearbit.com/accenture.com'
  WHEN name = 'Microsoft India' OR name = 'Microsoft' THEN 'https://logo.clearbit.com/microsoft.com'
  WHEN name = 'Google India' OR name = 'Google' THEN 'https://logo.clearbit.com/google.com'
  WHEN name = 'Amazon India' OR name = 'Amazon' THEN 'https://logo.clearbit.com/amazon.com'
  WHEN name = 'IBM India' OR name = 'IBM' THEN 'https://logo.clearbit.com/ibm.com'
  WHEN name = 'Oracle' THEN 'https://logo.clearbit.com/oracle.com'
  WHEN name = 'SAP' THEN 'https://logo.clearbit.com/sap.com'
  WHEN name = 'Adobe' THEN 'https://logo.clearbit.com/adobe.com'
  WHEN name = 'Meta' OR name = 'Facebook' THEN 'https://logo.clearbit.com/meta.com'
  WHEN name = 'Flipkart' THEN 'https://logo.clearbit.com/flipkart.com'
  WHEN name = 'Paytm' THEN 'https://logo.clearbit.com/paytm.com'
  WHEN name = 'Zomato' THEN 'https://logo.clearbit.com/zomato.com'
  WHEN name = 'Swiggy' THEN 'https://logo.clearbit.com/swiggy.com'
  WHEN name = 'BYJU''S' OR name = 'Byjus' THEN 'https://logo.clearbit.com/byjus.com'
  WHEN name = 'Ola' THEN 'https://logo.clearbit.com/olacabs.com'
  WHEN name = 'Uber India' OR name = 'Uber' THEN 'https://logo.clearbit.com/uber.com'
  WHEN name = 'Myntra' THEN 'https://logo.clearbit.com/myntra.com'
  WHEN name = 'BigBasket' THEN 'https://logo.clearbit.com/bigbasket.com'
  WHEN name = 'Razorpay' THEN 'https://logo.clearbit.com/razorpay.com'
  WHEN name = 'PhonePe' THEN 'https://logo.clearbit.com/phonepe.com'
  WHEN name = 'Nykaa' THEN 'https://logo.clearbit.com/nykaa.com'
  WHEN name = 'State Bank of India' OR name = 'SBI' THEN 'https://logo.clearbit.com/sbi.co.in'
  WHEN name = 'HDFC Bank' OR name = 'HDFC' THEN 'https://logo.clearbit.com/hdfcbank.com'
  WHEN name = 'ICICI Bank' OR name = 'ICICI' THEN 'https://logo.clearbit.com/icicibank.com'
  WHEN name = 'Axis Bank' OR name = 'Axis' THEN 'https://logo.clearbit.com/axisbank.com'
  WHEN name = 'Kotak Mahindra Bank' OR name = 'Kotak' THEN 'https://logo.clearbit.com/kotak.com'
  WHEN name = 'Reliance Industries' OR name = 'Reliance' THEN 'https://logo.clearbit.com/ril.com'
  WHEN name = 'Tata Group' OR name = 'Tata' THEN 'https://logo.clearbit.com/tata.com'
  WHEN name = 'Aditya Birla Group' THEN 'https://logo.clearbit.com/adityabirla.com'
  WHEN name = 'Mahindra Group' OR name = 'Mahindra' THEN 'https://logo.clearbit.com/mahindra.com'
  WHEN name = 'Bajaj Group' OR name = 'Bajaj' THEN 'https://logo.clearbit.com/bajaj.com'
  WHEN name = 'Deloitte' THEN 'https://logo.clearbit.com/deloitte.com'
  WHEN name = 'PwC' OR name = 'PricewaterhouseCoopers' THEN 'https://logo.clearbit.com/pwc.com'
  WHEN name = 'EY' OR name = 'Ernst & Young' THEN 'https://logo.clearbit.com/ey.com'
  WHEN name = 'KPMG' THEN 'https://logo.clearbit.com/kpmg.com'
  WHEN name = 'Apollo Hospitals' OR name = 'Apollo' THEN 'https://logo.clearbit.com/apollohospitals.com'
  WHEN name = 'Dr. Reddy''s' OR name = 'Dr Reddys' THEN 'https://logo.clearbit.com/drreddys.com'
  WHEN name = 'Cipla' THEN 'https://logo.clearbit.com/cipla.com'
  WHEN name = 'Sun Pharma' OR name = 'Sun Pharmaceutical' THEN 'https://logo.clearbit.com/sunpharma.com'
  ELSE logo_url
END
WHERE name IN (
  'Tata Consultancy Services', 'Infosys', 'Wipro', 'HCL Technologies', 'Tech Mahindra', 'Cognizant', 'Accenture',
  'Microsoft India', 'Microsoft', 'Google India', 'Google', 'Amazon India', 'Amazon', 'IBM India', 'IBM',
  'Oracle', 'SAP', 'Adobe', 'Meta', 'Facebook', 'Flipkart', 'Paytm', 'Zomato', 'Swiggy', 'BYJU''S', 'Byjus',
  'Ola', 'Uber India', 'Uber', 'Myntra', 'BigBasket', 'Razorpay', 'PhonePe', 'Nykaa',
  'State Bank of India', 'SBI', 'HDFC Bank', 'HDFC', 'ICICI Bank', 'ICICI', 'Axis Bank', 'Axis',
  'Kotak Mahindra Bank', 'Kotak', 'Reliance Industries', 'Reliance', 'Tata Group', 'Tata',
  'Aditya Birla Group', 'Mahindra Group', 'Mahindra', 'Bajaj Group', 'Bajaj',
  'Deloitte', 'PwC', 'PricewaterhouseCoopers', 'EY', 'Ernst & Young', 'KPMG',
  'Apollo Hospitals', 'Apollo', 'Dr. Reddy''s', 'Dr Reddys', 'Cipla', 'Sun Pharma', 'Sun Pharmaceutical'
);

-- For companies that don't have logos yet, generate fallback logos with initials
UPDATE companies 
SET logo_url = 'https://ui-avatars.com/api/?name=' || 
               REPLACE(
                 SUBSTRING(
                   UPPER(
                     CASE 
                       WHEN POSITION(' ' IN name) > 0 THEN 
                         LEFT(name, 1) || SUBSTRING(name, POSITION(' ' IN name) + 1, 1)
                       ELSE 
                         LEFT(name, 2)
                     END
                   ), 1, 2
                 ), ' ', ''
               ) || 
               '&size=200&background=0F172A&color=fff&format=png&rounded=true&bold=true'
WHERE logo_url IS NULL;