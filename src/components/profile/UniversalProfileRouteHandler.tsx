import React from "react";
import { useParams, Navigate } from "react-router-dom";
import SlugProfile from "@/pages/SlugProfile";

// Comprehensive set of reserved application routes and static assets
export const RESERVED_ROUTES = new Set([
  'app', 'api', 'admin', 'auth', 'login', 'signup', 'register', 'logout',
  'dashboard', 'profile', 'user', 'settings', 'account', 'network', 'jobs',
  'job', 'companies', 'company', 'courses', 'course', 'learning', 'services',
  'marketplace', 'tools', 'resume', 'resume-builder', 'career-map', 'passport',
  'privacy', 'terms', 'privacy-policy', 'terms-of-service', 'blog', 'news',
  'resources', 'skills', 'roles', 'locations', 'industries', 'seo-suite',
  'company-os', 'communication', 'provider', 'achievements', 'roadmap',
  'diagnostics', 'debug', 'launch', 'sitemap.xml', 'sitemap-dynamic.xml',
  'robots.txt', 'favicon.ico', 'manifest.json', 'assets', 'mobile', 'ai',
  'skills-assessment', 'career-goals', 'career-intelligence', 'instant-networking',
  'skills-verification', 'complete-intelligence', 'jobs1', 'platform', 'career-platform',
  '404', 'not-found'
]);

export const UniversalProfileRouteHandler: React.FC = () => {
  const { username } = useParams<{ username: string }>();

  if (!username) {
    return <Navigate to="/404" replace />;
  }

  // Normalize username / slug
  const cleanUsername = username.startsWith('@') ? username.slice(1).trim() : username.trim();
  const lowerClean = cleanUsername.toLowerCase();

  // Check if reserved or static asset file extension (.xml, .json, .ico, .png, etc.)
  const isReserved = RESERVED_ROUTES.has(lowerClean);
  const isStaticFile = /\.(xml|json|ico|png|jpg|jpeg|svg|css|js|txt)$/i.test(lowerClean);

  if (isReserved || isStaticFile || cleanUsername.length === 0) {
    return <Navigate to="/404" replace />;
  }

  // Render Universal Public Profile
  return <SlugProfile />;
};

export default UniversalProfileRouteHandler;
