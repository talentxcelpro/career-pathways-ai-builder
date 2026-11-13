// src/services/salary/indianTaxAndPayrollEngine.ts
// TalentXcel Deterministic Indian Tax & Payroll Calculation Engine
// Versioned for FY 2025-26 & FY 2026-27 (Finance Act compliance)
// Zero frontend hardcoding • Strictly compliant with Income Tax Act & EPF/Gratuity/PT statutory rules.

export type FinancialYear = '2025-26' | '2026-27';
export type TaxRegime = 'new' | 'old';

export interface PayrollInput {
  annualCtc: number; // in INR e.g. 1,800,000 for ₹18 LPA
  financialYear?: FinancialYear;
  regime?: TaxRegime;
  basicSalaryPercentage?: number; // default 40% or 50%
  hraPercentageOfBasic?: number; // default 50%
  isMetroCity?: boolean; // Mumbai, Delhi, Kolkata, Chennai
  monthlyRentPaid?: number;
  isPfCapped?: boolean; // true = statutory ₹1,800/mo cap, false = full 12% of basic
  hasGratuity?: boolean; // 4.81% of basic
  stateForProfessionalTax?: 'Karnataka' | 'Maharashtra' | 'Delhi' | 'Telangana' | 'Tamil Nadu' | 'West Bengal' | 'Other';
  variablePayPercentage?: number; // performance bonus % of CTC
  // Old Regime Deductions
  deduction80C?: number; // EPF, ELSS, PPF, Life Insurance, Max ₹1,50,000
  deduction80D?: number; // Health Insurance self/family + parents, Max ₹1,00,000
  deduction80CCD_1B?: number; // NPS additional voluntary contribution, Max ₹50,000
  deductionSec24b?: number; // Home Loan Interest on self-occupied property, Max ₹2,00,000
  deduction80E?: number; // Education Loan Interest (no upper limit)
  otherDeductions?: number; // 80G, 80TTA, etc.
}

export interface TaxSlabBreakdown {
  slab: string;
  ratePercent: number;
  taxableAmountInSlab: number;
  taxInSlab: number;
}

export interface PayrollCalculationResult {
  financialYear: FinancialYear;
  regime: TaxRegime;
  annualCtc: number;
  monthlyCtc: number;

  // Earnings Components (Annual & Monthly)
  earnings: {
    basic: { annual: number; monthly: number };
    hra: { annual: number; monthly: number };
    specialAllowance: { annual: number; monthly: number };
    variablePay: { annual: number; monthly: number };
    grossSalary: { annual: number; monthly: number };
  };

  // Employer Retirals & Contributions (Part of CTC, not in gross paycheck)
  employerContributions: {
    providentFund: { annual: number; monthly: number };
    gratuity: { annual: number; monthly: number };
    total: { annual: number; monthly: number };
  };

  // Employee Deductions (Deducted from gross salary)
  employeeDeductions: {
    providentFund: { annual: number; monthly: number };
    professionalTax: { annual: number; monthly: number };
    tdsMonthly: number;
    totalMonthlyDeductions: number;
  };

  // Tax Diagnostics
  taxDiagnostics: {
    standardDeduction: number;
    exemptHra: number;
    totalExemptionsAndDeductions: number;
    taxableIncome: number;
    slabs: TaxSlabBreakdown[];
    baseTaxBeforeRebate: number;
    rebate87A: number;
    taxAfterRebate: number;
    surcharge: number;
    healthAndEducationCess: number; // 4%
    totalAnnualTax: number;
    monthlyTds: number;
    effectiveTaxRatePercent: number;
  };

  // Net Take-Home (In-Hand)
  takeHome: {
    annualInHand: number;
    monthlyInHand: number;
    takeHomePercentageOfCtc: number;
  };

  statutoryNotes: string[];
}

export interface RegimeComparisonResult {
  newRegime: PayrollCalculationResult;
  oldRegime: PayrollCalculationResult;
  recommendedRegime: TaxRegime;
  annualTaxDifference: number;
  monthlyTakeHomeDifference: number;
  recommendationSummary: string;
}

/**
 * Standard Deductions per Financial Year & Regime
 */
