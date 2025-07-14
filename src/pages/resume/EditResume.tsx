import { UnifiedResumeInterface } from "@/components/resume/enhanced/UnifiedResumeInterface";
import { EdgeFunctionTest } from "@/components/test/EdgeFunctionTest";

const EditResume = () => {
  return (
    <div>
      <EdgeFunctionTest />
      <UnifiedResumeInterface mode="edit" />
    </div>
  );
};

export default EditResume;