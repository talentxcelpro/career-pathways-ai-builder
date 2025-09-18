import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ComprehensiveSEOGenerator } from './ComprehensiveSEOGenerator';

// Dynamic SEO pages for all content types
const UserSEOPage = () => {
  const userId = window.location.pathname.split('/').pop();
  return <ComprehensiveSEOGenerator pageType="user" contentId={userId} />;
};

const JobSEOPage = () => {
  const jobId = window.location.pathname.split('/').pop();
  return <ComprehensiveSEOGenerator pageType="job" contentId={jobId} />;
};

const CompanySEOPage = () => {
  const companyId = window.location.pathname.split('/').pop();
  return <ComprehensiveSEOGenerator pageType="company" contentId={companyId} />;
};

const PostSEOPage = () => {
  const postId = window.location.pathname.split('/').pop();
  return <ComprehensiveSEOGenerator pageType="post" contentId={postId} />;
};

// Location-based SEO pages
const LocationJobsPage = () => {
  const location = window.location.pathname.split('/')[3];
  return <ComprehensiveSEOGenerator pageType="location" location={location} />;
};

const SkillJobsPage = () => {
  const skill = window.location.pathname.split('/')[3];
  return <ComprehensiveSEOGenerator pageType="skill" skill={skill} />;
};

const CategoryPage = () => {
  const category = window.location.pathname.split('/')[3];
  return <ComprehensiveSEOGenerator pageType="category" category={category} />;
};

export const MegaSEORouter = () => {
  return (
    <Routes>
      {/* User/Profile SEO Pages */}
      <Route path="/users/:userId" element={<UserSEOPage />} />
      <Route path="/profiles/:userId" element={<UserSEOPage />} />
      <Route path="/professionals/:userId" element={<UserSEOPage />} />
      <Route path="/experts/:userId" element={<UserSEOPage />} />
      
      {/* Job SEO Pages */}
      <Route path="/jobs/:jobId" element={<JobSEOPage />} />
      <Route path="/careers/:jobId" element={<JobSEOPage />} />
      <Route path="/opportunities/:jobId" element={<JobSEOPage />} />
      <Route path="/positions/:jobId" element={<JobSEOPage />} />
      
      {/* Company SEO Pages */}
      <Route path="/companies/:companyId" element={<CompanySEOPage />} />
      <Route path="/employers/:companyId" element={<CompanySEOPage />} />
      <Route path="/organizations/:companyId" element={<CompanySEOPage />} />
      
      {/* Post/Content SEO Pages */}
      <Route path="/posts/:postId" element={<PostSEOPage />} />
      <Route path="/articles/:postId" element={<PostSEOPage />} />
      <Route path="/content/:postId" element={<PostSEOPage />} />
      
      {/* Location-based SEO Pages */}
      <Route path="/jobs/in/:location" element={<LocationJobsPage />} />
      <Route path="/careers/in/:location" element={<LocationJobsPage />} />
      <Route path="/jobs/location/:location" element={<LocationJobsPage />} />
      <Route path="/companies/in/:location" element={<LocationJobsPage />} />
      
      {/* Skill-based SEO Pages */}
      <Route path="/jobs/skill/:skill" element={<SkillJobsPage />} />
      <Route path="/careers/skill/:skill" element={<SkillJobsPage />} />
      <Route path="/experts/skill/:skill" element={<SkillJobsPage />} />
      <Route path="/professionals/skill/:skill" element={<SkillJobsPage />} />
      
      {/* Category-based SEO Pages */}
      <Route path="/courses/category/:category" element={<CategoryPage />} />
      <Route path="/learning/category/:category" element={<CategoryPage />} />
      <Route path="/training/category/:category" element={<CategoryPage />} />
      <Route path="/education/category/:category" element={<CategoryPage />} />
      
      {/* Tool/Resource SEO Pages */}
      <Route path="/tools/:tool" element={<ComprehensiveSEOGenerator pageType="tool" />} />
      <Route path="/resources/:tool" element={<ComprehensiveSEOGenerator pageType="tool" />} />
      <Route path="/calculators/:tool" element={<ComprehensiveSEOGenerator pageType="tool" />} />
      <Route path="/generators/:tool" element={<ComprehensiveSEOGenerator pageType="tool" />} />
    </Routes>
  );
};