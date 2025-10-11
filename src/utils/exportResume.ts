import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';

export const exportToPDF = async (elementId: string, filename: string = 'resume.pdf') => {
  try {
    // Import the new PDF export utility
    const { exportToPDF: exportToPDFUtil } = await import('@/utils/pdfExport');
    
    // Note: This is a fallback - in a real implementation, we'd pass the resume data
    // For now, we'll show the improved message
    toast.info('Please use the Export panel in the resume builder for PDF generation with proper formatting.');
    console.log('PDF export requested for element:', elementId);
    
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
    const blob = new Blob([new Uint8Array(buffer)], { 
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