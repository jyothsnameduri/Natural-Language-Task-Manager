import React, { useState, useEffect } from 'react';
import { TaskInput } from '@/components/TaskInput';
import { MeetingMinutesInput } from '@/components/MeetingMinutesInput';
import { TaskBoard } from '@/components/TaskBoard';
import { FilterPanel } from '@/components/FilterPanel';
import { TaskAnalytics } from '@/components/TaskAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Settings, Moon, Sun, Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export interface Task {
  id: string;
  title: string;
  assignee: string;
  dueDate: Date | null;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: Date;
}

export interface FilterState {
  search: string;
  assignee: string;
  priority: string;
  status: string;
  sortBy: 'dueDate' | 'priority' | 'assignee' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    assignee: '',
    priority: '',
    status: '',
    sortBy: 'dueDate',
    sortOrder: 'asc'
  });
  const [darkMode, setDarkMode] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const { toast } = useToast();

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        createdAt: new Date(task.createdAt)
      }));
      setTasks(parsedTasks);
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setTasks(prev => [newTask, ...prev]);
    
    toast({
      title: "Task Created",
      description: `"${task.title}" has been added to your task list.`,
    });
  };

  const addTasks = (newTasks: Omit<Task, 'id' | 'createdAt'>[]) => {
    const tasksWithIds = newTasks.map((task, index) => ({
      ...task,
      id: (Date.now() + index).toString(),
      createdAt: new Date()
    }));
    
    setTasks(prev => [...tasksWithIds, ...prev]);
    
    toast({
      title: "Meeting Tasks Added",
      description: `${newTasks.length} tasks have been extracted and added to your task list.`,
    });
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    
    toast({
      title: "Task Deleted",
      description: "The task has been removed from your list.",
    });
  };

  const uniqueAssignees = Array.from(new Set(tasks.map(task => task.assignee).filter(Boolean)));

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-slate-900 text-slate-100' 
        : 'bg-gradient-to-br from-slate-50 via-white to-violet-50'
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${
        darkMode 
          ? 'bg-slate-900/90 border-slate-700' 
          : 'bg-white/90 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  TaskFlow Pro
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search tasks..."
                  className="pl-10 w-64 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={showAnalytics ? 'bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-400' : ''}
              >
                Analytics
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDarkMode(!darkMode)}
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2
            className="
              text-5xl sm:text-6xl font-extrabold
              bg-gradient-to-r from-violet-700 via-fuchsia-500 to-blue-600
              bg-clip-text text-transparent
              drop-shadow-lg
              text-center
              mb-4
              tracking-tight
              animate-gradient-x
            "
            style={{
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            <span className="inline-block align-middle">🚀</span> Intelligent Task Management
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Transform your productivity with natural language task creation
          </p>
        </div>

        {/* Task Input Tabs */}
        <div className="mb-8">
          <Tabs defaultValue="single" className="w-full">
            <TabsList className={`grid w-full grid-cols-2 mb-6 ${
              darkMode ? 'bg-slate-800' : 'bg-slate-100'
            }`}>
              <TabsTrigger value="single" className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Single Task Entry</span>
              </TabsTrigger>
              <TabsTrigger value="meeting" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Meeting Minutes</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="single" className="mt-0">
              <TaskInput onAddTask={addTask} darkMode={darkMode} />
            </TabsContent>
            
            <TabsContent value="meeting" className="mt-0">
              <MeetingMinutesInput onAddTasks={addTasks} darkMode={darkMode} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Analytics Panel */}
        {showAnalytics && (
          <div className="mb-8">
            <TaskAnalytics tasks={tasks} darkMode={darkMode} />
          </div>
        )}

        {/* Filters */}
        <div className="mb-6">
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            assignees={uniqueAssignees}
            darkMode={darkMode}
          />
        </div>

        {/* Task Board */}
        <TaskBoard
          tasks={tasks}
          filters={filters}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
          darkMode={darkMode}
        />
      </main>
    </div>
  );
};

export default Index;
