/**
 * UDX Universal Discovery & Intelligence OS v3.0 — Reality Engine
 * Domain Laboratory Barrel Export & Dynamic Registration
 * 
 * In accordance with the Acid Test rule:
 * Core modules do not import domain adapters.
 * Domain adapters register dynamically with DomainRegistry when loaded.
 */

import { DomainRegistry } from '../core/DomainRegistry';
import { UDXIntent, UDXDomain } from '../core/IntentTypes';
import { CareerAdapter, CareerPossibilities } from './career';
import { EducationAdapter } from './education';
import { BusinessAdapter } from './business';
import { FinanceAdapter } from './finance';
import { LocalServicesAdapter } from './local_services';
import { PersonalAdapter } from './personal';

// 1. Register Career Adapter
DomainRegistry.register({
  domain: 'CAREER',
  adapterId: 'adapter-career-v3',
  canHandle: (sig: string, domain?: UDXDomain) => {
    if (domain === 'CAREER') return true;
    const s = sig.toLowerCase();
    // Guard against local trade services leakage
    if (/\b(plumber|plumbing|electrician|carpenter|repair)\b/i.test(s)) return false;
    return /\b(job|jobs|hiring|hire|developer|engineer|internship|resume|ats|interview|salary|ctc|lpa|frontend|backend)\b/i.test(s);
  },
  toIntent: (sig: string) => CareerAdapter.toUDXCareerIntent(sig),
  generatePaths: (intentOrId: string | UDXIntent) => CareerPossibilities.generateCareerPaths(intentOrId),
});

// 2. Register Education Adapter
DomainRegistry.register({
  domain: 'EDUCATION',
  adapterId: EducationAdapter.adapterId,
  canHandle: (sig: string, domain?: UDXDomain) => {
    if (domain === 'EDUCATION') return true;
    const s = sig.toLowerCase();
    return /\b(learn|study|college|university|degree|course|master's|masters|b\.tech|m\.tech|mca|mba|tuition|syllabus|admissions|curriculum)\b/i.test(s);
  },
  toIntent: (sig: string) => EducationAdapter.toEducationIntent(sig),
  generatePaths: (intentOrId: string | UDXIntent) => EducationAdapter.generateEducationalPaths(intentOrId),
});

// 3. Register Business Adapter
DomainRegistry.register({
  domain: 'BUSINESS',
  adapterId: BusinessAdapter.adapterId,
  canHandle: (sig: string, domain?: UDXDomain) => {
    if (domain === 'BUSINESS') return true;
    const s = sig.toLowerCase();
    return /\b(msme|udyam|register business|startup|start a business|incorporation|gst registration|llp|venture|founder|market vacuum)\b/i.test(s);
  },
  toIntent: (sig: string) => BusinessAdapter.toBusinessIntent(sig),
  generatePaths: (intentOrId: string | UDXIntent) => BusinessAdapter.generateBusinessPaths(intentOrId),
});

// 4. Register Finance Adapter
DomainRegistry.register({
  domain: 'FINANCE',
  adapterId: FinanceAdapter.adapterId,
  canHandle: (sig: string, domain?: UDXDomain) => FinanceAdapter.canHandle(sig, domain),
  toIntent: (sig: string) => FinanceAdapter.toFinanceIntent(sig),
  generatePaths: (intentOrId: string | UDXIntent) => FinanceAdapter.generateFinancePaths(intentOrId),
});

// 5. Register Local Services Adapter
DomainRegistry.register({
  domain: 'LOCAL_SERVICES',
  adapterId: LocalServicesAdapter.adapterId,
  canHandle: (sig: string, domain?: UDXDomain) => LocalServicesAdapter.canHandle(sig, domain),
  toIntent: (sig: string) => LocalServicesAdapter.toLocalServicesIntent(sig),
  generatePaths: (intentOrId: string | UDXIntent) => LocalServicesAdapter.generateLocalServicesPaths(intentOrId),
});

// 6. Register Personal / General Adapter
DomainRegistry.register({
  domain: 'PERSONAL',
  adapterId: PersonalAdapter.adapterId,
  canHandle: (sig: string, domain?: UDXDomain) => PersonalAdapter.canHandle(sig, domain),
  toIntent: (sig: string) => PersonalAdapter.toPersonalIntent(sig),
  generatePaths: (intentOrId: string | UDXIntent) => PersonalAdapter.generatePersonalPaths(intentOrId),
});

// Barrel Exports
export * from './career';
export * from './education';
export * from './business';
export * from './finance';
export * from './local_services';
export * from './personal';
