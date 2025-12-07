import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StaffCard } from '@/components/staff/StaffCard';
import { StaffList } from '@/components/staff/StaffList';
import { CreateChefDialog } from '@/components/chef/CreateChefDialog';
import { mockChefs } from '@/data/mockData';
import { LayoutGrid, List, Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type StaffStatus = 'available' | 'busy' | 'break' | 'offline';
type Station = 'grill' | 'fry' | 'salad' | 'desserts' | 'main';

const statusFilters: { value: StaffStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Chefs' },
  { value: 'available', label: 'Available' },
  { value: 'busy', label: 'Busy' },
  { value: 'break', label: 'On Break' },
  { value: 'offline', label: 'Offline' },
];

const stationFilters: { value: Station | 'all'; label: string }[] = [
  { value: 'all', label: 'All Stations' },
  { value: 'grill', label: 'Grill' },
  { value: 'fry', label: 'Fry' },
  { value: 'salad', label: 'Salad' },
  { value: 'desserts', label: 'Desserts' },
  { value: 'main', label: 'Main' },
];

const ChefManagement = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StaffStatus | 'all'>('all');
  const [stationFilter, setStationFilter] = useState<Station | 'all'>('all');

  const filteredChefs = mockChefs.filter((chef) => {
    const matchesSearch = chef.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || chef.status === statusFilter;
    const matchesStation = stationFilter === 'all' || chef.station === stationFilter;
    return matchesSearch && matchesStatus && matchesStation;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Chef Management</h1>
            <p className="text-muted-foreground mt-1">Kitchen staff coordination and performance tracking</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{filteredChefs.length} chefs</span>
            <div className="flex items-center border border-border rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-1.5 rounded transition-colors',
                  viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-1.5 rounded transition-colors',
                  viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)} className="gradient-primary text-primary-foreground gap-2">
              <Plus className="h-4 w-4" />
              Add Chef
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chefs..."
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

        {/* Station Filters */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Station:</span>
          <div className="flex gap-2">
            {stationFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStationFilter(filter.value)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize',
                  stationFilter === filter.value
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chef View */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">All Chefs</h2>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredChefs.map((chef) => (
                <StaffCard key={chef.id} staff={chef} />
              ))}
            </div>
          ) : (
            <StaffList staff={filteredChefs} type="chef" />
          )}
        </div>

        {filteredChefs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No chefs found matching your filters</p>
          </div>
        )}

        {/* Create Chef Dialog */}
        <CreateChefDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />
      </div>
    </MainLayout>
  );
};

export default ChefManagement;
