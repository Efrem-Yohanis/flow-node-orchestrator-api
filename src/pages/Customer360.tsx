import { useState } from "react";
import { Search, User, MapPin, Calendar, CreditCard, Gift, Shield, MessageSquare, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useCustomer360 } from "@/hooks/useCustomer";

export default function Customer360() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedMsisdn, setSearchedMsisdn] = useState<string | null>(null);

  const { data: customer, isLoading, error, isError } = useCustomer360(searchedMsisdn);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setSearchedMsisdn(searchQuery.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Customer 360°</h1>
        <p className="text-muted-foreground">Complete customer profile and activity view</p>
      </div>

      {/* Search */}
      <div className="flex gap-4 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by MSISDN (e.g., 254712456789)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading customer data...</span>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-6">
            <p className="text-destructive text-center">
              {error instanceof Error ? error.message : "Failed to fetch customer data"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* No Search Yet */}
      {!searchedMsisdn && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Enter an MSISDN to view customer details</p>
          </CardContent>
        </Card>
      )}

      {/* Customer Data */}
      {customer && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar & Status */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{customer.profile.initials}</span>
                </div>
                <div>
                  <p className="font-semibold text-lg">{customer.profile.name}</p>
                  <p className="text-muted-foreground">{customer.profile.msisdn}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge className="bg-success/10 text-success border-success/20">
                      {customer.profile.status}
                    </Badge>
                    <Badge variant="outline">{customer.profile.tier}</Badge>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">KYC Level:</span>
                  <span className="font-medium">{customer.profile.kycLevel}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">
                    {customer.profile.demographics.city}, {customer.profile.demographics.region}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Demographics:</span>
                  <span className="font-medium">
                    {customer.profile.demographics.gender}, {customer.profile.demographics.age} years
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Registered:</span>
                  <span className="font-medium">{formatDate(customer.profile.dates.registered)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Last Active:</span>
                  <span className="font-medium">{formatDate(customer.profile.dates.lastActive)}</span>
                </div>
              </div>

              {/* Value Metrics */}
              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Lifetime Value</span>
                  <span className="font-bold">
                    {customer.metrics.currency} {customer.metrics.lifetimeValue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Monthly Avg</span>
                  <span className="font-medium">
                    {customer.metrics.currency} {customer.metrics.monthlyAvg.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* AI Insights */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">AI Insights</h4>
                <div
                  className={cn(
                    "p-3 rounded-lg border",
                    customer.aiInsights.churnRisk === "Low"
                      ? "bg-success/10 border-success/20"
                      : customer.aiInsights.churnRisk === "Medium"
                      ? "bg-warning/10 border-warning/20"
                      : "bg-destructive/10 border-destructive/20"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Churn Score</span>
                    <span
                      className={cn(
                        "font-bold",
                        customer.aiInsights.churnRisk === "Low"
                          ? "text-success"
                          : customer.aiInsights.churnRisk === "Medium"
                          ? "text-warning"
                          : "text-destructive"
                      )}
                    >
                      {customer.aiInsights.churnScore}% {customer.aiInsights.churnRisk}
                    </span>
                  </div>
                  <Progress
                    value={customer.aiInsights.churnScore}
                    className={cn(
                      "h-2",
                      customer.aiInsights.churnRisk === "Low"
                        ? "[&>div]:bg-success"
                        : customer.aiInsights.churnRisk === "Medium"
                        ? "[&>div]:bg-warning"
                        : "[&>div]:bg-destructive"
                    )}
                  />
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Recommended Action:</p>
                  <p className="text-sm font-medium mt-1">{customer.aiInsights.recommendedAction}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="transactions">
                <TabsList className="mb-4">
                  <TabsTrigger value="transactions" className="gap-2">
                    <CreditCard className="w-4 h-4" />
                    Transactions
                  </TabsTrigger>
                  <TabsTrigger value="campaigns" className="gap-2">
                    <Gift className="w-4 h-4" />
                    Campaigns
                  </TabsTrigger>
                  <TabsTrigger value="messages" className="gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Messages
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="transactions" className="space-y-3">
                  {customer.activities.transactions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-6">No transactions found</p>
                  ) : (
                    customer.activities.transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-accent">
                            <CreditCard className="w-4 h-4 text-accent-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{tx.type}</p>
                            <p className="text-sm text-muted-foreground">{tx.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {customer.metrics.currency} {tx.amount.toLocaleString()}
                          </p>
                          <Badge
                            variant="outline"
                            className="bg-success/10 text-success border-success/20 text-xs"
                          >
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="campaigns" className="space-y-3">
                  {customer.activities.campaigns.length === 0 ? (
                    <p className="text-muted-foreground text-center py-6">No campaigns found</p>
                  ) : (
                    customer.activities.campaigns.map((campaign) => (
                      <div
                        key={campaign.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-accent">
                            <Gift className="w-4 h-4 text-accent-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{campaign.name}</p>
                            <p className="text-sm text-muted-foreground">{campaign.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{campaign.reward}</p>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              campaign.status === "Activated"
                                ? "bg-success/10 text-success border-success/20"
                                : "bg-info/10 text-info border-info/20"
                            )}
                          >
                            {campaign.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="messages" className="space-y-3">
                  {customer.activities.messages.length === 0 ? (
                    <p className="text-muted-foreground text-center py-6">No messages found</p>
                  ) : (
                    customer.activities.messages.map((message) => (
                      <div
                        key={message.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-accent">
                            <MessageSquare className="w-4 h-4 text-accent-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{message.channel}</p>
                              <Badge variant="outline" className="text-xs">
                                {message.channel}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{message.date}</p>
                            <p className="text-sm mt-1 line-clamp-1">{message.content}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
