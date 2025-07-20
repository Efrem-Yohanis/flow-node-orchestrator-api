import { Node, Edge } from '@xyflow/react';

interface FlowData {
  id: string;
  flow_nodes: Array<{
    id: string;
    order: number;
    node: {
      id: string;
      name: string;
      version: number;
      is_active: boolean;
      description?: string;
    };
    selected_subnode: {
      id: string;
      name: string;
      version: number;
      parameter_values: Array<{
        parameter_key: string;
        value: string;
        parameter: string;
      }>;
    };
  }>;
  name: string;
  description: string;
  is_active: boolean;
  is_deployed: boolean;
  created_by: string;
  version: number;
}

export function transformFlowData(flowData: FlowData[]): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  flowData.forEach((flow, flowIndex) => {
    // Sort flow nodes by order
    const sortedNodes = [...flow.flow_nodes].sort((a, b) => a.order - b.order);
    
    sortedNodes.forEach((flowNode, nodeIndex) => {
      const nodeId = `${flow.id}-${flowNode.id}`;
      
      // Transform parameters
      const parameters = flowNode.selected_subnode.parameter_values.map(param => ({
        key: param.parameter_key,
        value: param.value,
        required: false // You might want to get this from the original parameter definition
      }));

      // Create node
      const node: Node = {
        id: nodeId,
        type: 'flowNode',
        position: { 
          x: nodeIndex * 350, 
          y: flowIndex * 200 
        },
        data: {
          label: flowNode.node.name,
          description: flow.description,
          parameters,
          isActive: flowNode.node.is_active,
          isDeployed: flow.is_deployed,
          subnode: {
            name: flowNode.selected_subnode.name,
            version: flowNode.selected_subnode.version
          }
        }
      };

      nodes.push(node);

      // Create edge to next node if not the last one
      if (nodeIndex < sortedNodes.length - 1) {
        const nextNodeId = `${flow.id}-${sortedNodes[nodeIndex + 1].id}`;
        const edge: Edge = {
          id: `${nodeId}-${nextNodeId}`,
          source: nodeId,
          target: nextNodeId,
          type: 'smoothstep',
          animated: flow.is_active,
          style: { 
            strokeWidth: 2,
            stroke: flow.is_active ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'
          }
        };
        edges.push(edge);
      }
    });
  });

  return { nodes, edges };
}

export function getFlowStats(flowData: FlowData[]) {
  const totalFlows = flowData.length;
  const activeFlows = flowData.filter(flow => flow.is_active).length;
  const deployedFlows = flowData.filter(flow => flow.is_deployed).length;
  const totalNodes = flowData.reduce((acc, flow) => acc + flow.flow_nodes.length, 0);

  return {
    totalFlows,
    activeFlows,
    deployedFlows,
    totalNodes
  };
}