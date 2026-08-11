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
import ServicePage from "../pages/ia/ServicePage";
import EmployersIndex from "../pages/ia/EmployersIndex";
import CompanyInfo from "../pages/ia/CompanyInfo";
import { IndustriesIndex, IndustryPage } from "../pages/ia/Industries";
import { LocationsIndex, LocationPage } from "../pages/ia/Locations";
import { ResourcesIndex, ResourceHubPage } from "../pages/ia/Resources";

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
    page: <ServicePage service={service} />,
    description: service.metaDescription,
    isPublic: true,
  })),

  // Employer hub
  {
    title: "For Employers",
    to: "/employers",
    exact: true,
    icon: <Users className="h-4 w-4" />,
    page: <EmployersIndex />,
    description: "Staffing, recruitment, RPO and staff augmentation",
    isPublic: true,
  },

  // Industries
  {
    title: "Industries",
    to: "/industries",
    exact: true,
    icon: <Briefcase className="h-4 w-4" />,
    page: <IndustriesIndex />,
    description: "Jobs and hiring by industry",
    isPublic: true,
  },
  ...INDUSTRY_HUBS.map((hub) => ({
    title: `${hub.name} Jobs`,
    to: `/industries/${hub.slug}`,
    icon: <Briefcase className="h-4 w-4" />,
    page: <IndustryPage slug={hub.slug} />,
    description: hub.metaDescription,
    isPublic: true,
  })),

  // Locations
  {
    title: "Locations",
    to: "/locations",
    exact: true,
    icon: <MapPin className="h-4 w-4" />,
    page: <LocationsIndex />,
    description: "Jobs by city across India",
    isPublic: true,
  },
  ...LOCATION_HUBS.map((hub) => ({
    title: `Jobs in ${hub.name}`,
    to: `/locations/${hub.slug}`,
    icon: <MapPin className="h-4 w-4" />,
    page: <LocationPage slug={hub.slug} />,
    description: `Live openings in ${hub.name}`,
    isPublic: true,
  })),

  // Resources
  {
    title: "Resources",
    to: "/resources",
    exact: true,
    icon: <GraduationCap className="h-4 w-4" />,
    page: <ResourcesIndex />,
    description: "Career, resume, interview and hiring guides",
    isPublic: true,
  },
  ...RESOURCE_HUBS.map((hub) => ({
    title: hub.name,
    to: `/resources/${hub.slug}`,
    icon: <FileText className="h-4 w-4" />,
    page: <ResourceHubPage slug={hub.slug} />,
    description: hub.metaDescription,
    isPublic: true,
  })),

  // Company
  {
    title: "Company",
    to: "/company-info",
    icon: <Compass className="h-4 w-4" />,
    page: <CompanyInfo />,
    description: "About TalentXcel",
    isPublic: true,
  },
];

export const employerServiceSlugs = EMPLOYER_SERVICES.map((s) => s.slug);
