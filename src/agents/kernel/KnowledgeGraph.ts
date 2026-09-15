// src/agents/kernel/KnowledgeGraph.ts
// Central Business Entity Knowledge Graph connecting Companies, Users, Jobs, Colleges, and Claim #1

import type { KnowledgeGraphNode, KnowledgeGraphEdge } from './types';

class KernelKnowledgeGraph {
  private nodes = new Map<string, KnowledgeGraphNode>();
  private edges: KnowledgeGraphEdge[] = [];

  upsertNode(node: KnowledgeGraphNode) {
    this.nodes.set(node.id, node);
  }

  addEdge(edge: KnowledgeGraphEdge) {
    this.edges.push(edge);
  }

  getNode(id: string): KnowledgeGraphNode | undefined {
    return this.nodes.get(id);
  }

  getEdgesForNode(nodeId: string): KnowledgeGraphEdge[] {
    return this.edges.filter((e) => e.fromNodeId === nodeId || e.toNodeId === nodeId);
  }

  getGraphSummary() {
    return {
      totalNodes: this.nodes.size,
      totalEdges: this.edges.length,
    };
  }
}

export const kernelKnowledgeGraph = new KernelKnowledgeGraph();
