export const COMPREHENSIVE_INDUSTRIES = [
  // Technology & Software
  { id: 'technology', name: 'Technology', category: 'Tech', count: 15420 },
  { id: 'software-development', name: 'Software Development', category: 'Tech', count: 8940 },
  { id: 'artificial-intelligence', name: 'Artificial Intelligence', category: 'Tech', count: 2350 },
  { id: 'cybersecurity', name: 'Cybersecurity', category: 'Tech', count: 1890 },
  { id: 'data-science', name: 'Data Science & Analytics', category: 'Tech', count: 3210 },
  { id: 'cloud-computing', name: 'Cloud Computing', category: 'Tech', count: 2100 },
  { id: 'blockchain', name: 'Blockchain & Cryptocurrency', category: 'Tech', count: 680 },
  { id: 'gaming', name: 'Gaming & Esports', category: 'Tech', count: 920 },
  { id: 'mobile-development', name: 'Mobile App Development', category: 'Tech', count: 1560 },
  { id: 'web-development', name: 'Web Development', category: 'Tech', count: 4200 },

  // Healthcare & Medical
  { id: 'healthcare', name: 'Healthcare', category: 'Healthcare', count: 12480 },
  { id: 'pharmaceutical', name: 'Pharmaceutical', category: 'Healthcare', count: 3420 },
  { id: 'biotechnology', name: 'Biotechnology', category: 'Healthcare', count: 1890 },
  { id: 'medical-devices', name: 'Medical Devices', category: 'Healthcare', count: 2100 },
  { id: 'telemedicine', name: 'Telemedicine', category: 'Healthcare', count: 560 },
  { id: 'mental-health', name: 'Mental Health', category: 'Healthcare', count: 780 },
  { id: 'nursing', name: 'Nursing', category: 'Healthcare', count: 5200 },
  { id: 'dentistry', name: 'Dentistry', category: 'Healthcare', count: 1200 },
  { id: 'veterinary', name: 'Veterinary', category: 'Healthcare', count: 890 },

  // Finance & Banking
  { id: 'finance', name: 'Finance', category: 'Finance', count: 9840 },
  { id: 'banking', name: 'Banking', category: 'Finance', count: 6200 },
  { id: 'investment', name: 'Investment Management', category: 'Finance', count: 2340 },
  { id: 'insurance', name: 'Insurance', category: 'Finance', count: 4100 },
  { id: 'fintech', name: 'FinTech', category: 'Finance', count: 1890 },
  { id: 'accounting', name: 'Accounting', category: 'Finance', count: 3560 },
  { id: 'cryptocurrency', name: 'Cryptocurrency', category: 'Finance', count: 420 },
  { id: 'real-estate-finance', name: 'Real Estate Finance', category: 'Finance', count: 1200 },

  // Manufacturing & Engineering
  { id: 'manufacturing', name: 'Manufacturing', category: 'Manufacturing', count: 11200 },
  { id: 'automotive', name: 'Automotive', category: 'Manufacturing', count: 4580 },
  { id: 'aerospace', name: 'Aerospace & Defense', category: 'Manufacturing', count: 2890 },
  { id: 'mechanical-engineering', name: 'Mechanical Engineering', category: 'Manufacturing', count: 3420 },
  { id: 'electrical-engineering', name: 'Electrical Engineering', category: 'Manufacturing', count: 2100 },
  { id: 'civil-engineering', name: 'Civil Engineering', category: 'Manufacturing', count: 1890 },
  { id: 'chemical-engineering', name: 'Chemical Engineering', category: 'Manufacturing', count: 1560 },
  { id: 'industrial-design', name: 'Industrial Design', category: 'Manufacturing', count: 780 },
  { id: 'quality-assurance', name: 'Quality Assurance', category: 'Manufacturing', count: 1200 },

  // Education & Training
  { id: 'education', name: 'Education', category: 'Education', count: 8940 },
  { id: 'higher-education', name: 'Higher Education', category: 'Education', count: 3200 },
  { id: 'k12-education', name: 'K-12 Education', category: 'Education', count: 4200 },
  { id: 'online-learning', name: 'Online Learning', category: 'Education', count: 1200 },
  { id: 'corporate-training', name: 'Corporate Training', category: 'Education', count: 890 },
  { id: 'special-education', name: 'Special Education', category: 'Education', count: 560 },
  { id: 'language-learning', name: 'Language Learning', category: 'Education', count: 340 },

  // Retail & E-commerce
  { id: 'retail', name: 'Retail', category: 'Retail', count: 7840 },
  { id: 'ecommerce', name: 'E-commerce', category: 'Retail', count: 3420 },
  { id: 'fashion', name: 'Fashion & Apparel', category: 'Retail', count: 2100 },
  { id: 'luxury-goods', name: 'Luxury Goods', category: 'Retail', count: 890 },
  { id: 'consumer-electronics', name: 'Consumer Electronics', category: 'Retail', count: 1560 },
  { id: 'home-goods', name: 'Home & Garden', category: 'Retail', count: 1200 },
  { id: 'sporting-goods', name: 'Sporting Goods', category: 'Retail', count: 680 },

  // Media & Entertainment
  { id: 'media', name: 'Media & Entertainment', category: 'Media', count: 5620 },
  { id: 'film-television', name: 'Film & Television', category: 'Media', count: 2100 },
  { id: 'music', name: 'Music Industry', category: 'Media', count: 890 },
  { id: 'publishing', name: 'Publishing', category: 'Media', count: 1200 },
  { id: 'advertising', name: 'Advertising', category: 'Media', count: 2340 },
  { id: 'digital-marketing', name: 'Digital Marketing', category: 'Media', count: 3420 },
  { id: 'content-creation', name: 'Content Creation', category: 'Media', count: 1560 },
  { id: 'social-media', name: 'Social Media', category: 'Media', count: 2100 },

  // Transportation & Logistics
  { id: 'transportation', name: 'Transportation', category: 'Logistics', count: 6840 },
  { id: 'logistics', name: 'Logistics & Supply Chain', category: 'Logistics', count: 4200 },
  { id: 'aviation', name: 'Aviation', category: 'Logistics', count: 1890 },
  { id: 'maritime', name: 'Maritime & Shipping', category: 'Logistics', count: 1200 },
  { id: 'trucking', name: 'Trucking & Freight', category: 'Logistics', count: 2340 },
  { id: 'delivery', name: 'Delivery Services', category: 'Logistics', count: 1560 },
  { id: 'warehouse', name: 'Warehouse Operations', category: 'Logistics', count: 2100 },

  // Energy & Environment
  { id: 'energy', name: 'Energy', category: 'Energy', count: 4580 },
  { id: 'renewable-energy', name: 'Renewable Energy', category: 'Energy', count: 2100 },
  { id: 'oil-gas', name: 'Oil & Gas', category: 'Energy', count: 3420 },
  { id: 'solar', name: 'Solar Energy', category: 'Energy', count: 890 },
  { id: 'wind', name: 'Wind Energy', category: 'Energy', count: 560 },
  { id: 'environmental', name: 'Environmental Services', category: 'Energy', count: 1200 },
  { id: 'sustainability', name: 'Sustainability', category: 'Energy', count: 780 },

  // Agriculture & Food
  { id: 'agriculture', name: 'Agriculture', category: 'Agriculture', count: 3420 },
  { id: 'food-beverage', name: 'Food & Beverage', category: 'Agriculture', count: 4200 },
  { id: 'restaurants', name: 'Restaurants & Hospitality', category: 'Agriculture', count: 6840 },
  { id: 'food-tech', name: 'Food Technology', category: 'Agriculture', count: 560 },
  { id: 'organic-farming', name: 'Organic Farming', category: 'Agriculture', count: 340 },
  { id: 'aquaculture', name: 'Aquaculture', category: 'Agriculture', count: 230 },

  // Construction & Real Estate
  { id: 'construction', name: 'Construction', category: 'Construction', count: 8940 },
  { id: 'real-estate', name: 'Real Estate', category: 'Construction', count: 5620 },
  { id: 'architecture', name: 'Architecture', category: 'Construction', count: 1890 },
  { id: 'interior-design', name: 'Interior Design', category: 'Construction', count: 1200 },
  { id: 'urban-planning', name: 'Urban Planning', category: 'Construction', count: 560 },
  { id: 'property-management', name: 'Property Management', category: 'Construction', count: 2100 },

  // Legal & Government
  { id: 'legal', name: 'Legal Services', category: 'Legal', count: 4580 },
  { id: 'government', name: 'Government', category: 'Legal', count: 6200 },
  { id: 'law-enforcement', name: 'Law Enforcement', category: 'Legal', count: 2340 },
  { id: 'judiciary', name: 'Judiciary', category: 'Legal', count: 890 },
  { id: 'compliance', name: 'Compliance & Regulatory', category: 'Legal', count: 1560 },

  // Consulting & Professional Services
  { id: 'consulting', name: 'Consulting', category: 'Consulting', count: 7840 },
  { id: 'management-consulting', name: 'Management Consulting', category: 'Consulting', count: 3420 },
  { id: 'strategy', name: 'Strategy & Operations', category: 'Consulting', count: 2100 },
  { id: 'human-resources', name: 'Human Resources', category: 'Consulting', count: 4200 },
  { id: 'recruitment', name: 'Recruitment', category: 'Consulting', count: 2340 },
  { id: 'business-development', name: 'Business Development', category: 'Consulting', count: 1890 },

  // Hospitality & Travel
  { id: 'hospitality', name: 'Hospitality', category: 'Hospitality', count: 5620 },
  { id: 'hotels', name: 'Hotels & Resorts', category: 'Hospitality', count: 3420 },
  { id: 'travel', name: 'Travel & Tourism', category: 'Hospitality', count: 2890 },
  { id: 'cruise', name: 'Cruise Industry', category: 'Hospitality', count: 560 },
  { id: 'event-planning', name: 'Event Planning', category: 'Hospitality', count: 1200 },

  // Sports & Recreation
  { id: 'sports', name: 'Sports & Recreation', category: 'Sports', count: 3420 },
  { id: 'fitness', name: 'Fitness & Wellness', category: 'Sports', count: 2100 },
  { id: 'professional-sports', name: 'Professional Sports', category: 'Sports', count: 890 },
  { id: 'outdoor-recreation', name: 'Outdoor Recreation', category: 'Sports', count: 560 },

  // Non-Profit & Social Impact
  { id: 'nonprofit', name: 'Non-Profit', category: 'Non-Profit', count: 4200 },
  { id: 'social-impact', name: 'Social Impact', category: 'Non-Profit', count: 1890 },
  { id: 'charity', name: 'Charity & Philanthropy', category: 'Non-Profit', count: 1560 },
  { id: 'community-development', name: 'Community Development', category: 'Non-Profit', count: 780 },

  // Telecommunications
  { id: 'telecommunications', name: 'Telecommunications', category: 'Telecom', count: 3420 },
  { id: 'internet-services', name: 'Internet Services', category: 'Telecom', count: 2100 },
  { id: 'wireless', name: 'Wireless Technology', category: 'Telecom', count: 1560 },
  { id: 'network-infrastructure', name: 'Network Infrastructure', category: 'Telecom', count: 890 },

  // Research & Development
  { id: 'research', name: 'Research & Development', category: 'Research', count: 3420 },
  { id: 'scientific-research', name: 'Scientific Research', category: 'Research', count: 2100 },
  { id: 'clinical-research', name: 'Clinical Research', category: 'Research', count: 1560 },
  { id: 'market-research', name: 'Market Research', category: 'Research', count: 890 },

  // Emerging Industries
  { id: 'space-technology', name: 'Space Technology', category: 'Emerging', count: 420 },
  { id: 'quantum-computing', name: 'Quantum Computing', category: 'Emerging', count: 180 },
  { id: 'nanotechnology', name: 'Nanotechnology', category: 'Emerging', count: 230 },
  { id: 'virtual-reality', name: 'Virtual & Augmented Reality', category: 'Emerging', count: 680 },
  { id: 'autonomous-vehicles', name: 'Autonomous Vehicles', category: 'Emerging', count: 560 },
  { id: 'robotics', name: 'Robotics', category: 'Emerging', count: 890 },
  { id: 'drones', name: 'Drone Technology', category: 'Emerging', count: 340 },
];

export const INDUSTRY_CATEGORIES = [
  'Tech', 'Healthcare', 'Finance', 'Manufacturing', 'Education', 
  'Retail', 'Media', 'Logistics', 'Energy', 'Agriculture', 
  'Construction', 'Legal', 'Consulting', 'Hospitality', 'Sports', 
  'Non-Profit', 'Telecom', 'Research', 'Emerging'
];

export const TRENDING_INDUSTRIES = [
  'artificial-intelligence',
  'cybersecurity', 
  'renewable-energy',
  'biotechnology',
  'fintech',
  'telemedicine',
  'electric-vehicles',
  'space-technology',
  'quantum-computing',
  'blockchain'
];

export const HIGH_GROWTH_INDUSTRIES = [
  'data-science',
  'cloud-computing',
  'digital-marketing',
  'online-learning',
  'delivery-services',
  'mental-health',
  'sustainability',
  'robotics',
  'virtual-reality',
  'food-tech'
];