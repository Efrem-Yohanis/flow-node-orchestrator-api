import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Workflow, Activity, Layers, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-glow mb-6">
            <Workflow className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Flow Display System
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Visualize, manage, and monitor your workflow flows with an intuitive node-based interface.
            Track parameters, deployment status, and execution flow in real-time.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-gradient-primary hover:opacity-90">
              <Link to="/flows" className="flex items-center gap-2">
                <Workflow className="w-5 h-5" />
                View Flows
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="border-0 shadow-flow-node hover:shadow-flow-node-hover transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Real-time Monitoring</CardTitle>
              <CardDescription>
                Monitor active flows, deployment status, and execution parameters in real-time.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-flow-node hover:shadow-flow-node-hover transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Layers className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Node Visualization</CardTitle>
              <CardDescription>
                Interactive node-based interface with detailed parameter display and flow connections.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-flow-node hover:shadow-flow-node-hover transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Workflow className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Flow Management</CardTitle>
              <CardDescription>
                Manage multiple workflows with version control, deployment tracking, and status monitoring.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
