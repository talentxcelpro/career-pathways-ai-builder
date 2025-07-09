import React from 'react';

interface LivePreviewRendererProps {
  previewData: any;
}

export const LivePreviewRenderer: React.FC<LivePreviewRendererProps> = ({ previewData }) => {
  if (!previewData) return null;

  return (
    <div className="space-y-4 text-sm">
      {/* Personal Info Preview */}
      {previewData.personalInfo?.fullName && (
        <div className="border-b pb-3">
          <h4 className="font-medium text-lg text-gray-900">{previewData.personalInfo.fullName}</h4>
          <div className="text-gray-600 space-x-2">
            {previewData.personalInfo.email && <span>{previewData.personalInfo.email}</span>}
            {previewData.personalInfo.phone && <span>• {previewData.personalInfo.phone}</span>}
            {previewData.personalInfo.location && <span>• {previewData.personalInfo.location}</span>}
          </div>
          {previewData.personalInfo.summary && (
            <p className="text-gray-700 mt-2 text-sm line-clamp-3">{previewData.personalInfo.summary}</p>
          )}
        </div>
      )}
      
      {/* Experience Preview */}
      {previewData.experience?.length > 0 && (
        <div className="border-b pb-3">
          <h5 className="font-medium text-gray-900 mb-2">Experience</h5>
          <div className="space-y-2">
            {previewData.experience.map((exp: any, index: number) => (
              <div key={index} className="text-sm">
                <div className="font-medium text-gray-800">{exp.title}</div>
                <div className="text-gray-600">{exp.company} • {exp.startDate} - {exp.endDate}</div>
              </div>
            ))}
            {previewData.totalExperience > 2 && (
              <div className="text-xs text-gray-500 italic">+{previewData.totalExperience - 2} more positions</div>
            )}
          </div>
        </div>
      )}
      
      {/* Skills Preview */}
      {previewData.skills?.length > 0 && (
        <div>
          <h5 className="font-medium text-gray-900 mb-2">Skills</h5>
          <div className="flex flex-wrap gap-1">
            {previewData.skills.map((skill: any, index: number) => (
              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Processing Info */}
      <div className="border-t pt-3 text-xs text-gray-500">
        <div>Extraction Method: {previewData.metadata?.extractionMethod || 'Standard AI'}</div>
        {previewData.atsScore && (
          <div>ATS Score: {previewData.atsScore}%</div>
        )}
      </div>
    </div>
  );
};