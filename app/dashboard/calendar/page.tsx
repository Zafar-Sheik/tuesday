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
    try {
      const res = await fetch('/api/projects');
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
        return 'bg-gray-100 border-gray-300';
      case 'in_progress':
        return 'bg-blue-100 border-blue-300';
      case 'completed':
        return 'bg-green-100 border-green-300';
      case 'on_hold':
        return 'bg-yellow-100 border-yellow-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'not_started':
        return <Clock className="w-3 h-3 text-gray-500" />;
      case 'in_progress':
        return <PlayCircle className="w-3 h-3 text-blue-500" />;
      case 'completed':
        return <CheckCircle2 className="w-3 h-3 text-green-500" />;
      case 'on_hold':
        return <Clock className="w-3 h-3 text-yellow-500" />;
      default:
        return <Clock className="w-3 h-3 text-gray-500" />;
    }
  };

  const days = getDaysInMonth(currentDate);
  const todayProjects = selectedDate ? getProjectsForDate(selectedDate) : [];

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-500 mt-1">View project due dates</p>
          </div>
          
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="h-20 md:h-24" />;
              }

              const dayProjects = getProjectsForDate(date);
              const isSelected = selectedDate?.toDateString() === date.toDateString();

              return (
                <div
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={`h-20 md:h-24 p-1 md:p-2 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-50 border-2 border-indigo-500'
                      : isToday(date)
                        ? 'bg-indigo-50 border border-indigo-300'
                        : 'hover:bg-gray-50 border border-transparent'
                  } ${!isSameMonth(date) ? 'opacity-40' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isToday(date) ? 'text-indigo-600' : 'text-gray-700'
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
                      <div className="text-xs text-gray-500 pl-1">
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
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            {selectedDate
              ? `${selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} - Due Projects`
              : 'Select a date'
            }
          </h3>

          {selectedDate && todayProjects.length > 0 ? (
            <div className="space-y-3">
              {todayProjects.map((project) => (
                <div
                  key={project._id}
                  className={`p-3 rounded-lg border ${getStatusColor(project.status)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{project.name}</h4>
                      {project.projectType && (
                        <p className="text-xs text-gray-500 mt-1">{project.projectType.name}</p>
                      )}
                      {project.assignedTo && (
                        <p className="text-xs text-gray-500 mt-1">Assigned to: {project.assignedTo.name}</p>
                      )}
                    </div>
                    {getStatusIcon(project.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                {selectedDate ? 'No projects due' : 'Select a date to view due projects'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Project Legend */}
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded" />
            <span className="text-sm text-gray-600">Not Started</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded" />
            <span className="text-sm text-gray-600">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded" />
            <span className="text-sm text-gray-600">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded" />
            <span className="text-sm text-gray-600">On Hold</span>
          </div>
        </div>
      </div>
    </>
  );
}
