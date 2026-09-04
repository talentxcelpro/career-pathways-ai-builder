import React, { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';

const Companies = lazy(() => import('@/pages/Companies'));

export const SEOCompaniesLocation = () => {
  const { location } = useParams();
  return (
    <Suspense fallback={null}>
      <Companies />
    </Suspense>
  );
};