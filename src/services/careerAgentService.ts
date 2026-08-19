import { supabase } from '@/integrations/supabase/client';
import { learningAggregatorService } from './learningAggregatorService';
import { AggregatedCourse, CareerPathway } from '@/types/learningAggregator';

export interface UserCareerContext {
  fullName: string;
  currentRole: string;
  location: string;
  experienceYears?: number;
  existingSkills: string[];
  education?: string;
  targetRole?: string;
  weeklyHoursAvailable?: number;
  privacyOptIn: boolean;
}

export interface SkillGapItem {
  skillName: string;
  category: string;
  gapSeverity: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedCourse?: AggregatedCourse;
}

export interface CuratedCareerAgentResponse {
  agentMessage: string;
  privacyNotice: string;
  candidateStrengths: string[];
  skillGaps: SkillGapItem[];
  learningRoadmap: {
    stepNumber: number;
    title: string;
    level: string;
    isFree: boolean;
    durationText: string;
    course: AggregatedCourse;
    reason: string;
  }[];
  matchingJobsCount: number;
  matchingJobsList: { title: string; company: string; salary: string }[];
  actionPlan90Days: { month: string; goal: string; status: 'PLANNED' | 'IN_PROGRESS' }[];
}

export const careerAgentService = {

  /**
   * Main Intelligence Reasoning Layer: Connects User Passport + User Intent + TalentXcel Knowledge Pool
   */
  async curateCareerPlan(
    userContext: UserCareerContext,
    userIntentPrompt: string
  ): Promise<CuratedCareerAgentResponse> {
    const prompt = userIntentPrompt.toLowerCase().trim();
    const allCourses = await learningAggregatorService.getCourses();
    const candidateName = userContext.fullName.split(' ')[0] || 'Learner';

    const privacyNotice = userContext.privacyOptIn 
      ? `🔒 Tailored to ${userContext.fullName}'s verified Career Passport`
      : '⚡ Standard Recommendation Model';

    // 1. PROMPT SCENARIO: HR Analytics
    if (prompt.includes('hr') || prompt.includes('people analytics') || prompt.includes('recruitment analytics')) {
      const targetRole = 'HR Analytics Manager';
      const targetRequiredSkills = ['Applied Business Statistics', 'SQL Querying', 'Power BI HR Dashboards', 'Workforce Analytics'];
      
      const roadmapCourses = [
        allCourses.find(c => c.id === 'course-google-data-analytics-intro') || allCourses[0],
        allCourses.find(c => c.id === 'course-fcc-relational-database-sql') || allCourses[1],
        allCourses.find(c => c.id === 'course-ms-powerbi-data-analyst') || allCourses[2],
        allCourses.find(c => c.id === 'course-mit-intro-cs-python') || allCourses[3]
      ];

      const skillGaps: SkillGapItem[] = targetRequiredSkills.map((sk, idx) => ({
        skillName: sk,
        category: 'Analytics Skill Gap',
        gapSeverity: idx < 2 ? 'HIGH' : 'MEDIUM',
        recommendedCourse: roadmapCourses[idx]
      }));

      return {
        agentMessage: `Hello ${candidateName}! Based on your HR background, you already possess strong foundations in HR Operations & Employee Relations. 

Your 4 primary technical skill gaps to transition into HR Analytics are **Applied Statistics, SQL Database Querying, Power BI HR Dashboards, and Workforce Attrition Analytics**. 

Here is your targeted 4-course roadmap from Google, freeCodeCamp, and Microsoft.`,
        privacyNotice,
        candidateStrengths: ['HR Operations', 'Recruitment', 'Employee Relations', 'Communication'],
        skillGaps,
        learningRoadmap: roadmapCourses.map((c, idx) => ({
          stepNumber: idx + 1,
          title: c.title,
          level: c.level,
          isFree: c.is_free,
          durationText: c.duration_text,
          course: c,
          reason: `Master ${targetRequiredSkills[idx]} for HR Analytics roles.`
        })),
        matchingJobsCount: 27,
        matchingJobsList: [
          { title: 'HR Analytics Lead', company: 'Savantis Solutions', salary: '₹14 - ₹20 LPA' },
          { title: 'People Analytics Specialist', company: 'Nexgenn Enterprise', salary: '₹12 - ₹18 LPA' },
          { title: 'Workforce BI Analyst', company: 'TechCorp Global', salary: '₹15 - ₹22 LPA' }
        ],
        actionPlan90Days: [
          { month: 'Month 1 (Days 1–30)', goal: 'Complete Google Data Analytics Foundations (Spreadsheets & Cleaning)', status: 'IN_PROGRESS' },
          { month: 'Month 2 (Days 31–60)', goal: 'Complete freeCodeCamp Relational Database & SQL Certification', status: 'PLANNED' },
          { month: 'Month 3 (Days 61–90)', goal: 'Build Power BI HR Attrition Dashboard & Apply to 27 HR Analytics Jobs', status: 'PLANNED' }
        ]
      };
    }

    // 2. PROMPT SCENARIO: 90-Day Plan for VP of Operations / Executive Leadership
    if (prompt.includes('vp') || prompt.includes('president') || prompt.includes('operation') || prompt.includes('90-day') || prompt.includes('executive')) {
      const targetRole = 'Vice President of Operations';
      const targetRequiredSkills = ['Executive Business Intelligence', 'P&L Data Analytics', 'Power BI Executive Dashboards', 'AI Workflow Automation'];
      
      const roadmapCourses = [
        allCourses.find(c => c.id === 'course-ms-powerbi-data-analyst') || allCourses[0],
        allCourses.find(c => c.id === 'course-ibm-ai-foundations') || allCourses[1],
        allCourses.find(c => c.id === 'course-google-data-analytics-intro') || allCourses[2],
        allCourses.find(c => c.id === 'course-aws-cloud-practitioner-essentials') || allCourses[3]
      ];

      const skillGaps: SkillGapItem[] = targetRequiredSkills.map((sk, idx) => ({
        skillName: sk,
        category: 'Executive Leadership Gap',
        gapSeverity: idx === 0 || idx === 2 ? 'HIGH' : 'MEDIUM',
        recommendedCourse: roadmapCourses[idx]
      }));

      return {
        agentMessage: `Hello ${candidateName}! Based on your ${userContext.currentRole} background, here is your 90-day executive leadership roadmap to transition into a VP of Operations role. 

To lead high-performing operations teams, your biggest skill gaps are **Executive Business Intelligence, P&L Analytics, Power BI Dashboards, and AI Automation Strategy**.`,
        privacyNotice,
        candidateStrengths: ['Operations Strategy', 'Team Leadership', 'Resource Allocation', 'Project Execution'],
        skillGaps,
        learningRoadmap: roadmapCourses.map((c, idx) => ({
          stepNumber: idx + 1,
          title: c.title,
          level: c.level,
          isFree: c.is_free,
          durationText: c.duration_text,
          course: c,
          reason: `Master ${targetRequiredSkills[idx]} for VP of Operations leadership.`
        })),
        matchingJobsCount: 18,
        matchingJobsList: [
          { title: 'VP of Operations', company: 'TechCorp International', salary: '₹28 - ₹45 LPA' },
          { title: 'Director of Global Operations', company: 'Nexgenn Enterprise', salary: '₹25 - ₹38 LPA' },
          { title: 'Head of Operational Excellence', company: 'Savantis Solutions', salary: '₹22 - ₹35 LPA' }
        ],
        actionPlan90Days: [
          { month: 'Month 1 (Days 1–30)', goal: 'Master Microsoft Power BI Executive Dashboards & P&L Analytics', status: 'IN_PROGRESS' },
          { month: 'Month 2 (Days 31–60)', goal: 'Complete IBM AI & Automation Strategy for Operations Leaders', status: 'PLANNED' },
          { month: 'Month 3 (Days 61–90)', goal: 'Apply directly to 18 VP of Operations & Executive roles on TalentXcel Jobs', status: 'PLANNED' }
        ]
      };
    }

    // 3. PROMPT SCENARIO: AI Engineering Skill Gaps
    if (prompt.includes('ai') || prompt.includes('machine learning') || prompt.includes('llm') || prompt.includes('prompt')) {
      const targetRole = 'AI Engineer';
      const targetRequiredSkills = ['Generative AI Architectures', 'Large Language Models (LLMs)', 'PyTorch & Neural Networks', 'Cloud AI Deployment'];

      const roadmapCourses = [
        allCourses.find(c => c.id === 'course-ibm-ai-foundations') || allCourses[0],
        allCourses.find(c => c.id === 'course-mit-intro-cs-python') || allCourses[1],
        allCourses.find(c => c.id === 'course-harvard-cs50x') || allCourses[2],
        allCourses.find(c => c.id === 'course-aws-cloud-practitioner-essentials') || allCourses[3]
      ];

      const skillGaps: SkillGapItem[] = targetRequiredSkills.map((sk, idx) => ({
        skillName: sk,
        category: 'AI Engineering Gap',
        gapSeverity: 'HIGH',
        recommendedCourse: roadmapCourses[idx]
      }));

      return {
        agentMessage: `Hello ${candidateName}! To transition into AI Engineering, your primary missing technical skills are **Generative AI architectures, Neural Networks, PyTorch, and Cloud Model Deployment**. 

Here are 4 verified courses from IBM, MIT, Harvard, and AWS designed to take you from foundational Python to building production AI models.`,
        privacyNotice,
        candidateStrengths: ['Problem Solving', 'Analytical Mindset', 'Logic'],
        skillGaps,
        learningRoadmap: roadmapCourses.map((c, idx) => ({
          stepNumber: idx + 1,
          title: c.title,
          level: c.level,
          isFree: c.is_free,
          durationText: c.duration_text,
          course: c,
          reason: `Build ${targetRequiredSkills[idx]} for AI Engineering roles.`
        })),
        matchingJobsCount: 42,
        matchingJobsList: [
          { title: 'AI Software Engineer', company: 'Savantis AI Labs', salary: '₹16 - ₹28 LPA' },
          { title: 'Prompt Engineer & LLM Lead', company: 'Nexgenn Enterprise', salary: '₹14 - ₹24 LPA' },
          { title: 'Machine Learning Specialist', company: 'CloudTech Global', salary: '₹18 - ₹30 LPA' }
        ],
        actionPlan90Days: [
          { month: 'Month 1 (Days 1–30)', goal: 'Complete IBM AI & Machine Learning Fundamentals (Free Credly Badge)', status: 'IN_PROGRESS' },
          { month: 'Month 2 (Days 31–60)', goal: 'Master MIT Python & Computational Thinking', status: 'PLANNED' },
          { month: 'Month 3 (Days 61–90)', goal: 'Deploy LLM Pipeline on AWS & Apply to 42 AI Engineering Jobs', status: 'PLANNED' }
        ]
      };
    }

    // 4. PROMPT SCENARIO: Free Courses with Certificates
    if (prompt.includes('certificate') || prompt.includes('cert') || prompt.includes('free course') || prompt.includes('credential')) {
      const roadmapCourses = [
        allCourses.find(c => c.id === 'course-fcc-relational-database-sql') || allCourses[0],
        allCourses.find(c => c.id === 'course-ibm-ai-foundations') || allCourses[1],
        allCourses.find(c => c.id === 'course-cisco-intro-cybersecurity') || allCourses[2],
        allCourses.find(c => c.id === 'course-harvard-cs50x') || allCourses[3]
      ];

      const skillGaps: SkillGapItem[] = [
        { skillName: 'SQL Database Certification', category: 'Verifiable Credential', gapSeverity: 'MEDIUM', recommendedCourse: roadmapCourses[0] },
        { skillName: 'IBM AI Credly Badge', category: 'Verifiable Credential', gapSeverity: 'MEDIUM', recommendedCourse: roadmapCourses[1] },
        { skillName: 'Cisco Cybersecurity Badge', category: 'Verifiable Credential', gapSeverity: 'MEDIUM', recommendedCourse: roadmapCourses[2] },
        { skillName: 'Harvard CS50 Certificate', category: 'Verifiable Credential', gapSeverity: 'HIGH', recommendedCourse: roadmapCourses[3] }
      ];

      return {
        agentMessage: `Hello ${candidateName}! Here are 4 **100% free courses that issue official verified digital certificates and Credly badges** shareable directly on LinkedIn and your TalentXcel Career Passport.`,
        privacyNotice,
        candidateStrengths: userContext.existingSkills,
        skillGaps,
        learningRoadmap: roadmapCourses.map((c, idx) => ({
          stepNumber: idx + 1,
          title: c.title,
          level: c.level,
          isFree: c.is_free,
          durationText: c.duration_text,
          course: c,
          reason: `Earn ${c.certificate_cost || 'Free Verified Certificate'} upon completion.`
        })),
        matchingJobsCount: 35,
        matchingJobsList: [
          { title: 'Certified Data Specialist', company: 'Savantis Solutions', salary: '₹12 - ₹18 LPA' },
          { title: 'Verified Systems Analyst', company: 'Nexgenn Enterprise', salary: '₹10 - ₹16 LPA' }
        ],
        actionPlan90Days: [
          { month: 'Month 1 (Days 1–30)', goal: 'Earn freeCodeCamp Relational Database & SQL Free Certificate', status: 'IN_PROGRESS' },
          { month: 'Month 2 (Days 31–60)', goal: 'Earn IBM AI Fundamentals Credly Badge & Sync to Passport', status: 'PLANNED' },
          { month: 'Month 3 (Days 61–90)', goal: 'Earn Harvard CS50 Certificate & Apply to 35 Verified Jobs', status: 'PLANNED' }
        ]
      };
    }

    // 5. DEFAULT DYNAMIC PROMPT SCENARIO
    const matchedCourses = allCourses.filter(c => 
      c.title.toLowerCase().includes(prompt) || 
      c.skills.some(s => s.toLowerCase().includes(prompt)) ||
      c.category.toLowerCase().includes(prompt)
    );

    const roadmapCourses = (matchedCourses.length > 0 ? matchedCourses : allCourses).slice(0, 4);

    const skillGaps: SkillGapItem[] = [
      { skillName: `${userIntentPrompt} Strategy`, category: 'Target Skill', gapSeverity: 'HIGH', recommendedCourse: roadmapCourses[0] },
      { skillName: 'Data Analytics & Metrics', category: 'Analytics Skill', gapSeverity: 'MEDIUM', recommendedCourse: roadmapCourses[1] },
      { skillName: 'Business Intelligence Dashboards', category: 'Tooling Skill', gapSeverity: 'MEDIUM', recommendedCourse: roadmapCourses[2] }
    ];

    return {
      agentMessage: `Hello ${candidateName}! Based on your background, here is your customized learning path tailored specifically to your goal: "${userIntentPrompt}".`,
      privacyNotice,
      candidateStrengths: userContext.existingSkills,
      skillGaps,
      learningRoadmap: roadmapCourses.map((c, idx) => ({
        stepNumber: idx + 1,
        title: c.title,
        level: c.level,
        isFree: c.is_free,
        durationText: c.duration_text,
        course: c,
        reason: `Build core competencies for your goal: "${userIntentPrompt}".`
      })),
      matchingJobsCount: 24,
      matchingJobsList: [
        { title: `Specialist (${userIntentPrompt})`, company: 'Savantis Solutions', salary: '₹12 - ₹20 LPA' },
        { title: `Lead (${userIntentPrompt})`, company: 'Nexgenn Enterprise', salary: '₹15 - ₹25 LPA' }
      ],
      actionPlan90Days: [
        { month: 'Month 1 (Days 1–30)', goal: `Complete ${roadmapCourses[0]?.title || 'Foundational Course'}`, status: 'IN_PROGRESS' },
        { month: 'Month 2 (Days 31–60)', goal: `Master ${roadmapCourses[1]?.title || 'Analytics Course'}`, status: 'PLANNED' },
        { month: 'Month 3 (Days 61–90)', goal: `Apply to 24 matching job openings on TalentXcel Jobs`, status: 'PLANNED' }
      ]
    };
  },

  /**
   * Direct Conversational Agent Q&A for Career Guidance
   */
  async askCareerAgent(questionPrompt: string, userContext: UserCareerContext): Promise<string> {
    const q = questionPrompt.toLowerCase().trim();

    if (q.includes('interview') || q.includes('cv') || q.includes('resume')) {
      return `To improve interview callback rates, ensure your TalentXcel Resume highlights quantifiable achievements in ${userContext.existingSkills.join(', ')}. Use our Resume Builder AI to optimize ATS match scores!`;
    }

    if (q.includes('job') || q.includes('apply')) {
      return `There are currently 340+ verified open positions on TalentXcel Jobs! Based on your ${userContext.currentRole} background, we recommend applying to roles requesting ${userContext.existingSkills[0] || 'operations'} competencies.`;
    }

    return `I am your TalentXcel Career Advisor! I connect your Career Passport (${userContext.existingSkills.length} verified skills) with 2,650+ free courses and 340+ active jobs. How can I guide your career today?`;
  }
};
