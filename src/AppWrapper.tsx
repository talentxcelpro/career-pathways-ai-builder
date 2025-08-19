import React from "react";
import App from "./App";
import { HelmetProvider } from "react-helmet-async";

export const AppWrapper: React.FC = () => {
  return (
    <HelmetProvider>
      <App />
    </HelmetProvider>
  );
};