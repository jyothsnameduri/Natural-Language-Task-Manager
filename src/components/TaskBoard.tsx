
import React from 'react';
import { TaskCard } from '@/components/TaskCard';
import { Task, FilterState } from '@/pages/Index';
import { Empty } from '@/components/Empty';

interface TaskBoardProps {
  tasks: Task[];
  filters: FilterState;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  darkMode: boolean;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  filters,
  onUpdateTask,
  onDeleteTask,
  darkMode
}) => {
  // Filter tasks based on current filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !filters.search || 
      task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      task.assignee.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesAssignee = !filters.assignee || task.assignee === filters.assignee;
    const matchesPriority = !filters.priority || task.priority === filters.priority;
    const matchesStatus = !filters.status || task.status === filters.status;
    
    return matchesSearch && matchesAssignee && matchesPriority && matchesStatus;
  });

  // Sort tasks based on current sort settings
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const { sortBy, sortOrder } = filters;
    let comparison = 0;
    
    switch (sortBy) {
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) comparison = 0;
        else if (!a.dueDate) comparison = 1;
        else if (!b.dueDate) comparison = -1;
        else comparison = a.dueDate.getTime() - b.dueDate.getTime();
        break;
      case 'priority':
        const priorityOrder = { P1: 1, P2: 2, P3: 3, P4: 4 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      case 'assignee':
        comparison = a.assignee.localeCompare(b.assignee);
        break;
      case 'createdAt':
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
        break;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  // Group tasks by status
  const tasksByStatus = {
    pending: sortedTasks.filter(task => task.status === 'pending'),
    'in-progress': sortedTasks.filter(task => task.status === 'in-progress'),
    completed: sortedTasks.filter(task => task.status === 'completed')
  };

  const statusConfig = {
    pending: {
      title: 'To Do',
      color: 'border-slate-300 dark:border-slate-600',
      headerColor: 'text-slate-700 dark:text-slate-300',
      count: tasksByStatus.pending.length
    },
    'in-progress': {
      title: 'In Progress',
      color: 'border-blue-300 dark:border-blue-600',
      headerColor: 'text-blue-700 dark:text-blue-300',
      count: tasksByStatus['in-progress'].length
    },
    completed: {
      title: 'Completed',
      color: 'border-emerald-300 dark:border-emerald-600',
      headerColor: 'text-emerald-700 dark:text-emerald-300',
      count: tasksByStatus.completed.length
    }
  };

  if (sortedTasks.length === 0) {
    return <Empty darkMode={darkMode} hasFilters={Object.values(filters).some(f => f !== '' && f !== 'dueDate' && f !== 'asc')} />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {Object.entries(tasksByStatus).map(([status, statusTasks]) => {
        const config = statusConfig[status as keyof typeof statusConfig];
        
        return (
          <div key={status} className="space-y-4">
            {/* Status Header */}
            <div className={`p-4 rounded-xl border-2 border-dashed ${config.color} ${
              darkMode ? 'bg-slate-800/50' : 'bg-slate-50/50'
            }`}>
              <div className="flex items-center justify-between">
                <h3 className={`font-semibold ${config.headerColor}`}>
                  {config.title}
                </h3>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  darkMode ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-600'
                }`}>
                  {config.count}
                </span>
              </div>
            </div>

            {/* Task Cards */}
            <div className="space-y-3">
              {statusTasks.map(task => (
                <div
                  key={task.id}
                  className="transform transition-all duration-200 hover:scale-[1.02]"
                >
                  <TaskCard
                    task={task}
                    onUpdate={onUpdateTask}
                    onDelete={onDeleteTask}
                    darkMode={darkMode}
                  />
                </div>
              ))}
              
              {statusTasks.length === 0 && (
                <div className={`p-8 text-center rounded-xl border-2 border-dashed ${
                  darkMode 
                    ? 'border-slate-700 text-slate-500' 
                    : 'border-slate-200 text-slate-400'
                }`}>
                  <p className="text-sm">No tasks in {config.title.toLowerCase()}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
