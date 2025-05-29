
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Plus, Filter } from 'lucide-react';

interface EmptyProps {
  darkMode: boolean;
  hasFilters: boolean;
}

export const Empty: React.FC<EmptyProps> = ({ darkMode, hasFilters }) => {
  return (
    <Card className={`p-12 text-center ${
      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
    }`}>
      <div className="max-w-md mx-auto">
        {hasFilters ? (
          <>
            <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${
              darkMode ? 'bg-slate-700' : 'bg-slate-100'
            }`}>
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
              No tasks match your filters
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Try adjusting your search criteria or clearing the filters to see more tasks.
            </p>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Clear Filters
            </Button>
          </>
        ) : (
          <>
            <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${
              darkMode ? 'bg-slate-700' : 'bg-slate-100'
            }`}>
              <Plus className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
              No tasks yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Start by creating your first task using natural language. Try something like "Review proposal John by tomorrow 5pm".
            </p>
            <div className={`p-4 rounded-lg ${
              darkMode ? 'bg-slate-700/50' : 'bg-slate-50'
            }`}>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                💡 <strong>Pro tip:</strong> You can include assignees, due dates, and priorities in natural language
              </p>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};
