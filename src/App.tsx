import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { authRoutes } from '@/navigation/authRoutes';
import { employerRoutes } from '@/navigation/employerRoutes';
import Jobs from './pages/Jobs';
import JobDetail from "./pages/jobs/JobDetail";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Index Route - Public */}
          <Route path="/" element={<Index />} />

          {/* Authentication Routes - Public */}
          {authRoutes.map((route) => (
            <Route key={route.to} path={route.to} element={route.page} />
          ))}

          {/* Public Job Routes - No authentication required */}
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />

          {/* Employer Routes - Protected */}
          {employerRoutes.map((route) => (
            <Route
              key={route.to}
              path={route.to}
              element={
                route.requiresAuth === false ? (
                  route.page
                ) : (
                  <ProtectedRoute>{route.page}</ProtectedRoute>
                )
              }
            />
          ))}

          {/* Default Protected Route - Requires Authentication */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Dashboard Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
