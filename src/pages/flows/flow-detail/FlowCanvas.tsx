import React, { useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Import the generic node component
import { GenericFlowNode } from '@/components/GenericFlowNode';

const nodeTypes = {
  generic: GenericFlowNode,
};

interface FlowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodeSelect: (node: Node | null) => void;
}

export function FlowCanvas({ nodes, edges, onNodeSelect }: FlowCanvasProps) {
  const [nodeList, setNodes, onNodesChange] = useNodesState(nodes);
  const [edgeList, setEdges, onEdgesChange] = useEdgesState(edges);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges(eds => addEdge(params, eds)),
    [setEdges],
  );

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      onNodeSelect(node);
    },
    [onNodeSelect]
  );

  const onPaneClick = useCallback(() => {
    onNodeSelect(null);
  }, [onNodeSelect]);

  return (
    <div className="w-full h-full bg-canvas-background">
      <ReactFlow
        nodes={nodeList}
        edges={edgeList}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-canvas-background"
        style={{
          backgroundColor: 'hsl(var(--canvas-background))',
        }}
      >
        <Controls 
          className="bg-card border-border"
          showZoom={true}
          showFitView={true}
        />
        <MiniMap 
          className="bg-card border-border"
          maskColor="hsl(var(--canvas-background) / 0.8)"
          nodeColor="hsl(var(--primary))"
          nodeStrokeWidth={2}
        />
        <Background 
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="hsl(var(--canvas-grid))"
        />
      </ReactFlow>
    </div>
  );
}