
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import OAuthCallback from "../pages/auth/OAuthCallback";
import { AuthPage } from "../pages/auth/AuthPage";
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
];
