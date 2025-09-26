import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface JobTemplate {
  title: string;
  company: string;
  location: string;
  employment_type: string;
  experience_level: string;
  salary_min?: number;
  salary_max?: number;
  skills: string[];
  description: string;
  industry: string;
  department: string;
}

const jobTemplates: JobTemplate[] = [
  {
    title: "Senior Frontend Developer",
    company: "TechCorp India",
    location: "Bangalore, Karnataka",
    employment_type: "Full-time",
    experience_level: "senior-level",
    salary_min: 1200000,
    salary_max: 2000000,
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    description: "We are looking for a Senior Frontend Developer to join our growing team. You will be responsible for building user-facing features using modern web technologies. The ideal candidate has 5+ years of experience with React and TypeScript.",
    industry: "Technology",
    department: "engineering"
  },
  {
    title: "Data Scientist",
    company: "Analytics Pro",
    location: "Mumbai, Maharashtra",
    employment_type: "Full-time",
    experience_level: "mid-level",
    salary_min: 800000,
    salary_max: 1500000,
    skills: ["Python", "Machine Learning", "SQL", "Pandas"],
    description: "Join our data science team to analyze complex datasets and build predictive models. Experience with Python, machine learning libraries, and statistical analysis required.",
    industry: "Technology",
    department: "engineering"
  },
  {
    title: "Digital Marketing Manager",
    company: "Growth Agency",
    location: "Delhi, Delhi",
    employment_type: "Full-time",
    experience_level: "mid-level",
    salary_min: 600000,
    salary_max: 1000000,
    skills: ["Digital Marketing", "SEO", "Google Ads", "Analytics"],
    description: "Lead our digital marketing initiatives including SEO, SEM, social media marketing, and content strategy. 3-5 years of experience in digital marketing required.",
    industry: "Marketing",
    department: "marketing"
  },
  {
    title: "Backend Engineer",
    company: "StartupXYZ",
    location: "Hyderabad, Telangana",
    employment_type: "Full-time",
    experience_level: "fresher",
    salary_min: 500000,
    salary_max: 900000,
    skills: ["Node.js", "Express", "MongoDB", "AWS"],
    description: "Build scalable backend services and APIs. Work with modern technologies including Node.js, Express, and cloud platforms. Great opportunity for growth.",
    industry: "Technology",
    department: "engineering"
  },
  {
    title: "Product Manager",
    company: "InnovateNow",
    location: "Pune, Maharashtra",
    employment_type: "Full-time",
    experience_level: "senior-level",
    salary_min: 1500000,
    salary_max: 2500000,
    skills: ["Product Management", "Agile", "Analytics", "User Research"],
    description: "Drive product strategy and roadmap for our flagship products. Collaborate with engineering, design, and business teams to deliver exceptional user experiences.",
    industry: "Technology",
    department: "product"
  },
  {
    title: "UI/UX Designer",
    company: "DesignStudio",
    location: "Bangalore, Karnataka",
    employment_type: "Full-time",
    experience_level: "mid-level",
    salary_min: 700000,
    salary_max: 1200000,
    skills: ["Figma", "Adobe XD", "Prototyping", "User Research"],
    description: "Create beautiful and intuitive user interfaces for web and mobile applications. Strong portfolio and experience with design tools required.",
    industry: "Technology",
    department: "design"
  },
  {
    title: "DevOps Engineer",
    company: "CloudTech Solutions",
    location: "Chennai, Tamil Nadu",
    employment_type: "Full-time",
    experience_level: "mid-level",
    salary_min: 900000,
    salary_max: 1600000,
    skills: ["AWS", "Docker", "Kubernetes", "CI/CD"],
    description: "Manage cloud infrastructure and deployment pipelines. Experience with AWS, containerization, and automation tools essential.",
    industry: "Technology",
    department: "operations"
  },
  {
    title: "Sales Executive",
    company: "SalesForce India",
    location: "Mumbai, Maharashtra",
    employment_type: "Full-time",
    experience_level: "junior",
    salary_min: 400000,
    salary_max: 800000,
    skills: ["Sales", "CRM", "Communication", "Lead Generation"],
    description: "Drive sales growth by identifying new business opportunities and maintaining client relationships. Strong communication skills and sales experience preferred.",
    industry: "Sales",
    department: "sales"
  },
  {
    title: "Full Stack Developer",
    company: "WebDev Solutions",
    location: "Noida, Uttar Pradesh",
    employment_type: "Full-time",
    experience_level: "mid-level",
    salary_min: 800000,
    salary_max: 1400000,
    skills: ["React", "Node.js", "PostgreSQL", "TypeScript"],
    description: "Work on both frontend and backend development. Build complete web applications using modern JavaScript frameworks and databases.",
    industry: "Technology",
    department: "engineering"
  },
  {
    title: "HR Manager",
    company: "PeopleFirst Corp",
    location: "Gurgaon, Haryana",
    employment_type: "Full-time",
    experience_level: "senior-level",
    salary_min: 1000000,
    salary_max: 1800000,
    skills: ["HR Management", "Recruitment", "Employee Relations", "HRIS"],
    description: "Lead HR initiatives including recruitment, employee engagement, and performance management. 5+ years of HR experience required.",
    industry: "Human Resources",
    department: "hr"
  }
]

