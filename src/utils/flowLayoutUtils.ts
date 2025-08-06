// Automatic layout utilities for flow diagrams

export interface FlowNode {
  id: string;
  incoming_edges: Array<{ from_node: string; to_node: string }>;
  outgoing_edges: Array<{ from_node: string; to_node: string }>;
}

export interface LayoutNode {
  id: string;
  x: number;
  y: number;
  level: number;
}

/**
 * Calculate automatic layout for flow nodes using a hierarchical approach
 */
export function calculateFlowLayout(flowNodes: FlowNode[]): Map<string, LayoutNode> {
  const nodeMap = new Map<string, FlowNode>();
  const layoutMap = new Map<string, LayoutNode>();
  
  // Build node map for quick lookup
  flowNodes.forEach(node => {
    nodeMap.set(node.id, node);
  });
  
  // Find root nodes (nodes with no incoming edges)
  const rootNodes = flowNodes.filter(node => 
    !node.incoming_edges || node.incoming_edges.length === 0
  );
  
  // If no clear root nodes, take the first node as root
  if (rootNodes.length === 0 && flowNodes.length > 0) {
    rootNodes.push(flowNodes[0]);
  }
  
  // Calculate levels using BFS
  const visited = new Set<string>();
  const queue: Array<{ nodeId: string; level: number }> = [];
  
  // Start with root nodes at level 0
  rootNodes.forEach(node => {
    queue.push({ nodeId: node.id, level: 0 });
  });
  
  while (queue.length > 0) {
    const { nodeId, level } = queue.shift()!;
    
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);
    
    // Set initial layout for this node
    layoutMap.set(nodeId, {
      id: nodeId,
      x: 0, // Will be calculated later
      y: level * 200 + 100,
      level
    });
    
    // Add child nodes to queue
    const node = nodeMap.get(nodeId);
    if (node?.outgoing_edges) {
      node.outgoing_edges.forEach(edge => {
        if (!visited.has(edge.to_node)) {
          queue.push({ nodeId: edge.to_node, level: level + 1 });
        }
      });
    }
  }
  
  // Handle any remaining unvisited nodes (isolated nodes)
  flowNodes.forEach(node => {
    if (!visited.has(node.id)) {
      const maxLevel = Math.max(...Array.from(layoutMap.values()).map(n => n.level), -1);
      layoutMap.set(node.id, {
        id: node.id,
        x: 0,
        y: (maxLevel + 1) * 200 + 100,
        level: maxLevel + 1
      });
    }
  });
  
  // Calculate X positions to avoid overlaps
  calculateXPositions(layoutMap);
  
  return layoutMap;
}

/**
 * Calculate X positions for nodes at each level to avoid overlaps
 */
function calculateXPositions(layoutMap: Map<string, LayoutNode>) {
  // Group nodes by level
  const levelGroups = new Map<number, LayoutNode[]>();
  
  layoutMap.forEach(node => {
    if (!levelGroups.has(node.level)) {
      levelGroups.set(node.level, []);
    }
    levelGroups.get(node.level)!.push(node);
  });
  
  // Calculate X positions for each level
  levelGroups.forEach((nodes, level) => {
    const nodeWidth = 250; // Approximate node width + margin
    const totalWidth = nodes.length * nodeWidth;
    const startX = Math.max(100, (window.innerWidth - totalWidth) / 2);
    
    nodes.forEach((node, index) => {
      node.x = startX + (index * nodeWidth);
    });
  });
}

/**
 * Get optimal viewport fit for the layout
 */
export function getViewportFit(layoutMap: Map<string, LayoutNode>) {
  if (layoutMap.size === 0) {
    return { x: 0, y: 0, zoom: 1 };
  }
  
  const nodes = Array.from(layoutMap.values());
  const minX = Math.min(...nodes.map(n => n.x));
  const maxX = Math.max(...nodes.map(n => n.x));
  const minY = Math.min(...nodes.map(n => n.y));
  const maxY = Math.max(...nodes.map(n => n.y));
  
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  
  return {
    x: centerX,
    y: centerY,
    zoom: 0.8
  };
}

/**
 * Detect cycles in the flow to handle self-referencing edges
 */
export function detectCycles(flowNodes: FlowNode[]): boolean {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  
  function hasCycleDFS(nodeId: string, nodeMap: Map<string, FlowNode>): boolean {
    if (recursionStack.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;
    
    visited.add(nodeId);
    recursionStack.add(nodeId);
    
    const node = nodeMap.get(nodeId);
    if (node?.outgoing_edges) {
      for (const edge of node.outgoing_edges) {
        if (hasCycleDFS(edge.to_node, nodeMap)) {
          return true;
        }
      }
    }
    
    recursionStack.delete(nodeId);
    return false;
  }
  
  const nodeMap = new Map(flowNodes.map(node => [node.id, node]));
  
  for (const node of flowNodes) {
    if (!visited.has(node.id)) {
      if (hasCycleDFS(node.id, nodeMap)) {
        return true;
      }
    }
  }
  
  return false;
}