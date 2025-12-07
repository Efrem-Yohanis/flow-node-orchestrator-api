import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StaffCard } from '@/components/staff/StaffCard';
import { StaffList } from '@/components/staff/StaffList';
import { CreateStaffDialog } from '@/components/staff/CreateStaffDialog';
import { mockWaiters } from '@/data/mockData';
import { LayoutGrid, List, Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type StaffStatus = 'available' | 'busy' | 'break' | 'offline';

const statusFilters: { value: StaffStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Waiters' },
  { value: 'available', label: 'Available' },
  { value: 'busy', label: 'Busy' },
  { value: 'break', label: 'On Break' },
  { value: 'offline', label: 'Offline' },
];

const WaiterManagement = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StaffStatus | 'all'>('all');

  const filteredWaiters = mockWaiters.filter((waiter) => {
    const matchesSearch = waiter.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || waiter.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Waiter Management</h1>
            <p className="text-muted-foreground mt-1">Monitor waitstaff performance and assignments</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{filteredWaiters.length} waiters</span>
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
              Add Waiter
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search waiters..."
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

        {/* Waiter View */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">All Waiters</h2>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredWaiters.map((waiter) => (
                <StaffCard key={waiter.id} staff={waiter} />
              ))}
            </div>
          ) : (
            <StaffList staff={filteredWaiters} type="waiter" />
          )}
        </div>

        {filteredWaiters.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No waiters found matching your filters</p>
          </div>
        )}

        {/* Create Waiter Dialog */}
        <CreateStaffDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          type="waiter"
        />
      </div>
    </MainLayout>
  );
};

export default WaiterManagement;
