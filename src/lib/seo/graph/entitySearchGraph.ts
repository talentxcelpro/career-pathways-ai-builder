// src/lib/seo/graph/entitySearchGraph.ts
/**
 * TalentXcel SEO 2.0: 10-Layer Entity-and-Intent Search Graph
 *
 * Implements the 10 interconnected search layers:
 * 1. Jobs (/jobs, /jobs/:role, /jobs/:role/:location)
 * 2. Resumes (/resume-templates/:role, /resume-examples/:role)
 * 3. ATS Intelligence (/ats-resume-checker/:role, /resume-keywords/:role, /ats-match/:role)
 * 4. Career Intelligence (/careers/:role, /careers/:role/[skills|salary|education|interview])
 * 5. Skills (/skills/:skill, /skills/:skill/[jobs|courses|certifications|resume])
 * 6. Education / Colleges (/colleges/:slug, /colleges/:slug/placements)
 * 7. Courses & Certifications (/courses/:subject, /certifications/:vendor)
 * 8. Salary Intelligence (/salary/:role, /salary/:role/:location)
 * 9. Career Passport & Identity (/passport/:role, /p/:username)
 * 10. Career Knowledge & Editorial (/career-advice/:slug, /interview-questions/:role)
 *
 * Engine includes the Real-Time Graph Flywheel:
 * - propagateEntityEvent: Propagates updates from live database entities (Jobs, Courses, Placements)
 *   to every related node in the graph, automatically re-scoring with the SEO Page Governor.
 */

import { SEOPageGovernor, GovernorEvaluationResult } from '../governor/seoPageGovernor';

export type SearchGraphLayer =
  | 'LAYER_1_JOBS'
  | 'LAYER_2_RESUME'
  | 'LAYER_3_ATS'
  | 'LAYER_4_CAREER'
  | 'LAYER_5_SKILLS'
  | 'LAYER_6_EDUCATION'
  | 'LAYER_7_COURSES'
  | 'LAYER_8_SALARY'
  | 'LAYER_9_PASSPORT'
  | 'LAYER_10_KNOWLEDGE';

export type GraphEdgeType =
  | 'REQUIRES_SKILL'
  | 'LOCATED_IN'
  | 'HIRED_BY'
  | 'HAS_RESUME_TEMPLATE'
  | 'HAS_ATS_KEYWORDS'
  | 'FEEDS_CAREER'
  | 'TAUGHT_BY_COURSE'
  | 'EDUCATED_AT'
  | 'HAS_PLACEMENT_DATA'
  | 'EARNS_PASSPORT'
  | 'BENCHMARKS_SALARY'
  | 'ANSWERS_QUESTION';

export interface GraphEdge {
  targetNodeId: string;
  relationship: GraphEdgeType;
  weight: number; // 0.1 - 1.0 (strength of contextual relevance)
}

export interface SearchGraphNode {
  id: string;
  layer: SearchGraphLayer;
  entityType: 'JOB' | 'ROLE_HUB' | 'RESUME' | 'ATS' | 'CAREER' | 'SKILL' | 'COLLEGE' | 'COLLEGE_FACET' | 'COURSE' | 'CERTIFICATION' | 'SALARY' | 'PASSPORT' | 'KNOWLEDGE';
  urlPath: string;
  canonicalUrl: string;
  title: string;
  description: string;
  structuredDataSchema: 'JobPosting' | 'CollectionPage' | 'Course' | 'CollegeOrUniversity' | 'ProfilePage' | 'Article' | 'FAQPage' | 'Dataset' | 'Occupation';
  inventoryCount: number;
  searchDemandScore: number;
  uniqueContentScore: number;
  commercialIntentScore: number;
  internalLinkAuthority: number;
  lastUpdatedDaysAgo: number;
  hasVerifiedUniqueDataset?: boolean;
  isOptInPublicProfile?: boolean;
  isSingleJobPosting?: boolean;
  governorEvaluation?: GovernorEvaluationResult;
  outboundEdges: GraphEdge[];
}