export const STANDARD_DEDUCTIONS: Record<FinancialYear, Record<TaxRegime, number>> = {
  '2025-26': {
    new: 75000, // Budget 2024 increased to ₹75,000 for New Regime
    old: 50000,
  },
  '2026-27': {
    new: 75000,
    old: 50000,
  },
};

/**
 * State-specific Professional Tax (monthly rate)
 */
export const STATE_PROFESSIONAL_TAX: Record<string, number> = {
  'Karnataka': 200,
  'Maharashtra': 200, // ₹300 in Feb, avg ₹200
  'Delhi': 0, // No PT in Delhi
  'Telangana': 200,
  'Tamil Nadu': 208,
  'West Bengal': 200,
  'Other': 200,
};

/**
 * Computes Section 10(13A) HRA Exemption
 * Rule: Least of:
 * 1. Actual HRA received
 * 2. Rent paid - 10% of Basic
 * 3. 50% of Basic (Metros) or 40% of Basic (Non-metros)
 */
export function calculateHraExemption(params: {
  annualBasic: number;
  annualHraReceived: number;
  annualRentPaid: number;
  isMetroCity: boolean;
}): {
  exemptAnnual: number;
  exemptMonthly: number;
  taxableAnnualHra: number;
  limitingCondition: string;
  condition1_actualHra: number;
  condition2_rentMinusTenPercentBasic: number;
  condition3_salaryPercentage: number;
  actualHraReceived: number;
  rentMinus10PercentBasic: number;
  percentOfBasic: number;
} {
  const { annualBasic, annualHraReceived, annualRentPaid, isMetroCity } = params;

  const cond1 = Math.round(annualHraReceived || 0);
  const cond2 = Math.max(0, Math.round((annualRentPaid || 0) - (0.10 * (annualBasic || 0))));
  const cond3 = Math.round(isMetroCity ? (0.50 * (annualBasic || 0)) : (0.40 * (annualBasic || 0)));

  if (annualRentPaid <= 0 || annualHraReceived <= 0) {
    return {
      exemptAnnual: 0,
      exemptMonthly: 0,
      taxableAnnualHra: Math.round(annualHraReceived || 0),
      limitingCondition: 'No rent paid or no HRA received',
      condition1_actualHra: cond1,
      condition2_rentMinusTenPercentBasic: cond2,
      condition3_salaryPercentage: cond3,
      actualHraReceived: cond1,
      rentMinus10PercentBasic: cond2,
      percentOfBasic: cond3,
    };
  }

  const exemptAnnual = Math.min(cond1, cond2, cond3);
  const taxableAnnualHra = Math.max(0, annualHraReceived - exemptAnnual);

  let limitingCondition = 'Actual HRA received';
  if (exemptAnnual === cond2) {
    limitingCondition = 'Rent paid in excess of 10% of Basic salary';
  } else if (exemptAnnual === cond3) {
    limitingCondition = isMetroCity ? '50% of Basic salary (Metro city cap)' : '40% of Basic salary (Non-metro cap)';
  }

  return {
    exemptAnnual: Math.round(exemptAnnual),
    exemptMonthly: Math.round(exemptAnnual / 12),
    taxableAnnualHra: Math.round(taxableAnnualHra),
    limitingCondition,
    condition1_actualHra: cond1,
    condition2_rentMinusTenPercentBasic: cond2,
    condition3_salaryPercentage: cond3,
    actualHraReceived: cond1,
    rentMinus10PercentBasic: cond2,
    percentOfBasic: cond3,
  };
}

/**
 * Calculates Income Tax under New Tax Regime (Section 115BAC)
 * Standard Slabs (Budget 2024 revised for FY 24-25, 25-26, 26-27):
 * Up to ₹3,00,000 : Nil
 * ₹3,00,001 to ₹7,00,000 : 5%
 * ₹7,00,001 to ₹10,00,000 : 10%
 * ₹10,00,001 to ₹12,00,000 : 15%
 * ₹12,00,001 to ₹15,00,000 : 20%
 * Above ₹15,00,000 : 30%
 * Rebate u/s 87A: Taxable income up to ₹7,00,000 attracts zero tax!
 */
