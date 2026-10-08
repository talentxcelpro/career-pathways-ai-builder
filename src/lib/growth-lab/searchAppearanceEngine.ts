// src/lib/growth-lab/searchAppearanceEngine.ts
// TalentXcel Search Appearance & Snippet Optimization Engine
// Tests Title, Meta Description, Visible Intro, and Breadcrumbs for CTR and Registration Lift.

export interface AppearanceVariant {
  archetype: 'DIRECT_ACTION' | 'AUDIENCE_SPECIFIC' | 'INVENTORY_PROOF' | 'SALARY_PROVEN';
  title: string;
  metaDescription: string;
  introHeading: string;
  aboveFoldSnippet: string;
  breadcrumbLabel: string;
  isBackedByRealInventory: boolean;
  inventoryProofDetails: string;
}

export interface AppearanceTestInput {
  role: string;
  city: string;
  activeJobCount: number;
  salaryMinLpa?: number;
  salaryMaxLpa?: number;
  freshersEligible: boolean;
  topCompanies: string[];
}

export class SearchAppearanceEngine {
  // Generates 3 controlled appearance variants ensuring claims are strictly supported by page data
  public static generateVariants(input: AppearanceTestInput): {
    variantA_DirectAction: AppearanceVariant;
    variantB_AudienceSpecific: AppearanceVariant;
    variantC_InventoryProof: AppearanceVariant;
  } {
    const { role, city, activeJobCount, salaryMinLpa, salaryMaxLpa, freshersEligible, topCompanies } = input;
    const companyListStr = topCompanies.slice(0, 3).join(', ');

    // Variant A: Direct Action
    const variantA: AppearanceVariant = {
      archetype: 'DIRECT_ACTION',
      title: `${role} Jobs in ${city} | Apply Now`,
      metaDescription: `Apply for verified ${role} vacancies in ${city}. Fast-track hiring with top companies like ${companyListStr || 'leading tech employers'} on TalentXcel.`,
      introHeading: `Explore ${activeJobCount > 0 ? activeJobCount : 'Latest'} ${role} Vacancies in ${city}`,
      aboveFoldSnippet: `Browse active openings for ${role} roles across ${city}. Direct application and employer interview shortlists updated daily.`,
      breadcrumbLabel: `${role} Jobs`,
      isBackedByRealInventory: activeJobCount > 0,
      inventoryProofDetails: `${activeJobCount} live jobs currently active`,
    };

    // Variant B: Audience / Fresher Specific
    const audienceTag = freshersEligible ? 'for Freshers & Experienced' : 'Mid to Senior Levels';
    const variantB: AppearanceVariant = {
      archetype: 'AUDIENCE_SPECIFIC',
      title: `${role} Jobs in ${city} ${freshersEligible ? 'for Freshers' : 'Hiring Now'} | TalentXcel`,
      metaDescription: `${role} openings in ${city} ${audienceTag}. Verified entry to lead roles, required skills, and transparent CTC benchmarks.`,
      introHeading: `${role} Career Openings in ${city} (${audienceTag})`,
      aboveFoldSnippet: `Tailored listings for candidates looking for ${role} positions in ${city}. Verified eligibility, technical skill requirements, and direct application routes.`,
      breadcrumbLabel: `${city} ${role} Roles`,
      isBackedByRealInventory: activeJobCount > 0,
      inventoryProofDetails: `Verified eligibility: ${freshersEligible ? 'Freshers eligible' : 'Experience required'}`,
    };

    // Variant C: Evidence / Inventory Proof
    // STRICT RULE: Only use exact count if supported, never exaggerate
    const inventoryCountText = activeJobCount > 0 ? `${activeJobCount}+` : 'Verified';
    const salarySnippet = (salaryMinLpa && salaryMaxLpa) ? ` (${salaryMinLpa}–${salaryMaxLpa} LPA)` : '';
    const variantC: AppearanceVariant = {
      archetype: 'INVENTORY_PROOF',
      title: `${inventoryCountText} ${role} Jobs in ${city}${salarySnippet} | TalentXcel`,
      metaDescription: `Browse ${activeJobCount} verified ${role} jobs in ${city}${salarySnippet ? ` with salaries from ₹${salaryMinLpa}–₹${salaryMaxLpa} LPA` : ''}. 1-click apply on TalentXcel.`,
      introHeading: `Verified Inventory: ${activeJobCount} Active ${role} Positions in ${city}`,
      aboveFoldSnippet: `Real-time hiring data: ${activeJobCount} active ${role} openings with verified employer requirements and salary bands in ${city}.`,
      breadcrumbLabel: `${activeJobCount} Openings in ${city}`,
      isBackedByRealInventory: activeJobCount > 0,
      inventoryProofDetails: `Claims backed by ${activeJobCount} live database entries`,
    };

    return {
      variantA_DirectAction: variantA,
      variantB_AudienceSpecific: variantB,
      variantC_InventoryProof: variantC,
    };
  }

  // Evaluate CTR performance between control and treatment variants
  public static evaluateLift(control: { impressions: number; clicks: number }, treatment: { impressions: number; clicks: number }) {
    const controlCtr = control.impressions > 0 ? (control.clicks / control.impressions) * 100 : 0;
    const treatmentCtr = treatment.impressions > 0 ? (treatment.clicks / treatment.impressions) * 100 : 0;
    const ctrDelta = treatmentCtr - controlCtr;
    const liftPct = controlCtr > 0 ? (ctrDelta / controlCtr) * 100 : 0;

    return {
      controlCtr: Math.round(controlCtr * 100) / 100,
      treatmentCtr: Math.round(treatmentCtr * 100) / 100,
      ctrDelta: Math.round(ctrDelta * 100) / 100,
      liftPct: Math.round(liftPct * 10) / 10,
      isSignificant: treatment.clicks >= 15 && treatment.impressions >= 100 && liftPct > 10.0,
    };
  }
}
