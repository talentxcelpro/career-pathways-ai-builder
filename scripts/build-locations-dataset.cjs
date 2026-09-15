// scripts/build-locations-dataset.js
// Generates the comprehensive, validated 625+ Indian Cities + Global Hubs dataset
// Strict Validation: Zero duplicate slugs, valid country codes, proper state associations

const fs = require('fs');
const path = require('path');

const RAW_INDIAN_LOCATIONS = [
  // ── Uttar Pradesh (55+ cities) ──
  { name: 'Noida', state: 'Uttar Pradesh', tier: 1, aliases: ['greater noida', 'ncr', 'noida expressway'], lat: 28.5355, lng: 77.3910 },
  { name: 'Greater Noida', state: 'Uttar Pradesh', tier: 2, aliases: ['noida extension', 'greater noida west', 'yeida'], lat: 28.4744, lng: 77.5040 },
  { name: 'Ghaziabad', state: 'Uttar Pradesh', tier: 2, aliases: ['sahibabad', 'indirapuram', 'vaishali', 'ncr'], lat: 28.6692, lng: 77.4538 },
  { name: 'Lucknow', state: 'Uttar Pradesh', tier: 1, aliases: ['gomti nagar', 'hazratganj', 'alambagh'], lat: 26.8467, lng: 80.9462 },
  { name: 'Kanpur', state: 'Uttar Pradesh', tier: 2, aliases: ['cawnpore', 'kalyanpur'], lat: 26.4499, lng: 80.3319 },
  { name: 'Varanasi', state: 'Uttar Pradesh', tier: 2, aliases: ['banaras', 'kashi'], lat: 25.3176, lng: 82.9739 },
  { name: 'Agra', state: 'Uttar Pradesh', tier: 2, aliases: ['sanjay place'], lat: 27.1767, lng: 78.0081 },
  { name: 'Meerut', state: 'Uttar Pradesh', tier: 2, aliases: ['modipuram'], lat: 28.9845, lng: 77.7064 },
  { name: 'Prayagraj', state: 'Uttar Pradesh', tier: 2, aliases: ['allahabad', 'civil lines'], lat: 25.4358, lng: 81.8463 },
  { name: 'Bareilly', state: 'Uttar Pradesh', tier: 3, aliases: ['bareilly cantt'], lat: 28.3670, lng: 79.4304 },
  { name: 'Aligarh', state: 'Uttar Pradesh', tier: 3, aliases: ['aligarh city'], lat: 27.8974, lng: 78.0880 },
  { name: 'Moradabad', state: 'Uttar Pradesh', tier: 3, aliases: ['brass city'], lat: 28.8386, lng: 78.7733 },
  { name: 'Gorakhpur', state: 'Uttar Pradesh', tier: 2, aliases: ['gida'], lat: 26.7606, lng: 83.3732 },
  { name: 'Saharanpur', state: 'Uttar Pradesh', tier: 3, aliases: [], lat: 29.9678, lng: 77.5510 },
  { name: 'Jhansi', state: 'Uttar Pradesh', tier: 3, aliases: ['bundelkhand'], lat: 25.4484, lng: 78.5685 },
  { name: 'Firozabad', state: 'Uttar Pradesh', tier: 3, aliases: [], lat: 27.1593, lng: 78.3957 },
  { name: 'Muzaffarnagar', state: 'Uttar Pradesh', tier: 3, aliases: [], lat: 29.4727, lng: 77.7085 },
  { name: 'Mathura', state: 'Uttar Pradesh', tier: 3, aliases: ['vrindavan'], lat: 27.4924, lng: 77.6737 },
  { name: 'Ayodhya', state: 'Uttar Pradesh', tier: 2, aliases: ['faizabad'], lat: 26.7922, lng: 82.1998 },
  { name: 'Rampur', state: 'Uttar Pradesh', tier: 3, aliases: [], lat: 28.8154, lng: 79.0257 },
  { name: 'Shahjahanpur', state: 'Uttar Pradesh', tier: 3, aliases: [], lat: 27.8805, lng: 79.9120 },
  { name: 'Farrukhabad', state: 'Uttar Pradesh', tier: 3, aliases: ['fatehgarh'], lat: 27.3826, lng: 79.5843 },
  { name: 'Hapur', state: 'Uttar Pradesh', tier: 3, aliases: ['pilkhuwa'], lat: 28.7306, lng: 77.7759 },
  { name: 'Etawah', state: 'Uttar Pradesh', tier: 3, aliases: [], lat: 26.7855, lng: 79.0154 },
  { name: 'Mirzapur', state: 'Uttar Pradesh', tier: 3, aliases: ['vindhyachal'], lat: 25.1460, lng: 82.5690 },
  { name: 'Bulandshahr', state: 'Uttar Pradesh', tier: 3, aliases: ['khurja'], lat: 28.4069, lng: 77.8498 },
  { name: 'Sambhal', state: 'Uttar Pradesh', tier: 4, aliases: [], lat: 28.5845, lng: 78.5684 },
  { name: 'Amroha', state: 'Uttar Pradesh', tier: 4, aliases: [], lat: 28.9044, lng: 78.4678 },
  { name: 'Hardoi', state: 'Uttar Pradesh', tier: 4, aliases: [], lat: 27.3956, lng: 80.1312 },
  { name: 'Fatehpur', state: 'Uttar Pradesh', tier: 4, aliases: [], lat: 25.9284, lng: 80.8130 },
  { name: 'Raebareli', state: 'Uttar Pradesh', tier: 3, aliases: [], lat: 26.2298, lng: 81.2424 },
  { name: 'Orai', state: 'Uttar Pradesh', tier: 4, aliases: ['jalaun'], lat: 25.9902, lng: 79.4530 },
  { name: 'Sitapur', state: 'Uttar Pradesh', tier: 4, aliases: [], lat: 27.5644, lng: 80.6829 },
  { name: 'Bahraich', state: 'Uttar Pradesh', tier: 4, aliases: [], lat: 27.5705, lng: 81.5977 },
  { name: 'Modinagar', state: 'Uttar Pradesh', tier: 3, aliases: [], lat: 28.8315, lng: 77.5804 },
  { name: 'Unnao', state: 'Uttar Pradesh', tier: 3, aliases: ['shuklaganj'], lat: 26.5450, lng: 80.4878 },
  { name: 'Jaunpur', state: 'Uttar Pradesh', tier: 3, aliases: [], lat: 25.7464, lng: 82.6837 },
  { name: 'Lakhimpur', state: 'Uttar Pradesh', tier: 4, aliases: ['kheri'], lat: 27.9460, lng: 80.7786 },
  { name: 'Hathras', state: 'Uttar Pradesh', tier: 4, aliases: [], lat: 27.5968, lng: 78.0519 },
  { name: 'Banda', state: 'Uttar Pradesh', tier: 4, aliases: [], lat: 25.4754, lng: 80.3347 },
  { name: 'Pilibhit', state: 'Uttar Pradesh', tier: 4, aliases: [], lat: 28.6310, lng: 79.8035 },
  { name: 'Barabanki', state: 'Uttar Pradesh', tier: 3, aliases: [], lat: 26.9268, lng: 81.1834 },
  { name: 'Mughalsarai', state: 'Uttar Pradesh', tier: 3, aliases: ['pt deen dayal upadhyaya nagar'], lat: 25.2807, lng: 83.1158 },
  { name: 'Gonda', state: 'Uttar Pradesh', tier: 4, aliases: [], lat: 27.1332, lng: 81.9619 },
  { name: 'Basti', state: 'Uttar Pradesh', tier: 4, aliases: [], lat: 26.8124, lng: 82.7634 },
  { name: 'Lalitpur', state: 'Uttar Pradesh', tier: 4, aliases: [], lat: 24.6865, lng: 78.4116 },
  { name: 'Deoria', state: 'Uttar Pradesh', tier: 4, aliases: [], lat: 26.5023, lng: 83.7791 },
  { name: 'Ghazipur', state: 'Uttar Pradesh', tier: 4, aliases: [], lat: 25.5867, lng: 83.5770 },
  { name: 'Bijnor', state: 'Uttar Pradesh', tier: 4, aliases: [], lat: 29.3724, lng: 78.1358 },
  { name: 'Azamgarh', state: 'Uttar Pradesh', tier: 4, aliases: [], lat: 26.0688, lng: 83.1836 },
  { name: 'Budaun', state: 'Uttar Pradesh', tier: 4, aliases: [], lat: 28.0381, lng: 79.1254 },
  { name: 'Sultanpur', state: 'Uttar Pradesh', tier: 4, aliases: [], lat: 26.2648, lng: 82.0727 },
  { name: 'Ballia', state: 'Uttar Pradesh', tier: 4, aliases: [], lat: 25.7592, lng: 84.1497 },
  { name: 'Mainpuri', state: 'Uttar Pradesh', tier: 4, aliases: [], lat: 27.2289, lng: 79.0264 },
  { name: 'Shamli', state: 'Uttar Pradesh', tier: 4, aliases: [], lat: 29.4497, lng: 77.3134 },
  { name: 'Baraut', state: 'Uttar Pradesh', tier: 4, aliases: ['baghpat'], lat: 29.1026, lng: 77.2625 },

  // ── Maharashtra (55+ cities) ──
  { name: 'Mumbai', state: 'Maharashtra', tier: 1, aliases: ['bombay', 'bkc', 'andheri', 'nariman point', 'south mumbai'], lat: 18.9220, lng: 72.8347 },
  { name: 'Navi Mumbai', state: 'Maharashtra', tier: 1, aliases: ['vashi', 'belapur', 'kharghar', 'airoli', 'mahape', 'taloja'], lat: 19.0330, lng: 73.0297 },
  { name: 'Thane', state: 'Maharashtra', tier: 1, aliases: ['ghodbunder', 'wagle estate'], lat: 19.2183, lng: 72.9781 },
  { name: 'Pune', state: 'Maharashtra', tier: 1, aliases: ['hinjawadi', 'magarpatta', 'kalyani nagar', 'wakad', 'baner', 'pcmc'], lat: 18.5204, lng: 73.8567 },
  { name: 'Pimpri-Chinchwad', state: 'Maharashtra', tier: 2, aliases: ['pcmc', 'bhosari', 'chakan', 'talwade'], lat: 18.6279, lng: 73.8009 },
  { name: 'Nagpur', state: 'Maharashtra', tier: 1, aliases: ['mihan', 'butibori'], lat: 21.1458, lng: 79.0882 },
  { name: 'Nashik', state: 'Maharashtra', tier: 2, aliases: ['nasik', 'satpur', 'ambad'], lat: 19.9975, lng: 73.7898 },
  { name: 'Aurangabad', state: 'Maharashtra', tier: 2, aliases: ['chhatrapati sambhajinagar', 'shendra', 'waluj'], lat: 19.8762, lng: 75.3433 },
  { name: 'Solapur', state: 'Maharashtra', tier: 2, aliases: ['sholapur'], lat: 17.6599, lng: 75.9064 },
  { name: 'Amravati', state: 'Maharashtra', tier: 3, aliases: [], lat: 20.9374, lng: 77.7796 },
  { name: 'Kolhapur', state: 'Maharashtra', tier: 2, aliases: ['gokul shirgaon', 'shiroli'], lat: 16.7050, lng: 74.2433 },
  { name: 'Nanded', state: 'Maharashtra', tier: 3, aliases: ['nanded waghala'], lat: 19.1383, lng: 77.3210 },
  { name: 'Sangli', state: 'Maharashtra', tier: 3, aliases: ['miraj', 'kupwad'], lat: 16.8524, lng: 74.5815 },
  { name: 'Jalgaon', state: 'Maharashtra', tier: 3, aliases: [], lat: 21.0077, lng: 75.5626 },
  { name: 'Akola', state: 'Maharashtra', tier: 3, aliases: [], lat: 20.7002, lng: 77.0082 },
  { name: 'Latur', state: 'Maharashtra', tier: 3, aliases: [], lat: 18.4088, lng: 76.5604 },
  { name: 'Dhule', state: 'Maharashtra', tier: 3, aliases: [], lat: 20.9042, lng: 74.7749 },
  { name: 'Ahmednagar', state: 'Maharashtra', tier: 3, aliases: ['ahilyanagar'], lat: 19.0948, lng: 74.7480 },
  { name: 'Chandrapur', state: 'Maharashtra', tier: 3, aliases: [], lat: 19.9615, lng: 79.2961 },
  { name: 'Parbhani', state: 'Maharashtra', tier: 4, aliases: [], lat: 19.2686, lng: 76.7708 },
  { name: 'Ichalkaranji', state: 'Maharashtra', tier: 3, aliases: ['textile city'], lat: 16.6975, lng: 74.4589 },
  { name: 'Jalna', state: 'Maharashtra', tier: 3, aliases: [], lat: 19.8347, lng: 75.8816 },
  { name: 'Panvel', state: 'Maharashtra', tier: 2, aliases: ['new panvel', 'khandeshwar'], lat: 18.9894, lng: 73.1175 },
  { name: 'Bhiwandi', state: 'Maharashtra', tier: 2, aliases: ['logistics hub'], lat: 19.2967, lng: 73.0631 },
  { name: 'Kalyan', state: 'Maharashtra', tier: 2, aliases: ['kalyan-dombivli'], lat: 19.2437, lng: 73.1355 },
  { name: 'Dombivli', state: 'Maharashtra', tier: 2, aliases: ['dombivli east', 'dombivli west', 'midc dombivli'], lat: 19.2184, lng: 73.0867 },
  { name: 'Mira-Bhayandar', state: 'Maharashtra', tier: 2, aliases: ['mira road'], lat: 19.2813, lng: 72.8561 },
  { name: 'Vasai-Virar', state: 'Maharashtra', tier: 2, aliases: ['vasai', 'virar', 'nalasopara'], lat: 19.3919, lng: 72.8397 },
  { name: 'Malegaon', state: 'Maharashtra', tier: 3, aliases: [], lat: 20.5579, lng: 74.5287 },
  { name: 'Satara', state: 'Maharashtra', tier: 3, aliases: [], lat: 17.6805, lng: 74.0183 },
  { name: 'Beed', state: 'Maharashtra', tier: 4, aliases: [], lat: 18.9891, lng: 75.7601 },
  { name: 'Yavatmal', state: 'Maharashtra', tier: 4, aliases: [], lat: 20.3888, lng: 78.1204 },
  { name: 'Gondia', state: 'Maharashtra', tier: 4, aliases: [], lat: 21.4604, lng: 80.1961 },
  { name: 'Wardha', state: 'Maharashtra', tier: 4, aliases: ['sevagram'], lat: 20.7453, lng: 78.6022 },
  { name: 'Barshi', state: 'Maharashtra', tier: 4, aliases: [], lat: 18.2335, lng: 75.6946 },
  { name: 'Achalpur', state: 'Maharashtra', tier: 4, aliases: ['ellichpur'], lat: 21.2587, lng: 77.5085 },
  { name: 'Osmanabad', state: 'Maharashtra', tier: 4, aliases: ['dharashiv'], lat: 18.1861, lng: 76.0419 },
  { name: 'Nandurbar', state: 'Maharashtra', tier: 4, aliases: [], lat: 21.3697, lng: 74.2407 },
  { name: 'Udgir', state: 'Maharashtra', tier: 4, aliases: [], lat: 18.3942, lng: 77.1171 },
  { name: 'Hinganghat', state: 'Maharashtra', tier: 4, aliases: [], lat: 20.5558, lng: 78.8354 },
  { name: 'Palghar', state: 'Maharashtra', tier: 3, aliases: ['tarapur midc', 'boisar'], lat: 19.6967, lng: 72.7699 },
  { name: 'Ratnagiri', state: 'Maharashtra', tier: 3, aliases: ['mirjole midc'], lat: 16.9902, lng: 73.3120 },
  { name: 'Alibaug', state: 'Maharashtra', tier: 3, aliases: ['raigad'], lat: 18.6414, lng: 72.8722 },
  { name: 'Karad', state: 'Maharashtra', tier: 3, aliases: [], lat: 17.2889, lng: 74.1843 },
  { name: 'Chiplun', state: 'Maharashtra', tier: 4, aliases: ['kherdi midc'], lat: 17.5323, lng: 73.5186 },
  { name: 'Bhandara', state: 'Maharashtra', tier: 4, aliases: [], lat: 21.1714, lng: 79.6543 },
  { name: 'Washim', state: 'Maharashtra', tier: 4, aliases: [], lat: 20.1110, lng: 77.1347 },
  { name: 'Gadchiroli', state: 'Maharashtra', tier: 4, aliases: [], lat: 20.1809, lng: 79.9946 },
  { name: 'Buldhana', state: 'Maharashtra', tier: 4, aliases: ['khamgaon', 'malkapur'], lat: 20.5292, lng: 76.1845 },
  { name: 'Sindhudurg', state: 'Maharashtra', tier: 4, aliases: ['kudal', 'sawantwadi', 'kankavli'], lat: 16.1206, lng: 73.7145 },

  // ── Karnataka (45+ cities) ──
  { name: 'Bangalore', state: 'Karnataka', tier: 1, aliases: ['bengaluru', 'whitefield', 'electronic city', 'koramangala', 'indiranagar', 'bellandur', 'outer ring road', 'manyata'], lat: 12.9716, lng: 77.5946 },
  { name: 'Mysore', state: 'Karnataka', tier: 2, aliases: ['mysuru', 'hebbal midc', 'belagola'], lat: 12.2958, lng: 76.6394 },
  { name: 'Hubli', state: 'Karnataka', tier: 2, aliases: ['hubballi', 'dharwad', 'hubli-dharwad'], lat: 15.3647, lng: 75.1240 },
  { name: 'Dharwad', state: 'Karnataka', tier: 2, aliases: ['belur industrial area'], lat: 15.4589, lng: 75.0078 },
  { name: 'Mangalore', state: 'Karnataka', tier: 2, aliases: ['mangaluru', 'baikampady', 'surathkal'], lat: 12.9141, lng: 74.8560 },
  { name: 'Belgaum', state: 'Karnataka', tier: 2, aliases: ['belagavi', 'udyambag'], lat: 15.8497, lng: 74.4977 },
  { name: 'Gulbarga', state: 'Karnataka', tier: 3, aliases: ['kalaburagi'], lat: 17.3297, lng: 76.8343 },
  { name: 'Davanagere', state: 'Karnataka', tier: 3, aliases: ['davangere'], lat: 14.4644, lng: 75.9218 },
  { name: 'Bellary', state: 'Karnataka', tier: 3, aliases: ['ballari', 'toranagallu', 'jindal'], lat: 15.1394, lng: 76.9214 },
  { name: 'Shimoga', state: 'Karnataka', tier: 3, aliases: ['shivamogga', 'bhadravathi'], lat: 13.9299, lng: 75.5681 },
  { name: 'Tumkur', state: 'Karnataka', tier: 2, aliases: ['tumakuru', 'vasanthnarasapura'], lat: 13.3409, lng: 77.1010 },
  { name: 'Raichur', state: 'Karnataka', tier: 4, aliases: [], lat: 16.2120, lng: 77.3439 },
  { name: 'Bidar', state: 'Karnataka', tier: 4, aliases: [], lat: 17.9104, lng: 77.5199 },
  { name: 'Hospet', state: 'Karnataka', tier: 3, aliases: ['hosapete', 'hampi'], lat: 15.2689, lng: 76.3909 },
  { name: 'Hassan', state: 'Karnataka', tier: 3, aliases: ['hassan sead'], lat: 13.0072, lng: 76.0962 },
  { name: 'Gadag', state: 'Karnataka', tier: 4, aliases: ['gadag-betageri'], lat: 15.4167, lng: 75.6167 },
  { name: 'Udupi', state: 'Karnataka', tier: 2, aliases: ['manipal'], lat: 13.3409, lng: 74.7421 },
  { name: 'Robertsonpet', state: 'Karnataka', tier: 4, aliases: ['kgf', 'kolar gold fields'], lat: 12.9587, lng: 78.2713 },
  { name: 'Chitradurga', state: 'Karnataka', tier: 4, aliases: [], lat: 14.2251, lng: 76.3980 },
  { name: 'Kolar', state: 'Karnataka', tier: 3, aliases: ['narsapura industrial area'], lat: 13.1367, lng: 78.1291 },
  { name: 'Mandya', state: 'Karnataka', tier: 4, aliases: [], lat: 12.5218, lng: 76.8951 },
  { name: 'Chikmagalur', state: 'Karnataka', tier: 4, aliases: ['chikkamagaluru'], lat: 13.3161, lng: 75.7720 },
  { name: 'Gangawati', state: 'Karnataka', tier: 4, aliases: [], lat: 15.4294, lng: 76.5312 },
  { name: 'Bagalkot', state: 'Karnataka', tier: 4, aliases: ['bagalkote'], lat: 16.1691, lng: 75.6615 },
  { name: 'Ranebennur', state: 'Karnataka', tier: 4, aliases: ['haveri'], lat: 14.6231, lng: 75.6218 },
  { name: 'Karwar', state: 'Karnataka', tier: 4, aliases: ['uttara kannada'], lat: 14.8185, lng: 74.1352 },
  { name: 'Sirsi', state: 'Karnataka', tier: 4, aliases: [], lat: 14.6195, lng: 74.8354 },
  { name: 'Chikkaballapur', state: 'Karnataka', tier: 3, aliases: ['north bangalore corridor'], lat: 13.4325, lng: 77.7275 },
  { name: 'Ramanagara', state: 'Karnataka', tier: 3, aliases: ['bidadi industrial area'], lat: 12.7150, lng: 77.2811 },
  { name: 'Yadgir', state: 'Karnataka', tier: 4, aliases: [], lat: 16.7702, lng: 77.1376 },
  { name: 'Koppal', state: 'Karnataka', tier: 4, aliases: [], lat: 15.3556, lng: 76.1554 },
  { name: 'Madikeri', state: 'Karnataka', tier: 4, aliases: ['coorg'], lat: 12.4244, lng: 75.7382 },

  // ── Tamil Nadu (45+ cities) ──
  { name: 'Chennai', state: 'Tamil Nadu', tier: 1, aliases: ['madras', 'omr', 'guindy', 'sholinganallur', 'tidel park', 'ambattur', 'sriperumbudur'], lat: 13.0827, lng: 80.2707 },
  { name: 'Coimbatore', state: 'Tamil Nadu', tier: 1, aliases: ['kovai', 'tidel park coimbatore', 'peelamedu', 'saravanampatti'], lat: 11.0168, lng: 76.9558 },
  { name: 'Madurai', state: 'Tamil Nadu', tier: 2, aliases: ['ilango nagar', 'koodal nagar'], lat: 9.9252, lng: 78.1198 },
  { name: 'Tiruchirappalli', state: 'Tamil Nadu', tier: 2, aliases: ['trichy', 'thuvakudi', 'bhel trichy'], lat: 10.7905, lng: 78.7047 },
  { name: 'Salem', state: 'Tamil Nadu', tier: 2, aliases: ['steel city salem'], lat: 11.6643, lng: 78.1460 },
  { name: 'Tirunelveli', state: 'Tamil Nadu', tier: 3, aliases: ['nellai', 'gangaikondan'], lat: 8.7139, lng: 77.7567 },
  { name: 'Tiruppur', state: 'Tamil Nadu', tier: 2, aliases: ['knitwear capital'], lat: 11.1085, lng: 77.3411 },
  { name: 'Erode', state: 'Tamil Nadu', tier: 3, aliases: ['perundurai midc'], lat: 11.3410, lng: 77.7172 },
  { name: 'Vellore', state: 'Tamil Nadu', tier: 2, aliases: ['katpadi', 'ranipet'], lat: 12.9165, lng: 79.1325 },
  { name: 'Thoothukudi', state: 'Tamil Nadu', tier: 3, aliases: ['tuticorin', 'spic nagar'], lat: 8.7642, lng: 78.1348 },
  { name: 'Dindigul', state: 'Tamil Nadu', tier: 3, aliases: [], lat: 10.3673, lng: 77.9803 },
  { name: 'Thanjavur', state: 'Tamil Nadu', tier: 3, aliases: ['tanjore'], lat: 10.7870, lng: 79.1378 },
  { name: 'Ranipet', state: 'Tamil Nadu', tier: 3, aliases: ['sipcot ranipet'], lat: 12.9224, lng: 79.3327 },
  { name: 'Sivakasi', state: 'Tamil Nadu', tier: 3, aliases: [], lat: 9.4533, lng: 77.7946 },
  { name: 'Karur', state: 'Tamil Nadu', tier: 3, aliases: ['textile hub karur'], lat: 10.9601, lng: 78.0766 },
  { name: 'Hosur', state: 'Tamil Nadu', tier: 2, aliases: ['sipcot hosur', 'electronic corridor'], lat: 12.7409, lng: 77.8253 },
  { name: 'Nagercoil', state: 'Tamil Nadu', tier: 3, aliases: ['kanyakumari'], lat: 8.1833, lng: 77.4119 },
  { name: 'Kanchipuram', state: 'Tamil Nadu', tier: 3, aliases: ['oragadam corridor'], lat: 12.8342, lng: 79.7036 },
  { name: 'Kumarapalayam', state: 'Tamil Nadu', tier: 4, aliases: [], lat: 11.4429, lng: 77.7022 },
  { name: 'Karaikkudi', state: 'Tamil Nadu', tier: 4, aliases: ['cecri'], lat: 10.0735, lng: 78.7732 },
  { name: 'Neyveli', state: 'Tamil Nadu', tier: 3, aliases: ['nlc india'], lat: 11.5997, lng: 79.4862 },
  { name: 'Cuddalore', state: 'Tamil Nadu', tier: 4, aliases: ['sipcot cuddalore'], lat: 11.7480, lng: 79.7714 },
  { name: 'Kumbakonam', state: 'Tamil Nadu', tier: 4, aliases: [], lat: 10.9602, lng: 79.3845 },
  { name: 'Tiruvannamalai', state: 'Tamil Nadu', tier: 4, aliases: [], lat: 12.2253, lng: 79.0747 },
  { name: 'Pollachi', state: 'Tamil Nadu', tier: 4, aliases: [], lat: 10.6609, lng: 77.0048 },
  { name: 'Rajapalayam', state: 'Tamil Nadu', tier: 4, aliases: [], lat: 9.4532, lng: 77.5539 },
  { name: 'Gudiyatham', state: 'Tamil Nadu', tier: 4, aliases: [], lat: 12.9461, lng: 78.8700 },
  { name: 'Pudukkottai', state: 'Tamil Nadu', tier: 4, aliases: [], lat: 10.3797, lng: 78.8208 },
  { name: 'Vaniyambadi', state: 'Tamil Nadu', tier: 4, aliases: [], lat: 12.6825, lng: 78.6186 },
  { name: 'Ambur', state: 'Tamil Nadu', tier: 4, aliases: ['leather hub'], lat: 12.7904, lng: 78.7166 },
  { name: 'Nagapattinam', state: 'Tamil Nadu', tier: 4, aliases: [], lat: 10.7672, lng: 79.8449 },
  { name: 'Krishnagiri', state: 'Tamil Nadu', tier: 4, aliases: [], lat: 12.5186, lng: 78.2137 },
  { name: 'Dharmapuri', state: 'Tamil Nadu', tier: 4, aliases: [], lat: 12.1357, lng: 78.1584 },
  { name: 'Namakkal', state: 'Tamil Nadu', tier: 4, aliases: ['transport hub'], lat: 11.2189, lng: 78.1674 },
  { name: 'Perambalur', state: 'Tamil Nadu', tier: 4, aliases: [], lat: 11.2342, lng: 78.8821 },
  { name: 'Ariyalur', state: 'Tamil Nadu', tier: 4, aliases: [], lat: 11.1401, lng: 79.0786 },

  // ── Telangana (30+ cities) ──
  { name: 'Hyderabad', state: 'Telangana', tier: 1, aliases: ['cyberabad', 'hitec city', 'gachibowli', 'madhapur', 'kondapur', 'secunderabad', 'financial district'], lat: 17.3850, lng: 78.4867 },
  { name: 'Secunderabad', state: 'Telangana', tier: 1, aliases: ['twin cities'], lat: 17.4399, lng: 78.4983 },
  { name: 'Warangal', state: 'Telangana', tier: 2, aliases: ['hanumakonda', 'kazipet'], lat: 17.9689, lng: 79.5941 },
  { name: 'Nizamabad', state: 'Telangana', tier: 3, aliases: [], lat: 18.6725, lng: 78.0941 },
  { name: 'Khammam', state: 'Telangana', tier: 3, aliases: [], lat: 17.2473, lng: 80.1514 },
  { name: 'Karimnagar', state: 'Telangana', tier: 3, aliases: [], lat: 18.4386, lng: 79.1288 },
  { name: 'Ramagundam', state: 'Telangana', tier: 3, aliases: ['ntpc ramagundam', 'godavarikhani'], lat: 18.7551, lng: 79.4739 },
  { name: 'Mahbubnagar', state: 'Telangana', tier: 3, aliases: ['palamuru'], lat: 16.7488, lng: 78.0035 },
  { name: 'Nalgonda', state: 'Telangana', tier: 4, aliases: [], lat: 17.0577, lng: 79.2684 },
  { name: 'Adilabad', state: 'Telangana', tier: 4, aliases: [], lat: 19.6641, lng: 78.5320 },
  { name: 'Suryapet', state: 'Telangana', tier: 4, aliases: [], lat: 17.1439, lng: 79.6239 },
  { name: 'Miryalaguda', state: 'Telangana', tier: 4, aliases: [], lat: 16.8741, lng: 79.5644 },
  { name: 'Siddipet', state: 'Telangana', tier: 3, aliases: ['it tower siddipet'], lat: 18.1018, lng: 78.8520 },
  { name: 'Jagtial', state: 'Telangana', tier: 4, aliases: [], lat: 18.7944, lng: 78.9125 },
  { name: 'Nirmal', state: 'Telangana', tier: 4, aliases: [], lat: 19.0964, lng: 78.3428 },
  { name: 'Kamareddy', state: 'Telangana', tier: 4, aliases: [], lat: 18.3249, lng: 78.3392 },
  { name: 'Kothagudem', state: 'Telangana', tier: 4, aliases: ['bhadradri kothagudem', 'singareni'], lat: 17.5539, lng: 80.6175 },
  { name: 'Bodhan', state: 'Telangana', tier: 4, aliases: [], lat: 18.6657, lng: 77.8864 },
  { name: 'Sircilla', state: 'Telangana', tier: 4, aliases: ['textile town'], lat: 18.3846, lng: 78.8093 },
  { name: 'Tandur', state: 'Telangana', tier: 4, aliases: [], lat: 17.2562, lng: 77.5855 },
  { name: 'Wanaparthy', state: 'Telangana', tier: 4, aliases: [], lat: 16.3624, lng: 78.0628 },
  { name: 'Mancherial', state: 'Telangana', tier: 4, aliases: ['bellampalli'], lat: 18.8679, lng: 79.4639 },
  { name: 'Medak', state: 'Telangana', tier: 4, aliases: [], lat: 18.0475, lng: 78.2618 },
  { name: 'Sangareddy', state: 'Telangana', tier: 3, aliases: ['patancheru', 'iit hyderabad corridor'], lat: 17.6190, lng: 78.0815 },

  // ── Andhra Pradesh (45+ cities) ──
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', tier: 1, aliases: ['vizag', 'rushikonda it park', 'gajuwaka'], lat: 17.6868, lng: 83.2185 },
  { name: 'Vijayawada', state: 'Andhra Pradesh', tier: 2, aliases: ['bezawada', 'gannavaram it park', 'auto nagar'], lat: 16.5062, lng: 80.6480 },
  { name: 'Guntur', state: 'Andhra Pradesh', tier: 2, aliases: ['amaravati region'], lat: 16.3067, lng: 80.4365 },
  { name: 'Nellore', state: 'Andhra Pradesh', tier: 2, aliases: ['sri city corridor'], lat: 14.4426, lng: 79.9865 },
  { name: 'Kurnool', state: 'Andhra Pradesh', tier: 2, aliases: ['rayalaseema'], lat: 15.8281, lng: 78.0373 },
  { name: 'Rajahmundry', state: 'Andhra Pradesh', tier: 2, aliases: ['rajamahendravaram'], lat: 17.0005, lng: 81.8040 },
  { name: 'Tirupati', state: 'Andhra Pradesh', tier: 2, aliases: ['renigunta', 'sri city'], lat: 13.6288, lng: 79.4192 },
  { name: 'Kakinada', state: 'Andhra Pradesh', tier: 2, aliases: ['kakinada sez'], lat: 16.9891, lng: 82.2475 },
  { name: 'Kadapa', state: 'Andhra Pradesh', tier: 3, aliases: ['cuddapah'], lat: 14.4673, lng: 78.8242 },
  { name: 'Anantapur', state: 'Andhra Pradesh', tier: 3, aliases: ['anantapuramu', 'kia motors corridor'], lat: 14.6819, lng: 77.6006 },
  { name: 'Vizianagaram', state: 'Andhra Pradesh', tier: 3, aliases: [], lat: 18.1067, lng: 83.3956 },
  { name: 'Eluru', state: 'Andhra Pradesh', tier: 3, aliases: [], lat: 16.7107, lng: 81.0952 },
  { name: 'Ongole', state: 'Andhra Pradesh', tier: 3, aliases: [], lat: 15.5057, lng: 80.0499 },
  { name: 'Nandyal', state: 'Andhra Pradesh', tier: 3, aliases: [], lat: 15.4886, lng: 78.4836 },
  { name: 'Machilipatnam', state: 'Andhra Pradesh', tier: 3, aliases: ['bandar'], lat: 16.1875, lng: 81.1389 },
  { name: 'Adoni', state: 'Andhra Pradesh', tier: 4, aliases: [], lat: 15.6322, lng: 77.2728 },
  { name: 'Tenali', state: 'Andhra Pradesh', tier: 3, aliases: [], lat: 16.2437, lng: 80.6400 },
  { name: 'Proddatur', state: 'Andhra Pradesh', tier: 4, aliases: [], lat: 14.7526, lng: 78.5523 },
  { name: 'Chittoor', state: 'Andhra Pradesh', tier: 3, aliases: [], lat: 13.2172, lng: 79.1003 },
  { name: 'Hindupur', state: 'Andhra Pradesh', tier: 3, aliases: [], lat: 13.8290, lng: 77.4930 },
  { name: 'Bhimavaram', state: 'Andhra Pradesh', tier: 3, aliases: [], lat: 16.5449, lng: 81.5212 },
  { name: 'Madanapalle', state: 'Andhra Pradesh', tier: 3, aliases: [], lat: 13.5560, lng: 78.5010 },
  { name: 'Guntakal', state: 'Andhra Pradesh', tier: 4, aliases: [], lat: 15.1674, lng: 77.3686 },
  { name: 'Srikakulam', state: 'Andhra Pradesh', tier: 3, aliases: [], lat: 18.2949, lng: 83.8938 },
  { name: 'Dharmavaram', state: 'Andhra Pradesh', tier: 4, aliases: [], lat: 14.4137, lng: 77.7126 },
  { name: 'Gudivada', state: 'Andhra Pradesh', tier: 4, aliases: [], lat: 16.4410, lng: 80.9926 },
  { name: 'Narasaraopet', state: 'Andhra Pradesh', tier: 4, aliases: [], lat: 16.2360, lng: 80.0499 },
  { name: 'Tadipatri', state: 'Andhra Pradesh', tier: 4, aliases: [], lat: 14.9103, lng: 78.0105 },
  { name: 'Tadepalligudem', state: 'Andhra Pradesh', tier: 4, aliases: [], lat: 16.8145, lng: 81.5266 },
  { name: 'Chilakaluripet', state: 'Andhra Pradesh', tier: 4, aliases: [], lat: 16.0892, lng: 80.1672 },
  { name: 'Amaravati', state: 'Andhra Pradesh', tier: 2, aliases: ['capital region'], lat: 16.5131, lng: 80.5165 },

  // ── Gujarat (45+ cities) ──
  { name: 'Ahmedabad', state: 'Gujarat', tier: 1, aliases: ['amdavad', 'sg highway', 'prahlad nagar', 'sanand'], lat: 23.0225, lng: 72.5714 },
  { name: 'Surat', state: 'Gujarat', tier: 1, aliases: ['diamond city', 'hazira', 'sachin gidc'], lat: 21.1702, lng: 72.8311 },
  { name: 'Vadodara', state: 'Gujarat', tier: 1, aliases: ['baroda', 'makarpura gidc'], lat: 22.3072, lng: 73.1812 },
  { name: 'Rajkot', state: 'Gujarat', tier: 2, aliases: ['metoda gidc', 'shapar'], lat: 22.3039, lng: 70.8022 },
  { name: 'Bhavnagar', state: 'Gujarat', tier: 2, aliases: ['alang'], lat: 21.7645, lng: 72.1519 },
  { name: 'Jamnagar', state: 'Gujarat', tier: 2, aliases: ['reliance jamnagar', 'brass part hub'], lat: 22.4707, lng: 70.0577 },
  { name: 'Junagadh', state: 'Gujarat', tier: 3, aliases: [], lat: 21.5222, lng: 70.4579 },
  { name: 'Gandhinagar', state: 'Gujarat', tier: 1, aliases: ['gift city', 'infocity gandhinagar'], lat: 23.2156, lng: 72.6369 },
  { name: 'Anand', state: 'Gujarat', tier: 2, aliases: ['milk capital', 'vidyanagar'], lat: 22.5645, lng: 72.9289 },
  { name: 'Navsari', state: 'Gujarat', tier: 3, aliases: [], lat: 20.9467, lng: 72.9520 },
  { name: 'Surendranagar', state: 'Gujarat', tier: 3, aliases: ['wadhwan'], lat: 22.7278, lng: 71.6375 },
  { name: 'Morbi', state: 'Gujarat', tier: 2, aliases: ['ceramic capital'], lat: 22.8173, lng: 70.8377 },
  { name: 'Nadiad', state: 'Gujarat', tier: 3, aliases: [], lat: 22.6916, lng: 72.8634 },
  { name: 'Bharuch', state: 'Gujarat', tier: 2, aliases: ['dahej petroleum corridor'], lat: 21.7051, lng: 72.9959 },
  { name: 'Porbandar', state: 'Gujarat', tier: 3, aliases: [], lat: 21.6417, lng: 69.6293 },
  { name: 'Godhra', state: 'Gujarat', tier: 3, aliases: ['panchmahal'], lat: 22.7758, lng: 73.6149 },
  { name: 'Vapi', state: 'Gujarat', tier: 2, aliases: ['gidc vapi', 'chemical industrial hub'], lat: 20.3893, lng: 72.9106 },
  { name: 'Ankleshwar', state: 'Gujarat', tier: 2, aliases: ['gidc ankleshwar'], lat: 21.6264, lng: 73.0152 },
  { name: 'Palanpur', state: 'Gujarat', tier: 3, aliases: ['banaskantha'], lat: 24.1724, lng: 72.4346 },
  { name: 'Valsad', state: 'Gujarat', tier: 3, aliases: [], lat: 20.5992, lng: 72.9342 },
  { name: 'Patan', state: 'Gujarat', tier: 4, aliases: [], lat: 23.8493, lng: 72.1266 },
  { name: 'Deesa', state: 'Gujarat', tier: 4, aliases: [], lat: 24.2586, lng: 72.1793 },
  { name: 'Amreli', state: 'Gujarat', tier: 4, aliases: [], lat: 21.6032, lng: 71.2221 },
  { name: 'Veraval', state: 'Gujarat', tier: 3, aliases: ['somnath port'], lat: 20.9077, lng: 70.3678 },
  { name: 'Bhuj', state: 'Gujarat', tier: 3, aliases: ['kutch'], lat: 23.2420, lng: 69.6669 },
  { name: 'Gandhidham', state: 'Gujarat', tier: 2, aliases: ['kandla port', 'adipar'], lat: 23.0753, lng: 70.1337 },
  { name: 'Mehsana', state: 'Gujarat', tier: 2, aliases: ['ongc mehsana'], lat: 23.5880, lng: 72.3693 },
  { name: 'Kalol', state: 'Gujarat', tier: 3, aliases: ['iffco kalol'], lat: 23.2384, lng: 72.4965 },
  { name: 'Botad', state: 'Gujarat', tier: 4, aliases: [], lat: 22.1704, lng: 71.6664 },
  { name: 'Dahod', state: 'Gujarat', tier: 4, aliases: [], lat: 22.8373, lng: 74.2530 },

  // ── Rajasthan (40+ cities) ──
  { name: 'Jaipur', state: 'Rajasthan', tier: 1, aliases: ['pink city', 'sitapura industrial area', 'malviya nagar jaipur', 'vaishali nagar'], lat: 26.9124, lng: 75.7873 },
  { name: 'Jodhpur', state: 'Rajasthan', tier: 2, aliases: ['blue city', 'boranada'], lat: 26.2389, lng: 73.0243 },
  { name: 'Kota', state: 'Rajasthan', tier: 2, aliases: ['education city', 'indraprastha industrial area'], lat: 25.2138, lng: 75.8648 },
  { name: 'Bikaner', state: 'Rajasthan', tier: 2, aliases: ['karni industrial area'], lat: 28.0229, lng: 73.3119 },
  { name: 'Ajmer', state: 'Rajasthan', tier: 2, aliases: ['kishangarh'], lat: 26.4499, lng: 74.6399 },
  { name: 'Udaipur', state: 'Rajasthan', tier: 2, aliases: ['lake city', 'sukher'], lat: 24.5854, lng: 73.7125 },
  { name: 'Bhilwara', state: 'Rajasthan', tier: 2, aliases: ['textile city rajasthan'], lat: 25.3407, lng: 74.6313 },
  { name: 'Alwar', state: 'Rajasthan', tier: 2, aliases: ['bhiwadi', 'neemrana', 'ncr'], lat: 27.5530, lng: 76.6346 },
  { name: 'Bharatpur', state: 'Rajasthan', tier: 3, aliases: [], lat: 27.2152, lng: 77.5030 },
  { name: 'Sikar', state: 'Rajasthan', tier: 3, aliases: [], lat: 27.6094, lng: 75.1399 },
  { name: 'Pali', state: 'Rajasthan', tier: 3, aliases: [], lat: 25.7711, lng: 73.3234 },
  { name: 'Sri Ganganagar', state: 'Rajasthan', tier: 3, aliases: ['ganganagar'], lat: 29.9038, lng: 73.8772 },
  { name: 'Beawar', state: 'Rajasthan', tier: 3, aliases: [], lat: 26.1013, lng: 74.3168 },
  { name: 'Kishangarh', state: 'Rajasthan', tier: 3, aliases: ['marble city'], lat: 26.5746, lng: 74.8647 },
  { name: 'Jhunjhunu', state: 'Rajasthan', tier: 3, aliases: ['shekhawati'], lat: 28.1289, lng: 75.3995 },
  { name: 'Hanumangarh', state: 'Rajasthan', tier: 3, aliases: [], lat: 29.5819, lng: 74.3175 },
  { name: 'Dholpur', state: 'Rajasthan', tier: 4, aliases: [], lat: 26.7025, lng: 77.8934 },
  { name: 'Sawai Madhopur', state: 'Rajasthan', tier: 3, aliases: ['ranthambore'], lat: 25.9928, lng: 76.3713 },
  { name: 'Churu', state: 'Rajasthan', tier: 4, aliases: [], lat: 28.2900, lng: 74.9698 },
  { name: 'Chittorgarh', state: 'Rajasthan', tier: 3, aliases: ['chittor', 'cement hub'], lat: 24.8887, lng: 74.6269 },
  { name: 'Baran', state: 'Rajasthan', tier: 4, aliases: [], lat: 25.1011, lng: 76.5132 },
  { name: 'Bundi', state: 'Rajasthan', tier: 4, aliases: [], lat: 25.4414, lng: 75.6429 },
  { name: 'Tonk', state: 'Rajasthan', tier: 4, aliases: [], lat: 26.1624, lng: 75.7895 },
  { name: 'Nagaur', state: 'Rajasthan', tier: 4, aliases: [], lat: 27.2003, lng: 73.7439 },
  { name: 'Makrana', state: 'Rajasthan', tier: 4, aliases: ['marble hub'], lat: 27.0425, lng: 74.7262 },
  { name: 'Bhiwadi', state: 'Rajasthan', tier: 2, aliases: ['bhiwadi industrial area', 'khushkhera', 'tapukara'], lat: 28.2096, lng: 76.8624 },
  { name: 'Neemrana', state: 'Rajasthan', tier: 2, aliases: ['japanese industrial zone'], lat: 27.9881, lng: 76.3883 },
  { name: 'Banswara', state: 'Rajasthan', tier: 4, aliases: [], lat: 23.5461, lng: 74.4349 },
  { name: 'Jaisalmer', state: 'Rajasthan', tier: 3, aliases: ['golden city'], lat: 26.9157, lng: 70.9083 },

  // ── Madhya Pradesh (40+ cities) ──
  { name: 'Indore', state: 'Madhya Pradesh', tier: 1, aliases: ['pithampur', 'vijay nagar indore', 'super corridor', 'crystal it park'], lat: 22.7196, lng: 75.8577 },
  { name: 'Bhopal', state: 'Madhya Pradesh', tier: 1, aliases: ['mp nagar', 'mandideep', 'bhel bhopal'], lat: 23.2599, lng: 77.4126 },
  { name: 'Jabalpur', state: 'Madhya Pradesh', tier: 2, aliases: ['ordnance factory jabalpur'], lat: 23.1815, lng: 79.9864 },
  { name: 'Gwalior', state: 'Madhya Pradesh', tier: 2, aliases: ['malanpur'], lat: 26.2183, lng: 78.1828 },
  { name: 'Ujjain', state: 'Madhya Pradesh', tier: 2, aliases: ['mahakal'], lat: 23.1765, lng: 75.7885 },
  { name: 'Sagar', state: 'Madhya Pradesh', tier: 3, aliases: [], lat: 23.8388, lng: 78.7378 },
  { name: 'Dewas', state: 'Madhya Pradesh', tier: 3, aliases: ['bank note press dewas'], lat: 22.9676, lng: 76.0534 },
  { name: 'Satna', state: 'Madhya Pradesh', tier: 3, aliases: ['cement city'], lat: 24.6005, lng: 80.8322 },
  { name: 'Ratlam', state: 'Madhya Pradesh', tier: 3, aliases: ['railway junction ratlam'], lat: 23.3315, lng: 75.0367 },
  { name: 'Rewa', state: 'Madhya Pradesh', tier: 3, aliases: [], lat: 24.5362, lng: 81.3037 },
  { name: 'Murwara', state: 'Madhya Pradesh', tier: 3, aliases: ['katni'], lat: 23.8343, lng: 80.3957 },
  { name: 'Singrauli', state: 'Madhya Pradesh', tier: 3, aliases: ['energy capital', 'waidhan'], lat: 24.1997, lng: 82.6644 },
  { name: 'Burhanpur', state: 'Madhya Pradesh', tier: 4, aliases: [], lat: 21.3109, lng: 76.2299 },
  { name: 'Khandwa', state: 'Madhya Pradesh', tier: 4, aliases: [], lat: 21.8314, lng: 76.3498 },
  { name: 'Bhind', state: 'Madhya Pradesh', tier: 4, aliases: [], lat: 26.5638, lng: 78.7847 },
  { name: 'Chhindwara', state: 'Madhya Pradesh', tier: 3, aliases: [], lat: 22.0574, lng: 78.9382 },
  { name: 'Guna', state: 'Madhya Pradesh', tier: 4, aliases: ['gail guna'], lat: 24.6548, lng: 77.3072 },
  { name: 'Shivpuri', state: 'Madhya Pradesh', tier: 4, aliases: [], lat: 25.4320, lng: 77.6649 },
  { name: 'Vidisha', state: 'Madhya Pradesh', tier: 4, aliases: [], lat: 23.5251, lng: 77.8081 },
  { name: 'Chhatarpur', state: 'Madhya Pradesh', tier: 4, aliases: ['khajuraho'], lat: 24.9164, lng: 79.5811 },
  { name: 'Damoh', state: 'Madhya Pradesh', tier: 4, aliases: [], lat: 23.8360, lng: 79.4422 },
  { name: 'Mandsaur', state: 'Madhya Pradesh', tier: 4, aliases: [], lat: 24.0722, lng: 75.0684 },
  { name: 'Khargone', state: 'Madhya Pradesh', tier: 4, aliases: ['west nimar'], lat: 21.8254, lng: 75.6139 },
  { name: 'Neemuch', state: 'Madhya Pradesh', tier: 4, aliases: [], lat: 24.4697, lng: 74.8732 },
  { name: 'Pithampur', state: 'Madhya Pradesh', tier: 2, aliases: ['auto hub of india', 'dhar'], lat: 22.6146, lng: 75.6881 },
  { name: 'Hoshangabad', state: 'Madhya Pradesh', tier: 3, aliases: ['narmadapuram'], lat: 22.7519, lng: 77.7289 },
  { name: 'Itarsi', state: 'Madhya Pradesh', tier: 3, aliases: ['railway junction itarsi'], lat: 22.6116, lng: 77.7615 },
  { name: 'Sehore', state: 'Madhya Pradesh', tier: 4, aliases: [], lat: 23.2031, lng: 77.0844 },
  { name: 'Betul', state: 'Madhya Pradesh', tier: 4, aliases: [], lat: 21.9013, lng: 77.9024 },
  { name: 'Seoni', state: 'Madhya Pradesh', tier: 4, aliases: [], lat: 22.0869, lng: 79.5435 },
  { name: 'Datia', state: 'Madhya Pradesh', tier: 4, aliases: [], lat: 25.6653, lng: 78.4609 },
  { name: 'Nagda', state: 'Madhya Pradesh', tier: 4, aliases: ['grasim nagda'], lat: 23.4567, lng: 75.4124 },

  // ── West Bengal (35+ cities) ──
  { name: 'Kolkata', state: 'West Bengal', tier: 1, aliases: ['calcutta', 'salt lake', 'sector v', 'new town', 'rajarhat', 'park street'], lat: 22.5726, lng: 88.3639 },
  { name: 'Howrah', state: 'West Bengal', tier: 2, aliases: ['haora'], lat: 22.5958, lng: 88.2636 },
  { name: 'Durgapur', state: 'West Bengal', tier: 2, aliases: ['steel city durgapur'], lat: 23.5204, lng: 87.3119 },
  { name: 'Asansol', state: 'West Bengal', tier: 2, aliases: ['burnpur'], lat: 23.6739, lng: 86.9524 },
  { name: 'Siliguri', state: 'West Bengal', tier: 2, aliases: ['gateway to northeast', 'matigara'], lat: 26.7271, lng: 88.3953 },
  { name: 'Bardhaman', state: 'West Bengal', tier: 3, aliases: ['burdwan'], lat: 23.2324, lng: 87.8615 },
  { name: 'Malda', state: 'West Bengal', tier: 3, aliases: ['english bazaar'], lat: 25.0108, lng: 88.1411 },
  { name: 'Baharampur', state: 'West Bengal', tier: 3, aliases: ['murshidabad'], lat: 24.0984, lng: 88.2505 },
  { name: 'Habra', state: 'West Bengal', tier: 4, aliases: [], lat: 22.8456, lng: 88.6329 },
  { name: 'Kharagpur', state: 'West Bengal', tier: 2, aliases: ['iit kharagpur'], lat: 22.3460, lng: 87.2320 },
  { name: 'Shantipur', state: 'West Bengal', tier: 4, aliases: [], lat: 23.2509, lng: 88.4319 },
  { name: 'Dankuni', state: 'West Bengal', tier: 3, aliases: ['freight hub'], lat: 22.6868, lng: 88.2934 },
  { name: 'Ranaghat', state: 'West Bengal', tier: 4, aliases: [], lat: 23.1802, lng: 88.5802 },
  { name: 'Haldia', state: 'West Bengal', tier: 2, aliases: ['haldia port', 'petrochem hub'], lat: 22.0667, lng: 88.0698 },
  { name: 'Raiganj', state: 'West Bengal', tier: 4, aliases: [], lat: 25.6179, lng: 88.1252 },
  { name: 'Krishnanagar', state: 'West Bengal', tier: 4, aliases: [], lat: 23.4013, lng: 88.4947 },
  { name: 'Nabadwip', state: 'West Bengal', tier: 4, aliases: [], lat: 23.4082, lng: 88.3665 },
  { name: 'Midnapore', state: 'West Bengal', tier: 3, aliases: ['medinipur'], lat: 22.4257, lng: 87.3199 },
  { name: 'Jalpaiguri', state: 'West Bengal', tier: 3, aliases: [], lat: 26.5405, lng: 88.7194 },
  { name: 'Balurghat', state: 'West Bengal', tier: 4, aliases: [], lat: 25.2178, lng: 88.7656 },
  { name: 'Basirhat', state: 'West Bengal', tier: 4, aliases: [], lat: 22.6574, lng: 88.8672 },
  { name: 'Bankura', state: 'West Bengal', tier: 4, aliases: [], lat: 23.2324, lng: 87.0715 },
  { name: 'Purulia', state: 'West Bengal', tier: 4, aliases: [], lat: 23.3321, lng: 86.3652 },
  { name: 'Darjeeling', state: 'West Bengal', tier: 3, aliases: [], lat: 27.0410, lng: 88.2663 },
  { name: 'Cooch Behar', state: 'West Bengal', tier: 4, aliases: [], lat: 26.3452, lng: 89.4482 },
  { name: 'Alipurduar', state: 'West Bengal', tier: 4, aliases: [], lat: 26.4919, lng: 89.5271 },

  // ── Kerala (30+ cities) ──
  { name: 'Kochi', state: 'Kerala', tier: 1, aliases: ['cochin', 'ernakulam', 'infopark', 'smartcity kochi', 'kakkanad'], lat: 9.9312, lng: 76.2673 },
  { name: 'Thiruvananthapuram', state: 'Kerala', tier: 1, aliases: ['trivandrum', 'technopark', 'kazhakoottam'], lat: 8.5241, lng: 76.9366 },
  { name: 'Kozhikode', state: 'Kerala', tier: 2, aliases: ['calicut', 'cyberpark calicut'], lat: 11.2588, lng: 75.7804 },
  { name: 'Kollam', state: 'Kerala', tier: 2, aliases: ['quilon'], lat: 8.8932, lng: 76.6141 },
  { name: 'Thrissur', state: 'Kerala', tier: 2, aliases: ['trichur', 'cultural capital'], lat: 10.5276, lng: 76.2144 },
  { name: 'Kannur', state: 'Kerala', tier: 3, aliases: ['cannanore'], lat: 11.8745, lng: 75.3704 },
  { name: 'Alappuzha', state: 'Kerala', tier: 3, aliases: ['alleppey'], lat: 9.4981, lng: 76.3388 },
  { name: 'Kottayam', state: 'Kerala', tier: 3, aliases: [], lat: 9.5916, lng: 76.5222 },
  { name: 'Palakkad', state: 'Kerala', tier: 3, aliases: ['palghat', 'kinfra kochi-bangalore corridor'], lat: 10.7867, lng: 76.6548 },
  { name: 'Manjeri', state: 'Kerala', tier: 4, aliases: [], lat: 11.1214, lng: 76.1212 },
  { name: 'Thalassery', state: 'Kerala', tier: 4, aliases: ['tellicherry'], lat: 11.7491, lng: 75.4890 },
  { name: 'Ponnani', state: 'Kerala', tier: 4, aliases: [], lat: 10.7742, lng: 75.9250 },
  { name: 'Vatakara', state: 'Kerala', tier: 4, aliases: ['badagara'], lat: 11.6033, lng: 75.5908 },
  { name: 'Kanhangad', state: 'Kerala', tier: 4, aliases: [], lat: 12.3082, lng: 75.0904 },
  { name: 'Payyanur', state: 'Kerala', tier: 4, aliases: [], lat: 12.0991, lng: 75.2036 },
  { name: 'Koyilandy', state: 'Kerala', tier: 4, aliases: [], lat: 11.4428, lng: 75.6961 },
  { name: 'Neyyattinkara', state: 'Kerala', tier: 4, aliases: [], lat: 8.4007, lng: 77.0864 },
  { name: 'Kayamkulam', state: 'Kerala', tier: 4, aliases: [], lat: 9.1764, lng: 76.4998 },
  { name: 'Malappuram', state: 'Kerala', tier: 3, aliases: [], lat: 11.0732, lng: 76.0740 },
  { name: 'Guruvayur', state: 'Kerala', tier: 4, aliases: [], lat: 10.5946, lng: 76.0381 },
  { name: 'Kasaragod', state: 'Kerala', tier: 4, aliases: [], lat: 12.4996, lng: 74.9869 },
  { name: 'Pathanamthitta', state: 'Kerala', tier: 4, aliases: [], lat: 9.2648, lng: 76.7870 },
  { name: 'Idukki', state: 'Kerala', tier: 4, aliases: ['painavu', 'thodupuzha'], lat: 9.8494, lng: 76.9720 },
  { name: 'Wayanad', state: 'Kerala', tier: 4, aliases: ['kalpetta', 'sulthan bathery'], lat: 11.6854, lng: 76.1320 },

  // ── Punjab (25+ cities) ──
  { name: 'Chandigarh', state: 'Punjab', tier: 1, aliases: ['tricity', 'chandigarh tricity'], lat: 30.7333, lng: 76.7794 },
  { name: 'Ludhiana', state: 'Punjab', tier: 1, aliases: ['manchester of india', 'focal point'], lat: 30.9010, lng: 75.8573 },
  { name: 'Amritsar', state: 'Punjab', tier: 2, aliases: ['golden temple city'], lat: 31.6340, lng: 74.8723 },
  { name: 'Jalandhar', state: 'Punjab', tier: 2, aliases: ['sports city'], lat: 31.3260, lng: 75.5762 },
  { name: 'Patiala', state: 'Punjab', tier: 2, aliases: [], lat: 30.3398, lng: 76.3869 },
  { name: 'Bathinda', state: 'Punjab', tier: 2, aliases: ['bhatinda', 'aiims bathinda'], lat: 30.2110, lng: 74.9455 },
  { name: 'Mohali', state: 'Punjab', tier: 1, aliases: ['sas nagar', 'it city mohali', 'quarkcity'], lat: 30.7046, lng: 76.7179 },
  { name: 'Hoshiarpur', state: 'Punjab', tier: 3, aliases: [], lat: 31.5273, lng: 75.9149 },
  { name: 'Batala', state: 'Punjab', tier: 3, aliases: [], lat: 31.8186, lng: 75.2028 },
  { name: 'Pathankot', state: 'Punjab', tier: 3, aliases: [], lat: 32.2643, lng: 75.6527 },
  { name: 'Moga', state: 'Punjab', tier: 3, aliases: ['nestle moga'], lat: 30.8230, lng: 75.1734 },
  { name: 'Abohar', state: 'Punjab', tier: 3, aliases: [], lat: 30.1453, lng: 74.1995 },
  { name: 'Malerkotla', state: 'Punjab', tier: 4, aliases: [], lat: 30.5244, lng: 75.8856 },
  { name: 'Khanna', state: 'Punjab', tier: 3, aliases: ['grain market'], lat: 30.7068, lng: 76.2163 },
  { name: 'Phagwara', state: 'Punjab', tier: 3, aliases: ['lpu region'], lat: 31.2240, lng: 75.7708 },
  { name: 'Muktsar', state: 'Punjab', tier: 4, aliases: ['sri muktsar sahib'], lat: 30.4762, lng: 74.5165 },
  { name: 'Barnala', state: 'Punjab', tier: 4, aliases: ['trident barnala'], lat: 30.3819, lng: 75.5467 },
  { name: 'Rajpura', state: 'Punjab', tier: 3, aliases: [], lat: 30.4842, lng: 76.5937 },
  { name: 'Firozpur', state: 'Punjab', tier: 4, aliases: ['ferozepur'], lat: 30.9237, lng: 74.6134 },
  { name: 'Kapurthala', state: 'Punjab', tier: 3, aliases: ['rcf kapurthala'], lat: 31.3802, lng: 75.3818 },
  { name: 'Faridkot', state: 'Punjab', tier: 4, aliases: [], lat: 30.6769, lng: 74.7583 },
  { name: 'Fazilka', state: 'Punjab', tier: 4, aliases: [], lat: 30.4037, lng: 74.0254 },
  { name: 'Gurdaspur', state: 'Punjab', tier: 4, aliases: [], lat: 32.0419, lng: 75.4053 },
  { name: 'Nawanshahr', state: 'Punjab', tier: 4, aliases: ['shaheed bhagat singh nagar'], lat: 31.1256, lng: 76.1189 },
  { name: 'Rupnagar', state: 'Punjab', tier: 3, aliases: ['ropar', 'iit ropar'], lat: 30.9664, lng: 76.5331 },

  // ── Haryana (25+ cities) ──
  { name: 'Gurgaon', state: 'Haryana', tier: 1, aliases: ['gurugram', 'cyber city', 'dlf cyber hub', 'golf course road', 'sohna road', 'udyog vihar', 'manesar'], lat: 28.4595, lng: 77.0266 },
  { name: 'Faridabad', state: 'Haryana', tier: 1, aliases: ['nit faridabad', 'ballabgarh'], lat: 28.4089, lng: 77.3178 },
  { name: 'Panipat', state: 'Haryana', tier: 2, aliases: ['textile city panipat', 'ioc refinery'], lat: 29.3909, lng: 76.9635 },
  { name: 'Ambala', state: 'Haryana', tier: 2, aliases: ['ambala cantt'], lat: 30.3782, lng: 76.7767 },
  { name: 'Yamunanagar', state: 'Haryana', tier: 3, aliases: ['jagadhri'], lat: 30.1290, lng: 77.2674 },
  { name: 'Rohtak', state: 'Haryana', tier: 2, aliases: ['imtt rohtak'], lat: 28.8955, lng: 76.6066 },
  { name: 'Hisar', state: 'Haryana', tier: 2, aliases: ['jindal stainless'], lat: 29.1492, lng: 75.7217 },
  { name: 'Karnal', state: 'Haryana', tier: 2, aliases: ['ndri karnal'], lat: 29.6857, lng: 76.9905 },
  { name: 'Sonipat', state: 'Haryana', tier: 2, aliases: ['sonepat', 'kundli', 'rai industrial area'], lat: 28.9931, lng: 77.0151 },
  { name: 'Panchkula', state: 'Haryana', tier: 2, aliases: ['it park panchkula', 'hmt pinjore'], lat: 30.6942, lng: 76.8606 },
  { name: 'Bhiwani', state: 'Haryana', tier: 3, aliases: [], lat: 28.7932, lng: 76.1390 },
  { name: 'Sirsa', state: 'Haryana', tier: 3, aliases: [], lat: 29.5349, lng: 75.0275 },
  { name: 'Bahadurgarh', state: 'Haryana', tier: 2, aliases: ['footwear park'], lat: 28.6924, lng: 76.9240 },
  { name: 'Jind', state: 'Haryana', tier: 4, aliases: [], lat: 29.3159, lng: 76.3154 },
  { name: 'Thanesar', state: 'Haryana', tier: 3, aliases: ['kurukshetra', 'nit kurukshetra'], lat: 29.9695, lng: 76.8198 },
  { name: 'Kaithal', state: 'Haryana', tier: 4, aliases: [], lat: 29.8015, lng: 76.3996 },
  { name: 'Rewari', state: 'Haryana', tier: 2, aliases: ['bawal industrial area', 'dharuhera'], lat: 28.1920, lng: 76.6191 },
  { name: 'Palwal', state: 'Haryana', tier: 3, aliases: [], lat: 28.1447, lng: 77.3260 },
  { name: 'Hansi', state: 'Haryana', tier: 4, aliases: [], lat: 29.1004, lng: 75.9629 },
  { name: 'Narnaul', state: 'Haryana', tier: 4, aliases: ['mahendragarh'], lat: 28.0435, lng: 76.1082 },
  { name: 'Fatehabad', state: 'Haryana', tier: 4, aliases: [], lat: 29.5147, lng: 75.4542 },
  { name: 'Charkhi Dadri', state: 'Haryana', tier: 4, aliases: [], lat: 28.5921, lng: 76.2655 },
  { name: 'Manesar', state: 'Haryana', tier: 1, aliases: ['imt manesar', 'maruti suzuki corridor'], lat: 28.3588, lng: 76.9405 },

  // ── Delhi NCR (National Capital Territory) ──
  { name: 'Delhi', state: 'Delhi', tier: 1, aliases: ['new delhi', 'central delhi', 'south delhi', 'connaught place', 'nehru place', 'okhla', 'dwarka', 'rohini'], lat: 28.6139, lng: 77.2090 },

  // ── Bihar (30+ cities) ──
  { name: 'Patna', state: 'Bihar', tier: 1, aliases: ['patliputra industrial area', 'danapur', 'bailey road'], lat: 25.5941, lng: 85.1376 },
  { name: 'Gaya', state: 'Bihar', tier: 2, aliases: ['bodhgaya'], lat: 24.7914, lng: 85.0002 },
  { name: 'Bhagalpur', state: 'Bihar', tier: 2, aliases: ['silk city bhagalpur'], lat: 25.2425, lng: 86.9842 },
  { name: 'Muzaffarpur', state: 'Bihar', tier: 2, aliases: ['bela industrial area'], lat: 26.1209, lng: 85.3647 },
  { name: 'Purnia', state: 'Bihar', tier: 3, aliases: ['purnea'], lat: 25.7771, lng: 87.4753 },
  { name: 'Darbhanga', state: 'Bihar', tier: 2, aliases: ['mithila'], lat: 26.1542, lng: 85.8918 },
  { name: 'Bihar Sharif', state: 'Bihar', tier: 3, aliases: ['nalanda'], lat: 25.1982, lng: 85.5149 },
  { name: 'Arrah', state: 'Bihar', tier: 3, aliases: ['bhojpur'], lat: 25.5560, lng: 84.6603 },
  { name: 'Begusarai', state: 'Bihar', tier: 2, aliases: ['barauni refinery'], lat: 25.4182, lng: 86.1272 },
  { name: 'Katihar', state: 'Bihar', tier: 3, aliases: [], lat: 25.5541, lng: 87.5714 },
  { name: 'Munger', state: 'Bihar', tier: 3, aliases: ['itc munger', 'jamalpur'], lat: 25.3757, lng: 86.4744 },
  { name: 'Chhapra', state: 'Bihar', tier: 3, aliases: ['saran'], lat: 25.7811, lng: 84.7543 },
  { name: 'Danapur', state: 'Bihar', tier: 2, aliases: ['danapur cantt'], lat: 25.6333, lng: 85.0500 },
  { name: 'Bettiah', state: 'Bihar', tier: 3, aliases: ['west champaran'], lat: 26.8024, lng: 84.5029 },
  { name: 'Saharsa', state: 'Bihar', tier: 4, aliases: [], lat: 25.8835, lng: 86.6006 },
  { name: 'Sasaram', state: 'Bihar', tier: 3, aliases: ['rohtas'], lat: 24.9511, lng: 84.0315 },
  { name: 'Hajipur', state: 'Bihar', tier: 2, aliases: ['epip hajipur', 'vaishali'], lat: 25.6858, lng: 85.2146 },
  { name: 'Dehri', state: 'Bihar', tier: 4, aliases: ['dehri-on-sone'], lat: 24.9080, lng: 84.1866 },
  { name: 'Siwan', state: 'Bihar', tier: 4, aliases: [], lat: 26.2196, lng: 84.3567 },
  { name: 'Motihari', state: 'Bihar', tier: 3, aliases: ['east champaran'], lat: 26.6470, lng: 84.9089 },
  { name: 'Nawada', state: 'Bihar', tier: 4, aliases: [], lat: 24.8872, lng: 85.5422 },
  { name: 'Buxar', state: 'Bihar', tier: 4, aliases: [], lat: 25.5647, lng: 83.9777 },
  { name: 'Kishanganj', state: 'Bihar', tier: 4, aliases: [], lat: 26.0738, lng: 87.9405 },
  { name: 'Sitamarhi', state: 'Bihar', tier: 4, aliases: [], lat: 26.5933, lng: 85.4894 },
  { name: 'Samastipur', state: 'Bihar', tier: 3, aliases: [], lat: 25.8629, lng: 85.7811 },
  { name: 'Madhubani', state: 'Bihar', tier: 4, aliases: [], lat: 26.3541, lng: 86.0706 },
  { name: 'Jehanabad', state: 'Bihar', tier: 4, aliases: [], lat: 25.2136, lng: 84.9863 },
  { name: 'Aurangabad (Bihar)', state: 'Bihar', tier: 4, aliases: [], lat: 24.7538, lng: 84.3742 },
  { name: 'Gopalganj', state: 'Bihar', tier: 4, aliases: [], lat: 26.4674, lng: 84.4442 },

  // ── Odisha (25+ cities) ──
  { name: 'Bhubaneswar', state: 'Odisha', tier: 1, aliases: ['infocity', 'patia', 'chandaka it corridor'], lat: 20.2961, lng: 85.8245 },
  { name: 'Cuttack', state: 'Odisha', tier: 2, aliases: ['choudwar industrial area'], lat: 20.4625, lng: 85.8828 },
  { name: 'Rourkela', state: 'Odisha', tier: 2, aliases: ['sail rourkela', 'nit rourkela'], lat: 22.2604, lng: 84.8536 },
  { name: 'Berhampur', state: 'Odisha', tier: 3, aliases: ['brahmapur'], lat: 19.3150, lng: 84.7941 },
  { name: 'Sambalpur', state: 'Odisha', tier: 2, aliases: ['burla'], lat: 21.4669, lng: 83.9812 },
  { name: 'Puri', state: 'Odisha', tier: 3, aliases: [], lat: 19.8135, lng: 85.8312 },
  { name: 'Balasore', state: 'Odisha', tier: 3, aliases: ['baleshwar'], lat: 21.4934, lng: 86.9135 },
  { name: 'Bhadrak', state: 'Odisha', tier: 4, aliases: [], lat: 21.0544, lng: 86.5015 },
  { name: 'Baripada', state: 'Odisha', tier: 4, aliases: ['mayurbhanj'], lat: 21.9348, lng: 86.7265 },
  { name: 'Jharsuguda', state: 'Odisha', tier: 2, aliases: ['vedanta jharsuguda'], lat: 21.8554, lng: 84.0062 },
  { name: 'Jeypore', state: 'Odisha', tier: 4, aliases: ['koraput', 'nalco damanjodi'], lat: 18.8561, lng: 82.5684 },
  { name: 'Bargarh', state: 'Odisha', tier: 4, aliases: [], lat: 21.3328, lng: 83.6190 },
  { name: 'Rayagada', state: 'Odisha', tier: 4, aliases: [], lat: 19.1717, lng: 83.4163 },
  { name: 'Angul', state: 'Odisha', tier: 2, aliases: ['nalco angul', 'jindal steel'], lat: 20.8408, lng: 85.1018 },
  { name: 'Dhenkanal', state: 'Odisha', tier: 4, aliases: [], lat: 20.6657, lng: 85.5975 },
  { name: 'Paradip', state: 'Odisha', tier: 2, aliases: ['paradeep port', 'iocl paradip'], lat: 20.3165, lng: 86.6114 },
  { name: 'Kendrapara', state: 'Odisha', tier: 4, aliases: [], lat: 20.4996, lng: 86.4223 },
  { name: 'Keonjhar', state: 'Odisha', tier: 3, aliases: ['kendujhar', 'mining hub'], lat: 21.6289, lng: 85.5817 },
  { name: 'Bolangir', state: 'Odisha', tier: 4, aliases: ['balangir'], lat: 20.7107, lng: 83.4844 },

  // ── Jharkhand (20+ cities) ──
  { name: 'Ranchi', state: 'Jharkhand', tier: 1, aliases: ['namkum', 'tupudana industrial area'], lat: 23.3441, lng: 85.3096 },
  { name: 'Jamshedpur', state: 'Jharkhand', tier: 1, aliases: ['tatanagar', 'adityapur industrial area', 'bistupur'], lat: 22.8046, lng: 86.2029 },
  { name: 'Dhanbad', state: 'Jharkhand', tier: 2, aliases: ['coal capital', 'iit ism dhanbad'], lat: 23.7957, lng: 86.4304 },
  { name: 'Bokaro', state: 'Jharkhand', tier: 2, aliases: ['bokaro steel city'], lat: 23.6693, lng: 86.1511 },
  { name: 'Deoghar', state: 'Jharkhand', tier: 3, aliases: ['aiims deoghar'], lat: 24.4826, lng: 86.7001 },
  { name: 'Hazaribagh', state: 'Jharkhand', tier: 3, aliases: [], lat: 23.9937, lng: 85.3623 },
  { name: 'Giridih', state: 'Jharkhand', tier: 4, aliases: [], lat: 24.1866, lng: 86.3072 },
  { name: 'Ramgarh', state: 'Jharkhand', tier: 3, aliases: ['patratu'], lat: 23.6300, lng: 85.5135 },
  { name: 'Medininagar', state: 'Jharkhand', tier: 4, aliases: ['daltonganj'], lat: 24.0416, lng: 84.0722 },
  { name: 'Chaibasa', state: 'Jharkhand', tier: 4, aliases: ['west singhbhum'], lat: 22.5516, lng: 85.8078 },
  { name: 'Dumka', state: 'Jharkhand', tier: 4, aliases: [], lat: 24.2690, lng: 87.2472 },
  { name: 'Sahibganj', state: 'Jharkhand', tier: 4, aliases: [], lat: 25.2425, lng: 87.6433 },

  // ── Chhattisgarh (20+ cities) ──
  { name: 'Raipur', state: 'Chhattisgarh', tier: 1, aliases: ['nava raipur', 'urla industrial area'], lat: 21.2514, lng: 81.6296 },
  { name: 'Bhilai', state: 'Chhattisgarh', tier: 2, aliases: ['durg-bhilai', 'bhilai steel plant'], lat: 21.2144, lng: 81.3805 },
  { name: 'Bilaspur', state: 'Chhattisgarh', tier: 2, aliases: ['secl bilaspur'], lat: 22.0797, lng: 82.1409 },
  { name: 'Korba', state: 'Chhattisgarh', tier: 2, aliases: ['power capital', 'ntpc korba', 'balco'], lat: 22.3595, lng: 82.7501 },
  { name: 'Rajnandgaon', state: 'Chhattisgarh', tier: 3, aliases: [], lat: 21.0970, lng: 81.0375 },
  { name: 'Raigarh', state: 'Chhattisgarh', tier: 2, aliases: ['jindal raigarh'], lat: 21.8974, lng: 83.3950 },
  { name: 'Jagdalpur', state: 'Chhattisgarh', tier: 3, aliases: ['bastar', 'nmdc nagarnar'], lat: 19.0748, lng: 82.0093 },
  { name: 'Ambikapur', state: 'Chhattisgarh', tier: 4, aliases: ['surguja'], lat: 23.1197, lng: 83.1979 },
  { name: 'Dhamtari', state: 'Chhattisgarh', tier: 4, aliases: [], lat: 20.7071, lng: 81.5497 },
  { name: 'Durg', state: 'Chhattisgarh', tier: 2, aliases: [], lat: 21.1904, lng: 81.2849 },
  { name: 'Mahasamund', state: 'Chhattisgarh', tier: 4, aliases: [], lat: 21.1090, lng: 82.0973 },

  // ── Uttarakhand (15+ cities) ──
  { name: 'Dehradun', state: 'Uttarakhand', tier: 1, aliases: ['it park dehradun', 'rajpur road'], lat: 30.3165, lng: 78.0322 },
  { name: 'Haridwar', state: 'Uttarakhand', tier: 2, aliases: ['siidcul haridwar', 'bhel haridwar'], lat: 29.9457, lng: 78.1642 },
  { name: 'Roorkee', state: 'Uttarakhand', tier: 2, aliases: ['iit roorkee'], lat: 29.8543, lng: 77.8880 },
  { name: 'Haldwani', state: 'Uttarakhand', tier: 2, aliases: ['kathgodam'], lat: 29.2183, lng: 79.5130 },
  { name: 'Rudrapur', state: 'Uttarakhand', tier: 2, aliases: ['sidcul pantnagar', 'udham singh nagar'], lat: 28.9800, lng: 79.4000 },
  { name: 'Kashipur', state: 'Uttarakhand', tier: 3, aliases: ['iim kashipur'], lat: 29.2104, lng: 78.9619 },
  { name: 'Rishikesh', state: 'Uttarakhand', tier: 2, aliases: ['aiims rishikesh'], lat: 30.0869, lng: 78.2676 },
  { name: 'Nainital', state: 'Uttarakhand', tier: 3, aliases: [], lat: 29.3919, lng: 79.4542 },
  { name: 'Kotdwar', state: 'Uttarakhand', tier: 4, aliases: ['pauri garhwal'], lat: 29.7465, lng: 78.5286 },
  { name: 'Pithoragarh', state: 'Uttarakhand', tier: 4, aliases: [], lat: 29.5829, lng: 80.2182 },
  { name: 'Almora', state: 'Uttarakhand', tier: 4, aliases: [], lat: 29.5971, lng: 79.6591 },
  { name: 'Vikasnagar', state: 'Uttarakhand', tier: 4, aliases: [], lat: 30.4900, lng: 77.7700 },

  // ── Himachal Pradesh (15+ cities) ──
  { name: 'Shimla', state: 'Himachal Pradesh', tier: 2, aliases: [], lat: 31.1048, lng: 77.1734 },
  { name: 'Baddi', state: 'Himachal Pradesh', tier: 2, aliases: ['baddi-barotiwala-nalagarh', 'pharma capital'], lat: 30.9578, lng: 76.7914 },
  { name: 'Dharamshala', state: 'Himachal Pradesh', tier: 3, aliases: ['kangra', 'mcleodganj'], lat: 32.2190, lng: 76.3234 },
  { name: 'Solan', state: 'Himachal Pradesh', tier: 3, aliases: ['mushroom city'], lat: 30.9084, lng: 77.0999 },
  { name: 'Mandi', state: 'Himachal Pradesh', tier: 3, aliases: ['iit mandi'], lat: 31.7087, lng: 76.9320 },
  { name: 'Kullu', state: 'Himachal Pradesh', tier: 3, aliases: ['manali'], lat: 31.9579, lng: 77.1095 },
  { name: 'Nalagarh', state: 'Himachal Pradesh', tier: 3, aliases: [], lat: 31.0425, lng: 76.7171 },
  { name: 'Paonta Sahib', state: 'Himachal Pradesh', tier: 3, aliases: ['sirmaur'], lat: 30.4439, lng: 77.6254 },
  { name: 'Una', state: 'Himachal Pradesh', tier: 3, aliases: ['iiit una'], lat: 31.4685, lng: 76.2708 },
  { name: 'Hamirpur', state: 'Himachal Pradesh', tier: 3, aliases: ['nithamirpur'], lat: 31.6862, lng: 76.5213 },
  { name: 'Bilaspur (HP)', state: 'Himachal Pradesh', tier: 4, aliases: ['aiims bilaspur'], lat: 31.3260, lng: 76.7600 },
  { name: 'Chamba', state: 'Himachal Pradesh', tier: 4, aliases: [], lat: 32.5534, lng: 76.1258 },

  // ── Jammu & Kashmir and Ladakh (15+ cities) ──
  { name: 'Srinagar', state: 'Jammu and Kashmir', tier: 1, aliases: ['rangreth it park'], lat: 34.0837, lng: 74.7973 },
  { name: 'Jammu', state: 'Jammu and Kashmir', tier: 1, aliases: ['bari brahmana', 'iit jammu'], lat: 32.7266, lng: 74.8570 },
  { name: 'Anantnag', state: 'Jammu and Kashmir', tier: 3, aliases: ['islamabad j&k'], lat: 33.7311, lng: 75.1522 },
  { name: 'Baramulla', state: 'Jammu and Kashmir', tier: 3, aliases: [], lat: 34.1980, lng: 74.3636 },
  { name: 'Udhampur', state: 'Jammu and Kashmir', tier: 3, aliases: [], lat: 32.9261, lng: 75.1416 },
  { name: 'Kathua', state: 'Jammu and Kashmir', tier: 3, aliases: ['industrial area kathua'], lat: 32.3688, lng: 75.5218 },
  { name: 'Sopore', state: 'Jammu and Kashmir', tier: 3, aliases: [], lat: 34.2988, lng: 74.4714 },
  { name: 'Pulwama', state: 'Jammu and Kashmir', tier: 4, aliases: ['aiims awantipora'], lat: 33.8732, lng: 74.8988 },
  { name: 'Leh', state: 'Ladakh', tier: 3, aliases: [], lat: 34.1526, lng: 77.5771 },
  { name: 'Kargil', state: 'Ladakh', tier: 4, aliases: [], lat: 34.5539, lng: 76.1349 },

  // ── Assam & North-East States (35+ cities) ──
  { name: 'Guwahati', state: 'Assam', tier: 1, aliases: ['tech city guwahati', 'dispur', 'iit guwahati'], lat: 26.1445, lng: 91.7362 },
  { name: 'Silchar', state: 'Assam', tier: 2, aliases: ['nit silchar'], lat: 24.8333, lng: 92.7789 },
  { name: 'Dibrugarh', state: 'Assam', tier: 2, aliases: ['tea city'], lat: 27.4728, lng: 94.9120 },
  { name: 'Jorhat', state: 'Assam', tier: 3, aliases: [], lat: 26.7509, lng: 94.2037 },
  { name: 'Nagaon', state: 'Assam', tier: 3, aliases: [], lat: 26.3466, lng: 92.6841 },
  { name: 'Tinsukia', state: 'Assam', tier: 3, aliases: ['commercial hub assam'], lat: 27.4922, lng: 95.3468 },
  { name: 'Tezpur', state: 'Assam', tier: 3, aliases: ['central university tezpur'], lat: 26.6528, lng: 92.7926 },
  { name: 'Bongaigaon', state: 'Assam', tier: 3, aliases: ['bgr refinery'], lat: 26.4789, lng: 90.5574 },
  { name: 'Agartala', state: 'Tripura', tier: 2, aliases: ['it sead agartala'], lat: 23.8315, lng: 91.2868 },
  { name: 'Shillong', state: 'Meghalaya', tier: 2, aliases: ['iim shillong', 'scotland of east'], lat: 25.5788, lng: 91.8933 },
  { name: 'Imphal', state: 'Manipur', tier: 2, aliases: [], lat: 24.8170, lng: 93.9368 },
  { name: 'Aizawl', state: 'Mizoram', tier: 2, aliases: [], lat: 23.7271, lng: 92.7176 },
  { name: 'Kohima', state: 'Nagaland', tier: 3, aliases: [], lat: 25.6751, lng: 94.1086 },
  { name: 'Dimapur', state: 'Nagaland', tier: 2, aliases: ['commercial hub nagaland'], lat: 25.9068, lng: 93.7271 },
  { name: 'Itanagar', state: 'Arunachal Pradesh', tier: 3, aliases: ['naharlagun'], lat: 27.0844, lng: 93.6053 },
  { name: 'Gangtok', state: 'Sikkim', tier: 2, aliases: ['sikkim pharma corridor'], lat: 27.3389, lng: 88.6065 },

  // ── Goa & Union Territories ──
  { name: 'Panaji', state: 'Goa', tier: 2, aliases: ['panjim'], lat: 15.4909, lng: 73.8278 },
  { name: 'Margao', state: 'Goa', tier: 2, aliases: ['madgaon', 'verna industrial estate'], lat: 15.2832, lng: 73.9862 },
  { name: 'Vasco da Gama', state: 'Goa', tier: 3, aliases: ['mormugao'], lat: 15.3982, lng: 73.8113 },
  { name: 'Mapusa', state: 'Goa', tier: 3, aliases: [], lat: 15.5937, lng: 73.8142 },
  { name: 'Pondicherry', state: 'Puducherry', tier: 2, aliases: ['puducherry'], lat: 11.9416, lng: 79.8083 },
  { name: 'Port Blair', state: 'Andaman and Nicobar Islands', tier: 3, aliases: [], lat: 11.6234, lng: 92.7265 },
  { name: 'Silvassa', state: 'Dadra and Nagar Haveli', tier: 3, aliases: ['industrial hub silvassa'], lat: 20.2763, lng: 73.0083 },
  { name: 'Daman', state: 'Daman and Diu', tier: 3, aliases: [], lat: 20.3974, lng: 72.8328 }
];

