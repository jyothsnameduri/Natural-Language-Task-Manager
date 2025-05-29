
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { parseNaturalLanguage } from '@/utils/nlp-parser';
import { Plus, Sparkles, User, Calendar, Flag } from 'lucide-react';
import { Task } from '@/pages/Index';

interface TaskInputProps {
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  darkMode: boolean;
}

export const TaskInput: React.FC<TaskInputProps> = ({ onAddTask, darkMode }) => {
  const [input, setInput] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (input.trim()) {
      const parsed = parseNaturalLanguage(input);
      setParsedData(parsed);
    } else {
      setParsedData(null);
    }
  }, [input]);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    
    const parsed = parseNaturalLanguage(input);
    
    // Create task from parsed data
    const newTask = {
      title: parsed.title || input,
      assignee: parsed.assignee || '',
      dueDate: parsed.dueDate,
      priority: parsed.priority as 'P1' | 'P2' | 'P3' | 'P4',
      status: 'pending' as const
    };

    onAddTask(newTask);
    setInput('');
    setParsedData(null);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  const priorityColor = {
    P1: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    P2: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    P3: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
    P4: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
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
        
        <Textarea
          placeholder="Try: 'Finish landing page Aman by 11pm 20th June' or 'Call client Rajeev tomorrow 5pm' or 'Review P1 documents Sarah by next Monday 2pm'"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          className={`min-h-[100px] text-lg resize-none transition-all duration-200 ${
            darkMode 
              ? 'bg-slate-900 border-slate-600 focus:border-violet-500' 
              : 'bg-slate-50 border-slate-300 focus:border-violet-500'
          }`}
        />
        
        <p className="text-xs text-slate-500 mt-2">
          Press Cmd/Ctrl + Enter to add task
        </p>
      </div>

      {/* Real-time Preview */}
      {parsedData && (
        <div className={`p-4 rounded-xl mb-4 border transition-all duration-300 ${
          darkMode 
            ? 'bg-slate-900 border-slate-600' 
            : 'bg-slate-50 border-slate-200'
        }`}>
          <h4 className="text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">
            Parsed Information:
          </h4>
          
          <div className="flex flex-wrap gap-2">
            {parsedData.title && (
              <Badge variant="outline" className="flex items-center">
                <span className="text-xs">Task:</span>
                <span className="ml-1 font-medium">{parsedData.title}</span>
              </Badge>
            )}
            
            {parsedData.assignee && (
              <Badge variant="outline" className="flex items-center">
                <User className="h-3 w-3 mr-1" />
                {parsedData.assignee}
              </Badge>
            )}
            
            {parsedData.dueDate && (
              <Badge variant="outline" className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {parsedData.dueDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Badge>
            )}
            
            <Badge className={`flex items-center ${priorityColor[parsedData.priority]}`}>
              <Flag className="h-3 w-3 mr-1" />
              {parsedData.priority}
            </Badge>
          </div>
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!input.trim() || isLoading}
        className="w-full bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-700 hover:to-emerald-700 text-white font-medium py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none"
      >
        {isLoading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
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
