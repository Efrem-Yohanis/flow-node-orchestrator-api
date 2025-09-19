import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";

import { MainLayout } from "@/components/layout/main-layout";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { StreamsPage } from "@/pages/StreamsPage";
import { UnifiedAlertsPage } from "@/pages/UnifiedAlertsPage";
import { UnifiedReportsPage } from "@/pages/UnifiedReportsPage";
import { FlowDetailPage } from "@/pages/flows/flow-detail/FlowDetailPage";
import { FlowEditorRoute } from '@/pages/flows/flow-editor/FlowEditorRoute';
import { CreateNodePage } from "@/pages/nodes/create-node/CreateNodePage";
import { NodeDetailPage } from "@/pages/nodes/node-detail/NodeDetailPage";
import { EditNodePage } from "@/pages/nodes/edit-node/EditNodePage";
import { TestNodePage } from "@/pages/nodes/test-node/TestNodePage";
import { SubnodeDetailPage } from "@/pages/subnodes/subnode-detail/SubnodeDetailPage";
import { EditSubnodePage } from "@/pages/subnodes/edit-subnode/EditSubnodePage";
import { EditVersionPage } from "@/pages/subnodes/edit-version/EditVersionPage";
import { EditVersionPage as EditNodeVersionPage } from "@/pages/nodes/edit-version/EditVersionPage";
import { CreateSubnodePage } from "@/pages/subnodes/create-subnode/CreateSubnodePage";
import { ParameterDetailPage } from "@/pages/parameters/parameter-detail/ParameterDetailPage";
import { CreateParameterPage } from "@/pages/parameters/create-parameter/CreateParameterPage";
import { EditParameterPage } from "@/pages/parameters/edit-parameter/EditParameterPage";
import { EdgesPage } from "@/pages/edges/EdgesPage";
import { DevToolPage } from "@/pages/DevToolPage";
import { StreamDetailPage } from "@/pages/StreamDetailPage";
import { FlowsRedirect } from "@/components/redirects/FlowsRedirect";
import { NodesRedirect } from "@/components/redirects/NodesRedirect";
import { SubnodesRedirect } from "@/components/redirects/SubnodesRedirect";
import { ParametersRedirect } from "@/components/redirects/ParametersRedirect";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Login Route - No Layout */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Main App Routes with Layout */}
          <Route path="/*" element={
            <MainLayout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                
                {/* New unified routes */}
                <Route path="/streams" element={<StreamsPage />} />
                <Route path="/streams/:streamId" element={<StreamDetailPage />} />
                <Route path="/alerts" element={<UnifiedAlertsPage />} />
                <Route path="/reports" element={<UnifiedReportsPage />} />
                <Route path="/devtool" element={<DevToolPage />} />
                
                {/* Legacy routes - keep for backward compatibility */}
                <Route path="/flows" element={<FlowsRedirect />} />
                <Route path="/flows/:id" element={<FlowDetailPage />} />
                <Route path="/flows/:id/edit" element={<FlowEditorRoute />} />
                <Route path="/nodes" element={<NodesRedirect />} />
                <Route path="/nodes/new" element={<CreateNodePage />} />
                <Route path="/nodes/:id" element={<NodeDetailPage />} />
                <Route path="/nodes/:id/edit" element={<EditNodePage />} />
                <Route path="/nodes/:id/edit-version" element={<EditNodeVersionPage />} />
                <Route path="/nodes/:id/test" element={<TestNodePage />} />
                <Route path="/subnodes" element={<SubnodesRedirect />} />
                <Route path="/subnodes/:id" element={<SubnodeDetailPage />} />
                <Route path="/subnodes/create" element={<CreateSubnodePage />} />
                <Route path="/subnodes/:id/edit" element={<EditSubnodePage />} />
                <Route path="/subnodes/:id/edit-version" element={<EditVersionPage />} />
                <Route path="/parameters" element={<ParametersRedirect />} />
                <Route path="/parameters/new" element={<CreateParameterPage />} />
                <Route path="/parameters/:id" element={<ParameterDetailPage />} />
                <Route path="/parameters/:id/edit" element={<EditParameterPage />} />
                <Route path="/edges" element={<EdgesPage />} />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MainLayout>
          } />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