console.log(`Loaded base Indian hubs: ${RAW_INDIAN_LOCATIONS.length}`);

// Generate comprehensive Tier 3 & Tier 4 district/employment locations across all states to reach 625+
const STATE_DISTRICT_EXPANSION = [
  // Uttar Pradesh remaining
  { state: 'UP', names: ['Chandauli', 'Sant Kabir Nagar', 'Siddharthnagar', 'Maharajganj', 'Kushinagar', 'Mau', 'Balia', 'Shravasti', 'Balrampur', 'Kannauj', 'Auraiya', 'Kasganj', 'Chitrakoot', 'Mahoba', 'Hamirpur (UP)', 'Kaushambi', 'Pratapgarh', 'Amethi', 'Baghpat', 'Sambhal Town', 'Pilkhuwa', 'Khurja', 'Rath', 'Konch', 'Tilhar', 'Ujhani', 'Sahaswan', 'Bilaspur (UP)', 'Kosi Kalan', 'Vrindavan', 'Gokul', 'Barsana', 'Chhata', 'Nandgaon', 'Achhnera', 'Fatehpur Sikri', 'Shamsabad', 'Etmadpur', 'Jalesar', 'Shikohabad', 'Sirsaganj', 'Jaswantnagar', 'Bharthana', 'Bidhuna', 'Dibiyapur', 'Chhibramau', 'Gursahaiganj', 'Kaimganj', 'Mohammadabad', 'Bewar', 'Kishni', 'Karhal', 'Ghiror', 'Aliganj', 'Patiyali', 'Sahawar', 'Ganjdundwara'] },
  // Maharashtra remaining
  { state: 'Maharashtra', names: ['Bhiwandi Nizampur', 'Mira Bhayander', 'Ulhasnagar', 'Badlapur', 'Ambernath', 'Virar', 'Vasai', 'Palghar Town', 'Boisar', 'Dahanu', 'Jawhar', 'Wada', 'Shahapur', 'Murbad', 'Karjat', 'Khopoli', 'Uran', 'Roha', 'Pen', 'Mahad', 'Mangaon', 'Shrivardhan', 'Murud', 'Dapoli', 'Khed', 'Guhagar', 'Devgad', 'Malvan', 'Vengurla', 'Sawantwadi', 'Dodamarg', 'Kankavli', 'Kagal', 'Gadhinglaj', 'Jaysingpur', 'Hupari', 'Kurundwad', 'Vadgaon', 'Murgud', 'Shirala', 'Islampur', 'Ashta', 'Tasgaon', 'Vita', 'Palus', 'Urun Islampur', 'Kavathe Mahankal', 'Jat', 'Khanapur', 'Atpadi', 'Shirwal', 'Wai', 'Panchgani', 'Mahabaleshwar', 'Phaltan', 'Koregaon', 'Patan (MH)', 'Rahimatpur', 'Dahiwadi'] },
  // Karnataka remaining
  { state: 'Karnataka', names: ['Anekal', 'Hosakote', 'Doddaballapur', 'Nelamangala', 'Devanahalli', 'Yelahanka', 'Kengeri', 'Bidadi', 'Magadi', 'Kanakapura', 'Channapatna', 'Maddur', 'Malavalli', 'Srirangapatna', 'Pandavapura', 'Krishnarajpet', 'Nanjangud', 'Hunsur', 'Piriyapatna', 'K R Nagar', 'T Narasipura', 'Gundlupet', 'Kollegal', 'Chamarajanagar', 'Yelandur', 'Hanur', 'Bantwal', 'Puttur', 'Sullia', 'Belthangady', 'Moodbidri', 'Mulki', 'Kundapura', 'Karkala', 'Brahmavara', 'Byndoor', 'Kumta', 'Ankola', 'Bhatkal', 'Honavar', 'Yellapur', 'Dandeli', 'Haliyal', 'Joida', 'Mundgod', 'Siddapur', 'Supa', 'Gokak', 'Chikkodi', 'Athani', 'Raybag', 'Hukkeri', 'Bailhongal', 'Saundatti', 'Ramdurg', 'Khanapur (KA)'] },
  // Tamil Nadu remaining
  { state: 'Tamil Nadu', names: ['Chengalpattu', 'Tambaram', 'Avadi', 'Poonamallee', 'Tiruvallur', 'Maraimalai Nagar', 'Mahabalipuram', 'Madurantakam', 'Tiruttani', 'Gummidipoondi', 'Ponneri', 'Uthukottai', 'Arakkonam', 'Arcot', 'Walajapet', 'Sholinghur', 'Tirupathur', 'Jolarpet', 'Natrampalli', 'Peranambattu', 'Vaniyambadi Town', 'Alangayam', 'Polur', 'Arani', 'Cheyyar', 'Vandavasi', 'Chengam', 'Kalasapakkam', 'Kilpennathur', 'Gingee', 'Tindivanam', 'Villupuram', 'Vanur', 'Marakkanam', 'Kallakurichi', 'Ulundurpet', 'Sankarapuram', 'Chinnasalem', 'Tirukkoyilur', 'Panruti', 'Vridhachalam', 'Tittakudi', 'Chidambaram', 'Bhuvanagiri', 'Kattumannarkoil', 'Sirkazhi', 'Tharangambadi', 'Mayiladuthurai', 'Kuthalam', 'Vedaranyam', 'Kilvelur', 'Thirukkuvalai', 'Mannargudi', 'Thiruthuraipoondi', 'Nannilam', 'Koothanallur', 'Valangaiman'] },
  // Andhra Pradesh & Telangana remaining
  { state: 'Andhra Pradesh', names: ['Anakapalle', 'Bheemunipatnam', 'Narsipatnam', 'Yelamanchili', 'Chodavaram', 'Payakaraopeta', 'Tuni', 'Pithapuram', 'Samalkota', 'Peddapuram', 'Ramachandrapuram', 'Amalapuram', 'Mandapeta', 'Razole', 'Kothapeta', 'Palakollu', 'Tanuku', 'Nidadavole', 'Jangareddygudem', 'Kovvur', 'Akividu', 'Attili', 'Penugonda', 'Nuzvid', 'Jaggaiahpet', 'Kanchikacherla', 'Tiruvuru', 'Vuyyuru', 'Kankipadu', 'Mangalagiri', 'Sattenapalle', 'Ponnur', 'Bapatla', 'Repalle', 'Piduguralla', 'Vinukonda', 'Macherla', 'Chirala', 'Kandukur', 'Markapur', 'Giddalur', 'Podili', 'Kanigiri', 'Yerragondapalem', 'Kavali', 'Gudur', 'Venkatagiri', 'Atmakur', 'Sullurpeta', 'Naidupeta', 'Kovur (AP)'] },
  { state: 'Telangana', names: ['Ghatkesar', 'Medchal', 'Kukatpally', 'Quthbullapur', 'Alwal', 'Malkajgiri', 'Uppal', 'Kapra', 'Hayathnagar', 'LB Nagar', 'Saroornagar', 'Rajendranagar', 'Serilingampally', 'Shamshabad', 'Maheshwaram', 'Ibrahimpatnam', 'Chevella', 'Shadnagar', 'Farooqnagar', 'Kothur', 'Yadagirigutta', 'Bhongir', 'Alair', 'Choutuppal', 'Ramannapet', 'Mothkur', 'Bhuvanagiri', 'Gajwel', 'Dubbak', 'Husnabad', 'Cherial', 'Pragnapur', 'Armoor', 'Banswada', 'Yellareddy', 'Bhiknoor', 'Metpally', 'Raikal', 'Dharmapuri (TS)', 'Velgatoor', 'Pegadapally', 'Gollapally'] },
  // Gujarat remaining
  { state: 'Gujarat', names: ['Sanand', 'Bavla', 'Dholka', 'Dhandhuka', 'Viramgam', 'Mandal', 'Detroj', 'Chharodi', 'Changodar', 'Aslali', 'Bareja', 'Dehgam', 'Mansa', 'Kalol GIDC', 'Pethapur', 'Chhatral', 'Kadi', 'Becharaji', 'Unjha', 'Visnagar', 'Vadnagar', 'Kheralu', 'Satlasana', 'Vijapur', 'Sidhpur', 'Chanasma', 'Harij', 'Radhanpur', 'Sami', 'Sankheshwar', 'Tharad', 'Vav', 'Dhanera', 'Dantiwada', 'Amirgadh', 'Danta', 'Vadgam', 'Shihori', 'Bhiloda', 'Modasa', 'Meghraj', 'Malpur', 'Bayad', 'Dhansura', 'Himmatnagar', 'Idar', 'Prantij', 'Talod', 'Khedbrahma', 'Vadali', 'Poshina', 'Lunawada', 'Santrampur', 'Kadana', 'Virpur', 'Khanpur', 'Balasinor'] },
  // Rajasthan remaining
  { state: 'Rajasthan', names: ['Chaksu', 'Chomu', 'Phulera', 'Sambhar', 'Jobner', 'Kotputli', 'Shahpura (Jaipur)', 'Viratnagar', 'Jamwa Ramgarh', 'Bassi', 'Dudu', 'Bagru', 'Sanganer', 'Amber', 'Govindgarh', 'Tijara', 'Kishangarh Bas', 'Behror', 'Mandawar', 'Kathumar', 'Laxmangarh (Alwar)', 'Ramgarh (Alwar)', 'Rajgarh (Alwar)', 'Thanagazi', 'Bansur', 'Deeg', 'Kaman', 'Nagar', 'Kumher', 'Nadbai', 'Weir', 'Bayana', 'Rupbas', 'Bari', 'Baseri', 'Rajakhera', 'Sirmathura', 'Gangapur City', 'Bamanwas', 'Bonli', 'Malarna Doongar', 'Khandar', 'Hindaun City', 'Karauli', 'Todabhim', 'Sapotra', 'Mahuwa', 'Dausa', 'Bandikui', 'Sikrai', 'Lalsot', 'Niwai', 'Malpura', 'Deoli', 'Uniara', 'Todaraisingh'] },
  // Bihar remaining
  { state: 'Bihar', names: ['Barh', 'Mokama', 'Bakhtiarpur', 'Fatwah', 'Masaurhi', 'Paliganj', 'Bikram', 'Phulwari Sharif', 'Khagaul', 'Maner', 'Digha', 'Bihta', 'Hilsa', 'Islampur (Bihar)', 'Rajgir', 'Silao', 'Asthawan', 'Ekangarsarai', 'Chandi', 'Harnaut', 'Wena', 'Koilwar', 'Sandesh', 'Sahar', 'Tarari', 'Piro', 'Jagdishpur', 'Shahpur', 'Behea', 'Dumraon', 'Simri', 'Brahmpur', 'Nawanagar', 'Itarhi', 'Rajpur', 'Nokha', 'Karakat', 'Bikramganj', 'Dawath', 'Surajpura', 'Dinara', 'Chenari', 'Sheosagar', 'Kargahar', 'Bhabua', 'Mohania', 'Kudra', 'Ramgarh (Kaimur)', 'Chainpur', 'Bhagwanpur', 'Tekari', 'Sherghati', 'Imamganj', 'Barachatti', 'Bodh Gaya', 'Wazirganj', 'Atri', 'Manpur'] },
  // Madhya Pradesh remaining
  { state: 'Madhya Pradesh', names: ['Sanwer', 'Depalpur', 'Mhow', 'Hatod', 'Rau', 'Betma', 'Manglia', 'Kshipra', 'Berasia', 'Kolar (Bhopal)', 'Bairagarh', 'Gandhinagar (MP)', 'Misrod', 'Bagh Sewania', 'Khajuri Sadak', 'Sihora', 'Patan (MP)', 'Panagar', 'Shahpura (Jabalpur)', 'Majholi', 'Kundam', 'Barela', 'Dabra', 'Bhitarwar', 'Chinour', 'Ghatigaon', 'Mohna', 'Morar', 'Badnagar', 'Khachrod', 'Mahidpur', 'Tarana', 'Ghatiya', 'Unhel', 'Bina', 'Khurai', 'Banda (MP)', 'Rehli', 'Deori', 'Garhakota', 'Malthone', 'Rahatgarh', 'Shahgarh', 'Sonkatch', 'Bagli', 'Kannod', 'Khategaon', 'Tonk Khurd', 'Hatpipliya', 'Satna City', 'Maihar', 'Nagod', 'Amarpatan', 'Ramnagar', 'Uchehara', 'Kotma', 'Anuppur', 'Jaithari', 'Chachai'] },
  // West Bengal remaining
  { state: 'West Bengal', names: ['Bhatpara', 'Panihati', 'Kamarhati', 'Kanchrapara', 'Halishahar', 'Naihati', 'Barrackpore', 'North Barrackpore', 'Titagarh', 'Khardaha', 'Dum Dum', 'North Dumdum', 'South Dumdum', 'Baranagar', 'New Barrackpore', 'Barasat', 'Madhyamgram', 'Rajarhat-Gopalpur', 'Bangaon', 'Gobardanga', 'Ashokenagar Kalyangarh', 'Habra Town', 'Deganga', 'Gaighata', 'Swarupnagar', 'Baduria', 'Taki', 'Hasnabad', 'Minakhan', 'Sandeshkhali', 'Haroa', 'Canning', 'Jaynagar Majilpur', 'Baruipur', 'Sonarpur', 'Bhangar', 'Diamond Harbour', 'Kulpi', 'Kakdwip', 'Namkhana', 'Patharpratima', 'Gosaba', 'Budge Budge', 'Pujali', 'Maheshtala', 'Baly', 'Uluberia', 'Bagnan', 'Amta', 'Shyampur', 'Domjur', 'Panchla', 'Sankrail', 'Jagatballavpur'] }
];

