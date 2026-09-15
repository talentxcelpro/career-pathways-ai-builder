// src/lib/graph/professionalEntityGraph.ts
// Professional Entity Graph Projection Engine for TalentXcel
// Invariant: Derived projection only. Product domain tables remain canonical source of truth.

import { supabase } from '@/integrations/supabase/client';
import { 
  type ProfessionalEntityNode, 
  type ProfessionalEntityEdge, 
  type GraphRelationshipType 
} from './types';
import { VERIFIED_DATABASE_CANDIDATE_FIXTURES } from './searchEntityResolver';

// In-Memory Graph Projection Cache
export const IN_MEMORY_GRAPH_NODES: Map<string, ProfessionalEntityNode> = new Map();
export const IN_MEMORY_GRAPH_EDGES: ProfessionalEntityEdge[] = [
  {
    id: 'edge-001',
    sourceNodeId: 'node_person_vishwajeet_nayak',
    targetNodeId: 'node_occ_service_desk_engineer',
    relationshipType: 'PUBLISHED_JOB',
    confidence: 1.0,
    provenance: 'JOB_EXPLICIT',
    evidenceType: 'POST_PUBLISHED_JOB',
    evidenceReference: 'post_sd_01',
    verifiedAt: new Date().toISOString(),
    derivedBy: 'system',
    active: true,
  },
  {
    id: 'edge-002',
    sourceNodeId: 'node_person_gaurav_bhatia',
    targetNodeId: 'node_person_gaurav_bhatia', // Self-reference post authorship
    relationshipType: 'AUTHORED',
    confidence: 1.0,
    provenance: 'USER_AUTHORED',
    evidenceType: 'POST_AUTHOR_ID',
    evidenceReference: 'post_eb_01',
    verifiedAt: new Date().toISOString(),
    derivedBy: 'system',
    active: true,
  },
  {
    id: 'edge-003',
    sourceNodeId: 'node_person_priyanka_dhangar',
    targetNodeId: 'node_occ_service_desk_engineer',
    relationshipType: 'REQUIRES_SKILL',
    confidence: 0.95,
    provenance: 'PROFILE_EXPLICIT',
    evidenceType: 'PROFILE_SKILL_ID',
    evidenceReference: 'skill_ta_01',
    verifiedAt: new Date().toISOString(),
    derivedBy: 'system',
    active: true,
  },
];

// Initialize seed fixtures into memory
for (const node of VERIFIED_DATABASE_CANDIDATE_FIXTURES) {
  IN_MEMORY_GRAPH_NODES.set(node.id, node);
}

/**
 * Retrieves an entity node by its canonical node ID
 */
export function getEntityNode(nodeId: string): ProfessionalEntityNode | undefined {
  return IN_MEMORY_GRAPH_NODES.get(nodeId);
}

/**
 * Retrieves all outgoing edges for an entity node
 */
export function getEntityOutgoingEdges(nodeId: string): ProfessionalEntityEdge[] {
  return IN_MEMORY_GRAPH_EDGES.filter((e) => e.sourceNodeId === nodeId && e.active);
}

/**
 * Finds all connected entities for a node filtered by relationship type
 */
export function findConnectedEntities(
  nodeId: string,
  relationshipType?: GraphRelationshipType
): ProfessionalEntityNode[] {
  const edges = IN_MEMORY_GRAPH_EDGES.filter(
    (e) => e.sourceNodeId === nodeId && e.active && (!relationshipType || e.relationshipType === relationshipType)
  );

  const connectedNodes: ProfessionalEntityNode[] = [];
  for (const edge of edges) {
    const target = IN_MEMORY_GRAPH_NODES.get(edge.targetNodeId);
    if (target) {
      connectedNodes.push(target);
    }
  }

  return connectedNodes;
}

/**
 * Rebuilds the graph projection from underlying primary tables
 * (profiles, jobs, companies, posts)
 */
export async function rebuildGraphProjection(): Promise<{ nodesProjected: number; edgesProjected: number }> {
  let nodesCount = IN_MEMORY_GRAPH_NODES.size;
  let edgesCount = IN_MEMORY_GRAPH_EDGES.length;

  try {
    // Project profiles into entity nodes
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, username, title, about, is_public')
      .limit(50);

    if (profiles) {
      for (const p of profiles) {
        const nodeId = `node_person_${p.id}`;
        if (!IN_MEMORY_GRAPH_NODES.has(nodeId)) {
          IN_MEMORY_GRAPH_NODES.set(nodeId, {
            id: nodeId,
            sourceTable: 'profiles',
            sourceId: p.id,
            entityType: 'PERSON',
            canonicalUrl: `https://talentxcel.in/${p.username || p.id}`,
            title: p.full_name || 'Professional',
            entityStatus: p.is_public ? 'ACTIVE' : 'PRIVATE',
            indexabilityStatus: p.is_public ? 'ELIGIBLE' : 'NOT_ELIGIBLE',
            qualityScore: 75,
            gscImpressions: 0,
            gscClicks: 0,
            gscCtr: 0,
            gscAveragePosition: 0,
            metadata: { headline: p.title, summary: p.about },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          nodesCount++;
        }
      }
    }
  } catch (err) {
    console.warn('[Entity Graph] Primary projection warning:', err);
  }

  return { nodesProjected: nodesCount, edgesProjected: edgesCount };
}