export interface EntityEvent {
  eventType: 'JOB_INSERTED' | 'JOB_EXPIRED' | 'COURSE_PUBLISHED' | 'PLACEMENT_REPORT_VERIFIED' | 'PROFILE_OPTED_IN';
  entityId: string;
  primaryRoleSlug: string;
  locationSlug?: string;
  skillSlugs?: string[];
  companySlug?: string;
  collegeSlug?: string;
  metadata?: Record<string, any>;
}

export class EntitySearchGraph {
  private nodes: Map<string, SearchGraphNode> = new Map();

  /**
   * Register or update a node in the 10-layer graph
   */
  public registerNode(node: SearchGraphNode): GovernorEvaluationResult {
    // Run evaluation through SEO Page Governor
    const evaluation = SEOPageGovernor.evaluate({
      urlPath: node.urlPath,
      entityType: node.entityType,
      searchDemandScore: node.searchDemandScore,
      inventoryCount: node.inventoryCount,
      uniqueContentScore: node.uniqueContentScore,
      commercialIntentScore: node.commercialIntentScore,
      internalLinkAuthority: node.internalLinkAuthority,
      lastUpdatedDaysAgo: node.lastUpdatedDaysAgo,
      isSingleJobPosting: node.isSingleJobPosting,
      hasVerifiedUniqueDataset: node.hasVerifiedUniqueDataset,
      isOptInPublicProfile: node.isOptInPublicProfile,
    });

    node.governorEvaluation = evaluation;
    this.nodes.set(node.id, node);
    return evaluation;
  }

  public getNode(nodeId: string): SearchGraphNode | undefined {
    return this.nodes.get(nodeId);
  }

  public getAllNodes(): SearchGraphNode[] {
    return Array.from(this.nodes.values());
  }

  public getIndexableNodes(): SearchGraphNode[] {
    return this.getAllNodes().filter(n => n.governorEvaluation?.includeInSitemap === true);
  }

  /**
   * Add a semantic edge between two entities in the graph
   */
  public addEdge(sourceId: string, targetId: string, relationship: GraphEdgeType, weight: number = 1.0): boolean {
    const sourceNode = this.nodes.get(sourceId);
    const targetNode = this.nodes.get(targetId);
    if (!sourceNode || !targetNode) return false;

    // Check if edge already exists
    const exists = sourceNode.outboundEdges.some(e => e.targetNodeId === targetId && e.relationship === relationship);
    if (!exists) {
      sourceNode.outboundEdges.push({ targetNodeId: targetId, relationship, weight });
      // Boost target node internal link authority slightly
      targetNode.internalLinkAuthority = Math.min(100, targetNode.internalLinkAuthority + 2);
    }
    return true;
  }

