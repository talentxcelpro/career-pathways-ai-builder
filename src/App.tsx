import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import { Navbar } from "./components/navigation/Navbar";

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
      <BrowserRouter>
        <Navbar />
        <Routes>
          {navItems.map(({ to, page }) => (
            <Route key={to} path={to} element={page} />
          ))}
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
