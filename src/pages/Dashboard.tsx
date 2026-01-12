import { useMemo, useState } from "react";
import { Users, UserCheck, UserPlus, TrendingDown, Moon } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { CampaignPerformance } from "@/components/dashboard/CampaignPerformance";
import { ChurnRiskWidget } from "@/components/dashboard/ChurnRiskWidget";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PageLoading } from "@/components/ui/page-loading";
import { useDashboardSummary } from "@/hooks/useDashboard";
import type { Period } from "@/services/dashboardApi";

function periodLabel(period: Period) {
  switch (period) {
    case "24h":
      return "from last 24 hours";
    case "7d":
      return "from last 7 days";
    case "30d":
      return "from last 30 days";
    case "90d":
      return "from last 90 days";
    default:
      return "from previous period";
  }
}

export default function Dashboard() {
  const [period, setPeriod] = useState<Period>("7d");
  const { data, isLoading, error, refetch, isFetching } = useDashboardSummary(period);

  const metrics = data?.data.customer_metrics.metrics;

  const cards = useMemo(() => {
    if (!metrics) return null;

    return [
      {
        title: "Total Customers",
        value: metrics.total_customers.formatted,
        change: metrics.total_customers.change,
        icon: <Users className="w-5 h-5 text-accent-foreground" />,
      },
      {
        title: "Active Customers",
        value: metrics.active_customers.formatted,
        change: metrics.active_customers.change,
        icon: <UserCheck className="w-5 h-5 text-accent-foreground" />,
      },
      {
        title: "New Registered",
        value: metrics.new_registered.formatted,
        change: metrics.new_registered.change,
        icon: <UserPlus className="w-5 h-5 text-accent-foreground" />,
      },
      {
        title: "Churner Rate",
        value: metrics.churn_rate.formatted,
        change: metrics.churn_rate.change,
        icon: <TrendingDown className="w-5 h-5 text-accent-foreground" />,
      },
      {
        title: "Dormant",
        value: metrics.dormant_customers.formatted,
        change: metrics.dormant_customers.change,
        icon: <Moon className="w-5 h-5 text-accent-foreground" />,
      },
    ];
  }, [metrics]);

  if (isLoading) {
    return <PageLoading message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-destructive">Failed to load dashboard</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  // If your ActivityChart / CampaignPerformance / ChurnRiskWidget components currently fetch internally,
  // you can ignore passing props. If you want them to be driven by API data, pass the data down.
  const summary = data?.data;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of customer engagement metrics</p>
          {data?.timestamp && (
            <p className="text-xs text-muted-foreground mt-1">
              Updated: {new Date(data.timestamp).toLocaleString()}
              {isFetching ? " (refreshing...)" : ""}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <SelectTrigger className="w-40 rounded-none">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards?.map((c) => (
          <MetricCard
            key={c.title}
            title={c.title}
            value={c.value}
            change={c.change}
            changeLabel={periodLabel(period)}
            icon={c.icon}
            className="rounded-none"
          />
        ))}
      </div>

      {/* Full Width Activity Chart */}
      {/* Option A: if ActivityChart accepts props, pass summary.activity_trend */}
      {/* <ActivityChart data={summary?.activity_trend} /> */}

      {/* Option B: keep as-is if ActivityChart fetches internally */}
      <ActivityChart />

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* <CampaignPerformance data={summary?.campaign_performance} /> */}
        {/* <ChurnRiskWidget data={summary?.churn_risk_distribution} /> */}
        <CampaignPerformance />
        <ChurnRiskWidget />
      </div>
    </div>
  );
}