  /**
   * Real-Time Entity Event Flywheel:
   * When a job is added or expired in Supabase, dynamically propagates updates
   * across connected graph nodes (Role, Location, Skills, Company, Career, Resume, Salary).
   */
  public propagateEntityEvent(event: EntityEvent): {
    updatedNodeIds: string[];
    governorTransitions: Array<{ nodeId: string; previousDecision?: string; newDecision: string }>;
  } {
    const updatedNodeIds: string[] = [];
    const governorTransitions: Array<{ nodeId: string; previousDecision?: string; newDecision: string }> = [];

    const deltaInventory = event.eventType === 'JOB_INSERTED' ? 1 : event.eventType === 'JOB_EXPIRED' ? -1 : 0;

    // 1. Role Hub (Layer 1)
    const roleNodeId = `role:${event.primaryRoleSlug}`;
    const roleNode = this.nodes.get(roleNodeId);
    if (roleNode) {
      const prevDecision = roleNode.governorEvaluation?.decision;
      roleNode.inventoryCount = Math.max(0, roleNode.inventoryCount + deltaInventory);
      roleNode.lastUpdatedDaysAgo = 0;
      const newEval = this.registerNode(roleNode);
      updatedNodeIds.push(roleNodeId);
      if (prevDecision !== newEval.decision) {
        governorTransitions.push({ nodeId: roleNodeId, previousDecision: prevDecision, newDecision: newEval.decision });
      }
    }

    // 2. Role x Location Combination (Layer 1)
    if (event.locationSlug) {
      const comboNodeId = `job_combo:${event.primaryRoleSlug}:${event.locationSlug}`;
      const comboNode = this.nodes.get(comboNodeId);
      if (comboNode) {
        const prevDecision = comboNode.governorEvaluation?.decision;
        comboNode.inventoryCount = Math.max(0, comboNode.inventoryCount + deltaInventory);
        comboNode.lastUpdatedDaysAgo = 0;
        const newEval = this.registerNode(comboNode);
        updatedNodeIds.push(comboNodeId);
        if (prevDecision !== newEval.decision) {
          governorTransitions.push({ nodeId: comboNodeId, previousDecision: prevDecision, newDecision: newEval.decision });
        }
      }
    }

    // 3. Skill Nodes (Layer 5)
    if (event.skillSlugs && event.skillSlugs.length > 0) {
      event.skillSlugs.forEach(skill => {
        const skillNodeId = `skill:${skill}`;
        const skillNode = this.nodes.get(skillNodeId);
        if (skillNode) {
          skillNode.inventoryCount = Math.max(0, skillNode.inventoryCount + deltaInventory);
          skillNode.lastUpdatedDaysAgo = 0;
          this.registerNode(skillNode);
          updatedNodeIds.push(skillNodeId);
        }
      });
    }

    // 4. Career Roadmap Node (Layer 4)
    const careerNodeId = `career:${event.primaryRoleSlug}`;
    const careerNode = this.nodes.get(careerNodeId);
    if (careerNode) {
      careerNode.lastUpdatedDaysAgo = 0;
      this.registerNode(careerNode);
      updatedNodeIds.push(careerNodeId);
    }

    // 5. Resume & ATS Nodes (Layers 2 & 3)
    const resumeNodeId = `resume:${event.primaryRoleSlug}`;
    const resumeNode = this.nodes.get(resumeNodeId);
    if (resumeNode) {
      resumeNode.lastUpdatedDaysAgo = 0;
      this.registerNode(resumeNode);
      updatedNodeIds.push(resumeNodeId);
    }

    // 6. Salary Intelligence Node (Layer 8)
    const salaryNodeId = `salary:${event.primaryRoleSlug}`;
    const salaryNode = this.nodes.get(salaryNodeId);
    if (salaryNode) {
      salaryNode.inventoryCount = Math.max(0, salaryNode.inventoryCount + deltaInventory);
      salaryNode.lastUpdatedDaysAgo = 0;
      this.registerNode(salaryNode);
      updatedNodeIds.push(salaryNodeId);
    }

    return { updatedNodeIds, governorTransitions };
  }

  /**
   * Generates a breakdown of indexable nodes across all 10 layers
   */
  public getLayerDistribution(): Record<SearchGraphLayer, { total: number; indexable: number }> {
    const layers: Record<SearchGraphLayer, { total: number; indexable: number }> = {
      LAYER_1_JOBS: { total: 0, indexable: 0 },
      LAYER_2_RESUME: { total: 0, indexable: 0 },
      LAYER_3_ATS: { total: 0, indexable: 0 },
      LAYER_4_CAREER: { total: 0, indexable: 0 },
      LAYER_5_SKILLS: { total: 0, indexable: 0 },
      LAYER_6_EDUCATION: { total: 0, indexable: 0 },
      LAYER_7_COURSES: { total: 0, indexable: 0 },
      LAYER_8_SALARY: { total: 0, indexable: 0 },
      LAYER_9_PASSPORT: { total: 0, indexable: 0 },
      LAYER_10_KNOWLEDGE: { total: 0, indexable: 0 },
    };

    for (const node of this.nodes.values()) {
      layers[node.layer].total++;
      if (node.governorEvaluation?.includeInSitemap === true) {
        layers[node.layer].indexable++;
      }
    }

    return layers;
  }
}