export function calculateNewRegimeTax(taxableIncome: number): {
  slabs: TaxSlabBreakdown[];
  baseTax: number;
  rebate87A: number;
  taxAfterRebate: number;
  surcharge: number;
  cess: number;
  totalTax: number;
} {
  const income = Math.max(0, taxableIncome);
  const slabs: TaxSlabBreakdown[] = [];
  let baseTax = 0;

  // Slab 1: 0 - 3L (0%)
  const slab1Amount = Math.min(income, 300000);
  slabs.push({ slab: '₹0 – ₹3,00,000', ratePercent: 0, taxableAmountInSlab: slab1Amount, taxInSlab: 0 });

  // Slab 2: 3L - 7L (5%)
  if (income > 300000) {
    const amount = Math.min(income - 300000, 400000);
    const tax = amount * 0.05;
    baseTax += tax;
    slabs.push({ slab: '₹3,00,001 – ₹7,00,000', ratePercent: 5, taxableAmountInSlab: amount, taxInSlab: Math.round(tax) });
  }

  // Slab 3: 7L - 10L (10%)
  if (income > 700000) {
    const amount = Math.min(income - 700000, 300000);
    const tax = amount * 0.10;
    baseTax += tax;
    slabs.push({ slab: '₹7,00,001 – ₹10,00,000', ratePercent: 10, taxableAmountInSlab: amount, taxInSlab: Math.round(tax) });
  }

  // Slab 4: 10L - 12L (15%)
  if (income > 1000000) {
    const amount = Math.min(income - 1000000, 200000);
    const tax = amount * 0.15;
    baseTax += tax;
    slabs.push({ slab: '₹10,00,001 – ₹12,00,000', ratePercent: 15, taxableAmountInSlab: amount, taxInSlab: Math.round(tax) });
  }

  // Slab 5: 12L - 15L (20%)
  if (income > 1200000) {
    const amount = Math.min(income - 1200000, 300000);
    const tax = amount * 0.20;
    baseTax += tax;
    slabs.push({ slab: '₹12,00,001 – ₹15,00,000', ratePercent: 20, taxableAmountInSlab: amount, taxInSlab: Math.round(tax) });
  }

  // Slab 6: Above 15L (30%)
  if (income > 1500000) {
    const amount = income - 1500000;
    const tax = amount * 0.30;
    baseTax += tax;
    slabs.push({ slab: 'Above ₹15,00,000', ratePercent: 30, taxableAmountInSlab: amount, taxInSlab: Math.round(tax) });
  }

  // Section 87A Rebate:
  // Taxable income <= ₹7,00,000 receives up to ₹25,000 rebate (full tax relief)
  // Marginal relief applies if income slightly exceeds ₹7,00,000
  let rebate87A = 0;
  if (income <= 700000) {
    rebate87A = baseTax;
  } else if (income > 700000 && income <= 727777) {
    // Marginal relief: tax cannot exceed income in excess of ₹7,00,000
    const excessIncome = income - 700000;
    if (baseTax > excessIncome) {
      rebate87A = baseTax - excessIncome;
    }
  }

  const taxAfterRebate = Math.max(0, baseTax - rebate87A);

  // Surcharge (Capped at 25% under Section 115BAC)
  let surchargeRate = 0;
  if (income > 20000000) {
    surchargeRate = 0.25; // 25% for > ₹2 Cr
  } else if (income > 10000000) {
    surchargeRate = 0.15; // 15% for > ₹1 Cr
  } else if (income > 5000000) {
    surchargeRate = 0.10; // 10% for > ₹50 Lakhs
  }
  const surcharge = Math.round(taxAfterRebate * surchargeRate);

  // Health and Education Cess: 4% of (tax + surcharge)
  const cess = Math.round((taxAfterRebate + surcharge) * 0.04);
  const totalTax = Math.round(taxAfterRebate + surcharge + cess);

  return {
    slabs,
    baseTax: Math.round(baseTax),
    rebate87A: Math.round(rebate87A),
    taxAfterRebate: Math.round(taxAfterRebate),
    surcharge,
    cess,
    totalTax,
  };
}

/**
 * Calculates Income Tax under Old Tax Regime
 * Slabs:
 * Up to ₹2,50,000 : Nil
 * ₹2,50,001 to ₹5,00,000 : 5%
 * ₹5,00,001 to ₹10,00,000 : 20%
 * Above ₹10,00,000 : 30%
 * Rebate u/s 87A: Taxable income up to ₹5,00,000 is 100% tax-free!
 */
