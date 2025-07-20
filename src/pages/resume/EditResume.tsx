import { UnifiedResumeInterface } from "@/components/resume/enhanced/UnifiedResumeInterface";

const EditResume = () => {
  return <UnifiedResumeInterface 
    mode="edit" 
    initialData={null}
    onDataChange={() => {}}
  />;
};

export default EditResume;