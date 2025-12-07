import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { CreateCampaignDialog } from '@/components/campaigns/CreateCampaignDialog';
import { mockCampaigns } from '@/data/mockData';
import { Megaphone, Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type CampaignStatus = 'active' | 'scheduled' | 'completed' | 'draft';
type CampaignType = 'email' | 'sms' | 'push' | 'in-app';

const statusFilters: { value: CampaignStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Campaigns' },
  { value: 'active', label: 'Active' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'draft', label: 'Draft' },
];

const typeFilters: { value: CampaignType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'push', label: 'Push' },
  { value: 'in-app', label: 'In-App' },
];

const Advertisements = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<CampaignType | 'all'>('all');
  const navigate = useNavigate();

  const filteredCampaigns = mockCampaigns.filter((campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesType = typeFilter === 'all' || campaign.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-status-delivered/10 text-status-delivered border-status-delivered/20',
      scheduled: 'bg-status-info/10 text-status-info border-status-info/20',
      completed: 'bg-status-pending/10 text-status-pending border-status-pending/20',
      draft: 'bg-muted text-muted-foreground border-border',
    };
    return styles[status as keyof typeof styles] || styles.draft;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Advertisement Management</h1>
            <p className="text-muted-foreground mt-1">Targeted marketing and customer engagement</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{filteredCampaigns.length} campaigns</span>
            <Button onClick={() => setCreateDialogOpen(true)} className="gradient-primary text-primary-foreground gap-2">
              <Plus className="h-4 w-4" />
              New Campaign
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {statusFilters.map((filter) => (
              <Button
                key={filter.value}
                variant={statusFilter === filter.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(filter.value)}
                className={cn(
                  'whitespace-nowrap',
                  statusFilter === filter.value && 'gradient-primary text-primary-foreground'
                )}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Type Filters */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Type:</span>
          <div className="flex gap-2">
            {typeFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setTypeFilter(filter.value)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize',
                  typeFilter === filter.value
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Campaigns List */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">All Campaigns</h2>
          </div>
          <div className="divide-y divide-border">
            {filteredCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                onClick={() => navigate(`/advertisements/${campaign.id}`)}
                className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Megaphone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{campaign.name}</p>
                    <p className="text-sm text-muted-foreground">{campaign.targetSegment.join(', ')} • {campaign.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{campaign.sentCount.toLocaleString()} sent</p>
                    <p className="text-xs text-muted-foreground">{campaign.openRate}% open rate</p>
                  </div>
                  <Badge variant="outline" className={cn('capitalize', getStatusBadge(campaign.status))}>
                    {campaign.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {filteredCampaigns.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No campaigns found matching your filters</p>
          </div>
        )}

        {/* Create Campaign Dialog */}
        <CreateCampaignDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      </div>
    </MainLayout>
  );
};

export default Advertisements;