const additionalCompanies = [
  "Microsoft India", "Google India", "Amazon India", "Flipkart", "Zomato", "Swiggy", "Paytm", "BYJU'S", 
  "Ola", "Uber India", "Infosys", "TCS", "Wipro", "HCL Technologies", "Tech Mahindra", "Mindtree",
  "Freshworks", "Zoho", "Razorpay", "PhonePe", "Nykaa", "BigBasket", "MakeMyTrip", "BookMyShow"
]

const cities = [
  // Andhra Pradesh
  "Adoni, Andhra Pradesh", "Agiripalli, Andhra Pradesh", "Akkalkot, Andhra Pradesh", "Amalapuram, Andhra Pradesh",
  "Anakapalle, Andhra Pradesh", "Anantapur, Andhra Pradesh", "Bapatla, Andhra Pradesh", "Bheemunipatnam, Andhra Pradesh",
  "Chandragiri, Andhra Pradesh", "Chirala, Andhra Pradesh", "Chittoor, Andhra Pradesh", "Chodavaram, Andhra Pradesh",
  "Cumbum, Andhra Pradesh", "Dharmavaram, Andhra Pradesh", "Eluru, Andhra Pradesh", "Gajuwaka, Andhra Pradesh",
  "Guntur, Andhra Pradesh", "Gudivada, Andhra Pradesh", "Hindupur, Andhra Pradesh", "Ichchapuram, Andhra Pradesh",
  "Jaggayyapeta, Andhra Pradesh", "Jammalamadugu, Andhra Pradesh", "Kadapa, Andhra Pradesh", "Kakinada, Andhra Pradesh",
  "Kandukur, Andhra Pradesh", "Kavali, Andhra Pradesh", "Kurnool, Andhra Pradesh", "Machilipatnam, Andhra Pradesh",
  "Madanapalle, Andhra Pradesh", "Mandapeta, Andhra Pradesh", "Nabarangapur, Andhra Pradesh", "Nandyal, Andhra Pradesh",
  "Narasannapeta, Andhra Pradesh", "Narsipatnam, Andhra Pradesh", "Nellore, Andhra Pradesh", "Nidadavole, Andhra Pradesh",
  "Nuzvid, Andhra Pradesh", "Ongole, Andhra Pradesh", "Palakollu, Andhra Pradesh", "Peddapuram, Andhra Pradesh",
  "Pithapuram, Andhra Pradesh", "Proddatur, Andhra Pradesh", "Sattenapalle, Andhra Pradesh", "Srikakulam, Andhra Pradesh",
  "Tadepalligudem, Andhra Pradesh", "Tadipatri, Andhra Pradesh", "Tanuku, Andhra Pradesh", "Tirupati, Andhra Pradesh",
  "Vemulawada, Andhra Pradesh", "Venkatagiri, Andhra Pradesh", "Vijayawada, Andhra Pradesh", "Visakhapatnam, Andhra Pradesh",
  "Vizianagaram, Andhra Pradesh", "Yerraguntla, Andhra Pradesh",

  // Arunachal Pradesh
  "Aalo, Arunachal Pradesh", "Along, Arunachal Pradesh", "Anini, Arunachal Pradesh", "Basar, Arunachal Pradesh",
  "Bomdila, Arunachal Pradesh", "Itanagar, Arunachal Pradesh", "Khonsa, Arunachal Pradesh", "Koloriang, Arunachal Pradesh",
  "Miao, Arunachal Pradesh", "Pasighat, Arunachal Pradesh", "Roing, Arunachal Pradesh", "Seppa, Arunachal Pradesh",
  "Tawang, Arunachal Pradesh",

  // Assam
  "Barpeta, Assam", "Bongaigaon, Assam", "Dhubri, Assam", "Dibrugarh, Assam", "Duliajan, Assam", "Guwahati, Assam",
  "Haflong, Assam", "Jorhat, Assam", "Karimganj, Assam", "Lakhimpur, Assam", "Nagaon, Assam", "Silchar, Assam",
  "Tezpur, Assam", "Tinsukia, Assam", "Sivasagar, Assam", "Golaghat, Assam", "Morigaon, Assam", "Hojai, Assam",
  "Brahmapur, Assam",

  // Bihar
  "Ara, Bihar", "Arrah, Bihar", "Aurangabad, Bihar", "Bagaha, Bihar", "Banka, Bihar", "Begusarai, Bihar",
  "Bhagalpur, Bihar", "Bettiah, Bihar", "Bihar Sharif, Bihar", "Buxar, Bihar", "Darbhanga, Bihar", "Dumraon, Bihar",
  "Gaya, Bihar", "Gopalganj, Bihar", "Hajipur, Bihar", "Jamui, Bihar", "Jehanabad, Bihar", "Katihar, Bihar",
  "Khagaria, Bihar", "Lakhisarai, Bihar", "Madhepura, Bihar", "Madhubani, Bihar", "Munger, Bihar", "Muzaffarpur, Bihar",
  "Nawada, Bihar", "Patna, Bihar", "Purnia, Bihar", "Sasaram, Bihar", "Sitamarhi, Bihar", "Siwan, Bihar",
  "Supaul, Bihar", "Motihari, Bihar",

  // Chhattisgarh
  "Ambikapur, Chhattisgarh", "Balod, Chhattisgarh", "Baloda Bazar, Chhattisgarh", "Bastar, Chhattisgarh",
  "Bemetara, Chhattisgarh", "Bilaspur, Chhattisgarh", "Champa, Chhattisgarh", "Dantewada, Chhattisgarh",
  "Dhamtari, Chhattisgarh", "Durg, Chhattisgarh", "Jagdalpur, Chhattisgarh", "Janjgir-Champa, Chhattisgarh",
  "Kanker, Chhattisgarh", "Korba, Chhattisgarh", "Koriya, Chhattisgarh", "Mahasamund, Chhattisgarh",
  "Raigarh, Chhattisgarh", "Raipur, Chhattisgarh", "Rajim, Chhattisgarh", "Rajnandgaon, Chhattisgarh",
  "Bhilai, Chhattisgarh",

  // Goa
  "Panaji, Goa", "Margao, Goa", "Mapusa, Goa", "Ponda, Goa", "Vasco da Gama, Goa", "Cortalim, Goa",
  "Canacona, Goa", "Bicholim, Goa", "Pernem, Goa",

  // Gujarat
  "Ahmedabad, Gujarat", "Amreli, Gujarat", "Anand, Gujarat", "Anjar, Gujarat", "Bharuch, Gujarat", "Bhavnagar, Gujarat",
  "Bhuj, Gujarat", "Botad, Gujarat", "Cambay, Gujarat", "Dahod, Gujarat", "Dhoraji, Gujarat", "Gandhinagar, Gujarat",
  "Ghandhidham, Gujarat", "Gir Somnath, Gujarat", "Godhra, Gujarat", "Himatnagar, Gujarat", "Jamnagar, Gujarat",
  "Junagadh, Gujarat", "Kadi, Gujarat", "Kalol, Gujarat", "Kapadvanj, Gujarat", "Keshod, Gujarat", "Mahesana, Gujarat",
  "Mehsana, Gujarat", "Morbi, Gujarat", "Nadiad, Gujarat", "Navsari, Gujarat", "Padra, Gujarat", "Palanpur, Gujarat",
  "Patan, Gujarat", "Porbandar, Gujarat", "Rajkot, Gujarat", "Surat, Gujarat", "Vadodara, Gujarat", "Valsad, Gujarat",
  "Vapi, Gujarat", "Visnagar, Gujarat", "Vijapur, Gujarat", "Veraval, Gujarat",

  // Haryana
  "Ambala, Haryana", "Bhiwani, Haryana", "Charkhi Dadri, Haryana", "Faridabad, Haryana", "Fatehabad, Haryana",
  "Gurugram, Haryana", "Hisar, Haryana", "Jhajjar, Haryana", "Jind, Haryana", "Karnal, Haryana", "Kaithal, Haryana",
  "Kurukshetra, Haryana", "Mahendragarh, Haryana", "Narnaul, Haryana", "Panipat, Haryana", "Panchkula, Haryana",
  "Palwal, Haryana", "Rewari, Haryana", "Rohtak, Haryana", "Sonepat, Haryana", "Yamunanagar, Haryana",

  // Himachal Pradesh
  "Bilaspur, Himachal Pradesh", "Chamba, Himachal Pradesh", "Dharamsala, Himachal Pradesh", "Hamirpur, Himachal Pradesh",
  "Kangra, Himachal Pradesh", "Kinnaur, Himachal Pradesh", "Kullu, Himachal Pradesh", "Mandi, Himachal Pradesh",
  "Nurpur, Himachal Pradesh", "Palampur, Himachal Pradesh", "Shimla, Himachal Pradesh", "Solan, Himachal Pradesh",
  "Sundernagar, Himachal Pradesh", "Una, Himachal Pradesh",

  // Jammu and Kashmir
  "Anantnag, Jammu and Kashmir", "Baramulla, Jammu and Kashmir", "Ganderbal, Jammu and Kashmir",
  "Jammu, Jammu and Kashmir", "Kathua, Jammu and Kashmir", "Kishtwar, Jammu and Kashmir", "Kulgam, Jammu and Kashmir",
  "Kupwara, Jammu and Kashmir", "Poonch, Jammu and Kashmir", "Pulwama, Jammu and Kashmir", "Rajouri, Jammu and Kashmir",
  "Samba, Jammu and Kashmir", "Srinagar, Jammu and Kashmir", "Udhampur, Jammu and Kashmir",

  // Jharkhand
  "Bokaro, Jharkhand", "Chaibasa, Jharkhand", "Dhanbad, Jharkhand", "Deoghar, Jharkhand", "Dumka, Jharkhand",
  "Giridih, Jharkhand", "Hazaribagh, Jharkhand", "Jamshedpur, Jharkhand", "Jhumri Telaiya, Jharkhand",
  "Koderma, Jharkhand", "Madhupur, Jharkhand", "Mandla, Jharkhand", "Medininagar, Jharkhand", "Ranchi, Jharkhand",
  "Sahibganj, Jharkhand", "Saraikela, Jharkhand",

  // Karnataka
  "Bengaluru, Karnataka", "Mysuru, Karnataka", "Mangalore, Karnataka", "Hubballi, Karnataka", "Dharwad, Karnataka",
  "Belagavi, Karnataka", "Ballari, Karnataka", "Davangere, Karnataka", "Raichur, Karnataka", "Shivamogga, Karnataka",
  "Tumakuru, Karnataka", "Udupi, Karnataka", "Mandya, Karnataka", "Kolar, Karnataka", "Koppal, Karnataka",
  "Hassan, Karnataka", "Chikkamagaluru, Karnataka", "Gulbarga, Karnataka", "Bidar, Karnataka", "Kalaburagi, Karnataka",
  "Yadgir, Karnataka", "Karwar, Karnataka", "Hospet, Karnataka", "Ranebennur, Karnataka", "Puttur, Karnataka",
  "Gadag, Karnataka", "Chitradurga, Karnataka", "Chamarajanagar, Karnataka", "Kudremukh, Karnataka", "Haveri, Karnataka",
  "Sakleshpur, Karnataka", "Shimoga, Karnataka",

  // Kerala
  "Thiruvananthapuram, Kerala", "Kochi, Kerala", "Kozhikode, Kerala", "Thrissur, Kerala", "Palakkad, Kerala",
  "Kollam, Kerala", "Kannur, Kerala", "Alappuzha, Kerala", "Malappuram, Kerala", "Kottayam, Kerala", "Idukki, Kerala",
  "Kasargod, Kerala", "Pathanamthitta, Kerala", "Wayanad, Kerala", "Vadakara, Kerala", "Punalur, Kerala",
  "Kattappana, Kerala", "Perinthalmanna, Kerala", "Tirur, Kerala", "Kochi North, Kerala",

  // Madhya Pradesh
  "Bhopal, Madhya Pradesh", "Indore, Madhya Pradesh", "Gwalior, Madhya Pradesh", "Jabalpur, Madhya Pradesh",
  "Ujjain, Madhya Pradesh", "Sagar, Madhya Pradesh", "Satna, Madhya Pradesh", "Ratlam, Madhya Pradesh",
  "Rewa, Madhya Pradesh", "Shahdol, Madhya Pradesh", "Sehore, Madhya Pradesh", "Seoni, Madhya Pradesh",
  "Singrauli, Madhya Pradesh", "Sarni, Madhya Pradesh", "Vidisha, Madhya Pradesh", "Khargone, Madhya Pradesh",
  "Khandwa, Madhya Pradesh", "Burhanpur, Madhya Pradesh", "Chhindwara, Madhya Pradesh", "Damoh, Madhya Pradesh",
  "Dewas, Madhya Pradesh", "Dhar, Madhya Pradesh", "Harda, Madhya Pradesh", "Jhabua, Madhya Pradesh",
  "Mandsaur, Madhya Pradesh", "Morena, Madhya Pradesh", "Narsinghpur, Madhya Pradesh", "Neemuch, Madhya Pradesh",
  "Panna, Madhya Pradesh", "Raisen, Madhya Pradesh", "Rajgarh, Madhya Pradesh", "Shajapur, Madhya Pradesh",
  "Tikamgarh, Madhya Pradesh", "Umaria, Madhya Pradesh",

  // Maharashtra
  "Mumbai, Maharashtra", "Pune, Maharashtra", "Nagpur, Maharashtra", "Nashik, Maharashtra", "Thane, Maharashtra",
  "Aurangabad, Maharashtra", "Solapur, Maharashtra", "Amravati, Maharashtra", "Kolhapur, Maharashtra", "Akola, Maharashtra",
  "Latur, Maharashtra", "Jalgaon, Maharashtra", "Jalna, Maharashtra", "Nanded, Maharashtra", "Sangli, Maharashtra",
  "Satara, Maharashtra", "Beed, Maharashtra", "Parbhani, Maharashtra", "Dhule, Maharashtra", "Gondia, Maharashtra",
  "Yavatmal, Maharashtra", "Ratnagiri, Maharashtra", "Raigad, Maharashtra", "Chandrapur, Maharashtra", "Wardha, Maharashtra",
  "Ahmednagar, Maharashtra", "Kalyan, Maharashtra", "Ulhasnagar, Maharashtra", "Ichalkaranji, Maharashtra",
  "Malegaon, Maharashtra", "Panvel, Maharashtra", "Karjat, Maharashtra", "Bhandara, Maharashtra", "Bhusawal, Maharashtra",
  "Shirdi, Maharashtra", "Pandharpur, Maharashtra", "Daund, Maharashtra", "Junnar, Maharashtra", "Kopargaon, Maharashtra",
  "Nandurbar, Maharashtra", "Washim, Maharashtra", "Osmanabad, Maharashtra", "Bhadravati, Maharashtra", "Udgir, Maharashtra",

  // Manipur
  "Imphal, Manipur", "Thoubal, Manipur", "Churachandpur, Manipur", "Moreh, Manipur", "Mayang Imphal, Manipur",
  "Ukhrul, Manipur", "Bishnupur, Manipur",

  // Meghalaya
  "Shillong, Meghalaya", "Tura, Meghalaya", "Nongpoh, Meghalaya", "Nongstoin, Meghalaya", "Williamnagar, Meghalaya",
  "Baghmara, Meghalaya",

  // Mizoram
  "Aizawl, Mizoram", "Lunglei, Mizoram", "Siaha, Mizoram", "Kolasib, Mizoram", "Champhai, Mizoram", "Lawngtlai, Mizoram",

  // Nagaland
  "Kohima, Nagaland", "Dimapur, Nagaland", "Tuensang, Nagaland", "Mokokchung, Nagaland", "Wokha, Nagaland",
  "Mon, Nagaland", "Zunheboto, Nagaland",

  // Odisha
  "Bhubaneswar, Odisha", "Cuttack, Odisha", "Rourkela, Odisha", "Berhampur, Odisha", "Puri, Odisha", "Balasore, Odisha",
  "Sambalpur, Odisha", "Koraput, Odisha", "Sundargarh, Odisha", "Jharsuguda, Odisha", "Baripada, Odisha", "Anugul, Odisha",
  "Baleshwar, Odisha", "Kendrapara, Odisha", "Dhenkanal, Odisha", "Bhadrak, Odisha", "Paradip, Odisha",
  "Jagatsinghpur, Odisha", "Bolangir, Odisha",

  // Punjab
  "Amritsar, Punjab", "Ludhiana, Punjab", "Jalandhar, Punjab", "Patiala, Punjab", "Bathinda, Punjab", "Mohali, Punjab",
  "Hoshiarpur, Punjab", "Faridkot, Punjab", "Fazilka, Punjab", "Pathankot, Punjab", "Moga, Punjab", "Kapurthala, Punjab",
  "Sangrur, Punjab", "Barnala, Punjab", "Phillaur, Punjab",

  // Rajasthan
  "Jaipur, Rajasthan", "Jodhpur, Rajasthan", "Udaipur, Rajasthan", "Kota, Rajasthan", "Bikaner, Rajasthan",
  "Ajmer, Rajasthan", "Alwar, Rajasthan", "Sikar, Rajasthan", "Bharatpur, Rajasthan", "Bhilwara, Rajasthan",
  "Pali, Rajasthan", "Sawai Madhopur, Rajasthan", "Chittorgarh, Rajasthan", "Jalore, Rajasthan", "Jaisalmer, Rajasthan",
  "Barmer, Rajasthan", "Dausa, Rajasthan", "Dungarpur, Rajasthan", "Hanumangarh, Rajasthan", "Karauli, Rajasthan",
  "Nagaur, Rajasthan", "Pratapgarh, Rajasthan", "Rajsamand, Rajasthan", "Sirohi, Rajasthan", "Tonk, Rajasthan",
  "Kotputli, Rajasthan", "Beawar, Rajasthan",

  // Sikkim
  "Gangtok, Sikkim", "Namchi, Sikkim", "Gyalshing, Sikkim", "Mangan, Sikkim", "Rangpo, Sikkim", "Melli, Sikkim",

  // Tamil Nadu
  "Chennai, Tamil Nadu", "Coimbatore, Tamil Nadu", "Madurai, Tamil Nadu", "Tiruchirappalli, Tamil Nadu", "Salem, Tamil Nadu",
  "Tirunelveli, Tamil Nadu", "Erode, Tamil Nadu", "Vellore, Tamil Nadu", "Thoothukudi, Tamil Nadu", "Dindigul, Tamil Nadu",
  "Ramanathapuram, Tamil Nadu", "Tiruppur, Tamil Nadu", "Kanchipuram, Tamil Nadu", "Kumbakonam, Tamil Nadu",
  "Nagapattinam, Tamil Nadu", "Cuddalore, Tamil Nadu", "Karaikudi, Tamil Nadu", "Sivakasi, Tamil Nadu", "Nagercoil, Tamil Nadu",
  "Tindivanam, Tamil Nadu", "Villupuram, Tamil Nadu", "Mayiladuthurai, Tamil Nadu", "Arakkonam, Tamil Nadu",
  "Ponneri, Tamil Nadu", "Thiruvallur, Tamil Nadu", "Perambalur, Tamil Nadu", "Tiruvarur, Tamil Nadu", "Tenkasi, Tamil Nadu",
  "Tiruvannamalai, Tamil Nadu",

  // Telangana
  "Hyderabad, Telangana", "Warangal, Telangana", "Nizamabad, Telangana", "Karimnagar, Telangana", "Khammam, Telangana",
  "Mahbubnagar, Telangana", "Adilabad, Telangana", "Ramagundam, Telangana", "Suryapet, Telangana", "Nalgonda, Telangana",
  "Medak, Telangana", "Bhongir, Telangana", "Kothagudem, Telangana", "Mancherial, Telangana", "Godavarikhani, Telangana",
  "Jagtial, Telangana", "Bhupalpally, Telangana",

  // Tripura
  "Agartala, Tripura", "Udaipur (Tripura), Tripura", "Dharmanagar, Tripura", "Kailashahar, Tripura", "Khowai, Tripura",
  "Belonia, Tripura",

  // Uttar Pradesh
  "Lucknow, Uttar Pradesh", "Kanpur, Uttar Pradesh", "Ghaziabad, Uttar Pradesh", "Agra, Uttar Pradesh", "Meerut, Uttar Pradesh",
  "Varanasi, Uttar Pradesh", "Prayagraj, Uttar Pradesh", "Aligarh, Uttar Pradesh", "Moradabad, Uttar Pradesh",
  "Bareilly, Uttar Pradesh", "Saharanpur, Uttar Pradesh", "Gorakhpur, Uttar Pradesh", "Jhansi, Uttar Pradesh",
  "Mathura, Uttar Pradesh", "Firozabad, Uttar Pradesh", "Noida, Uttar Pradesh", "Greater Noida, Uttar Pradesh",
  "Satna, Uttar Pradesh", "Azamgarh, Uttar Pradesh", "Ballia, Uttar Pradesh", "Budaun, Uttar Pradesh",
  "Bulandshahr, Uttar Pradesh", "Bijnor, Uttar Pradesh", "Etawah, Uttar Pradesh", "Farrukhabad, Uttar Pradesh",
  "Gonda, Uttar Pradesh", "Hardoi, Uttar Pradesh", "Hapur, Uttar Pradesh", "Hamirpur, Uttar Pradesh",
  "Kaushambi, Uttar Pradesh", "Kushinagar, Uttar Pradesh", "Lakhimpur Kheri, Uttar Pradesh", "Mahoba, Uttar Pradesh",
  "Mainpuri, Uttar Pradesh", "Mau, Uttar Pradesh", "Mirzapur, Uttar Pradesh", "Muzaffarnagar, Uttar Pradesh",
  "Pilibhit, Uttar Pradesh", "Raebareli, Uttar Pradesh", "Rampur, Uttar Pradesh", "Sambhal, Uttar Pradesh",
  "Shahjahanpur, Uttar Pradesh", "Shamli, Uttar Pradesh", "Sitapur, Uttar Pradesh", "Sonbhadra, Uttar Pradesh",
  "Sultanpur, Uttar Pradesh", "Unnao, Uttar Pradesh", "Bara Banki, Uttar Pradesh",

  // Uttarakhand
  "Dehradun, Uttarakhand", "Haridwar, Uttarakhand", "Roorkee, Uttarakhand", "Haldwani, Uttarakhand", "Nainital, Uttarakhand",
  "Rishikesh, Uttarakhand", "Almora, Uttarakhand", "Udham Singh Nagar, Uttarakhand", "Pithoragarh, Uttarakhand",
  "Kashipur, Uttarakhand", "Rudrapur, Uttarakhand", "Bageshwar, Uttarakhand", "Tehri, Uttarakhand", "Chamoli, Uttarakhand",

  // West Bengal
  "Kolkata, West Bengal", "Howrah, West Bengal", "Asansol, West Bengal", "Durgapur, West Bengal", "Siliguri, West Bengal",
  "Bardhaman, West Bengal", "Berhampore, West Bengal", "Haldia, West Bengal", "Kharagpur, West Bengal",
  "Krishnanagar, West Bengal", "Malda, West Bengal", "Midnapore, West Bengal", "Baranagar, West Bengal",
  "North 24 Parganas, West Bengal", "South 24 Parganas, West Bengal", "Barasat, West Bengal", "Srirampur, West Bengal",
  "Raiganj, West Bengal", "Cooch Behar, West Bengal", "Alipurduar, West Bengal", "Jalpaiguri, West Bengal",
  "Diamond Harbour, West Bengal", "Sankrail, West Bengal", "Tamluk, West Bengal", "Bankura, West Bengal",
  "Purulia, West Bengal", "Konnagar, West Bengal",

  // Union Territories
  "Port Blair, Andaman and Nicobar Islands", "Car Nicobar, Andaman and Nicobar Islands", "Diglipur, Andaman and Nicobar Islands",
  "Chandigarh, Chandigarh",
  "Dadra, Dadra and Nagar Haveli and Daman and Diu", "Silvassa, Dadra and Nagar Haveli and Daman and Diu",
  "Daman, Dadra and Nagar Haveli and Daman and Diu", "Diu, Dadra and Nagar Haveli and Daman and Diu",
  "Karanja, Dadra and Nagar Haveli and Daman and Diu",
  "Kavaratti, Lakshadweep", "Agatti, Lakshadweep", "Amini, Lakshadweep", "Minicoy, Lakshadweep",
  "New Delhi, Delhi", "Delhi, Delhi", "Central Delhi, Delhi", "North Delhi, Delhi", "East Delhi, Delhi",
  "South Delhi, Delhi", "West Delhi, Delhi", "North East Delhi, Delhi", "North West Delhi, Delhi", "Shahdara, Delhi",
  "Puducherry, Puducherry", "Karaikal, Puducherry", "Mahe, Puducherry", "Yanam, Puducherry",
  
  // Work arrangements
  "Remote", "Work from Home", "Hybrid"
]

