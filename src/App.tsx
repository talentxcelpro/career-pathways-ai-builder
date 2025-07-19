import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from './contexts/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Network from './pages/Network';
import ResumeBuilder from './pages/ResumeBuilder';
import CreateResume from './pages/resume/CreateResume';
import UploadResume from './pages/resume/UploadResume';
import EditResumePage from './pages/resume/EditResume';
import ExportResume from './pages/resume/ExportResume';
import CoverLetterGenerator from './pages/resume/CoverLetterGenerator';
import EditCoverLetter from './pages/resume/EditCoverLetter';
import ResumeSettings from './pages/resume/ResumeSettings';
import ResumeDashboard from './pages/resume/ResumeDashboard';
import ResumeChecker from './pages/tools/ResumeChecker';
import EnhancedUploadResume from './pages/resume/EnhancedUploadResume';
import EditResume from './pages/resume/EditResume';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppLayout>
            <Toaster />
            <Routes>
              {/* Core Routes */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/network" element={<Network />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />

              {/* Resume Builder Routes */}
              <Route path="/resume-builder" element={<ResumeBuilder />} />
              <Route path="/resume-builder/new" element={<CreateResume />} />
              <Route path="/resume-builder/upload" element={<UploadResume />} />
              <Route path="/resume-builder/edit/:id" element={<EditResumePage />} />
              <Route path="/resume-builder/export/:id" element={<ExportResume />} />
              <Route path="/resume-builder/cover-letter" element={<CoverLetterGenerator />} />
              <Route path="/resume-builder/cover-letter/edit/:id" element={<EditCoverLetter />} />
              <Route path="/resume-builder/settings" element={<ResumeSettings />} />
              <Route path="/resume-builder/dashboard" element={<ResumeDashboard />} />
              <Route path="/resume-builder/checker" element={<ResumeChecker />} />
              
              {/* Enhanced Resume Builder Routes */}
              <Route path="/resume-builder/enhanced/upload" element={<EnhancedUploadResume />} />
              <Route path="/resume-builder/enhanced/edit/:id" element={<EditResume />} />
            </Routes>
          </AppLayout>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
