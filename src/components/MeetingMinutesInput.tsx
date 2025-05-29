
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { parseMeetingMinutes } from '@/utils/meeting-parser';
import { FileText, Plus, Users, Calendar, Flag, Check, X, Edit2 } from 'lucide-react';
import { Task } from '@/pages/Index';

interface MeetingMinutesInputProps {
  onAddTasks: (tasks: Omit<Task, 'id' | 'createdAt'>[]) => void;
  darkMode: boolean;
}

export const MeetingMinutesInput: React.FC<MeetingMinutesInputProps> = ({ onAddTasks, darkMode }) => {
  const [transcript, setTranscript] = useState('');
  const [parsedTasks, setParsedTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});

  const priorityColors = {
    P1: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800',
    P2: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-800',
    P3: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800',
    P4: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-300 dark:border-emerald-800'
  };

  const handleParseMeeting = async () => {
    if (!transcript.trim()) return;

    setIsLoading(true);
    
    // Simulate API processing time for better UX
    setTimeout(() => {
      const tasks = parseMeetingMinutes(transcript);
      setParsedTasks(tasks);
      setIsLoading(false);
    }, 1500);
  };

  const handleEditTask = (index: number) => {
    setEditingIndex(index);
    setEditData(parsedTasks[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null) {
      const updatedTasks = [...parsedTasks];
      updatedTasks[editingIndex] = editData;
      setParsedTasks(updatedTasks);
      setEditingIndex(null);
      setEditData({});
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditData({});
  };

  const handleRemoveTask = (index: number) => {
    setParsedTasks(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddAllTasks = () => {
    const tasksToAdd = parsedTasks.map(task => ({
      title: task.title,
      assignee: task.assignee,
      dueDate: task.dueDate,
      priority: task.priority,
      status: 'pending' as const
    }));
    
    onAddTasks(tasksToAdd);
    setTranscript('');
    setParsedTasks([]);
  };

  const formatDueDate = (date: Date | null) => {
    if (!date) return 'No due date';
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`p-6 rounded-2xl shadow-lg border transition-all duration-300 ${
      darkMode 
        ? 'bg-slate-800 border-slate-700' 
        : 'bg-white border-slate-200'
    }`}>
      <div className="mb-6">
        <label className="flex items-center text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
          <FileText className="h-4 w-4 mr-2 text-violet-500" />
          Meeting Minutes Parser
        </label>
        
        <Textarea
          placeholder="Paste your meeting transcript here... 

Example: 'Aman you take the landing page by 10pm tomorrow. Rajeev you take care of client follow-up by Wednesday. Shreya please review the marketing deck tonight.'"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          className={`min-h-[120px] text-base resize-none transition-all duration-200 ${
            darkMode 
              ? 'bg-slate-900 border-slate-600 focus:border-violet-500' 
              : 'bg-slate-50 border-slate-300 focus:border-violet-500'
          }`}
        />
      </div>

      <Button
        onClick={handleParseMeeting}
        disabled={!transcript.trim() || isLoading}
        className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white font-medium py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none mb-6"
      >
        {isLoading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
            Parsing Meeting Minutes...
          </div>
        ) : (
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Parse Meeting Minutes
          </div>
        )}
      </Button>

      {/* Parsed Tasks Preview */}
      {parsedTasks.length > 0 && (
        <div className={`border rounded-xl p-4 transition-all duration-300 ${
          darkMode 
            ? 'bg-slate-900 border-slate-600' 
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
              Extracted Tasks ({parsedTasks.length})
            </h4>
            <Button 
              onClick={handleAddAllTasks}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add All Tasks
            </Button>
          </div>

          <div className="space-y-3">
            {parsedTasks.map((task, index) => (
              <Card key={index} className={`p-4 transition-all duration-200 hover:shadow-md ${
                darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              }`}>
                {editingIndex === index ? (
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
                      <input
                        placeholder="Assignee"
                        value={editData.assignee}
                        onChange={(e) => setEditData(prev => ({ ...prev, assignee: e.target.value }))}
                        className={`px-3 py-2 rounded-md border text-sm flex-1 ${
                          darkMode 
                            ? 'bg-slate-900 border-slate-600 text-slate-200' 
                            : 'bg-slate-50 border-slate-300 text-slate-700'
                        }`}
                      />
                      
                      <select
                        value={editData.priority}
                        onChange={(e) => setEditData(prev => ({ ...prev, priority: e.target.value }))}
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
                      <Button size="sm" onClick={handleSaveEdit} className="bg-emerald-600 hover:bg-emerald-700">
                        <Check className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        <X className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <h5 className="font-medium text-slate-900 dark:text-slate-100 leading-snug">
                        {task.title}
                      </h5>
                      
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditTask(index)}
                          className="h-7 w-7 p-0"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveTask(index)}
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {task.assignee && (
                        <Badge variant="outline" className="flex items-center">
                          <div className="w-4 h-4 bg-gradient-to-r from-violet-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium mr-1">
                            {task.assignee.charAt(0).toUpperCase()}
                          </div>
                          {task.assignee}
                        </Badge>
                      )}
                      
                      {task.dueDate && (
                        <Badge variant="outline" className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDueDate(task.dueDate)}
                        </Badge>
                      )}
                      
                      <Badge className={`flex items-center ${priorityColors[task.priority]}`}>
                        <Flag className="h-3 w-3 mr-1" />
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
