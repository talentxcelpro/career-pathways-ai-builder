import React from 'react';
import { EnhancedResumeData } from '@/types/enhanced-resume';

interface BoldTemplateProps {
  data: EnhancedResumeData;
}

export const BoldTemplate: React.FC<BoldTemplateProps> = ({ data }) => {
  return (
    <div className="bg-gray-900 text-white p-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Bold Header */}
        <div className="text-center mb-8 border-b-4 border-yellow-400 pb-6">
          <h1 className="text-5xl font-black mb-3 tracking-tight">
            {data.personalInfo.fullName}
          </h1>
          <p className="text-xl text-yellow-400 font-bold uppercase tracking-widest">
            {data.personalInfo.summary?.split('.')[0] || 'Professional'}
          </p>
          <div className="flex justify-center space-x-6 mt-4 text-sm">
            <span>{data.personalInfo.email}</span>
            <span>{data.personalInfo.phone}</span>
            <span>{data.personalInfo.location}</span>
          </div>
        </div>

        {/* Dynamic Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Summary */}
            <section>
              <h2 className="text-2xl font-black text-yellow-400 mb-4 uppercase">
                About Me
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg">{data.professionalSummary?.content || data.personalInfo.summary}</p>
            </section>

            {/* Experience */}
            <section>
              <h2 className="text-2xl font-black text-yellow-400 mb-6 uppercase">
                Experience
              </h2>
              <div className="space-y-6">
                {data.experience?.map((exp, index) => (
                  <div key={index} className="border-l-4 border-yellow-400 pl-6">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-white">{exp.title}</h3>
                        <p className="text-yellow-400 font-semibold text-lg">{exp.company}</p>
                      </div>
                      <span className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded mt-2 lg:mt-0">
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Skills */}
            <section>
              <h2 className="text-2xl font-black text-yellow-400 mb-4 uppercase">
                Skills
              </h2>
              <div className="space-y-3">
                {data.skills?.map((skill, index) => (
                  <div key={index} className="bg-gray-800 p-3 rounded">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-white">{skill.name}</span>
                      <span className="text-xs text-yellow-400">{skill.level}</span>
                    </div>
                    <div className="bg-gray-700 h-2 rounded">
                      <div 
                        className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded"
                        style={{ 
                        width: skill.level === 'expert' ? '100%' : 
                               skill.level === 'advanced' ? '85%' : '70%'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Education */}
            <section>
              <h2 className="text-2xl font-black text-yellow-400 mb-4 uppercase">
                Education
              </h2>
              <div className="space-y-4">
                {data.education?.map((edu, index) => (
                  <div key={index} className="bg-gray-800 p-4 rounded">
                    <p className="font-bold text-white">{edu.degree}</p>
                    <p className="text-yellow-400 font-medium">{edu.school}</p>
                    <p className="text-gray-400 text-sm">{edu.endDate}</p>
                    {edu.gpa && (
                      <p className="text-gray-300 text-sm">GPA: {edu.gpa}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-black text-yellow-400 mb-4 uppercase">
                Connect
              </h2>
              <div className="space-y-2">
                {data.personalInfo.linkedin && (
                  <div className="bg-gray-800 p-2 rounded">
                    <span className="text-sm text-gray-300">LinkedIn</span>
                  </div>
                )}
                {data.personalInfo.website && (
                  <div className="bg-gray-800 p-2 rounded">
                    <span className="text-sm text-gray-300">Portfolio</span>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};