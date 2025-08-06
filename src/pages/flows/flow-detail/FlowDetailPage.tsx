import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FlowCanvas } from "./FlowCanvas"; // Import FlowCanvas
import axios from "axios";

export function FlowDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flow, setFlow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlowDetail = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/flows/${id}/`);
        setFlow(response.data);
      } catch (err) {
        setError("Error fetching flow details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlowDetail();
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

  const getStatusBadge = () => {
    if (flow.is_running) {
      return <Badge className="bg-green-500 text-white">🟢 Running</Badge>;
    } else if (flow.is_deployed) {
      return <Badge className="bg-yellow-500 text-white">🟡 Deployed</Badge>;
    } else {
      return <Badge className="bg-red-500 text-white">🔴 Not Deployed</Badge>;
    }
  };

  // Helper function to determine node type based on name or other criteria
  const getNodeType = (nodeName: string): string => {
    const name = nodeName.toLowerCase();
    if (name.includes('sftp') || name.includes('collector')) return 'sftp_collector';
    if (name.includes('fdc')) return 'fdc';
    if (name.includes('asn1') || name.includes('decoder')) return 'asn1_decoder';
    if (name.includes('ascii')) return 'ascii_decoder';
    if (name.includes('validation')) return 'validation_bln';
    if (name.includes('enrichment')) return 'enrichment_bln';
    if (name.includes('encoder')) return 'encoder';
    if (name.includes('diameter')) return 'diameter_interface';
    if (name.includes('backup')) return 'raw_backup';
    return 'generic';
  };

  // Prepare nodes from the flow data with proper positioning
  const nodes = flow.flow_nodes.map((flowNode, index) => {
    const nodeType = getNodeType(flowNode.node.name);
    
    return {
      id: flowNode.node.id,
      type: nodeType,
      position: { 
        x: (index % 3) * 300 + 100, // Arrange in a grid pattern
        y: Math.floor(index / 3) * 200 + 100 
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

  // Prepare edges from the flow data
  const edges = flow.flow_nodes.flatMap((flowNode) =>
    flowNode.outgoing_edges.map((edge) => ({
      id: edge.id,
      source: edge.from_node,
      target: edge.to_node,
      animated: true,
      label: edge.condition || undefined,
    }))
  );

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