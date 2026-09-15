/**
 * UDX Universal Discovery & Intelligence OS v3.0
 * Entity Graph
 * 
 * Graph representation of external organizations, technologies,
 * platforms, locations, and regulatory frameworks.
 */

import { WorldEntity, WorldRelationship } from './WorldModel';

export class EntityGraph {
  private adjacencyList: Map<string, WorldRelationship[]> = new Map();

  public addRelationship(rel: WorldRelationship): void {
    const list = this.adjacencyList.get(rel.sourceEntityId) || [];
    list.push(rel);
    this.adjacencyList.set(rel.sourceEntityId, list);
  }

  public getOutbound(entityId: string): WorldRelationship[] {
    return this.adjacencyList.get(entityId) || [];
  }

  public findRelatedEntities(entityId: string, relationType?: string): string[] {
    const out = this.adjacencyList.get(entityId) || [];
    return out
      .filter(r => !relationType || r.relationType === relationType)
      .map(r => r.targetEntityId);
  }
}
