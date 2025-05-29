
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Clock, 
  User, 
  Flag,
  Play,
  Pause,
  CheckCircle2
} from 'lucide-react';
import { Task } from '@/pages/Index';

interface TaskCardProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  darkMode: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate, onDelete, darkMode }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    assignee: task.assignee,
    priority: task.priority
  });

  const priorityColors = {
    P1: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800',
    P2: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-800',
    P3: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-300 dark:border-emerald-800',
    P4: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
  };

  const statusColors = {
    pending: 'text-slate-600 dark:text-slate-400',
    'in-progress': 'text-blue-600 dark:text-blue-400',
    completed: 'text-emerald-600 dark:text-emerald-400'
  };

  const statusIcons = {
    pending: Clock,
    'in-progress': Play,
    completed: CheckCircle2
  };

  const handleSave = () => {
    onUpdate(task.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      title: task.title,
      assignee: task.assignee,
      priority: task.priority
    });
    setIsEditing(false);
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < -24) {
      return `${Math.abs(Math.ceil(diffInHours / 24))} days ago`;
    } else if (diffInHours < -1) {
      return `${Math.abs(Math.ceil(diffInHours))} hours ago`;
    } else if (diffInHours < 0) {
      return 'Just now';
    } else if (diffInHours < 1) {
      return 'In less than an hour';
    } else if (diffInHours < 24) {
      return `In ${Math.ceil(diffInHours)} hours`;
    } else {
      return `In ${Math.ceil(diffInHours / 24)} days`;
    }
  };

  const formatDueDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const StatusIcon = statusIcons[task.status];
  const isOverdue = task.dueDate && new Date() > task.dueDate && task.status !== 'completed';

  return (
    <Card className={`p-4 transition-all duration-300 hover:shadow-lg border-l-4 ${
      isOverdue 
        ? 'border-l-red-500' 
        : task.status === 'completed' 
          ? 'border-l-emerald-500' 
          : 'border-l-violet-500'
    } ${
      darkMode 
        ? 'bg-slate-800 border-slate-700 hover:bg-slate-750' 
        : 'bg-white border-slate-200 hover:bg-slate-50'
    }`}>
      {isEditing ? (
        <div className="space-y-3">
          <Textarea
            value={editData.title}
            onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
            className={`resize-none ${
              darkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50 border-slate-300'
            }`}
            rows={2}
          />
          
          <div className="flex gap-2">
            <Input
              placeholder="Assignee"
              value={editData.assignee}
              onChange={(e) => setEditData(prev => ({ ...prev, assignee: e.target.value }))}
              className={darkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50 border-slate-300'}
            />
            
            <select
              value={editData.priority}
              onChange={(e) => setEditData(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
              className={`px-3 py-2 rounded-md border text-sm ${
                darkMode 
                  ? 'bg-slate-900 border-slate-600 text-slate-200' 
                  : 'bg-slate-50 border-slate-300 text-slate-700'
              }`}
            >
              <option value="P1">P1</option>
              <option value="P2">P2</option>
              <option value="P3">P3</option>
              <option value="P4">P4</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
              <Check className="h-3 w-3 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div>
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <StatusIcon className={`h-4 w-4 ${statusColors[task.status]}`} />
              <Badge className={`text-xs ${priorityColors[task.priority]}`}>
                <Flag className="h-3 w-3 mr-1" />
                {task.priority}
              </Badge>
            </div>
            
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-7 w-7 p-0"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(task.id)}
                className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Title */}
          <h3 className={`font-medium mb-3 leading-snug ${
            task.status === 'completed' 
              ? 'line-through text-slate-500 dark:text-slate-400' 
              : 'text-slate-900 dark:text-slate-100'
          }`}>
            {task.title}
          </h3>

          {/* Details */}
          <div className="space-y-2">
            {task.assignee && (
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                <div className="w-6 h-6 bg-gradient-to-r from-violet-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2">
                  {task.assignee.charAt(0).toUpperCase()}
                </div>
                {task.assignee}
              </div>
            )}
            
            {task.dueDate && (
              <div className={`flex items-center text-sm ${
                isOverdue 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}>
                <Clock className="h-4 w-4 mr-2" />
                <div>
                  <div>{formatDueDate(task.dueDate)}</div>
                  <div className="text-xs">
                    {getRelativeTime(task.dueDate)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Status Actions */}
          <div className="flex gap-2 mt-4">
            {task.status === 'pending' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdate(task.id, { status: 'in-progress' })}
                className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900"
              >
                <Play className="h-3 w-3 mr-1" />
                Start
              </Button>
            )}
            
            {task.status === 'in-progress' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdate(task.id, { status: 'pending' })}
                  className="text-slate-600 border-slate-200 hover:bg-slate-50 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  <Pause className="h-3 w-3 mr-1" />
                  Pause
                </Button>
                <Button
                  size="sm"
                  onClick={() => onUpdate(task.id, { status: 'completed' })}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Complete
                </Button>
              </>
            )}
            
            {task.status === 'completed' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdate(task.id, { status: 'pending' })}
                className="text-slate-600 border-slate-200 hover:bg-slate-50 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Reopen
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};
