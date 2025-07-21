
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Public pages
import Index from "./pages/Index";
import SignUp from "./pages/auth/SignUp";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import PublicJobDetail from "./pages/public/PublicJobDetail";
import PublicCompanyDetail from "./pages/public/PublicCompanyDetail";
import PublicPostDetail from "./pages/public/PublicPostDetail";

// Main app pages
import Network from "./pages/Network";
import Jobs from "./pages/Jobs";
import Learning from "./pages/Learning";
import CareerMap from "./pages/CareerMap";
import AITools from "./pages/AITools";
import Profile from "./pages/Profile";
import Resumes from "./pages/Resumes";
import Employer from "./pages/Employer";
import EmployerTeam from "./pages/EmployerTeam";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/CompanyDetail";
import JobDetail from "./pages/JobDetail";
import OnboardingPage from "./pages/OnboardingPage";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Subscriptions from "./pages/Subscriptions";
import CollegeAdmissions from "./pages/CollegeAdmissions";
import MyApplications from "./pages/MyApplications";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import AdminManagement from "./pages/admin/AdminManagement";
import BulkAdminCreation from "./pages/admin/BulkAdminCreation";
import EmailAutomation from "./pages/admin/EmailAutomation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth/signup" element={<SignUp />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/public/jobs/:id" element={<PublicJobDetail />} />
            <Route path="/public/companies/:slug" element={<PublicCompanyDetail />} />
            <Route path="/public/posts/:id" element={<PublicPostDetail />} />
            
            {/* Protected routes */}
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/network" element={<Network />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/learning" element={<Learning />} />
            <Route path="/career-map" element={<CareerMap />} />
            <Route path="/ai-tools" element={<AITools />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/resumes" element={<Resumes />} />
            <Route path="/employer" element={<Employer />} />
            <Route path="/employer/team" element={<EmployerTeam />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/:slug" element={<CompanyDetail />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/college-admissions" element={<CollegeAdmissions />} />
            <Route path="/my-applications" element={<MyApplications />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/admins" element={<AdminManagement />} />
            <Route path="/admin/bulk-create" element={<BulkAdminCreation />} />
            <Route path="/admin/email-automation" element={<EmailAutomation />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
