// AI Fallback functionality for resume parsing
// This provides basic text extraction when AI services are unavailable

export interface AIFallbackResult {
  success: boolean;
  extractedText?: string;
  basicInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    skills?: string[];
  };
  error?: string;
}

export async function fallbackTextExtraction(text: string): Promise<AIFallbackResult> {
  try {
    // Basic text cleaning
    const cleanText = text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s@.-]/g, ' ')
      .trim();

    // Extract basic information using regex patterns
    const emailMatch = cleanText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    const phoneMatch = cleanText.match(/(\+?[\d\s\-\(\)]{10,})/);
    
    // Extract potential name (first few words, typically)
    const words = cleanText.split(' ').filter(word => word.length > 1);
    const potentialName = words.slice(0, 3).join(' ');

    // Extract skills using common tech keywords
    const skillKeywords = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'HTML', 'CSS',
      'TypeScript', 'Angular', 'Vue', 'PHP', 'C++', 'C#', 'Ruby', 'Go',
      'Docker', 'AWS', 'Azure', 'GCP', 'Kubernetes', 'Git', 'MongoDB', 'PostgreSQL'
    ];
    
    const foundSkills = skillKeywords.filter(skill => 
      cleanText.toLowerCase().includes(skill.toLowerCase())
    );

    return {
      success: true,
      extractedText: cleanText,
      basicInfo: {
        name: potentialName,
        email: emailMatch?.[0],
        phone: phoneMatch?.[0]?.replace(/\s/g, ''),
        skills: foundSkills
      }
    };

  } catch (error) {
    return {
      success: false,
      error: `Fallback extraction failed: ${error.message}`
    };
  }
}

export function createFallbackProfile(basicInfo: any, filename: string) {
  return {
    personal: {
      full_name: basicInfo.name || filename.replace(/\.[^/.]+$/, ""),
      email: basicInfo.email || null,
      phone: basicInfo.phone || null,
      location: null
    },
    professional: {
      title: "Professional",
      summary: "Profile extracted from CV upload",
      skills: basicInfo.skills || [],
      experience: [],
      education: []
    },
    metadata: {
      extraction_method: "fallback",
      confidence_score: 0.5,
      requires_review: true
    }
  };
}