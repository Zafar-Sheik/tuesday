'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Clock,
  PlayCircle,
  PauseCircle,
  CheckCircle2,
  Calendar as CalendarIcon
} from 'lucide-react';

interface Project {
  _id: string;
  name: string;
  description?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  endDate?: string;
  projectType?: {
    _id: string;
    name: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
  };
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CalendarPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    
    if (user) {
      fetchProjects();
    }
  }, [user, authLoading, router]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects?sortBy=dueDate&sortOrder=asc');
      const data = await res.json();
      if (data.success) {
        setProjects(data.data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getProjectsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return projects.filter(project => {
      if (!project.endDate) return false;
      const projectEndDate = new Date(project.endDate).toISOString().split('T')[0];
      return projectEndDate === dateStr;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started':
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'on_hold':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'not_started':
        return <Clock className="w-3 h-3 text-slate-400" />;
      case 'in_progress':
        return <PlayCircle className="w-3 h-3 text-blue-400" />;
      case 'completed':
        return <CheckCircle2 className="w-3 h-3 text-emerald-400" />;
      case 'on_hold':
        return <PauseCircle className="w-3 h-3 text-amber-400" />;
      default:
        return <Clock className="w-3 h-3 text-slate-400" />;
    }
  };

  const days = getDaysInMonth(currentDate);
  const todayProjects = selectedDate ? getProjectsForDate(selectedDate) : [];

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100">Calendar</h1>
            <p className="text-slate-400 mt-1">View project due dates</p>
          </div>

          <button
            onClick={goToToday}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:from-blue-700 hover:to-violet-700 transition-all shadow-lg shadow-blue-500/25"
          >
            Today
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-700/50 rounded-2xl p-3 md:p-6 shadow-2xl overflow-x-auto">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-base md:text-xl font-bold text-slate-100">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2 min-w-[400px]">
            {DAYS.map((day) => (
              <div key={day} className="text-center text-xs md:text-sm font-medium text-slate-500 py-1 md:py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 min-w-[400px]">
            {days.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="h-16 md:h-24" />;
              }

              const dayProjects = getProjectsForDate(date);
              const isSelected = selectedDate?.toDateString() === date.toDateString();

              return (
                 <div
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={`h-16 md:h-24 p-1 md:p-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-500/10 border border-blue-500/40'
                      : isToday(date)
                        ? 'bg-blue-500/10 border border-blue-500/30'
                        : 'hover:bg-slate-800/50 border border-transparent'
                  } ${!isSameMonth(date) ? 'opacity-40' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isToday(date) ? 'text-blue-400' : 'text-slate-300'
                  }`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    {dayProjects.slice(0, 2).map((project) => (
                      <div
                        key={project._id}
                        className={`text-xs px-1 py-0.5 rounded border truncate ${getStatusColor(project.status)}`}
                      >
                        {project.name}
                      </div>
                    ))}
                    {dayProjects.length > 2 && (
                      <div className="text-xs text-sky-500 pl-1">
                        +{dayProjects.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details */}
        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-4 md:p-6 shadow-2xl">
          <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-400" />
            {selectedDate
              ? `${selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} — Due Projects`
              : 'Select a date'}
          </h3>

          {selectedDate && todayProjects.length > 0 ? (
            <div className="space-y-3">
              {todayProjects.map((project) => (
                <div
                  key={project._id}
                  className={`p-3 rounded-lg border ${getStatusColor(project.status)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-100 text-sm truncate">{project.name}</h4>
                      {project.projectType && (
                        <p className="text-xs text-slate-400 mt-1 truncate">{project.projectType.name}</p>
                      )}
                      {project.assignedTo && (
                        <p className="text-xs text-slate-500 mt-1 truncate">Assigned to: {project.assignedTo.name}</p>
                      )}
                    </div>
                    {getStatusIcon(project.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">
                {selectedDate ? 'No projects due' : 'Select a date to view due projects'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Project Legend */}
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-4 md:p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-500/20 border border-slate-500/30 rounded" />
            <span className="text-sm text-slate-400">Not Started</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500/20 border border-blue-500/30 rounded" />
            <span className="text-sm text-slate-400">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-500/20 border border-emerald-500/30 rounded" />
            <span className="text-sm text-slate-400">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500/20 border border-amber-500/30 rounded" />
            <span className="text-sm text-slate-400">On Hold</span>
          </div>
        </div>
      </div>
    </>
  );
}
