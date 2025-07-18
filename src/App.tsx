
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import EditResume from "./pages/resume/EditResume";
import UploadResume from "./pages/resume/UploadResume";
import VisualResumeBuilderPage from "./pages/resume/VisualResumeBuilder";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/resume-builder/edit/:id" element={<EditResume />} />
              <Route path="/resume-builder/upload" element={<UploadResume />} />
              <Route path="/resume-builder/visual" element={<VisualResumeBuilderPage />} />
              <Route path="/resume-builder/visual/:id" element={<VisualResumeBuilderPage />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
