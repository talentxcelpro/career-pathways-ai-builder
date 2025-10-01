import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

/**
 * Exports resume as PDF
 */
export const exportToPDF = async (resumeData: any): Promise<void> => {
  const doc = new jsPDF();
  let yPosition = 20;
  const lineHeight = 7;
  const pageHeight = doc.internal.pageSize.height;

  const addText = (text: string, fontSize: number = 11, isBold: boolean = false) => {
    if (yPosition > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
    }
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.text(text, 20, yPosition);
    yPosition += lineHeight;
  };

  const addSection = (title: string) => {
    yPosition += 3;
    addText(title, 14, true);
    yPosition += 2;
  };

  // Personal Info
  if (resumeData.personalInfo) {
    const pi = resumeData.personalInfo;
    addText(pi.fullName || 'Untitled Resume', 18, true);
    addText(`${pi.email || ''} | ${pi.phone || ''} | ${pi.location || ''}`, 10);
    
    if (pi.summary) {
      yPosition += 3;
      addSection('PROFESSIONAL SUMMARY');
      const summaryLines = doc.splitTextToSize(pi.summary, 170);
      summaryLines.forEach((line: string) => addText(line, 10));
    }
  }

  // Experience
  if (resumeData.experience?.length > 0) {
    addSection('WORK EXPERIENCE');
    resumeData.experience.forEach((exp: any) => {
      addText(`${exp.title} - ${exp.company}`, 12, true);
      addText(`${exp.startDate} - ${exp.endDate || 'Present'} | ${exp.location || ''}`, 9);
      if (exp.description) {
        const descLines = doc.splitTextToSize(exp.description, 170);
        descLines.forEach((line: string) => addText(line, 10));
      }
      yPosition += 2;
    });
  }

  // Education
  if (resumeData.education?.length > 0) {
    addSection('EDUCATION');
    resumeData.education.forEach((edu: any) => {
      addText(`${edu.degree}`, 12, true);
      addText(`${edu.institution} | ${edu.startDate} - ${edu.endDate || 'Present'}`, 10);
      yPosition += 2;
    });
  }

  // Skills
  if (resumeData.skills) {
    const skills = Array.isArray(resumeData.skills) 
      ? resumeData.skills.map((s: any) => typeof s === 'string' ? s : s.name)
      : [];
    if (skills.length > 0) {
      addSection('SKILLS');
      const skillsText = skills.join(' • ');
      const skillLines = doc.splitTextToSize(skillsText, 170);
      skillLines.forEach((line: string) => addText(line, 10));
    }
  }

  const fileName = `${resumeData.personalInfo?.fullName?.replace(/\s+/g, '_') || 'resume'}.pdf`;
  doc.save(fileName);
};

/**
 * Exports resume as DOCX
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
      }),
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
            new TextRun({ text: `${exp.title} - ${exp.company}`, bold: true }),
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
            spacing: { after: 150 }
          })
        );
      }
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
          text: `${edu.institution} | ${edu.startDate} - ${edu.endDate || 'Present'}`,
          spacing: { after: 150 }
        })
      );
    });
  }

  // Skills
  if (resumeData.skills) {
    const skills = Array.isArray(resumeData.skills) 
      ? resumeData.skills.map((s: any) => typeof s === 'string' ? s : s.name)
      : [];
    if (skills.length > 0) {
      children.push(
        new Paragraph({
          text: 'SKILLS',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        }),
        new Paragraph({
          text: skills.join(' • '),
          spacing: { after: 200 }
        })
      );
    }
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