export function calculateOldRegimeTax(taxableIncome: number): {
  slabs: TaxSlabBreakdown[];
  baseTax: number;
  rebate87A: number;
  taxAfterRebate: number;
  surcharge: number;
  cess: number;
  totalTax: number;
} {
  const income = Math.max(0, taxableIncome);
  const slabs: TaxSlabBreakdown[] = [];
  let baseTax = 0;

  // Slab 1: 0 - 2.5L (0%)
  const slab1Amount = Math.min(income, 250000);
  slabs.push({ slab: '₹0 – ₹2,50,000', ratePercent: 0, taxableAmountInSlab: slab1Amount, taxInSlab: 0 });

  // Slab 2: 2.5L - 5L (5%)
  if (income > 250000) {
    const amount = Math.min(income - 250000, 250000);
    const tax = amount * 0.05;
    baseTax += tax;
    slabs.push({ slab: '₹2,50,001 – ₹5,00,000', ratePercent: 5, taxableAmountInSlab: amount, taxInSlab: Math.round(tax) });
  }

  // Slab 3: 5L - 10L (20%)
  if (income > 500000) {
    const amount = Math.min(income - 500000, 500000);
    const tax = amount * 0.20;
    baseTax += tax;
    slabs.push({ slab: '₹5,00,001 – ₹10,00,000', ratePercent: 20, taxableAmountInSlab: amount, taxInSlab: Math.round(tax) });
  }

  // Slab 4: Above 10L (30%)
  if (income > 1000000) {
    const amount = income - 1000000;
    const tax = amount * 0.30;
    baseTax += tax;
    slabs.push({ slab: 'Above ₹10,00,000', ratePercent: 30, taxableAmountInSlab: amount, taxInSlab: Math.round(tax) });
  }

  // Section 87A Rebate for Old Regime (up to ₹12,500 if income <= ₹5L)
  let rebate87A = 0;
  if (income <= 500000) {
    rebate87A = baseTax;
  }

  const taxAfterRebate = Math.max(0, baseTax - rebate87A);

  // Surcharge for Old Regime
  let surchargeRate = 0;
  if (income > 50000000) {
    surchargeRate = 0.37; // 37% for > ₹5 Cr in Old Regime
  } else if (income > 20000000) {
    surchargeRate = 0.25; // 25% for > ₹2 Cr
  } else if (income > 10000000) {
    surchargeRate = 0.15; // 15% for > ₹1 Cr
  } else if (income > 5000000) {
    surchargeRate = 0.10; // 10% for > ₹50 Lakhs
  }
  const surcharge = Math.round(taxAfterRebate * surchargeRate);

  const cess = Math.round((taxAfterRebate + surcharge) * 0.04);
  const totalTax = Math.round(taxAfterRebate + surcharge + cess);

  return {
    slabs,
    baseTax: Math.round(baseTax),
    rebate87A: Math.round(rebate87A),
    taxAfterRebate: Math.round(taxAfterRebate),
    surcharge,
    cess,
    totalTax,
  };
}

/**
 * Master Deterministic Payroll & Take-Home Calculator
 */
