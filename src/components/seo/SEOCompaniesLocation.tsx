import React from 'react';
import { useParams } from 'react-router-dom';
import Companies from '@/pages/Companies';

export const SEOCompaniesLocation = () => {
  const { location } = useParams();
  return <Companies />;
};