import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { authRoutes } from '@/navigation/authRoutes';

const Auth = () => {
  return (
    <Routes>
      {authRoutes.map((route) => (
        <Route
          key={route.to}
          path={route.to.replace('/auth', '')}
          element={route.page}
        />
      ))}
      {/* Default route for /auth - redirect to login */}
      <Route path="/*" element={authRoutes.find(r => r.to === '/auth/login')?.page} />
    </Routes>
  );
};

export default Auth;