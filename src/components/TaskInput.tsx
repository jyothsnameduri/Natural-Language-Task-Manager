import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { parseTaskWithAI } from '@/utils/ai-parser';
import { Plus, Sparkles, User, Calendar, Flag, Loader2 } from 'lucide-react';
import { Task } from '@/pages/Index';
import { useToast } from '@/hooks/use-toast';

interface TaskInputProps {
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  darkMode: boolean;
}

export const TaskInput: React.FC<TaskInputProps> = ({ onAddTask, darkMode }) => {
  const [input, setInput] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const parseInput = async () => {
      if (!input.trim()) {
        setParsedData(null);
        return;
      }

      setIsParsing(true);
      try {
        const parsed = await parseTaskWithAI(input);
        setParsedData(parsed);
      } catch (error) {
        console.error('Error parsing input:', error);
        toast({
          title: "Parsing Error",
          description: "Failed to parse the task. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsParsing(false);
      }
    };

    // Debounce the parsing to avoid too many API calls
    const timeoutId = setTimeout(parseInput, 1000);
    return () => clearTimeout(timeoutId);
  }, [input, toast]);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    try {
      const parsed = await parseTaskWithAI(input);
      
      if (Array.isArray(parsed)) {
        // Handle multiple tasks
        parsed.forEach(task => {
          onAddTask({
            ...task,
            dueDate: task.dueDate ? new Date(task.dueDate) : null
          });
        });
        toast({
          title: "Tasks Added",
          description: `Added ${parsed.length} tasks to your list.`,
        });
      } else {
        // Handle single task
        onAddTask({
          ...parsed,
          dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null
        });
        toast({
          title: "Task Added",
          description: "Task has been added to your list.",
        });
      }
      
      setInput('');
      setParsedData(null);
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: "Failed to add the task. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  // Updated priority colors to match new color scheme
  const priorityColor = {
    P1: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800',
    P2: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-800',
    P3: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800',
    P4: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-300 dark:border-emerald-800'
  };

  const renderParsedPreview = (data: any) => {
    if (Array.isArray(data)) {
      return (
        <div className="space-y-4">
          {data.map((task, index) => (
            <div key={index} className={`p-4 rounded-xl border transition-all duration-300 ${
              darkMode 
                ? 'bg-slate-900 border-slate-600' 
                : 'bg-slate-50 border-slate-200'
            }`}>
              <h4 className="text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">
                Task {index + 1}:
              </h4>
              <div className="flex flex-wrap gap-2">
                <Badge className="flex items-center">
                  <span className="text-xs">Task:</span>
                  <span className="ml-1 font-medium">{task.title}</span>
                </Badge>
                {task.assignee && (
                  <Badge className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    {task.assignee}
                  </Badge>
                )}
                {task.dueDate && (
                  <Badge className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(task.dueDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Badge>
                )}
                <Badge className={`flex items-center border ${priorityColor[task.priority]}`}>
                  <Flag className="h-3 w-3 mr-1" />
                  {task.priority}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className={`p-4 rounded-xl mb-4 border transition-all duration-300 ${
        darkMode 
          ? 'bg-slate-900 border-slate-600' 
          : 'bg-slate-50 border-slate-200'
      }`}>
        <h4 className="text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">
          Parsed Information:
        </h4>
        <div className="flex flex-wrap gap-2">
          <Badge className="flex items-center">
            <span className="text-xs">Task:</span>
            <span className="ml-1 font-medium">{data.title}</span>
          </Badge>
          {data.assignee && (
            <Badge className="flex items-center">
              <User className="h-3 w-3 mr-1" />
              {data.assignee}
            </Badge>
          )}
          {data.dueDate && (
            <Badge className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(data.dueDate).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Badge>
          )}
          <Badge className={`flex items-center border ${priorityColor[data.priority]}`}>
            <Flag className="h-3 w-3 mr-1" />
            {data.priority}
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <div className={`p-6 rounded-2xl shadow-lg border transition-all duration-300 ${
      darkMode 
        ? 'bg-slate-800 border-slate-700' 
        : 'bg-white border-slate-200'
    }`}>
      <div className="mb-4">
        <label className="flex items-center text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
          <Sparkles className="h-4 w-4 mr-2 text-violet-500" />
          Describe your task naturally
        </label>
        
        <div className="relative">
          <Textarea
            placeholder="Try: 'Finish landing page by tomorrow 5pm, it's urgent' or 'Call client tomorrow 5pm' or 'Review documents by next Monday 2pm'"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            className={`min-h-[100px] text-lg resize-none transition-all duration-200 ${
              darkMode 
                ? 'bg-slate-900 border-slate-600 focus:border-violet-500' 
                : 'bg-slate-50 border-slate-300 focus:border-violet-500'
            }`}
          />
          {isParsing && (
            <div className="absolute right-3 top-3">
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            </div>
          )}
        </div>
        
        <p className="text-xs text-slate-500 mt-2">
          Press Cmd/Ctrl + Enter to add task
        </p>
      </div>

      {/* Real-time Preview */}
      {parsedData && renderParsedPreview(parsedData)}

      <Button
        onClick={handleSubmit}
        disabled={!input.trim() || isLoading || isParsing}
        className="w-full bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-700 hover:to-emerald-700 text-white font-medium py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none"
      >
        {isLoading ? (
          <div className="flex items-center">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Creating Task...
          </div>
        ) : (
          <div className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </div>
        )}
      </Button>
    </div>
  );
};
