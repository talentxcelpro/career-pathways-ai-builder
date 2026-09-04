import React, { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';

const Network = lazy(() => import('@/pages/Network'));

export const SEOPosts = () => {
  const { id } = useParams();
  return (
    <Suspense fallback={null}>
      <Network />
    </Suspense>
  );
};