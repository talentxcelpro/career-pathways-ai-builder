import React from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { navItems } from "./nav-items";
import ResumeChecker from "./pages/tools/ResumeChecker";
import ResumeCheck from "./pages/tools/ResumeCheck";
import ResumeDashboard from "./pages/resume/ResumeDashboard";
import CreateResume from "./pages/resume/CreateResume";
import UploadResume from "./pages/resume/UploadResume";
import { StreamlinedResumeBuilder } from "./components/resume/StreamlinedResumeBuilder";
import ExportResume from "./pages/resume/ExportResume";
import CoverLetterGenerator from "./pages/resume/CoverLetterGenerator";
import EditCoverLetter from "./pages/resume/EditCoverLetter";
import ResumeSettings from "./pages/resume/ResumeSettings";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
            {/* Resume Builder Routes */}
            <Route path="/resume-builder" element={<ResumeDashboard />} />
            <Route path="/resume-builder/new" element={<CreateResume />} />
            <Route path="/resume-builder/upload" element={<UploadResume />} />
            <Route path="/resume-builder/checker" element={<ResumeChecker />} />
            <Route path="/resume-builder/edit/:id" element={<StreamlinedResumeBuilder />} />
            <Route path="/resume/edit/:id" element={<StreamlinedResumeBuilder />} />
            <Route path="/resume-builder/export/:id" element={<ExportResume />} />
            <Route path="/resume-builder/cover-letter" element={<CoverLetterGenerator />} />
            <Route path="/resume-builder/cover-letter/edit/:id" element={<EditCoverLetter />} />
            <Route path="/resume-builder/settings" element={<ResumeSettings />} />
            
            {/* Tools Routes */}
            <Route path="/tools/resume-check" element={<ResumeCheck />} />
            
            {/* Dynamic routes for nav items */}
            {navItems.map(({ to, page }) => (
              <Route key={to} path={to} element={page} />
            ))}
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