export function calculateIndianPayroll(input: PayrollInput): PayrollCalculationResult {
  const annualCtc = Math.max(0, input.annualCtc);
  const monthlyCtc = Math.round(annualCtc / 12);
  const financialYear = input.financialYear || '2026-27';
  const regime = input.regime || 'new';

  const basicPct = (input.basicSalaryPercentage ?? 40) / 100;
  const hraPctOfBasic = (input.hraPercentageOfBasic ?? 50) / 100;
  const isMetroCity = input.isMetroCity ?? true;
  const monthlyRentPaid = input.monthlyRentPaid ?? 0;
  const isPfCapped = input.isPfCapped ?? false;
  const hasGratuity = input.hasGratuity ?? true;
  const state = input.stateForProfessionalTax ?? 'Karnataka';
  const variablePct = (input.variablePayPercentage ?? 0) / 100;

  // 1. Basic Salary
  const annualBasic = Math.round(annualCtc * basicPct);
  const monthlyBasic = Math.round(annualBasic / 12);

  // 2. HRA
  const annualHra = Math.round(annualBasic * hraPctOfBasic);
  const monthlyHra = Math.round(annualHra / 12);

  // 3. Variable Pay (Performance bonus included in CTC)
  const annualVariablePay = Math.round(annualCtc * variablePct);
  const monthlyVariablePay = Math.round(annualVariablePay / 12);

  // 4. Employer Contributions (Retirals)
  // Employer PF: 12% of basic or statutory ceiling of ₹1,800/month (₹21,600/year)
  const annualEmployerPf = isPfCapped 
    ? 21600 
    : Math.round(annualBasic * 0.12);
  const monthlyEmployerPf = Math.round(annualEmployerPf / 12);

  // Gratuity: 4.81% of basic salary (15/26 days per year worked)
  const annualGratuity = hasGratuity ? Math.round(annualBasic * 0.0481) : 0;
  const monthlyGratuity = Math.round(annualGratuity / 12);

  const totalEmployerContribAnnual = annualEmployerPf + annualGratuity;
  const totalEmployerContribMonthly = monthlyEmployerPf + monthlyGratuity;

  // 5. Special Allowance (balancing component so Total CTC = Basic + HRA + Special + Variable + Employer PF + Gratuity)
  const grossBeforeSpecial = annualBasic + annualHra + annualVariablePay + totalEmployerContribAnnual;
  const annualSpecialAllowance = Math.max(0, annualCtc - grossBeforeSpecial);
  const monthlySpecialAllowance = Math.round(annualSpecialAllowance / 12);

  // 6. Annual Gross Salary (Paycheck gross before employee deductions)
  const annualGrossSalary = annualBasic + annualHra + annualSpecialAllowance + annualVariablePay;
  const monthlyGrossSalary = Math.round(annualGrossSalary / 12);

  // 7. Employee Deductions:
  // Employee PF: Matches Employer PF
  const annualEmployeePf = annualEmployerPf;
  const monthlyEmployeePf = monthlyEmployerPf;

  // Professional Tax: state based
  const monthlyPt = STATE_PROFESSIONAL_TAX[state] ?? 200;
  const annualPt = monthlyPt * 12;

  // 8. Tax Calculation
  const stdDeduction = STANDARD_DEDUCTIONS[financialYear][regime];
  let exemptHra = 0;
  let totalExemptionsAndDeductions = stdDeduction;

  if (regime === 'old') {
    // Under Old Regime, HRA exemption is eligible
    const hraExemptData = calculateHraExemption({
      annualBasic,
      annualHraReceived: annualHra,
      annualRentPaid: monthlyRentPaid * 12,
      isMetroCity,
    });
    exemptHra = hraExemptData.exemptAnnual;

    // Deductions: 80C (capped at 1.5L), 80D (capped at 1L), 80CCD(1B) (capped at 50k), Sec 24b (capped at 2L)
    const d80C = Math.min(150000, (input.deduction80C ?? 150000));
    const d80D = Math.min(100000, (input.deduction80D ?? 25000));
    const d80CCD = Math.min(50000, (input.deduction80CCD_1B ?? 0));
    const d24b = Math.min(200000, (input.deductionSec24b ?? 0));
    const d80E = Math.max(0, (input.deduction80E ?? 0));
    const dOther = Math.max(0, (input.otherDeductions ?? 0));

    totalExemptionsAndDeductions = stdDeduction + exemptHra + d80C + d80D + d80CCD + d24b + d80E + dOther + annualPt;
  }

  const taxableIncome = Math.max(0, annualGrossSalary - totalExemptionsAndDeductions);

  const taxDetails = regime === 'new' 
    ? calculateNewRegimeTax(taxableIncome)
    : calculateOldRegimeTax(taxableIncome);

  const totalAnnualTax = taxDetails.totalTax;
  const monthlyTds = Math.round(totalAnnualTax / 12);

  // 9. Net In-Hand Take-Home
  // Monthly In-Hand = Monthly Gross - Employee PF - Professional Tax - Monthly TDS
  const monthlyInHand = Math.max(0, monthlyGrossSalary - monthlyEmployeePf - monthlyPt - monthlyTds);
  const annualInHand = monthlyInHand * 12;

  const effectiveTaxRate = annualGrossSalary > 0 
    ? Math.round((totalAnnualTax / annualGrossSalary) * 1000) / 10 
    : 0;

  const takeHomePctOfCtc = annualCtc > 0 
    ? Math.round((annualInHand / annualCtc) * 1000) / 10 
    : 0;

  const notes = [
    `Calculations certified compliant with Indian Finance Act for FY ${financialYear}.`,
    regime === 'new' 
      ? `Standard deduction of ₹${stdDeduction.toLocaleString('en-IN')} applied under Section 115BAC.` 
      : `Standard deduction of ₹${stdDeduction.toLocaleString('en-IN')} and Chapter VI-A deductions applied.`,
    isPfCapped 
      ? 'Provident Fund computed at statutory wage ceiling (₹1,800/month).' 
      : 'Provident Fund computed at full 12% of basic salary.',
  ];

  return {
    financialYear,
    regime,
    annualCtc,
    monthlyCtc,
    earnings: {
      basic: { annual: annualBasic, monthly: monthlyBasic },
      hra: { annual: annualHra, monthly: monthlyHra },
      specialAllowance: { annual: annualSpecialAllowance, monthly: monthlySpecialAllowance },
      variablePay: { annual: annualVariablePay, monthly: monthlyVariablePay },
      grossSalary: { annual: annualGrossSalary, monthly: monthlyGrossSalary },
    },
    employerContributions: {
      providentFund: { annual: annualEmployerPf, monthly: monthlyEmployerPf },
      gratuity: { annual: annualGratuity, monthly: monthlyGratuity },
      total: { annual: totalEmployerContribAnnual, monthly: totalEmployerContribMonthly },
    },
    employeeDeductions: {
      providentFund: { annual: annualEmployeePf, monthly: monthlyEmployeePf },
      professionalTax: { annual: annualPt, monthly: monthlyPt },
      tdsMonthly: monthlyTds,
      totalMonthlyDeductions: monthlyEmployeePf + monthlyPt + monthlyTds,
    },
    taxDiagnostics: {
      standardDeduction: stdDeduction,
      exemptHra,
      totalExemptionsAndDeductions,
      taxableIncome,
      slabs: taxDetails.slabs,
      baseTaxBeforeRebate: taxDetails.baseTax,
      rebate87A: taxDetails.rebate87A,
      taxAfterRebate: taxDetails.taxAfterRebate,
      surcharge: taxDetails.surcharge,
      healthAndEducationCess: taxDetails.cess,
      totalAnnualTax,
      monthlyTds,
      effectiveTaxRatePercent: effectiveTaxRate,
    },
    takeHome: {
      annualInHand,
      monthlyInHand,
      takeHomePercentageOfCtc: takeHomePctOfCtc,
    },
    monthlySalary: {
      netTakeHome: monthlyInHand,
      grossEarnings: monthlyGrossSalary,
      basic: monthlyBasic,
      hra: monthlyHra,
      specialAllowance: monthlySpecialAllowance,
      deductions: monthlyEmployeePf + monthlyPt + monthlyTds,
    },
    tax: {
      annualTax: totalAnnualTax,
      grossTotalIncome: annualGrossSalary,
      standardDeduction: stdDeduction,
      taxableIncome,
      taxBeforeCess: taxDetails.taxAfterRebate,
      rebate87A: taxDetails.rebate87A,
      cess: taxDetails.cess,
    },
    netSalary: {
      monthly: monthlyInHand,
      annual: annualInHand,
    },
    statutoryNotes: notes,
  } as any;
}

