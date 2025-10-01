import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

/**
 * Exports resume as PDF with proper formatting
 */
export const exportToPDF = async (resumeData: any): Promise<void> => {
  const doc = new jsPDF();
  let yPosition = 20;
  const lineHeight = 7;
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  const addText = (text: string, fontSize: number = 11, isBold: boolean = false) => {
    if (yPosition > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
    }
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text, contentWidth);
    doc.text(lines, margin, yPosition);
    yPosition += lineHeight * lines.length;
  };

  const addSection = (title: string) => {
    yPosition += 3;
    addText(title, 14, true);
    doc.setDrawColor(51, 51, 51);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 4;
  };

  // Personal Info
  if (resumeData.personalInfo) {
    const pi = resumeData.personalInfo;
    addText(pi.fullName || 'Untitled Resume', 20, true);
    if (pi.professionalTitle) {
      addText(pi.professionalTitle, 12);
    }
    addText(`${pi.email || ''} | ${pi.phone || ''} | ${pi.location || ''}`, 10);
    
    if (pi.summary) {
      yPosition += 3;
      addSection('PROFESSIONAL SUMMARY');
      addText(pi.summary, 10);
    }
  }

  // Experience
  if (resumeData.experience?.length > 0) {
    addSection('WORK EXPERIENCE');
    resumeData.experience.forEach((exp: any) => {
      addText(`${exp.title} at ${exp.company}`, 12, true);
      addText(`${exp.startDate} - ${exp.endDate || 'Present'} | ${exp.location || ''}`, 9);
      if (exp.description) {
        addText(exp.description, 10);
      }
      if (exp.achievements?.length > 0) {
        exp.achievements.forEach((achievement: string) => {
          addText(`• ${achievement}`, 10);
        });
      }
      yPosition += 3;
    });
  }

  // Education
  if (resumeData.education?.length > 0) {
    addSection('EDUCATION');
    resumeData.education.forEach((edu: any) => {
      addText(edu.degree, 12, true);
      addText(`${edu.institution}${edu.location ? ', ' + edu.location : ''}`, 10);
      addText(`${edu.startDate} - ${edu.endDate || 'Present'}`, 9);
      yPosition += 2;
    });
  }

  // Skills
  const allSkills = [];
  if (resumeData.skills) {
    if (Array.isArray(resumeData.skills)) {
      allSkills.push(...resumeData.skills.map((s: any) => typeof s === 'string' ? s : s.name));
    } else if (typeof resumeData.skills === 'object') {
      if (resumeData.skills.technical) allSkills.push(...resumeData.skills.technical);
      if (resumeData.skills.soft) allSkills.push(...resumeData.skills.soft);
      if (resumeData.skills.tools) allSkills.push(...resumeData.skills.tools);
      if (resumeData.skills.languages) allSkills.push(...resumeData.skills.languages);
    }
  }
  
  if (allSkills.length > 0) {
    addSection('SKILLS');
    addText(allSkills.join(' • '), 10);
  }

  // Projects
  if (resumeData.projects?.length > 0) {
    addSection('PROJECTS');
    resumeData.projects.forEach((project: any) => {
      addText(project.name, 12, true);
      if (project.description) {
        addText(project.description, 10);
      }
      if (project.technologies?.length > 0) {
        addText(`Technologies: ${project.technologies.join(', ')}`, 9);
      }
      yPosition += 2;
    });
  }

  const fileName = `${resumeData.personalInfo?.fullName?.replace(/\s+/g, '_') || 'resume'}.pdf`;
  doc.save(fileName);
};

/**
 * Exports resume as DOCX with comprehensive sections
 */
