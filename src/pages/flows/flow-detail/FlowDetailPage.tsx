import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FlowCanvas } from "./FlowCanvas";
import { calculateFlowLayout } from "@/utils/flowLayoutUtils";
import axios from "axios";

export function FlowDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flow, setFlow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlowStructure = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/flows/${id}/structure/`);
        setFlow(response.data);
      } catch (err) {
        setError("Error fetching flow structure");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlowStructure();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!flow) {
    return <div>No flow found.</div>;
  }

  // Create unique nodes map to avoid duplicates
  const uniqueNodes = new Map();
  flow.flow_nodes.forEach((flowNode) => {
    if (!uniqueNodes.has(flowNode.node.id)) {
      uniqueNodes.set(flowNode.node.id, flowNode);
    }
  });

  // Prepare flow nodes for layout calculation
  const flowNodesForLayout = Array.from(uniqueNodes.values()).map(flowNode => ({
    id: flowNode.node.id,
    incoming_edges: flowNode.incoming_edges || [],
    outgoing_edges: flowNode.outgoing_edges || []
  }));

  // Calculate automatic layout
  const layoutMap = calculateFlowLayout(flowNodesForLayout);

  // Prepare nodes with calculated positions
  const nodes = Array.from(uniqueNodes.values()).map((flowNode) => {
    const layout = layoutMap.get(flowNode.node.id);
    
    return {
      id: flowNode.node.id,
      type: 'generic', // Use generic type for all nodes
      position: { 
        x: layout?.x || 100,
        y: layout?.y || 100
      },
      data: {
        label: flowNode.node.name,
        description: `Version: ${flowNode.node.version}`,
        node: flowNode.node,
        selected_subnode: flowNode.selected_subnode,
        parameters: flowNode.selected_subnode?.parameter_values || [],
        subnodes: flowNode.node.subnodes || [],
      },
    };
  });

  // Prepare edges from all outgoing edges, removing duplicates
  const uniqueEdges = new Map();
  flow.flow_nodes.forEach((flowNode) => {
    flowNode.outgoing_edges?.forEach((edge) => {
      if (!uniqueEdges.has(edge.id)) {
        uniqueEdges.set(edge.id, {
          id: edge.id,
          source: edge.from_node,
          target: edge.to_node,
          animated: true,
          label: edge.condition || undefined,
          type: 'smoothstep', // Use smooth step edges for better appearance
        });
      }
    });
  });
  
  const edges = Array.from(uniqueEdges.values());

  const getStatusBadge = () => {
    if (flow.is_running) {
      return <Badge className="bg-green-500 text-white">🟢 Running</Badge>;
    } else if (flow.is_deployed) {
      return <Badge className="bg-yellow-500 text-white">🟡 Deployed</Badge>;
    } else {
      return <Badge className="bg-red-500 text-white">🔴 Not Deployed</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold">{flow.name}</h1>
          {getStatusBadge()}
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => navigate(`/flows/${id}/edit`)}>Edit Flow</Button>
        </div>
      </div>

      {/* Flow Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <h3 className="font-semibold">Description</h3>
          <p>{flow.description}</p>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">Created At</h3>
          <p>{new Date(flow.created_at).toLocaleString()}</p>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">Created By</h3>
          <p>{flow.created_by}</p>
        </div>
      </div>

      {/* Flow Canvas */}
      <div className="h-[600px] border border-border rounded-lg">
        <FlowCanvas nodes={nodes} edges={edges} onNodeSelect={(node) => console.log(node)} />
      </div>
    </div>
  );
}