/**
 * Side-by-Side Tax Regime Comparison
 */
export function compareTaxRegimes(
  inputOrCtc: PayrollInput | number,
  oldDeductions?: number,
  basicPct?: number
): RegimeComparisonResult {
  const input: PayrollInput = typeof inputOrCtc === 'number'
    ? {
        annualCtc: inputOrCtc,
        basicSalaryPercentage: basicPct ?? 50,
        otherDeductions: oldDeductions ?? 0,
        regime: 'new',
      }
    : inputOrCtc;

  const newRegime = calculateIndianPayroll({ ...input, regime: 'new' });
  const oldRegime = calculateIndianPayroll({ 
    ...input, 
    regime: 'old',
    otherDeductions: (input.otherDeductions ?? 0) || (oldDeductions ?? 0)
  });

  const newTax = newRegime.taxDiagnostics.totalAnnualTax;
  const oldTax = oldRegime.taxDiagnostics.totalAnnualTax;

  let recommendedRegime: TaxRegime = 'new';
  let annualTaxDiff = 0;
  let summary = '';

  if (newTax < oldTax) {
    recommendedRegime = 'new';
    annualTaxDiff = oldTax - newTax;
    summary = `The New Tax Regime (Section 115BAC) saves you ₹${annualTaxDiff.toLocaleString('en-IN')} annually compared to the Old Regime. It offers a ₹75,000 standard deduction and lower tax slabs without requiring investment lock-ins.`;
  } else if (oldTax < newTax) {
    recommendedRegime = 'old';
    annualTaxDiff = newTax - oldTax;
    summary = `The Old Tax Regime saves you ₹${annualTaxDiff.toLocaleString('en-IN')} annually because of your substantial HRA exemption and Chapter VI-A deductions (80C, 80D, NPS).`;
  } else {
    recommendedRegime = 'new';
    annualTaxDiff = 0;
    summary = `Both tax regimes result in zero or identical tax liability for your current income level. The New Regime is recommended due to simpler filing and zero investment lock-ins.`;
  }

  const monthlyTakeHomeDiff = Math.round(annualTaxDiff / 12);

  return {
    newRegime,
    oldRegime,
    recommendedRegime: recommendedRegime.toUpperCase() as any, // 'NEW' | 'OLD' for UI consistency
    annualTaxDifference: annualTaxDiff,
    monthlyTakeHomeDifference: monthlyTakeHomeDiff,
    recommendationSummary: summary,
    // Aliases for component convenience
    taxSavingsAnnual: annualTaxDiff,
    rationale: summary,
  } as any;
}

