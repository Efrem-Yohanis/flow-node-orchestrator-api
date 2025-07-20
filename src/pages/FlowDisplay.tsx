import { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  Panel
} from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { transformFlowData, getFlowStats } from '@/utils/flowDataTransformer';
import FlowNode from '@/components/FlowNode';
import { Activity, Layers, Play, Workflow } from 'lucide-react';

// Sample data - in a real app this would come from an API
const sampleFlowData = [
  {
    "id": "90cd2805-7e39-4982-af1a-ac10f4b15a27",
    "flow_nodes": [
      {
        "id": "23419578-6e01-4baa-ae2b-96614f1fa77f",
        "order": 1,
        "node": {
          "id": "a7fead69-8c04-4456-a13b-e4522aedfa7b",
          "version": 1,
          "is_active": true,
          "name": "Node1"
        },
        "selected_subnode": {
          "id": "d778d020-ebcb-43f3-8481-31b8fc39a199",
          "name": "subnode0",
          "version": 1,
          "parameter_values": [
            {
              "parameter": "94a76836-2f24-46ed-ba78-4ba5ef75306e",
              "parameter_key": "var1",
              "value": "1"
            }
          ]
        }
      },
      {
        "id": "f3b26907-bb08-40cc-8e87-b3b8e7b0e3f5",
        "order": 2,
        "node": {
          "id": "8e27cb30-77d6-49f5-b901-285db0d7793f",
          "version": 1,
          "is_active": true,
          "name": "Node2"
        },
        "selected_subnode": {
          "id": "9e97f89a-611a-4028-8b61-70e3ec258ccd",
          "name": "subnode2",
          "version": 1,
          "parameter_values": [
            {
              "parameter": "71b5cd2f-db6a-463a-858d-55b1bda64f6e",
              "parameter_key": "var2",
              "value": "2"
            }
          ]
        }
      }
    ],
    "version": 1,
    "is_active": true,
    "name": "flow1",
    "description": "is the test flow",
    "is_deployed": true,
    "created_by": "test flow"
  },
  {
    "id": "6bf41a03-c3ec-48b9-a3e4-8d282c60212c",
    "flow_nodes": [
      {
        "id": "2bee1055-198c-4551-8e58-709ed33795ff",
        "order": 1,
        "node": {
          "id": "a7fead69-8c04-4456-a13b-e4522aedfa7b",
          "version": 1,
          "is_active": true,
          "name": "Node1"
        },
        "selected_subnode": {
          "id": "d778d020-ebcb-43f3-8481-31b8fc39a199",
          "name": "subnode0",
          "version": 1,
          "parameter_values": [
            {
              "parameter": "94a76836-2f24-46ed-ba78-4ba5ef75306e",
              "parameter_key": "var1",
              "value": "1"
            }
          ]
        }
      },
      {
        "id": "2920cf16-e63e-44f5-9e1d-f26951d051eb",
        "order": 2,
        "node": {
          "id": "8e27cb30-77d6-49f5-b901-285db0d7793f",
          "version": 1,
          "is_active": true,
          "name": "Node2"
        },
        "selected_subnode": {
          "id": "9e97f89a-611a-4028-8b61-70e3ec258ccd",
          "name": "subnode2",
          "version": 1,
          "parameter_values": [
            {
              "parameter": "71b5cd2f-db6a-463a-858d-55b1bda64f6e",
              "parameter_key": "var2",
              "value": "2"
            }
          ]
        }
      },
      {
        "id": "200b26a2-2e10-499a-bd63-fbd4385d1010",
        "order": 2,
        "node": {
          "id": "6dbd9789-a7fc-4bda-a96b-2f9ebc9bd8a2",
          "version": 1,
          "is_active": true,
          "name": "Node4"
        },
        "selected_subnode": {
          "id": "17fe9221-9b5e-4bba-8d93-cdb8e3bfaed6",
          "name": "subnode4",
          "version": 1,
          "parameter_values": []
        }
      },
      {
        "id": "ba81bf23-20bb-4155-af39-ca677fa46562",
        "order": 2,
        "node": {
          "id": "c0492224-395d-4edb-a0c3-0debb9f5abeb",
          "version": 1,
          "is_active": true,
          "name": "Node 4"
        },
        "selected_subnode": {
          "id": "f52284ca-ec64-4166-b765-0b28068a7141",
          "name": "sub4",
          "version": 1,
          "parameter_values": [
            {
              "parameter": "522a50a0-088c-488d-b362-e23580bb3a25",
              "parameter_key": "test",
              "value": "34"
            }
          ]
        }
      },
      {
        "id": "d94a899e-6275-4805-82c5-bf5d79e6ad36",
        "order": 3,
        "node": {
          "id": "82176131-09dd-4ba1-8857-faca1655a2a7",
          "version": 1,
          "is_active": true,
          "name": "Node3"
        },
        "selected_subnode": {
          "id": "9360bc08-2c41-4f19-83ef-8317faef92a2",
          "name": "subnode3",
          "version": 1,
          "parameter_values": [
            {
              "parameter": "db875d43-a012-4cb8-98f0-7b76af928077",
              "parameter_key": "var3",
              "value": "3"
            },
            {
              "parameter": "2d8bbef3-8c79-4467-9d19-7fb2c17682b5",
              "parameter_key": "var4",
              "value": "4"
            }
          ]
        }
      }
    ],
    "version": 1,
    "is_active": true,
    "name": "testflow",
    "description": "",
    "is_deployed": true,
    "created_by": ""
  }
];

const nodeTypes = {
  flowNode: FlowNode,
};

export default function FlowDisplay() {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => transformFlowData(sampleFlowData),
    []
  );
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const stats = useMemo(() => getFlowStats(sampleFlowData), []);

  const fitView = () => {
    // This would typically be handled by a ref to ReactFlow
    console.log('Fit view');
  };

  return (
    <div className="h-screen w-full flex flex-col bg-flow-background">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Workflow className="w-6 h-6 text-primary" />
              Flow Display
            </h1>
            <p className="text-muted-foreground">Visualize and manage your workflow flows</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.totalFlows}</div>
                <div className="text-xs text-muted-foreground">Total Flows</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{stats.activeFlows}</div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{stats.deployedFlows}</div>
                <div className="text-xs text-muted-foreground">Deployed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">{stats.totalNodes}</div>
                <div className="text-xs text-muted-foreground">Nodes</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flow Area */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          className="bg-flow-background"
        >
          <Controls className="!bottom-8 !left-8" />
          <MiniMap 
            className="!bottom-8 !right-8"
            nodeColor={(node) => {
              if (node.data?.isActive) return 'hsl(var(--primary))';
              return 'hsl(var(--muted))';
            }}
          />
          <Background 
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            className="opacity-30"
          />
          
          {/* Flow Info Panel */}
          <Panel position="top-left" className="bg-card rounded-lg border shadow-sm p-4 max-w-sm">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Flow Information
            </h3>
            <div className="space-y-2 text-sm">
              {sampleFlowData.map((flow) => (
                <div key={flow.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <div>
                    <div className="font-medium">{flow.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {flow.flow_nodes.length} nodes • v{flow.version}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {flow.is_active && (
                      <Badge variant="secondary" className="text-xs">
                        <Activity className="w-2 h-2 mr-1" />
                        Active
                      </Badge>
                    )}
                    {flow.is_deployed && (
                      <Badge variant="default" className="text-xs">
                        Live
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}