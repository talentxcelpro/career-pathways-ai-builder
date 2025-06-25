
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/navigation/Navbar";

// Import pages
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import ResumeBuilder from "./pages/ResumeBuilder";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import Learning from "./pages/Learning";

// Import auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Import network pages
import Network from "./pages/Network";
import People from "./pages/network/People";
import Posts from "./pages/network/Posts";
import Groups from "./pages/network/Groups";
import Requests from "./pages/network/Requests";
import Events from "./pages/network/Events";

// Import profile pages
import ProfileEdit from "./pages/profile/ProfileEdit";
import ProfileResume from "./pages/profile/ProfileResume";
import ProfileCoverLetter from "./pages/profile/ProfileCoverLetter";
import ProfilePreferences from "./pages/profile/ProfilePreferences";
import ProfileSettings from "./pages/profile/ProfileSettings";
import ProfileMedia from "./pages/profile/ProfileMedia";
import ProfileAnalytics from "./pages/profile/ProfileAnalytics";
import ProfileDocuments from "./pages/profile/ProfileDocuments";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<ProfileEdit />} />
            <Route path="/profile/resume" element={<ProfileResume />} />
            <Route path="/profile/cover-letter" element={<ProfileCoverLetter />} />
            <Route path="/profile/preferences" element={<ProfilePreferences />} />
            <Route path="/profile/settings" element={<ProfileSettings />} />
            <Route path="/profile/media" element={<ProfileMedia />} />
            <Route path="/profile/analytics" element={<ProfileAnalytics />} />
            <Route path="/profile/documents" element={<ProfileDocuments />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/learning" element={<Learning />} />
            <Route path="/tools/resume-builder" element={<ResumeBuilder />} />
            
            {/* Network routes */}
            <Route path="/network" element={<Network />} />
            <Route path="/network/people" element={<People />} />
            <Route path="/network/requests" element={<Requests />} />
            <Route path="/network/posts" element={<Posts />} />
            <Route path="/network/groups" element={<Groups />} />
            <Route path="/network/events" element={<Events />} />
            
            {/* Auth routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
