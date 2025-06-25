
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

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
];
