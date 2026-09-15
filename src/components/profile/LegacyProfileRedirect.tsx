import React from "react";
import { useParams, Navigate } from "react-router-dom";

export const LegacyProfileRedirect: React.FC = () => {
  const { username } = useParams<{ username: string }>();

  if (!username) {
    return <Navigate to="/404" replace />;
  }

  const clean = username.startsWith('@') ? username.slice(1).trim() : username.trim();
  return <Navigate to={`/${clean}`} replace />;
};

export default LegacyProfileRedirect;
