
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FilterState } from '@/pages/Index';
import { Filter, RotateCcw, ArrowUpDown } from 'lucide-react';

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  assignees: string[];
  darkMode: boolean;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  assignees,
  darkMode
}) => {
  const updateFilter = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFiltersChange({
      search: '',
      assignee: '',
      priority: '',
      status: '',
      sortBy: 'dueDate',
      sortOrder: 'asc'
    });
  };

  const activeFiltersCount = Object.entries(filters)
    .filter(([key, value]) => 
      value !== '' && key !== 'sortBy' && key !== 'sortOrder' && key !== 'search'
    ).length;

  const toggleSortOrder = () => {
    onFiltersChange({
      ...filters,
      sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'
    });
  };

  return (
    <div className={`p-4 rounded-xl border transition-all duration-300 ${
      darkMode 
        ? 'bg-slate-800 border-slate-700' 
        : 'bg-white border-slate-200'
    }`}>
      <div className="flex flex-wrap items-center gap-3">
        {/* Filter Icon and Title */}
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Filters
          </span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </div>

        {/* Assignee Filter */}
        <Select value={filters.assignee} onValueChange={(value) => updateFilter('assignee', value)}>
          <SelectTrigger className={`w-40 h-8 text-sm ${
            darkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50 border-slate-300'
          }`}>
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Assignees</SelectItem>
            {assignees.map(assignee => (
              <SelectItem key={assignee} value={assignee}>
                {assignee}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select value={filters.priority} onValueChange={(value) => updateFilter('priority', value)}>
          <SelectTrigger className={`w-32 h-8 text-sm ${
            darkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50 border-slate-300'
          }`}>
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Priorities</SelectItem>
            <SelectItem value="P1">P1 - Urgent</SelectItem>
            <SelectItem value="P2">P2 - High</SelectItem>
            <SelectItem value="P3">P3 - Normal</SelectItem>
            <SelectItem value="P4">P4 - Low</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
          <SelectTrigger className={`w-32 h-8 text-sm ${
            darkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50 border-slate-300'
          }`}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="pending">To Do</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value as FilterState['sortBy'])}>
          <SelectTrigger className={`w-36 h-8 text-sm ${
            darkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50 border-slate-300'
          }`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dueDate">Due Date</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="assignee">Assignee</SelectItem>
            <SelectItem value="createdAt">Created</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Order Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSortOrder}
          className={`h-8 px-3 ${
            darkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-300 hover:bg-slate-50'
          }`}
        >
          <ArrowUpDown className="h-3 w-3 mr-1" />
          {filters.sortOrder === 'asc' ? 'Asc' : 'Desc'}
        </Button>

        {/* Reset Filters */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-8 px-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
};