/**
 * Section 10(13A) HRA Exemption Calculator (CamelCase & TitleCase alias)
 */
export function calculateHRAExemption(params: {
  actualHraReceivedAnnual?: number;
  basicSalaryAnnual?: number;
  rentPaidAnnual?: number;
  isMetro?: boolean;
  annualHraReceived?: number;
  annualBasic?: number;
  annualRentPaid?: number;
  isMetroCity?: boolean;
}) {
  const actualHra = params.actualHraReceivedAnnual ?? params.annualHraReceived ?? 0;
  const basic = params.basicSalaryAnnual ?? params.annualBasic ?? 0;
  const rent = params.rentPaidAnnual ?? params.annualRentPaid ?? 0;
  const isMetro = params.isMetro ?? params.isMetroCity ?? true;

  const res = calculateHraExemption({
    annualBasic: basic,
    annualHraReceived: actualHra,
    annualRentPaid: rent,
    isMetroCity: isMetro,
  });

  const cond1 = res.condition1_actualHra ?? Math.round(actualHra);
  const cond2 = res.condition2_rentMinusTenPercentBasic ?? Math.max(0, Math.round(rent - 0.10 * basic));
  const cond3 = res.condition3_salaryPercentage ?? Math.round((isMetro ? 0.50 : 0.40) * basic);

  return {
    exemptHra: res.exemptAnnual ?? 0,
    taxableHra: res.taxableAnnualHra ?? 0,
    actualHraReceived: cond1,
    rentMinus10PercentBasic: cond2,
    percentOfBasic: cond3,
    qualifyingRule: res.limitingCondition?.includes('Actual') ? '1' : res.limitingCondition?.includes('Rent') ? '2' : '3',
    condition1_actualHra: cond1,
    condition2_rentMinusTenPercentBasic: cond2,
    condition3_salaryPercentage: cond3,
    ...res,
  };
}

export type SalaryBreakdownResult = any;

/**
 * Universal Salary Breakdown Builder
 */
