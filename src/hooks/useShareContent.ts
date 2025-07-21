
import { useState } from 'react';
import { ShareableContent } from '@/components/shared/UniversalShare';

export const useShareContent = () => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareStats, setShareStats] = useState<Record<string, number>>({});

  const trackShare = (platform: string, contentType: string, contentId: string) => {
    setShareStats(prev => ({
      ...prev,
      [platform]: (prev[platform] || 0) + 1
    }));

    // Log to console for debugging
    console.log(`Shared ${contentType} ${contentId} on ${platform}`);
  };

  const createPostShareData = (post: any): ShareableContent => ({
    id: post.id,
    type: 'post',
    title: post.content?.slice(0, 100) + (post.content?.length > 100 ? '...' : ''),
    description: `Post by ${post.profiles?.full_name || 'TalentXcel User'}`,
    author: post.profiles?.full_name,
    hashtags: post.tags || ['TalentXcel', 'Networking']
  });

  const createJobShareData = (job: any): ShareableContent => ({
    id: job.id,
    type: 'job',
    title: job.title,
    description: job.description?.slice(0, 200) + (job.description?.length > 200 ? '...' : ''),
    company: job.company_name,
    location: job.location,
    salary: job.salary_range,
    hashtags: ['Jobs', 'Career', 'Hiring', job.employment_type || 'Employment']
  });

  const createCompanyShareData = (company: any): ShareableContent => ({
    id: company.id,
    type: 'company',
    title: company.name,
    description: company.description?.slice(0, 200) + (company.description?.length > 200 ? '...' : ''),
    location: company.location,
    hashtags: ['Company', 'Career', 'Business', company.industry || 'Industry']
  });

  const createCollegeShareData = (college: any): ShareableContent => ({
    id: college.id,
    type: 'college',
    title: college.name,
    description: college.description?.slice(0, 200) + (college.description?.length > 200 ? '...' : ''),
    location: college.location,
    hashtags: ['Education', 'College', 'Career', college.type || 'Institution']
  });

  const createArticleShareData = (article: any): ShareableContent => ({
    id: article.id,
    type: 'article',
    title: article.headline,
    description: article.tagline || article.content?.slice(0, 200) + (article.content?.length > 200 ? '...' : ''),
    author: article.profiles?.full_name,
    image: article.featured_image_url,
    hashtags: ['Article', 'Career', 'Professional', article.article_category || 'Content']
  });

  const createProfileShareData = (profile: any): ShareableContent => ({
    id: profile.id,
    type: 'profile',
    title: profile.full_name || 'TalentXcel Professional',
    description: `${profile.title || 'Professional'}${profile.current_company ? ` at ${profile.current_company}` : ''}`,
    author: profile.full_name,
    location: profile.location,
    image: profile.profile_picture_url,
    hashtags: ['Professional', 'Networking', 'Career', 'TalentXcel']
  });

  return {
    isSharing,
    setIsSharing,
    shareStats,
    trackShare,
    createPostShareData,
    createJobShareData,
    createCompanyShareData,
    createCollegeShareData,
    createArticleShareData,
    createProfileShareData
  };
};
