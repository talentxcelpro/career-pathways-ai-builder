import React from 'react';
import { Code, Database, Globe, GitBranch, Server, Terminal } from 'lucide-react';

interface TemplateProps {
  data: any;
  className?: string;
}

export const TechnicalTemplate: React.FC<TemplateProps> = ({ data, className = '' }) => {
  const personalInfo = data.personalInfo || {};
  const experience = data.experience || [];
  const education = data.education || [];
  const skills = data.skills || [];
  const projects = data.projects || [];
  const certifications = data.certifications || [];
  const awards = data.awards || [];

  // Categorize skills for better organization
  const categorizeSkills = (skillsList: string[]) => {
    const categories = {
      languages: [] as string[],
      frameworks: [] as string[],
      databases: [] as string[],
      tools: [] as string[],
      other: [] as string[]
    };

    const languageKeywords = ['javascript', 'python', 'java', 'typescript', 'go', 'rust', 'c++', 'c#', 'php', 'ruby'];
    const frameworkKeywords = ['react', 'angular', 'vue', 'django', 'flask', 'spring', 'express', 'laravel'];
    const databaseKeywords = ['mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch'];
    const toolKeywords = ['docker', 'kubernetes', 'git', 'jenkins', 'aws', 'azure', 'linux'];

    skillsList.forEach(skill => {
      const lowerSkill = skill.toLowerCase();
      if (languageKeywords.some(lang => lowerSkill.includes(lang))) {
        categories.languages.push(skill);
      } else if (frameworkKeywords.some(fw => lowerSkill.includes(fw))) {
        categories.frameworks.push(skill);
      } else if (databaseKeywords.some(db => lowerSkill.includes(db))) {
        categories.databases.push(skill);
      } else if (toolKeywords.some(tool => lowerSkill.includes(tool))) {
        categories.tools.push(skill);
      } else {
        categories.other.push(skill);
      }
    });

    return categories;
  };

  const skillCategories = categorizeSkills(skills);

  return (
    <div className={`bg-gray-50 ${className}`} style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}>
      {/* Tech Header */}
      <div className="bg-gray-900 text-green-400 p-6">
        <div className="font-mono">
          <div className="text-sm mb-2">{'>'} whoami</div>
          <h1 className="text-3xl font-bold mb-2">
            {personalInfo.fullName || 'developer@localhost'}
          </h1>
          <div className="text-gray-300 space-y-1 text-sm">
            {personalInfo.email && <div>{'>'} echo $EMAIL: {personalInfo.email}</div>}
            {personalInfo.phone && <div>{'>'} echo $PHONE: {personalInfo.phone}</div>}
            {personalInfo.location && <div>{'>'} echo $LOCATION: {personalInfo.location}</div>}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Terminal Summary */}
        {personalInfo.summary && (
          <div className="mb-6">
            <div className="bg-gray-900 rounded-t-lg px-4 py-2 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-green-400" />
              <span className="text-green-400 font-mono text-sm">~/about.md</span>
            </div>
            <div className="bg-gray-800 text-gray-300 p-4 rounded-b-lg font-mono text-sm leading-relaxed">
              <div className="text-green-400 mb-2"># Professional Summary</div>
              <p>{personalInfo.summary}</p>
            </div>
          </div>
        )}

        {/* Technical Skills */}
        {skills.length > 0 && (
          <div className="mb-6">
            <div className="bg-gray-900 rounded-t-lg px-4 py-2 flex items-center gap-2">
              <Code className="h-4 w-4 text-blue-400" />
              <span className="text-blue-400 font-mono text-sm">~/skills.json</span>
            </div>
            <div className="bg-gray-800 text-gray-300 p-4 rounded-b-lg font-mono text-sm">
              <div className="text-yellow-400">{'{'}</div>
              
              {skillCategories.languages.length > 0 && (
                <div className="ml-4 mb-2">
                  <span className="text-green-400">"languages"</span>: [
                  <div className="ml-4">
                    {skillCategories.languages.map((skill, index) => (
                      <div key={index} className="text-orange-400">
                        "{skill}"{index < skillCategories.languages.length - 1 ? ',' : ''}
                      </div>
                    ))}
                  </div>
                  ],
                </div>
              )}

              {skillCategories.frameworks.length > 0 && (
                <div className="ml-4 mb-2">
                  <span className="text-green-400">"frameworks"</span>: [
                  <div className="ml-4">
                    {skillCategories.frameworks.map((skill, index) => (
                      <div key={index} className="text-orange-400">
                        "{skill}"{index < skillCategories.frameworks.length - 1 ? ',' : ''}
                      </div>
                    ))}
                  </div>
                  ],
                </div>
              )}

              {skillCategories.databases.length > 0 && (
                <div className="ml-4 mb-2">
                  <span className="text-green-400">"databases"</span>: [
                  <div className="ml-4">
                    {skillCategories.databases.map((skill, index) => (
                      <div key={index} className="text-orange-400">
                        "{skill}"{index < skillCategories.databases.length - 1 ? ',' : ''}
                      </div>
                    ))}
                  </div>
                  ],
                </div>
              )}

              {skillCategories.tools.length > 0 && (
                <div className="ml-4 mb-2">
                  <span className="text-green-400">"tools"</span>: [
                  <div className="ml-4">
                    {skillCategories.tools.map((skill, index) => (
                      <div key={index} className="text-orange-400">
                        "{skill}"{index < skillCategories.tools.length - 1 ? ',' : ''}
                      </div>
                    ))}
                  </div>
                  ]
                </div>
              )}

              <div className="text-yellow-400">{'}'}</div>
            </div>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="mb-6">
            <div className="bg-gray-900 rounded-t-lg px-4 py-2 flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-purple-400" />
              <span className="text-purple-400 font-mono text-sm">~/experience.log</span>
            </div>
            <div className="bg-gray-800 text-gray-300 p-4 rounded-b-lg font-mono text-sm space-y-4">
              {experience.map((exp: any, index: number) => (
                <div key={index} className="border-l-2 border-purple-400 pl-4">
                  <div className="text-green-400">
                    [{exp.startDate} - {exp.endDate || 'Present'}]
                  </div>
                  <div className="text-white font-bold">
                    {exp.title || exp.position || 'Developer'} @ {exp.company || 'Company'}
                  </div>
                  {exp.description && (
                    <div className="mt-2 text-gray-300 text-xs leading-relaxed">
                      {exp.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="mb-6">
            <div className="bg-gray-900 rounded-t-lg px-4 py-2 flex items-center gap-2">
              <Server className="h-4 w-4 text-cyan-400" />
              <span className="text-cyan-400 font-mono text-sm">~/projects/</span>
            </div>
            <div className="bg-gray-800 text-gray-300 p-4 rounded-b-lg font-mono text-sm space-y-4">
              {projects.map((project: any, index: number) => (
                <div key={index} className="border border-gray-600 rounded p-3">
                  <div className="text-cyan-400 font-bold mb-1">
                    ./{project.title?.toLowerCase().replace(/\s+/g, '-') || 'project'}
                  </div>
                  {project.description && (
                    <div className="text-gray-300 text-xs mb-2">{project.description}</div>
                  )}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech: string, techIndex: number) => (
                        <span
                          key={techIndex}
                          className="bg-gray-700 text-yellow-400 px-2 py-1 rounded text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education & Certifications */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Education */}
          {education.length > 0 && (
            <div>
              <div className="bg-gray-900 rounded-t-lg px-4 py-2 flex items-center gap-2">
                <Database className="h-4 w-4 text-orange-400" />
                <span className="text-orange-400 font-mono text-sm">~/education.db</span>
              </div>
              <div className="bg-gray-800 text-gray-300 p-4 rounded-b-lg font-mono text-sm space-y-3">
                {education.map((edu: any, index: number) => (
                  <div key={index}>
                    <div className="text-orange-400 font-bold">{edu.degree || 'Degree'}</div>
                    <div className="text-gray-300">{edu.school || 'Institution'}</div>
                    {edu.endDate && <div className="text-gray-500 text-xs">{edu.endDate}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div>
              <div className="bg-gray-900 rounded-t-lg px-4 py-2 flex items-center gap-2">
                <Globe className="h-4 w-4 text-red-400" />
                <span className="text-red-400 font-mono text-sm">~/certifications.yml</span>
              </div>
              <div className="bg-gray-800 text-gray-300 p-4 rounded-b-lg font-mono text-sm space-y-2">
                {certifications.map((cert: any, index: number) => (
                  <div key={index}>
                    <div className="text-red-400">- name: "{cert.name}"</div>
                    {cert.issuer && <div className="ml-4 text-gray-300">issuer: "{cert.issuer}"</div>}
                    {cert.date && <div className="ml-4 text-gray-500">date: "{cert.date}"</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};