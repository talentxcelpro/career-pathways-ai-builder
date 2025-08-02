import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';

export const exportToPDF = async (elementId: string, filename: string = 'resume.pdf') => {
  try {
    console.log('Starting PDF export for element:', elementId);
    
    const element = document.getElementById(elementId);
    if (!element) {
      console.error('Element not found:', elementId);
      throw new Error(`Resume preview element not found. Please ensure the resume is displayed before exporting.`);
    }

    // Check if element is visible
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      console.error('Element has no dimensions:', rect);
      throw new Error('Resume preview is not visible. Please ensure the resume is properly displayed.');
    }

    console.log('Element found, dimensions:', rect);

    // Load html2canvas and jsPDF dynamically
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf')
    ]);

    console.log('Generating canvas from element...');
    toast.loading('Generating PDF...', { id: 'pdf-export' });

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: rect.width,
      height: rect.height,
      windowWidth: rect.width,
      windowHeight: rect.height
    });

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error('Failed to generate canvas from resume. Please try again.');
    }

    console.log('Canvas generated successfully:', canvas.width, 'x', canvas.height);

    const imgData = canvas.toDataURL('image/png', 0.95);
    if (!imgData || imgData === 'data:,') {
      throw new Error('Failed to generate image data from canvas.');
    }

    console.log('Creating PDF document...');
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm minus margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if content is longer than one page
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    console.log('Saving PDF...');
    pdf.save(filename);
    
    toast.success('PDF exported successfully!', { id: 'pdf-export' });
    console.log('PDF export completed successfully');

  } catch (error) {
    console.error('PDF export failed:', error);
    toast.error(`PDF export failed: ${error.message}`, { id: 'pdf-export' });
    throw error;
  }
};

export const exportToDOCX = async (resumeData: any, filename: string = 'resume.docx') => {
  try {
    console.log('Starting DOCX export with data:', resumeData);
    toast.loading('Generating DOCX...', { id: 'docx-export' });

    // Validate input data
    if (!resumeData) {
      throw new Error('No resume data provided for export.');
    }

    // Load required libraries
    if (typeof Document !== 'function' || typeof Packer !== 'function') {
      throw new Error('DOCX generation libraries not loaded. Please refresh the page and try again.');
    }

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

    console.log('Generating DOCX buffer...');
    const buffer = await Packer.toBuffer(doc);
    
    if (!buffer || buffer.byteLength === 0) {
      throw new Error('Failed to generate DOCX document.');
    }

    console.log('Creating blob and saving file...');
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    
    if (typeof saveAs !== 'function') {
      throw new Error('File saver not available. Please refresh the page and try again.');
    }
    
    saveAs(blob, filename);
    
    toast.success('DOCX exported successfully!', { id: 'docx-export' });
    console.log('DOCX export completed successfully');

  } catch (error) {
    console.error('DOCX export failed:', error);
    toast.error(`DOCX export failed: ${error.message}`, { id: 'docx-export' });
    throw error;
  }
};