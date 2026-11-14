import { getSupabaseAdminClient } from './ingest-ats-jobs';

export const EXPANDED_CITIES = [
  // Tier 1 Metro Hubs
  { slug: 'mumbai', name: 'Mumbai', state: 'Maharashtra', tier: 1, latitude: 19.0760, longitude: 72.8777 },
  { slug: 'bangalore', name: 'Bangalore', state: 'Karnataka', tier: 1, latitude: 12.9716, longitude: 77.5946 },
  { slug: 'hyderabad', name: 'Hyderabad', state: 'Telangana', tier: 1, latitude: 17.3850, longitude: 78.4867 },
  { slug: 'noida', name: 'Noida', state: 'Uttar Pradesh', tier: 1, latitude: 28.5355, longitude: 77.3910 },
  { slug: 'pune', name: 'Pune', state: 'Maharashtra', tier: 1, latitude: 18.5204, longitude: 73.8567 },
  { slug: 'gurgaon', name: 'Gurgaon', state: 'Haryana', tier: 1, latitude: 28.4595, longitude: 77.0266 },
  { slug: 'gurugram', name: 'Gurugram', state: 'Haryana', tier: 1, latitude: 28.4595, longitude: 77.0266 },
  { slug: 'chennai', name: 'Chennai', state: 'Tamil Nadu', tier: 1, latitude: 13.0827, longitude: 80.2707 },
  { slug: 'delhi', name: 'Delhi', state: 'Delhi NCR', tier: 1, latitude: 28.7041, longitude: 77.1025 },
  { slug: 'kolkata', name: 'Kolkata', state: 'West Bengal', tier: 1, latitude: 22.5726, longitude: 88.3639 },
  { slug: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat', tier: 1, latitude: 23.0225, longitude: 72.5714 },
  { slug: 'remote', name: 'Remote, India', state: 'Pan India', tier: 1, latitude: 20.5937, longitude: 78.9629 },
  { slug: 'pan-india', name: 'Pan India', state: 'Pan India', tier: 1, latitude: 20.5937, longitude: 78.9629 },

  // Tier 2 Emerging Tech & Industrial Hubs
  { slug: 'jaipur', name: 'Jaipur', state: 'Rajasthan', tier: 2, latitude: 26.9124, longitude: 75.7873 },
  { slug: 'chandigarh', name: 'Chandigarh', state: 'Chandigarh', tier: 2, latitude: 30.7333, longitude: 76.7794 },
  { slug: 'bhopal', name: 'Bhopal', state: 'Madhya Pradesh', tier: 2, latitude: 23.2599, longitude: 77.4126 },
  { slug: 'indore', name: 'Indore', state: 'Madhya Pradesh', tier: 2, latitude: 22.7196, longitude: 75.8577 },
  { slug: 'patna', name: 'Patna', state: 'Bihar', tier: 2, latitude: 25.5941, longitude: 85.1376 },
  { slug: 'lucknow', name: 'Lucknow', state: 'Uttar Pradesh', tier: 2, latitude: 26.8467, longitude: 80.9462 },
  { slug: 'varanasi', name: 'Varanasi', state: 'Uttar Pradesh', tier: 2, latitude: 25.3176, longitude: 82.9739 },
  { slug: 'bhubaneswar', name: 'Bhubaneswar', state: 'Odisha', tier: 2, latitude: 20.2961, longitude: 85.8245 },
  { slug: 'kochi', name: 'Kochi', state: 'Kerala', tier: 2, latitude: 9.9312, longitude: 76.2673 },
  { slug: 'surat', name: 'Surat', state: 'Gujarat', tier: 2, latitude: 21.1702, longitude: 72.8311 },
  { slug: 'coimbatore', name: 'Coimbatore', state: 'Tamil Nadu', tier: 2, latitude: 11.0168, longitude: 76.9558 },
  { slug: 'visakhapatnam', name: 'Visakhapatnam', state: 'Andhra Pradesh', tier: 2, latitude: 17.6868, longitude: 83.2185 },
  { slug: 'nagpur', name: 'Nagpur', state: 'Maharashtra', tier: 2, latitude: 21.1458, longitude: 79.0882 },
  { slug: 'kanpur', name: 'Kanpur', state: 'Uttar Pradesh', tier: 2, latitude: 26.4499, longitude: 80.3319 },
  { slug: 'dhanbad', name: 'Dhanbad', state: 'Jharkhand', tier: 2, latitude: 23.7957, longitude: 86.4304 },
  { slug: 'bilaspur', name: 'Bilaspur', state: 'Chhattisgarh', tier: 2, latitude: 22.0797, longitude: 82.1409 },
  { slug: 'aurangabad', name: 'Aurangabad', state: 'Maharashtra', tier: 2, latitude: 19.8762, longitude: 75.3433 },
  { slug: 'jamshedpur', name: 'Jamshedpur', state: 'Jharkhand', tier: 2, latitude: 22.8046, longitude: 86.2029 },
  { slug: 'vadodara', name: 'Vadodara', state: 'Gujarat', tier: 2, latitude: 22.3072, longitude: 73.1812 },
  { slug: 'nashik', name: 'Nashik', state: 'Maharashtra', tier: 2, latitude: 19.9975, longitude: 73.7898 },
  { slug: 'amravati', name: 'Amravati', state: 'Maharashtra', tier: 2, latitude: 20.9320, longitude: 77.7523 },
  { slug: 'kota', name: 'Kota', state: 'Rajasthan', tier: 2, latitude: 25.2138, longitude: 75.8648 },
  { slug: 'jammu', name: 'Jammu', state: 'Jammu & Kashmir', tier: 2, latitude: 32.7266, longitude: 74.8570 },
  { slug: 'guwahati', name: 'Guwahati', state: 'Assam', tier: 2, latitude: 26.1445, longitude: 91.7362 },
  { slug: 'hubli', name: 'Hubli', state: 'Karnataka', tier: 2, latitude: 15.3647, longitude: 75.1240 },
  { slug: 'dehradun', name: 'Dehradun', state: 'Uttarakhand', tier: 2, latitude: 30.3165, longitude: 78.0322 },
  { slug: 'srinagar', name: 'Srinagar', state: 'Jammu & Kashmir', tier: 2, latitude: 34.0837, longitude: 74.7973 },
  { slug: 'mysuru', name: 'Mysuru', state: 'Karnataka', tier: 2, latitude: 12.2958, longitude: 76.6394 },
  { slug: 'solapur', name: 'Solapur', state: 'Maharashtra', tier: 2, latitude: 17.6599, longitude: 75.9064 },
  { slug: 'kolhapur', name: 'Kolhapur', state: 'Maharashtra', tier: 2, latitude: 16.7050, longitude: 74.2433 },
  { slug: 'gwalior', name: 'Gwalior', state: 'Madhya Pradesh', tier: 2, latitude: 26.2183, longitude: 78.1828 },
  { slug: 'jabalpur', name: 'Jabalpur', state: 'Madhya Pradesh', tier: 2, latitude: 23.1815, longitude: 79.9864 },
  { slug: 'jodhpur', name: 'Jodhpur', state: 'Rajasthan', tier: 2, latitude: 26.2389, longitude: 73.0243 },
  { slug: 'udaipur', name: 'Udaipur', state: 'Rajasthan', tier: 2, latitude: 24.5854, longitude: 73.7125 },
  { slug: 'haridwar', name: 'Haridwar', state: 'Uttarakhand', tier: 2, latitude: 29.9457, longitude: 78.1642 },
  { slug: 'calicut', name: 'Calicut', state: 'Kerala', tier: 2, latitude: 11.2588, longitude: 75.7804 },
  { slug: 'ranchi', name: 'Ranchi', state: 'Jharkhand', tier: 2, latitude: 23.3441, longitude: 85.3096 },
  { slug: 'aligarh', name: 'Aligarh', state: 'Uttar Pradesh', tier: 2, latitude: 27.8974, longitude: 78.0880 },
  { slug: 'raipur', name: 'Raipur', state: 'Chhattisgarh', tier: 2, latitude: 21.2514, longitude: 81.6296 },
  { slug: 'mangalore', name: 'Mangalore', state: 'Karnataka', tier: 2, latitude: 12.9141, longitude: 74.8560 },
  { slug: 'belgaum', name: 'Belgaum', state: 'Karnataka', tier: 2, latitude: 15.8497, longitude: 74.4977 },
  { slug: 'tiruchirappalli', name: 'Tiruchirappalli', state: 'Tamil Nadu', tier: 2, latitude: 10.7905, longitude: 78.7047 },
  { slug: 'salem', name: 'Salem', state: 'Tamil Nadu', tier: 2, latitude: 11.6643, longitude: 78.1460 },
  { slug: 'vellore', name: 'Vellore', state: 'Tamil Nadu', tier: 2, latitude: 12.9165, longitude: 79.1325 },
  { slug: 'vijayawada', name: 'Vijayawada', state: 'Andhra Pradesh', tier: 2, latitude: 16.5062, longitude: 80.6480 },
  { slug: 'guntur', name: 'Guntur', state: 'Andhra Pradesh', tier: 2, latitude: 16.3067, longitude: 80.4365 },
  { slug: 'warangal', name: 'Warangal', state: 'Telangana', tier: 2, latitude: 17.9689, longitude: 79.5941 },
  { slug: 'thrissur', name: 'Thrissur', state: 'Kerala', tier: 2, latitude: 10.5276, longitude: 76.2144 },
  { slug: 'kollam', name: 'Kollam', state: 'Kerala', tier: 2, latitude: 8.8932, longitude: 76.6141 },
  { slug: 'moradabad', name: 'Moradabad', state: 'Uttar Pradesh', tier: 2, latitude: 28.8386, longitude: 78.7733 },

  // Additional Tier 2 & Key Industrial/Tech Cities
  { slug: 'agra', name: 'Agra', state: 'Uttar Pradesh', tier: 2, latitude: 27.1767, longitude: 78.0081 },
  { slug: 'meerut', name: 'Meerut', state: 'Uttar Pradesh', tier: 2, latitude: 28.9845, longitude: 77.7064 },
  { slug: 'ghaziabad', name: 'Ghaziabad', state: 'Uttar Pradesh', tier: 2, latitude: 28.6692, longitude: 77.4538 },
  { slug: 'faridabad', name: 'Faridabad', state: 'Haryana', tier: 2, latitude: 28.4089, longitude: 77.3178 },
  { slug: 'rajkot', name: 'Rajkot', state: 'Gujarat', tier: 2, latitude: 22.3039, longitude: 70.8022 },
  { slug: 'ludhiana', name: 'Ludhiana', state: 'Punjab', tier: 2, latitude: 30.9010, longitude: 75.8573 },
  { slug: 'amritsar', name: 'Amritsar', state: 'Punjab', tier: 2, latitude: 31.6340, longitude: 74.8723 },
  { slug: 'jalandhar', name: 'Jalandhar', state: 'Punjab', tier: 2, latitude: 31.3260, longitude: 75.5762 },
  { slug: 'patiala', name: 'Patiala', state: 'Punjab', tier: 2, latitude: 30.3398, longitude: 76.3869 },
  { slug: 'bathinda', name: 'Bathinda', state: 'Punjab', tier: 2, latitude: 30.2110, longitude: 74.9455 },
  { slug: 'madurai', name: 'Madurai', state: 'Tamil Nadu', tier: 2, latitude: 9.9252, longitude: 78.1198 },
  { slug: 'tirupati', name: 'Tirupati', state: 'Andhra Pradesh', tier: 2, latitude: 13.6288, longitude: 79.4192 },
  { slug: 'nellore', name: 'Nellore', state: 'Andhra Pradesh', tier: 2, latitude: 14.4426, longitude: 79.9865 },
  { slug: 'kakinada', name: 'Kakinada', state: 'Andhra Pradesh', tier: 2, latitude: 16.9891, longitude: 82.2475 },
  { slug: 'rajahmundry', name: 'Rajahmundry', state: 'Andhra Pradesh', tier: 2, latitude: 17.0005, longitude: 81.8040 },
  { slug: 'kurnool', name: 'Kurnool', state: 'Andhra Pradesh', tier: 2, latitude: 15.8281, longitude: 78.0373 },
  { slug: 'kadapa', name: 'Kadapa', state: 'Andhra Pradesh', tier: 2, latitude: 14.4673, longitude: 78.8242 },
  { slug: 'anantapur', name: 'Anantapur', state: 'Andhra Pradesh', tier: 2, latitude: 14.6819, longitude: 77.6006 },
  { slug: 'nizamabad', name: 'Nizamabad', state: 'Telangana', tier: 2, latitude: 18.6725, longitude: 78.0941 },
  { slug: 'karimnagar', name: 'Karimnagar', state: 'Telangana', tier: 2, latitude: 18.4386, longitude: 79.1288 },
  { slug: 'khammam', name: 'Khammam', state: 'Telangana', tier: 2, latitude: 17.2473, longitude: 80.1514 },
  { slug: 'ramagundam', name: 'Ramagundam', state: 'Telangana', tier: 2, latitude: 18.7551, longitude: 79.4738 },
  { slug: 'ujjain', name: 'Ujjain', state: 'Madhya Pradesh', tier: 2, latitude: 23.1765, longitude: 75.7885 },
  { slug: 'sagar', name: 'Sagar', state: 'Madhya Pradesh', tier: 3, latitude: 23.8388, longitude: 78.7378 },
  { slug: 'rewa', name: 'Rewa', state: 'Madhya Pradesh', tier: 3, latitude: 24.5362, longitude: 81.3037 },
  { slug: 'satna', name: 'Satna', state: 'Madhya Pradesh', tier: 3, latitude: 24.6005, longitude: 80.8322 },
  { slug: 'ratlam', name: 'Ratlam', state: 'Madhya Pradesh', tier: 3, latitude: 23.3315, longitude: 75.0367 },
  { slug: 'ajmer', name: 'Ajmer', state: 'Rajasthan', tier: 2, latitude: 26.4499, longitude: 74.6399 },
  { slug: 'bikaner', name: 'Bikaner', state: 'Rajasthan', tier: 2, latitude: 28.0229, longitude: 73.3119 },
  { slug: 'bhilwara', name: 'Bhilwara', state: 'Rajasthan', tier: 3, latitude: 25.3407, longitude: 74.6313 },
  { slug: 'alwar', name: 'Alwar', state: 'Rajasthan', tier: 3, latitude: 27.5530, longitude: 76.6346 },
  { slug: 'sikar', name: 'Sikar', state: 'Rajasthan', tier: 3, latitude: 27.6094, longitude: 75.1399 },
  { slug: 'bareilly', name: 'Bareilly', state: 'Uttar Pradesh', tier: 2, latitude: 28.3670, longitude: 79.4304 },
  { slug: 'prayagraj', name: 'Prayagraj', state: 'Uttar Pradesh', tier: 2, latitude: 25.4358, longitude: 81.8463 },
  { slug: 'gorakhpur', name: 'Gorakhpur', state: 'Uttar Pradesh', tier: 2, latitude: 26.7606, longitude: 83.3732 },
  { slug: 'jhansi', name: 'Jhansi', state: 'Uttar Pradesh', tier: 2, latitude: 25.4484, longitude: 78.5685 },
  { slug: 'saharanpur', name: 'Saharanpur', state: 'Uttar Pradesh', tier: 3, latitude: 29.9640, longitude: 77.5460 },
  { slug: 'mathura', name: 'Mathura', state: 'Uttar Pradesh', tier: 3, latitude: 27.4924, longitude: 77.6737 },
  { slug: 'firozabad', name: 'Firozabad', state: 'Uttar Pradesh', tier: 3, latitude: 27.1594, longitude: 78.3957 },
  { slug: 'muzaffarnagar', name: 'Muzaffarnagar', state: 'Uttar Pradesh', tier: 3, latitude: 29.4727, longitude: 77.7085 },
  { slug: 'ayodhya', name: 'Ayodhya', state: 'Uttar Pradesh', tier: 3, latitude: 26.7922, longitude: 82.1998 },
  { slug: 'cuttack', name: 'Cuttack', state: 'Odisha', tier: 2, latitude: 20.4625, longitude: 85.8830 },
  { slug: 'rourkela', name: 'Rourkela', state: 'Odisha', tier: 2, latitude: 22.2604, longitude: 84.8536 },
  { slug: 'berhampur', name: 'Berhampur', state: 'Odisha', tier: 3, latitude: 19.3150, longitude: 84.7941 },
  { slug: 'sambalpur', name: 'Sambalpur', state: 'Odisha', tier: 3, latitude: 21.4669, longitude: 83.9812 },
  { slug: 'puri', name: 'Puri', state: 'Odisha', tier: 3, latitude: 19.8135, longitude: 85.8312 },
  { slug: 'bokaro', name: 'Bokaro', state: 'Jharkhand', tier: 2, latitude: 23.6693, longitude: 86.1511 },
  { slug: 'hazaribagh', name: 'Hazaribagh', state: 'Jharkhand', tier: 3, latitude: 23.9961, longitude: 85.3637 },
  { slug: 'deoghar', name: 'Deoghar', state: 'Jharkhand', tier: 3, latitude: 24.4826, longitude: 86.7001 },
  { slug: 'gaya', name: 'Gaya', state: 'Bihar', tier: 2, latitude: 24.7914, longitude: 85.0002 },
  { slug: 'muzaffarpur', name: 'Muzaffarpur', state: 'Bihar', tier: 2, latitude: 26.1209, longitude: 85.3647 },
  { slug: 'bhagalpur', name: 'Bhagalpur', state: 'Bihar', tier: 3, latitude: 25.2425, longitude: 86.9842 },
  { slug: 'darbhanga', name: 'Darbhanga', state: 'Bihar', tier: 3, latitude: 26.1542, longitude: 85.8918 },
  { slug: 'purnia', name: 'Purnia', state: 'Bihar', tier: 3, latitude: 25.7771, longitude: 87.4753 },
  { slug: 'rohtak', name: 'Rohtak', state: 'Haryana', tier: 2, latitude: 28.8955, longitude: 76.6066 },
  { slug: 'panipat', name: 'Panipat', state: 'Haryana', tier: 2, latitude: 29.3909, longitude: 76.9635 },
  { slug: 'karnal', name: 'Karnal', state: 'Haryana', tier: 2, latitude: 29.6857, longitude: 76.9905 },
  { slug: 'sonipat', name: 'Sonipat', state: 'Haryana', tier: 2, latitude: 28.9931, longitude: 77.0151 },
  { slug: 'hisar', name: 'Hisar', state: 'Haryana', tier: 2, latitude: 29.1492, longitude: 75.7217 },
  { slug: 'ambala', name: 'Ambala', state: 'Haryana', tier: 2, latitude: 30.3782, longitude: 76.7767 },
  { slug: 'panchkula', name: 'Panchkula', state: 'Haryana', tier: 2, latitude: 30.6942, longitude: 76.8606 },
  { slug: 'mohali', name: 'Mohali', state: 'Punjab', tier: 2, latitude: 30.7046, longitude: 76.7179 },
  { slug: 'durgapur', name: 'Durgapur', state: 'West Bengal', tier: 2, latitude: 23.5204, longitude: 87.3119 },
  { slug: 'asansol', name: 'Asansol', state: 'West Bengal', tier: 2, latitude: 23.6739, longitude: 86.9524 },
  { slug: 'siliguri', name: 'Siliguri', state: 'West Bengal', tier: 2, latitude: 26.7271, longitude: 88.3953 },
  { slug: 'kharagpur', name: 'Kharagpur', state: 'West Bengal', tier: 3, latitude: 22.3460, longitude: 87.2320 },
  { slug: 'howrah', name: 'Howrah', state: 'West Bengal', tier: 2, latitude: 22.5958, longitude: 88.2636 },
  { slug: 'bhavnagar', name: 'Bhavnagar', state: 'Gujarat', tier: 2, latitude: 21.7645, longitude: 72.1519 },
  { slug: 'jamnagar', name: 'Jamnagar', state: 'Gujarat', tier: 2, latitude: 22.4707, longitude: 70.0577 },
  { slug: 'gandhinagar', name: 'Gandhinagar', state: 'Gujarat', tier: 2, latitude: 23.2156, longitude: 72.6369 },
  { slug: 'junagadh', name: 'Junagadh', state: 'Gujarat', tier: 3, latitude: 21.5222, longitude: 70.4579 },
  { slug: 'anand', name: 'Anand', state: 'Gujarat', tier: 3, latitude: 22.5645, longitude: 72.9289 },
  { slug: 'bharuch', name: 'Bharuch', state: 'Gujarat', tier: 3, latitude: 21.7051, longitude: 72.9959 },
  { slug: 'vapi', name: 'Vapi', state: 'Gujarat', tier: 3, latitude: 20.3893, longitude: 72.9106 },
  { slug: 'navi-mumbai', name: 'Navi Mumbai', state: 'Maharashtra', tier: 1, latitude: 19.0330, longitude: 73.0297 },
  { slug: 'thane', name: 'Thane', state: 'Maharashtra', tier: 1, latitude: 19.2183, longitude: 72.9781 },
  { slug: 'kalyan', name: 'Kalyan', state: 'Maharashtra', tier: 2, latitude: 19.2403, longitude: 73.1305 },
  { slug: 'pimpri-chinchwad', name: 'Pimpri-Chinchwad', state: 'Maharashtra', tier: 1, latitude: 18.6298, longitude: 73.7997 },
  { slug: 'nanded', name: 'Nanded', state: 'Maharashtra', tier: 2, latitude: 19.1383, longitude: 77.3210 },
  { slug: 'jalgaon', name: 'Jalgaon', state: 'Maharashtra', tier: 3, latitude: 21.0077, longitude: 75.5626 },
  { slug: 'akola', name: 'Akola', state: 'Maharashtra', tier: 3, latitude: 20.7002, longitude: 77.0082 },
  { slug: 'latur', name: 'Latur', state: 'Maharashtra', tier: 3, latitude: 18.4088, longitude: 76.5604 },
  { slug: 'dhule', name: 'Dhule', state: 'Maharashtra', tier: 3, latitude: 20.9042, longitude: 74.7749 },
  { slug: 'ahmednagar', name: 'Ahmednagar', state: 'Maharashtra', tier: 3, latitude: 19.0952, longitude: 74.7496 },
  { slug: 'chandrapur', name: 'Chandrapur', state: 'Maharashtra', tier: 3, latitude: 19.9615, longitude: 79.2961 },
  { slug: 'parbhani', name: 'Parbhani', state: 'Maharashtra', tier: 3, latitude: 19.2644, longitude: 76.7767 },
  { slug: 'shimla', name: 'Shimla', state: 'Himachal Pradesh', tier: 2, latitude: 31.1048, longitude: 77.1734 },
  { slug: 'dharamshala', name: 'Dharamshala', state: 'Himachal Pradesh', tier: 3, latitude: 32.2190, longitude: 76.3234 },
  { slug: 'solan', name: 'Solan', state: 'Himachal Pradesh', tier: 3, latitude: 30.9045, longitude: 77.0967 },
  { slug: 'rishikesh', name: 'Rishikesh', state: 'Uttarakhand', tier: 3, latitude: 30.0869, longitude: 78.2676 },
  { slug: 'roorkee', name: 'Roorkee', state: 'Uttarakhand', tier: 3, latitude: 29.8543, longitude: 77.8880 },
  { slug: 'haldwani', name: 'Haldwani', state: 'Uttarakhand', tier: 3, latitude: 29.2183, longitude: 79.5130 },
  { slug: 'thiruvananthapuram', name: 'Thiruvananthapuram', state: 'Kerala', tier: 2, latitude: 8.5241, longitude: 76.9366 },
  { slug: 'kannur', name: 'Kannur', state: 'Kerala', tier: 2, latitude: 11.8745, longitude: 75.3704 },
  { slug: 'kottayam', name: 'Kottayam', state: 'Kerala', tier: 3, latitude: 9.5916, longitude: 76.5222 },
  { slug: 'alappuzha', name: 'Alappuzha', state: 'Kerala', tier: 3, latitude: 9.4981, longitude: 76.3388 },
  { slug: 'palakkad', name: 'Palakkad', state: 'Kerala', tier: 3, latitude: 10.7867, longitude: 76.6548 },
  { slug: 'erode', name: 'Erode', state: 'Tamil Nadu', tier: 2, latitude: 11.3410, longitude: 77.7172 },
  { slug: 'tiruppur', name: 'Tiruppur', state: 'Tamil Nadu', tier: 2, latitude: 11.1085, longitude: 77.3411 },
  { slug: 'thoothukudi', name: 'Thoothukudi', state: 'Tamil Nadu', tier: 3, latitude: 8.7642, longitude: 78.1348 },
  { slug: 'dindigul', name: 'Dindigul', state: 'Tamil Nadu', tier: 3, latitude: 10.3673, longitude: 77.9803 },
  { slug: 'thanjavur', name: 'Thanjavur', state: 'Tamil Nadu', tier: 3, latitude: 10.7870, longitude: 79.1378 },
  { slug: 'nagercoil', name: 'Nagercoil', state: 'Tamil Nadu', tier: 3, latitude: 8.1833, longitude: 77.4119 },
  { slug: 'kanchipuram', name: 'Kanchipuram', state: 'Tamil Nadu', tier: 3, latitude: 12.8342, longitude: 79.7036 },
  { slug: 'hosur', name: 'Hosur', state: 'Tamil Nadu', tier: 2, latitude: 12.7409, longitude: 77.8253 },
  { slug: 'shivamogga', name: 'Shivamogga', state: 'Karnataka', tier: 3, latitude: 13.9299, longitude: 75.5681 },
  { slug: 'tumakuru', name: 'Tumakuru', state: 'Karnataka', tier: 3, latitude: 13.3379, longitude: 77.1173 },
  { slug: 'davanagere', name: 'Davanagere', state: 'Karnataka', tier: 3, latitude: 14.4644, longitude: 75.9218 },
  { slug: 'ballari', name: 'Ballari', state: 'Karnataka', tier: 3, latitude: 15.1394, longitude: 76.9214 },
  { slug: 'udupi', name: 'Udupi', state: 'Karnataka', tier: 3, latitude: 13.3409, longitude: 74.7421 },
  { slug: 'hassan', name: 'Hassan', state: 'Karnataka', tier: 3, latitude: 13.0033, longitude: 76.1004 },
  { slug: 'bidar', name: 'Bidar', state: 'Karnataka', tier: 3, latitude: 17.9104, longitude: 77.5199 },
  { slug: 'agartala', name: 'Agartala', state: 'Tripura', tier: 3, latitude: 23.8315, longitude: 91.2868 },
  { slug: 'imphal', name: 'Imphal', state: 'Manipur', tier: 3, latitude: 24.8170, longitude: 93.9368 },
  { slug: 'shillong', name: 'Shillong', state: 'Meghalaya', tier: 3, latitude: 25.5788, longitude: 91.8933 },
  { slug: 'aizawl', name: 'Aizawl', state: 'Mizoram', tier: 3, latitude: 23.7271, longitude: 92.7176 },
  { slug: 'kohima', name: 'Kohima', state: 'Nagaland', tier: 3, latitude: 25.6751, longitude: 94.1086 },
  { slug: 'gangtok', name: 'Gangtok', state: 'Sikkim', tier: 3, latitude: 27.3389, longitude: 88.6065 },
  { slug: 'itanagar', name: 'Itanagar', state: 'Arunachal Pradesh', tier: 3, latitude: 27.0844, longitude: 93.6053 },
  { slug: 'dimapur', name: 'Dimapur', state: 'Nagaland', tier: 3, latitude: 25.9095, longitude: 93.7266 },
  { slug: 'dibrugarh', name: 'Dibrugarh', state: 'Assam', tier: 3, latitude: 27.4728, longitude: 94.9120 },
  { slug: 'silchar', name: 'Silchar', state: 'Assam', tier: 3, latitude: 24.8333, longitude: 92.7789 },
  { slug: 'jorhat', name: 'Jorhat', state: 'Assam', tier: 3, latitude: 26.7509, longitude: 94.2037 },
  { slug: 'tezpur', name: 'Tezpur', state: 'Assam', tier: 3, latitude: 26.6528, longitude: 92.7926 },
  { slug: 'puducherry', name: 'Puducherry', state: 'Puducherry', tier: 2, latitude: 11.9416, longitude: 79.8083 },
  { slug: 'panaji', name: 'Panaji', state: 'Goa', tier: 2, latitude: 15.4909, longitude: 73.8278 },
  { slug: 'margao', name: 'Margao', state: 'Goa', tier: 3, latitude: 15.2832, longitude: 73.9862 },
  { slug: 'vasco-da-gama', name: 'Vasco da Gama', state: 'Goa', tier: 3, latitude: 15.3982, longitude: 73.8113 },
];

export const EXPANDED_ROLES = [
  // 1. Software Engineering
  { slug: 'software-engineer', name: 'Software Engineer', category: 'Software Engineering', is_fresher_eligible: false },
  { slug: 'junior-software-engineer', name: 'Junior Software Engineer', category: 'Software Engineering', is_fresher_eligible: true },
  { slug: 'senior-software-engineer', name: 'Senior Software Engineer', category: 'Software Engineering', is_fresher_eligible: false },
  { slug: 'lead-software-engineer', name: 'Lead Software Engineer', category: 'Software Engineering', is_fresher_eligible: false },
  { slug: 'principal-software-engineer', name: 'Principal Software Engineer', category: 'Software Engineering', is_fresher_eligible: false },
  { slug: 'backend-developer', name: 'Backend Developer', category: 'Software Engineering', is_fresher_eligible: false },
  { slug: 'junior-backend-developer', name: 'Junior Backend Developer', category: 'Software Engineering', is_fresher_eligible: true },
  { slug: 'senior-backend-developer', name: 'Senior Backend Developer', category: 'Software Engineering', is_fresher_eligible: false },
  { slug: 'frontend-developer', name: 'Frontend Developer', category: 'Software Engineering', is_fresher_eligible: false },
  { slug: 'junior-frontend-developer', name: 'Junior Frontend Developer', category: 'Software Engineering', is_fresher_eligible: true },
  { slug: 'senior-frontend-developer', name: 'Senior Frontend Developer', category: 'Software Engineering', is_fresher_eligible: false },
  { slug: 'full-stack-developer', name: 'Full Stack Developer', category: 'Software Engineering', is_fresher_eligible: false },
  { slug: 'junior-full-stack-developer', name: 'Junior Full Stack Developer', category: 'Software Engineering', is_fresher_eligible: true },
  { slug: 'senior-full-stack-developer', name: 'Senior Full Stack Developer', category: 'Software Engineering', is_fresher_eligible: false },
  { slug: 'java-developer', name: 'Java Developer', category: 'Software Engineering', is_fresher_eligible: false },
  { slug: 'python-developer', name: 'Python Developer', category: 'Software Engineering', is_fresher_eligible: false },
  { slug: 'nodejs-developer', name: 'Node.js Developer', category: 'Software Engineering', is_fresher_eligible: false },
  { slug: 'react-developer', name: 'React Developer', category: 'Software Engineering', is_fresher_eligible: false },
  { slug: 'angular-developer', name: 'Angular Developer', category: 'Software Engineering', is_fresher_eligible: false },
  { slug: 'mobile-app-developer', name: 'Mobile App Developer', category: 'Software Engineering', is_fresher_eligible: false },
  { slug: 'android-developer', name: 'Android Developer', category: 'Software Engineering', is_fresher_eligible: false },
  { slug: 'ios-developer', name: 'iOS Developer', category: 'Software Engineering', is_fresher_eligible: false },
  { slug: 'flutter-developer', name: 'Flutter Developer', category: 'Software Engineering', is_fresher_eligible: false },
  { slug: 'embedded-software-engineer', name: 'Embedded Software Engineer', category: 'Software Engineering', is_fresher_eligible: false },
  { slug: 'firmware-engineer', name: 'Firmware Engineer', category: 'Software Engineering', is_fresher_eligible: false },
  { slug: 'senior-staff-engineer', name: 'Senior Staff Engineer', category: 'Software Engineering', is_fresher_eligible: false },
  { slug: 'engineering-manager', name: 'Engineering Manager', category: 'Engineering Leadership', is_fresher_eligible: false },

  // 2. Data & AI / ML
  { slug: 'data-analyst', name: 'Data Analyst', category: 'Data & Analytics', is_fresher_eligible: false },
  { slug: 'associate-data-analyst', name: 'Associate Data Analyst', category: 'Data & Analytics', is_fresher_eligible: true },
  { slug: 'senior-data-analyst', name: 'Senior Data Analyst', category: 'Data & Analytics', is_fresher_eligible: false },
  { slug: 'data-scientist', name: 'Data Scientist', category: 'Data & Analytics', is_fresher_eligible: false },
  { slug: 'junior-data-scientist', name: 'Junior Data Scientist', category: 'Data & Analytics', is_fresher_eligible: true },
  { slug: 'senior-data-scientist', name: 'Senior Data Scientist', category: 'Data & Analytics', is_fresher_eligible: false },
  { slug: 'machine-learning-engineer', name: 'Machine Learning Engineer', category: 'Data & Analytics', is_fresher_eligible: false },
  { slug: 'ai-engineer', name: 'AI Engineer', category: 'Data & Analytics', is_fresher_eligible: false },
  { slug: 'data-engineer', name: 'Data Engineer', category: 'Data & Analytics', is_fresher_eligible: false },
  { slug: 'senior-data-engineer', name: 'Senior Data Engineer', category: 'Data & Analytics', is_fresher_eligible: false },
  { slug: 'business-intelligence-analyst', name: 'Business Intelligence Analyst', category: 'Data & Analytics', is_fresher_eligible: false },
  { slug: 'bi-developer', name: 'BI Developer', category: 'Data & Analytics', is_fresher_eligible: false },
  { slug: 'big-data-engineer', name: 'Big Data Engineer', category: 'Data & Analytics', is_fresher_eligible: false },
  { slug: 'mlops-engineer', name: 'MLOps Engineer', category: 'Data & Analytics', is_fresher_eligible: false },
  { slug: 'nlp-engineer', name: 'NLP Engineer', category: 'Data & Analytics', is_fresher_eligible: false },

  // 3. Cloud & DevOps
  { slug: 'devops-engineer', name: 'DevOps Engineer', category: 'Cloud & DevOps', is_fresher_eligible: false },
  { slug: 'devops-cloud-engineer', name: 'DevOps & Cloud Engineer', category: 'Cloud & DevOps', is_fresher_eligible: false },
  { slug: 'site-reliability-engineer', name: 'Site Reliability Engineer', category: 'Cloud & DevOps', is_fresher_eligible: false },
  { slug: 'cloud-architect', name: 'Cloud Architect', category: 'Cloud & DevOps', is_fresher_eligible: false },
  { slug: 'cloud-engineer', name: 'Cloud Engineer', category: 'Cloud & DevOps', is_fresher_eligible: false },
  { slug: 'aws-cloud-engineer', name: 'AWS Cloud Engineer', category: 'Cloud & DevOps', is_fresher_eligible: false },
  { slug: 'azure-cloud-engineer', name: 'Azure Cloud Engineer', category: 'Cloud & DevOps', is_fresher_eligible: false },
  { slug: 'kubernetes-engineer', name: 'Kubernetes Engineer', category: 'Cloud & DevOps', is_fresher_eligible: false },
  { slug: 'infrastructure-engineer', name: 'Infrastructure Engineer', category: 'Cloud & DevOps', is_fresher_eligible: false },
  { slug: 'systems-administrator', name: 'Systems Administrator', category: 'Cloud & DevOps', is_fresher_eligible: false },
  { slug: 'database-administrator', name: 'Database Administrator', category: 'Cloud & DevOps', is_fresher_eligible: false },
  { slug: 'linux-administrator', name: 'Linux Administrator', category: 'Cloud & DevOps', is_fresher_eligible: false },

  // 4. Quality Assurance & SDET
  { slug: 'qa-automation-engineer', name: 'QA Automation Engineer', category: 'Quality Assurance', is_fresher_eligible: false },
  { slug: 'junior-qa-automation-engineer', name: 'Junior QA Automation Engineer', category: 'Quality Assurance', is_fresher_eligible: true },
  { slug: 'senior-qa-automation-engineer', name: 'Senior QA Automation Engineer', category: 'Quality Assurance', is_fresher_eligible: false },
  { slug: 'software-development-engineer-in-test', name: 'SDET', category: 'Quality Assurance', is_fresher_eligible: false },
  { slug: 'manual-qa-tester', name: 'Manual QA Tester', category: 'Quality Assurance', is_fresher_eligible: true },
  { slug: 'performance-test-engineer', name: 'Performance Test Engineer', category: 'Quality Assurance', is_fresher_eligible: false },
  { slug: 'security-test-engineer', name: 'Security QA Engineer', category: 'Quality Assurance', is_fresher_eligible: false },
  { slug: 'mobile-qa-engineer', name: 'Mobile QA Tester', category: 'Quality Assurance', is_fresher_eligible: false },
  { slug: 'api-testing-engineer', name: 'API Test Engineer', category: 'Quality Assurance', is_fresher_eligible: false },
  { slug: 'quality-assurance-lead', name: 'QA Lead', category: 'Quality Assurance', is_fresher_eligible: false },

  // 5. Product & Project Management
  { slug: 'product-manager', name: 'Product Manager', category: 'Product Management', is_fresher_eligible: false },
  { slug: 'associate-product-manager', name: 'Associate Product Manager', category: 'Product Management', is_fresher_eligible: true },
  { slug: 'senior-product-manager', name: 'Senior Product Manager', category: 'Product Management', is_fresher_eligible: false },
  { slug: 'technical-product-manager', name: 'Technical Product Manager', category: 'Product Management', is_fresher_eligible: false },
  { slug: 'product-growth-analyst', name: 'Product Growth Analyst', category: 'Product Management', is_fresher_eligible: true },
  { slug: 'project-manager', name: 'Project Manager', category: 'Product Management', is_fresher_eligible: false },
  { slug: 'technical-project-manager', name: 'Technical Project Manager', category: 'Product Management', is_fresher_eligible: false },
  { slug: 'scrum-master', name: 'Scrum Master', category: 'Product Management', is_fresher_eligible: false },
  { slug: 'agile-coach', name: 'Agile Coach', category: 'Product Management', is_fresher_eligible: false },
  { slug: 'program-manager', name: 'Program Manager', category: 'Product Management', is_fresher_eligible: false },

  // 6. UI / UX & Design
  { slug: 'ui-ux-designer', name: 'UI/UX Designer', category: 'Design', is_fresher_eligible: false },
  { slug: 'product-designer', name: 'Product Designer', category: 'Design', is_fresher_eligible: false },
  { slug: 'junior-product-designer', name: 'Junior Product Designer', category: 'Design', is_fresher_eligible: true },
  { slug: 'ui-designer', name: 'UI Designer', category: 'Design', is_fresher_eligible: false },
  { slug: 'ux-researcher', name: 'UX Researcher', category: 'Design', is_fresher_eligible: false },
  { slug: 'visual-designer', name: 'Visual Designer', category: 'Design', is_fresher_eligible: false },
  { slug: 'graphic-designer', name: 'Graphic Designer', category: 'Design', is_fresher_eligible: true },
  { slug: 'web-designer', name: 'Web Designer', category: 'Design', is_fresher_eligible: false },
  { slug: 'motion-designer', name: 'Motion Graphics Designer', category: 'Design', is_fresher_eligible: false },
  { slug: 'design-system-lead', name: 'Design System Lead', category: 'Design', is_fresher_eligible: false },

  // 7. Cybersecurity & InfoSec
  { slug: 'cybersecurity-analyst', name: 'Cybersecurity Analyst', category: 'Cybersecurity', is_fresher_eligible: false },
  { slug: 'information-security-analyst', name: 'Information Security Analyst', category: 'Cybersecurity', is_fresher_eligible: false },
  { slug: 'security-engineer', name: 'Security Engineer', category: 'Cybersecurity', is_fresher_eligible: false },
  { slug: 'penetration-tester', name: 'Penetration Tester', category: 'Cybersecurity', is_fresher_eligible: false },
  { slug: 'soc-analyst', name: 'SOC Analyst', category: 'Cybersecurity', is_fresher_eligible: true },
  { slug: 'incident-response-specialist', name: 'Incident Response Specialist', category: 'Cybersecurity', is_fresher_eligible: false },
  { slug: 'compliance-security-officer', name: 'Compliance Security Officer', category: 'Cybersecurity', is_fresher_eligible: false },
  { slug: 'chief-information-security-officer', name: 'CISO', category: 'Cybersecurity', is_fresher_eligible: false },

  // 8. Sales & Business Development
  { slug: 'business-development-associate', name: 'Business Development Associate', category: 'Sales & BD', is_fresher_eligible: true },
  { slug: 'business-development-executive', name: 'Business Development Executive', category: 'Sales & BD', is_fresher_eligible: true },
  { slug: 'business-development-manager', name: 'Business Development Manager', category: 'Sales & BD', is_fresher_eligible: false },
  { slug: 'sales-executive', name: 'Sales Executive', category: 'Sales & BD', is_fresher_eligible: true },
  { slug: 'enterprise-account-executive', name: 'Enterprise Account Executive', category: 'Sales & BD', is_fresher_eligible: false },
  { slug: 'inside-sales-specialist', name: 'Inside Sales Specialist', category: 'Sales & BD', is_fresher_eligible: true },
  { slug: 'sales-development-representative', name: 'Sales Development Representative', category: 'Sales & BD', is_fresher_eligible: true },
  { slug: 'corporate-sales-manager', name: 'Corporate Sales Manager', category: 'Sales & BD', is_fresher_eligible: false },
  { slug: 'pre-sales-consultant', name: 'Pre-Sales Consultant', category: 'Sales & BD', is_fresher_eligible: false },
  { slug: 'channel-sales-partner', name: 'Channel Sales Partner Manager', category: 'Sales & BD', is_fresher_eligible: false },
  { slug: 'territory-sales-manager', name: 'Territory Sales Manager', category: 'Sales & BD', is_fresher_eligible: false },
  { slug: 'customer-relationship-manager', name: 'Customer Relationship Manager', category: 'Sales & BD', is_fresher_eligible: false },

  // 9. Marketing & Growth
  { slug: 'digital-marketing-specialist', name: 'Digital Marketing Specialist', category: 'Marketing', is_fresher_eligible: true },
  { slug: 'digital-marketing-manager', name: 'Digital Marketing Manager', category: 'Marketing', is_fresher_eligible: false },
  { slug: 'seo-specialist', name: 'SEO Specialist', category: 'Marketing', is_fresher_eligible: true },
  { slug: 'content-writer', name: 'Content Writer', category: 'Marketing', is_fresher_eligible: true },
  { slug: 'copywriter', name: 'Copywriter', category: 'Marketing', is_fresher_eligible: true },
  { slug: 'social-media-manager', name: 'Social Media Manager', category: 'Marketing', is_fresher_eligible: true },
  { slug: 'performance-marketing-manager', name: 'Performance Marketing Manager', category: 'Marketing', is_fresher_eligible: false },
  { slug: 'growth-marketing-manager', name: 'Growth Marketing Manager', category: 'Marketing', is_fresher_eligible: false },
  { slug: 'brand-manager', name: 'Brand Manager', category: 'Marketing', is_fresher_eligible: false },
  { slug: 'email-marketing-specialist', name: 'Email Marketing Specialist', category: 'Marketing', is_fresher_eligible: true },
  { slug: 'public-relations-specialist', name: 'Public Relations Specialist', category: 'Marketing', is_fresher_eligible: false },
  { slug: 'community-manager', name: 'Community Manager', category: 'Marketing', is_fresher_eligible: true },

  // 10. Operations, Support & Management
  { slug: 'operations-associate', name: 'Operations Associate', category: 'Operations & Management', is_fresher_eligible: true },
  { slug: 'operations-manager', name: 'Operations Manager', category: 'Operations & Management', is_fresher_eligible: false },
  { slug: 'management-trainee', name: 'Management Trainee', category: 'Operations & Management', is_fresher_eligible: true },
  { slug: 'customer-support-executive', name: 'Customer Support Executive', category: 'Operations & Management', is_fresher_eligible: true },
  { slug: 'customer-success-manager', name: 'Customer Success Manager', category: 'Operations & Management', is_fresher_eligible: false },
  { slug: 'technical-support-engineer', name: 'Technical Support Engineer', category: 'Operations & Management', is_fresher_eligible: true },
  { slug: 'service-delivery-manager', name: 'Service Delivery Manager', category: 'Operations & Management', is_fresher_eligible: false },
  { slug: 'supply-chain-analyst', name: 'Supply Chain Analyst', category: 'Operations & Management', is_fresher_eligible: false },
  { slug: 'logistics-coordinator', name: 'Logistics Coordinator', category: 'Operations & Management', is_fresher_eligible: true },
  { slug: 'process-excellence-lead', name: 'Process Excellence Lead', category: 'Operations & Management', is_fresher_eligible: false },

  // 11. Human Resources & Talent Acquisition
  { slug: 'human-resources-executive', name: 'HR Executive', category: 'Human Resources', is_fresher_eligible: true },
  { slug: 'hr-generalist', name: 'HR Generalist', category: 'Human Resources', is_fresher_eligible: true },
  { slug: 'hr-business-partner', name: 'HR Business Partner', category: 'Human Resources', is_fresher_eligible: false },
  { slug: 'talent-acquisition-specialist', name: 'Talent Acquisition Specialist', category: 'Human Resources', is_fresher_eligible: false },
  { slug: 'technical-recruiter', name: 'Technical Recruiter', category: 'Human Resources', is_fresher_eligible: true },
  { slug: 'campus-recruiter', name: 'Campus Recruiter', category: 'Human Resources', is_fresher_eligible: true },
  { slug: 'payroll-specialist', name: 'Payroll Specialist', category: 'Human Resources', is_fresher_eligible: false },
  { slug: 'hr-manager', name: 'HR Manager', category: 'Human Resources', is_fresher_eligible: false },
  { slug: 'employee-relations-manager', name: 'Employee Relations Manager', category: 'Human Resources', is_fresher_eligible: false },
  { slug: 'learning-and-development-specialist', name: 'L&D Specialist', category: 'Human Resources', is_fresher_eligible: false },

  // 12. Banking & Finance
  { slug: 'banking-associate', name: 'Banking Associate', category: 'Banking & Finance', is_fresher_eligible: true },
  { slug: 'assistant-branch-manager', name: 'Assistant Branch Manager', category: 'Banking & Finance', is_fresher_eligible: false },
  { slug: 'financial-analyst', name: 'Financial Analyst', category: 'Banking & Finance', is_fresher_eligible: true },
  { slug: 'accountant', name: 'Accountant', category: 'Banking & Finance', is_fresher_eligible: true },
  { slug: 'senior-accountant', name: 'Senior Accountant', category: 'Banking & Finance', is_fresher_eligible: false },
  { slug: 'chartered-accountant', name: 'Chartered Accountant', category: 'Banking & Finance', is_fresher_eligible: false },
  { slug: 'investment-banker', name: 'Investment Banker', category: 'Banking & Finance', is_fresher_eligible: false },
  { slug: 'credit-risk-analyst', name: 'Credit Risk Analyst', category: 'Banking & Finance', is_fresher_eligible: false },

  // 13. Core Engineering & PSU Trainees
  { slug: 'graduate-engineer-trainee', name: 'Graduate Engineer Trainee', category: 'Engineering', is_fresher_eligible: true },
  { slug: 'mechanical-engineer', name: 'Mechanical Engineer', category: 'Engineering', is_fresher_eligible: false },
  { slug: 'electrical-engineer', name: 'Electrical Engineer', category: 'Engineering', is_fresher_eligible: false },
  { slug: 'civil-engineer', name: 'Civil Engineer', category: 'Engineering', is_fresher_eligible: false },
  { slug: 'instrumentation-engineer', name: 'Instrumentation Engineer', category: 'Engineering', is_fresher_eligible: false },
  { slug: 'executive-trainee-engineering', name: 'Executive Trainee (Engineering)', category: 'Engineering', is_fresher_eligible: true }
];

export async function seedTaxonomies() {
  const supabase = getSupabaseAdminClient();

  console.log(`[Taxonomy Seed] Upserting ${EXPANDED_CITIES.length} canonical cities...`);
  const { data: cityData, error: cityError } = await supabase
    .from('canonical_cities')
    .upsert(
      EXPANDED_CITIES.map(c => ({
        slug: c.slug,
        name: c.name,
        state: c.state,
        tier: c.tier,
        country_code: 'IN',
        latitude: c.latitude,
        longitude: c.longitude
      })),
      { onConflict: 'slug' }
    )
    .select('id, slug');

  if (cityError) {
    console.error('[Taxonomy Seed] City Upsert Error:', cityError);
    throw cityError;
  }
  console.log(`[Taxonomy Seed] Successfully upserted cities. Count in response: ${cityData?.length || 0}`);

  console.log(`[Taxonomy Seed] Upserting ${EXPANDED_ROLES.length} canonical roles...`);
  const { data: roleData, error: roleError } = await supabase
    .from('canonical_roles')
    .upsert(
      EXPANDED_ROLES.map(r => ({
        slug: r.slug,
        name: r.name,
        category: r.category,
        is_fresher_eligible: r.is_fresher_eligible
      })),
      { onConflict: 'slug' }
    )
    .select('id, slug');

  if (roleError) {
    console.error('[Taxonomy Seed] Role Upsert Error:', roleError);
    throw roleError;
  }
  console.log(`[Taxonomy Seed] Successfully upserted roles. Count in response: ${roleData?.length || 0}`);

  // Query total counts in DB
  const { count: finalCityCount } = await supabase.from('canonical_cities').select('*', { count: 'exact', head: true });
  const { count: finalRoleCount } = await supabase.from('canonical_roles').select('*', { count: 'exact', head: true });

  console.log(`[Taxonomy Seed Complete] Verified in Database:`);
  console.log(`  canonical_cities: ${finalCityCount} rows`);
  console.log(`  canonical_roles: ${finalRoleCount} rows`);
}

if (process.argv[1] && process.argv[1].endsWith('seed-taxonomy-expansion.ts')) {
  seedTaxonomies()
    .then(() => {
      console.log('Done.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal seed error:', err);
      process.exit(1);
    });
}
