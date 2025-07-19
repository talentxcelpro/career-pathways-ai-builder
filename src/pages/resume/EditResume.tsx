
import { EnhancedResumeEditor } from "@/components/resume/enhanced/EnhancedResumeEditor";
import { useParams, useLocation } from "react-router-dom";

const EditResume = () => {
  const { id } = useParams();
  const location = useLocation();
  const initialData = location.state?.resumeData;

  return (
    <EnhancedResumeEditor 
      resumeId={id} 
      initialData={initialData}
    />
  );
};

export default EditResume;
