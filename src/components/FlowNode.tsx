import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Settings } from 'lucide-react';

interface FlowNodeProps {
  data: {
    label: string;
    description?: string;
    parameters?: Array<{
      key: string;
      value: string;
      required: boolean;
    }>;
    isActive?: boolean;
    isDeployed?: boolean;
    subnode?: {
      name: string;
      version: number;
    };
  };
}

export default memo(function FlowNode({ data }: FlowNodeProps) {
  return (
    <div className="flow-node min-w-[280px]">
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !border-2 !border-background"
      />
      
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              {data.label}
            </CardTitle>
            <div className="flex items-center gap-1">
              {data.isActive && (
                <Badge variant="secondary" className="text-xs">
                  <Play className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              )}
              {data.isDeployed && (
                <Badge variant="default" className="text-xs">
                  Deployed
                </Badge>
              )}
            </div>
          </div>
          {data.description && (
            <p className="text-xs text-muted-foreground">{data.description}</p>
          )}
        </CardHeader>
        
        <CardContent className="space-y-3">
          {data.subnode && (
            <div className="flex items-center gap-2 text-xs">
              <Settings className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">
                {data.subnode.name} v{data.subnode.version}
              </span>
            </div>
          )}
          
          {data.parameters && data.parameters.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Parameters</div>
              <div className="flex flex-wrap gap-1">
                {data.parameters.map((param) => (
                  <Badge
                    key={param.key}
                    variant={param.required ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {param.key}: {param.value}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !border-2 !border-background"
      />
    </div>
  );
});