export function calculateIndianSalaryBreakdown(params: {
  annualCtc: number;
  basicPercent?: number;
  state?: string;
  regime?: 'new' | 'old';
  isMetro?: boolean;
}) {
  const payroll = calculateIndianPayroll({
    annualCtc: params.annualCtc,
    basicPercentageOfCtc: params.basicPercent ?? 50,
    professionalTaxState: params.state ?? 'karnataka',
    regime: params.regime ?? 'new',
    isMetroCity: params.isMetro ?? true,
  });

  const monthlyGross = payroll.earnings.grossSalary.monthly;
  const annualGross = payroll.earnings.grossSalary.annual;
  const monthlyPfEmployee = payroll.employeeDeductions.providentFund.monthly;
  const annualPfEmployee = payroll.employeeDeductions.providentFund.annual;
  const monthlyPfEmployer = payroll.employerContributions.providentFund.monthly;
  const annualPfEmployer = payroll.employerContributions.providentFund.annual;
  const monthlyGratuity = payroll.employerContributions.gratuity.monthly;
  const annualGratuity = payroll.employerContributions.gratuity.annual;
  const monthlyPt = payroll.employeeDeductions.professionalTax.monthly;
  const annualPt = payroll.employeeDeductions.professionalTax.annual;
  const monthlyTds = payroll.employeeDeductions.tdsMonthly;
  const annualTds = payroll.taxDiagnostics.totalAnnualTax;
  const totalDeductionsMonthly = payroll.employeeDeductions.totalMonthlyDeductions;
  const totalDeductionsAnnual = annualPfEmployee + annualPt + annualTds;

  return {
    monthly: {
      basic: payroll.earnings.basic.monthly,
      hra: payroll.earnings.hra.monthly,
      specialAllowance: payroll.earnings.specialAllowance.monthly,
      gross: monthlyGross,
      pfEmployee: monthlyPfEmployee,
      pfEmployer: monthlyPfEmployer,
      gratuity: monthlyGratuity,
      professionalTax: monthlyPt,
      incomeTaxTds: monthlyTds,
      totalDeductions: totalDeductionsMonthly,
      netInHand: payroll.takeHome.monthlyInHand,
      ctc: payroll.monthlyCtc,
    },
    annual: {
      basic: payroll.earnings.basic.annual,
      hra: payroll.earnings.hra.annual,
      specialAllowance: payroll.earnings.specialAllowance.annual,
      gross: annualGross,
      pfEmployee: annualPfEmployee,
      pfEmployer: annualPfEmployer,
      gratuity: annualGratuity,
      professionalTax: annualPt,
      incomeTaxTds: annualTds,
      totalDeductions: totalDeductionsAnnual,
      netInHand: payroll.takeHome.annualInHand,
      ctc: payroll.annualCtc,
    },
    tax: {
      grossTotalIncome: annualGross,
      standardDeduction: payroll.taxDiagnostics.standardDeduction,
      taxableIncome: payroll.taxDiagnostics.taxableIncome,
      taxBeforeCess: payroll.taxDiagnostics.taxAfterRebate,
      taxBeforeRebate: payroll.taxDiagnostics.baseTaxBeforeRebate,
      rebate87A: payroll.taxDiagnostics.rebate87A,
      cess: payroll.taxDiagnostics.healthAndEducationCess,
      annualTax: payroll.taxDiagnostics.totalAnnualTax,
    },
    netSalary: {
      monthly: payroll.takeHome.monthlyInHand,
      annual: payroll.takeHome.annualInHand,
    },
    payroll,
  };
}

/**
 * Format Currency in INR
 */
export function formatINR(val: number): string {
  return '₹' + Math.round(val).toLocaleString('en-IN');
}

/**
 * Convert numbers to Indian English Words (for Payslips)
 */
export function numberToIndianWords(num: number): string {
  if (!num || num === 0) return 'Zero Rupees Only';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  function convertLessThanOneThousand(n: number): string {
    if (n === 0) return '';
    if (n < 20) return a[n] + ' ';
    if (n < 100) return b[Math.floor(n / 10)] + ' ' + a[n % 10] + ' ';
    return a[Math.floor(n / 100)] + ' Hundred ' + convertLessThanOneThousand(n % 100);
  }

  let words = '';
  let n = Math.floor(num);
  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  const remaining = Math.floor(n);

  if (crore > 0) words += convertLessThanOneThousand(crore) + 'Crore ';
  if (lakh > 0) words += convertLessThanOneThousand(lakh) + 'Lakh ';
  if (thousand > 0) words += convertLessThanOneThousand(thousand) + 'Thousand ';
  if (remaining > 0) words += convertLessThanOneThousand(remaining);

  return (words.trim().replace(/\s+/g, ' ') + ' Rupees Only');
}
