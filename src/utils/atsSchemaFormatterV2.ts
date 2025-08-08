// Safer formatter variant with github + dob support
export const safeString = (v: any, fallback = "") =>
  typeof v === "string" && v.trim() !== "" ? v.trim() : fallback;

export const safeDateString = (v: any) => {
  if (!v) return "";
  const d = new Date(v);
  return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
};

export const formatToAtsSchema = (raw: any = {}) => {
  const profile = raw.profile || raw.personalInfo || {};
  return {
    ats: {
      profile: {
        fullName: safeString(profile.fullName || profile.name, "Full Name Not Provided"),
        email: safeString(profile.email, "Email Not Provided"),
        phone: safeString(profile.phone, "Phone Not Provided"),
        location: safeString(profile.location, "Location Not Provided"),
        linkedin: safeString(profile.linkedin),
        portfolio: safeString(profile.portfolio),
        github: safeString(profile.github),
        dob: safeDateString(profile.dob),
      },
      summary: safeString(raw.summary, "Professional summary not available."),
      experience: Array.isArray(raw.experience) ? raw.experience : [],
      education: Array.isArray(raw.education) ? raw.education : [],
      skills: Array.isArray(raw.skills) ? raw.skills : [],
      certifications: Array.isArray(raw.certifications) ? raw.certifications : [],
      projects: Array.isArray(raw.projects) ? raw.projects : [],
      awards: Array.isArray(raw.awards) ? raw.awards : [],
      languages: Array.isArray(raw.languages) ? raw.languages : [],
      interests: Array.isArray(raw.interests) ? raw.interests : [],
    },
  } as const;
};
