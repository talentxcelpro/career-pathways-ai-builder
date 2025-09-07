export interface VCardData {
  fullName: string;
  title?: string;
  organization?: string;
  email?: string;
  phone?: string;
  website?: string;
  note?: string;
  address?: string;
  location?: string;
}

export function downloadVCard(data: VCardData, filename: string = 'contact.vcf') {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${escapeVCard(data.fullName)}`,
    data.title ? `TITLE:${escapeVCard(data.title)}` : '',
    data.organization ? `ORG:${escapeVCard(data.organization)}` : '',
    data.email ? `EMAIL;TYPE=INTERNET:${escapeVCard(data.email)}` : '',
    data.phone ? `TEL;TYPE=CELL:${escapeVCard(data.phone)}` : '',
    data.website ? `URL:${escapeVCard(data.website)}` : '',
    data.address ? `ADR;TYPE=WORK:;;${escapeVCard(data.address)}` : '',
    data.location ? `NOTE:Location - ${escapeVCard(data.location)}` : '',
    data.note ? `NOTE:${escapeVCard(data.note)}` : '',
    'END:VCARD'
  ].filter(Boolean);

  const blob = new Blob([lines.join('\n')], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapeVCard(text: string) {
  return text.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}
