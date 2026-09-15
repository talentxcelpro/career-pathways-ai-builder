/**
 * UDX Universal Discovery & Intelligence OS v3.0 — Reality Engine
 * Domain Laboratory Barrel Export & Dynamic Registration
 * 
 * In accordance with the Acid Test rule:
 * Core modules do not import domain adapters.
 * Domain adapters register dynamically with DomainRegistry when loaded.
 */

import { DomainRegistry } from '../core/DomainRegistry';
import { CareerAdapter, CareerPossibilities } from './career';
import { EducationAdapter } from './education';
import { BusinessAdapter } from './business';
import { FinanceAdapter } from './finance';
import { PersonalAdapter } from './personal';

// 1. Register Career Adapter
DomainRegistry.register({
  domain: 'CAREER',
  canHandle: (sig: string) => {
    const s = sig.toLowerCase();
    return s.includes('job') || s.includes('hiring') || s.includes('developer') || s.includes('engineer') || s.includes('varanasi');
  },
  toIntent: (sig: string) => CareerAdapter.toUDXCareerIntent(sig),
  generatePaths: (id: string) => CareerPossibilities.generateCareerPaths(id),
});

// 2. Register Education Adapter
DomainRegistry.register({
  domain: 'EDUCATION',
  canHandle: (sig: string) => {
    const s = sig.toLowerCase();
    return s.includes('learn ai') || s.includes('capability') || s.includes('three years');
  },
  toIntent: (sig: string) => EducationAdapter.toEducationIntent(sig),
  generatePaths: (id: string) => EducationAdapter.generateEducationalPaths(id),
});

// 3. Register Business Adapter
DomainRegistry.register({
  domain: 'BUSINESS',
  canHandle: (sig: string) => {
    const s = sig.toLowerCase();
    return s.includes('start a business') || s.includes('startup') || s.includes('vacuum') || s.includes('crowded');
  },
  toIntent: (sig: string) => BusinessAdapter.toBusinessIntent(sig),
  generatePaths: (id: string) => BusinessAdapter.generateBusinessPaths(id),
});

// 4. Register Finance Adapter
DomainRegistry.register({
  domain: 'FINANCE',
  canHandle: (sig: string) => {
    const s = sig.toLowerCase();
    return s.includes('expenses') || s.includes('20,000') || s.includes('reduce my monthly');
  },
  toIntent: (sig: string) => FinanceAdapter.toFinanceIntent(sig),
  generatePaths: (id: string) => FinanceAdapter.generateFinancePaths(id),
});

// 5. Register Personal / General Adapter
DomainRegistry.register({
  domain: 'PERSONAL',
  canHandle: (sig: string) => {
    const s = sig.toLowerCase();
    return s.includes('three hours free') || s.includes('every evening') || s.includes('improve my life');
  },
  toIntent: (sig: string) => PersonalAdapter.toPersonalIntent(sig),
  generatePaths: (id: string) => PersonalAdapter.generatePersonalPaths(id),
});

// Barrel Exports
export * from './career';
export * from './education';
export * from './business';
export * from './finance';
export * from './personal';
