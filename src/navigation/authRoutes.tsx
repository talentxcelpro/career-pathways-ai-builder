
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

export const authRoutes = [
  {
    title: "Login",
    to: "/auth/login",
    page: <Login />,
  },
  {
    title: "Register", 
    to: "/auth/register",
    page: <Register />,
  },
  {
    title: "Forgot Password",
    to: "/auth/forgot-password",
    page: <ForgotPassword />,
  },
  {
    title: "Reset Password",
    to: "/auth/reset-password",
    page: <ResetPassword />,
  },
];
