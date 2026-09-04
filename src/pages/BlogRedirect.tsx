// src/pages/BlogRedirect.tsx
// 301 Permanent Canonical Redirect from /blog to /news
// Enforces single canonical editorial destination (/news) as specified in the marketing architecture.

import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

export const BlogRedirect = () => {
  const { slug } = useParams<{ slug?: string }>();
  
  if (slug) {
    return <Navigate to={`/news/${slug}`} replace />;
  }
  
  return <Navigate to="/news" replace />;
};

export default BlogRedirect;
