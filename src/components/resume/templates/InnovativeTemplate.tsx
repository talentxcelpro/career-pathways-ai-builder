import React from 'react';
import { EnhancedResumeData } from '@/types/enhanced-resume';

interface InnovativeTemplateProps {
  data: EnhancedResumeData;
}

export const InnovativeTemplate: React.FC<InnovativeTemplateProps> = ({ data }) => {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">{data.personalInfo.fullName}</h1>
              <p className="text-xl opacity-90">{data.personalInfo.summary?.split('.')[0] || 'Professional'}</p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-sm">{data.personalInfo.email}</p>
              <p className="text-sm">{data.personalInfo.phone}</p>
              <p className="text-sm">{data.personalInfo.location}</p>
            </div>
          </div>
        </div>

        <div className="p-8 grid grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="col-span-2 space-y-6">
            {/* Summary */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3 border-l-4 border-indigo-500 pl-4">
                Professional Summary
              </h2>
              <p className="text-gray-700 leading-relaxed">{data.professionalSummary?.content || data.personalInfo.summary}</p>
            </section>

            {/* Experience */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-l-4 border-indigo-500 pl-4">
                Experience
              </h2>
              <div className="space-y-4">
                {data.experience?.map((exp, index) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{exp.title}</h3>
                        <p className="text-indigo-600 font-medium">{exp.company}</p>
                      </div>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <p className="text-gray-700">{exp.description}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Skills */}
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-3">Skills</h2>
              <div className="space-y-2">
                {data.skills?.map((skill, index) => (
                  <div key={index} className="bg-indigo-50 p-2 rounded">
                    <span className="text-sm font-medium text-indigo-800">{skill.name}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Education */}
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-3">Education</h2>
              <div className="space-y-3">
                {data.education?.map((edu, index) => (
                  <div key={index} className="text-sm">
                    <p className="font-medium text-gray-800">{edu.degree}</p>
                    <p className="text-indigo-600">{edu.school}</p>
                    <p className="text-gray-500">{edu.endDate}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-3">Contact</h2>
              <div className="space-y-1 text-sm text-gray-600">
                <p>{data.personalInfo.linkedin && 'LinkedIn Profile'}</p>
                <p>{data.personalInfo.website && 'Portfolio Website'}</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};