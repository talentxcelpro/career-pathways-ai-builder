import React from "react";
import { Navigate, useParams } from "react-router-dom";

/**
 * External QR / share URL: /passport/proof/:credentialId
 * Redirects to the Wallet with the matching credential auto-opened.
 */
const ProofRedirect: React.FC = () => {
  const { credentialId } = useParams<{ credentialId: string }>();
  const to = credentialId
    ? `/passport/section/wallet?proof=${encodeURIComponent(credentialId)}`
    : "/passport/section/wallet";
  return <Navigate to={to} replace />;
};

export default ProofRedirect;
