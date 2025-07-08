// @ts-ignore
import jsPDF from 'jspdf';
// @ts-ignore
import html2canvas from 'html2canvas';
// @ts-ignore
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
// @ts-ignore
import { saveAs } from 'file-saver';

export const exportToPDF = async (elementId: string, filename: string = 'resume.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) throw new Error('Element not found');

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff'
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const imgWidth = 210;
  const pageHeight = 295;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;

  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(filename);
};

export const exportToDOCX = async (resumeData: any, filename: string = 'resume.docx') => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Personal Info
        new Paragraph({
          children: [
            new TextRun({
              text: resumeData.personalInfo?.fullName || 'Name',
              bold: true,
              size: 32
            }),
          ],
          heading: HeadingLevel.TITLE,
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `${resumeData.personalInfo?.email || ''} | ${resumeData.personalInfo?.phone || ''} | ${resumeData.personalInfo?.location || ''}`,
              size: 20
            }),
          ],
        }),
        
        // Summary
        ...(resumeData.personalInfo?.summary ? [
          new Paragraph({
            children: [new TextRun({ text: 'Professional Summary', bold: true, size: 24 })],
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [new TextRun({ text: resumeData.personalInfo.summary, size: 20 })],
          }),
        ] : []),

        // Experience
        ...(resumeData.experience?.length > 0 ? [
          new Paragraph({
            children: [new TextRun({ text: 'Experience', bold: true, size: 24 })],
            heading: HeadingLevel.HEADING_1,
          }),
          ...resumeData.experience.flatMap((exp: any) => [
            new Paragraph({
              children: [
                new TextRun({ text: `${exp.position || ''} at ${exp.company || ''}`, bold: true, size: 22 }),
                new TextRun({ text: ` (${exp.startDate || ''} - ${exp.endDate || ''})`, size: 20 }),
              ],
            }),
            new Paragraph({
              children: [new TextRun({ text: exp.description || '', size: 20 })],
            }),
          ])
        ] : []),

        // Education
        ...(resumeData.education?.length > 0 ? [
          new Paragraph({
            children: [new TextRun({ text: 'Education', bold: true, size: 24 })],
            heading: HeadingLevel.HEADING_1,
          }),
          ...resumeData.education.flatMap((edu: any) => [
            new Paragraph({
              children: [
                new TextRun({ text: `${edu.degree || ''} - ${edu.school || ''}`, bold: true, size: 22 }),
                new TextRun({ text: ` (${edu.startDate || ''} - ${edu.endDate || ''})`, size: 20 }),
              ],
            }),
          ])
        ] : []),

        // Skills
        ...(resumeData.skills?.length > 0 ? [
          new Paragraph({
            children: [new TextRun({ text: 'Skills', bold: true, size: 24 })],
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [new TextRun({ text: resumeData.skills.join(', '), size: 20 })],
          }),
        ] : []),

        // Projects
        ...(resumeData.projects?.length > 0 ? [
          new Paragraph({
            children: [new TextRun({ text: 'Projects', bold: true, size: 24 })],
            heading: HeadingLevel.HEADING_1,
          }),
          ...resumeData.projects.flatMap((project: any) => [
            new Paragraph({
              children: [new TextRun({ text: project.title || '', bold: true, size: 22 })],
            }),
            new Paragraph({
              children: [new TextRun({ text: project.description || '', size: 20 })],
            }),
          ])
        ] : []),

        // Certifications
        ...(resumeData.certifications?.length > 0 ? [
          new Paragraph({
            children: [new TextRun({ text: 'Certifications', bold: true, size: 24 })],
            heading: HeadingLevel.HEADING_1,
          }),
          ...resumeData.certifications.map((cert: any) => 
            new Paragraph({
              children: [new TextRun({ text: `${cert.name || ''} - ${cert.issuer || ''} (${cert.date || ''})`, size: 20 })],
            })
          )
        ] : []),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  saveAs(blob, filename);
};