// src/components/products/jobmatch/CareerResourcesSection.tsx
// Comprehensive Public Career Intelligence & Preparation Guides
// Master Light SaaS Design System (#FFFFFF, #F4F7FC, #2563EB, #7138E8, #111827, #E2E8F0)

import React, { useState } from 'react';
import { 
  FileText, 
  GraduationCap, 
  DollarSign, 
  TrendingUp, 
  Send, 
  Cpu, 
  Compass, 
  ArrowRight, 
  CheckCircle2, 
  BookOpen, 
  Sparkles, 
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export interface CareerGuide {
  id: string;
  slug: string;
  title: string;
  category: string;
  readTime: string;
  icon: any;
  summary: string;
  keyTakeaways: string[];
  fullContent: {
    overview: string;
    sections: { heading: string; points: string[] }[];
    actionableChecklist: string[];
  };
}

export const CAREER_GUIDES: CareerGuide[] = [
  {
    id: 'guide-ats-resume',
    slug: 'ats-resume-optimization',
    title: 'ATS Resume Writing & Score Optimization',
    category: 'Resume & Applications',
    readTime: '6 min read',
    icon: FileText,
    summary: 'Master standard applicant tracking system algorithms. Learn how to format resumes to pass 95%+ ATS parsing checks without keyword stuffing.',
    keyTakeaways: [
      'Standard single-column layouts outperform complex multi-column graphic templates.',
      'Quantify impact using Google XYZ formula: "Accomplished [X] as measured by [Y] by doing [Z]".',
      'Match exact skill tokens found in verified job descriptions rather than generic buzzwords.'
    ],
    fullContent: {
      overview: 'Modern employers and recruiting systems screen hundreds of resumes per vacancy using natural language entity extraction. To ensure your resume is indexed accurately, your document structure, section headers, and semantic terminology must conform to standard ATS parsers.',
      sections: [
        {
          heading: '1. ATS Formatting Principles',
          points: [
            'Use standard typography (Inter, Arial, Calibri) between 10pt and 11.5pt.',
            'Avoid tables, text boxes, headers/footers, and embedded graphic icons for key contact data.',
            'Use standard section headings: Professional Summary, Core Skills, Work Experience, Education, Certifications.'
          ]
        },
        {
          heading: '2. Impact Quantification Formula',
          points: [
            'Bad: "Responsible for improving frontend performance and loading speed."',
            'Good: "Optimized Core Web Vitals (LCP reduced by 42% from 3.8s to 2.2s) across 1.4M monthly active users by implementing dynamic code-splitting and asset prefetching."'
          ]
        },
        {
          heading: '3. Skill Section Mapping',
          points: [
            'Categorize skills into Languages, Frameworks, Cloud/Infrastructure, and Methodologies.',
            'Include both acronym and expanded form (e.g., "Kubernetes (K8s)", "Continuous Integration / Continuous Deployment (CI/CD)").'
          ]
        }
      ],
      actionableChecklist: [
        'Export as standard clean PDF or DOCX format.',
        'Validate that your contact email and phone number are in the body text, not document headers.',
        'Review keyword overlap with target vacancy before submitting.'
      ]
    }
  },
  {
    id: 'guide-interview-prep',
    slug: 'technical-and-behavioral-interviews',
    title: 'Technical & STAR Behavioral Interview Masterclass',
    category: 'Interview Preparation',
    readTime: '8 min read',
    icon: GraduationCap,
    summary: 'A structured blueprint for acing technical depth rounds, system architecture deep-dives, and leadership situational interviews.',
    keyTakeaways: [
      'Use the STAR method (Situation, Task, Action, Result) with 70% of response time dedicated to Actions.',
      'Structure architectural answers starting with requirements clarification, followed by scale estimations and trade-offs.',
      'Prepare 5 versatile career stories that demonstrate ownership, conflict resolution, and technical problem-solving.'
    ],
    fullContent: {
      overview: 'Interview excellence is a repeatable discipline. Elite candidates articulate decision rationale, discuss alternatives they considered and rejected, and demonstrate transparent vulnerability when addressing trade-offs.',
      sections: [
        {
          heading: '1. The STAR Behavioral Execution Framework',
          points: [
            'Situation (15%): Set the organizational and technical context crisply in 2-3 sentences.',
            'Task (10%): Define the exact challenge, timeline constraint, or metric at stake.',
            'Action (60%): Detail your specific personal contributions, architectural decisions, and collaborative navigation.',
            'Result (15%): Conclude with business outcomes, performance metrics, and retrospective learnings.'
          ]
        },
        {
          heading: '2. System Design & Technical Problem-Solving Protocol',
          points: [
            'Step 1: Functional and Non-Functional Requirements (Latency, Throughput, Consistency vs Availability).',
            'Step 2: Capacity estimations (Storage, QPS, Bandwidth).',
            'Step 3: High-level architectural diagrams (Load Balancers, Microservices, Caches, DB Shards).',
            'Step 4: Deep-dive bottlenecks (Single point of failure, data replication lags, cache invalidation).'
          ]
        }
      ],
      actionableChecklist: [
        'Draft and rehearse 5 STAR stories with quantifiable results.',
        'Practice live coding or whiteboard architecture using think-aloud verbalization.',
        'Prepare 3 thoughtful questions for the interview panel exploring team roadmap and engineering culture.'
      ]
    }
  },
  {
    id: 'guide-salary-negotiation',
    slug: 'salary-negotiation-benchmarks',
    title: 'Salary Negotiation & CTC Benchmarks',
    category: 'Compensation Intelligence',
    readTime: '7 min read',
    icon: DollarSign,
    summary: 'Deconstruct complex Indian and global CTC structures: fixed base, performance bonuses, joining bonuses, and ESOP equity vesting schedules.',
    keyTakeaways: [
      'Never negotiate on total CTC alone; optimize for Fixed In-Hand Base and guaranteed compensation.',
      'Understand ESOP strike prices, 4-year vesting cliffs, and realistic liquidity event projections.',
      'Counter-offer with data-backed salary percentiles rather than personal financial obligations.'
    ],
    fullContent: {
      overview: 'Compensation structures in modern technology and corporate enterprises involve multiple tranches. Knowing how to evaluate total remuneration separates top earners from those who leave 20% to 40% of their market value on the table.',
      sections: [
        {
          heading: '1. Deconstructing the CTC Anatomy',
          points: [
            'Fixed Base: Guaranteed monthly component; forms the basis for provident fund, gratuity, and percentage-based increments.',
            'Variable / Performance Bonus: Discretionary component tied to company and individual KPIs; evaluate historical payout ratios.',
            'Signing Bonus: Upfront payment designed to offset unvested stock or delayed bonus cycles; check clawback periods.'
          ]
        },
        {
          heading: '2. The Counter-Offer Script',
          points: [
            'Express genuine enthusiasm for the role and team mission first.',
            'Frame the request objectively: "Based on current market data for this scope and my track record in [key domain], I am targeting a fixed base of ₹[X]L to align with standard 75th percentile benchmarks."'
          ]
        }
      ],
      actionableChecklist: [
        'Calculate net monthly in-hand post-tax income using real tax slabs.',
        'Verify ESOP strike price, total outstanding shares, and post-money valuation.',
        'Get all agreed compensation revisions confirmed in writing on the formal offer letter.'
      ]
    }
  },
  {
    id: 'guide-career-transitions',
    slug: 'strategic-career-transitions',
    title: 'Strategic Career Transitions & Cross-Skilling',
    category: 'Career Pathways',
    readTime: '6 min read',
    icon: TrendingUp,
    summary: 'A proven step-by-step roadmap to pivot into high-growth disciplines (e.g. Non-Tech to Tech, Frontend to Full Stack, Support to DevOps).',
    keyTakeaways: [
      'Map adjacent skills: 60% of core problem-solving, project management, and domain acumen transfers directly.',
      'Build proof-of-work: Public GitHub repositories, production deployments, and case studies outweigh certifications.',
      'Target transitional bridge roles where your existing domain knowledge creates an immediate unfair advantage.'
    ],
    fullContent: {
      overview: 'Career transitions do not require starting from square zero. By identifying overlapping analytical, domain, and stakeholder skills, professionals can successfully pivot across industries and technical specializations.',
      sections: [
        {
          heading: '1. The 3-Pillar Transition Strategy',
          points: [
            'Pillar 1 — Adjacent Skill Mapping: Identify which 50-70% of your current toolkit applies directly to the target role.',
            'Pillar 2 — Tangible Proof of Work: Complete 2 end-to-end production-grade projects solving authentic business problems.',
            'Pillar 3 — Targeted Positioning: Refocus your resume summary and portfolio on business outcomes achieved with the new skillset.'
          ]
        }
      ],
      actionableChecklist: [
        'Perform a gap analysis against 10 real job descriptions in your target role.',
        'Complete one end-to-end portfolio project with a live URL and clean documentation.',
        'Engage directly with engineering leaders and practitioners in your target domain.'
      ]
    }
  },
  {
    id: 'guide-job-applications',
    slug: 'job-application-best-practices',
    title: 'High-Impact Job Application Protocols',
    category: 'Job Search Strategy',
    readTime: '5 min read',
    icon: Send,
    summary: 'Why spray-and-pray job applications fail. Learn how targeted 1-click verified applications and recruiter outreach 5x your interview rate.',
    keyTakeaways: [
      'Applying to 15 tailored, high-alignment openings delivers better outcomes than 200 generic submissions.',
      'Apply within the first 48 hours of vacancy verification when recruiter attention is at its peak.',
      'Follow up professionally after 5-7 business days with a concise value-add note.'
    ],
    fullContent: {
      overview: 'Over 70% of inbound applicants on public job boards fail to meet baseline requirements. By ensuring tight qualification alignment and submitting within the initial posting window, your application moves directly to hiring manager review.',
      sections: [
        {
          heading: '1. High-Conversion Application Rhythm',
          points: [
            'Apply during the primary business window (Tuesday to Thursday, 9:00 AM – 11:30 AM).',
            'Ensure your profile has verified skills matching the vacancy requirements.',
            'Write a 3-bullet personalized cover note highlighting your exact fit for their active challenge.'
          ]
        }
      ],
      actionableChecklist: [
        'Set daily verified job alerts for your exact title and city.',
        'Keep your TalentXcel Career Passport and resume continuously synchronized.',
        'Track all submissions inside the Application Tracker to monitor review velocity.'
      ]
    }
  },
  {
    id: 'guide-in-demand-skills',
    slug: 'high-demand-industry-skills',
    title: 'High-Demand Skills by Industry (2026–2027)',
    category: 'Market Trends',
    readTime: '9 min read',
    icon: Cpu,
    summary: 'Empirical analysis of verified vacancies across Tech, Banking, Core Engineering, and Healthcare to identify top premium skills.',
    keyTakeaways: [
      'Cloud-native architecture (Kubernetes, Terraform, AWS/GCP) remains the highest volume infrastructure requirement.',
      'Generative AI integration (LLM fine-tuning, RAG pipelines, LangChain) commands a 35% salary premium across software roles.',
      'Core engineering demands automation, PLC/SCADA, and digital twin simulation competencies.'
    ],
    fullContent: {
      overview: 'Based on analysis of 2,200+ verified active vacancies on TalentXcel, hiring organizations are prioritizing candidates with demonstrable cross-functional depth over narrow single-tool familiarity.',
      sections: [
        {
          heading: '1. Software & IT Dominant Stack',
          points: [
            'TypeScript / React / Next.js for high-performance frontend interfaces.',
            'Go / Node.js / Python for high-throughput distributed microservices.',
            'PostgreSQL, Redis, Kafka, and ClickHouse for modern data architectures.'
          ]
        },
        {
          heading: '2. Banking & Financial Services',
          points: [
            'Risk analytics, algorithmic fraud detection, regulatory reporting (RBI/SEBI compliance).',
            'Core banking modernization, micro-lending API ecosystems, and wealth management platforms.'
          ]
        }
      ],
      actionableChecklist: [
        'Audit your personal skillset against the top 5 requirements in your field.',
        'Dedicate 3 hours weekly to hands-on experimentation with modern tooling.',
        'Take skill verification assessments to display verified badges on your profile.'
      ]
    }
  },
  {
    id: 'guide-freshers-blueprint',
    slug: 'freshers-career-launch-blueprint',
    title: "Freshers' Campus-to-Corporate Blueprint",
    category: 'Early Career',
    readTime: '6 min read',
    icon: Compass,
    summary: 'Comprehensive guide for recent graduates and campus students to secure their first high-growth professional role.',
    keyTakeaways: [
      'Differentiate yourself from millions of peers with live open-source contributions and verifiable projects.',
      'Target Graduate Engineer Trainee (GET) and Management Trainee (MT) cohorts with active recruitment drives.',
      'Demonstrate foundational discipline: continuous learning velocity, clear communication, and professional curiosity.'
    ],
    fullContent: {
      overview: 'The transition from university academics to commercial enterprise requires demonstrating practical execution capability. Entry-level hiring managers prioritize candidates who have shipped actual code, analyzed genuine datasets, or managed real projects.',
      sections: [
        {
          heading: '1. Building a Standout Early-Career Portfolio',
          points: [
            'Include 2 non-trivial capstone projects hosted with public URLs and comprehensive READMEs.',
            'Document your problem statement, system architecture, challenges faced, and trade-offs made.',
            'Highlight academic excellence, competitive programming milestones, or hackathon recognitions.'
          ]
        }
      ],
      actionableChecklist: [
        'Clean up your public GitHub, LinkedIn, and Career Passport profiles.',
        'Practice foundational data structures, algorithmic problem solving, and database queries.',
        'Apply directly to verified entry-level and trainee vacancies on TalentXcel Jobs.'
      ]
    }
  }
];

export const CareerResourcesSection: React.FC<{
  onSelectResource?: (guide: CareerGuide) => void;
}> = ({ onSelectResource }) => {
  const [selectedGuide, setSelectedGuide] = useState<CareerGuide | null>(null);

  const handleOpenGuide = (guide: CareerGuide) => {
    setSelectedGuide(guide);
    if (onSelectResource) {
      onSelectResource(guide);
    }
  };

  return (
    <section id="resources" className="py-16 bg-[#F4F7FC] border-t border-[#E2E8F0] px-4">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-bold">
            <BookOpen className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Public Career Intelligence</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight">
            Original <span className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] bg-clip-text text-transparent">Career Resources & Guides</span>
          </h2>
          <p className="text-[#64748B] text-sm sm:text-base">
            Actionable, industry-tested frameworks written by engineering leaders and recruiters. Free and open to every job seeker.
          </p>
        </div>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CAREER_GUIDES.map((guide) => {
            const Icon = guide.icon;
            return (
              <Card 
                key={guide.id}
                className="bg-white border-[#E2E8F0] hover:border-[#2563EB] transition-all rounded-2xl p-6 shadow-xs hover:shadow-md flex flex-col justify-between group cursor-pointer"
                onClick={() => handleOpenGuide(guide)}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-bold text-[#64748B] bg-slate-50 border-slate-200">
                        {guide.category}
                      </Badge>
                      <span className="text-[11px] text-[#64748B] font-medium">{guide.readTime}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg text-[#111827] group-hover:text-[#2563EB] transition-colors leading-snug">
                      {guide.title}
                    </h3>
                    <p className="text-xs text-[#64748B] mt-2 line-clamp-3 leading-relaxed">
                      {guide.summary}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">Key Takeaways:</span>
                    {guide.keyTakeaways.slice(0, 2).map((takeaway, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[11px] text-[#475569]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{takeaway}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-bold text-[#2563EB] group-hover:text-[#7138E8] transition-colors">
                  <span>Read Complete Guide</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Guide Detail Dialog */}
      {selectedGuide && (
        <Dialog open={Boolean(selectedGuide)} onOpenChange={(open) => !open && setSelectedGuide(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white border-[#E2E8F0] rounded-3xl p-6 sm:p-8">
            <DialogHeader className="space-y-3 text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-blue-50 text-[#2563EB] border-blue-200 text-xs font-bold">
                  {selectedGuide.category}
                </Badge>
                <span className="text-xs text-[#64748B]">• {selectedGuide.readTime}</span>
              </div>
              <DialogTitle className="text-2xl sm:text-3xl font-black text-[#111827] leading-tight">
                {selectedGuide.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-[#475569] leading-relaxed">
                {selectedGuide.fullContent.overview}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 pt-4 text-left">
              {/* Detailed Content Sections */}
              {selectedGuide.fullContent.sections.map((section, idx) => (
                <div key={idx} className="space-y-2 bg-[#F4F7FC] p-5 rounded-2xl border border-[#E2E8F0]">
                  <h4 className="font-bold text-sm text-[#111827]">{section.heading}</h4>
                  <ul className="space-y-2 text-xs text-[#475569]">
                    {section.points.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Actionable Checklist */}
              <div className="bg-emerald-50/60 border border-emerald-200 p-5 rounded-2xl space-y-2">
                <h4 className="font-bold text-sm text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Immediate Action Checklist</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-emerald-800">
                  {selectedGuide.fullContent.actionableChecklist.map((item, cIdx) => (
                    <li key={cIdx} className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between flex-wrap gap-3">
                <span className="text-xs text-[#64748B]">TalentXcel Career Intelligence Network</span>
                <Button 
                  onClick={() => setSelectedGuide(null)}
                  className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] text-white text-xs font-bold rounded-xl px-6"
                >
                  Close Guide
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
};
