import { toast } from 'sonner';
import type { ResumeData } from '@/components/resume/preview/ResumePreview';

export const exportToPDF = async (resumeData: ResumeData, filename: string = 'resume.pdf') => {
  try {
    toast.loading('Generating PDF...', { id: 'pdf-export' });

    // For now, we'll use a simple HTML to PDF approach
    // In production, this would integrate with a proper PDF generation service
    
    // Create a printable HTML version
    const htmlContent = generatePrintableHTML(resumeData);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Could not open print window. Please allow popups.');
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load
    printWindow.onload = () => {
      // Trigger print dialog
      printWindow.print();
      
      // Close the window after printing
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    };

    toast.success('PDF print dialog opened!', { id: 'pdf-export' });
    
  } catch (error) {
    console.error('PDF export failed:', error);
    toast.error(`PDF export failed: ${error.message}`, { id: 'pdf-export' });
    throw error;
  }
};

function generatePrintableHTML(resumeData: ResumeData): string {
  const formatDate = (date: string) => {
    if (!date) return '';
    try {
      return new Date(date).toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
    } catch {
      return date;
    }
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${resumeData.profile.name || 'Resume'}</title>
      <style>
        @media print {
          @page {
            margin: 0.5in;
            size: A4;
          }
          body {
            margin: 0;
            padding: 0;
          }
        }
        
        body {
          font-family: 'Arial', sans-serif;
          font-size: 11pt;
          line-height: 1.4;
          color: #333;
          max-width: 8.5in;
          margin: 0 auto;
          padding: 20px;
        }
        
        .header {
          text-align: center;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        
        .name {
          font-size: 24pt;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 5px;
        }
        
        .contact {
          font-size: 10pt;
          color: #666;
        }
        
        .section {
          margin-bottom: 18px;
        }
        
        .section-title {
          font-size: 14pt;
          font-weight: bold;
          color: #1e40af;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 3px;
          margin-bottom: 10px;
        }
        
        .experience-item, .education-item, .project-item {
          margin-bottom: 12px;
        }
        
        .job-title {
          font-weight: bold;
          font-size: 12pt;
        }
        
        .company {
          color: #2563eb;
          font-weight: 500;
        }
        
        .date {
          float: right;
          font-size: 10pt;
          color: #666;
        }
        
        .bullets {
          margin: 5px 0 0 20px;
        }
        
        .bullets li {
          margin-bottom: 3px;
        }
        
        .skills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .skill-tag {
          background-color: #f3f4f6;
          border: 1px solid #d1d5db;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 10pt;
        }
        
        .two-column {
          display: flex;
          justify-content: space-between;
        }
        
        .clearfix::after {
          content: "";
          display: table;
          clear: both;
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header">
        <div class="name">${resumeData.profile.name || 'Your Name'}</div>
        <div class="contact">
          ${[
            resumeData.profile.email,
            resumeData.profile.phone,
            resumeData.profile.location,
            resumeData.profile.website,
            resumeData.profile.linkedin
          ].filter(Boolean).join(' • ')}
        </div>
      </div>

      <!-- Professional Summary -->
      ${resumeData.summary ? `
        <div class="section">
          <div class="section-title">Professional Summary</div>
          <p>${resumeData.summary}</p>
        </div>
      ` : ''}

      <!-- Experience -->
      ${resumeData.experience.length > 0 ? `
        <div class="section">
          <div class="section-title">Professional Experience</div>
          ${resumeData.experience.map(exp => `
            <div class="experience-item clearfix">
              <div class="job-title">${exp.title || 'Job Title'}</div>
              <div class="date">${formatDate(exp.startDate || '')} - ${exp.current ? 'Present' : formatDate(exp.endDate || '')}</div>
              <div class="company">${exp.company || 'Company Name'}</div>
              ${exp.bullets && exp.bullets.length > 0 ? `
                <ul class="bullets">
                  ${exp.bullets.map(bullet => `<li>${bullet}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Education -->
      ${resumeData.education.length > 0 ? `
        <div class="section">
          <div class="section-title">Education</div>
          ${resumeData.education.map(edu => `
            <div class="education-item clearfix">
              <div class="job-title">${edu.degree || 'Degree'}</div>
              <div class="date">${edu.year || 'Year'}</div>
              <div class="company">${edu.school || 'Institution'}</div>
              ${edu.gpa ? `<div>GPA: ${edu.gpa}</div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Projects -->
      ${resumeData.projects && resumeData.projects.length > 0 ? `
        <div class="section">
          <div class="section-title">Projects</div>
          ${resumeData.projects.map(project => `
            <div class="project-item">
              <div class="job-title">${project.name || 'Project Name'}</div>
              ${project.description ? `<p>${project.description}</p>` : ''}
              ${project.technologies && project.technologies.length > 0 ? `
                <div class="skills">
                  ${project.technologies.map(tech => `<span class="skill-tag">${tech}</span>`).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Skills -->
      ${resumeData.skills && resumeData.skills.length > 0 ? `
        <div class="section">
          <div class="section-title">Skills</div>
          <div class="skills">
            ${resumeData.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Certifications -->
      ${resumeData.certifications && resumeData.certifications.length > 0 ? `
        <div class="section">
          <div class="section-title">Certifications</div>
          ${resumeData.certifications.map(cert => `
            <div class="experience-item clearfix">
              <div class="job-title">${cert.name}</div>
              <div class="date">${formatDate(cert.date || '')}</div>
              <div class="company">${cert.issuer}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Languages -->
      ${resumeData.languages && resumeData.languages.length > 0 ? `
        <div class="section">
          <div class="section-title">Languages</div>
          ${resumeData.languages.map(lang => `
            <div class="two-column">
              <span>${lang.language}</span>
              <span>${lang.proficiency}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Awards -->
      ${resumeData.awards && resumeData.awards.length > 0 ? `
        <div class="section">
          <div class="section-title">Awards & Achievements</div>
          ${resumeData.awards.map(award => `
            <div class="experience-item clearfix">
              <div class="job-title">${award.title}</div>
              <div class="date">${formatDate(award.date || '')}</div>
              <div class="company">${award.organization}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </body>
    </html>
  `;
}