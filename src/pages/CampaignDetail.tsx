import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTab } from "@/components/campaign/tabs/OverviewTab";
import { AudienceTab } from "@/components/campaign/tabs/AudienceTab";
import { ChannelsTab } from "@/components/campaign/tabs/ChannelsTab";
import { RewardsTab } from "@/components/campaign/tabs/RewardsTab";
import { PerformanceTab } from "@/components/campaign/tabs/PerformanceTab";
import { LogsTab } from "@/components/campaign/tabs/LogsTab";
import { cn } from "@/lib/utils";

type CampaignStatus = "Draft" | "Pending_Approval" | "Scheduled" | "Running" | "Paused" | "Completed" | "Failed";

// Mock campaign data
const campaignData = {
  id: "CMP-2024-001",
  name: "Meskel Reactivation Campaign",
  type: "Incentive",
  objective: "Activate dormant high-value customers through targeted incentives",
  description: "This campaign targets customers who have been inactive for 60+ days with personalized rewards.",
  owner: "Abebe Kebede",
  createdDate: "2024-01-01",
  status: "Running" as CampaignStatus,
  segment: {
    name: "High Value Active",
    id: "seg-001",
    filters: "Active in last 30 days AND TXN value ≥ 5000 ETB AND Location = Addis Ababa",
  },
  schedule: {
    startDate: "2024-01-01",
    endDate: "2024-01-31",
    triggerType: "Scheduled",
    frequencyCap: "1 message per day",
  },
  aiRecommendation: true,
  kpis: {
    targeted: 45000,
    sent: 44200,
    delivered: 42300,
    rewarded: 38500,
    activated: 28900,
    cost: 385000,
    roi: 2.4,
  },
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Running":
      return "bg-success/10 text-success border-success/20";
    case "Completed":
      return "bg-info/10 text-info border-info/20";
    case "Scheduled":
      return "bg-warning/10 text-warning border-warning/20";
    case "Draft":
      return "bg-muted text-muted-foreground border-muted";
    case "Pending_Approval":
      return "bg-info/10 text-info border-info/20";
    case "Paused":
      return "bg-warning/10 text-warning border-warning/20";
    case "Failed":
      return "bg-destructive/10 text-destructive border-destructive/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "Incentive":
      return "bg-primary/10 text-primary border-primary/20";
    case "Win-back":
      return "bg-warning/10 text-warning border-warning/20";
    case "Informational":
      return "bg-info/10 text-info border-info/20";
    case "Cross-sell":
      return "bg-accent/50 text-accent-foreground border-accent/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

// Tab visibility based on status
const getVisibleTabs = (status: CampaignStatus) => {
  const alwaysVisible = ["overview", "logs"];
  const extendedTabs = ["audience", "channels", "rewards", "performance"];
  
  switch (status) {
    case "Draft":
    case "Pending_Approval":
    case "Scheduled":
      return alwaysVisible;
    case "Running":
    case "Paused":
    case "Completed":
      return [...alwaysVisible.slice(0, 1), ...extendedTabs, alwaysVisible[1]];
    default:
      return alwaysVisible;
  }
};

const tabLabels: Record<string, string> = {
  overview: "Overview",
  audience: "Audience",
  channels: "Channels",
  rewards: "Rewards",
  performance: "Performance",
  logs: "Logs & Audit",
};

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  
  const campaign = campaignData;
  const visibleTabs = getVisibleTabs(campaign.status);

  // Ensure active tab is valid for current status
  if (!visibleTabs.includes(activeTab)) {
    setActiveTab("overview");
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* System Alert Banner */}
      {campaign.status === "Failed" && (
        <div className="bg-destructive/10 border border-destructive/20 p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <span className="text-destructive font-medium">Campaign failed due to system error. Please contact support.</span>
        </div>
      )}

      {/* Back Navigation */}
      <Button variant="ghost" className="gap-2 -ml-2" onClick={() => navigate("/campaigns")}>
        <ArrowLeft className="w-4 h-4" />
        Back to Campaigns
      </Button>

      {/* Campaign Header */}
      <div className="bg-card border p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          {/* Left Side - Campaign Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{campaign.name}</h1>
              <Badge variant="outline" className={cn("font-medium", getStatusColor(campaign.status))}>
                {campaign.status.replace("_", " ")}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Campaign ID</span>
                <p className="font-medium">{campaign.id}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Type</span>
                <div className="mt-1">
                  <Badge variant="outline" className={cn("font-medium", getTypeColor(campaign.type))}>
                    {campaign.type}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Owner</span>
                <p className="font-medium">{campaign.owner}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Created</span>
                <p className="font-medium">{campaign.createdDate}</p>
              </div>
            </div>

            <div>
              <span className="text-sm text-muted-foreground">Objective</span>
              <p className="text-sm mt-1">{campaign.objective}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1 h-auto flex-wrap w-full justify-start">
          {visibleTabs.map((tab) => (
            <TabsTrigger 
              key={tab} 
              value={tab} 
              className="data-[state=active]:bg-background flex-1"
            >
              {tabLabels[tab]}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab campaign={campaign} />
        </TabsContent>

        {visibleTabs.includes("audience") && (
          <TabsContent value="audience">
            <AudienceTab />
          </TabsContent>
        )}

        {visibleTabs.includes("channels") && (
          <TabsContent value="channels">
            <ChannelsTab />
          </TabsContent>
        )}

        {visibleTabs.includes("rewards") && (
          <TabsContent value="rewards">
            <RewardsTab />
          </TabsContent>
        )}

        {visibleTabs.includes("performance") && (
          <TabsContent value="performance">
            <PerformanceTab />
          </TabsContent>
        )}

        <TabsContent value="logs">
          <LogsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
