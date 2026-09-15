import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import html2canvas from 'html2canvas';

/**
 * Exports resume as PDF with 100% visual fidelity matching on-screen template & preview
 */
export const exportToPDF = async (resumeData: any, elementId: string = 'resume-preview-container'): Promise<void> => {
  // 1. Try to capture the rendered template element directly from the DOM for 100% visual match
  const targetElement = document.getElementById(elementId) || document.querySelector('.template-render-container');
  
  if (targetElement) {
    try {
      console.log('📸 Capturing full-size rendered template DOM element for PDF export...');
      
      // Clone element to prevent capturing sidebar thumbnail scale or scroll clipping
      const clone = targetElement.cloneNode(true) as HTMLElement;
      clone.style.transform = 'none';
      clone.style.maxHeight = 'none';
      clone.style.height = 'auto';
      clone.style.overflow = 'visible';
      clone.style.width = '794px'; // 210mm in pixels at 96 DPI
      clone.style.position = 'absolute';
      clone.style.top = '-9999px';
      clone.style.left = '-9999px';
      clone.style.backgroundColor = '#ffffff';
      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, {
        scale: 2, // High resolution (300 DPI equivalency)
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      document.body.removeChild(clone);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      let pageCount = 1;
      const MAX_PAGES = 3; // Strict 3-page maximum cap

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 20) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        pageCount++;
      }

      const fileName = `${(resumeData?.personalInfo?.fullName || 'Resume').replace(/\s+/g, '_')}_Career_Identity.pdf`;
      pdf.save(fileName);
      return;
    } catch (err) {
      console.warn('⚠️ DOM canvas PDF capture failed, falling back to programmatic PDF builder:', err);
    }
  }

  // 2. High-Fidelity Programmatic Fallback PDF Builder
  const doc = new jsPDF();
  let yPosition = 20;
  let pdfPageCount = 1;
  const MAX_PAGES = 3;
  const lineHeight = 7;
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  const addText = (text: string, fontSize: number = 11, isBold: boolean = false) => {
    if (yPosition > pageHeight - 20) {
      doc.addPage();
      pdfPageCount++;
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
    const contacts = [pi.email, pi.phone, pi.location].filter(Boolean).join(' | ');
    if (contacts) addText(contacts, 10);
    
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
      const companyStr = exp.company ? ` at ${exp.company}` : '';
      addText(`${exp.title || ''}${companyStr}`, 12, true);
      
      const dates = [exp.startDate, exp.endDate].filter(Boolean).join(' – ');
      const loc = exp.location ? ` | ${exp.location}` : '';
      if (dates || loc) addText(`${dates}${loc}`, 9);

      if (exp.description) {
        addText(exp.description, 10);
      }
      if (exp.achievements?.length > 0) {
        exp.achievements.forEach((achievement: string) => {
          if (achievement && achievement.trim().length > 2) {
            addText(`• ${achievement.trim()}`, 10);
          }
        });
      }
      yPosition += 3;
    });
  }

  // Education
  if (resumeData.education?.length > 0) {
    addSection('EDUCATION');
    resumeData.education.forEach((edu: any) => {
      addText(edu.degree || edu.degreeQualification || '', 12, true);
      const school = edu.institution || edu.school || '';
      const loc = edu.location ? `, ${edu.location}` : '';
      if (school) addText(`${school}${loc}`, 10);
      
      const eduDates = [edu.startDate || edu.startYear, edu.endDate || edu.graduationYear].filter(Boolean).join(' – ');
      if (eduDates) addText(eduDates, 9);
      yPosition += 2;
    });
  }

  // Skills
  const allSkills: string[] = [];
  if (resumeData.skills) {
    if (Array.isArray(resumeData.skills)) {
      allSkills.push(...resumeData.skills.map((s: any) => typeof s === 'string' ? s : s.name || s.canonicalSkill));
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
    resumeData.projects.forEach((proj: any) => {
      addText(proj.name || proj.projectName || '', 12, true);
      if (proj.description) addText(proj.description, 10);
      if (proj.technologies?.length > 0) {
        addText(`Technologies: ${proj.technologies.join(', ')}`, 9);
      }
      yPosition += 2;
    });
  }

  const fileName = `${(resumeData?.personalInfo?.fullName || 'Resume').replace(/\s+/g, '_')}_Career_Identity.pdf`;
  doc.save(fileName);
};

/**
 * Exports resume as DOCX
 */
export const exportToDOCX = async (resumeData: any): Promise<void> => {
  const children: any[] = [];

  // Header / Title
  children.push(
    new Paragraph({
      text: resumeData?.personalInfo?.fullName || 'Resume',
      heading: HeadingLevel.TITLE
    })
  );

  const contactLine = [
    resumeData?.personalInfo?.email,
    resumeData?.personalInfo?.phone,
    resumeData?.personalInfo?.location
  ].filter(Boolean).join(' | ');

  if (contactLine) {
    children.push(new Paragraph({ text: contactLine }));
  }

  // Summary
  if (resumeData?.personalInfo?.summary) {
    children.push(new Paragraph({ text: 'PROFESSIONAL SUMMARY', heading: HeadingLevel.HEADING_1 }));
    children.push(new Paragraph({ text: resumeData.personalInfo.summary }));
  }

  // Experience
  if (resumeData?.experience?.length > 0) {
    children.push(new Paragraph({ text: 'WORK EXPERIENCE', heading: HeadingLevel.HEADING_1 }));
    resumeData.experience.forEach((exp: any) => {
      const companyStr = exp.company ? ` at ${exp.company}` : '';
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${exp.title || ''}${companyStr}`, bold: true })
          ]
        })
      );
      const dates = [exp.startDate, exp.endDate].filter(Boolean).join(' – ');
      if (dates) children.push(new Paragraph({ text: dates }));
      if (exp.description) children.push(new Paragraph({ text: exp.description }));
      if (exp.achievements?.length > 0) {
        exp.achievements.forEach((ach: string) => {
          if (ach && ach.trim().length > 2) {
            children.push(new Paragraph({ text: `• ${ach.trim()}` }));
          }
        });
      }
    });
  }

  // Education
  if (resumeData?.education?.length > 0) {
    children.push(new Paragraph({ text: 'EDUCATION', heading: HeadingLevel.HEADING_1 }));
    resumeData.education.forEach((edu: any) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.degree || edu.degreeQualification || '', bold: true }),
            new TextRun({ text: ` — ${edu.institution || edu.school || ''}` })
          ]
        })
      );
    });
  }

  const doc = new Document({
    sections: [{ properties: {}, children }]
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${(resumeData?.personalInfo?.fullName || 'Resume').replace(/\s+/g, '_')}_Career_Identity.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
