
import { lazy, Suspense } from "react";
import { AuthErrorBoundaryWrapper } from "../components/auth/AuthErrorBoundaryWrapper";

const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));
const OAuthCallback = lazy(() => import("../pages/auth/OAuthCallback"));
const Terms = lazy(() => import("../pages/auth/Terms"));
const PrivacyPolicy = lazy(() => import("../pages/auth/PrivacyPolicy"));
const AuthPage = lazy(() => import("../pages/auth/AuthPage").then(m => ({ default: m.AuthPage })));
const OnboardingFlow = lazy(() => import("../pages/auth/OnboardingFlow").then(m => ({ default: m.OnboardingFlow })));

const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={null}>{children}</Suspense>
);

export const authRoutes = [
  {
    title: "Auth",
    to: "/auth",
    page: (
      <AuthErrorBoundaryWrapper>
        <S><AuthPage /></S>
      </AuthErrorBoundaryWrapper>
    ),
    isPublic: true
  },
  {
    title: "Login",
    to: "/auth/login",
    page: <S><Login /></S>,
    isPublic: true
  },
  {
    title: "Register", 
    to: "/auth/register",
    page: <S><Register /></S>,
    isPublic: true
  },
  {
    title: "Forgot Password",
    to: "/auth/forgot-password",
    page: <S><ForgotPassword /></S>,
    isPublic: true
  },
  {
    title: "Reset Password",
    to: "/auth/reset-password",
    page: <S><ResetPassword /></S>,
    isPublic: true
  },
  {
    title: "OAuth Callback",
    to: "/auth/callback",
    page: <S><OAuthCallback /></S>,
    isPublic: true
  },
  {
    title: "Terms of Service",
    to: "/terms",
    page: <S><Terms /></S>,
    isPublic: true
  },
  {
    title: "Privacy Policy", 
    to: "/privacypolicy",
    page: <S><PrivacyPolicy /></S>,
    isPublic: true
  },
  {
    title: "Onboarding",
    to: "/onboarding",
    page: <S><OnboardingFlow /></S>,
    isPublic: false
  },
];
