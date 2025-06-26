import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/components/layouts/RootLayout';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { ProtectedRoute } from '@/components/routing/ProtectedRoute';

// Core Pages
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Jobs from '@/pages/Jobs';
import Network from '@/pages/Network';
import Learning from '@/pages/Learning';
import Tools from '@/pages/Tools';
import CareerMap from '@/pages/CareerMap';

// Auth Pages
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';

// Profile Pages
import Profile from '@/pages/Profile';

// Job Pages
import JobDetails from '@/pages/jobs/JobDetails';
import SavedJobs from '@/pages/jobs/SavedJobs';
import AppliedJobs from '@/pages/jobs/AppliedJobs';

// Tools Pages
import ToolsDashboard from '@/pages/tools/ToolsDashboard';
import ResumeCheck from '@/pages/tools/ResumeCheck';
import AICareerAssistant from '@/pages/tools/AICareerAssistant';

// Career Map Pages
import Generate from '@/pages/career-map/Generate';
import AIRoadmapBuilder from '@/pages/career-map/AIRoadmapBuilder';
import MyRoadmaps from '@/pages/career-map/MyRoadmaps';

// Employer Pages
import EmployerDashboard from '@/pages/employer/Dashboard';

// Other Pages
import Companies from '@/pages/Companies';
import Colleges from '@/pages/Colleges';
import ResumeBuilder from '@/pages/ResumeBuilder';
import NotFound from '@/pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Index />
      },
      {
        path: 'auth',
        element: <AuthLayout />,
        children: [
          {
            path: 'login',
            element: <Login />
          },
          {
            path: 'register',
            element: <Register />
          }
        ]
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Dashboard />
          }
        ]
      },
      {
        path: 'jobs',
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Jobs />
          },
          {
            path: 'saved',
            element: <SavedJobs />
          },
          {
            path: 'applied',
            element: <AppliedJobs />
          },
          {
            path: ':id',
            element: <JobDetails />
          }
        ]
      },
      {
        path: 'network',
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Network />
          }
        ]
      },
      {
        path: 'learning',
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Learning />
          }
        ]
      },
      {
        path: 'tools',
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Tools />
          },
          {
            path: 'dashboard',
            element: <ToolsDashboard />
          },
          {
            path: 'resume-check',
            element: <ResumeCheck />
          },
          {
            path: 'ai-assistant',
            element: <AICareerAssistant />
          }
        ]
      },
      {
        path: 'career-map',
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <CareerMap />
          },
          {
            path: 'generate',
            element: <Generate />
          },
          {
            path: 'ai-roadmap-builder',
            element: <AIRoadmapBuilder />
          },
          {
            path: 'my-roadmaps',
            element: <MyRoadmaps />
          }
        ]
      },
      {
        path: 'employer',
        element: (
          <ProtectedRoute requiredRoles={['employer', 'admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <EmployerDashboard />
          }
        ]
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Profile />
          }
        ]
      },
      {
        path: 'companies',
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Companies />
          }
        ]
      },
      {
        path: 'colleges',
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Colleges />
          }
        ]
      },
      {
        path: 'resume-builder',
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <ResumeBuilder />
          }
        ]
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
]);
