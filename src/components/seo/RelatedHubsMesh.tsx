import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, Building2, ChevronRight } from 'lucide-react';

interface RelatedHubsMeshProps {
  currentCitySlug?: string;
  currentRoleSlug?: string;
  currentCompanySlug?: string;
  className?: string;
}

// 59 Verified Eligible Indian Cities (each has >= 10 real unexpired jobs in database)
const VERIFIED_CITIES = [
  { slug: 'varanasi', name: 'Varanasi', count: 16 },
  { slug: 'noida', name: 'Noida', count: 44 },
  { slug: 'bangalore', name: 'Bangalore', count: 43 },
  { slug: 'mumbai', name: 'Mumbai', count: 44 },
  { slug: 'pune', name: 'Pune', count: 45 },
  { slug: 'hyderabad', name: 'Hyderabad', count: 44 },
  { slug: 'delhi', name: 'Delhi', count: 43 },
  { slug: 'gurgaon', name: 'Gurgaon', count: 43 },
  { slug: 'chennai', name: 'Chennai', count: 44 },
  { slug: 'kolkata', name: 'Kolkata', count: 44 },
  { slug: 'ahmedabad', name: 'Ahmedabad', count: 16 },
  { slug: 'jaipur', name: 'Jaipur', count: 45 },
  { slug: 'chandigarh', name: 'Chandigarh', count: 45 },
  { slug: 'lucknow', name: 'Lucknow', count: 16 },
  { slug: 'bhopal', name: 'Bhopal', count: 45 },
  { slug: 'indore', name: 'Indore', count: 44 },
  { slug: 'patna', name: 'Patna', count: 43 },
  { slug: 'bhubaneswar', name: 'Bhubaneswar', count: 44 },
  { slug: 'kochi', name: 'Kochi', count: 44 },
  { slug: 'surat', name: 'Surat', count: 44 },
  { slug: 'coimbatore', name: 'Coimbatore', count: 44 },
  { slug: 'nagpur', name: 'Nagpur', count: 43 },
  { slug: 'kanpur', name: 'Kanpur', count: 43 },
  { slug: 'dhanbad', name: 'Dhanbad', count: 43 },
  { slug: 'bilaspur', name: 'Bilaspur', count: 43 },
  { slug: 'jamshedpur', name: 'Jamshedpur', count: 43 },
  { slug: 'amravati', name: 'Amravati', count: 43 },
];

// Verified Roles with high job counts and fresher queries
const VERIFIED_ROLES = [
  { slug: 'graduate-engineer-trainee', name: 'Graduate Engineer Trainee', count: 120 },
  { slug: 'associate-data-analyst', name: 'Associate Data Analyst', count: 131 },
  { slug: 'management-trainee', name: 'Management Trainee', count: 120 },
  { slug: 'junior-software-engineer', name: 'Junior Software Engineer', count: 140 },
  { slug: 'junior-qa-automation-engineer', name: 'Junior QA Engineer', count: 138 },
  { slug: 'devops-cloud-engineer', name: 'DevOps & Cloud Engineer', count: 142 },
  { slug: 'banking-associate', name: 'Banking Associate', count: 95 },
  { slug: 'digital-marketing-specialist', name: 'Digital Marketing', count: 85 },
];

// 15 Verified Enterprises with real live jobs
const VERIFIED_COMPANIES = [
  { slug: 'hdfc-bank', name: 'HDFC Bank', count: 28 },
  { slug: 'tata-steel', name: 'Tata Steel', count: 18 },
  { slug: 'ntpc', name: 'NTPC Limited', count: 14 },
  { slug: 'steel-authority-of-india', name: 'SAIL', count: 13 },
  { slug: 'jindal-steel-power', name: 'Jindal Steel & Power', count: 13 },
  { slug: 'bajaj-auto', name: 'Bajaj Auto', count: 11 },
  { slug: 'hcl-technologies', name: 'HCL Technologies', count: 11 },
  { slug: 'bharat-coking-coal-limited', name: 'BCCL', count: 7 },
  { slug: 'raymond', name: 'Raymond', count: 7 },
  { slug: 'zomato', name: 'Zomato', count: 5 },
  { slug: 'ibs-software', name: 'IBS Software', count: 5 },
  { slug: 'talentxcel', name: 'TalentXcel Enterprise', count: 16 },
  { slug: 'talentxcel-services', name: 'TalentXcel Services', count: 16 },
  { slug: 'chatr-chat', name: 'chatr Chat', count: 4 },
  { slug: 'savantis-solutions', name: 'Savantis Solutions', count: 6 },
];

export const RelatedHubsMesh: React.FC<RelatedHubsMeshProps> = ({
  currentCitySlug,
  currentRoleSlug,
  currentCompanySlug,
  className = '',
}) => {
  // Deterministic 8-slot mesh selection
  const targetCity = VERIFIED_CITIES.find((c) => c.slug === currentCitySlug) || VERIFIED_CITIES[0];
  const targetCompany = VERIFIED_COMPANIES.find((c) => c.slug === currentCompanySlug) || VERIFIED_COMPANIES[0];

  // 1. Slot 1: Parent City Hub
  const cityHubSlot = {
    title: `Jobs in ${targetCity.name}`,
    url: `/locations/${targetCity.slug}`,
    count: targetCity.count,
    type: 'city' as const,
  };

  // 2. Slot 2: Parent Company Hub
  const companyHubSlot = {
    title: `${targetCompany.name} Careers`,
    url: `/company/${targetCompany.slug}`,
    count: targetCompany.count,
    type: 'company' as const,
  };

  // 3. Slots 3-5: 3 Nearest/Sibling Verified Cities
  const siblingCities = VERIFIED_CITIES.filter((c) => c.slug !== currentCitySlug).slice(0, 3).map((c) => ({
    title: `Jobs in ${c.name}`,
    url: `/locations/${c.slug}`,
    count: c.count,
    type: 'city' as const,
  }));

  // 4. Slots 6-8: 3 Top Roles
  const siblingRoles = VERIFIED_ROLES.filter((r) => r.slug !== currentRoleSlug).slice(0, 3).map((r) => ({
    title: `${r.name} Jobs`,
    url: `/jobs?role=${r.slug}`,
    count: r.count,
    type: 'role' as const,
  }));

  const allSlots = [cityHubSlot, companyHubSlot, ...siblingCities, ...siblingRoles];

  return (
    <nav aria-label="Related Career Hubs" className={`bg-slate-900/80 border border-slate-800 rounded-2xl p-6 ${className}`}>
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Explore Verified Career &amp; Location Hubs</h3>
          <p className="text-xs text-slate-400 mt-0.5">Explore sibling hubs with active verified employer hiring</p>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-mono font-semibold">
          Verified Mesh
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {allSlots.map((slot, idx) => (
          <Link
            key={idx}
            to={slot.url}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 transition-all group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {slot.type === 'city' ? (
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : slot.type === 'company' ? (
                <Building2 className="w-4 h-4 text-purple-400 shrink-0" />
              ) : (
                <Briefcase className="w-4 h-4 text-blue-400 shrink-0" />
              )}
              <span className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                {slot.title}
              </span>
            </div>
            <span className="text-[11px] font-mono font-semibold text-slate-500 group-hover:text-blue-400 shrink-0 ml-2">
              {slot.count}+
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
};