function generateRandomJob(): JobTemplate {
  const baseJob = jobTemplates[Math.floor(Math.random() * jobTemplates.length)]
  
  // Randomly modify some aspects
  const companies = [...additionalCompanies, baseJob.company]
  const randomCompany = companies[Math.floor(Math.random() * companies.length)]
  const randomLocation = cities[Math.floor(Math.random() * cities.length)]
  
  // Add some salary variation
  const salaryMultiplier = 0.8 + Math.random() * 0.4 // 0.8 to 1.2
  
  return {
    ...baseJob,
    company: randomCompany,
    location: randomLocation,
    salary_min: baseJob.salary_min ? Math.floor(baseJob.salary_min * salaryMultiplier) : undefined,
    salary_max: baseJob.salary_max ? Math.floor(baseJob.salary_max * salaryMultiplier) : undefined,
  }
}

function generateSEOSlug(title: string, company: string, location: string): string {
  const cleanText = (text: string) => text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  
  const titleSlug = cleanText(title)
  const companySlug = cleanText(company)
  const locationSlug = cleanText(location)
  
  return `${titleSlug}-${companySlug}-${locationSlug}`.substring(0, 100)
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { count = 10 } = await req.json()
    
    console.log(`Generating ${count} realistic jobs...`)

    const jobsToInsert = []
    
    for (let i = 0; i < count; i++) {
      const jobData = generateRandomJob()
      
      const job = {
        title: jobData.title,
        description: jobData.description,
        company_name: jobData.company,
        location: jobData.location,
        salary_min: jobData.salary_min,
        salary_max: jobData.salary_max,
        salary_range: jobData.salary_min && jobData.salary_max 
          ? `₹${(jobData.salary_min/100000).toFixed(0)}-${(jobData.salary_max/100000).toFixed(0)} LPA`
          : 'Not disclosed',
        employment_type: jobData.employment_type,
        experience_level: jobData.experience_level,
        skills_required: jobData.skills,
        is_remote: Math.random() > 0.7, // 30% chance of remote
        is_featured: Math.random() > 0.9, // 10% chance of featured
        job_status: 'open',
        is_active: true,
        posted_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last week
        expires_at: new Date(Date.now() + (30 + Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(), // Expires in 30-60 days
        seo_slug: generateSEOSlug(jobData.title, jobData.company, jobData.location),
        views_count: Math.floor(Math.random() * 100),
        applications_count: Math.floor(Math.random() * 20),
        industry: jobData.industry,
        department: jobData.department,
        job_type: 'external',
        external_url: `https://careers.${jobData.company.toLowerCase().replace(/\s+/g, '')}.com/jobs/${Math.random().toString(36).substring(7)}`,
        posted_by: '00000000-0000-0000-0000-000000000000' // System user
      }
      
      jobsToInsert.push(job)
    }

    // Insert jobs in batches
    const { data, error } = await supabaseClient
      .from('jobs')
      .insert(jobsToInsert)
      .select('id, title, company_name')

    if (error) {
      console.error('Error inserting jobs:', error)
      throw error
    }

    console.log(`Successfully generated ${data?.length || 0} jobs`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully generated ${data?.length || 0} realistic jobs`,
        jobs: data
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in generate-realistic-jobs:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})