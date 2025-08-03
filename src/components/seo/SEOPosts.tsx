import React from 'react';
import { useParams } from 'react-router-dom';
import Network from '@/pages/Network';

export const SEOPosts = () => {
  const { id } = useParams();
  return <Network />;
};