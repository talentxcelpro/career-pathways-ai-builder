/**
 * src/config/jobs/indianLocationsTaxonomy.ts
 *
 * TalentXcel 100 Indian Employment Centres Directory & Taxonomy
 * Covers Tier 1, Tier 2, Tier 3, Regional Employment Hubs, Industrial Clusters, IT Corridors, and Pan-India Remote.
 * Single Source of Truth for:
 * - City-level search filtering
 * - Location normalization & alias resolution
 * - Database backfill of location_city and location_state
 * - Controlled programmatic SEO city hubs
 */

export interface IndianCityDef {
  id: string;
  slug: string;
  name: string;
  state: string;
  region: 'North' | 'South' | 'East' | 'West' | 'Central' | 'North-East' | 'Pan-India';
  tier: 1 | 2 | 3;
  hubType: 'IT_TECH' | 'INDUSTRIAL_MFG' | 'COMMERCIAL_FINANCIAL' | 'EDUCATION_HEALTH' | 'GOVT_PSU' | 'REMOTE';
  aliases: string[];
  latitude?: number;
  longitude?: number;
}

export const INDIAN_100_EMPLOYMENT_CENTRES: readonly IndianCityDef[] = [
  // ─── TIER 1 METROPOLITAN & TECH HUBS (11) ───
  { id: 'bengaluru', slug: 'bengaluru', name: 'Bengaluru', state: 'Karnataka', region: 'South', tier: 1, hubType: 'IT_TECH', aliases: ['bangalore', 'bengaluru', 'whitefield', 'electronic city', 'koramangala', 'indiranagar', 'bellandur', 'manyata'], latitude: 12.9716, longitude: 77.5946 },
  { id: 'mumbai', slug: 'mumbai', name: 'Mumbai', state: 'Maharashtra', region: 'West', tier: 1, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['bombay', 'bkc', 'bandra', 'andheri', 'nariman point', 'worli', 'powai', 'malad'], latitude: 19.0760, longitude: 72.8777 },
  { id: 'delhi', slug: 'delhi', name: 'Delhi', state: 'Delhi', region: 'North', tier: 1, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['new delhi', 'delhi ncr', 'connaught place', 'south delhi', 'nehru place'], latitude: 28.6139, longitude: 77.2090 },
  { id: 'noida', slug: 'noida', name: 'Noida', state: 'Uttar Pradesh', region: 'North', tier: 1, hubType: 'IT_TECH', aliases: ['noida expressway', 'sector 62', 'sector 135', 'noida'], latitude: 28.5355, longitude: 77.3910 },
  { id: 'gurugram', slug: 'gurugram', name: 'Gurugram', state: 'Haryana', region: 'North', tier: 1, hubType: 'IT_TECH', aliases: ['gurgaon', 'gurugram', 'cyber city', 'dlf phase', 'golf course road', 'sohna road', 'udyog vihar'], latitude: 28.4595, longitude: 77.0266 },
  { id: 'hyderabad', slug: 'hyderabad', name: 'Hyderabad', state: 'Telangana', region: 'South', tier: 1, hubType: 'IT_TECH', aliases: ['hitec city', 'gachibowli', 'madhapur', 'kondapur', 'secunderabad', 'jubilee hills'], latitude: 17.3850, longitude: 78.4867 },
  { id: 'pune', slug: 'pune', name: 'Pune', state: 'Maharashtra', region: 'West', tier: 1, hubType: 'IT_TECH', aliases: ['hinjewadi', 'magarpatta', 'viman nagar', 'kharadi', 'baner', 'hadapsar', 'pcmc'], latitude: 18.5204, longitude: 73.8567 },
  { id: 'chennai', slug: 'chennai', name: 'Chennai', state: 'Tamil Nadu', region: 'South', tier: 1, hubType: 'IT_TECH', aliases: ['madras', 'omr', 'sholinganallur', 'guindy', 't nagar', 'tarmani', 'siruseri'], latitude: 13.0827, longitude: 80.2707 },
  { id: 'kolkata', slug: 'kolkata', name: 'Kolkata', state: 'West Bengal', region: 'East', tier: 1, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['calcutta', 'salt lake', 'sector v', 'new town', 'rajarhat', 'park street'], latitude: 22.5726, longitude: 88.3639 },
  { id: 'ahmedabad', slug: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat', region: 'West', tier: 1, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['ahmedabad', 'sg highway', 'prahlad nagar', 'sanand', 'gift city', 'gandhinagar'], latitude: 23.0225, longitude: 72.5714 },
  { id: 'navi-mumbai', slug: 'navi-mumbai', name: 'Navi Mumbai', state: 'Maharashtra', region: 'West', tier: 1, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['vashi', 'belapur', 'kharghar', 'airoli', 'mahape', 'taloja', 'turbhe'], latitude: 19.0330, longitude: 73.0297 },

  // ─── TIER 2 & INDUSTRIAL / IT GROWTH CENTRES ───
  // Northern Region
  { id: 'chandigarh', slug: 'chandigarh', name: 'Chandigarh', state: 'Punjab', region: 'North', tier: 2, hubType: 'IT_TECH', aliases: ['chandigarh tricity', 'panchkula'], latitude: 30.7333, longitude: 76.7794 },
  { id: 'mohali', slug: 'mohali', name: 'Mohali', state: 'Punjab', region: 'North', tier: 2, hubType: 'IT_TECH', aliases: ['sas nagar', 'phase 8 mohali', 'it city mohali'], latitude: 30.7046, longitude: 76.7179 },
  { id: 'lucknow', slug: 'lucknow', name: 'Lucknow', state: 'Uttar Pradesh', region: 'North', tier: 2, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['gomti nagar', 'hazratganj', 'alambagh', 'transport nagar'], latitude: 26.8467, longitude: 80.9462 },
  { id: 'kanpur', slug: 'kanpur', name: 'Kanpur', state: 'Uttar Pradesh', region: 'North', tier: 2, hubType: 'INDUSTRIAL_MFG', aliases: ['cawnpore', 'panki', 'raniya', 'fazalganj'], latitude: 26.4499, longitude: 80.3319 },
  { id: 'varanasi', slug: 'varanasi', name: 'Varanasi', state: 'Uttar Pradesh', region: 'North', tier: 2, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['banaras', 'kashi', 'ramnagar'], latitude: 25.3176, longitude: 82.9739 },
  { id: 'agra', slug: 'agra', name: 'Agra', state: 'Uttar Pradesh', region: 'North', tier: 2, hubType: 'INDUSTRIAL_MFG', aliases: ['sanjay place', 'sikandra'], latitude: 27.1767, longitude: 78.0081 },
  { id: 'prayagraj', slug: 'prayagraj', name: 'Prayagraj', state: 'Uttar Pradesh', region: 'North', tier: 2, hubType: 'GOVT_PSU', aliases: ['allahabad', 'civil lines prayagraj', 'naini'], latitude: 25.4358, longitude: 81.8463 },
  { id: 'meerut', slug: 'meerut', name: 'Meerut', state: 'Uttar Pradesh', region: 'North', tier: 2, hubType: 'INDUSTRIAL_MFG', aliases: ['modipuram', 'partapur'], latitude: 28.9845, longitude: 77.7064 },
  { id: 'ghaziabad', slug: 'ghaziabad', name: 'Ghaziabad', state: 'Uttar Pradesh', region: 'North', tier: 2, hubType: 'INDUSTRIAL_MFG', aliases: ['sahibabad', 'indirapuram', 'vaishali', 'kavi nagar'], latitude: 28.6692, longitude: 77.4538 },
  { id: 'greater-noida', slug: 'greater-noida', name: 'Greater Noida', state: 'Uttar Pradesh', region: 'North', tier: 2, hubType: 'IT_TECH', aliases: ['noida extension', 'greater noida west', 'yeida', 'knowledge park'], latitude: 28.4744, longitude: 77.5040 },
  { id: 'jaipur', slug: 'jaipur', name: 'Jaipur', state: 'Rajasthan', region: 'North', tier: 2, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['pink city', 'sitapura', 'malviya nagar jaipur', 'mansarovar', 'mahindra world city jaipur'], latitude: 26.9124, longitude: 75.7873 },
  { id: 'jodhpur', slug: 'jodhpur', name: 'Jodhpur', state: 'Rajasthan', region: 'North', tier: 2, hubType: 'INDUSTRIAL_MFG', aliases: ['marwar', 'boranada'], latitude: 26.2389, longitude: 73.0243 },
  { id: 'udaipur', slug: 'udaipur', name: 'Udaipur', state: 'Rajasthan', region: 'North', tier: 2, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['city of lakes', 'madri'], latitude: 24.5854, longitude: 73.7125 },
  { id: 'kota', slug: 'kota', name: 'Kota', state: 'Rajasthan', region: 'North', tier: 2, hubType: 'EDUCATION_HEALTH', aliases: ['indraprastha industrial area'], latitude: 25.2138, longitude: 75.8648 },
  { id: 'dehradun', slug: 'dehradun', name: 'Dehradun', state: 'Uttarakhand', region: 'North', tier: 2, hubType: 'EDUCATION_HEALTH', aliases: ['rajpur road', 'selakui', 'it park dehradun'], latitude: 30.3165, longitude: 78.0322 },
  { id: 'haridwar', slug: 'haridwar', name: 'Haridwar', state: 'Uttarakhand', region: 'North', tier: 2, hubType: 'INDUSTRIAL_MFG', aliases: ['sidcul haridwar', 'bhel haridwar'], latitude: 29.9457, longitude: 78.1642 },
  { id: 'ludhiana', slug: 'ludhiana', name: 'Ludhiana', state: 'Punjab', region: 'North', tier: 2, hubType: 'INDUSTRIAL_MFG', aliases: ['focal point ludhiana', 'industrial area ludhiana'], latitude: 30.9010, longitude: 75.8573 },
  { id: 'amritsar', slug: 'amritsar', name: 'Amritsar', state: 'Punjab', region: 'North', tier: 2, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['amritsar cantt'], latitude: 31.6340, longitude: 74.8723 },
  { id: 'jalandhar', slug: 'jalandhar', name: 'Jalandhar', state: 'Punjab', region: 'North', tier: 2, hubType: 'INDUSTRIAL_MFG', aliases: ['leather complex jalandhar'], latitude: 31.3260, longitude: 75.5762 },
  { id: 'faridabad', slug: 'faridabad', name: 'Faridabad', state: 'Haryana', region: 'North', tier: 2, hubType: 'INDUSTRIAL_MFG', aliases: ['ballabgarh', 'faridabad industrial'], latitude: 28.4089, longitude: 77.3178 },
  { id: 'panipat', slug: 'panipat', name: 'Panipat', state: 'Haryana', region: 'North', tier: 3, hubType: 'INDUSTRIAL_MFG', aliases: ['textile city', 'panipat refinery'], latitude: 29.3909, longitude: 76.9635 },
  { id: 'jammu', slug: 'jammu', name: 'Jammu', state: 'Jammu and Kashmir', region: 'North', tier: 2, hubType: 'GOVT_PSU', aliases: ['bari brahmana', 'gangyal'], latitude: 32.7266, longitude: 74.8570 },
  { id: 'srinagar', slug: 'srinagar', name: 'Srinagar', state: 'Jammu and Kashmir', region: 'North', tier: 2, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['lal chowk', 'rangreth', 'sanat nagar'], latitude: 34.0837, longitude: 74.7973 },
  { id: 'shimla', slug: 'shimla', name: 'Shimla', state: 'Himachal Pradesh', region: 'North', tier: 3, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['simla'], latitude: 31.1048, longitude: 77.1734 },
  { id: 'baddi', slug: 'baddi', name: 'Baddi', state: 'Himachal Pradesh', region: 'North', tier: 3, hubType: 'INDUSTRIAL_MFG', aliases: ['baddi barotiwala nalagarh', 'bbn'], latitude: 30.9578, longitude: 76.7914 },

  // Southern Region
  { id: 'coimbatore', slug: 'coimbatore', name: 'Coimbatore', state: 'Tamil Nadu', region: 'South', tier: 2, hubType: 'INDUSTRIAL_MFG', aliases: ['kovai', 'tidel park coimbatore', 'peelamedu', 'saravanampatti'], latitude: 11.0168, longitude: 76.9558 },
  { id: 'kochi', slug: 'kochi', name: 'Kochi', state: 'Kerala', region: 'South', tier: 2, hubType: 'IT_TECH', aliases: ['cochin', 'infopark', 'kakkanad', 'ernakulam'], latitude: 9.9312, longitude: 76.2673 },
  { id: 'thiruvananthapuram', slug: 'thiruvananthapuram', name: 'Thiruvananthapuram', state: 'Kerala', region: 'South', tier: 2, hubType: 'IT_TECH', aliases: ['trivandrum', 'technopark', 'kazhakoottam'], latitude: 8.5241, longitude: 76.9366 },
  { id: 'kozhikode', slug: 'kozhikode', name: 'Kozhikode', state: 'Kerala', region: 'South', tier: 2, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['calicut', 'cyberpark calicut'], latitude: 11.2588, longitude: 75.7804 },
  { id: 'thrissur', slug: 'thrissur', name: 'Thrissur', state: 'Kerala', region: 'South', tier: 3, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['trichur'], latitude: 10.5276, longitude: 76.2144 },
  { id: 'madurai', slug: 'madurai', name: 'Madurai', state: 'Tamil Nadu', region: 'South', tier: 2, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['vadapalanji', 'elcot madurai'], latitude: 9.9252, longitude: 78.1198 },
  { id: 'tiruchirappalli', slug: 'tiruchirappalli', name: 'Tiruchirappalli', state: 'Tamil Nadu', region: 'South', tier: 2, hubType: 'INDUSTRIAL_MFG', aliases: ['trichy', 'bhel trichy', 'elcot trichy'], latitude: 10.7905, longitude: 78.7047 },
  { id: 'salem', slug: 'salem', name: 'Salem', state: 'Tamil Nadu', region: 'South', tier: 2, hubType: 'INDUSTRIAL_MFG', aliases: ['steel plant salem', 'elcot salem'], latitude: 11.6643, longitude: 78.1460 },
  { id: 'tirunelveli', slug: 'tirunelveli', name: 'Tirunelveli', state: 'Tamil Nadu', region: 'South', tier: 3, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['nellai', 'gangaikondan'], latitude: 8.7139, longitude: 77.7567 },
  { id: 'mysuru', slug: 'mysuru', name: 'Mysuru', state: 'Karnataka', region: 'South', tier: 2, hubType: 'IT_TECH', aliases: ['mysore', 'hebbal mysore', 'infosys mysore'], latitude: 12.2958, longitude: 76.6394 },
  { id: 'mangaluru', slug: 'mangaluru', name: 'Mangaluru', state: 'Karnataka', region: 'South', tier: 2, hubType: 'IT_TECH', aliases: ['mangalore', 'mrpl', 'derlakatte', 'baikampady'], latitude: 12.9141, longitude: 74.8560 },
  { id: 'hubballi-dharwad', slug: 'hubballi-dharwad', name: 'Hubballi-Dharwad', state: 'Karnataka', region: 'South', tier: 2, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['hubli', 'dharwad', 'aryabhata tech park'], latitude: 15.3647, longitude: 75.1240 },
  { id: 'belagavi', slug: 'belagavi', name: 'Belagavi', state: 'Karnataka', region: 'South', tier: 3, hubType: 'INDUSTRIAL_MFG', aliases: ['belgaum', 'aequs sez'], latitude: 15.8497, longitude: 74.4977 },
  { id: 'visakhapatnam', slug: 'visakhapatnam', name: 'Visakhapatnam', state: 'Andhra Pradesh', region: 'South', tier: 2, hubType: 'INDUSTRIAL_MFG', aliases: ['vizag', 'waltair', 'gajuwaka', 'autonagar vizag', 'madhurawada'], latitude: 17.6868, longitude: 83.2185 },
  { id: 'vijayawada', slug: 'vijayawada', name: 'Vijayawada', state: 'Andhra Pradesh', region: 'South', tier: 2, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['amaravati', 'kanchuru', 'autonagar vijayawada'], latitude: 16.5062, longitude: 80.6480 },
  { id: 'guntur', slug: 'guntur', name: 'Guntur', state: 'Andhra Pradesh', region: 'South', tier: 2, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['guntur city', 'tenali'], latitude: 16.3067, longitude: 80.4365 },
  { id: 'tirupati', slug: 'tirupati', name: 'Tirupati', state: 'Andhra Pradesh', region: 'South', tier: 2, hubType: 'EDUCATION_HEALTH', aliases: ['renigunta', 'sri city'], latitude: 13.6288, longitude: 79.4192 },
  { id: 'warangal', slug: 'warangal', name: 'Warangal', state: 'Telangana', region: 'South', tier: 3, hubType: 'EDUCATION_HEALTH', aliases: ['kazipet', 'hanamkonda'], latitude: 17.9689, longitude: 79.5941 },

  // Western Region
  { id: 'thane', slug: 'thane', name: 'Thane', state: 'Maharashtra', region: 'West', tier: 1, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['ghodbunder', 'wagle estate', 'thane west'], latitude: 19.2183, longitude: 72.9781 },
  { id: 'nagpur', slug: 'nagpur', name: 'Nagpur', state: 'Maharashtra', region: 'West', tier: 2, hubType: 'LOGISTICS', aliases: ['mihan nagpur', 'butibori', 'orange city'], latitude: 21.1458, longitude: 79.0882 },
  { id: 'nashik', slug: 'nashik', name: 'Nashik', state: 'Maharashtra', region: 'West', tier: 2, hubType: 'INDUSTRIAL_MFG', aliases: ['nasik', 'satpur', 'ambad'], latitude: 19.9975, longitude: 73.7898 },
  { id: 'aurangabad', slug: 'aurangabad', name: 'Chhatrapati Sambhajinagar', state: 'Maharashtra', region: 'West', tier: 2, hubType: 'INDUSTRIAL_MFG', aliases: ['aurangabad', 'shendra midc', 'waluj midc', 'auric city'], latitude: 19.8762, longitude: 75.3433 },
  { id: 'solapur', slug: 'solapur', name: 'Solapur', state: 'Maharashtra', region: 'West', tier: 3, hubType: 'INDUSTRIAL_MFG', aliases: ['sholapur', 'chiddarwar'], latitude: 17.6599, longitude: 75.9064 },
  { id: 'kolhapur', slug: 'kolhapur', name: 'Kolhapur', state: 'Maharashtra', region: 'West', tier: 3, hubType: 'INDUSTRIAL_MFG', aliases: ['shiroli midc', 'gokul shirgaon'], latitude: 16.7050, longitude: 74.2433 },
  { id: 'surat', slug: 'surat', name: 'Surat', state: 'Gujarat', region: 'West', tier: 2, hubType: 'INDUSTRIAL_MFG', aliases: ['diamond city', 'hazira', 'sachin midc'], latitude: 21.1702, longitude: 72.8311 },
  { id: 'vadodara', slug: 'vadodara', name: 'Vadodara', state: 'Gujarat', region: 'West', tier: 2, hubType: 'INDUSTRIAL_MFG', aliases: ['baroda', 'makarpura', 'nandesari'], latitude: 22.3072, longitude: 73.1812 },
  { id: 'rajkot', slug: 'rajkot', name: 'Rajkot', state: 'Gujarat', region: 'West', tier: 2, hubType: 'INDUSTRIAL_MFG', aliases: ['metoda gidc', 'shapar veranda'], latitude: 22.3039, longitude: 70.8022 },
  { id: 'gandhinagar', slug: 'gandhinagar', name: 'Gandhinagar', state: 'Gujarat', region: 'West', tier: 2, hubType: 'IT_TECH', aliases: ['gift city gandhinagar', 'infocity gandhinagar'], latitude: 23.2156, longitude: 72.6369 },
  { id: 'panaji', slug: 'panaji', name: 'Panaji', state: 'Goa', region: 'West', tier: 3, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['panjim', 'edc patto', 'porvorim'], latitude: 15.4909, longitude: 73.8278 },
  { id: 'margao', slug: 'margao', name: 'Margao', state: 'Goa', region: 'West', tier: 3, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['madgaon', 'verna industrial estate'], latitude: 15.2832, longitude: 73.9862 },

  // Central Region
  { id: 'indore', slug: 'indore', name: 'Indore', state: 'Madhya Pradesh', region: 'Central', tier: 2, hubType: 'IT_TECH', aliases: ['crystal it park', 'super corridor indore', 'pithampur', 'vijay nagar indore'], latitude: 22.7196, longitude: 75.8577 },
  { id: 'bhopal', slug: 'bhopal', name: 'Bhopal', state: 'Madhya Pradesh', region: 'Central', tier: 2, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['mandideep', 'mp nagar bhopal', 'govindpura'], latitude: 23.2599, longitude: 77.4126 },
  { id: 'gwalior', slug: 'gwalior', name: 'Gwalior', state: 'Madhya Pradesh', region: 'Central', tier: 2, hubType: 'INDUSTRIAL_MFG', aliases: ['malanpur', 'maharajpura'], latitude: 26.2183, longitude: 78.1828 },
  { id: 'jabalpur', slug: 'jabalpur', name: 'Jabalpur', state: 'Madhya Pradesh', region: 'Central', tier: 2, hubType: 'INDUSTRIAL_MFG', aliases: ['ordnance factory jabalpur', 'richhai'], latitude: 23.1815, longitude: 79.9864 },
  { id: 'raipur', slug: 'raipur', name: 'Raipur', state: 'Chhattisgarh', region: 'Central', tier: 2, hubType: 'INDUSTRIAL_MFG', aliases: ['naya raipur', 'urla industrial area', 'atala'], latitude: 21.2514, longitude: 81.6296 },
  { id: 'bhilai', slug: 'bhilai', name: 'Bhilai', state: 'Chhattisgarh', region: 'Central', tier: 2, hubType: 'INDUSTRIAL_MFG', aliases: ['durg', 'bhilai steel plant'], latitude: 21.2121, longitude: 81.3733 },

  // Eastern Region
  { id: 'patna', slug: 'patna', name: 'Patna', state: 'Bihar', region: 'East', tier: 2, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['patliputra', 'bailey road', 'digha', 'fatwah'], latitude: 25.5941, longitude: 85.1376 },
  { id: 'gaya', slug: 'gaya', name: 'Gaya', state: 'Bihar', region: 'East', tier: 3, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['bodh gaya'], latitude: 24.7914, longitude: 85.0002 },
  { id: 'muzaffarpur', slug: 'muzaffarpur', name: 'Muzaffarpur', state: 'Bihar', region: 'East', tier: 3, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['bela industrial area'], latitude: 26.1209, longitude: 85.3647 },
  { id: 'ranchi', slug: 'ranchi', name: 'Ranchi', state: 'Jharkhand', region: 'East', tier: 2, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['hec ranchi', 'namkum', 'tupudana'], latitude: 23.3441, longitude: 85.3096 },
  { id: 'jamshedpur', slug: 'jamshedpur', name: 'Jamshedpur', state: 'Jharkhand', region: 'East', tier: 2, hubType: 'INDUSTRIAL_MFG', aliases: ['tatanagar', 'adityapur industrial area', 'bistupur'], latitude: 22.8046, longitude: 86.2029 },
  { id: 'dhanbad', slug: 'dhanbad', name: 'Dhanbad', state: 'Jharkhand', region: 'East', tier: 2, hubType: 'INDUSTRIAL_MFG', aliases: ['coal capital', 'bccl', 'ism dhanbad'], latitude: 23.7957, longitude: 86.4304 },
  { id: 'bokaro', slug: 'bokaro', name: 'Bokaro Steel City', state: 'Jharkhand', region: 'East', tier: 2, hubType: 'INDUSTRIAL_MFG', aliases: ['bokaro', 'bsl bokaro'], latitude: 23.6693, longitude: 86.1511 },
  { id: 'bhubaneswar', slug: 'bhubaneswar', name: 'Bhubaneswar', state: 'Odisha', region: 'East', tier: 2, hubType: 'IT_TECH', aliases: ['infocity bhubaneswar', 'chandaka', 'mancheswar'], latitude: 20.2961, longitude: 85.8245 },
  { id: 'cuttack', slug: 'cuttack', name: 'Cuttack', state: 'Odisha', region: 'East', tier: 2, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['choudwar', 'jagatpur'], latitude: 20.4625, longitude: 85.8828 },
  { id: 'rourkela', slug: 'rourkela', name: 'Rourkela', state: 'Odisha', region: 'East', tier: 2, hubType: 'INDUSTRIAL_MFG', aliases: ['rourkela steel plant', 'kalunga industrial'], latitude: 22.2604, longitude: 84.8536 },
  { id: 'siliguri', slug: 'siliguri', name: 'Siliguri', state: 'West Bengal', region: 'East', tier: 2, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['matigara', 'jalpaiguri gateway'], latitude: 26.7271, longitude: 88.3953 },
  { id: 'durgapur', slug: 'durgapur', name: 'Durgapur', state: 'West Bengal', region: 'East', tier: 2, hubType: 'INDUSTRIAL_MFG', aliases: ['durgapur steel', 'city centre durgapur'], latitude: 23.5204, longitude: 87.3119 },
  { id: 'asansol', slug: 'asansol', name: 'Asansol', state: 'West Bengal', region: 'East', tier: 2, hubType: 'INDUSTRIAL_MFG', aliases: ['burnpur', 'raniganj'], latitude: 23.6739, longitude: 86.9524 },

  // North-Eastern Region
  { id: 'guwahati', slug: 'guwahati', name: 'Guwahati', state: 'Assam', region: 'North-East', tier: 2, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['dispur', 'gs road', 'panbazar', 'north guwahati tech city'], latitude: 26.1445, longitude: 91.7362 },
  { id: 'silchar', slug: 'silchar', name: 'Silchar', state: 'Assam', region: 'North-East', tier: 3, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['barak valley'], latitude: 24.8170, longitude: 92.7985 },
  { id: 'dibrugarh', slug: 'dibrugarh', name: 'Dibrugarh', state: 'Assam', region: 'North-East', tier: 3, hubType: 'INDUSTRIAL_MFG', aliases: ['oil hub dibrugarh'], latitude: 27.4728, longitude: 94.9120 },
  { id: 'agartala', slug: 'agartala', name: 'Agartala', state: 'Tripura', region: 'North-East', tier: 3, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['bodhjungnagar'], latitude: 23.8315, longitude: 91.2868 },
  { id: 'shillong', slug: 'shillong', name: 'Shillong', state: 'Meghalaya', region: 'North-East', tier: 3, hubType: 'EDUCATION_HEALTH', aliases: ['new shillong township'], latitude: 25.5788, longitude: 91.8933 },
  { id: 'imphal', slug: 'imphal', name: 'Imphal', state: 'Manipur', region: 'North-East', tier: 3, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['manipur it sez'], latitude: 24.8170, longitude: 93.9368 },
  { id: 'aizawl', slug: 'aizawl', name: 'Aizawl', state: 'Mizoram', region: 'North-East', tier: 3, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['mizoram capital'], latitude: 23.7271, longitude: 92.7176 },
  { id: 'dimapur', slug: 'dimapur', name: 'Dimapur', state: 'Nagaland', region: 'North-East', tier: 3, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['commercial hub nagaland'], latitude: 25.9090, longitude: 93.7266 },
  { id: 'gangtok', slug: 'gangtok', name: 'Gangtok', state: 'Sikkim', region: 'North-East', tier: 3, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['sikkim capital'], latitude: 27.3389, longitude: 88.6065 },
  { id: 'itanagar', slug: 'itanagar', name: 'Itanagar', state: 'Arunachal Pradesh', region: 'North-East', tier: 3, hubType: 'GOVT_PSU', aliases: ['naharlagun'], latitude: 27.0844, longitude: 93.6053 },

  // Additional Strategic Hubs (Tier 2/3 Industrial & Smart Cities)
  { id: 'bareilly', slug: 'bareilly', name: 'Bareilly', state: 'Uttar Pradesh', region: 'North', tier: 3, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['bareilly cantt'], latitude: 28.3670, longitude: 79.4304 },
  { id: 'aligarh', slug: 'aligarh', name: 'Aligarh', state: 'Uttar Pradesh', region: 'North', tier: 3, hubType: 'INDUSTRIAL_MFG', aliases: ['tala nagari'], latitude: 27.8974, longitude: 78.0880 },
  { id: 'moradabad', slug: 'moradabad', name: 'Moradabad', state: 'Uttar Pradesh', region: 'North', tier: 3, hubType: 'INDUSTRIAL_MFG', aliases: ['brass city'], latitude: 28.8386, longitude: 78.7733 },
  { id: 'gorakhpur', slug: 'gorakhpur', name: 'Gorakhpur', state: 'Uttar Pradesh', region: 'North', tier: 2, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['gida gorakhpur'], latitude: 26.7606, longitude: 83.3732 },
  { id: 'jhansi', slug: 'jhansi', name: 'Jhansi', state: 'Uttar Pradesh', region: 'North', tier: 3, hubType: 'INDUSTRIAL_MFG', aliases: ['bundelkhand industrial'], latitude: 25.4484, longitude: 78.5685 },
  { id: 'ayodhya', slug: 'ayodhya', name: 'Ayodhya', state: 'Uttar Pradesh', region: 'North', tier: 2, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['faizabad'], latitude: 26.7922, longitude: 82.1998 },
  { id: 'saharanpur', slug: 'saharanpur', name: 'Saharanpur', state: 'Uttar Pradesh', region: 'North', tier: 3, hubType: 'INDUSTRIAL_MFG', aliases: ['wood carving hub'], latitude: 29.9678, longitude: 77.5510 },
  { id: 'firozabad', slug: 'firozabad', name: 'Firozabad', state: 'Uttar Pradesh', region: 'North', tier: 3, hubType: 'INDUSTRIAL_MFG', aliases: ['glass city'], latitude: 27.1593, longitude: 78.3957 },
  { id: 'mathura', slug: 'mathura', name: 'Mathura', state: 'Uttar Pradesh', region: 'North', tier: 3, hubType: 'INDUSTRIAL_MFG', aliases: ['mathura refinery', 'vrindavan'], latitude: 27.4924, longitude: 77.6737 },
  { id: 'patiala', slug: 'patiala', name: 'Patiala', state: 'Punjab', region: 'North', tier: 3, hubType: 'EDUCATION_HEALTH', aliases: ['patiala industrial'], latitude: 30.3398, longitude: 76.3869 },
  { id: 'bathinda', slug: 'bathinda', name: 'Bathinda', state: 'Punjab', region: 'North', tier: 3, hubType: 'INDUSTRIAL_MFG', aliases: ['bathinda refinery'], latitude: 30.2110, longitude: 74.9455 },
  { id: 'rohtak', slug: 'rohtak', name: 'Rohtak', state: 'Haryana', region: 'North', tier: 3, hubType: 'INDUSTRIAL_MFG', aliases: ['rohtak imt'], latitude: 28.8955, longitude: 76.6066 },
  { id: 'hisar', slug: 'hisar', name: 'Hisar', state: 'Haryana', region: 'North', tier: 3, hubType: 'INDUSTRIAL_MFG', aliases: ['jindal steel hisar'], latitude: 29.1492, longitude: 75.7217 },
  { id: 'karnal', slug: 'karnal', name: 'Karnal', state: 'Haryana', region: 'North', tier: 3, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['rice bowl'], latitude: 29.6857, longitude: 76.9905 },
  { id: 'sonipat', slug: 'sonipat', name: 'Sonipat', state: 'Haryana', region: 'North', tier: 3, hubType: 'INDUSTRIAL_MFG', aliases: ['kundli', 'rai industrial area'], latitude: 28.9931, longitude: 77.0151 },
  { id: 'alwar', slug: 'alwar', name: 'Alwar', state: 'Rajasthan', region: 'North', tier: 3, hubType: 'INDUSTRIAL_MFG', aliases: ['bhiwadi', 'neemrana', 'matsya industrial'], latitude: 27.5530, longitude: 76.6346 },
  { id: 'bikaner', slug: 'bikaner', name: 'Bikaner', state: 'Rajasthan', region: 'North', tier: 3, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['bichhwal industrial'], latitude: 28.0229, longitude: 73.3119 },
  { id: 'ajmer', slug: 'ajmer', name: 'Ajmer', state: 'Rajasthan', region: 'North', tier: 3, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['kishangarh marble'], latitude: 26.4499, longitude: 74.6399 },
  { id: 'puducherry', slug: 'puducherry', name: 'Puducherry', state: 'Puducherry', region: 'South', tier: 3, hubType: 'COMMERCIAL_FINANCIAL', aliases: ['pondicherry', 'auroville'], latitude: 11.9416, longitude: 79.8083 },

  // ─── PAN-INDIA REMOTE ───
  { id: 'remote-india', slug: 'remote', name: 'Remote, India', state: 'All India', region: 'Pan-India', tier: 1, hubType: 'REMOTE', aliases: ['remote', 'work from home', 'wfh', 'pan-india', 'all india', 'nationwide', 'telecommute', 'anywhere in india', 'remote india'] }
] as const;

const CITY_LOOKUP_MAP = new Map<string, IndianCityDef>();
const ALIAS_LOOKUP_MAP = new Map<string, IndianCityDef>();

for (const city of INDIAN_100_EMPLOYMENT_CENTRES) {
  CITY_LOOKUP_MAP.set(city.slug, city);
  CITY_LOOKUP_MAP.set(city.name.toLowerCase(), city);
  for (const alias of city.aliases) {
    ALIAS_LOOKUP_MAP.set(alias.toLowerCase(), city);
  }
}

/**
 * Resolves any freeform location string into a canonical Indian employment centre.
 */
export function resolveIndianCity(rawLocation?: string | null): IndianCityDef | undefined {
  if (!rawLocation) return undefined;
  const raw = rawLocation.toLowerCase().trim();

  // 1. Direct match on slug or name
  if (CITY_LOOKUP_MAP.has(raw)) {
    return CITY_LOOKUP_MAP.get(raw);
  }

  // 2. Direct match on alias
  if (ALIAS_LOOKUP_MAP.has(raw)) {
    return ALIAS_LOOKUP_MAP.get(raw);
  }

  // 3. Substring check on aliases (longest alias first)
  const sortedAliases = Array.from(ALIAS_LOOKUP_MAP.keys()).sort((a, b) => b.length - a.length);
  for (const alias of sortedAliases) {
    if (raw.includes(alias)) {
      return ALIAS_LOOKUP_MAP.get(alias);
    }
  }

  // 4. Substring check on city names
  for (const city of INDIAN_100_EMPLOYMENT_CENTRES) {
    if (raw.includes(city.name.toLowerCase())) {
      return city;
    }
  }

  return undefined;
}

export function getAllIndianEmploymentCentres(): readonly IndianCityDef[] {
  return INDIAN_100_EMPLOYMENT_CENTRES;
}

export function getIndianCityBySlug(slug: string): IndianCityDef | undefined {
  if (!slug) return undefined;
  return CITY_LOOKUP_MAP.get(slug.toLowerCase().trim());
}
