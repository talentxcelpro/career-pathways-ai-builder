import React from 'react';

interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
    linkedin?: string;
    website?: string;
  };
  experience: Array<{
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
    achievements?: string[];
    technologies?: string[];
  }>;
  education: Array<{
    degree: string;
    school: string;
    location: string;
    startDate: string;
    endDate: string;
    gpa?: string;
    honors?: string;
    relevantCoursework?: string[];
  }>;
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
    tools: string[];
  } | string[];
  projects: Array<{
    title: string;
    description: string;
    technologies?: string[];
    startDate?: string;
    endDate?: string;
    url?: string;
    github?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    expiryDate?: string;
    credentialId?: string;
    url?: string;
  }>;
  awards?: Array<{
    name: string;
    issuer: string;
    date: string;
    description?: string;
  }>;
  volunteer?: Array<{
    organization: string;
    role: string;
    startDate: string;
    endDate: string;
    description?: string;
  }>;
}

interface TemplateProps {
  data: ResumeData;
}

export const ModernTemplate: React.FC<TemplateProps> = ({ data }) => {
  const skills = Array.isArray(data.skills) 
    ? data.skills 
    : [...(data.skills.technical || []), ...(data.skills.soft || []), ...(data.skills.tools || [])];

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-gray-900 font-sans">
      {/* Header */}
      <header className="border-b-2 border-blue-600 pb-6 mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{data.personalInfo?.fullName || 'Your Name'}</h1>
        <div className="flex flex-wrap gap-4 text-gray-600">
          {data.personalInfo?.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo?.phone && <span>{data.personalInfo.phone}</span>}
          {data.personalInfo?.location && <span>{data.personalInfo.location}</span>}
        </div>
        {data.personalInfo?.linkedin && (
          <div className="mt-2 text-blue-600">
            <span>LinkedIn: {data.personalInfo.linkedin}</span>
          </div>
        )}
      </header>

      {/* Summary */}
      {data.personalInfo?.summary && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-blue-600 mb-3">Professional Summary</h2>
          <p className="text-gray-700 leading-relaxed">{data.personalInfo.summary}</p>
        </section>
      )}

      {/* Experience */}
      {data.experience?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">Experience</h2>
          <div className="space-y-6">
            {data.experience.map((exp, index) => (
              <div key={index} className="border-l-4 border-blue-200 pl-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{exp.title}</h3>
                  <span className="text-gray-600 text-sm">{exp.startDate} - {exp.endDate}</span>
                </div>
                <div className="text-lg text-blue-600 mb-2">{exp.company} • {exp.location}</div>
                <p className="text-gray-700 mb-2">{exp.description}</p>
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {exp.achievements.map((achievement, i) => (
                      <li key={i}>{achievement}</li>
                    ))}
                  </ul>
                )}
                {exp.technologies && exp.technologies.length > 0 && (
                  <div className="mt-2">
                    <strong className="text-gray-800">Technologies: </strong>
                    <span className="text-gray-600">{exp.technologies.join(', ')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              skill && (
                <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {skill}
                </span>
              )
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {data.education?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">Education</h2>
          <div className="space-y-4">
            {data.education.map((edu, index) => (
              <div key={index}>
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-gray-900">{edu.degree}</h3>
                  <span className="text-gray-600 text-sm">{edu.startDate} - {edu.endDate}</span>
                </div>
                <div className="text-lg text-blue-600">{edu.school} • {edu.location}</div>
                {edu.gpa && <div className="text-gray-700">GPA: {edu.gpa}</div>}
                {edu.honors && <div className="text-gray-700 italic">{edu.honors}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {data.projects?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">Projects</h2>
          <div className="space-y-4">
            {data.projects.map((project, index) => (
              <div key={index}>
                <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
                <p className="text-gray-700 mb-2">{project.description}</p>
                {project.technologies && (
                  <div className="text-sm text-gray-600">
                    <strong>Technologies: </strong>{project.technologies.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {data.certifications?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">Certifications</h2>
          <div className="space-y-2">
            {data.certifications.map((cert, index) => (
              <div key={index} className="flex justify-between">
                <span className="font-semibold">{cert.name}</span>
                <span className="text-gray-600">{cert.issuer}, {cert.date}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export const ClassicTemplate: React.FC<TemplateProps> = ({ data }) => {
  const skills = Array.isArray(data.skills) 
    ? data.skills 
    : [...(data.skills.technical || []), ...(data.skills.soft || []), ...(data.skills.tools || [])];

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-gray-900 font-serif">
      {/* Header */}
      <header className="text-center border-b border-gray-300 pb-6 mb-8">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">{data.personalInfo?.fullName || 'Your Name'}</h1>
        <div className="flex justify-center space-x-6 text-gray-600">
          {data.personalInfo?.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo?.phone && <span>{data.personalInfo.phone}</span>}
          {data.personalInfo?.location && <span>{data.personalInfo.location}</span>}
        </div>
      </header>

      {/* Summary */}
      {data.personalInfo?.summary && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 uppercase tracking-wide">Summary</h2>
          <p className="text-gray-700 leading-relaxed text-justify">{data.personalInfo.summary}</p>
        </section>
      )}

      {/* Experience */}
      {data.experience?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 uppercase tracking-wide">Experience</h2>
          <div className="space-y-6">
            {data.experience.map((exp, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{exp.title}</h3>
                  <span className="text-gray-600 font-medium">{exp.startDate} - {exp.endDate}</span>
                </div>
                <div className="text-lg font-medium text-gray-700 mb-2">{exp.company}, {exp.location}</div>
                <p className="text-gray-700 mb-2">{exp.description}</p>
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {exp.achievements.map((achievement, i) => (
                      <li key={i}>{achievement}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {data.education?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 uppercase tracking-wide">Education</h2>
          <div className="space-y-4">
            {data.education.map((edu, index) => (
              <div key={index}>
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-900">{edu.degree}</h3>
                  <span className="text-gray-600 font-medium">{edu.startDate} - {edu.endDate}</span>
                </div>
                <div className="text-lg font-medium text-gray-700">{edu.school}, {edu.location}</div>
                {edu.gpa && <div className="text-gray-700">GPA: {edu.gpa}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 uppercase tracking-wide">Skills</h2>
          <div className="text-gray-700">
            {skills.filter(skill => skill).join(' • ')}
          </div>
        </section>
      )}

      {/* Projects */}
      {data.projects?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 uppercase tracking-wide">Projects</h2>
          <div className="space-y-4">
            {data.projects.map((project, index) => (
              <div key={index}>
                <h3 className="text-xl font-bold text-gray-900">{project.title}</h3>
                <p className="text-gray-700">{project.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {data.certifications?.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 uppercase tracking-wide">Certifications</h2>
          <div className="space-y-2">
            {data.certifications.map((cert, index) => (
              <div key={index}>
                <span className="font-bold">{cert.name}</span> - {cert.issuer} ({cert.date})
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export const CreativeTemplate: React.FC<TemplateProps> = ({ data }) => {
  const skills = Array.isArray(data.skills) 
    ? data.skills 
    : [...(data.skills.technical || []), ...(data.skills.soft || []), ...(data.skills.tools || [])];

  return (
    <div className="max-w-4xl mx-auto bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-xl mb-8">
          <h1 className="text-4xl font-bold mb-2">{data.personalInfo?.fullName || 'Your Name'}</h1>
          <div className="flex flex-wrap gap-4 text-purple-100">
            {data.personalInfo?.email && <span>{data.personalInfo.email}</span>}
            {data.personalInfo?.phone && <span>{data.personalInfo.phone}</span>}
            {data.personalInfo?.location && <span>{data.personalInfo.location}</span>}
          </div>
        </header>

        {/* Summary */}
        {data.personalInfo?.summary && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
              About Me
            </h2>
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-lg">
              <p className="text-gray-700 leading-relaxed">{data.personalInfo.summary}</p>
            </div>
          </section>
        )}

        {/* Experience */}
        {data.experience?.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Experience
            </h2>
            <div className="space-y-6">
              {data.experience.map((exp, index) => (
                <div key={index} className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border-l-4 border-purple-500">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{exp.title}</h3>
                    <span className="bg-purple-200 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                      {exp.startDate} - {exp.endDate}
                    </span>
                  </div>
                  <div className="text-lg font-semibold text-purple-700 mb-2">{exp.company} • {exp.location}</div>
                  <p className="text-gray-700 mb-3">{exp.description}</p>
                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {exp.achievements.map((achievement, i) => (
                        <li key={i}>{achievement}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Skills
            </h2>
            <div className="flex flex-wrap gap-3">
              {skills.map((skill, index) => (
                skill && (
                  <span key={index} className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-shadow">
                    {skill}
                  </span>
                )
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {data.education?.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Education
            </h2>
            <div className="space-y-4">
              {data.education.map((edu, index) => (
                <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{edu.degree}</h3>
                    <span className="text-purple-600 font-medium">{edu.startDate} - {edu.endDate}</span>
                  </div>
                  <div className="text-lg text-purple-700 font-medium">{edu.school} • {edu.location}</div>
                  {edu.gpa && <div className="text-gray-700 mt-1">GPA: {edu.gpa}</div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {data.projects?.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.projects.map((project, index) => (
                <div key={index} className="bg-gradient-to-br from-purple-100 to-blue-100 p-4 rounded-lg border border-purple-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{project.title}</h3>
                  <p className="text-gray-700 text-sm">{project.description}</p>
                  {project.technologies && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {project.technologies.map((tech, i) => (
                        <span key={i} className="bg-purple-200 text-purple-800 px-2 py-1 rounded text-xs">
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
      </div>
    </div>
  );
};

export const resumeTemplates = [
  {
    id: 'modern',
    name: 'Modern Professional',
    component: ModernTemplate,
    description: 'Clean and modern design with blue accents'
  },
  {
    id: 'classic',
    name: 'Classic Traditional',
    component: ClassicTemplate,
    description: 'Traditional serif design for conservative industries'
  },
  {
    id: 'creative',
    name: 'Creative Gradient',
    component: CreativeTemplate,
    description: 'Eye-catching design with gradients and colors'
  }
];