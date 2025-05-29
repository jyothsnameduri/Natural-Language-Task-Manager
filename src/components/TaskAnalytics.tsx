
import React from 'react';
import { Card } from '@/components/ui/card';
import { Task } from '@/pages/Index';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { CheckCircle2, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

interface TaskAnalyticsProps {
  tasks: Task[];
  darkMode: boolean;
}

export const TaskAnalytics: React.FC<TaskAnalyticsProps> = ({ tasks, darkMode }) => {
  // Calculate basic metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const overdueTasks = tasks.filter(task => 
    task.dueDate && new Date() > task.dueDate && task.status !== 'completed'
  ).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Prepare data for charts
  const statusData = [
    { name: 'Completed', value: completedTasks, color: '#059669' },
    { name: 'In Progress', value: inProgressTasks, color: '#2563eb' },
    { name: 'Pending', value: pendingTasks, color: '#64748b' }
  ];

  const priorityData = [
    { name: 'P1', value: tasks.filter(t => t.priority === 'P1').length, color: '#dc2626' },
    { name: 'P2', value: tasks.filter(t => t.priority === 'P2').length, color: '#f97316' },
    { name: 'P3', value: tasks.filter(t => t.priority === 'P3').length, color: '#059669' },
    { name: 'P4', value: tasks.filter(t => t.priority === 'P4').length, color: '#64748b' }
  ].filter(item => item.value > 0);

  const assigneeData = Array.from(
    tasks.reduce((acc, task) => {
      if (task.assignee) {
        acc.set(task.assignee, (acc.get(task.assignee) || 0) + 1);
      }
      return acc;
    }, new Map())
  ).map(([name, count]) => ({ name, count }));

  const metrics = [
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: TrendingUp,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900'
    },
    {
      title: 'Completed',
      value: completedTasks,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900'
    },
    {
      title: 'In Progress',
      value: inProgressTasks,
      icon: Clock,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900'
    },
    {
      title: 'Overdue',
      value: overdueTasks,
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index} className={`p-4 ${
              darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {metric.value}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <IconComponent className={`h-5 w-5 ${metric.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Completion Rate */}
      <Card className={`p-6 ${
        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
          Completion Rate
        </h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className={`h-3 rounded-full ${
              darkMode ? 'bg-slate-700' : 'bg-slate-200'
            }`}>
              <div
                className="h-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {completionRate}%
          </span>
        </div>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        {totalTasks > 0 && (
          <Card className={`p-6 ${
            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          }`}>
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
              Task Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                    border: darkMode ? '1px solid #475569' : '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Assignee Distribution */}
        {assigneeData.length > 0 && (
          <Card className={`p-6 ${
            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          }`}>
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
              Tasks by Assignee
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={assigneeData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#475569' : '#e2e8f0'} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: darkMode ? '#94a3b8' : '#64748b' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: darkMode ? '#94a3b8' : '#64748b' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                    border: darkMode ? '1px solid #475569' : '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>
    </div>
  );
};
