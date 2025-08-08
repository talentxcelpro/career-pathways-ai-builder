import React from 'react';
import { Helmet } from 'react-helmet-async';
import { UploadWizard } from '@/components/resume/upload/UploadWizard';
import { ResumeEditorPage } from './ResumeEditorPage';

const ResumeNew: React.FC = () => {
  const [data, setData] = React.useState<any | null>(null);

  return (
    <div>
      <Helmet>
        <title>Create Resume | Upload & Edit</title>
        <meta name="description" content="Upload your PDF/DOCX resume, auto-parse it, and edit instantly in the builder." />
        <link rel="canonical" href="https://talentxcel.in/resume/new" />
      </Helmet>
      {!data ? (
        <UploadWizard onComplete={setData} />
      ) : (
        <ResumeEditorPage />
      )}
    </div>
  );
};

export default ResumeNew;
