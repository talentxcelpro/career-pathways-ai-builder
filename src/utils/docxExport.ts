import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import type { ResumeJSON } from '@/hooks/useResumeParser';

export async function exportResumeToDocx(resume: ResumeJSON, filename = 'resume.docx') {
  const children: Paragraph[] = [];

  const addHeading = (text: string) => children.push(new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text, bold: true, size: 28 })] }));
  const addText = (text: string) => children.push(new Paragraph({ children: [new TextRun({ text, size: 22 })] }));

  // Header
  const name = resume.profile.name || 'Your Name';
  children.push(new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: name, bold: true, size: 36 })] }));
  const contact = [resume.profile.email, resume.profile.phone, resume.profile.location].filter(Boolean).join(' | ');
  if (contact) addText(contact);

  // Summary
  if (resume.summary) {
    addHeading('Summary');
    addText(resume.summary);
  }

  // Experience
  if (resume.experience?.length) {
    addHeading('Experience');
    resume.experience.forEach(exp => {
      addText(`${exp.title || ''} ${exp.company ? ' - ' + exp.company : ''}`.trim());
      exp.bullets?.slice(0, 6).forEach(b => addText('• ' + b));
    });
  }

  // Education
  if (resume.education?.length) {
    addHeading('Education');
    resume.education.forEach(ed => addText(`${ed.degree || ''} ${ed.school ? ' - ' + ed.school : ''} ${ed.year ? '(' + ed.year + ')' : ''}`.trim()));
  }

  // Skills
  if (resume.skills?.length) {
    addHeading('Skills');
    addText(resume.skills.join(', '));
  }

  const doc = new Document({ sections: [{ properties: {}, children }] });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}
