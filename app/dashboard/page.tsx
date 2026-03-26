'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Loader2,
  Users,
  Briefcase,
  Calendar
} from 'lucide-react';

interface DashboardData {
  success: boolean;
  data?: {
    stats: {
      totalProjects: number;
      activeProjects: number;
      completedProjects: number;
      totalTasks: number;
      completedTasks: number;
    };
    projectsByStatus: {
      not_started: number;
      in_progress: number;
      completed: number;
      on_hold: number;
    };
    recentProjects: Array<{
      _id: string;
      name: string;
      status: string;
      progress: number;
      projectType?: { name: string };
      assignedTo?: { name: string };
    }>;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<DashboardData['data'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    
    if (user) {
      fetchData();
    }
  }, [user, authLoading, router]);

  const fetchData = async () => {
    try {
      const dashboardRes = await fetch('/api/dashboard');
      const dashboardData = await dashboardRes.json();
      if (dashboardData.success) {
        setData(dashboardData.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const stats = data?.stats || {
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    completedTasks: 0
  };

  const statusData = data?.projectsByStatus || {
    not_started: 0,
    in_progress: 0,
    completed: 0,
    on_hold: 0
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user.name}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
              <FolderKanban className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-500">Total Projects</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-500">Active Projects</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-500">Completed</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.completedProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-500">Tasks Done</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.completedTasks}/{stats.totalTasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Status */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Status Cards */}
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Projects by Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-600">Not Started</span>
              <span className="font-semibold text-gray-900">{statusData.not_started}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
              <span className="text-blue-700">In Progress</span>
              <span className="font-semibold text-blue-700">{statusData.in_progress}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <span className="text-green-700">Completed</span>
              <span className="font-semibold text-green-700">{statusData.completed}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
              <span className="text-yellow-700">On Hold</span>
              <span className="font-semibold text-yellow-700">{statusData.on_hold}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => router.push('/dashboard/projects')}
              className="flex flex-col items-center justify-center p-4 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
            >
              <FolderKanban className="w-6 h-6 text-indigo-600 mb-2" />
              <span className="text-sm font-medium text-indigo-700">View Projects</span>
            </button>
            <button 
              onClick={() => router.push('/dashboard/calendar')}
              className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
            >
              <Calendar className="w-6 h-6 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-blue-700">Calendar</span>
            </button>
            {user.role === 'admin' && (
              <>
                <button 
                  onClick={() => router.push('/dashboard/users')}
                  className="flex flex-col items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
                >
                  <Users className="w-6 h-6 text-purple-600 mb-2" />
                  <span className="text-sm font-medium text-purple-700">Manage Users</span>
                </button>
                <button 
                  onClick={() => router.push('/dashboard/project-types')}
                  className="flex flex-col items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
                >
                  <Briefcase className="w-6 h-6 text-green-600 mb-2" />
                  <span className="text-sm font-medium text-green-700">Project Types</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
          <button 
            onClick={() => router.push('/dashboard/projects')}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            View All
          </button>
        </div>
        
        {data?.recentProjects && data.recentProjects.length > 0 ? (
          <div className="space-y-3">
            {data.recentProjects.map((project) => (
              <div 
                key={project._id}
                onClick={() => router.push(`/dashboard/projects/${project._id}`)}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{project.name}</p>
                  <p className="text-sm text-gray-500">
                    {project.projectType?.name || 'Unknown Type'} • {project.assignedTo?.name || 'Unassigned'}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-3">
                  <div className="w-24 md:w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600">{project.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No projects yet</p>
          </div>
        )}
      </div>
    </>
  );
}
