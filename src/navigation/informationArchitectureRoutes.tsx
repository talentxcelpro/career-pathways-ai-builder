import React from "react";
import { Briefcase, Building2, Compass, FileText, GraduationCap, MapPin, Sparkles, Users } from "lucide-react";
import type { NavItem } from "../types/nav-item";
import {
  ALL_SERVICES,
  CANDIDATE_SERVICES,
  EMPLOYER_SERVICES,
  INDUSTRY_HUBS,
  LOCATION_HUBS,
  RESOURCE_HUBS,
} from "../config/publicIA";
const ServicePage = React.lazy(() => import("../pages/ia/ServicePage"));
const EmployersIndex = React.lazy(() => import("../pages/ia/EmployersIndex"));
const CompanyInfo = React.lazy(() => import("../pages/ia/CompanyInfo"));
const IndustriesIndex = React.lazy(() => import("../pages/ia/Industries").then(m => ({ default: m.IndustriesIndex })));
const IndustryPage = React.lazy(() => import("../pages/ia/Industries").then(m => ({ default: m.IndustryPage })));
const LocationsIndex = React.lazy(() => import("../pages/ia/Locations").then(m => ({ default: m.LocationsIndex })));
const LocationPage = React.lazy(() => import("../pages/ia/Locations").then(m => ({ default: m.LocationPage })));
const ResourcesIndex = React.lazy(() => import("../pages/ia/Resources").then(m => ({ default: m.ResourcesIndex })));
const ResourceHubPage = React.lazy(() => import("../pages/ia/Resources").then(m => ({ default: m.ResourceHubPage })));

const S = ({ children }: { children: React.ReactNode }) => (
  <React.Suspense fallback={null}>{children}</React.Suspense>
);

const iconFor = (slug: string) => {
  if (CANDIDATE_SERVICES.some((s) => s.slug === slug)) return <Sparkles className="h-4 w-4" />;
  return <Building2 className="h-4 w-4" />;
};

/**
 * Public information architecture routes (the SEO surface of talentxcel.in).
 *
 * Child hub pages are registered as explicit static paths — not `:slug`
 * params — so they never collide with the pre-existing dynamic routes
 * (/employers/:name, /resources/:tool).
 */
export const informationArchitectureRoutes: NavItem[] = [
  // Candidate + employer service pages
  ...ALL_SERVICES.map((service) => ({
    title: service.title,
    to: `/${service.slug}`,
    icon: iconFor(service.slug),
    page: <S><ServicePage service={service} /></S>,
    description: service.metaDescription,
    isPublic: true,
  })),

  // Employer hub
  {
    title: "For Employers",
    to: "/employers",
    exact: true,
    icon: <Users className="h-4 w-4" />,
    page: <S><EmployersIndex /></S>,
    description: "Staffing, recruitment, RPO and staff augmentation",
    isPublic: true,
  },

  // Industries
  {
    title: "Industries",
    to: "/industries",
    exact: true,
    icon: <Briefcase className="h-4 w-4" />,
    page: <S><IndustriesIndex /></S>,
    description: "Jobs and hiring by industry",
    isPublic: true,
  },
  ...INDUSTRY_HUBS.map((hub) => ({
    title: `${hub.name} Jobs`,
    to: `/industries/${hub.slug}`,
    icon: <Briefcase className="h-4 w-4" />,
    page: <S><IndustryPage slug={hub.slug} /></S>,
    description: hub.metaDescription,
    isPublic: true,
  })),

  // Locations
  {
    title: "Locations",
    to: "/locations",
    exact: true,
    icon: <MapPin className="h-4 w-4" />,
    page: <S><LocationsIndex /></S>,
    description: "Jobs by city across India",
    isPublic: true,
  },
  ...LOCATION_HUBS.map((hub) => ({
    title: `Jobs in ${hub.name}`,
    to: `/locations/${hub.slug}`,
    icon: <MapPin className="h-4 w-4" />,
    page: <S><LocationPage slug={hub.slug} /></S>,
    description: `Live openings in ${hub.name}`,
    isPublic: true,
  })),

  // Resources
  {
    title: "Resources",
    to: "/resources",
    exact: true,
    icon: <GraduationCap className="h-4 w-4" />,
    page: <S><ResourcesIndex /></S>,
    description: "Career, resume, interview and hiring guides",
    isPublic: true,
  },
  ...RESOURCE_HUBS.map((hub) => ({
    title: hub.name,
    to: `/resources/${hub.slug}`,
    icon: <FileText className="h-4 w-4" />,
    page: <S><ResourceHubPage slug={hub.slug} /></S>,
    description: hub.metaDescription,
    isPublic: true,
  })),

  // Company
  {
    title: "Company",
    to: "/company-info",
    icon: <Compass className="h-4 w-4" />,
    page: <S><CompanyInfo /></S>,
    description: "About TalentXcel",
    isPublic: true,
  },
];

export const employerServiceSlugs = EMPLOYER_SERVICES.map((s) => s.slug);
