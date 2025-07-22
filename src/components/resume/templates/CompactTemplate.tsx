import React from 'react';
import { EnhancedResumeData } from '@/types/enhanced-resume';

interface CompactTemplateProps {
  data: EnhancedResumeData;
}

export const CompactTemplate: React.FC<CompactTemplateProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 max-w-4xl mx-auto">
      {/* Compact Header */}
      <div className="border-b-2 border-blue-600 pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{data.personalInfo.fullName}</h1>
            <p className="text-blue-600 font-medium mt-1">
              {data.personalInfo.summary?.split('.')[0] || 'Professional'}
            </p>
          </div>
          <div className="text-right text-sm text-gray-600 space-y-1">
            <p>{data.personalInfo.email}</p>
            <p>{data.personalInfo.phone}</p>
            <p>{data.personalInfo.location}</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-3 gap-6">
        {/* Main Content - 2/3 width */}
        <div className="col-span-2 space-y-5">
          {/* Summary */}
          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-2 uppercase tracking-wide">
              Summary
            </h2>
            <p className="text-gray-700 text-sm leading-relaxed">{data.professionalSummary?.content || data.personalInfo.summary}</p>
          </section>

          {/* Experience */}
          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-3 uppercase tracking-wide">
              Experience
            </h2>
            <div className="space-y-3">
              {data.experience?.map((exp, index) => (
                <div key={index}>
                  <div className="flex justify-between items-baseline mb-1">
                    <div>
                      <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                      <p className="text-blue-600 text-sm">{exp.company}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-snug">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-5">
          {/* Skills */}
          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-2 uppercase tracking-wide">
              Skills
            </h2>
            <div className="space-y-1">
              {data.skills?.map((skill, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium text-gray-800">{skill.name}</span>
                  <div className="bg-gray-200 h-1 rounded mt-1">
                    <div 
                      className="bg-blue-600 h-1 rounded"
                      style={{ 
                      width: skill.level === 'expert' ? '100%' : 
                             skill.level === 'advanced' ? '80%' : '60%'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Education */}
          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-2 uppercase tracking-wide">
              Education
            </h2>
            <div className="space-y-2">
              {data.education?.map((edu, index) => (
                <div key={index} className="text-sm">
                  <p className="font-medium text-gray-900">{edu.degree}</p>
                  <p className="text-blue-600">{edu.school}</p>
                  <p className="text-gray-500 text-xs">{edu.endDate}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Contact Links */}
          {(data.personalInfo.linkedin || data.personalInfo.website) && (
            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-2 uppercase tracking-wide">
                Links
              </h2>
              <div className="space-y-1 text-sm">
                {data.personalInfo.linkedin && (
                  <p className="text-blue-600">LinkedIn Profile</p>
                )}
                {data.personalInfo.website && (
                  <p className="text-blue-600">Portfolio</p>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};