export const exportToDOCX = async (resumeData: any): Promise<void> => {
  const children: any[] = [];

  // Personal Info
  if (resumeData.personalInfo) {
    const pi = resumeData.personalInfo;
    children.push(
      new Paragraph({
        text: pi.fullName || 'Untitled Resume',
        heading: HeadingLevel.TITLE,
        spacing: { after: 100 }
      })
    );

    if (pi.professionalTitle) {
      children.push(
        new Paragraph({
          text: pi.professionalTitle,
          spacing: { after: 100 }
        })
      );
    }

    children.push(
      new Paragraph({
        children: [
          new TextRun(`${pi.email || ''} | ${pi.phone || ''} | ${pi.location || ''}`),
        ],
        spacing: { after: 200 }
      })
    );

    if (pi.summary) {
      children.push(
        new Paragraph({
          text: 'PROFESSIONAL SUMMARY',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        }),
        new Paragraph({
          text: pi.summary,
          spacing: { after: 200 }
        })
      );
    }
  }

  // Experience
  if (resumeData.experience?.length > 0) {
    children.push(
      new Paragraph({
        text: 'WORK EXPERIENCE',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      })
    );

    resumeData.experience.forEach((exp: any) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${exp.title} at ${exp.company}`, bold: true }),
          ],
          spacing: { after: 50 }
        }),
        new Paragraph({
          text: `${exp.startDate} - ${exp.endDate || 'Present'} | ${exp.location || ''}`,
          spacing: { after: 50 }
        })
      );

      if (exp.description) {
        children.push(
          new Paragraph({
            text: exp.description,
            spacing: { after: 100 }
          })
        );
      }

      if (exp.achievements?.length > 0) {
        exp.achievements.forEach((achievement: string) => {
          children.push(
            new Paragraph({
              text: `• ${achievement}`,
              spacing: { after: 50 }
            })
          );
        });
      }

      children.push(
        new Paragraph({
          text: '',
          spacing: { after: 150 }
        })
      );
    });
  }

  // Education
  if (resumeData.education?.length > 0) {
    children.push(
      new Paragraph({
        text: 'EDUCATION',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      })
    );

    resumeData.education.forEach((edu: any) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.degree, bold: true }),
          ],
          spacing: { after: 50 }
        }),
        new Paragraph({
          text: `${edu.institution}${edu.location ? ', ' + edu.location : ''}`,
          spacing: { after: 50 }
        }),
        new Paragraph({
          text: `${edu.startDate} - ${edu.endDate || 'Present'}`,
          spacing: { after: 150 }
        })
      );
    });
  }

  // Skills
  const allSkills: string[] = [];
  if (resumeData.skills) {
    if (Array.isArray(resumeData.skills)) {
      allSkills.push(...resumeData.skills.map((s: any) => typeof s === 'string' ? s : s.name));
    } else if (typeof resumeData.skills === 'object') {
      if (resumeData.skills.technical) allSkills.push(...resumeData.skills.technical);
      if (resumeData.skills.soft) allSkills.push(...resumeData.skills.soft);
      if (resumeData.skills.tools) allSkills.push(...resumeData.skills.tools);
      if (resumeData.skills.languages) allSkills.push(...resumeData.skills.languages);
    }
  }

  if (allSkills.length > 0) {
    children.push(
      new Paragraph({
        text: 'SKILLS',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({
        text: allSkills.join(' • '),
        spacing: { after: 200 }
      })
    );
  }

  // Projects
  if (resumeData.projects?.length > 0) {
    children.push(
      new Paragraph({
        text: 'PROJECTS',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      })
    );

    resumeData.projects.forEach((project: any) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: project.name, bold: true }),
          ],
          spacing: { after: 50 }
        })
      );

      if (project.description) {
        children.push(
          new Paragraph({
            text: project.description,
            spacing: { after: 50 }
          })
        );
      }

      if (project.technologies?.length > 0) {
        children.push(
          new Paragraph({
            text: `Technologies: ${project.technologies.join(', ')}`,
            spacing: { after: 150 }
          })
        );
      }
    });
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children
    }]
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `${resumeData.personalInfo?.fullName?.replace(/\s+/g, '_') || 'resume'}.docx`;
  
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
