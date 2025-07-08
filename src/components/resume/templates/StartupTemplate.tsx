import React from 'react';

interface TemplateProps {
  data: any;
  className?: string;
}

export const StartupTemplate: React.FC<TemplateProps> = ({ data, className = '' }) => {
  const personalInfo = data.personalInfo || {};
  const experience = data.experience || [];
  const education = data.education || [];
  const skills = Array.isArray(data.skills) ? data.skills : [];
  const projects = data.projects || [];
  const certifications = data.certifications || [];

  return (
    <div className={`max-w-4xl mx-auto bg-gray-900 text-white ${className}`}>
      {/* Header - Modern & Tech-Focused */}
      <header className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 p-8">
        <div className="backdrop-blur-sm bg-black/20 p-6 rounded-xl">
          <h1 className="text-4xl font-bold mb-4 text-white">
            {personalInfo.fullName || 'Your Name'}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-100">
            <div className="space-y-2">
              {personalInfo.email && <div className="flex items-center"><span className="mr-2">💌</span>{personalInfo.email}</div>}
              {personalInfo.phone && <div className="flex items-center"><span className="mr-2">📞</span>{personalInfo.phone}</div>}
            </div>
            <div className="space-y-2">
              {personalInfo.location && <div className="flex items-center"><span className="mr-2">🌍</span>{personalInfo.location}</div>}
              {personalInfo.linkedin && <div className="flex items-center"><span className="mr-2">🔗</span>{personalInfo.linkedin}</div>}
            </div>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Summary - Vision Statement */}
        {personalInfo.summary && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-6 flex items-center">
              🚀 VISION & MISSION
            </h2>
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-xl border border-gray-600">
              <p className="text-gray-100 text-lg leading-relaxed">
                {personalInfo.summary}
              </p>
            </div>
          </section>
        )}

        {/* Tech Stack - Prominent */}
        {skills.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-6 flex items-center">
              ⚡ TECH STACK
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {skills.filter(skill => skill).map((skill, index) => (
                <div key={index} className="bg-gradient-to-r from-cyan-600 to-purple-600 p-4 rounded-lg text-center font-bold shadow-lg hover:shadow-xl transition-shadow border border-gray-600">
                  <div className="text-white">{skill}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects - Innovation Showcase */}
        {projects.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-6 flex items-center">
              💡 INNOVATION LAB
            </h2>
            <div className="grid gap-6">
              {projects.map((project, index) => (
                <div key={index} className="bg-gray-800 border border-gray-600 p-6 rounded-xl hover:border-purple-500 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-cyan-400">
                      {project.title}
                    </h3>
                    {project.url && (
                      <a href={project.url} className="text-purple-400 hover:text-purple-300">
                        🔗 Live Demo
                      </a>
                    )}
                  </div>
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    {project.description}
                  </p>
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, i) => (
                        <span key={i} className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
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

        {/* Experience - Growth Journey */}
        {experience.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-6 flex items-center">
              📈 GROWTH JOURNEY
            </h2>
            <div className="space-y-8">
              {experience.map((exp, index) => (
                <div key={index} className="bg-gray-800 border border-gray-600 p-6 rounded-xl">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {exp.position || exp.title}
                      </h3>
                      <div className="text-cyan-400 font-semibold text-lg">
                        {exp.company}
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                      {exp.startDate} - {exp.endDate}
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-4">
                    {exp.description}
                  </p>
                  
                  {exp.achievements && exp.achievements.length > 0 && (
                    <div>
                      <h4 className="font-bold text-pink-400 mb-3">🎯 IMPACT METRICS:</h4>
                      <ul className="space-y-2">
                        {exp.achievements.map((achievement, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-green-400 font-bold mr-3">▶</span>
                            <span className="text-gray-200">{achievement}</span>
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

        {/* Education */}
        {education.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-6 flex items-center">
              🎓 FOUNDATION
            </h2>
            <div className="grid gap-4">
              {education.map((edu, index) => (
                <div key={index} className="bg-gray-800 border border-gray-600 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-white">{edu.degree}</h3>
                      <div className="text-cyan-400 font-semibold">{edu.school}</div>
                    </div>
                    <div className="text-purple-400 font-medium">
                      {edu.startDate} - {edu.endDate}
                    </div>
                  </div>
                  {edu.gpa && (
                    <div className="mt-2 text-gray-300">
                      🏆 GPA: {edu.gpa}
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
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-6 flex items-center">
              🏅 CREDENTIALS
            </h2>
            <div className="grid gap-3">
              {certifications.map((cert, index) => (
                <div key={index} className="bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white">{cert.name}</span>
                    <span className="text-cyan-400 ml-3">• {cert.issuer}</span>
                  </div>
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold">
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