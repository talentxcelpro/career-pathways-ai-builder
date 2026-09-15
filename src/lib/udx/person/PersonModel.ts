/**
 * UDX Universal Discovery & Intelligence OS v3.0
 * Person Model
 * 
 * Manages identity, active context, capability verification,
 * and constraint evaluation for the entity attempting intent resolution.
 */

import { PersonContext, CapabilityAsset, ResourceAsset } from './PersonContext';
import { Constraint, LocationContext } from '../core/IntentTypes';

export class PersonModel {
  private context: PersonContext;

  constructor(initialContext?: Partial<PersonContext>) {
    this.context = {
      personId: initialContext?.personId || `person-${Date.now()}`,
      currentStateDescription: initialContext?.currentStateDescription || 'Baseline participant in UDX intent universe',
      capabilities: initialContext?.capabilities || [],
      resources: initialContext?.resources || [],
      constraints: initialContext?.constraints || [],
      preferences: initialContext?.preferences || [],
      riskTolerance: initialContext?.riskTolerance || 'BALANCED',
      economicMinimumThreshold: initialContext?.economicMinimumThreshold,
      location: initialContext?.location || { primaryLocation: 'Flexible', mobility: 'GLOBAL' },
      historySummary: initialContext?.historySummary || [],
      activeCommitments: initialContext?.activeCommitments || [],
      priorDecisions: initialContext?.priorDecisions || [],
      lastStateUpdateAt: new Date().toISOString(),
      domainExtensions: initialContext?.domainExtensions || {},
    };
  }

  public getContext(): PersonContext {
    return { ...this.context };
  }

  public addCapability(cap: CapabilityAsset): void {
    const idx = this.context.capabilities.findIndex(c => c.id === cap.id);
    if (idx >= 0) {
      this.context.capabilities[idx] = cap;
    } else {
      this.context.capabilities.push(cap);
    }
    this.context.lastStateUpdateAt = new Date().toISOString();
  }

  public addConstraint(constraint: Constraint): void {
    this.context.constraints.push(constraint);
    this.context.lastStateUpdateAt = new Date().toISOString();
  }

  public setLocation(location: LocationContext): void {
    this.context.location = location;
    this.context.lastStateUpdateAt = new Date().toISOString();
  }

  public setDomainExtension(domainKey: string, payload: unknown): void {
    if (!this.context.domainExtensions) {
      this.context.domainExtensions = {};
    }
    this.context.domainExtensions[domainKey] = payload;
    this.context.lastStateUpdateAt = new Date().toISOString();
  }

  public getDomainExtension<T = unknown>(domainKey: string): T | undefined {
    return this.context.domainExtensions?.[domainKey] as T | undefined;
  }
}
