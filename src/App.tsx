import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Settings from './pages/Settings';
import Pricing from './pages/Pricing';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import About from './pages/About';
import NotFound from './pages/NotFound';
import Upgrade from './pages/Upgrade';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import AnalyticsDashboard from './pages/analytics/AnalyticsDashboard';
import ReportsDashboard from './pages/reports/ReportsDashboard';
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
import { QueryClient } from "@tanstack/react-query";

function App() {
  return (
    <QueryClient>
      <AuthProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            {/* Core Routes */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/upgrade" element={<Upgrade />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />

            {/* Analytics and Reports */}
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/reports" element={<ReportsDashboard />} />

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
            
            {/* Add more routes as needed */}
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClient>
  );
}

export default App;
