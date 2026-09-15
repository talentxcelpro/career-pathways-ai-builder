/**
 * Utility to generate and trigger download of a standard vCard (.vcf) file
 * Works universally for any TalentXcel profile.
 */

export interface VCardProfileData {
  fullName: string;
  title?: string | null;
  headline?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  location?: string | null;
  linkedin?: string | null;
  organization?: string | null;
}

export function generateAndDownloadVCard(profile: VCardProfileData): void {
  if (!profile || !profile.fullName) {
    throw new Error('Profile full name is required for vCard generation');
  }

  const nameParts = profile.fullName.trim().split(/\s+/);
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
  const firstName = nameParts[0] || "";

  const vCardLines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${lastName};${firstName};;;`,
    `FN:${profile.fullName.trim()}`,
  ];

  if (profile.organization) {
    vCardLines.push(`ORG:${profile.organization.trim()}`);
  }
  if (profile.title || profile.headline) {
    vCardLines.push(`TITLE:${(profile.title || profile.headline || "").trim()}`);
  }
  if (profile.email) {
    vCardLines.push(`EMAIL;TYPE=INTERNET,WORK:${profile.email.trim()}`);
  }
  if (profile.phone) {
    vCardLines.push(`TEL;TYPE=CELL,VOICE:${profile.phone.trim()}`);
  }
  if (profile.website) {
    vCardLines.push(`URL:${profile.website.trim()}`);
  }
  if (profile.linkedin) {
    vCardLines.push(`URL;TYPE=LinkedIn:${profile.linkedin.trim()}`);
  }
  if (profile.location) {
    vCardLines.push(`ADR;TYPE=WORK:;;${profile.location.trim()};;;;`);
  }

  vCardLines.push("END:VCARD");

  const vCardString = vCardLines.join("\r\n");
  const blob = new Blob([vCardString], { type: "text/vcard;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  const fileName = `${profile.fullName.replace(/\s+/g, "_")}_TalentXcel.vcf`;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
