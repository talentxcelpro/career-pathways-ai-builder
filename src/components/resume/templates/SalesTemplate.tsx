import React from 'react';

interface TemplateProps {
  data: any;
  className?: string;
}

export const SalesTemplate: React.FC<TemplateProps> = ({ data, className = '' }) => {
  const personalInfo = data.personalInfo || {};
  const experience = data.experience || [];
  const education = data.education || [];
  const skills = Array.isArray(data.skills) ? data.skills : [];
  const projects = data.projects || [];
  const certifications = data.certifications || [];

  return (
    <div className={`max-w-4xl mx-auto bg-white text-gray-900 ${className}`}>
      {/* Header - Bold & Results-Focused */}
      <header className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-8">
        <h1 className="text-4xl font-bold mb-4">
          {personalInfo.fullName || 'Your Name'}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-red-100">
          <div>
            {personalInfo.email && <div className="mb-1">📧 {personalInfo.email}</div>}
            {personalInfo.phone && <div className="mb-1">📱 {personalInfo.phone}</div>}
          </div>
          <div>
            {personalInfo.location && <div className="mb-1">📍 {personalInfo.location}</div>}
            {personalInfo.linkedin && <div>💼 {personalInfo.linkedin}</div>}
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Summary - Value Proposition */}
        {personalInfo.summary && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4 flex items-center">
              🎯 VALUE PROPOSITION
            </h2>
            <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded">
              <p className="text-gray-800 text-lg font-medium leading-relaxed">
                {personalInfo.summary}
              </p>
            </div>
          </section>
        )}

        {/* Experience - Results-Focused */}
        {experience.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-red-600 mb-6 flex items-center">
              📈 PROVEN RESULTS
            </h2>
            <div className="space-y-8">
              {experience.map((exp, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-lg border-l-4 border-orange-500">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {exp.position || exp.title}
                      </h3>
                      <div className="text-lg font-semibold text-orange-600">
                        {exp.company}
                      </div>
                    </div>
                    <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {exp.startDate} - {exp.endDate}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4 font-medium">
                    {exp.description}
                  </p>
                  
                  {exp.achievements && exp.achievements.length > 0 && (
                    <div>
                      <h4 className="font-bold text-red-600 mb-3">🏆 KEY ACHIEVEMENTS:</h4>
                      <ul className="space-y-2">
                        {exp.achievements.map((achievement, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-green-600 font-bold mr-2">✓</span>
                            <span className="text-gray-800 font-medium">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills - Power Skills */}
        {skills.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-red-600 mb-6 flex items-center">
              💪 POWER SKILLS
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {skills.filter(skill => skill).map((skill, index) => (
                <div key={index} className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-3 rounded-lg text-center font-bold shadow-lg">
                  {skill}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-red-600 mb-6 flex items-center">
              🎓 EDUCATION & CREDENTIALS
            </h2>
            <div className="grid gap-4">
              {education.map((edu, index) => (
                <div key={index} className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{edu.degree}</h3>
                      <div className="text-red-600 font-semibold">{edu.school}</div>
                    </div>
                    <div className="text-gray-600 font-medium">
                      {edu.startDate} - {edu.endDate}
                    </div>
                  </div>
                  {edu.gpa && (
                    <div className="mt-2 text-gray-700 font-medium">
                      🏅 GPA: {edu.gpa}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-red-600 mb-6 flex items-center">
              🚀 SUCCESS STORIES
            </h2>
            <div className="grid gap-4">
              {projects.map((project, index) => (
                <div key={index} className="border border-red-200 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {project.title}
                  </h3>
                  <p className="text-gray-700 mb-3">{project.description}</p>
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, i) => (
                        <span key={i} className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-red-600 mb-6 flex items-center">
              🏆 CERTIFICATIONS
            </h2>
            <div className="grid gap-3">
              {certifications.map((cert, index) => (
                <div key={index} className="flex justify-between items-center bg-gradient-to-r from-red-50 to-orange-50 p-3 rounded border-l-4 border-red-500">
                  <div>
                    <span className="font-bold text-gray-900">{cert.name}</span>
                    <span className="text-red-600 ml-2">• {cert.issuer}</span>
                  </div>
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {cert.date}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};