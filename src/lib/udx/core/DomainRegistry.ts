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
  adapterId?: string;
  canHandle(signal: string, domain?: UDXDomain): boolean;
  toIntent(signal: string): UDXIntent;
  generatePaths(intentOrId: string | UDXIntent): PossibilityPath[];
}

export class DomainRegistry {
  private static adapters: Map<UDXDomain, DomainAdapterHandler> = new Map();

  public static register(handler: DomainAdapterHandler): void {
    this.adapters.set(handler.domain, handler);
  }

  /**
   * Resolves the authoritative adapter for a detected domain.
   * If domain is matched directly, confirms handler canHandle or uses domain authority.
   */
  public static resolveAdapter(domain: UDXDomain, signal?: string): DomainAdapterHandler | undefined {
    const handler = this.adapters.get(domain);
    if (handler) {
      if (!signal || handler.canHandle(signal, domain)) {
        return handler;
      }
    }
    // Fallback search across registered handlers
    if (signal) {
      return this.findHandler(signal, domain);
    }
    return undefined;
  }

  public static findHandler(signal: string, domain?: UDXDomain): DomainAdapterHandler | undefined {
    if (domain && this.adapters.has(domain)) {
      const directHandler = this.adapters.get(domain)!;
      if (directHandler.canHandle(signal, domain)) {
        return directHandler;
      }
    }

    for (const handler of this.adapters.values()) {
      if (handler.canHandle(signal, domain)) {
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

  public static clear(): void {
    this.adapters.clear();
  }
}
