
import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "@/components/layouts/RootLayout";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { PublicOnlyGuard } from "@/components/auth/PublicOnlyGuard";

// Lazy load pages
import { lazy } from "react";

// Core pages
const Index = lazy(() => import("@/pages/Index"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Static pages
const About = lazy(() => import("@/pages/About"));
const Blog = lazy(() => import("@/pages/Blog"));
const Help = lazy(() => import("@/pages/Help"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));
const Contact = lazy(() => import("@/pages/Contact"));

// Auth pages
const Auth = lazy(() => import("@/pages/auth/Auth"));
const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));

// Onboarding pages
const OnboardingRole = lazy(() => import("@/pages/onboarding/OnboardingRole"));
const OnboardingProfile = lazy(() => import("@/pages/onboarding/OnboardingProfile"));
const OnboardingPreferences = lazy(() => import("@/pages/onboarding/OnboardingPreferences"));

// Feature pages
const Jobs = lazy(() => import("@/pages/Jobs"));
const Learning = lazy(() => import("@/pages/Learning"));
const Network = lazy(() => import("@/pages/Network"));
const Tools = lazy(() => import("@/pages/Tools"));
const Profile = lazy(() => import("@/pages/Profile"));
const ResumeBuilder = lazy(() => import("@/pages/ResumeBuilder"));
const CareerMap = lazy(() => import("@/pages/CareerMap"));
const Companies = lazy(() => import("@/pages/Companies"));
const Colleges = lazy(() => import("@/pages/Colleges"));
const Marketplace = lazy(() => import("@/pages/Marketplace"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Index />,
      },
      // Static pages
      {
        path: "about",
        element: <About />,
      },
      {
        path: "blog",
        element: <Blog />,
      },
      {
        path: "help",
        element: <Help />,
      },
      {
        path: "privacy",
        element: <Privacy />,
      },
      {
        path: "terms",
        element: <Terms />,
      },
      {
        path: "contact",
        element: <Contact />,
      },
      {
        path: "auth",
        element: (
          <PublicOnlyGuard>
            <AuthLayout />
          </PublicOnlyGuard>
        ),
        children: [
          {
            index: true,
            element: <Auth />,
          },
          {
            path: "login",
            element: <Login />,
          },
          {
            path: "register",
            element: <Register />,
          },
          {
            path: "forgot-password",
            element: <ForgotPassword />,
          },
          {
            path: "reset-password",
            element: <ResetPassword />,
          },
        ],
      },
      {
        path: "onboarding",
        element: (
          <AuthGuard>
            <div />
          </AuthGuard>
        ),
        children: [
          {
            path: "role",
            element: <OnboardingRole />,
          },
          {
            path: "profile",
            element: <OnboardingProfile />,
          },
          {
            path: "preferences",
            element: <OnboardingPreferences />,
          },
        ],
      },
      {
        path: "dashboard",
        element: (
          <AuthGuard>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </AuthGuard>
        ),
      },
      {
        path: "jobs",
        element: (
          <AuthGuard>
            <DashboardLayout>
              <Jobs />
            </DashboardLayout>
          </AuthGuard>
        ),
      },
      {
        path: "learning",
        element: (
          <AuthGuard>
            <DashboardLayout>
              <Learning />
            </DashboardLayout>
          </AuthGuard>
        ),
      },
      {
        path: "network",
        element: (
          <AuthGuard>
            <DashboardLayout>
              <Network />
            </DashboardLayout>
          </AuthGuard>
        ),
      },
      {
        path: "tools",
        element: (
          <AuthGuard>
            <DashboardLayout>
              <Tools />
            </DashboardLayout>
          </AuthGuard>
        ),
      },
      {
        path: "profile",
        element: (
          <AuthGuard>
            <DashboardLayout>
              <Profile />
            </DashboardLayout>
          </AuthGuard>
        ),
      },
      {
        path: "resume-builder",
        element: (
          <AuthGuard>
            <DashboardLayout>
              <ResumeBuilder />
            </DashboardLayout>
          </AuthGuard>
        ),
      },
      {
        path: "career-map",
        element: (
          <AuthGuard>
            <DashboardLayout>
              <CareerMap />
            </DashboardLayout>
          </AuthGuard>
        ),
      },
      {
        path: "companies",
        element: (
          <AuthGuard>
            <DashboardLayout>
              <Companies />
            </DashboardLayout>
          </AuthGuard>
        ),
      },
      {
        path: "colleges",
        element: (
          <AuthGuard>
            <DashboardLayout>
              <Colleges />
            </DashboardLayout>
          </AuthGuard>
        ),
      },
      {
        path: "marketplace",
        element: (
          <AuthGuard>
            <DashboardLayout>
              <Marketplace />
            </DashboardLayout>
          </AuthGuard>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
