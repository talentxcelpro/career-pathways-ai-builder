import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const RealisticJobGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobCount, setJobCount] = useState(10);
  const [lastGenerated, setLastGenerated] = useState<any[]>([]);

  const generateJobs = async () => {
    setIsGenerating(true);
    
    try {
      console.log('🚀 Starting job generation...');
      
      // Try edge function first
      const { data, error } = await supabase.functions.invoke('generate-realistic-jobs', {
        body: { count: jobCount }
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        
        // Fallback: Insert jobs directly to database
        console.log('🔄 Using fallback method...');
        const fallbackJobs = generateFallbackJobs(jobCount);
        
        const { data: insertedJobs, error: insertError } = await supabase
          .from('jobs')
          .insert(fallbackJobs)
          .select('id, title, company_name');

        if (insertError) {
          throw new Error(insertError.message || 'Failed to insert jobs');
        }

        setLastGenerated(insertedJobs || []);
        toast.success(`✅ Successfully generated ${insertedJobs?.length || jobCount} realistic jobs!`);
        console.log('✅ Jobs generated via fallback:', insertedJobs);
        return;
      }

      if (data?.success) {
        setLastGenerated(data.jobs || []);
        toast.success(`✅ Successfully generated ${data.jobs?.length || jobCount} realistic jobs!`);
        console.log('✅ Jobs generated successfully:', data);
      } else {
        throw new Error(data?.error || 'Unknown error occurred');
      }
      
    } catch (error: any) {
      console.error('❌ Job generation failed:', error);
      toast.error(`Failed to generate jobs: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Plus className="h-5 w-5" />
          Generate Realistic Jobs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="jobCount" className="text-sm font-medium">
            Number of jobs to generate
          </Label>
          <Input
            id="jobCount"
            type="number"
            min="1"
            max="50"
            value={jobCount}
            onChange={(e) => setJobCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
            className="w-full"
          />
        </div>
        
        <Button 
          onClick={generateJobs} 
          disabled={isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Generate {jobCount} Jobs
            </>
          )}
        </Button>

        {lastGenerated.length > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Last Generation Successful
              </span>
            </div>
            <p className="text-xs text-green-700">
              Generated {lastGenerated.length} jobs including roles at companies like{' '}
              {lastGenerated.slice(0, 3).map(job => job.company_name).join(', ')}
              {lastGenerated.length > 3 && ' and more...'}
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Creates jobs across 150+ industries</p>
          <p>• 9 experience levels from fresher to executive</p>
          <p>• Realistic salary ranges by experience</p>
          <p>• 40+ Indian cities + remote options</p>
          <p>• SEO-optimized slugs and descriptions</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Fallback job generation when edge function is not available
const generateFallbackJobs = (count: number) => {
  const companies = [
    { name: "Tata Consultancy Services" },
    { name: "Infosys" },
    { name: "Wipro" },
    { name: "HCL Technologies" },
    { name: "Tech Mahindra" },
    { name: "Microsoft India" },
    { name: "Google India" },
    { name: "IBM India" },
    { name: "Accenture" },
    { name: "Cognizant" },
    { name: "Amazon India" },
    { name: "Flipkart" },
    { name: "Paytm" },
    { name: "Zomato" },
    { name: "Swiggy" },
    { name: "BYJU'S" },
    { name: "Ola" },
    { name: "Uber India" },
    { name: "Myntra" },
    { name: "BigBasket" }
  ];

  const industries = [
    "Technology", "Information Technology", "Software Development", "Cybersecurity", "Data Science",
    "Artificial Intelligence", "Machine Learning", "Cloud Computing", "DevOps", "Blockchain",
    "Mobile App Development", "Web Development", "Game Development", "AR/VR", "IoT",
    
    "Banking", "Financial Services", "Investment Banking", "Insurance", "Fintech",
    "Cryptocurrency", "Asset Management", "Private Equity", "Venture Capital", "Accounting",
    
    "Healthcare", "Pharmaceuticals", "Biotechnology", "Medical Devices", "Telemedicine",
    "Mental Health", "Dental Care", "Veterinary", "Medical Research", "Clinical Trials",
    
    "Education", "EdTech", "Online Learning", "K-12 Education", "Higher Education",
    "Vocational Training", "Corporate Training", "Educational Publishing", "Language Learning", "STEM Education",
    
    "Manufacturing", "Automotive", "Aerospace", "Defense", "Electronics",
    "Semiconductors", "Chemical Industry", "Steel Industry", "Textiles", "Food Processing",
    
    "Retail", "E-commerce", "Fashion", "Consumer Goods", "Luxury Goods",
    "Grocery Retail", "Electronics Retail", "Furniture", "Home Improvement", "Sporting Goods",
    
    "Media & Entertainment", "Film & Television", "Music Industry", "Publishing", "Digital Media",
    "Gaming", "Social Media", "Advertising", "Public Relations", "Content Creation",
    
    "Transportation", "Logistics", "Supply Chain", "Aviation", "Railways",
    "Shipping", "Trucking", "Ride Sharing", "Delivery Services", "Warehousing",
    
    "Energy", "Oil & Gas", "Renewable Energy", "Solar Energy", "Wind Energy",
    "Nuclear Energy", "Utilities", "Mining", "Coal Industry", "Natural Gas",
    
    "Real Estate", "Construction", "Architecture", "Interior Design", "Property Management",
    "Commercial Real Estate", "Residential Real Estate", "Real Estate Investment", "Urban Planning", "Infrastructure",
    
    "Agriculture", "Food & Beverage", "Organic Farming", "Agricultural Technology", "Livestock",
    "Dairy Industry", "Fisheries", "Forestry", "Horticulture", "Agricultural Equipment",
    
    "Telecommunications", "Internet Services", "Mobile Networks", "Satellite Communications", "Network Infrastructure",
    "Broadband Services", "Cable TV", "VoIP Services", "Data Centers", "IT Infrastructure",
    
    "Hospitality", "Tourism", "Hotels", "Restaurants", "Event Management",
    "Travel Agencies", "Airlines", "Cruise Lines", "Theme Parks", "Catering",
    
    "Government", "Public Sector", "Defense Contracting", "Municipal Services", "Public Policy",
    "Diplomatic Services", "Law Enforcement", "Emergency Services", "Postal Services", "Public Transport",
    
    "Legal Services", "Law Firms", "Corporate Law", "Intellectual Property", "Litigation",
    "Legal Tech", "Compliance", "Regulatory Affairs", "Patent Law", "Immigration Law",
    
    "Human Resources", "Talent Acquisition", "Employee Benefits", "Payroll Services", "HR Technology",
    "Organizational Development", "Performance Management", "Diversity & Inclusion", "Workplace Safety", "Labor Relations",
    
    "Consulting", "Management Consulting", "Strategy Consulting", "Technology Consulting", "Financial Consulting",
    "HR Consulting", "Marketing Consulting", "Operations Consulting", "Risk Consulting", "Sustainability Consulting",
    
    "Research & Development", "Scientific Research", "Market Research", "Product Development", "Innovation Labs",
    "Think Tanks", "Academic Research", "Industrial Research", "Clinical Research", "Social Research",
    
    "Non-Profit", "Charity", "Social Services", "Environmental Organizations", "Educational Non-Profits",
    "Healthcare Non-Profits", "Religious Organizations", "Community Development", "International Aid", "Advocacy Groups",
    
    "Sports & Recreation", "Professional Sports", "Fitness Industry", "Sports Equipment", "Outdoor Recreation",
    "Entertainment Venues", "Sports Marketing", "Athletic Training", "Sports Medicine", "Youth Sports",
    
    "Beauty & Wellness", "Cosmetics", "Skincare", "Wellness Centers", "Spa Services",
    "Personal Care", "Health Supplements", "Beauty Tech", "Wellness Apps", "Mental Wellness",
    
    "Pet Care", "Veterinary Services", "Pet Food", "Pet Accessories", "Pet Training",
    "Pet Insurance", "Animal Shelters", "Pet Grooming", "Pet Tech", "Animal Therapy"
  ];
  
  const jobTitles = [
    // Technology Roles
    "Software Engineer", "Senior Software Engineer", "Lead Software Engineer", "Principal Software Engineer",
    "Full Stack Developer", "Frontend Developer", "Backend Developer", "Mobile App Developer",
    "Data Scientist", "Data Analyst", "Data Engineer", "Machine Learning Engineer", "AI Researcher",
    "DevOps Engineer", "Cloud Architect", "Cybersecurity Analyst", "Product Manager", "Technical Product Manager",
    "UI/UX Designer", "Product Designer", "System Administrator", "Database Administrator", "Network Engineer",
    "QA Engineer", "Test Automation Engineer", "Business Analyst", "Technical Writer", "Scrum Master",
    
    // Management Roles
    "Engineering Manager", "Director of Engineering", "VP of Engineering", "CTO", "VP of Product",
    "Head of Design", "Head of Data", "Head of Security", "Head of Operations", "General Manager",
    "Program Manager", "Project Manager", "Operations Manager", "Team Lead", "Department Head",
    
    // Sales & Marketing
    "Sales Representative", "Senior Sales Executive", "Sales Manager", "Business Development Manager",
    "Account Manager", "Customer Success Manager", "Marketing Manager", "Digital Marketing Specialist",
    "Content Marketing Manager", "SEO Specialist", "Social Media Manager", "Brand Manager",
    "Sales Director", "VP of Sales", "Chief Marketing Officer", "Growth Manager", "Demand Generation Manager",
    
    // Finance & Accounting
    "Financial Analyst", "Senior Financial Analyst", "Accountant", "Senior Accountant", "Controller",
    "Finance Manager", "CFO", "Investment Analyst", "Risk Analyst", "Audit Manager",
    "Budget Analyst", "Tax Specialist", "Accounts Payable Manager", "Treasury Analyst", "Corporate Finance Manager",
    
    // Human Resources
    "HR Generalist", "HR Manager", "Talent Acquisition Specialist", "Recruiter", "HR Business Partner",
    "Compensation Analyst", "Training & Development Manager", "HRBP", "Chief People Officer",
    "Employee Relations Manager", "Benefits Administrator", "Payroll Manager", "HR Director", "Diversity Manager",
    
    // Healthcare
    "Healthcare Software Engineer", "Medical Device Engineer", "Clinical Data Analyst", "Healthcare Product Manager",
    "Biomedical Engineer", "Research Scientist", "Clinical Research Coordinator", "Medical Writer",
    "Health Informatics Specialist", "Telemedicine Coordinator", "Healthcare Quality Analyst", "Medical Coder",
    
    // Finance Industry
    "Quantitative Analyst", "Investment Banking Analyst", "Portfolio Manager", "Risk Manager",
    "Credit Analyst", "Compliance Officer", "Financial Advisor", "Insurance Underwriter",
    "Wealth Management Advisor", "Financial Planner", "Loan Officer", "Banking Relationship Manager",
    
    // Education
    "Educational Technology Specialist", "Curriculum Developer", "Instructional Designer", "Online Learning Manager",
    "Education Program Manager", "Academic Technology Manager", "Student Success Manager",
    "Learning & Development Specialist", "Training Coordinator", "Corporate Trainer", "E-Learning Developer",
    
    // Operations & Supply Chain
    "Operations Analyst", "Supply Chain Manager", "Logistics Coordinator", "Procurement Manager",
    "Warehouse Manager", "Inventory Analyst", "Process Improvement Manager", "Quality Assurance Manager",
    
    // Customer Service
    "Customer Service Representative", "Customer Success Manager", "Support Engineer", "Technical Support Specialist",
    "Customer Experience Manager", "Call Center Manager", "Help Desk Technician", "Client Relations Manager"
  ];
  
  const locations = [
    "Bangalore, Karnataka", "Mumbai, Maharashtra", "Pune, Maharashtra", "Hyderabad, Telangana",
    "Chennai, Tamil Nadu", "Delhi, NCR", "Gurgaon, Haryana", "Noida, Uttar Pradesh",
    "Kolkata, West Bengal", "Ahmedabad, Gujarat", "Surat, Gujarat", "Jaipur, Rajasthan",
    "Kochi, Kerala", "Thiruvananthapuram, Kerala", "Bhubaneswar, Odisha", "Chandigarh, Punjab",
    "Indore, Madhya Pradesh", "Nashik, Maharashtra", "Vadodara, Gujarat", "Coimbatore, Tamil Nadu",
    "Mysore, Karnataka", "Mangalore, Karnataka", "Vizag, Andhra Pradesh", "Lucknow, Uttar Pradesh",
    "Patna, Bihar", "Bhopal, Madhya Pradesh", "Nagpur, Maharashtra", "Aurangabad, Maharashtra",
    "Rajkot, Gujarat", "Madurai, Tamil Nadu", "Kanpur, Uttar Pradesh", "Agra, Uttar Pradesh",
    "Varanasi, Uttar Pradesh", "Meerut, Uttar Pradesh", "Faridabad, Haryana", "Ghaziabad, Uttar Pradesh",
    "Ludhiana, Punjab", "Amritsar, Punjab", "Jalandhar, Punjab", "Dehradun, Uttarakhand",
    "Remote", "Work from Home", "Hybrid - Bangalore", "Hybrid - Mumbai", "Hybrid - Delhi"
  ];

  const experienceLevels = [
    "fresher", "entry-level", "junior", "mid-level", "senior-level", "lead", "principal", "director", "executive"
  ];

  const employmentTypes = [
    "Full-time", "Part-time", "Contract", "Freelance", "Internship", "Temporary", "Permanent"
  ];
  
  const skills = [
    ["JavaScript", "React", "Node.js", "TypeScript"],
    ["Python", "Django", "Flask", "PostgreSQL", "AWS"],
    ["Java", "Spring Boot", "Microservices", "MySQL", "Docker"],
    ["React Native", "Flutter", "Mobile Development", "iOS", "Android"],
    ["Machine Learning", "Python", "TensorFlow", "Data Analysis", "Pandas"],
    ["DevOps", "AWS", "Docker", "Kubernetes", "Jenkins"],
    ["Angular", "TypeScript", "MongoDB", "Express.js"],
    ["Vue.js", "Nuxt.js", "Firebase", "GraphQL"],
    ["C#", ".NET", "Azure", "SQL Server"],
    ["PHP", "Laravel", "MySQL", "jQuery"],
    ["Ruby", "Rails", "PostgreSQL", "Redis"],
    ["Go", "Gin", "gRPC", "Microservices"],
    ["Scala", "Spark", "Kafka", "Big Data"],
    ["Data Science", "R", "Statistics", "Tableau"],
    ["Salesforce", "CRM", "Apex", "Lightning"],
    ["SAP", "ERP", "ABAP", "Functional"],
    ["Blockchain", "Solidity", "Web3", "Ethereum"],
    ["Unity", "C#", "Game Development", "3D Modeling"],
    ["Figma", "Adobe XD", "UI/UX", "Design Systems"],
    ["Digital Marketing", "SEO", "Google Analytics", "Social Media"],
    ["Project Management", "Agile", "Scrum", "Kanban"],
    ["Business Analysis", "Requirements Gathering", "Process Improvement"],
    ["Financial Modeling", "Excel", "Financial Analysis", "Budgeting"],
    ["Content Writing", "Copywriting", "Content Strategy", "Blog Writing"],
    ["Customer Success", "Account Management", "Relationship Building", "CRM"]
  ];

  const jobs = [];
  
  for (let i = 0; i < count; i++) {
    const company = companies[Math.floor(Math.random() * companies.length)];
    const industry = industries[Math.floor(Math.random() * industries.length)];
    const title = jobTitles[Math.floor(Math.random() * jobTitles.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const experienceLevel = experienceLevels[Math.floor(Math.random() * experienceLevels.length)];
    const employmentType = employmentTypes[Math.floor(Math.random() * employmentTypes.length)];
    const skillSet = skills[Math.floor(Math.random() * skills.length)];
    
    // Generate realistic salaries based on experience level
    let baseMinSalary, baseMaxSalary;
    switch (experienceLevel) {
      case 'fresher':
      case 'entry-level':
        baseMinSalary = 200000 + Math.random() * 300000; // 2-5 LPA
        baseMaxSalary = baseMinSalary + 200000 + Math.random() * 300000;
        break;
      case 'junior':
        baseMinSalary = 400000 + Math.random() * 400000; // 4-8 LPA
        baseMaxSalary = baseMinSalary + 300000 + Math.random() * 500000;
        break;
      case 'mid-level':
        baseMinSalary = 600000 + Math.random() * 600000; // 6-12 LPA
        baseMaxSalary = baseMinSalary + 400000 + Math.random() * 800000;
        break;
      case 'senior-level':
        baseMinSalary = 1000000 + Math.random() * 800000; // 10-18 LPA
        baseMaxSalary = baseMinSalary + 600000 + Math.random() * 1200000;
        break;
      case 'lead':
        baseMinSalary = 1500000 + Math.random() * 1000000; // 15-25 LPA
        baseMaxSalary = baseMinSalary + 800000 + Math.random() * 1500000;
        break;
      case 'principal':
        baseMinSalary = 2000000 + Math.random() * 1500000; // 20-35 LPA
        baseMaxSalary = baseMinSalary + 1000000 + Math.random() * 2000000;
        break;
      case 'director':
        baseMinSalary = 3000000 + Math.random() * 2000000; // 30-50 LPA
        baseMaxSalary = baseMinSalary + 1500000 + Math.random() * 2500000;
        break;
      case 'executive':
        baseMinSalary = 4000000 + Math.random() * 3000000; // 40-70 LPA
        baseMaxSalary = baseMinSalary + 2000000 + Math.random() * 3000000;
        break;
      default:
        baseMinSalary = 500000 + Math.random() * 500000;
        baseMaxSalary = baseMinSalary + 300000 + Math.random() * 700000;
    }
    
    const salary_min = Math.round(baseMinSalary);
    const salary_max = Math.round(baseMaxSalary);

    const currentDate = new Date();
    const posted_at = new Date(currentDate.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    const expires_at = new Date(currentDate.getTime() + (30 + Math.random() * 60) * 24 * 60 * 60 * 1000);

    jobs.push({
      title,
      description: `Join ${company.name} as a ${title} in our ${industry} division. We are looking for a talented professional to work on exciting projects using modern technologies and contribute to innovative solutions. This role offers excellent growth opportunities and the chance to work with cutting-edge technology in the ${industry} sector.`,
      company_name: company.name,
      location,
      salary_min,
      salary_max,
      salary_range: `₹${(salary_min/100000).toFixed(0)}-${(salary_max/100000).toFixed(0)} LPA`,
      employment_type: employmentType,
      experience_level: experienceLevel,
      skills_required: skillSet,
      is_remote: location.includes('Remote') || location.includes('Work from Home') || Math.random() > 0.8,
      is_featured: Math.random() > 0.9,
      job_status: 'open',
      is_active: true,
      posted_at: posted_at.toISOString(),
      expires_at: expires_at.toISOString(),
      seo_slug: `${title.toLowerCase().replace(/\s+/g, '-')}-${company.name.toLowerCase().replace(/\s+/g, '-')}-${location.toLowerCase().replace(/[,\s]+/g, '-')}`.substring(0, 100),
      views_count: Math.floor(Math.random() * 500),
      applications_count: Math.floor(Math.random() * 50),
      industry: industry,
      department: "engineering",
      job_type: 'internal',
      external_url: null,
      posted_by: null
    });
  }
  
  return jobs;
};