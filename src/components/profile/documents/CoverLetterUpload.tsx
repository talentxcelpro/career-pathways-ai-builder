
import { CoverLetterFileUpload } from "./cover-letter/CoverLetterFileUpload";
import { CoverLetterTemplateCreator } from "./cover-letter/CoverLetterTemplateCreator";

export const CoverLetterUpload = () => {
  return (
    <div className="space-y-6">
      <CoverLetterFileUpload />
      <CoverLetterTemplateCreator />
    </div>
  );
};
