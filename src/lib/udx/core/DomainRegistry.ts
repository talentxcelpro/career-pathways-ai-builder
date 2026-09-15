/**
 * UDX Universal Discovery & Intelligence OS v3.0
 * Universal Domain Adapter Registry
 * 
 * ARCHITECTURAL ISOLATION RULE:
 * Core modules (core, agents, possibility, reasoning) must NEVER statically import
 * from domain adapters (e.g. career, education, finance, etc.).
 * Adapters register dynamically with this registry at initialization.
 */

import { UDXIntent, UDXDomain } from './IntentTypes';
import { PossibilityPath } from '../possibility/types';

export interface DomainAdapterHandler {
  domain: UDXDomain;
  canHandle(signal: string): boolean;
  toIntent(signal: string): UDXIntent;
  generatePaths(intentId: string): PossibilityPath[];
}

export class DomainRegistry {
  private static adapters: Map<UDXDomain, DomainAdapterHandler> = new Map();

  public static register(handler: DomainAdapterHandler): void {
    this.adapters.set(handler.domain, handler);
  }

  public static findHandler(signal: string): DomainAdapterHandler | undefined {
    for (const handler of this.adapters.values()) {
      if (handler.canHandle(signal)) {
        return handler;
      }
    }
    return undefined;
  }

  public static get(domain: UDXDomain): DomainAdapterHandler | undefined {
    return this.adapters.get(domain);
  }

  public static getAllDomains(): UDXDomain[] {
    return Array.from(this.adapters.keys());
  }
}
