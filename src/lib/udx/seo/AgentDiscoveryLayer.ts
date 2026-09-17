/**
 * UDX v4.0 — Agent Discovery Layer & Machine-Discoverable Catalog
 * 
 * Exposes TalentXcel's verified intent resolution capabilities directly to
 * external AI agents, autonomous searchers, and LLM reasoning pipelines.
 * 
 * SEO shifts from human HTML rendering to Entity + Evidence + Actionability.
 */

export interface MachineDiscoverableEntity {
  entityId: string;
  name: string;
  type: 'JOB' | 'SKILL' | 'COMPANY' | 'COURSE' | 'INSTITUTION' | 'LOCAL_SERVICE' | 'TOOL' | 'INTENT_PATHWAY';
  canonicalUrl: string;
  resolverEndpoint: string;
  evidenceId: string;
  freshness: string;
  status: 'ACTIVE_VERIFIED' | 'MONITORED';
  capabilities: string[];
  schemaOrgType: string;
}

export interface AgentDiscoveryCatalog {
  catalogVersion: string;
  service: string;
  apiEndpoint: string;
  totalEntities: number;
  entities: MachineDiscoverableEntity[];
  supportedIntents: string[];
}

export class AgentDiscoveryLayer {
  private static entities: MachineDiscoverableEntity[] = [
    {
      entityId: 'ent-job-frontend-varanasi',
      name: 'Frontend Developer (Varanasi Verified Compensation)',
      type: 'JOB',
      canonicalUrl: '/jobs?role=frontend-developer&location=Varanasi&verified=true',
      resolverEndpoint: '/api/udx/resolve',
      evidenceId: 'EVID-FIRST-PARTY-VARANASI-JOBS',
      freshness: new Date().toISOString(),
      status: 'ACTIVE_VERIFIED',
      capabilities: ['VERIFIED_COMPENSATION', 'DIRECT_APPLICATION', 'SKILL_MATCHING'],
      schemaOrgType: 'JobPosting',
    },
    {
      entityId: 'ent-edu-ai-masters',
      name: 'Accredited AI Masters Degree (Sub ₹5L Statutory)',
      type: 'COURSE',
      canonicalUrl: '/education/programs/ai-masters-degree',
      resolverEndpoint: '/api/udx/resolve',
      evidenceId: 'EVID-EDU-UGC-AICTE-ACCRED',
      freshness: new Date().toISOString(),
      status: 'ACTIVE_VERIFIED',
      capabilities: ['UGC_AICTE_VERIFIED', 'TUITION_GATE_CHECK', 'SYLLABUS_AUDIT'],
      schemaOrgType: 'Course',
    },
    {
      entityId: 'ent-biz-udyam-msme',
      name: 'Statutory Udyam MSME Enterprise Registration',
      type: 'INTENT_PATHWAY',
      canonicalUrl: 'https://udyamregistration.gov.in',
      resolverEndpoint: '/api/udx/resolve',
      evidenceId: 'EVID-GOV-MSME-UDYAM-STATUTORY',
      freshness: new Date().toISOString(),
      status: 'ACTIVE_VERIFIED',
      capabilities: ['ZERO_FEE_DIRECT_PORTAL', 'STATUTORY_CHECKLIST', 'AADHAAR_OTP_VERIFIED'],
      schemaOrgType: 'GovernmentService',
    },
    {
      entityId: 'ent-tool-resume-checker',
      name: 'Deterministic ATS Resume Calibration Rubric',
      type: 'TOOL',
      canonicalUrl: '/tools/resume-checker',
      resolverEndpoint: '/api/udx/resolve',
      evidenceId: 'TalentXcel 40+ Rule Deterministic ATS Parser Rubric',
      freshness: new Date().toISOString(),
      status: 'ACTIVE_VERIFIED',
      capabilities: ['40_RULE_AUDIT', 'ZERO_HALLUCINATION', 'SCORE_CERTIFICATE'],
      schemaOrgType: 'SoftwareApplication',
    },
    {
      entityId: 'ent-svc-plumbing-varanasi',
      name: 'Varanasi Emergency Plumbing Guild Dispatch',
      type: 'LOCAL_SERVICE',
      canonicalUrl: '/services/varanasi/plumbing',
      resolverEndpoint: '/api/udx/resolve',
      evidenceId: 'EVID-VTG-TRADE-GUILD-SLA',
      freshness: new Date().toISOString(),
      status: 'ACTIVE_VERIFIED',
      capabilities: ['2_HR_SLA', 'INR_199_STANDARD_DIAGNOSTIC', 'GUILD_VERIFIED'],
      schemaOrgType: 'HomeAndConstructionBusiness',
    },
  ];

  /**
   * Generates the agent discovery catalog for automated indexing and LLM consumption.
   */
  public static getCatalog(): AgentDiscoveryCatalog {
    return {
      catalogVersion: '4.0.0-UDX-DISCOVERY',
      service: 'TalentXcel Universal Discovery & Outcome Engine',
      apiEndpoint: '/api/udx/resolve',
      totalEntities: this.entities.length,
      entities: this.entities,
      supportedIntents: [
        'Career Exploration and Job Application',
        'Accredited Higher Education & Degrees',
        'Statutory Business Registration & Compliance',
        'Deterministic Expense & Financial Calculators',
        'Verified Local Trade Guild Dispatch',
        'Personal Deliberate Practice & Productivity Systems',
      ],
    };
  }

  /**
   * Resolves machine discovery lookups for external AI callers.
   */
  public static resolveAgentQuery(intentKeyword: string): MachineDiscoverableEntity[] {
    const lower = intentKeyword.toLowerCase();
    return this.entities.filter(e =>
      e.name.toLowerCase().includes(lower) ||
      e.type.toLowerCase().includes(lower) ||
      e.capabilities.some(c => c.toLowerCase().includes(lower))
    );
  }
}