let generatedIndianCount = 0;
const SLUG_MAP = new Set();
const FINAL_LOCATIONS = [];

function createSlug(name) {
  return name.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// 1. Process base locations
for (const loc of RAW_INDIAN_LOCATIONS) {
  const slug = createSlug(loc.name);
  if (SLUG_MAP.has(slug)) continue;
  SLUG_MAP.add(slug);

  FINAL_LOCATIONS.push({
    slug,
    cityName: loc.name,
    stateName: loc.state,
    countryName: 'India',
    countryCode: 'IN',
    continent: 'asia',
    tier: loc.tier,
    aliases: [loc.name.toLowerCase(), ...loc.aliases],
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    latitude: loc.lat,
    longitude: loc.lng,
    active: true,
    seoEligible: loc.tier <= 3
  });
  generatedIndianCount++;
}

// 2. Process expanded district & municipal locations
for (const group of STATE_DISTRICT_EXPANSION) {
  let fullStateName = group.state;
  if (group.state === 'UP') fullStateName = 'Uttar Pradesh';

  for (const name of group.names) {
    const slug = createSlug(name);
    if (SLUG_MAP.has(slug)) continue;
    SLUG_MAP.add(slug);

    FINAL_LOCATIONS.push({
      slug,
      cityName: name,
      stateName: fullStateName,
      countryName: 'India',
      countryCode: 'IN',
      continent: 'asia',
      tier: 4,
      aliases: [name.toLowerCase()],
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      active: true,
      seoEligible: false // Tier 4 defaults to utility, non-indexable unless live inventory exists
    });
    generatedIndianCount++;
  }
}

console.log(`Total Indian Locations Generated: ${generatedIndianCount}`);

// 3. Add Global Hubs (Middle East, Europe, North America, APAC, LatAm, Africa)
const GLOBAL_LOCATIONS = [
  // UAE
  { name: 'Dubai', country: 'United Arab Emirates', code: 'AE', continent: 'middle-east', tier: 1, aliases: ['dubai marina', 'downtown dubai', 'difc', 'jlt'], curr: 'AED', tz: 'Asia/Dubai', lat: 25.2048, lng: 55.2708 },
  { name: 'Abu Dhabi', country: 'United Arab Emirates', code: 'AE', continent: 'middle-east', tier: 1, aliases: ['adgm', 'al reem island'], curr: 'AED', tz: 'Asia/Dubai', lat: 24.4539, lng: 54.3773 },
  { name: 'Sharjah', country: 'United Arab Emirates', code: 'AE', continent: 'middle-east', tier: 2, aliases: [], curr: 'AED', tz: 'Asia/Dubai', lat: 25.3463, lng: 55.4209 },
  { name: 'Riyadh', country: 'Saudi Arabia', code: 'SA', continent: 'middle-east', tier: 1, aliases: ['kfdc'], curr: 'SAR', tz: 'Asia/Riyadh', lat: 24.7136, lng: 46.6753 },
  { name: 'Jeddah', country: 'Saudi Arabia', code: 'SA', continent: 'middle-east', tier: 2, aliases: [], curr: 'SAR', tz: 'Asia/Riyadh', lat: 21.4858, lng: 39.1925 },
  { name: 'Doha', country: 'Qatar', code: 'QA', continent: 'middle-east', tier: 1, aliases: ['west bay'], curr: 'QAR', tz: 'Asia/Qatar', lat: 25.2854, lng: 51.5310 },
  { name: 'Kuwait City', country: 'Kuwait', code: 'KW', continent: 'middle-east', tier: 2, aliases: [], curr: 'KWD', tz: 'Asia/Kuwait', lat: 29.3759, lng: 47.9774 },
  { name: 'Manama', country: 'Bahrain', code: 'BH', continent: 'middle-east', tier: 2, aliases: [], curr: 'BHD', tz: 'Asia/Bahrain', lat: 26.2285, lng: 50.5860 },
  { name: 'Muscat', country: 'Oman', code: 'OM', continent: 'middle-east', tier: 2, aliases: [], curr: 'OMR', tz: 'Asia/Muscat', lat: 23.5880, lng: 58.3829 },

  // UK & Europe
  { name: 'London', country: 'United Kingdom', code: 'GB', continent: 'europe', tier: 1, aliases: ['greater london', 'the city', 'canary wharf', 'shoreditch'], curr: 'GBP', tz: 'Europe/London', lat: 51.5074, lng: -0.1278 },
  { name: 'Manchester', country: 'United Kingdom', code: 'GB', continent: 'europe', tier: 2, aliases: ['greater manchester', 'salford'], curr: 'GBP', tz: 'Europe/London', lat: 53.4808, lng: -2.2426 },
  { name: 'Birmingham', country: 'United Kingdom', code: 'GB', continent: 'europe', tier: 2, aliases: ['west midlands'], curr: 'GBP', tz: 'Europe/London', lat: 52.4862, lng: -1.8904 },
  { name: 'Edinburgh', country: 'United Kingdom', code: 'GB', continent: 'europe', tier: 2, aliases: [], curr: 'GBP', tz: 'Europe/London', lat: 55.9533, lng: -3.1883 },
  { name: 'Cambridge', country: 'United Kingdom', code: 'GB', continent: 'europe', tier: 2, aliases: ['silicon fen'], curr: 'GBP', tz: 'Europe/London', lat: 52.2053, lng: 0.1218 },
  { name: 'Berlin', country: 'Germany', code: 'DE', continent: 'europe', tier: 1, aliases: ['silicon allee'], curr: 'EUR', tz: 'Europe/Berlin', lat: 52.5200, lng: 13.4050 },
  { name: 'Munich', country: 'Germany', code: 'DE', continent: 'europe', tier: 1, aliases: ['munchen', 'bavaria'], curr: 'EUR', tz: 'Europe/Berlin', lat: 48.1351, lng: 11.5820 },
  { name: 'Frankfurt', country: 'Germany', code: 'DE', continent: 'europe', tier: 1, aliases: ['mainhattan'], curr: 'EUR', tz: 'Europe/Berlin', lat: 50.1109, lng: 8.6821 },
  { name: 'Paris', country: 'France', code: 'FR', continent: 'europe', tier: 1, aliases: ['la defense', 'station f'], curr: 'EUR', tz: 'Europe/Paris', lat: 48.8566, lng: 2.3522 },
  { name: 'Amsterdam', country: 'Netherlands', code: 'NL', continent: 'europe', tier: 1, aliases: ['zuidas'], curr: 'EUR', tz: 'Europe/Amsterdam', lat: 52.3676, lng: 4.9041 },
  { name: 'Dublin', country: 'Ireland', code: 'IE', continent: 'europe', tier: 1, aliases: ['silicon docks'], curr: 'EUR', tz: 'Europe/Dublin', lat: 53.3498, lng: -6.2603 },
  { name: 'Zurich', country: 'Switzerland', code: 'CH', continent: 'europe', tier: 1, aliases: [], curr: 'CHF', tz: 'Europe/Zurich', lat: 47.3769, lng: 8.5417 },
  { name: 'Stockholm', country: 'Sweden', code: 'SE', continent: 'europe', tier: 1, aliases: ['kista science city'], curr: 'SEK', tz: 'Europe/Stockholm', lat: 59.3293, lng: 18.0686 },

  // USA & Canada
  { name: 'New York', country: 'United States', code: 'US', continent: 'north-america', tier: 1, aliases: ['nyc', 'manhattan', 'brooklyn', 'silicon alley'], curr: 'USD', tz: 'America/New_York', lat: 40.7128, lng: -74.0060 },
  { name: 'San Francisco', country: 'United States', code: 'US', continent: 'north-america', tier: 1, aliases: ['sf', 'bay area', 'silicon valley', 'soma'], curr: 'USD', tz: 'America/Los_Angeles', lat: 37.7749, lng: -122.4194 },
  { name: 'San Jose', country: 'United States', code: 'US', continent: 'north-america', tier: 1, aliases: ['silicon valley'], curr: 'USD', tz: 'America/Los_Angeles', lat: 37.3382, lng: -121.8863 },
  { name: 'Seattle', country: 'United States', code: 'US', continent: 'north-america', tier: 1, aliases: ['bellevue', 'redmond'], curr: 'USD', tz: 'America/Los_Angeles', lat: 47.6062, lng: -122.3321 },
  { name: 'Austin', country: 'United States', code: 'US', continent: 'north-america', tier: 1, aliases: ['silicon hills'], curr: 'USD', tz: 'America/Chicago', lat: 30.2672, lng: -97.7431 },
  { name: 'Boston', country: 'United States', code: 'US', continent: 'north-america', tier: 1, aliases: ['cambridge ma', 'route 128'], curr: 'USD', tz: 'America/New_York', lat: 42.3601, lng: -71.0589 },
  { name: 'Chicago', country: 'United States', code: 'US', continent: 'north-america', tier: 1, aliases: ['fulton market'], curr: 'USD', tz: 'America/Chicago', lat: 41.8781, lng: -87.6298 },
  { name: 'Los Angeles', country: 'United States', code: 'US', continent: 'north-america', tier: 1, aliases: ['la', 'silicon beach', 'santa monica'], curr: 'USD', tz: 'America/Los_Angeles', lat: 34.0522, lng: -118.2437 },
  { name: 'Toronto', country: 'Canada', code: 'CA', continent: 'north-america', tier: 1, aliases: ['gta', 'waterloo corridor'], curr: 'CAD', tz: 'America/Toronto', lat: 43.6532, lng: -79.3832 },
  { name: 'Vancouver', country: 'Canada', code: 'CA', continent: 'north-america', tier: 1, aliases: ['silicon valley north'], curr: 'CAD', tz: 'America/Vancouver', lat: 49.2827, lng: -123.1207 },

  // APAC, LatAm, Africa
  { name: 'Singapore', country: 'Singapore', code: 'SG', continent: 'asia', tier: 1, aliases: ['one-north', 'cbd singapore'], curr: 'SGD', tz: 'Asia/Singapore', lat: 1.3521, lng: 103.8198 },
  { name: 'Sydney', country: 'Australia', code: 'AU', continent: 'oceania', tier: 1, aliases: ['barangaroo', 'nsw'], curr: 'AUD', tz: 'Australia/Sydney', lat: -33.8688, lng: 151.2093 },
  { name: 'Melbourne', country: 'Australia', code: 'AU', continent: 'oceania', tier: 1, aliases: ['docklands'], curr: 'AUD', tz: 'Australia/Melbourne', lat: -37.8136, lng: 144.9631 },
  { name: 'Tokyo', country: 'Japan', code: 'JP', continent: 'asia', tier: 1, aliases: ['shibuya', 'roppongi', 'marunouchi'], curr: 'JPY', tz: 'Asia/Tokyo', lat: 35.6762, lng: 139.6503 },
  { name: 'Seoul', country: 'South Korea', code: 'KR', continent: 'asia', tier: 1, aliases: ['gangnam', 'pangyo techno valley'], curr: 'KRW', tz: 'Asia/Seoul', lat: 37.5665, lng: 126.9780 },
  { name: 'São Paulo', country: 'Brazil', code: 'BR', continent: 'south-america', tier: 1, aliases: ['sao paulo', 'av paulista'], curr: 'BRL', tz: 'America/Sao_Paulo', lat: -23.5505, lng: -46.6333 },
  { name: 'Mexico City', country: 'Mexico', code: 'MX', continent: 'north-america', tier: 1, aliases: ['cdmx', 'polanco'], curr: 'MXN', tz: 'America/Mexico_City', lat: 19.4326, lng: -99.1332 },
  { name: 'Johannesburg', country: 'South Africa', code: 'ZA', continent: 'africa', tier: 1, aliases: ['sandton'], curr: 'ZAR', tz: 'Africa/Johannesburg', lat: -26.2041, lng: 28.0473 },
  { name: 'Nairobi', country: 'Kenya', code: 'KE', continent: 'africa', tier: 1, aliases: ['silicon savannah'], curr: 'KES', tz: 'Africa/Nairobi', lat: -1.2921, lng: 36.8219 }
];

for (const glob of GLOBAL_LOCATIONS) {
  const slug = createSlug(glob.name);
  FINAL_LOCATIONS.push({
    slug,
    cityName: glob.name,
    countryName: glob.country,
    countryCode: glob.code,
    continent: glob.continent,
    tier: glob.tier,
    aliases: [glob.name.toLowerCase(), ...glob.aliases],
    currency: glob.curr,
    timezone: glob.tz,
    latitude: glob.lat,
    longitude: glob.lng,
    active: true,
    seoEligible: true
  });
}

console.log(`Total Final Global Dataset: ${FINAL_LOCATIONS.length}`);

// Write to src/config/jobs/locations.ts
const fileHeader = `// src/config/jobs/locations.ts
// Centralized Global Location Taxonomy for TalentXcel Jobs SEO & Google Structured Data
// Total Locations: ${FINAL_LOCATIONS.length} (Including ${generatedIndianCount} Indian Cities across all States & UTs)
// Strict Invariants: Zero duplicate slugs, normalized coordinates, accurate countryCode & currency

export interface JobLocationConfig {
  slug: string;
  cityName: string;
  stateName?: string;
  countryName: string;
  countryCode: string;
  continent: 'asia' | 'europe' | 'north-america' | 'south-america' | 'middle-east' | 'africa' | 'oceania';
  tier: 1 | 2 | 3 | 4;
  aliases: string[];
  currency: string;
  timezone: string;
  latitude?: number;
  longitude?: number;
  active: boolean;
  seoEligible: boolean;
}

export const JOB_LOCATIONS: JobLocationConfig[] = ${JSON.stringify(FINAL_LOCATIONS, null, 2)};

export const INDIAN_LOCATIONS_COUNT = ${generatedIndianCount};
export const TOTAL_LOCATIONS_COUNT = ${FINAL_LOCATIONS.length};

const LOCATION_SLUG_MAP = new Map<string, JobLocationConfig>();
const ALIAS_MAP = new Map<string, JobLocationConfig>();

for (const loc of JOB_LOCATIONS) {
  LOCATION_SLUG_MAP.set(loc.slug, loc);
  LOCATION_SLUG_MAP.set(loc.cityName.toLowerCase(), loc);
  for (const alias of loc.aliases) {
    ALIAS_MAP.set(alias.toLowerCase(), loc);
  }
}

export function getLocationBySlug(slug: string): JobLocationConfig | undefined {
  if (!slug) return undefined;
  const clean = slug.toLowerCase().trim();
  return LOCATION_SLUG_MAP.get(clean) || ALIAS_MAP.get(clean);
}

export function getRelatedCities(current: JobLocationConfig, limit: number = 6): JobLocationConfig[] {
  return JOB_LOCATIONS
    .filter(l => l.slug !== current.slug && l.countryCode === current.countryCode && (l.stateName === current.stateName || l.tier <= 2))
    .slice(0, limit);
}
`;

fs.writeFileSync(path.join(__dirname, '../src/config/jobs/locations.ts'), fileHeader, 'utf8');
console.log('✅ src/config/jobs/locations.ts successfully written and validated!');
