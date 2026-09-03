// src/config/jobs/locations.ts
// Centralized Global Location Taxonomy for TalentXcel Jobs SEO & Google Structured Data
// Total Locations: 1194 (Including 1153 Indian Cities across all States & UTs)
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

export const JOB_LOCATIONS: JobLocationConfig[] = [
  {
    "slug": "noida",
    "cityName": "Noida",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "noida",
      "greater noida",
      "ncr",
      "noida expressway"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 28.5355,
    "longitude": 77.391,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "greater-noida",
    "cityName": "Greater Noida",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "greater noida",
      "noida extension",
      "greater noida west",
      "yeida"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 28.4744,
    "longitude": 77.504,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "ghaziabad",
    "cityName": "Ghaziabad",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "ghaziabad",
      "sahibabad",
      "indirapuram",
      "vaishali",
      "ncr"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 28.6692,
    "longitude": 77.4538,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "lucknow",
    "cityName": "Lucknow",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "lucknow",
      "gomti nagar",
      "hazratganj",
      "alambagh"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.8467,
    "longitude": 80.9462,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "kanpur",
    "cityName": "Kanpur",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "kanpur",
      "cawnpore",
      "kalyanpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.4499,
    "longitude": 80.3319,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "varanasi",
    "cityName": "Varanasi",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "varanasi",
      "banaras",
      "kashi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.3176,
    "longitude": 82.9739,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "agra",
    "cityName": "Agra",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "agra",
      "sanjay place"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 27.1767,
    "longitude": 78.0081,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "meerut",
    "cityName": "Meerut",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "meerut",
      "modipuram"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 28.9845,
    "longitude": 77.7064,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "prayagraj",
    "cityName": "Prayagraj",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "prayagraj",
      "allahabad",
      "civil lines"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.4358,
    "longitude": 81.8463,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "bareilly",
    "cityName": "Bareilly",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "bareilly",
      "bareilly cantt"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 28.367,
    "longitude": 79.4304,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "aligarh",
    "cityName": "Aligarh",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "aligarh",
      "aligarh city"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 27.8974,
    "longitude": 78.088,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "moradabad",
    "cityName": "Moradabad",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "moradabad",
      "brass city"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 28.8386,
    "longitude": 78.7733,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "gorakhpur",
    "cityName": "Gorakhpur",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "gorakhpur",
      "gida"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.7606,
    "longitude": 83.3732,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "saharanpur",
    "cityName": "Saharanpur",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "saharanpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 29.9678,
    "longitude": 77.551,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "jhansi",
    "cityName": "Jhansi",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "jhansi",
      "bundelkhand"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.4484,
    "longitude": 78.5685,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "firozabad",
    "cityName": "Firozabad",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "firozabad"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 27.1593,
    "longitude": 78.3957,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "muzaffarnagar",
    "cityName": "Muzaffarnagar",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "muzaffarnagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 29.4727,
    "longitude": 77.7085,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "mathura",
    "cityName": "Mathura",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "mathura",
      "vrindavan"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 27.4924,
    "longitude": 77.6737,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "ayodhya",
    "cityName": "Ayodhya",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "ayodhya",
      "faizabad"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.7922,
    "longitude": 82.1998,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "rampur",
    "cityName": "Rampur",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "rampur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 28.8154,
    "longitude": 79.0257,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "shahjahanpur",
    "cityName": "Shahjahanpur",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "shahjahanpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 27.8805,
    "longitude": 79.912,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "farrukhabad",
    "cityName": "Farrukhabad",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "farrukhabad",
      "fatehgarh"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 27.3826,
    "longitude": 79.5843,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "hapur",
    "cityName": "Hapur",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "hapur",
      "pilkhuwa"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 28.7306,
    "longitude": 77.7759,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "etawah",
    "cityName": "Etawah",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "etawah"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.7855,
    "longitude": 79.0154,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "mirzapur",
    "cityName": "Mirzapur",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "mirzapur",
      "vindhyachal"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.146,
    "longitude": 82.569,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "bulandshahr",
    "cityName": "Bulandshahr",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "bulandshahr",
      "khurja"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 28.4069,
    "longitude": 77.8498,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "sambhal",
    "cityName": "Sambhal",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sambhal"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 28.5845,
    "longitude": 78.5684,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "amroha",
    "cityName": "Amroha",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "amroha"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 28.9044,
    "longitude": 78.4678,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "hardoi",
    "cityName": "Hardoi",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "hardoi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 27.3956,
    "longitude": 80.1312,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "fatehpur",
    "cityName": "Fatehpur",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "fatehpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.9284,
    "longitude": 80.813,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "raebareli",
    "cityName": "Raebareli",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "raebareli"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.2298,
    "longitude": 81.2424,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "orai",
    "cityName": "Orai",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "orai",
      "jalaun"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.9902,
    "longitude": 79.453,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sitapur",
    "cityName": "Sitapur",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sitapur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 27.5644,
    "longitude": 80.6829,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bahraich",
    "cityName": "Bahraich",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bahraich"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 27.5705,
    "longitude": 81.5977,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "modinagar",
    "cityName": "Modinagar",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "modinagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 28.8315,
    "longitude": 77.5804,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "unnao",
    "cityName": "Unnao",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "unnao",
      "shuklaganj"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.545,
    "longitude": 80.4878,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "jaunpur",
    "cityName": "Jaunpur",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "jaunpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.7464,
    "longitude": 82.6837,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "lakhimpur",
    "cityName": "Lakhimpur",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "lakhimpur",
      "kheri"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 27.946,
    "longitude": 80.7786,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "hathras",
    "cityName": "Hathras",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "hathras"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 27.5968,
    "longitude": 78.0519,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "banda",
    "cityName": "Banda",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "banda"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.4754,
    "longitude": 80.3347,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "pilibhit",
    "cityName": "Pilibhit",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "pilibhit"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 28.631,
    "longitude": 79.8035,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "barabanki",
    "cityName": "Barabanki",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "barabanki"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.9268,
    "longitude": 81.1834,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "mughalsarai",
    "cityName": "Mughalsarai",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "mughalsarai",
      "pt deen dayal upadhyaya nagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.2807,
    "longitude": 83.1158,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "gonda",
    "cityName": "Gonda",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "gonda"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 27.1332,
    "longitude": 81.9619,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "basti",
    "cityName": "Basti",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "basti"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.8124,
    "longitude": 82.7634,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "lalitpur",
    "cityName": "Lalitpur",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "lalitpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 24.6865,
    "longitude": 78.4116,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "deoria",
    "cityName": "Deoria",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "deoria"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.5023,
    "longitude": 83.7791,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "ghazipur",
    "cityName": "Ghazipur",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "ghazipur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.5867,
    "longitude": 83.577,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bijnor",
    "cityName": "Bijnor",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bijnor"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 29.3724,
    "longitude": 78.1358,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "azamgarh",
    "cityName": "Azamgarh",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "azamgarh"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.0688,
    "longitude": 83.1836,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "budaun",
    "cityName": "Budaun",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "budaun"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 28.0381,
    "longitude": 79.1254,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sultanpur",
    "cityName": "Sultanpur",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sultanpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.2648,
    "longitude": 82.0727,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "ballia",
    "cityName": "Ballia",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "ballia"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.7592,
    "longitude": 84.1497,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "mainpuri",
    "cityName": "Mainpuri",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "mainpuri"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 27.2289,
    "longitude": 79.0264,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "shamli",
    "cityName": "Shamli",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "shamli"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 29.4497,
    "longitude": 77.3134,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "baraut",
    "cityName": "Baraut",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "baraut",
      "baghpat"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 29.1026,
    "longitude": 77.2625,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "mumbai",
    "cityName": "Mumbai",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "mumbai",
      "bombay",
      "bkc",
      "andheri",
      "nariman point",
      "south mumbai"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 18.922,
    "longitude": 72.8347,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "navi-mumbai",
    "cityName": "Navi Mumbai",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "navi mumbai",
      "vashi",
      "belapur",
      "kharghar",
      "airoli",
      "mahape",
      "taloja"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 19.033,
    "longitude": 73.0297,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "thane",
    "cityName": "Thane",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "thane",
      "ghodbunder",
      "wagle estate"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 19.2183,
    "longitude": 72.9781,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "pune",
    "cityName": "Pune",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "pune",
      "hinjawadi",
      "magarpatta",
      "kalyani nagar",
      "wakad",
      "baner",
      "pcmc"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 18.5204,
    "longitude": 73.8567,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "pimpri-chinchwad",
    "cityName": "Pimpri-Chinchwad",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "pimpri-chinchwad",
      "pcmc",
      "bhosari",
      "chakan",
      "talwade"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 18.6279,
    "longitude": 73.8009,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "nagpur",
    "cityName": "Nagpur",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "nagpur",
      "mihan",
      "butibori"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 21.1458,
    "longitude": 79.0882,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "nashik",
    "cityName": "Nashik",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "nashik",
      "nasik",
      "satpur",
      "ambad"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 19.9975,
    "longitude": 73.7898,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "aurangabad",
    "cityName": "Aurangabad",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "aurangabad",
      "chhatrapati sambhajinagar",
      "shendra",
      "waluj"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 19.8762,
    "longitude": 75.3433,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "solapur",
    "cityName": "Solapur",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "solapur",
      "sholapur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 17.6599,
    "longitude": 75.9064,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "amravati",
    "cityName": "Amravati",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "amravati"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 20.9374,
    "longitude": 77.7796,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "kolhapur",
    "cityName": "Kolhapur",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "kolhapur",
      "gokul shirgaon",
      "shiroli"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 16.705,
    "longitude": 74.2433,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "nanded",
    "cityName": "Nanded",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "nanded",
      "nanded waghala"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 19.1383,
    "longitude": 77.321,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "sangli",
    "cityName": "Sangli",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "sangli",
      "miraj",
      "kupwad"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 16.8524,
    "longitude": 74.5815,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "jalgaon",
    "cityName": "Jalgaon",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "jalgaon"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 21.0077,
    "longitude": 75.5626,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "akola",
    "cityName": "Akola",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "akola"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 20.7002,
    "longitude": 77.0082,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "latur",
    "cityName": "Latur",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "latur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 18.4088,
    "longitude": 76.5604,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "dhule",
    "cityName": "Dhule",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "dhule"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 20.9042,
    "longitude": 74.7749,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "ahmednagar",
    "cityName": "Ahmednagar",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "ahmednagar",
      "ahilyanagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 19.0948,
    "longitude": 74.748,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "chandrapur",
    "cityName": "Chandrapur",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "chandrapur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 19.9615,
    "longitude": 79.2961,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "parbhani",
    "cityName": "Parbhani",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "parbhani"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 19.2686,
    "longitude": 76.7708,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "ichalkaranji",
    "cityName": "Ichalkaranji",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "ichalkaranji",
      "textile city"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 16.6975,
    "longitude": 74.4589,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "jalna",
    "cityName": "Jalna",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "jalna"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 19.8347,
    "longitude": 75.8816,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "panvel",
    "cityName": "Panvel",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "panvel",
      "new panvel",
      "khandeshwar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 18.9894,
    "longitude": 73.1175,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "bhiwandi",
    "cityName": "Bhiwandi",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "bhiwandi",
      "logistics hub"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 19.2967,
    "longitude": 73.0631,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "kalyan",
    "cityName": "Kalyan",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "kalyan",
      "kalyan-dombivli"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 19.2437,
    "longitude": 73.1355,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "dombivli",
    "cityName": "Dombivli",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "dombivli",
      "dombivli east",
      "dombivli west",
      "midc dombivli"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 19.2184,
    "longitude": 73.0867,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "mira-bhayandar",
    "cityName": "Mira-Bhayandar",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "mira-bhayandar",
      "mira road"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 19.2813,
    "longitude": 72.8561,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "vasai-virar",
    "cityName": "Vasai-Virar",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "vasai-virar",
      "vasai",
      "virar",
      "nalasopara"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 19.3919,
    "longitude": 72.8397,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "malegaon",
    "cityName": "Malegaon",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "malegaon"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 20.5579,
    "longitude": 74.5287,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "satara",
    "cityName": "Satara",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "satara"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 17.6805,
    "longitude": 74.0183,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "beed",
    "cityName": "Beed",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "beed"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 18.9891,
    "longitude": 75.7601,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "yavatmal",
    "cityName": "Yavatmal",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "yavatmal"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 20.3888,
    "longitude": 78.1204,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "gondia",
    "cityName": "Gondia",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "gondia"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 21.4604,
    "longitude": 80.1961,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "wardha",
    "cityName": "Wardha",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "wardha",
      "sevagram"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 20.7453,
    "longitude": 78.6022,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "barshi",
    "cityName": "Barshi",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "barshi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 18.2335,
    "longitude": 75.6946,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "achalpur",
    "cityName": "Achalpur",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "achalpur",
      "ellichpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 21.2587,
    "longitude": 77.5085,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "osmanabad",
    "cityName": "Osmanabad",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "osmanabad",
      "dharashiv"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 18.1861,
    "longitude": 76.0419,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "nandurbar",
    "cityName": "Nandurbar",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "nandurbar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 21.3697,
    "longitude": 74.2407,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "udgir",
    "cityName": "Udgir",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "udgir"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 18.3942,
    "longitude": 77.1171,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "hinganghat",
    "cityName": "Hinganghat",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "hinganghat"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 20.5558,
    "longitude": 78.8354,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "palghar",
    "cityName": "Palghar",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "palghar",
      "tarapur midc",
      "boisar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 19.6967,
    "longitude": 72.7699,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "ratnagiri",
    "cityName": "Ratnagiri",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "ratnagiri",
      "mirjole midc"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 16.9902,
    "longitude": 73.312,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "alibaug",
    "cityName": "Alibaug",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "alibaug",
      "raigad"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 18.6414,
    "longitude": 72.8722,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "karad",
    "cityName": "Karad",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "karad"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 17.2889,
    "longitude": 74.1843,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "chiplun",
    "cityName": "Chiplun",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "chiplun",
      "kherdi midc"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 17.5323,
    "longitude": 73.5186,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bhandara",
    "cityName": "Bhandara",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bhandara"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 21.1714,
    "longitude": 79.6543,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "washim",
    "cityName": "Washim",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "washim"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 20.111,
    "longitude": 77.1347,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "gadchiroli",
    "cityName": "Gadchiroli",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "gadchiroli"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 20.1809,
    "longitude": 79.9946,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "buldhana",
    "cityName": "Buldhana",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "buldhana",
      "khamgaon",
      "malkapur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 20.5292,
    "longitude": 76.1845,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sindhudurg",
    "cityName": "Sindhudurg",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sindhudurg",
      "kudal",
      "sawantwadi",
      "kankavli"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 16.1206,
    "longitude": 73.7145,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bangalore",
    "cityName": "Bangalore",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "bangalore",
      "bengaluru",
      "whitefield",
      "electronic city",
      "koramangala",
      "indiranagar",
      "bellandur",
      "outer ring road",
      "manyata"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "mysore",
    "cityName": "Mysore",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "mysore",
      "mysuru",
      "hebbal midc",
      "belagola"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 12.2958,
    "longitude": 76.6394,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "hubli",
    "cityName": "Hubli",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "hubli",
      "hubballi",
      "dharwad",
      "hubli-dharwad"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 15.3647,
    "longitude": 75.124,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "dharwad",
    "cityName": "Dharwad",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "dharwad",
      "belur industrial area"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 15.4589,
    "longitude": 75.0078,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "mangalore",
    "cityName": "Mangalore",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "mangalore",
      "mangaluru",
      "baikampady",
      "surathkal"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 12.9141,
    "longitude": 74.856,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "belgaum",
    "cityName": "Belgaum",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "belgaum",
      "belagavi",
      "udyambag"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 15.8497,
    "longitude": 74.4977,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "gulbarga",
    "cityName": "Gulbarga",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "gulbarga",
      "kalaburagi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 17.3297,
    "longitude": 76.8343,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "davanagere",
    "cityName": "Davanagere",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "davanagere",
      "davangere"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 14.4644,
    "longitude": 75.9218,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "bellary",
    "cityName": "Bellary",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "bellary",
      "ballari",
      "toranagallu",
      "jindal"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 15.1394,
    "longitude": 76.9214,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "shimoga",
    "cityName": "Shimoga",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "shimoga",
      "shivamogga",
      "bhadravathi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 13.9299,
    "longitude": 75.5681,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "tumkur",
    "cityName": "Tumkur",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "tumkur",
      "tumakuru",
      "vasanthnarasapura"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 13.3409,
    "longitude": 77.101,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "raichur",
    "cityName": "Raichur",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "raichur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 16.212,
    "longitude": 77.3439,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bidar",
    "cityName": "Bidar",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bidar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 17.9104,
    "longitude": 77.5199,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "hospet",
    "cityName": "Hospet",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "hospet",
      "hosapete",
      "hampi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 15.2689,
    "longitude": 76.3909,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "hassan",
    "cityName": "Hassan",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "hassan",
      "hassan sead"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 13.0072,
    "longitude": 76.0962,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "gadag",
    "cityName": "Gadag",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "gadag",
      "gadag-betageri"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 15.4167,
    "longitude": 75.6167,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "udupi",
    "cityName": "Udupi",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "udupi",
      "manipal"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 13.3409,
    "longitude": 74.7421,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "robertsonpet",
    "cityName": "Robertsonpet",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "robertsonpet",
      "kgf",
      "kolar gold fields"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 12.9587,
    "longitude": 78.2713,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "chitradurga",
    "cityName": "Chitradurga",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "chitradurga"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 14.2251,
    "longitude": 76.398,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kolar",
    "cityName": "Kolar",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "kolar",
      "narsapura industrial area"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 13.1367,
    "longitude": 78.1291,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "mandya",
    "cityName": "Mandya",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "mandya"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 12.5218,
    "longitude": 76.8951,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "chikmagalur",
    "cityName": "Chikmagalur",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "chikmagalur",
      "chikkamagaluru"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 13.3161,
    "longitude": 75.772,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "gangawati",
    "cityName": "Gangawati",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "gangawati"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 15.4294,
    "longitude": 76.5312,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bagalkot",
    "cityName": "Bagalkot",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bagalkot",
      "bagalkote"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 16.1691,
    "longitude": 75.6615,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "ranebennur",
    "cityName": "Ranebennur",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "ranebennur",
      "haveri"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 14.6231,
    "longitude": 75.6218,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "karwar",
    "cityName": "Karwar",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "karwar",
      "uttara kannada"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 14.8185,
    "longitude": 74.1352,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sirsi",
    "cityName": "Sirsi",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sirsi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 14.6195,
    "longitude": 74.8354,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "chikkaballapur",
    "cityName": "Chikkaballapur",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "chikkaballapur",
      "north bangalore corridor"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 13.4325,
    "longitude": 77.7275,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "ramanagara",
    "cityName": "Ramanagara",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "ramanagara",
      "bidadi industrial area"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 12.715,
    "longitude": 77.2811,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "yadgir",
    "cityName": "Yadgir",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "yadgir"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 16.7702,
    "longitude": 77.1376,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "koppal",
    "cityName": "Koppal",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "koppal"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 15.3556,
    "longitude": 76.1554,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "madikeri",
    "cityName": "Madikeri",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "madikeri",
      "coorg"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 12.4244,
    "longitude": 75.7382,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "chennai",
    "cityName": "Chennai",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "chennai",
      "madras",
      "omr",
      "guindy",
      "sholinganallur",
      "tidel park",
      "ambattur",
      "sriperumbudur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 13.0827,
    "longitude": 80.2707,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "coimbatore",
    "cityName": "Coimbatore",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "coimbatore",
      "kovai",
      "tidel park coimbatore",
      "peelamedu",
      "saravanampatti"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 11.0168,
    "longitude": 76.9558,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "madurai",
    "cityName": "Madurai",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "madurai",
      "ilango nagar",
      "koodal nagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 9.9252,
    "longitude": 78.1198,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "tiruchirappalli",
    "cityName": "Tiruchirappalli",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "tiruchirappalli",
      "trichy",
      "thuvakudi",
      "bhel trichy"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 10.7905,
    "longitude": 78.7047,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "salem",
    "cityName": "Salem",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "salem",
      "steel city salem"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 11.6643,
    "longitude": 78.146,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "tirunelveli",
    "cityName": "Tirunelveli",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "tirunelveli",
      "nellai",
      "gangaikondan"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 8.7139,
    "longitude": 77.7567,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "tiruppur",
    "cityName": "Tiruppur",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "tiruppur",
      "knitwear capital"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 11.1085,
    "longitude": 77.3411,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "erode",
    "cityName": "Erode",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "erode",
      "perundurai midc"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 11.341,
    "longitude": 77.7172,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "vellore",
    "cityName": "Vellore",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "vellore",
      "katpadi",
      "ranipet"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 12.9165,
    "longitude": 79.1325,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "thoothukudi",
    "cityName": "Thoothukudi",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "thoothukudi",
      "tuticorin",
      "spic nagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 8.7642,
    "longitude": 78.1348,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "dindigul",
    "cityName": "Dindigul",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "dindigul"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 10.3673,
    "longitude": 77.9803,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "thanjavur",
    "cityName": "Thanjavur",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "thanjavur",
      "tanjore"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 10.787,
    "longitude": 79.1378,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "ranipet",
    "cityName": "Ranipet",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "ranipet",
      "sipcot ranipet"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 12.9224,
    "longitude": 79.3327,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "sivakasi",
    "cityName": "Sivakasi",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "sivakasi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 9.4533,
    "longitude": 77.7946,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "karur",
    "cityName": "Karur",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "karur",
      "textile hub karur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 10.9601,
    "longitude": 78.0766,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "hosur",
    "cityName": "Hosur",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "hosur",
      "sipcot hosur",
      "electronic corridor"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 12.7409,
    "longitude": 77.8253,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "nagercoil",
    "cityName": "Nagercoil",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "nagercoil",
      "kanyakumari"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 8.1833,
    "longitude": 77.4119,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "kanchipuram",
    "cityName": "Kanchipuram",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "kanchipuram",
      "oragadam corridor"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 12.8342,
    "longitude": 79.7036,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "kumarapalayam",
    "cityName": "Kumarapalayam",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kumarapalayam"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 11.4429,
    "longitude": 77.7022,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "karaikkudi",
    "cityName": "Karaikkudi",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "karaikkudi",
      "cecri"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 10.0735,
    "longitude": 78.7732,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "neyveli",
    "cityName": "Neyveli",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "neyveli",
      "nlc india"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 11.5997,
    "longitude": 79.4862,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "cuddalore",
    "cityName": "Cuddalore",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "cuddalore",
      "sipcot cuddalore"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 11.748,
    "longitude": 79.7714,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kumbakonam",
    "cityName": "Kumbakonam",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kumbakonam"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 10.9602,
    "longitude": 79.3845,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "tiruvannamalai",
    "cityName": "Tiruvannamalai",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "tiruvannamalai"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 12.2253,
    "longitude": 79.0747,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "pollachi",
    "cityName": "Pollachi",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "pollachi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 10.6609,
    "longitude": 77.0048,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "rajapalayam",
    "cityName": "Rajapalayam",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "rajapalayam"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 9.4532,
    "longitude": 77.5539,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "gudiyatham",
    "cityName": "Gudiyatham",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "gudiyatham"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 12.9461,
    "longitude": 78.87,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "pudukkottai",
    "cityName": "Pudukkottai",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "pudukkottai"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 10.3797,
    "longitude": 78.8208,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "vaniyambadi",
    "cityName": "Vaniyambadi",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "vaniyambadi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 12.6825,
    "longitude": 78.6186,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "ambur",
    "cityName": "Ambur",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "ambur",
      "leather hub"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 12.7904,
    "longitude": 78.7166,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "nagapattinam",
    "cityName": "Nagapattinam",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "nagapattinam"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 10.7672,
    "longitude": 79.8449,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "krishnagiri",
    "cityName": "Krishnagiri",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "krishnagiri"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 12.5186,
    "longitude": 78.2137,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "dharmapuri",
    "cityName": "Dharmapuri",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "dharmapuri"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 12.1357,
    "longitude": 78.1584,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "namakkal",
    "cityName": "Namakkal",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "namakkal",
      "transport hub"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 11.2189,
    "longitude": 78.1674,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "perambalur",
    "cityName": "Perambalur",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "perambalur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 11.2342,
    "longitude": 78.8821,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "ariyalur",
    "cityName": "Ariyalur",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "ariyalur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 11.1401,
    "longitude": 79.0786,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "hyderabad",
    "cityName": "Hyderabad",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "hyderabad",
      "cyberabad",
      "hitec city",
      "gachibowli",
      "madhapur",
      "kondapur",
      "secunderabad",
      "financial district"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 17.385,
    "longitude": 78.4867,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "secunderabad",
    "cityName": "Secunderabad",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "secunderabad",
      "twin cities"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 17.4399,
    "longitude": 78.4983,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "warangal",
    "cityName": "Warangal",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "warangal",
      "hanumakonda",
      "kazipet"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 17.9689,
    "longitude": 79.5941,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "nizamabad",
    "cityName": "Nizamabad",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "nizamabad"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 18.6725,
    "longitude": 78.0941,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "khammam",
    "cityName": "Khammam",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "khammam"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 17.2473,
    "longitude": 80.1514,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "karimnagar",
    "cityName": "Karimnagar",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "karimnagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 18.4386,
    "longitude": 79.1288,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "ramagundam",
    "cityName": "Ramagundam",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "ramagundam",
      "ntpc ramagundam",
      "godavarikhani"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 18.7551,
    "longitude": 79.4739,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "mahbubnagar",
    "cityName": "Mahbubnagar",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "mahbubnagar",
      "palamuru"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 16.7488,
    "longitude": 78.0035,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "nalgonda",
    "cityName": "Nalgonda",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "nalgonda"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 17.0577,
    "longitude": 79.2684,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "adilabad",
    "cityName": "Adilabad",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "adilabad"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 19.6641,
    "longitude": 78.532,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "suryapet",
    "cityName": "Suryapet",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "suryapet"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 17.1439,
    "longitude": 79.6239,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "miryalaguda",
    "cityName": "Miryalaguda",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "miryalaguda"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 16.8741,
    "longitude": 79.5644,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "siddipet",
    "cityName": "Siddipet",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "siddipet",
      "it tower siddipet"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 18.1018,
    "longitude": 78.852,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "jagtial",
    "cityName": "Jagtial",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "jagtial"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 18.7944,
    "longitude": 78.9125,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "nirmal",
    "cityName": "Nirmal",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "nirmal"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 19.0964,
    "longitude": 78.3428,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kamareddy",
    "cityName": "Kamareddy",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kamareddy"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 18.3249,
    "longitude": 78.3392,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kothagudem",
    "cityName": "Kothagudem",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kothagudem",
      "bhadradri kothagudem",
      "singareni"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 17.5539,
    "longitude": 80.6175,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bodhan",
    "cityName": "Bodhan",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bodhan"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 18.6657,
    "longitude": 77.8864,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sircilla",
    "cityName": "Sircilla",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sircilla",
      "textile town"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 18.3846,
    "longitude": 78.8093,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "tandur",
    "cityName": "Tandur",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "tandur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 17.2562,
    "longitude": 77.5855,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "wanaparthy",
    "cityName": "Wanaparthy",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "wanaparthy"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 16.3624,
    "longitude": 78.0628,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "mancherial",
    "cityName": "Mancherial",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "mancherial",
      "bellampalli"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 18.8679,
    "longitude": 79.4639,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "medak",
    "cityName": "Medak",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "medak"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 18.0475,
    "longitude": 78.2618,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sangareddy",
    "cityName": "Sangareddy",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "sangareddy",
      "patancheru",
      "iit hyderabad corridor"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 17.619,
    "longitude": 78.0815,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "visakhapatnam",
    "cityName": "Visakhapatnam",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "visakhapatnam",
      "vizag",
      "rushikonda it park",
      "gajuwaka"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 17.6868,
    "longitude": 83.2185,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "vijayawada",
    "cityName": "Vijayawada",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "vijayawada",
      "bezawada",
      "gannavaram it park",
      "auto nagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 16.5062,
    "longitude": 80.648,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "guntur",
    "cityName": "Guntur",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "guntur",
      "amaravati region"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 16.3067,
    "longitude": 80.4365,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "nellore",
    "cityName": "Nellore",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "nellore",
      "sri city corridor"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 14.4426,
    "longitude": 79.9865,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "kurnool",
    "cityName": "Kurnool",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "kurnool",
      "rayalaseema"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 15.8281,
    "longitude": 78.0373,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "rajahmundry",
    "cityName": "Rajahmundry",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "rajahmundry",
      "rajamahendravaram"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 17.0005,
    "longitude": 81.804,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "tirupati",
    "cityName": "Tirupati",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "tirupati",
      "renigunta",
      "sri city"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 13.6288,
    "longitude": 79.4192,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "kakinada",
    "cityName": "Kakinada",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "kakinada",
      "kakinada sez"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 16.9891,
    "longitude": 82.2475,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "kadapa",
    "cityName": "Kadapa",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "kadapa",
      "cuddapah"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 14.4673,
    "longitude": 78.8242,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "anantapur",
    "cityName": "Anantapur",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "anantapur",
      "anantapuramu",
      "kia motors corridor"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 14.6819,
    "longitude": 77.6006,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "vizianagaram",
    "cityName": "Vizianagaram",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "vizianagaram"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 18.1067,
    "longitude": 83.3956,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "eluru",
    "cityName": "Eluru",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "eluru"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 16.7107,
    "longitude": 81.0952,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "ongole",
    "cityName": "Ongole",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "ongole"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 15.5057,
    "longitude": 80.0499,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "nandyal",
    "cityName": "Nandyal",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "nandyal"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 15.4886,
    "longitude": 78.4836,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "machilipatnam",
    "cityName": "Machilipatnam",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "machilipatnam",
      "bandar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 16.1875,
    "longitude": 81.1389,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "adoni",
    "cityName": "Adoni",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "adoni"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 15.6322,
    "longitude": 77.2728,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "tenali",
    "cityName": "Tenali",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "tenali"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 16.2437,
    "longitude": 80.64,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "proddatur",
    "cityName": "Proddatur",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "proddatur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 14.7526,
    "longitude": 78.5523,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "chittoor",
    "cityName": "Chittoor",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "chittoor"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 13.2172,
    "longitude": 79.1003,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "hindupur",
    "cityName": "Hindupur",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "hindupur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 13.829,
    "longitude": 77.493,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "bhimavaram",
    "cityName": "Bhimavaram",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "bhimavaram"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 16.5449,
    "longitude": 81.5212,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "madanapalle",
    "cityName": "Madanapalle",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "madanapalle"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 13.556,
    "longitude": 78.501,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "guntakal",
    "cityName": "Guntakal",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "guntakal"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 15.1674,
    "longitude": 77.3686,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "srikakulam",
    "cityName": "Srikakulam",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "srikakulam"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 18.2949,
    "longitude": 83.8938,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "dharmavaram",
    "cityName": "Dharmavaram",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "dharmavaram"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 14.4137,
    "longitude": 77.7126,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "gudivada",
    "cityName": "Gudivada",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "gudivada"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 16.441,
    "longitude": 80.9926,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "narasaraopet",
    "cityName": "Narasaraopet",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "narasaraopet"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 16.236,
    "longitude": 80.0499,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "tadipatri",
    "cityName": "Tadipatri",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "tadipatri"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 14.9103,
    "longitude": 78.0105,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "tadepalligudem",
    "cityName": "Tadepalligudem",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "tadepalligudem"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 16.8145,
    "longitude": 81.5266,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "chilakaluripet",
    "cityName": "Chilakaluripet",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "chilakaluripet"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 16.0892,
    "longitude": 80.1672,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "amaravati",
    "cityName": "Amaravati",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "amaravati",
      "capital region"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 16.5131,
    "longitude": 80.5165,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "ahmedabad",
    "cityName": "Ahmedabad",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "ahmedabad",
      "amdavad",
      "sg highway",
      "prahlad nagar",
      "sanand"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 23.0225,
    "longitude": 72.5714,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "surat",
    "cityName": "Surat",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "surat",
      "diamond city",
      "hazira",
      "sachin gidc"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 21.1702,
    "longitude": 72.8311,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "vadodara",
    "cityName": "Vadodara",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "vadodara",
      "baroda",
      "makarpura gidc"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 22.3072,
    "longitude": 73.1812,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "rajkot",
    "cityName": "Rajkot",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "rajkot",
      "metoda gidc",
      "shapar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 22.3039,
    "longitude": 70.8022,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "bhavnagar",
    "cityName": "Bhavnagar",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "bhavnagar",
      "alang"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 21.7645,
    "longitude": 72.1519,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "jamnagar",
    "cityName": "Jamnagar",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "jamnagar",
      "reliance jamnagar",
      "brass part hub"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 22.4707,
    "longitude": 70.0577,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "junagadh",
    "cityName": "Junagadh",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "junagadh"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 21.5222,
    "longitude": 70.4579,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "gandhinagar",
    "cityName": "Gandhinagar",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "gandhinagar",
      "gift city",
      "infocity gandhinagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 23.2156,
    "longitude": 72.6369,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "anand",
    "cityName": "Anand",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "anand",
      "milk capital",
      "vidyanagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 22.5645,
    "longitude": 72.9289,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "navsari",
    "cityName": "Navsari",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "navsari"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 20.9467,
    "longitude": 72.952,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "surendranagar",
    "cityName": "Surendranagar",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "surendranagar",
      "wadhwan"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 22.7278,
    "longitude": 71.6375,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "morbi",
    "cityName": "Morbi",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "morbi",
      "ceramic capital"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 22.8173,
    "longitude": 70.8377,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "nadiad",
    "cityName": "Nadiad",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "nadiad"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 22.6916,
    "longitude": 72.8634,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "bharuch",
    "cityName": "Bharuch",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "bharuch",
      "dahej petroleum corridor"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 21.7051,
    "longitude": 72.9959,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "porbandar",
    "cityName": "Porbandar",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "porbandar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 21.6417,
    "longitude": 69.6293,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "godhra",
    "cityName": "Godhra",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "godhra",
      "panchmahal"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 22.7758,
    "longitude": 73.6149,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "vapi",
    "cityName": "Vapi",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "vapi",
      "gidc vapi",
      "chemical industrial hub"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 20.3893,
    "longitude": 72.9106,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "ankleshwar",
    "cityName": "Ankleshwar",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "ankleshwar",
      "gidc ankleshwar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 21.6264,
    "longitude": 73.0152,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "palanpur",
    "cityName": "Palanpur",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "palanpur",
      "banaskantha"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 24.1724,
    "longitude": 72.4346,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "valsad",
    "cityName": "Valsad",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "valsad"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 20.5992,
    "longitude": 72.9342,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "patan",
    "cityName": "Patan",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "patan"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 23.8493,
    "longitude": 72.1266,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "deesa",
    "cityName": "Deesa",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "deesa"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 24.2586,
    "longitude": 72.1793,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "amreli",
    "cityName": "Amreli",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "amreli"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 21.6032,
    "longitude": 71.2221,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "veraval",
    "cityName": "Veraval",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "veraval",
      "somnath port"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 20.9077,
    "longitude": 70.3678,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "bhuj",
    "cityName": "Bhuj",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "bhuj",
      "kutch"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 23.242,
    "longitude": 69.6669,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "gandhidham",
    "cityName": "Gandhidham",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "gandhidham",
      "kandla port",
      "adipar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 23.0753,
    "longitude": 70.1337,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "mehsana",
    "cityName": "Mehsana",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "mehsana",
      "ongc mehsana"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 23.588,
    "longitude": 72.3693,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "kalol",
    "cityName": "Kalol",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "kalol",
      "iffco kalol"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 23.2384,
    "longitude": 72.4965,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "botad",
    "cityName": "Botad",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "botad"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 22.1704,
    "longitude": 71.6664,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "dahod",
    "cityName": "Dahod",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "dahod"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 22.8373,
    "longitude": 74.253,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "jaipur",
    "cityName": "Jaipur",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "jaipur",
      "pink city",
      "sitapura industrial area",
      "malviya nagar jaipur",
      "vaishali nagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.9124,
    "longitude": 75.7873,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "jodhpur",
    "cityName": "Jodhpur",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "jodhpur",
      "blue city",
      "boranada"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.2389,
    "longitude": 73.0243,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "kota",
    "cityName": "Kota",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "kota",
      "education city",
      "indraprastha industrial area"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.2138,
    "longitude": 75.8648,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "bikaner",
    "cityName": "Bikaner",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "bikaner",
      "karni industrial area"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 28.0229,
    "longitude": 73.3119,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "ajmer",
    "cityName": "Ajmer",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "ajmer",
      "kishangarh"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.4499,
    "longitude": 74.6399,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "udaipur",
    "cityName": "Udaipur",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "udaipur",
      "lake city",
      "sukher"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 24.5854,
    "longitude": 73.7125,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "bhilwara",
    "cityName": "Bhilwara",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "bhilwara",
      "textile city rajasthan"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.3407,
    "longitude": 74.6313,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "alwar",
    "cityName": "Alwar",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "alwar",
      "bhiwadi",
      "neemrana",
      "ncr"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 27.553,
    "longitude": 76.6346,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "bharatpur",
    "cityName": "Bharatpur",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "bharatpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 27.2152,
    "longitude": 77.503,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "sikar",
    "cityName": "Sikar",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "sikar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 27.6094,
    "longitude": 75.1399,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "pali",
    "cityName": "Pali",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "pali"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.7711,
    "longitude": 73.3234,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "sri-ganganagar",
    "cityName": "Sri Ganganagar",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "sri ganganagar",
      "ganganagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 29.9038,
    "longitude": 73.8772,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "beawar",
    "cityName": "Beawar",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "beawar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.1013,
    "longitude": 74.3168,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "kishangarh",
    "cityName": "Kishangarh",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "kishangarh",
      "marble city"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.5746,
    "longitude": 74.8647,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "jhunjhunu",
    "cityName": "Jhunjhunu",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "jhunjhunu",
      "shekhawati"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 28.1289,
    "longitude": 75.3995,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "hanumangarh",
    "cityName": "Hanumangarh",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "hanumangarh"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 29.5819,
    "longitude": 74.3175,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "dholpur",
    "cityName": "Dholpur",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "dholpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.7025,
    "longitude": 77.8934,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sawai-madhopur",
    "cityName": "Sawai Madhopur",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "sawai madhopur",
      "ranthambore"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.9928,
    "longitude": 76.3713,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "churu",
    "cityName": "Churu",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "churu"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 28.29,
    "longitude": 74.9698,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "chittorgarh",
    "cityName": "Chittorgarh",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "chittorgarh",
      "chittor",
      "cement hub"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 24.8887,
    "longitude": 74.6269,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "baran",
    "cityName": "Baran",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "baran"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.1011,
    "longitude": 76.5132,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bundi",
    "cityName": "Bundi",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bundi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.4414,
    "longitude": 75.6429,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "tonk",
    "cityName": "Tonk",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "tonk"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.1624,
    "longitude": 75.7895,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "nagaur",
    "cityName": "Nagaur",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "nagaur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 27.2003,
    "longitude": 73.7439,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "makrana",
    "cityName": "Makrana",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "makrana",
      "marble hub"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 27.0425,
    "longitude": 74.7262,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bhiwadi",
    "cityName": "Bhiwadi",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "bhiwadi",
      "bhiwadi industrial area",
      "khushkhera",
      "tapukara"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 28.2096,
    "longitude": 76.8624,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "neemrana",
    "cityName": "Neemrana",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "neemrana",
      "japanese industrial zone"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 27.9881,
    "longitude": 76.3883,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "banswara",
    "cityName": "Banswara",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "banswara"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 23.5461,
    "longitude": 74.4349,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "jaisalmer",
    "cityName": "Jaisalmer",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "jaisalmer",
      "golden city"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.9157,
    "longitude": 70.9083,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "indore",
    "cityName": "Indore",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "indore",
      "pithampur",
      "vijay nagar indore",
      "super corridor",
      "crystal it park"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 22.7196,
    "longitude": 75.8577,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "bhopal",
    "cityName": "Bhopal",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "bhopal",
      "mp nagar",
      "mandideep",
      "bhel bhopal"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 23.2599,
    "longitude": 77.4126,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "jabalpur",
    "cityName": "Jabalpur",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "jabalpur",
      "ordnance factory jabalpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 23.1815,
    "longitude": 79.9864,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "gwalior",
    "cityName": "Gwalior",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "gwalior",
      "malanpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.2183,
    "longitude": 78.1828,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "ujjain",
    "cityName": "Ujjain",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "ujjain",
      "mahakal"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 23.1765,
    "longitude": 75.7885,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "sagar",
    "cityName": "Sagar",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "sagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 23.8388,
    "longitude": 78.7378,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "dewas",
    "cityName": "Dewas",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "dewas",
      "bank note press dewas"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 22.9676,
    "longitude": 76.0534,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "satna",
    "cityName": "Satna",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "satna",
      "cement city"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 24.6005,
    "longitude": 80.8322,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "ratlam",
    "cityName": "Ratlam",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "ratlam",
      "railway junction ratlam"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 23.3315,
    "longitude": 75.0367,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "rewa",
    "cityName": "Rewa",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "rewa"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 24.5362,
    "longitude": 81.3037,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "murwara",
    "cityName": "Murwara",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "murwara",
      "katni"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 23.8343,
    "longitude": 80.3957,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "singrauli",
    "cityName": "Singrauli",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "singrauli",
      "energy capital",
      "waidhan"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 24.1997,
    "longitude": 82.6644,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "burhanpur",
    "cityName": "Burhanpur",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "burhanpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 21.3109,
    "longitude": 76.2299,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "khandwa",
    "cityName": "Khandwa",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "khandwa"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 21.8314,
    "longitude": 76.3498,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bhind",
    "cityName": "Bhind",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bhind"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.5638,
    "longitude": 78.7847,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "chhindwara",
    "cityName": "Chhindwara",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "chhindwara"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 22.0574,
    "longitude": 78.9382,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "guna",
    "cityName": "Guna",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "guna",
      "gail guna"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 24.6548,
    "longitude": 77.3072,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "shivpuri",
    "cityName": "Shivpuri",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "shivpuri"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.432,
    "longitude": 77.6649,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "vidisha",
    "cityName": "Vidisha",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "vidisha"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 23.5251,
    "longitude": 77.8081,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "chhatarpur",
    "cityName": "Chhatarpur",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "chhatarpur",
      "khajuraho"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 24.9164,
    "longitude": 79.5811,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "damoh",
    "cityName": "Damoh",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "damoh"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 23.836,
    "longitude": 79.4422,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "mandsaur",
    "cityName": "Mandsaur",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "mandsaur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 24.0722,
    "longitude": 75.0684,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "khargone",
    "cityName": "Khargone",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "khargone",
      "west nimar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 21.8254,
    "longitude": 75.6139,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "neemuch",
    "cityName": "Neemuch",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "neemuch"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 24.4697,
    "longitude": 74.8732,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "pithampur",
    "cityName": "Pithampur",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "pithampur",
      "auto hub of india",
      "dhar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 22.6146,
    "longitude": 75.6881,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "hoshangabad",
    "cityName": "Hoshangabad",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "hoshangabad",
      "narmadapuram"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 22.7519,
    "longitude": 77.7289,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "itarsi",
    "cityName": "Itarsi",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "itarsi",
      "railway junction itarsi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 22.6116,
    "longitude": 77.7615,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "sehore",
    "cityName": "Sehore",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sehore"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 23.2031,
    "longitude": 77.0844,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "betul",
    "cityName": "Betul",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "betul"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 21.9013,
    "longitude": 77.9024,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "seoni",
    "cityName": "Seoni",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "seoni"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 22.0869,
    "longitude": 79.5435,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "datia",
    "cityName": "Datia",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "datia"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.6653,
    "longitude": 78.4609,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "nagda",
    "cityName": "Nagda",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "nagda",
      "grasim nagda"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 23.4567,
    "longitude": 75.4124,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kolkata",
    "cityName": "Kolkata",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "kolkata",
      "calcutta",
      "salt lake",
      "sector v",
      "new town",
      "rajarhat",
      "park street"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 22.5726,
    "longitude": 88.3639,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "howrah",
    "cityName": "Howrah",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "howrah",
      "haora"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 22.5958,
    "longitude": 88.2636,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "durgapur",
    "cityName": "Durgapur",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "durgapur",
      "steel city durgapur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 23.5204,
    "longitude": 87.3119,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "asansol",
    "cityName": "Asansol",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "asansol",
      "burnpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 23.6739,
    "longitude": 86.9524,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "siliguri",
    "cityName": "Siliguri",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "siliguri",
      "gateway to northeast",
      "matigara"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.7271,
    "longitude": 88.3953,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "bardhaman",
    "cityName": "Bardhaman",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "bardhaman",
      "burdwan"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 23.2324,
    "longitude": 87.8615,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "malda",
    "cityName": "Malda",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "malda",
      "english bazaar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.0108,
    "longitude": 88.1411,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "baharampur",
    "cityName": "Baharampur",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "baharampur",
      "murshidabad"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 24.0984,
    "longitude": 88.2505,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "habra",
    "cityName": "Habra",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "habra"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 22.8456,
    "longitude": 88.6329,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kharagpur",
    "cityName": "Kharagpur",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "kharagpur",
      "iit kharagpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 22.346,
    "longitude": 87.232,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "shantipur",
    "cityName": "Shantipur",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "shantipur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 23.2509,
    "longitude": 88.4319,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "dankuni",
    "cityName": "Dankuni",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "dankuni",
      "freight hub"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 22.6868,
    "longitude": 88.2934,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "ranaghat",
    "cityName": "Ranaghat",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "ranaghat"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 23.1802,
    "longitude": 88.5802,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "haldia",
    "cityName": "Haldia",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "haldia",
      "haldia port",
      "petrochem hub"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 22.0667,
    "longitude": 88.0698,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "raiganj",
    "cityName": "Raiganj",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "raiganj"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.6179,
    "longitude": 88.1252,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "krishnanagar",
    "cityName": "Krishnanagar",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "krishnanagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 23.4013,
    "longitude": 88.4947,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "nabadwip",
    "cityName": "Nabadwip",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "nabadwip"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 23.4082,
    "longitude": 88.3665,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "midnapore",
    "cityName": "Midnapore",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "midnapore",
      "medinipur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 22.4257,
    "longitude": 87.3199,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "jalpaiguri",
    "cityName": "Jalpaiguri",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "jalpaiguri"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.5405,
    "longitude": 88.7194,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "balurghat",
    "cityName": "Balurghat",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "balurghat"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.2178,
    "longitude": 88.7656,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "basirhat",
    "cityName": "Basirhat",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "basirhat"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 22.6574,
    "longitude": 88.8672,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bankura",
    "cityName": "Bankura",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bankura"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 23.2324,
    "longitude": 87.0715,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "purulia",
    "cityName": "Purulia",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "purulia"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 23.3321,
    "longitude": 86.3652,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "darjeeling",
    "cityName": "Darjeeling",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "darjeeling"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 27.041,
    "longitude": 88.2663,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "cooch-behar",
    "cityName": "Cooch Behar",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "cooch behar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.3452,
    "longitude": 89.4482,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "alipurduar",
    "cityName": "Alipurduar",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "alipurduar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.4919,
    "longitude": 89.5271,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kochi",
    "cityName": "Kochi",
    "stateName": "Kerala",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "kochi",
      "cochin",
      "ernakulam",
      "infopark",
      "smartcity kochi",
      "kakkanad"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 9.9312,
    "longitude": 76.2673,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "thiruvananthapuram",
    "cityName": "Thiruvananthapuram",
    "stateName": "Kerala",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "thiruvananthapuram",
      "trivandrum",
      "technopark",
      "kazhakoottam"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 8.5241,
    "longitude": 76.9366,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "kozhikode",
    "cityName": "Kozhikode",
    "stateName": "Kerala",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "kozhikode",
      "calicut",
      "cyberpark calicut"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 11.2588,
    "longitude": 75.7804,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "kollam",
    "cityName": "Kollam",
    "stateName": "Kerala",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "kollam",
      "quilon"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 8.8932,
    "longitude": 76.6141,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "thrissur",
    "cityName": "Thrissur",
    "stateName": "Kerala",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "thrissur",
      "trichur",
      "cultural capital"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 10.5276,
    "longitude": 76.2144,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "kannur",
    "cityName": "Kannur",
    "stateName": "Kerala",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "kannur",
      "cannanore"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 11.8745,
    "longitude": 75.3704,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "alappuzha",
    "cityName": "Alappuzha",
    "stateName": "Kerala",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "alappuzha",
      "alleppey"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 9.4981,
    "longitude": 76.3388,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "kottayam",
    "cityName": "Kottayam",
    "stateName": "Kerala",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "kottayam"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 9.5916,
    "longitude": 76.5222,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "palakkad",
    "cityName": "Palakkad",
    "stateName": "Kerala",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "palakkad",
      "palghat",
      "kinfra kochi-bangalore corridor"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 10.7867,
    "longitude": 76.6548,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "manjeri",
    "cityName": "Manjeri",
    "stateName": "Kerala",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "manjeri"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 11.1214,
    "longitude": 76.1212,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "thalassery",
    "cityName": "Thalassery",
    "stateName": "Kerala",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "thalassery",
      "tellicherry"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 11.7491,
    "longitude": 75.489,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "ponnani",
    "cityName": "Ponnani",
    "stateName": "Kerala",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "ponnani"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 10.7742,
    "longitude": 75.925,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "vatakara",
    "cityName": "Vatakara",
    "stateName": "Kerala",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "vatakara",
      "badagara"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 11.6033,
    "longitude": 75.5908,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kanhangad",
    "cityName": "Kanhangad",
    "stateName": "Kerala",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kanhangad"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 12.3082,
    "longitude": 75.0904,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "payyanur",
    "cityName": "Payyanur",
    "stateName": "Kerala",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "payyanur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 12.0991,
    "longitude": 75.2036,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "koyilandy",
    "cityName": "Koyilandy",
    "stateName": "Kerala",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "koyilandy"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 11.4428,
    "longitude": 75.6961,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "neyyattinkara",
    "cityName": "Neyyattinkara",
    "stateName": "Kerala",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "neyyattinkara"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 8.4007,
    "longitude": 77.0864,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kayamkulam",
    "cityName": "Kayamkulam",
    "stateName": "Kerala",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kayamkulam"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 9.1764,
    "longitude": 76.4998,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "malappuram",
    "cityName": "Malappuram",
    "stateName": "Kerala",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "malappuram"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 11.0732,
    "longitude": 76.074,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "guruvayur",
    "cityName": "Guruvayur",
    "stateName": "Kerala",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "guruvayur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 10.5946,
    "longitude": 76.0381,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kasaragod",
    "cityName": "Kasaragod",
    "stateName": "Kerala",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kasaragod"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 12.4996,
    "longitude": 74.9869,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "pathanamthitta",
    "cityName": "Pathanamthitta",
    "stateName": "Kerala",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "pathanamthitta"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 9.2648,
    "longitude": 76.787,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "idukki",
    "cityName": "Idukki",
    "stateName": "Kerala",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "idukki",
      "painavu",
      "thodupuzha"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 9.8494,
    "longitude": 76.972,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "wayanad",
    "cityName": "Wayanad",
    "stateName": "Kerala",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "wayanad",
      "kalpetta",
      "sulthan bathery"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 11.6854,
    "longitude": 76.132,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "chandigarh",
    "cityName": "Chandigarh",
    "stateName": "Punjab",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "chandigarh",
      "tricity",
      "chandigarh tricity"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 30.7333,
    "longitude": 76.7794,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "ludhiana",
    "cityName": "Ludhiana",
    "stateName": "Punjab",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "ludhiana",
      "manchester of india",
      "focal point"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 30.901,
    "longitude": 75.8573,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "amritsar",
    "cityName": "Amritsar",
    "stateName": "Punjab",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "amritsar",
      "golden temple city"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 31.634,
    "longitude": 74.8723,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "jalandhar",
    "cityName": "Jalandhar",
    "stateName": "Punjab",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "jalandhar",
      "sports city"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 31.326,
    "longitude": 75.5762,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "patiala",
    "cityName": "Patiala",
    "stateName": "Punjab",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "patiala"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 30.3398,
    "longitude": 76.3869,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "bathinda",
    "cityName": "Bathinda",
    "stateName": "Punjab",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "bathinda",
      "bhatinda",
      "aiims bathinda"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 30.211,
    "longitude": 74.9455,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "mohali",
    "cityName": "Mohali",
    "stateName": "Punjab",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "mohali",
      "sas nagar",
      "it city mohali",
      "quarkcity"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 30.7046,
    "longitude": 76.7179,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "hoshiarpur",
    "cityName": "Hoshiarpur",
    "stateName": "Punjab",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "hoshiarpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 31.5273,
    "longitude": 75.9149,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "batala",
    "cityName": "Batala",
    "stateName": "Punjab",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "batala"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 31.8186,
    "longitude": 75.2028,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "pathankot",
    "cityName": "Pathankot",
    "stateName": "Punjab",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "pathankot"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 32.2643,
    "longitude": 75.6527,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "moga",
    "cityName": "Moga",
    "stateName": "Punjab",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "moga",
      "nestle moga"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 30.823,
    "longitude": 75.1734,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "abohar",
    "cityName": "Abohar",
    "stateName": "Punjab",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "abohar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 30.1453,
    "longitude": 74.1995,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "malerkotla",
    "cityName": "Malerkotla",
    "stateName": "Punjab",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "malerkotla"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 30.5244,
    "longitude": 75.8856,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "khanna",
    "cityName": "Khanna",
    "stateName": "Punjab",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "khanna",
      "grain market"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 30.7068,
    "longitude": 76.2163,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "phagwara",
    "cityName": "Phagwara",
    "stateName": "Punjab",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "phagwara",
      "lpu region"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 31.224,
    "longitude": 75.7708,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "muktsar",
    "cityName": "Muktsar",
    "stateName": "Punjab",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "muktsar",
      "sri muktsar sahib"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 30.4762,
    "longitude": 74.5165,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "barnala",
    "cityName": "Barnala",
    "stateName": "Punjab",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "barnala",
      "trident barnala"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 30.3819,
    "longitude": 75.5467,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "rajpura",
    "cityName": "Rajpura",
    "stateName": "Punjab",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "rajpura"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 30.4842,
    "longitude": 76.5937,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "firozpur",
    "cityName": "Firozpur",
    "stateName": "Punjab",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "firozpur",
      "ferozepur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 30.9237,
    "longitude": 74.6134,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kapurthala",
    "cityName": "Kapurthala",
    "stateName": "Punjab",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "kapurthala",
      "rcf kapurthala"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 31.3802,
    "longitude": 75.3818,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "faridkot",
    "cityName": "Faridkot",
    "stateName": "Punjab",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "faridkot"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 30.6769,
    "longitude": 74.7583,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "fazilka",
    "cityName": "Fazilka",
    "stateName": "Punjab",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "fazilka"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 30.4037,
    "longitude": 74.0254,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "gurdaspur",
    "cityName": "Gurdaspur",
    "stateName": "Punjab",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "gurdaspur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 32.0419,
    "longitude": 75.4053,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "nawanshahr",
    "cityName": "Nawanshahr",
    "stateName": "Punjab",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "nawanshahr",
      "shaheed bhagat singh nagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 31.1256,
    "longitude": 76.1189,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "rupnagar",
    "cityName": "Rupnagar",
    "stateName": "Punjab",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "rupnagar",
      "ropar",
      "iit ropar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 30.9664,
    "longitude": 76.5331,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "gurgaon",
    "cityName": "Gurgaon",
    "stateName": "Haryana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "gurgaon",
      "gurugram",
      "cyber city",
      "dlf cyber hub",
      "golf course road",
      "sohna road",
      "udyog vihar",
      "manesar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 28.4595,
    "longitude": 77.0266,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "faridabad",
    "cityName": "Faridabad",
    "stateName": "Haryana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "faridabad",
      "nit faridabad",
      "ballabgarh"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 28.4089,
    "longitude": 77.3178,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "panipat",
    "cityName": "Panipat",
    "stateName": "Haryana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "panipat",
      "textile city panipat",
      "ioc refinery"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 29.3909,
    "longitude": 76.9635,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "ambala",
    "cityName": "Ambala",
    "stateName": "Haryana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "ambala",
      "ambala cantt"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 30.3782,
    "longitude": 76.7767,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "yamunanagar",
    "cityName": "Yamunanagar",
    "stateName": "Haryana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "yamunanagar",
      "jagadhri"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 30.129,
    "longitude": 77.2674,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "rohtak",
    "cityName": "Rohtak",
    "stateName": "Haryana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "rohtak",
      "imtt rohtak"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 28.8955,
    "longitude": 76.6066,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "hisar",
    "cityName": "Hisar",
    "stateName": "Haryana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "hisar",
      "jindal stainless"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 29.1492,
    "longitude": 75.7217,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "karnal",
    "cityName": "Karnal",
    "stateName": "Haryana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "karnal",
      "ndri karnal"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 29.6857,
    "longitude": 76.9905,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "sonipat",
    "cityName": "Sonipat",
    "stateName": "Haryana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "sonipat",
      "sonepat",
      "kundli",
      "rai industrial area"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 28.9931,
    "longitude": 77.0151,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "panchkula",
    "cityName": "Panchkula",
    "stateName": "Haryana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "panchkula",
      "it park panchkula",
      "hmt pinjore"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 30.6942,
    "longitude": 76.8606,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "bhiwani",
    "cityName": "Bhiwani",
    "stateName": "Haryana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "bhiwani"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 28.7932,
    "longitude": 76.139,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "sirsa",
    "cityName": "Sirsa",
    "stateName": "Haryana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "sirsa"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 29.5349,
    "longitude": 75.0275,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "bahadurgarh",
    "cityName": "Bahadurgarh",
    "stateName": "Haryana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "bahadurgarh",
      "footwear park"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 28.6924,
    "longitude": 76.924,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "jind",
    "cityName": "Jind",
    "stateName": "Haryana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "jind"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 29.3159,
    "longitude": 76.3154,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "thanesar",
    "cityName": "Thanesar",
    "stateName": "Haryana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "thanesar",
      "kurukshetra",
      "nit kurukshetra"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 29.9695,
    "longitude": 76.8198,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "kaithal",
    "cityName": "Kaithal",
    "stateName": "Haryana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kaithal"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 29.8015,
    "longitude": 76.3996,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "rewari",
    "cityName": "Rewari",
    "stateName": "Haryana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "rewari",
      "bawal industrial area",
      "dharuhera"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 28.192,
    "longitude": 76.6191,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "palwal",
    "cityName": "Palwal",
    "stateName": "Haryana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "palwal"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 28.1447,
    "longitude": 77.326,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "hansi",
    "cityName": "Hansi",
    "stateName": "Haryana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "hansi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 29.1004,
    "longitude": 75.9629,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "narnaul",
    "cityName": "Narnaul",
    "stateName": "Haryana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "narnaul",
      "mahendragarh"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 28.0435,
    "longitude": 76.1082,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "fatehabad",
    "cityName": "Fatehabad",
    "stateName": "Haryana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "fatehabad"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 29.5147,
    "longitude": 75.4542,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "charkhi-dadri",
    "cityName": "Charkhi Dadri",
    "stateName": "Haryana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "charkhi dadri"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 28.5921,
    "longitude": 76.2655,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "manesar",
    "cityName": "Manesar",
    "stateName": "Haryana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "manesar",
      "imt manesar",
      "maruti suzuki corridor"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 28.3588,
    "longitude": 76.9405,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "delhi",
    "cityName": "Delhi",
    "stateName": "Delhi",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "delhi",
      "new delhi",
      "central delhi",
      "south delhi",
      "connaught place",
      "nehru place",
      "okhla",
      "dwarka",
      "rohini"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 28.6139,
    "longitude": 77.209,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "patna",
    "cityName": "Patna",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "patna",
      "patliputra industrial area",
      "danapur",
      "bailey road"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.5941,
    "longitude": 85.1376,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "gaya",
    "cityName": "Gaya",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "gaya",
      "bodhgaya"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 24.7914,
    "longitude": 85.0002,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "bhagalpur",
    "cityName": "Bhagalpur",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "bhagalpur",
      "silk city bhagalpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.2425,
    "longitude": 86.9842,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "muzaffarpur",
    "cityName": "Muzaffarpur",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "muzaffarpur",
      "bela industrial area"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.1209,
    "longitude": 85.3647,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "purnia",
    "cityName": "Purnia",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "purnia",
      "purnea"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.7771,
    "longitude": 87.4753,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "darbhanga",
    "cityName": "Darbhanga",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "darbhanga",
      "mithila"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.1542,
    "longitude": 85.8918,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "bihar-sharif",
    "cityName": "Bihar Sharif",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "bihar sharif",
      "nalanda"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.1982,
    "longitude": 85.5149,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "arrah",
    "cityName": "Arrah",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "arrah",
      "bhojpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.556,
    "longitude": 84.6603,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "begusarai",
    "cityName": "Begusarai",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "begusarai",
      "barauni refinery"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.4182,
    "longitude": 86.1272,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "katihar",
    "cityName": "Katihar",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "katihar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.5541,
    "longitude": 87.5714,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "munger",
    "cityName": "Munger",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "munger",
      "itc munger",
      "jamalpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.3757,
    "longitude": 86.4744,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "chhapra",
    "cityName": "Chhapra",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "chhapra",
      "saran"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.7811,
    "longitude": 84.7543,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "danapur",
    "cityName": "Danapur",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "danapur",
      "danapur cantt"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.6333,
    "longitude": 85.05,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "bettiah",
    "cityName": "Bettiah",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "bettiah",
      "west champaran"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.8024,
    "longitude": 84.5029,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "saharsa",
    "cityName": "Saharsa",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "saharsa"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.8835,
    "longitude": 86.6006,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sasaram",
    "cityName": "Sasaram",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "sasaram",
      "rohtas"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 24.9511,
    "longitude": 84.0315,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "hajipur",
    "cityName": "Hajipur",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "hajipur",
      "epip hajipur",
      "vaishali"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.6858,
    "longitude": 85.2146,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "dehri",
    "cityName": "Dehri",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "dehri",
      "dehri-on-sone"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 24.908,
    "longitude": 84.1866,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "siwan",
    "cityName": "Siwan",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "siwan"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.2196,
    "longitude": 84.3567,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "motihari",
    "cityName": "Motihari",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "motihari",
      "east champaran"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.647,
    "longitude": 84.9089,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "nawada",
    "cityName": "Nawada",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "nawada"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 24.8872,
    "longitude": 85.5422,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "buxar",
    "cityName": "Buxar",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "buxar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.5647,
    "longitude": 83.9777,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kishanganj",
    "cityName": "Kishanganj",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kishanganj"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.0738,
    "longitude": 87.9405,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sitamarhi",
    "cityName": "Sitamarhi",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sitamarhi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.5933,
    "longitude": 85.4894,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "samastipur",
    "cityName": "Samastipur",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "samastipur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.8629,
    "longitude": 85.7811,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "madhubani",
    "cityName": "Madhubani",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "madhubani"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.3541,
    "longitude": 86.0706,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "jehanabad",
    "cityName": "Jehanabad",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "jehanabad"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.2136,
    "longitude": 84.9863,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "aurangabad-bihar",
    "cityName": "Aurangabad (Bihar)",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "aurangabad (bihar)"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 24.7538,
    "longitude": 84.3742,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "gopalganj",
    "cityName": "Gopalganj",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "gopalganj"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.4674,
    "longitude": 84.4442,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bhubaneswar",
    "cityName": "Bhubaneswar",
    "stateName": "Odisha",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "bhubaneswar",
      "infocity",
      "patia",
      "chandaka it corridor"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 20.2961,
    "longitude": 85.8245,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "cuttack",
    "cityName": "Cuttack",
    "stateName": "Odisha",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "cuttack",
      "choudwar industrial area"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 20.4625,
    "longitude": 85.8828,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "rourkela",
    "cityName": "Rourkela",
    "stateName": "Odisha",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "rourkela",
      "sail rourkela",
      "nit rourkela"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 22.2604,
    "longitude": 84.8536,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "berhampur",
    "cityName": "Berhampur",
    "stateName": "Odisha",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "berhampur",
      "brahmapur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 19.315,
    "longitude": 84.7941,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "sambalpur",
    "cityName": "Sambalpur",
    "stateName": "Odisha",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "sambalpur",
      "burla"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 21.4669,
    "longitude": 83.9812,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "puri",
    "cityName": "Puri",
    "stateName": "Odisha",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "puri"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 19.8135,
    "longitude": 85.8312,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "balasore",
    "cityName": "Balasore",
    "stateName": "Odisha",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "balasore",
      "baleshwar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 21.4934,
    "longitude": 86.9135,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "bhadrak",
    "cityName": "Bhadrak",
    "stateName": "Odisha",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bhadrak"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 21.0544,
    "longitude": 86.5015,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "baripada",
    "cityName": "Baripada",
    "stateName": "Odisha",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "baripada",
      "mayurbhanj"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 21.9348,
    "longitude": 86.7265,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "jharsuguda",
    "cityName": "Jharsuguda",
    "stateName": "Odisha",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "jharsuguda",
      "vedanta jharsuguda"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 21.8554,
    "longitude": 84.0062,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "jeypore",
    "cityName": "Jeypore",
    "stateName": "Odisha",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "jeypore",
      "koraput",
      "nalco damanjodi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 18.8561,
    "longitude": 82.5684,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bargarh",
    "cityName": "Bargarh",
    "stateName": "Odisha",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bargarh"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 21.3328,
    "longitude": 83.619,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "rayagada",
    "cityName": "Rayagada",
    "stateName": "Odisha",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "rayagada"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 19.1717,
    "longitude": 83.4163,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "angul",
    "cityName": "Angul",
    "stateName": "Odisha",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "angul",
      "nalco angul",
      "jindal steel"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 20.8408,
    "longitude": 85.1018,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "dhenkanal",
    "cityName": "Dhenkanal",
    "stateName": "Odisha",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "dhenkanal"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 20.6657,
    "longitude": 85.5975,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "paradip",
    "cityName": "Paradip",
    "stateName": "Odisha",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "paradip",
      "paradeep port",
      "iocl paradip"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 20.3165,
    "longitude": 86.6114,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "kendrapara",
    "cityName": "Kendrapara",
    "stateName": "Odisha",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kendrapara"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 20.4996,
    "longitude": 86.4223,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "keonjhar",
    "cityName": "Keonjhar",
    "stateName": "Odisha",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "keonjhar",
      "kendujhar",
      "mining hub"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 21.6289,
    "longitude": 85.5817,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "bolangir",
    "cityName": "Bolangir",
    "stateName": "Odisha",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bolangir",
      "balangir"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 20.7107,
    "longitude": 83.4844,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "ranchi",
    "cityName": "Ranchi",
    "stateName": "Jharkhand",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "ranchi",
      "namkum",
      "tupudana industrial area"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 23.3441,
    "longitude": 85.3096,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "jamshedpur",
    "cityName": "Jamshedpur",
    "stateName": "Jharkhand",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "jamshedpur",
      "tatanagar",
      "adityapur industrial area",
      "bistupur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 22.8046,
    "longitude": 86.2029,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "dhanbad",
    "cityName": "Dhanbad",
    "stateName": "Jharkhand",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "dhanbad",
      "coal capital",
      "iit ism dhanbad"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 23.7957,
    "longitude": 86.4304,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "bokaro",
    "cityName": "Bokaro",
    "stateName": "Jharkhand",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "bokaro",
      "bokaro steel city"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 23.6693,
    "longitude": 86.1511,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "deoghar",
    "cityName": "Deoghar",
    "stateName": "Jharkhand",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "deoghar",
      "aiims deoghar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 24.4826,
    "longitude": 86.7001,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "hazaribagh",
    "cityName": "Hazaribagh",
    "stateName": "Jharkhand",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "hazaribagh"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 23.9937,
    "longitude": 85.3623,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "giridih",
    "cityName": "Giridih",
    "stateName": "Jharkhand",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "giridih"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 24.1866,
    "longitude": 86.3072,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "ramgarh",
    "cityName": "Ramgarh",
    "stateName": "Jharkhand",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "ramgarh",
      "patratu"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 23.63,
    "longitude": 85.5135,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "medininagar",
    "cityName": "Medininagar",
    "stateName": "Jharkhand",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "medininagar",
      "daltonganj"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 24.0416,
    "longitude": 84.0722,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "chaibasa",
    "cityName": "Chaibasa",
    "stateName": "Jharkhand",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "chaibasa",
      "west singhbhum"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 22.5516,
    "longitude": 85.8078,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "dumka",
    "cityName": "Dumka",
    "stateName": "Jharkhand",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "dumka"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 24.269,
    "longitude": 87.2472,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sahibganj",
    "cityName": "Sahibganj",
    "stateName": "Jharkhand",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sahibganj"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.2425,
    "longitude": 87.6433,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "raipur",
    "cityName": "Raipur",
    "stateName": "Chhattisgarh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "raipur",
      "nava raipur",
      "urla industrial area"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 21.2514,
    "longitude": 81.6296,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "bhilai",
    "cityName": "Bhilai",
    "stateName": "Chhattisgarh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "bhilai",
      "durg-bhilai",
      "bhilai steel plant"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 21.2144,
    "longitude": 81.3805,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "bilaspur",
    "cityName": "Bilaspur",
    "stateName": "Chhattisgarh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "bilaspur",
      "secl bilaspur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 22.0797,
    "longitude": 82.1409,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "korba",
    "cityName": "Korba",
    "stateName": "Chhattisgarh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "korba",
      "power capital",
      "ntpc korba",
      "balco"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 22.3595,
    "longitude": 82.7501,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "rajnandgaon",
    "cityName": "Rajnandgaon",
    "stateName": "Chhattisgarh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "rajnandgaon"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 21.097,
    "longitude": 81.0375,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "raigarh",
    "cityName": "Raigarh",
    "stateName": "Chhattisgarh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "raigarh",
      "jindal raigarh"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 21.8974,
    "longitude": 83.395,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "jagdalpur",
    "cityName": "Jagdalpur",
    "stateName": "Chhattisgarh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "jagdalpur",
      "bastar",
      "nmdc nagarnar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 19.0748,
    "longitude": 82.0093,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "ambikapur",
    "cityName": "Ambikapur",
    "stateName": "Chhattisgarh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "ambikapur",
      "surguja"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 23.1197,
    "longitude": 83.1979,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "dhamtari",
    "cityName": "Dhamtari",
    "stateName": "Chhattisgarh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "dhamtari"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 20.7071,
    "longitude": 81.5497,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "durg",
    "cityName": "Durg",
    "stateName": "Chhattisgarh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "durg"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 21.1904,
    "longitude": 81.2849,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "mahasamund",
    "cityName": "Mahasamund",
    "stateName": "Chhattisgarh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "mahasamund"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 21.109,
    "longitude": 82.0973,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "dehradun",
    "cityName": "Dehradun",
    "stateName": "Uttarakhand",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "dehradun",
      "it park dehradun",
      "rajpur road"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 30.3165,
    "longitude": 78.0322,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "haridwar",
    "cityName": "Haridwar",
    "stateName": "Uttarakhand",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "haridwar",
      "siidcul haridwar",
      "bhel haridwar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 29.9457,
    "longitude": 78.1642,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "roorkee",
    "cityName": "Roorkee",
    "stateName": "Uttarakhand",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "roorkee",
      "iit roorkee"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 29.8543,
    "longitude": 77.888,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "haldwani",
    "cityName": "Haldwani",
    "stateName": "Uttarakhand",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "haldwani",
      "kathgodam"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 29.2183,
    "longitude": 79.513,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "rudrapur",
    "cityName": "Rudrapur",
    "stateName": "Uttarakhand",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "rudrapur",
      "sidcul pantnagar",
      "udham singh nagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 28.98,
    "longitude": 79.4,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "kashipur",
    "cityName": "Kashipur",
    "stateName": "Uttarakhand",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "kashipur",
      "iim kashipur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 29.2104,
    "longitude": 78.9619,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "rishikesh",
    "cityName": "Rishikesh",
    "stateName": "Uttarakhand",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "rishikesh",
      "aiims rishikesh"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 30.0869,
    "longitude": 78.2676,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "nainital",
    "cityName": "Nainital",
    "stateName": "Uttarakhand",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "nainital"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 29.3919,
    "longitude": 79.4542,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "kotdwar",
    "cityName": "Kotdwar",
    "stateName": "Uttarakhand",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kotdwar",
      "pauri garhwal"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 29.7465,
    "longitude": 78.5286,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "pithoragarh",
    "cityName": "Pithoragarh",
    "stateName": "Uttarakhand",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "pithoragarh"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 29.5829,
    "longitude": 80.2182,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "almora",
    "cityName": "Almora",
    "stateName": "Uttarakhand",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "almora"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 29.5971,
    "longitude": 79.6591,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "vikasnagar",
    "cityName": "Vikasnagar",
    "stateName": "Uttarakhand",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "vikasnagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 30.49,
    "longitude": 77.77,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "shimla",
    "cityName": "Shimla",
    "stateName": "Himachal Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "shimla"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 31.1048,
    "longitude": 77.1734,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "baddi",
    "cityName": "Baddi",
    "stateName": "Himachal Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "baddi",
      "baddi-barotiwala-nalagarh",
      "pharma capital"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 30.9578,
    "longitude": 76.7914,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "dharamshala",
    "cityName": "Dharamshala",
    "stateName": "Himachal Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "dharamshala",
      "kangra",
      "mcleodganj"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 32.219,
    "longitude": 76.3234,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "solan",
    "cityName": "Solan",
    "stateName": "Himachal Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "solan",
      "mushroom city"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 30.9084,
    "longitude": 77.0999,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "mandi",
    "cityName": "Mandi",
    "stateName": "Himachal Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "mandi",
      "iit mandi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 31.7087,
    "longitude": 76.932,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "kullu",
    "cityName": "Kullu",
    "stateName": "Himachal Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "kullu",
      "manali"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 31.9579,
    "longitude": 77.1095,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "nalagarh",
    "cityName": "Nalagarh",
    "stateName": "Himachal Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "nalagarh"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 31.0425,
    "longitude": 76.7171,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "paonta-sahib",
    "cityName": "Paonta Sahib",
    "stateName": "Himachal Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "paonta sahib",
      "sirmaur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 30.4439,
    "longitude": 77.6254,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "una",
    "cityName": "Una",
    "stateName": "Himachal Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "una",
      "iiit una"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 31.4685,
    "longitude": 76.2708,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "hamirpur",
    "cityName": "Hamirpur",
    "stateName": "Himachal Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "hamirpur",
      "nithamirpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 31.6862,
    "longitude": 76.5213,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "bilaspur-hp",
    "cityName": "Bilaspur (HP)",
    "stateName": "Himachal Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bilaspur (hp)",
      "aiims bilaspur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 31.326,
    "longitude": 76.76,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "chamba",
    "cityName": "Chamba",
    "stateName": "Himachal Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "chamba"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 32.5534,
    "longitude": 76.1258,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "srinagar",
    "cityName": "Srinagar",
    "stateName": "Jammu and Kashmir",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "srinagar",
      "rangreth it park"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 34.0837,
    "longitude": 74.7973,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "jammu",
    "cityName": "Jammu",
    "stateName": "Jammu and Kashmir",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "jammu",
      "bari brahmana",
      "iit jammu"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 32.7266,
    "longitude": 74.857,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "anantnag",
    "cityName": "Anantnag",
    "stateName": "Jammu and Kashmir",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "anantnag",
      "islamabad j&k"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 33.7311,
    "longitude": 75.1522,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "baramulla",
    "cityName": "Baramulla",
    "stateName": "Jammu and Kashmir",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "baramulla"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 34.198,
    "longitude": 74.3636,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "udhampur",
    "cityName": "Udhampur",
    "stateName": "Jammu and Kashmir",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "udhampur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 32.9261,
    "longitude": 75.1416,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "kathua",
    "cityName": "Kathua",
    "stateName": "Jammu and Kashmir",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "kathua",
      "industrial area kathua"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 32.3688,
    "longitude": 75.5218,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "sopore",
    "cityName": "Sopore",
    "stateName": "Jammu and Kashmir",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "sopore"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 34.2988,
    "longitude": 74.4714,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "pulwama",
    "cityName": "Pulwama",
    "stateName": "Jammu and Kashmir",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "pulwama",
      "aiims awantipora"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 33.8732,
    "longitude": 74.8988,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "leh",
    "cityName": "Leh",
    "stateName": "Ladakh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "leh"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 34.1526,
    "longitude": 77.5771,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "kargil",
    "cityName": "Kargil",
    "stateName": "Ladakh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kargil"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 34.5539,
    "longitude": 76.1349,
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "guwahati",
    "cityName": "Guwahati",
    "stateName": "Assam",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "guwahati",
      "tech city guwahati",
      "dispur",
      "iit guwahati"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.1445,
    "longitude": 91.7362,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "silchar",
    "cityName": "Silchar",
    "stateName": "Assam",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "silchar",
      "nit silchar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 24.8333,
    "longitude": 92.7789,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "dibrugarh",
    "cityName": "Dibrugarh",
    "stateName": "Assam",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "dibrugarh",
      "tea city"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 27.4728,
    "longitude": 94.912,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "jorhat",
    "cityName": "Jorhat",
    "stateName": "Assam",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "jorhat"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.7509,
    "longitude": 94.2037,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "nagaon",
    "cityName": "Nagaon",
    "stateName": "Assam",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "nagaon"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.3466,
    "longitude": 92.6841,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "tinsukia",
    "cityName": "Tinsukia",
    "stateName": "Assam",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "tinsukia",
      "commercial hub assam"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 27.4922,
    "longitude": 95.3468,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "tezpur",
    "cityName": "Tezpur",
    "stateName": "Assam",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "tezpur",
      "central university tezpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.6528,
    "longitude": 92.7926,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "bongaigaon",
    "cityName": "Bongaigaon",
    "stateName": "Assam",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "bongaigaon",
      "bgr refinery"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 26.4789,
    "longitude": 90.5574,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "agartala",
    "cityName": "Agartala",
    "stateName": "Tripura",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "agartala",
      "it sead agartala"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 23.8315,
    "longitude": 91.2868,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "shillong",
    "cityName": "Shillong",
    "stateName": "Meghalaya",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "shillong",
      "iim shillong",
      "scotland of east"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.5788,
    "longitude": 91.8933,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "imphal",
    "cityName": "Imphal",
    "stateName": "Manipur",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "imphal"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 24.817,
    "longitude": 93.9368,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "aizawl",
    "cityName": "Aizawl",
    "stateName": "Mizoram",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "aizawl"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 23.7271,
    "longitude": 92.7176,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "kohima",
    "cityName": "Kohima",
    "stateName": "Nagaland",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "kohima"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.6751,
    "longitude": 94.1086,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "dimapur",
    "cityName": "Dimapur",
    "stateName": "Nagaland",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "dimapur",
      "commercial hub nagaland"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 25.9068,
    "longitude": 93.7271,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "itanagar",
    "cityName": "Itanagar",
    "stateName": "Arunachal Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "itanagar",
      "naharlagun"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 27.0844,
    "longitude": 93.6053,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "gangtok",
    "cityName": "Gangtok",
    "stateName": "Sikkim",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "gangtok",
      "sikkim pharma corridor"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 27.3389,
    "longitude": 88.6065,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "panaji",
    "cityName": "Panaji",
    "stateName": "Goa",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "panaji",
      "panjim"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 15.4909,
    "longitude": 73.8278,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "margao",
    "cityName": "Margao",
    "stateName": "Goa",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "margao",
      "madgaon",
      "verna industrial estate"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 15.2832,
    "longitude": 73.9862,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "vasco-da-gama",
    "cityName": "Vasco da Gama",
    "stateName": "Goa",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "vasco da gama",
      "mormugao"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 15.3982,
    "longitude": 73.8113,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "mapusa",
    "cityName": "Mapusa",
    "stateName": "Goa",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "mapusa"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 15.5937,
    "longitude": 73.8142,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "pondicherry",
    "cityName": "Pondicherry",
    "stateName": "Puducherry",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 2,
    "aliases": [
      "pondicherry",
      "puducherry"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 11.9416,
    "longitude": 79.8083,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "port-blair",
    "cityName": "Port Blair",
    "stateName": "Andaman and Nicobar Islands",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "port blair"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 11.6234,
    "longitude": 92.7265,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "silvassa",
    "cityName": "Silvassa",
    "stateName": "Dadra and Nagar Haveli",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "silvassa",
      "industrial hub silvassa"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 20.2763,
    "longitude": 73.0083,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "daman",
    "cityName": "Daman",
    "stateName": "Daman and Diu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 3,
    "aliases": [
      "daman"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "latitude": 20.3974,
    "longitude": 72.8328,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "chandauli",
    "cityName": "Chandauli",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "chandauli"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sant-kabir-nagar",
    "cityName": "Sant Kabir Nagar",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sant kabir nagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "siddharthnagar",
    "cityName": "Siddharthnagar",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "siddharthnagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "maharajganj",
    "cityName": "Maharajganj",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "maharajganj"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kushinagar",
    "cityName": "Kushinagar",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kushinagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "mau",
    "cityName": "Mau",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "mau"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "balia",
    "cityName": "Balia",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "balia"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "shravasti",
    "cityName": "Shravasti",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "shravasti"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "balrampur",
    "cityName": "Balrampur",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "balrampur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kannauj",
    "cityName": "Kannauj",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kannauj"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "auraiya",
    "cityName": "Auraiya",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "auraiya"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kasganj",
    "cityName": "Kasganj",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kasganj"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "chitrakoot",
    "cityName": "Chitrakoot",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "chitrakoot"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "mahoba",
    "cityName": "Mahoba",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "mahoba"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "hamirpur-up",
    "cityName": "Hamirpur (UP)",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "hamirpur (up)"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kaushambi",
    "cityName": "Kaushambi",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kaushambi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "pratapgarh",
    "cityName": "Pratapgarh",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "pratapgarh"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "amethi",
    "cityName": "Amethi",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "amethi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "baghpat",
    "cityName": "Baghpat",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "baghpat"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sambhal-town",
    "cityName": "Sambhal Town",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sambhal town"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "pilkhuwa",
    "cityName": "Pilkhuwa",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "pilkhuwa"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "khurja",
    "cityName": "Khurja",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "khurja"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "rath",
    "cityName": "Rath",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "rath"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "konch",
    "cityName": "Konch",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "konch"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "tilhar",
    "cityName": "Tilhar",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "tilhar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "ujhani",
    "cityName": "Ujhani",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "ujhani"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sahaswan",
    "cityName": "Sahaswan",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sahaswan"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bilaspur-up",
    "cityName": "Bilaspur (UP)",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bilaspur (up)"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kosi-kalan",
    "cityName": "Kosi Kalan",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kosi kalan"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "vrindavan",
    "cityName": "Vrindavan",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "vrindavan"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "gokul",
    "cityName": "Gokul",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "gokul"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "barsana",
    "cityName": "Barsana",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "barsana"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "chhata",
    "cityName": "Chhata",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "chhata"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "nandgaon",
    "cityName": "Nandgaon",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "nandgaon"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "achhnera",
    "cityName": "Achhnera",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "achhnera"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "fatehpur-sikri",
    "cityName": "Fatehpur Sikri",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "fatehpur sikri"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "shamsabad",
    "cityName": "Shamsabad",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "shamsabad"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "etmadpur",
    "cityName": "Etmadpur",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "etmadpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "jalesar",
    "cityName": "Jalesar",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "jalesar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "shikohabad",
    "cityName": "Shikohabad",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "shikohabad"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sirsaganj",
    "cityName": "Sirsaganj",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sirsaganj"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "jaswantnagar",
    "cityName": "Jaswantnagar",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "jaswantnagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bharthana",
    "cityName": "Bharthana",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bharthana"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bidhuna",
    "cityName": "Bidhuna",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bidhuna"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "dibiyapur",
    "cityName": "Dibiyapur",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "dibiyapur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "chhibramau",
    "cityName": "Chhibramau",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "chhibramau"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "gursahaiganj",
    "cityName": "Gursahaiganj",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "gursahaiganj"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kaimganj",
    "cityName": "Kaimganj",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kaimganj"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "mohammadabad",
    "cityName": "Mohammadabad",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "mohammadabad"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bewar",
    "cityName": "Bewar",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bewar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kishni",
    "cityName": "Kishni",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kishni"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "karhal",
    "cityName": "Karhal",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "karhal"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "ghiror",
    "cityName": "Ghiror",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "ghiror"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "aliganj",
    "cityName": "Aliganj",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "aliganj"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "patiyali",
    "cityName": "Patiyali",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "patiyali"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sahawar",
    "cityName": "Sahawar",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sahawar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "ganjdundwara",
    "cityName": "Ganjdundwara",
    "stateName": "Uttar Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "ganjdundwara"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bhiwandi-nizampur",
    "cityName": "Bhiwandi Nizampur",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bhiwandi nizampur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "mira-bhayander",
    "cityName": "Mira Bhayander",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "mira bhayander"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "ulhasnagar",
    "cityName": "Ulhasnagar",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "ulhasnagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "badlapur",
    "cityName": "Badlapur",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "badlapur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "ambernath",
    "cityName": "Ambernath",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "ambernath"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "virar",
    "cityName": "Virar",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "virar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "vasai",
    "cityName": "Vasai",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "vasai"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "palghar-town",
    "cityName": "Palghar Town",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "palghar town"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "boisar",
    "cityName": "Boisar",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "boisar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "dahanu",
    "cityName": "Dahanu",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "dahanu"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "jawhar",
    "cityName": "Jawhar",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "jawhar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "wada",
    "cityName": "Wada",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "wada"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "shahapur",
    "cityName": "Shahapur",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "shahapur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "murbad",
    "cityName": "Murbad",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "murbad"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "karjat",
    "cityName": "Karjat",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "karjat"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "khopoli",
    "cityName": "Khopoli",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "khopoli"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "uran",
    "cityName": "Uran",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "uran"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "roha",
    "cityName": "Roha",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "roha"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "pen",
    "cityName": "Pen",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "pen"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "mahad",
    "cityName": "Mahad",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "mahad"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "mangaon",
    "cityName": "Mangaon",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "mangaon"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "shrivardhan",
    "cityName": "Shrivardhan",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "shrivardhan"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "murud",
    "cityName": "Murud",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "murud"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "dapoli",
    "cityName": "Dapoli",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "dapoli"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "khed",
    "cityName": "Khed",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "khed"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "guhagar",
    "cityName": "Guhagar",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "guhagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "devgad",
    "cityName": "Devgad",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "devgad"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "malvan",
    "cityName": "Malvan",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "malvan"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "vengurla",
    "cityName": "Vengurla",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "vengurla"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sawantwadi",
    "cityName": "Sawantwadi",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sawantwadi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "dodamarg",
    "cityName": "Dodamarg",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "dodamarg"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kankavli",
    "cityName": "Kankavli",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kankavli"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kagal",
    "cityName": "Kagal",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kagal"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "gadhinglaj",
    "cityName": "Gadhinglaj",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "gadhinglaj"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "jaysingpur",
    "cityName": "Jaysingpur",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "jaysingpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "hupari",
    "cityName": "Hupari",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "hupari"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kurundwad",
    "cityName": "Kurundwad",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kurundwad"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "vadgaon",
    "cityName": "Vadgaon",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "vadgaon"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "murgud",
    "cityName": "Murgud",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "murgud"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "shirala",
    "cityName": "Shirala",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "shirala"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "islampur",
    "cityName": "Islampur",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "islampur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "ashta",
    "cityName": "Ashta",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "ashta"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "tasgaon",
    "cityName": "Tasgaon",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "tasgaon"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "vita",
    "cityName": "Vita",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "vita"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "palus",
    "cityName": "Palus",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "palus"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "urun-islampur",
    "cityName": "Urun Islampur",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "urun islampur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kavathe-mahankal",
    "cityName": "Kavathe Mahankal",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kavathe mahankal"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "jat",
    "cityName": "Jat",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "jat"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "khanapur",
    "cityName": "Khanapur",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "khanapur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "atpadi",
    "cityName": "Atpadi",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "atpadi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "shirwal",
    "cityName": "Shirwal",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "shirwal"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "wai",
    "cityName": "Wai",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "wai"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "panchgani",
    "cityName": "Panchgani",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "panchgani"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "mahabaleshwar",
    "cityName": "Mahabaleshwar",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "mahabaleshwar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "phaltan",
    "cityName": "Phaltan",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "phaltan"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "koregaon",
    "cityName": "Koregaon",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "koregaon"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "patan-mh",
    "cityName": "Patan (MH)",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "patan (mh)"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "rahimatpur",
    "cityName": "Rahimatpur",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "rahimatpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "dahiwadi",
    "cityName": "Dahiwadi",
    "stateName": "Maharashtra",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "dahiwadi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "anekal",
    "cityName": "Anekal",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "anekal"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "hosakote",
    "cityName": "Hosakote",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "hosakote"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "doddaballapur",
    "cityName": "Doddaballapur",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "doddaballapur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "nelamangala",
    "cityName": "Nelamangala",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "nelamangala"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "devanahalli",
    "cityName": "Devanahalli",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "devanahalli"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "yelahanka",
    "cityName": "Yelahanka",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "yelahanka"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kengeri",
    "cityName": "Kengeri",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kengeri"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bidadi",
    "cityName": "Bidadi",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bidadi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "magadi",
    "cityName": "Magadi",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "magadi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kanakapura",
    "cityName": "Kanakapura",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kanakapura"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "channapatna",
    "cityName": "Channapatna",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "channapatna"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "maddur",
    "cityName": "Maddur",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "maddur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "malavalli",
    "cityName": "Malavalli",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "malavalli"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "srirangapatna",
    "cityName": "Srirangapatna",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "srirangapatna"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "pandavapura",
    "cityName": "Pandavapura",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "pandavapura"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "krishnarajpet",
    "cityName": "Krishnarajpet",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "krishnarajpet"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "nanjangud",
    "cityName": "Nanjangud",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "nanjangud"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "hunsur",
    "cityName": "Hunsur",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "hunsur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "piriyapatna",
    "cityName": "Piriyapatna",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "piriyapatna"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "k-r-nagar",
    "cityName": "K R Nagar",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "k r nagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "t-narasipura",
    "cityName": "T Narasipura",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "t narasipura"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "gundlupet",
    "cityName": "Gundlupet",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "gundlupet"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kollegal",
    "cityName": "Kollegal",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kollegal"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "chamarajanagar",
    "cityName": "Chamarajanagar",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "chamarajanagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "yelandur",
    "cityName": "Yelandur",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "yelandur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "hanur",
    "cityName": "Hanur",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "hanur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bantwal",
    "cityName": "Bantwal",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bantwal"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "puttur",
    "cityName": "Puttur",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "puttur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sullia",
    "cityName": "Sullia",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sullia"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "belthangady",
    "cityName": "Belthangady",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "belthangady"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "moodbidri",
    "cityName": "Moodbidri",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "moodbidri"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "mulki",
    "cityName": "Mulki",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "mulki"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kundapura",
    "cityName": "Kundapura",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kundapura"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "karkala",
    "cityName": "Karkala",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "karkala"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "brahmavara",
    "cityName": "Brahmavara",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "brahmavara"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "byndoor",
    "cityName": "Byndoor",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "byndoor"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kumta",
    "cityName": "Kumta",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kumta"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "ankola",
    "cityName": "Ankola",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "ankola"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bhatkal",
    "cityName": "Bhatkal",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bhatkal"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "honavar",
    "cityName": "Honavar",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "honavar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "yellapur",
    "cityName": "Yellapur",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "yellapur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "dandeli",
    "cityName": "Dandeli",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "dandeli"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "haliyal",
    "cityName": "Haliyal",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "haliyal"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "joida",
    "cityName": "Joida",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "joida"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "mundgod",
    "cityName": "Mundgod",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "mundgod"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "siddapur",
    "cityName": "Siddapur",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "siddapur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "supa",
    "cityName": "Supa",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "supa"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "gokak",
    "cityName": "Gokak",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "gokak"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "chikkodi",
    "cityName": "Chikkodi",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "chikkodi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "athani",
    "cityName": "Athani",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "athani"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "raybag",
    "cityName": "Raybag",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "raybag"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "hukkeri",
    "cityName": "Hukkeri",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "hukkeri"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bailhongal",
    "cityName": "Bailhongal",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bailhongal"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "saundatti",
    "cityName": "Saundatti",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "saundatti"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "ramdurg",
    "cityName": "Ramdurg",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "ramdurg"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "khanapur-ka",
    "cityName": "Khanapur (KA)",
    "stateName": "Karnataka",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "khanapur (ka)"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "chengalpattu",
    "cityName": "Chengalpattu",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "chengalpattu"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "tambaram",
    "cityName": "Tambaram",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "tambaram"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "avadi",
    "cityName": "Avadi",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "avadi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "poonamallee",
    "cityName": "Poonamallee",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "poonamallee"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "tiruvallur",
    "cityName": "Tiruvallur",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "tiruvallur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "maraimalai-nagar",
    "cityName": "Maraimalai Nagar",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "maraimalai nagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "mahabalipuram",
    "cityName": "Mahabalipuram",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "mahabalipuram"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "madurantakam",
    "cityName": "Madurantakam",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "madurantakam"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "tiruttani",
    "cityName": "Tiruttani",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "tiruttani"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "gummidipoondi",
    "cityName": "Gummidipoondi",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "gummidipoondi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "ponneri",
    "cityName": "Ponneri",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "ponneri"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "uthukottai",
    "cityName": "Uthukottai",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "uthukottai"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "arakkonam",
    "cityName": "Arakkonam",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "arakkonam"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "arcot",
    "cityName": "Arcot",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "arcot"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "walajapet",
    "cityName": "Walajapet",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "walajapet"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sholinghur",
    "cityName": "Sholinghur",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sholinghur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "tirupathur",
    "cityName": "Tirupathur",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "tirupathur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "jolarpet",
    "cityName": "Jolarpet",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "jolarpet"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "natrampalli",
    "cityName": "Natrampalli",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "natrampalli"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "peranambattu",
    "cityName": "Peranambattu",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "peranambattu"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "vaniyambadi-town",
    "cityName": "Vaniyambadi Town",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "vaniyambadi town"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "alangayam",
    "cityName": "Alangayam",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "alangayam"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "polur",
    "cityName": "Polur",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "polur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "arani",
    "cityName": "Arani",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "arani"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "cheyyar",
    "cityName": "Cheyyar",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "cheyyar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "vandavasi",
    "cityName": "Vandavasi",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "vandavasi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "chengam",
    "cityName": "Chengam",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "chengam"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kalasapakkam",
    "cityName": "Kalasapakkam",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kalasapakkam"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kilpennathur",
    "cityName": "Kilpennathur",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kilpennathur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "gingee",
    "cityName": "Gingee",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "gingee"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "tindivanam",
    "cityName": "Tindivanam",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "tindivanam"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "villupuram",
    "cityName": "Villupuram",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "villupuram"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "vanur",
    "cityName": "Vanur",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "vanur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "marakkanam",
    "cityName": "Marakkanam",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "marakkanam"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kallakurichi",
    "cityName": "Kallakurichi",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kallakurichi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "ulundurpet",
    "cityName": "Ulundurpet",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "ulundurpet"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sankarapuram",
    "cityName": "Sankarapuram",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sankarapuram"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "chinnasalem",
    "cityName": "Chinnasalem",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "chinnasalem"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "tirukkoyilur",
    "cityName": "Tirukkoyilur",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "tirukkoyilur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "panruti",
    "cityName": "Panruti",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "panruti"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "vridhachalam",
    "cityName": "Vridhachalam",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "vridhachalam"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "tittakudi",
    "cityName": "Tittakudi",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "tittakudi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "chidambaram",
    "cityName": "Chidambaram",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "chidambaram"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bhuvanagiri",
    "cityName": "Bhuvanagiri",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bhuvanagiri"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kattumannarkoil",
    "cityName": "Kattumannarkoil",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kattumannarkoil"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sirkazhi",
    "cityName": "Sirkazhi",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sirkazhi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "tharangambadi",
    "cityName": "Tharangambadi",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "tharangambadi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "mayiladuthurai",
    "cityName": "Mayiladuthurai",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "mayiladuthurai"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kuthalam",
    "cityName": "Kuthalam",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kuthalam"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "vedaranyam",
    "cityName": "Vedaranyam",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "vedaranyam"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kilvelur",
    "cityName": "Kilvelur",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kilvelur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "thirukkuvalai",
    "cityName": "Thirukkuvalai",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "thirukkuvalai"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "mannargudi",
    "cityName": "Mannargudi",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "mannargudi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "thiruthuraipoondi",
    "cityName": "Thiruthuraipoondi",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "thiruthuraipoondi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "nannilam",
    "cityName": "Nannilam",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "nannilam"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "koothanallur",
    "cityName": "Koothanallur",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "koothanallur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "valangaiman",
    "cityName": "Valangaiman",
    "stateName": "Tamil Nadu",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "valangaiman"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "anakapalle",
    "cityName": "Anakapalle",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "anakapalle"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bheemunipatnam",
    "cityName": "Bheemunipatnam",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bheemunipatnam"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "narsipatnam",
    "cityName": "Narsipatnam",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "narsipatnam"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "yelamanchili",
    "cityName": "Yelamanchili",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "yelamanchili"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "chodavaram",
    "cityName": "Chodavaram",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "chodavaram"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "payakaraopeta",
    "cityName": "Payakaraopeta",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "payakaraopeta"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "tuni",
    "cityName": "Tuni",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "tuni"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "pithapuram",
    "cityName": "Pithapuram",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "pithapuram"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "samalkota",
    "cityName": "Samalkota",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "samalkota"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "peddapuram",
    "cityName": "Peddapuram",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "peddapuram"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "ramachandrapuram",
    "cityName": "Ramachandrapuram",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "ramachandrapuram"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "amalapuram",
    "cityName": "Amalapuram",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "amalapuram"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "mandapeta",
    "cityName": "Mandapeta",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "mandapeta"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "razole",
    "cityName": "Razole",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "razole"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kothapeta",
    "cityName": "Kothapeta",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kothapeta"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "palakollu",
    "cityName": "Palakollu",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "palakollu"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "tanuku",
    "cityName": "Tanuku",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "tanuku"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "nidadavole",
    "cityName": "Nidadavole",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "nidadavole"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "jangareddygudem",
    "cityName": "Jangareddygudem",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "jangareddygudem"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kovvur",
    "cityName": "Kovvur",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kovvur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "akividu",
    "cityName": "Akividu",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "akividu"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "attili",
    "cityName": "Attili",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "attili"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "penugonda",
    "cityName": "Penugonda",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "penugonda"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "nuzvid",
    "cityName": "Nuzvid",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "nuzvid"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "jaggaiahpet",
    "cityName": "Jaggaiahpet",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "jaggaiahpet"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kanchikacherla",
    "cityName": "Kanchikacherla",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kanchikacherla"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "tiruvuru",
    "cityName": "Tiruvuru",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "tiruvuru"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "vuyyuru",
    "cityName": "Vuyyuru",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "vuyyuru"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kankipadu",
    "cityName": "Kankipadu",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kankipadu"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "mangalagiri",
    "cityName": "Mangalagiri",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "mangalagiri"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sattenapalle",
    "cityName": "Sattenapalle",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sattenapalle"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "ponnur",
    "cityName": "Ponnur",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "ponnur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bapatla",
    "cityName": "Bapatla",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bapatla"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "repalle",
    "cityName": "Repalle",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "repalle"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "piduguralla",
    "cityName": "Piduguralla",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "piduguralla"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "vinukonda",
    "cityName": "Vinukonda",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "vinukonda"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "macherla",
    "cityName": "Macherla",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "macherla"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "chirala",
    "cityName": "Chirala",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "chirala"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kandukur",
    "cityName": "Kandukur",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kandukur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "markapur",
    "cityName": "Markapur",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "markapur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "giddalur",
    "cityName": "Giddalur",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "giddalur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "podili",
    "cityName": "Podili",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "podili"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kanigiri",
    "cityName": "Kanigiri",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kanigiri"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "yerragondapalem",
    "cityName": "Yerragondapalem",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "yerragondapalem"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kavali",
    "cityName": "Kavali",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kavali"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "gudur",
    "cityName": "Gudur",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "gudur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "venkatagiri",
    "cityName": "Venkatagiri",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "venkatagiri"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "atmakur",
    "cityName": "Atmakur",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "atmakur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sullurpeta",
    "cityName": "Sullurpeta",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sullurpeta"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "naidupeta",
    "cityName": "Naidupeta",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "naidupeta"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kovur-ap",
    "cityName": "Kovur (AP)",
    "stateName": "Andhra Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kovur (ap)"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "ghatkesar",
    "cityName": "Ghatkesar",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "ghatkesar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "medchal",
    "cityName": "Medchal",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "medchal"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kukatpally",
    "cityName": "Kukatpally",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kukatpally"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "quthbullapur",
    "cityName": "Quthbullapur",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "quthbullapur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "alwal",
    "cityName": "Alwal",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "alwal"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "malkajgiri",
    "cityName": "Malkajgiri",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "malkajgiri"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "uppal",
    "cityName": "Uppal",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "uppal"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kapra",
    "cityName": "Kapra",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kapra"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "hayathnagar",
    "cityName": "Hayathnagar",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "hayathnagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "lb-nagar",
    "cityName": "LB Nagar",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "lb nagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "saroornagar",
    "cityName": "Saroornagar",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "saroornagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "rajendranagar",
    "cityName": "Rajendranagar",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "rajendranagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "serilingampally",
    "cityName": "Serilingampally",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "serilingampally"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "shamshabad",
    "cityName": "Shamshabad",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "shamshabad"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "maheshwaram",
    "cityName": "Maheshwaram",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "maheshwaram"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "ibrahimpatnam",
    "cityName": "Ibrahimpatnam",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "ibrahimpatnam"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "chevella",
    "cityName": "Chevella",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "chevella"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "shadnagar",
    "cityName": "Shadnagar",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "shadnagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "farooqnagar",
    "cityName": "Farooqnagar",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "farooqnagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kothur",
    "cityName": "Kothur",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kothur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "yadagirigutta",
    "cityName": "Yadagirigutta",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "yadagirigutta"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bhongir",
    "cityName": "Bhongir",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bhongir"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "alair",
    "cityName": "Alair",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "alair"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "choutuppal",
    "cityName": "Choutuppal",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "choutuppal"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "ramannapet",
    "cityName": "Ramannapet",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "ramannapet"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "mothkur",
    "cityName": "Mothkur",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "mothkur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "gajwel",
    "cityName": "Gajwel",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "gajwel"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "dubbak",
    "cityName": "Dubbak",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "dubbak"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "husnabad",
    "cityName": "Husnabad",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "husnabad"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "cherial",
    "cityName": "Cherial",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "cherial"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "pragnapur",
    "cityName": "Pragnapur",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "pragnapur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "armoor",
    "cityName": "Armoor",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "armoor"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "banswada",
    "cityName": "Banswada",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "banswada"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "yellareddy",
    "cityName": "Yellareddy",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "yellareddy"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bhiknoor",
    "cityName": "Bhiknoor",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bhiknoor"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "metpally",
    "cityName": "Metpally",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "metpally"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "raikal",
    "cityName": "Raikal",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "raikal"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "dharmapuri-ts",
    "cityName": "Dharmapuri (TS)",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "dharmapuri (ts)"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "velgatoor",
    "cityName": "Velgatoor",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "velgatoor"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "pegadapally",
    "cityName": "Pegadapally",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "pegadapally"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "gollapally",
    "cityName": "Gollapally",
    "stateName": "Telangana",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "gollapally"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sanand",
    "cityName": "Sanand",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sanand"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bavla",
    "cityName": "Bavla",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bavla"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "dholka",
    "cityName": "Dholka",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "dholka"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "dhandhuka",
    "cityName": "Dhandhuka",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "dhandhuka"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "viramgam",
    "cityName": "Viramgam",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "viramgam"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "mandal",
    "cityName": "Mandal",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "mandal"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "detroj",
    "cityName": "Detroj",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "detroj"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "chharodi",
    "cityName": "Chharodi",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "chharodi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "changodar",
    "cityName": "Changodar",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "changodar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "aslali",
    "cityName": "Aslali",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "aslali"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bareja",
    "cityName": "Bareja",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bareja"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "dehgam",
    "cityName": "Dehgam",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "dehgam"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "mansa",
    "cityName": "Mansa",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "mansa"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kalol-gidc",
    "cityName": "Kalol GIDC",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kalol gidc"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "pethapur",
    "cityName": "Pethapur",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "pethapur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "chhatral",
    "cityName": "Chhatral",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "chhatral"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kadi",
    "cityName": "Kadi",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kadi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "becharaji",
    "cityName": "Becharaji",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "becharaji"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "unjha",
    "cityName": "Unjha",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "unjha"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "visnagar",
    "cityName": "Visnagar",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "visnagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "vadnagar",
    "cityName": "Vadnagar",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "vadnagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kheralu",
    "cityName": "Kheralu",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kheralu"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "satlasana",
    "cityName": "Satlasana",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "satlasana"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "vijapur",
    "cityName": "Vijapur",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "vijapur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sidhpur",
    "cityName": "Sidhpur",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sidhpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "chanasma",
    "cityName": "Chanasma",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "chanasma"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "harij",
    "cityName": "Harij",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "harij"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "radhanpur",
    "cityName": "Radhanpur",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "radhanpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sami",
    "cityName": "Sami",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sami"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sankheshwar",
    "cityName": "Sankheshwar",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sankheshwar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "tharad",
    "cityName": "Tharad",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "tharad"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "vav",
    "cityName": "Vav",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "vav"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "dhanera",
    "cityName": "Dhanera",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "dhanera"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "dantiwada",
    "cityName": "Dantiwada",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "dantiwada"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "amirgadh",
    "cityName": "Amirgadh",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "amirgadh"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "danta",
    "cityName": "Danta",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "danta"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "vadgam",
    "cityName": "Vadgam",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "vadgam"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "shihori",
    "cityName": "Shihori",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "shihori"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bhiloda",
    "cityName": "Bhiloda",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bhiloda"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "modasa",
    "cityName": "Modasa",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "modasa"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "meghraj",
    "cityName": "Meghraj",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "meghraj"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "malpur",
    "cityName": "Malpur",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "malpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bayad",
    "cityName": "Bayad",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bayad"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "dhansura",
    "cityName": "Dhansura",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "dhansura"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "himmatnagar",
    "cityName": "Himmatnagar",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "himmatnagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "idar",
    "cityName": "Idar",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "idar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "prantij",
    "cityName": "Prantij",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "prantij"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "talod",
    "cityName": "Talod",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "talod"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "khedbrahma",
    "cityName": "Khedbrahma",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "khedbrahma"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "vadali",
    "cityName": "Vadali",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "vadali"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "poshina",
    "cityName": "Poshina",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "poshina"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "lunawada",
    "cityName": "Lunawada",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "lunawada"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "santrampur",
    "cityName": "Santrampur",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "santrampur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kadana",
    "cityName": "Kadana",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kadana"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "virpur",
    "cityName": "Virpur",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "virpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "khanpur",
    "cityName": "Khanpur",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "khanpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "balasinor",
    "cityName": "Balasinor",
    "stateName": "Gujarat",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "balasinor"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "chaksu",
    "cityName": "Chaksu",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "chaksu"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "chomu",
    "cityName": "Chomu",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "chomu"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "phulera",
    "cityName": "Phulera",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "phulera"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sambhar",
    "cityName": "Sambhar",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sambhar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "jobner",
    "cityName": "Jobner",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "jobner"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kotputli",
    "cityName": "Kotputli",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kotputli"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "shahpura-jaipur",
    "cityName": "Shahpura (Jaipur)",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "shahpura (jaipur)"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "viratnagar",
    "cityName": "Viratnagar",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "viratnagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "jamwa-ramgarh",
    "cityName": "Jamwa Ramgarh",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "jamwa ramgarh"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bassi",
    "cityName": "Bassi",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bassi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "dudu",
    "cityName": "Dudu",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "dudu"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bagru",
    "cityName": "Bagru",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bagru"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sanganer",
    "cityName": "Sanganer",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sanganer"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "amber",
    "cityName": "Amber",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "amber"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "govindgarh",
    "cityName": "Govindgarh",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "govindgarh"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "tijara",
    "cityName": "Tijara",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "tijara"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kishangarh-bas",
    "cityName": "Kishangarh Bas",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kishangarh bas"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "behror",
    "cityName": "Behror",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "behror"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "mandawar",
    "cityName": "Mandawar",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "mandawar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kathumar",
    "cityName": "Kathumar",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kathumar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "laxmangarh-alwar",
    "cityName": "Laxmangarh (Alwar)",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "laxmangarh (alwar)"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "ramgarh-alwar",
    "cityName": "Ramgarh (Alwar)",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "ramgarh (alwar)"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "rajgarh-alwar",
    "cityName": "Rajgarh (Alwar)",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "rajgarh (alwar)"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "thanagazi",
    "cityName": "Thanagazi",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "thanagazi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bansur",
    "cityName": "Bansur",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bansur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "deeg",
    "cityName": "Deeg",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "deeg"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kaman",
    "cityName": "Kaman",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kaman"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "nagar",
    "cityName": "Nagar",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "nagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kumher",
    "cityName": "Kumher",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kumher"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "nadbai",
    "cityName": "Nadbai",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "nadbai"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "weir",
    "cityName": "Weir",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "weir"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bayana",
    "cityName": "Bayana",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bayana"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "rupbas",
    "cityName": "Rupbas",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "rupbas"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bari",
    "cityName": "Bari",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bari"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "baseri",
    "cityName": "Baseri",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "baseri"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "rajakhera",
    "cityName": "Rajakhera",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "rajakhera"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sirmathura",
    "cityName": "Sirmathura",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sirmathura"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "gangapur-city",
    "cityName": "Gangapur City",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "gangapur city"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bamanwas",
    "cityName": "Bamanwas",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bamanwas"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bonli",
    "cityName": "Bonli",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bonli"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "malarna-doongar",
    "cityName": "Malarna Doongar",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "malarna doongar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "khandar",
    "cityName": "Khandar",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "khandar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "hindaun-city",
    "cityName": "Hindaun City",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "hindaun city"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "karauli",
    "cityName": "Karauli",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "karauli"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "todabhim",
    "cityName": "Todabhim",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "todabhim"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sapotra",
    "cityName": "Sapotra",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sapotra"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "mahuwa",
    "cityName": "Mahuwa",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "mahuwa"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "dausa",
    "cityName": "Dausa",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "dausa"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bandikui",
    "cityName": "Bandikui",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bandikui"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sikrai",
    "cityName": "Sikrai",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sikrai"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "lalsot",
    "cityName": "Lalsot",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "lalsot"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "niwai",
    "cityName": "Niwai",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "niwai"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "malpura",
    "cityName": "Malpura",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "malpura"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "deoli",
    "cityName": "Deoli",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "deoli"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "uniara",
    "cityName": "Uniara",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "uniara"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "todaraisingh",
    "cityName": "Todaraisingh",
    "stateName": "Rajasthan",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "todaraisingh"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "barh",
    "cityName": "Barh",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "barh"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "mokama",
    "cityName": "Mokama",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "mokama"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bakhtiarpur",
    "cityName": "Bakhtiarpur",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bakhtiarpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "fatwah",
    "cityName": "Fatwah",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "fatwah"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "masaurhi",
    "cityName": "Masaurhi",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "masaurhi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "paliganj",
    "cityName": "Paliganj",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "paliganj"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bikram",
    "cityName": "Bikram",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bikram"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "phulwari-sharif",
    "cityName": "Phulwari Sharif",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "phulwari sharif"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "khagaul",
    "cityName": "Khagaul",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "khagaul"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "maner",
    "cityName": "Maner",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "maner"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "digha",
    "cityName": "Digha",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "digha"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bihta",
    "cityName": "Bihta",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bihta"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "hilsa",
    "cityName": "Hilsa",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "hilsa"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "islampur-bihar",
    "cityName": "Islampur (Bihar)",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "islampur (bihar)"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "rajgir",
    "cityName": "Rajgir",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "rajgir"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "silao",
    "cityName": "Silao",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "silao"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "asthawan",
    "cityName": "Asthawan",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "asthawan"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "ekangarsarai",
    "cityName": "Ekangarsarai",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "ekangarsarai"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "chandi",
    "cityName": "Chandi",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "chandi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "harnaut",
    "cityName": "Harnaut",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "harnaut"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "wena",
    "cityName": "Wena",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "wena"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "koilwar",
    "cityName": "Koilwar",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "koilwar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sandesh",
    "cityName": "Sandesh",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sandesh"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sahar",
    "cityName": "Sahar",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sahar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "tarari",
    "cityName": "Tarari",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "tarari"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "piro",
    "cityName": "Piro",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "piro"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "jagdishpur",
    "cityName": "Jagdishpur",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "jagdishpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "shahpur",
    "cityName": "Shahpur",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "shahpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "behea",
    "cityName": "Behea",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "behea"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "dumraon",
    "cityName": "Dumraon",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "dumraon"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "simri",
    "cityName": "Simri",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "simri"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "brahmpur",
    "cityName": "Brahmpur",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "brahmpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "nawanagar",
    "cityName": "Nawanagar",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "nawanagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "itarhi",
    "cityName": "Itarhi",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "itarhi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "rajpur",
    "cityName": "Rajpur",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "rajpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "nokha",
    "cityName": "Nokha",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "nokha"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "karakat",
    "cityName": "Karakat",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "karakat"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bikramganj",
    "cityName": "Bikramganj",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bikramganj"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "dawath",
    "cityName": "Dawath",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "dawath"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "surajpura",
    "cityName": "Surajpura",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "surajpura"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "dinara",
    "cityName": "Dinara",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "dinara"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "chenari",
    "cityName": "Chenari",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "chenari"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sheosagar",
    "cityName": "Sheosagar",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sheosagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kargahar",
    "cityName": "Kargahar",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kargahar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bhabua",
    "cityName": "Bhabua",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bhabua"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "mohania",
    "cityName": "Mohania",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "mohania"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kudra",
    "cityName": "Kudra",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kudra"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "ramgarh-kaimur",
    "cityName": "Ramgarh (Kaimur)",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "ramgarh (kaimur)"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "chainpur",
    "cityName": "Chainpur",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "chainpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bhagwanpur",
    "cityName": "Bhagwanpur",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bhagwanpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "tekari",
    "cityName": "Tekari",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "tekari"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sherghati",
    "cityName": "Sherghati",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sherghati"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "imamganj",
    "cityName": "Imamganj",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "imamganj"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "barachatti",
    "cityName": "Barachatti",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "barachatti"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bodh-gaya",
    "cityName": "Bodh Gaya",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bodh gaya"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "wazirganj",
    "cityName": "Wazirganj",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "wazirganj"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "atri",
    "cityName": "Atri",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "atri"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "manpur",
    "cityName": "Manpur",
    "stateName": "Bihar",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "manpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sanwer",
    "cityName": "Sanwer",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sanwer"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "depalpur",
    "cityName": "Depalpur",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "depalpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "mhow",
    "cityName": "Mhow",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "mhow"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "hatod",
    "cityName": "Hatod",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "hatod"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "rau",
    "cityName": "Rau",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "rau"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "betma",
    "cityName": "Betma",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "betma"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "manglia",
    "cityName": "Manglia",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "manglia"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kshipra",
    "cityName": "Kshipra",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kshipra"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "berasia",
    "cityName": "Berasia",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "berasia"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kolar-bhopal",
    "cityName": "Kolar (Bhopal)",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kolar (bhopal)"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bairagarh",
    "cityName": "Bairagarh",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bairagarh"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "gandhinagar-mp",
    "cityName": "Gandhinagar (MP)",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "gandhinagar (mp)"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "misrod",
    "cityName": "Misrod",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "misrod"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bagh-sewania",
    "cityName": "Bagh Sewania",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bagh sewania"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "khajuri-sadak",
    "cityName": "Khajuri Sadak",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "khajuri sadak"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sihora",
    "cityName": "Sihora",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sihora"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "patan-mp",
    "cityName": "Patan (MP)",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "patan (mp)"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "panagar",
    "cityName": "Panagar",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "panagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "shahpura-jabalpur",
    "cityName": "Shahpura (Jabalpur)",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "shahpura (jabalpur)"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "majholi",
    "cityName": "Majholi",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "majholi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kundam",
    "cityName": "Kundam",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kundam"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "barela",
    "cityName": "Barela",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "barela"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "dabra",
    "cityName": "Dabra",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "dabra"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bhitarwar",
    "cityName": "Bhitarwar",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bhitarwar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "chinour",
    "cityName": "Chinour",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "chinour"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "ghatigaon",
    "cityName": "Ghatigaon",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "ghatigaon"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "mohna",
    "cityName": "Mohna",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "mohna"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "morar",
    "cityName": "Morar",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "morar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "badnagar",
    "cityName": "Badnagar",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "badnagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "khachrod",
    "cityName": "Khachrod",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "khachrod"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "mahidpur",
    "cityName": "Mahidpur",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "mahidpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "tarana",
    "cityName": "Tarana",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "tarana"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "ghatiya",
    "cityName": "Ghatiya",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "ghatiya"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "unhel",
    "cityName": "Unhel",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "unhel"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bina",
    "cityName": "Bina",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bina"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "khurai",
    "cityName": "Khurai",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "khurai"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "banda-mp",
    "cityName": "Banda (MP)",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "banda (mp)"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "rehli",
    "cityName": "Rehli",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "rehli"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "deori",
    "cityName": "Deori",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "deori"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "garhakota",
    "cityName": "Garhakota",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "garhakota"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "malthone",
    "cityName": "Malthone",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "malthone"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "rahatgarh",
    "cityName": "Rahatgarh",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "rahatgarh"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "shahgarh",
    "cityName": "Shahgarh",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "shahgarh"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sonkatch",
    "cityName": "Sonkatch",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sonkatch"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bagli",
    "cityName": "Bagli",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bagli"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kannod",
    "cityName": "Kannod",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kannod"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "khategaon",
    "cityName": "Khategaon",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "khategaon"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "tonk-khurd",
    "cityName": "Tonk Khurd",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "tonk khurd"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "hatpipliya",
    "cityName": "Hatpipliya",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "hatpipliya"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "satna-city",
    "cityName": "Satna City",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "satna city"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "maihar",
    "cityName": "Maihar",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "maihar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "nagod",
    "cityName": "Nagod",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "nagod"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "amarpatan",
    "cityName": "Amarpatan",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "amarpatan"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "ramnagar",
    "cityName": "Ramnagar",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "ramnagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "uchehara",
    "cityName": "Uchehara",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "uchehara"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kotma",
    "cityName": "Kotma",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kotma"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "anuppur",
    "cityName": "Anuppur",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "anuppur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "jaithari",
    "cityName": "Jaithari",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "jaithari"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "chachai",
    "cityName": "Chachai",
    "stateName": "Madhya Pradesh",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "chachai"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bhatpara",
    "cityName": "Bhatpara",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bhatpara"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "panihati",
    "cityName": "Panihati",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "panihati"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kamarhati",
    "cityName": "Kamarhati",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kamarhati"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kanchrapara",
    "cityName": "Kanchrapara",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kanchrapara"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "halishahar",
    "cityName": "Halishahar",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "halishahar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "naihati",
    "cityName": "Naihati",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "naihati"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "barrackpore",
    "cityName": "Barrackpore",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "barrackpore"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "north-barrackpore",
    "cityName": "North Barrackpore",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "north barrackpore"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "titagarh",
    "cityName": "Titagarh",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "titagarh"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "khardaha",
    "cityName": "Khardaha",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "khardaha"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "dum-dum",
    "cityName": "Dum Dum",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "dum dum"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "north-dumdum",
    "cityName": "North Dumdum",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "north dumdum"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "south-dumdum",
    "cityName": "South Dumdum",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "south dumdum"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "baranagar",
    "cityName": "Baranagar",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "baranagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "new-barrackpore",
    "cityName": "New Barrackpore",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "new barrackpore"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "barasat",
    "cityName": "Barasat",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "barasat"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "madhyamgram",
    "cityName": "Madhyamgram",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "madhyamgram"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "rajarhat-gopalpur",
    "cityName": "Rajarhat-Gopalpur",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "rajarhat-gopalpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bangaon",
    "cityName": "Bangaon",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bangaon"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "gobardanga",
    "cityName": "Gobardanga",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "gobardanga"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "ashokenagar-kalyangarh",
    "cityName": "Ashokenagar Kalyangarh",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "ashokenagar kalyangarh"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "habra-town",
    "cityName": "Habra Town",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "habra town"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "deganga",
    "cityName": "Deganga",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "deganga"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "gaighata",
    "cityName": "Gaighata",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "gaighata"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "swarupnagar",
    "cityName": "Swarupnagar",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "swarupnagar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "baduria",
    "cityName": "Baduria",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "baduria"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "taki",
    "cityName": "Taki",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "taki"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "hasnabad",
    "cityName": "Hasnabad",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "hasnabad"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "minakhan",
    "cityName": "Minakhan",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "minakhan"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sandeshkhali",
    "cityName": "Sandeshkhali",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sandeshkhali"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "haroa",
    "cityName": "Haroa",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "haroa"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "canning",
    "cityName": "Canning",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "canning"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "jaynagar-majilpur",
    "cityName": "Jaynagar Majilpur",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "jaynagar majilpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "baruipur",
    "cityName": "Baruipur",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "baruipur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sonarpur",
    "cityName": "Sonarpur",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sonarpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bhangar",
    "cityName": "Bhangar",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bhangar"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "diamond-harbour",
    "cityName": "Diamond Harbour",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "diamond harbour"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kulpi",
    "cityName": "Kulpi",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kulpi"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "kakdwip",
    "cityName": "Kakdwip",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "kakdwip"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "namkhana",
    "cityName": "Namkhana",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "namkhana"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "patharpratima",
    "cityName": "Patharpratima",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "patharpratima"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "gosaba",
    "cityName": "Gosaba",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "gosaba"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "budge-budge",
    "cityName": "Budge Budge",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "budge budge"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "pujali",
    "cityName": "Pujali",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "pujali"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "maheshtala",
    "cityName": "Maheshtala",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "maheshtala"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "baly",
    "cityName": "Baly",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "baly"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "uluberia",
    "cityName": "Uluberia",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "uluberia"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "bagnan",
    "cityName": "Bagnan",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "bagnan"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "amta",
    "cityName": "Amta",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "amta"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "shyampur",
    "cityName": "Shyampur",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "shyampur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "domjur",
    "cityName": "Domjur",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "domjur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "panchla",
    "cityName": "Panchla",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "panchla"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "sankrail",
    "cityName": "Sankrail",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "sankrail"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "jagatballavpur",
    "cityName": "Jagatballavpur",
    "stateName": "West Bengal",
    "countryName": "India",
    "countryCode": "IN",
    "continent": "asia",
    "tier": 4,
    "aliases": [
      "jagatballavpur"
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "active": true,
    "seoEligible": false
  },
  {
    "slug": "dubai",
    "cityName": "Dubai",
    "countryName": "United Arab Emirates",
    "countryCode": "AE",
    "continent": "middle-east",
    "tier": 1,
    "aliases": [
      "dubai",
      "dubai marina",
      "downtown dubai",
      "difc",
      "jlt"
    ],
    "currency": "AED",
    "timezone": "Asia/Dubai",
    "latitude": 25.2048,
    "longitude": 55.2708,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "abu-dhabi",
    "cityName": "Abu Dhabi",
    "countryName": "United Arab Emirates",
    "countryCode": "AE",
    "continent": "middle-east",
    "tier": 1,
    "aliases": [
      "abu dhabi",
      "adgm",
      "al reem island"
    ],
    "currency": "AED",
    "timezone": "Asia/Dubai",
    "latitude": 24.4539,
    "longitude": 54.3773,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "sharjah",
    "cityName": "Sharjah",
    "countryName": "United Arab Emirates",
    "countryCode": "AE",
    "continent": "middle-east",
    "tier": 2,
    "aliases": [
      "sharjah"
    ],
    "currency": "AED",
    "timezone": "Asia/Dubai",
    "latitude": 25.3463,
    "longitude": 55.4209,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "riyadh",
    "cityName": "Riyadh",
    "countryName": "Saudi Arabia",
    "countryCode": "SA",
    "continent": "middle-east",
    "tier": 1,
    "aliases": [
      "riyadh",
      "kfdc"
    ],
    "currency": "SAR",
    "timezone": "Asia/Riyadh",
    "latitude": 24.7136,
    "longitude": 46.6753,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "jeddah",
    "cityName": "Jeddah",
    "countryName": "Saudi Arabia",
    "countryCode": "SA",
    "continent": "middle-east",
    "tier": 2,
    "aliases": [
      "jeddah"
    ],
    "currency": "SAR",
    "timezone": "Asia/Riyadh",
    "latitude": 21.4858,
    "longitude": 39.1925,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "doha",
    "cityName": "Doha",
    "countryName": "Qatar",
    "countryCode": "QA",
    "continent": "middle-east",
    "tier": 1,
    "aliases": [
      "doha",
      "west bay"
    ],
    "currency": "QAR",
    "timezone": "Asia/Qatar",
    "latitude": 25.2854,
    "longitude": 51.531,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "kuwait-city",
    "cityName": "Kuwait City",
    "countryName": "Kuwait",
    "countryCode": "KW",
    "continent": "middle-east",
    "tier": 2,
    "aliases": [
      "kuwait city"
    ],
    "currency": "KWD",
    "timezone": "Asia/Kuwait",
    "latitude": 29.3759,
    "longitude": 47.9774,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "manama",
    "cityName": "Manama",
    "countryName": "Bahrain",
    "countryCode": "BH",
    "continent": "middle-east",
    "tier": 2,
    "aliases": [
      "manama"
    ],
    "currency": "BHD",
    "timezone": "Asia/Bahrain",
    "latitude": 26.2285,
    "longitude": 50.586,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "muscat",
    "cityName": "Muscat",
    "countryName": "Oman",
    "countryCode": "OM",
    "continent": "middle-east",
    "tier": 2,
    "aliases": [
      "muscat"
    ],
    "currency": "OMR",
    "timezone": "Asia/Muscat",
    "latitude": 23.588,
    "longitude": 58.3829,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "london",
    "cityName": "London",
    "countryName": "United Kingdom",
    "countryCode": "GB",
    "continent": "europe",
    "tier": 1,
    "aliases": [
      "london",
      "greater london",
      "the city",
      "canary wharf",
      "shoreditch"
    ],
    "currency": "GBP",
    "timezone": "Europe/London",
    "latitude": 51.5074,
    "longitude": -0.1278,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "manchester",
    "cityName": "Manchester",
    "countryName": "United Kingdom",
    "countryCode": "GB",
    "continent": "europe",
    "tier": 2,
    "aliases": [
      "manchester",
      "greater manchester",
      "salford"
    ],
    "currency": "GBP",
    "timezone": "Europe/London",
    "latitude": 53.4808,
    "longitude": -2.2426,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "birmingham",
    "cityName": "Birmingham",
    "countryName": "United Kingdom",
    "countryCode": "GB",
    "continent": "europe",
    "tier": 2,
    "aliases": [
      "birmingham",
      "west midlands"
    ],
    "currency": "GBP",
    "timezone": "Europe/London",
    "latitude": 52.4862,
    "longitude": -1.8904,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "edinburgh",
    "cityName": "Edinburgh",
    "countryName": "United Kingdom",
    "countryCode": "GB",
    "continent": "europe",
    "tier": 2,
    "aliases": [
      "edinburgh"
    ],
    "currency": "GBP",
    "timezone": "Europe/London",
    "latitude": 55.9533,
    "longitude": -3.1883,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "cambridge",
    "cityName": "Cambridge",
    "countryName": "United Kingdom",
    "countryCode": "GB",
    "continent": "europe",
    "tier": 2,
    "aliases": [
      "cambridge",
      "silicon fen"
    ],
    "currency": "GBP",
    "timezone": "Europe/London",
    "latitude": 52.2053,
    "longitude": 0.1218,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "berlin",
    "cityName": "Berlin",
    "countryName": "Germany",
    "countryCode": "DE",
    "continent": "europe",
    "tier": 1,
    "aliases": [
      "berlin",
      "silicon allee"
    ],
    "currency": "EUR",
    "timezone": "Europe/Berlin",
    "latitude": 52.52,
    "longitude": 13.405,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "munich",
    "cityName": "Munich",
    "countryName": "Germany",
    "countryCode": "DE",
    "continent": "europe",
    "tier": 1,
    "aliases": [
      "munich",
      "munchen",
      "bavaria"
    ],
    "currency": "EUR",
    "timezone": "Europe/Berlin",
    "latitude": 48.1351,
    "longitude": 11.582,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "frankfurt",
    "cityName": "Frankfurt",
    "countryName": "Germany",
    "countryCode": "DE",
    "continent": "europe",
    "tier": 1,
    "aliases": [
      "frankfurt",
      "mainhattan"
    ],
    "currency": "EUR",
    "timezone": "Europe/Berlin",
    "latitude": 50.1109,
    "longitude": 8.6821,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "paris",
    "cityName": "Paris",
    "countryName": "France",
    "countryCode": "FR",
    "continent": "europe",
    "tier": 1,
    "aliases": [
      "paris",
      "la defense",
      "station f"
    ],
    "currency": "EUR",
    "timezone": "Europe/Paris",
    "latitude": 48.8566,
    "longitude": 2.3522,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "amsterdam",
    "cityName": "Amsterdam",
    "countryName": "Netherlands",
    "countryCode": "NL",
    "continent": "europe",
    "tier": 1,
    "aliases": [
      "amsterdam",
      "zuidas"
    ],
    "currency": "EUR",
    "timezone": "Europe/Amsterdam",
    "latitude": 52.3676,
    "longitude": 4.9041,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "dublin",
    "cityName": "Dublin",
    "countryName": "Ireland",
    "countryCode": "IE",
    "continent": "europe",
    "tier": 1,
    "aliases": [
      "dublin",
      "silicon docks"
    ],
    "currency": "EUR",
    "timezone": "Europe/Dublin",
    "latitude": 53.3498,
    "longitude": -6.2603,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "zurich",
    "cityName": "Zurich",
    "countryName": "Switzerland",
    "countryCode": "CH",
    "continent": "europe",
    "tier": 1,
    "aliases": [
      "zurich"
    ],
    "currency": "CHF",
    "timezone": "Europe/Zurich",
    "latitude": 47.3769,
    "longitude": 8.5417,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "stockholm",
    "cityName": "Stockholm",
    "countryName": "Sweden",
    "countryCode": "SE",
    "continent": "europe",
    "tier": 1,
    "aliases": [
      "stockholm",
      "kista science city"
    ],
    "currency": "SEK",
    "timezone": "Europe/Stockholm",
    "latitude": 59.3293,
    "longitude": 18.0686,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "new-york",
    "cityName": "New York",
    "countryName": "United States",
    "countryCode": "US",
    "continent": "north-america",
    "tier": 1,
    "aliases": [
      "new york",
      "nyc",
      "manhattan",
      "brooklyn",
      "silicon alley"
    ],
    "currency": "USD",
    "timezone": "America/New_York",
    "latitude": 40.7128,
    "longitude": -74.006,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "san-francisco",
    "cityName": "San Francisco",
    "countryName": "United States",
    "countryCode": "US",
    "continent": "north-america",
    "tier": 1,
    "aliases": [
      "san francisco",
      "sf",
      "bay area",
      "silicon valley",
      "soma"
    ],
    "currency": "USD",
    "timezone": "America/Los_Angeles",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "san-jose",
    "cityName": "San Jose",
    "countryName": "United States",
    "countryCode": "US",
    "continent": "north-america",
    "tier": 1,
    "aliases": [
      "san jose",
      "silicon valley"
    ],
    "currency": "USD",
    "timezone": "America/Los_Angeles",
    "latitude": 37.3382,
    "longitude": -121.8863,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "seattle",
    "cityName": "Seattle",
    "countryName": "United States",
    "countryCode": "US",
    "continent": "north-america",
    "tier": 1,
    "aliases": [
      "seattle",
      "bellevue",
      "redmond"
    ],
    "currency": "USD",
    "timezone": "America/Los_Angeles",
    "latitude": 47.6062,
    "longitude": -122.3321,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "austin",
    "cityName": "Austin",
    "countryName": "United States",
    "countryCode": "US",
    "continent": "north-america",
    "tier": 1,
    "aliases": [
      "austin",
      "silicon hills"
    ],
    "currency": "USD",
    "timezone": "America/Chicago",
    "latitude": 30.2672,
    "longitude": -97.7431,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "boston",
    "cityName": "Boston",
    "countryName": "United States",
    "countryCode": "US",
    "continent": "north-america",
    "tier": 1,
    "aliases": [
      "boston",
      "cambridge ma",
      "route 128"
    ],
    "currency": "USD",
    "timezone": "America/New_York",
    "latitude": 42.3601,
    "longitude": -71.0589,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "chicago",
    "cityName": "Chicago",
    "countryName": "United States",
    "countryCode": "US",
    "continent": "north-america",
    "tier": 1,
    "aliases": [
      "chicago",
      "fulton market"
    ],
    "currency": "USD",
    "timezone": "America/Chicago",
    "latitude": 41.8781,
    "longitude": -87.6298,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "los-angeles",
    "cityName": "Los Angeles",
    "countryName": "United States",
    "countryCode": "US",
    "continent": "north-america",
    "tier": 1,
    "aliases": [
      "los angeles",
      "la",
      "silicon beach",
      "santa monica"
    ],
    "currency": "USD",
    "timezone": "America/Los_Angeles",
    "latitude": 34.0522,
    "longitude": -118.2437,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "toronto",
    "cityName": "Toronto",
    "countryName": "Canada",
    "countryCode": "CA",
    "continent": "north-america",
    "tier": 1,
    "aliases": [
      "toronto",
      "gta",
      "waterloo corridor"
    ],
    "currency": "CAD",
    "timezone": "America/Toronto",
    "latitude": 43.6532,
    "longitude": -79.3832,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "vancouver",
    "cityName": "Vancouver",
    "countryName": "Canada",
    "countryCode": "CA",
    "continent": "north-america",
    "tier": 1,
    "aliases": [
      "vancouver",
      "silicon valley north"
    ],
    "currency": "CAD",
    "timezone": "America/Vancouver",
    "latitude": 49.2827,
    "longitude": -123.1207,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "singapore",
    "cityName": "Singapore",
    "countryName": "Singapore",
    "countryCode": "SG",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "singapore",
      "one-north",
      "cbd singapore"
    ],
    "currency": "SGD",
    "timezone": "Asia/Singapore",
    "latitude": 1.3521,
    "longitude": 103.8198,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "sydney",
    "cityName": "Sydney",
    "countryName": "Australia",
    "countryCode": "AU",
    "continent": "oceania",
    "tier": 1,
    "aliases": [
      "sydney",
      "barangaroo",
      "nsw"
    ],
    "currency": "AUD",
    "timezone": "Australia/Sydney",
    "latitude": -33.8688,
    "longitude": 151.2093,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "melbourne",
    "cityName": "Melbourne",
    "countryName": "Australia",
    "countryCode": "AU",
    "continent": "oceania",
    "tier": 1,
    "aliases": [
      "melbourne",
      "docklands"
    ],
    "currency": "AUD",
    "timezone": "Australia/Melbourne",
    "latitude": -37.8136,
    "longitude": 144.9631,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "tokyo",
    "cityName": "Tokyo",
    "countryName": "Japan",
    "countryCode": "JP",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "tokyo",
      "shibuya",
      "roppongi",
      "marunouchi"
    ],
    "currency": "JPY",
    "timezone": "Asia/Tokyo",
    "latitude": 35.6762,
    "longitude": 139.6503,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "seoul",
    "cityName": "Seoul",
    "countryName": "South Korea",
    "countryCode": "KR",
    "continent": "asia",
    "tier": 1,
    "aliases": [
      "seoul",
      "gangnam",
      "pangyo techno valley"
    ],
    "currency": "KRW",
    "timezone": "Asia/Seoul",
    "latitude": 37.5665,
    "longitude": 126.978,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "so-paulo",
    "cityName": "São Paulo",
    "countryName": "Brazil",
    "countryCode": "BR",
    "continent": "south-america",
    "tier": 1,
    "aliases": [
      "são paulo",
      "sao paulo",
      "av paulista"
    ],
    "currency": "BRL",
    "timezone": "America/Sao_Paulo",
    "latitude": -23.5505,
    "longitude": -46.6333,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "mexico-city",
    "cityName": "Mexico City",
    "countryName": "Mexico",
    "countryCode": "MX",
    "continent": "north-america",
    "tier": 1,
    "aliases": [
      "mexico city",
      "cdmx",
      "polanco"
    ],
    "currency": "MXN",
    "timezone": "America/Mexico_City",
    "latitude": 19.4326,
    "longitude": -99.1332,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "johannesburg",
    "cityName": "Johannesburg",
    "countryName": "South Africa",
    "countryCode": "ZA",
    "continent": "africa",
    "tier": 1,
    "aliases": [
      "johannesburg",
      "sandton"
    ],
    "currency": "ZAR",
    "timezone": "Africa/Johannesburg",
    "latitude": -26.2041,
    "longitude": 28.0473,
    "active": true,
    "seoEligible": true
  },
  {
    "slug": "nairobi",
    "cityName": "Nairobi",
    "countryName": "Kenya",
    "countryCode": "KE",
    "continent": "africa",
    "tier": 1,
    "aliases": [
      "nairobi",
      "silicon savannah"
    ],
    "currency": "KES",
    "timezone": "Africa/Nairobi",
    "latitude": -1.2921,
    "longitude": 36.8219,
    "active": true,
    "seoEligible": true
  }
];

export const INDIAN_LOCATIONS_COUNT = 1153;
export const TOTAL_LOCATIONS_COUNT = 1194;

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
