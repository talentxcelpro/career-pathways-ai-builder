import { UnifiedResumeInterface } from "@/components/resume/enhanced/UnifiedResumeInterface";
import { Helmet } from "react-helmet-async";

const EditResume = () => {
  return (
    <>
      <Helmet>
        <title>Edit Resume | Templates, Customization & Export</title>
        <meta name="description" content="Edit your resume with ATS-optimized templates, customize styles, and export professionally." />
        <link rel="canonical" href="https://talentxcel.in/resume/edit" />
      </Helmet>
      <UnifiedResumeInterface 
        mode="edit" 
        initialData={null}
        onDataChange={() => {}}
      />
    </>
  );
};

export default EditResume;