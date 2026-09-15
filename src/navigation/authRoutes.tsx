import { lazy } from "react";

const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));
const OAuthCallback = lazy(() => import("../pages/auth/OAuthCallback"));
const Terms = lazy(() => import("../pages/auth/Terms"));
const PrivacyPolicy = lazy(() => import("../pages/auth/PrivacyPolicy"));
const AuthPage = lazy(() => import("../pages/auth/AuthPage").then(m => ({ default: m.AuthPage })));
const OnboardingFlow = lazy(() => import("../pages/auth/OnboardingFlow").then(m => ({ default: m.OnboardingFlow })));

import { AuthErrorBoundaryWrapper } from "../components/auth/AuthErrorBoundaryWrapper";


export const authRoutes = [
  {
    title: "Auth",
    to: "/auth",
    page: (
      <AuthErrorBoundaryWrapper>
        <AuthPage />
      </AuthErrorBoundaryWrapper>
    ),
    isPublic: true
  },
  {
    title: "Login",
    to: "/auth/login",
    page: <Login />,
    isPublic: true
  },
  {
    title: "Register", 
    to: "/auth/register",
    page: <Register />,
    isPublic: true
  },
  {
    title: "Forgot Password",
    to: "/auth/forgot-password",
    page: <ForgotPassword />,
    isPublic: true
  },
  {
    title: "Reset Password",
    to: "/auth/reset-password",
    page: <ResetPassword />,
    isPublic: true
  },
  {
    title: "OAuth Callback",
    to: "/auth/callback",
    page: <OAuthCallback />,
    isPublic: true
  },
  {
    title: "Terms of Service",
    to: "/terms",
    page: <Terms />,
    isPublic: true
  },
  {
    title: "Privacy Policy", 
    to: "/privacypolicy",
    page: <PrivacyPolicy />,
    isPublic: true
  },
  {
    title: "Onboarding",
    to: "/onboarding",
    page: <OnboardingFlow />,
    isPublic: false
  },
];
