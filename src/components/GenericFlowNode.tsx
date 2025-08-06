import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  CheckCircle, 
  Activity, 
  FileText, 
  Shield, 
  Plus, 
  Code, 
  Globe, 
  Archive,
  Settings
} from "lucide-react";

interface GenericFlowNodeProps {
  data: {
    label: string;
    description?: string;
    node?: any;
    selected_subnode?: any;
    parameters?: any[];
    subnodes?: any[];
  };
  selected?: boolean;
}

// Icon mapping based on node name patterns
const getNodeIcon = (nodeName: string) => {
  const name = nodeName.toLowerCase();
  
  if (name.includes('sftp') || name.includes('collector')) return Database;
  if (name.includes('fdc')) return CheckCircle;
  if (name.includes('asn1') || name.includes('decoder')) return Activity;
  if (name.includes('ascii')) return FileText;
  if (name.includes('validation')) return Shield;
  if (name.includes('enrichment')) return Plus;
  if (name.includes('encoder')) return Code;
  if (name.includes('diameter') || name.includes('interface')) return Globe;
  if (name.includes('backup')) return Archive;
  
  return Settings; // Default icon
};

// Color mapping based on node name patterns
const getNodeColor = (nodeName: string) => {
  const name = nodeName.toLowerCase();
  
  if (name.includes('sftp') || name.includes('collector')) return 'bg-blue-500';
  if (name.includes('fdc')) return 'bg-green-500';
  if (name.includes('asn1') || name.includes('decoder')) return 'bg-purple-500';
  if (name.includes('ascii')) return 'bg-yellow-500';
  if (name.includes('validation')) return 'bg-red-500';
  if (name.includes('enrichment')) return 'bg-orange-500';
  if (name.includes('encoder')) return 'bg-indigo-500';
  if (name.includes('diameter') || name.includes('interface')) return 'bg-teal-500';
  if (name.includes('backup')) return 'bg-gray-500';
  
  return 'bg-slate-500'; // Default color
};

// Get node type badge text
const getNodeTypeBadge = (nodeName: string) => {
  const name = nodeName.toLowerCase();
  
  if (name.includes('sftp') || name.includes('collector')) return 'SFTP Collector';
  if (name.includes('fdc')) return 'FDC';
  if (name.includes('asn1') || name.includes('decoder')) return 'ASN.1 Decoder';
  if (name.includes('ascii')) return 'ASCII Decoder';
  if (name.includes('validation')) return 'Validation';
  if (name.includes('enrichment')) return 'Enrichment';
  if (name.includes('encoder')) return 'Encoder';
  if (name.includes('diameter') || name.includes('interface')) return 'Diameter Interface';
  if (name.includes('backup')) return 'Backup';
  
  return 'Generic Node';
};

export const GenericFlowNode = memo(({ data, selected = false }: GenericFlowNodeProps) => {
  const IconComponent = getNodeIcon(data.label);
  const iconColorClass = getNodeColor(data.label);
  const nodeTypeBadge = getNodeTypeBadge(data.label);
  
  return (
    <div 
      className={`
        bg-card border-2 rounded-lg p-4 min-w-[200px] shadow-sm
        ${selected ? 'border-primary' : 'border-border'}
        transition-all duration-200 hover:shadow-md
      `}
    >
      <Handle 
        type="target" 
        position={Position.Left} 
        className="!bg-primary !border-background !w-3 !h-3" 
      />
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 ${iconColorClass} rounded flex items-center justify-center`}>
            <IconComponent className="w-3 h-3 text-white" />
          </div>
          <h3 className="font-medium text-sm text-foreground">{data.label}</h3>
        </div>
        
        {data.description && (
          <p className="text-xs text-muted-foreground">{data.description}</p>
        )}
        
        <div className="flex flex-wrap items-center gap-1">
          <Badge variant="outline" className="text-xs">
            {nodeTypeBadge}
          </Badge>
          
          {data.selected_subnode && (
            <Badge variant="secondary" className="text-xs">
              {data.selected_subnode.name}
            </Badge>
          )}
          
          {data.subnodes && data.subnodes.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {data.subnodes.length} subnodes
            </Badge>
          )}
          
          {data.parameters && data.parameters.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {data.parameters.length} params
            </Badge>
          )}
        </div>
        
        {data.node?.version && (
          <div className="text-xs text-muted-foreground">
            v{data.node.version}
          </div>
        )}
      </div>
      
      <Handle 
        type="source" 
        position={Position.Right} 
        className="!bg-primary !border-background !w-3 !h-3" 
      />
    </div>
  );
});

GenericFlowNode.displayName = 'GenericFlowNode';