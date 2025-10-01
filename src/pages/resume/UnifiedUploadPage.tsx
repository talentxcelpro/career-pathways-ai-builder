import { Helmet } from "react-helmet-async";
import { UnifiedUploadWizard } from "@/components/resume/UnifiedUploadWizard";

const UnifiedUploadPage = () => {
  return (
    <>
      <Helmet>
        <title>Upload Resume | AI-Powered Enhancement | TalentXcel</title>
        <meta 
          name="description" 
          content="Upload your existing resume and get instant AI-powered enhancements. Our smart parser extracts and improves your content for better ATS compatibility." 
        />
        <link rel="canonical" href="https://talentxcel.in/resume/upload" />
      </Helmet>

      <UnifiedUploadWizard />
    </>
  );
};

export default UnifiedUploadPage;
