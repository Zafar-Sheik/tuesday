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
  Settings,
  Calendar,
  ArrowRight
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
      const dashboardRes = await fetch('/api/dashboard', {
        credentials: 'include',
        cache: 'no-store'
      });
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
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
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

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    subtext
  }: {
    title: string;
    value: string | number;
    icon: any;
    color: 'blue' | 'green' | 'violet' | 'cyan';
    subtext?: string;
  }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600 bg-blue-500/10 text-blue-400 border-blue-500/20',
      green: 'from-emerald-500 to-emerald-600 bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      violet: 'from-violet-500 to-violet-600 bg-violet-500/10 text-violet-400 border-violet-500/20',
      cyan: 'from-cyan-500 to-cyan-600 bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
    };

    return (
      <div className="relative group glass rounded-2xl p-6 hover:scale-[1.02] transition-transform duration-300">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorClasses[color].split(' text-')[0]} flex items-center justify-center shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-slate-100">{value}</p>
            {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
          <Clock className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-100">
          Welcome back, <span className="gradient-text">{user.name.split(' ')[0]}</span>
        </h1>
        <p className="text-slate-400 mt-2">Here's what's happening with your projects today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          icon={FolderKanban}
          color="blue"
        />
        <StatCard
          title="Active Projects"
          value={stats.activeProjects}
          icon={TrendingUp}
          color="cyan"
        />
        <StatCard
          title="Completed"
          value={stats.completedProjects}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="Tasks Done"
          value={`${stats.completedTasks}/${stats.totalTasks}`}
          icon={Clock}
          color="violet"
          subtext={`${Math.round((stats.completedTasks / stats.totalTasks) * 100) || 0}% completion`}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Breakdown */}
        <div className="lg:col-span-1">
          <div className="glass rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-slate-100 mb-5 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Projects by Status
            </h2>
            <div className="space-y-3">
              {[
                { label: 'Not Started', value: statusData.not_started, color: 'slate', icon: Clock },
                { label: 'In Progress', value: statusData.in_progress, color: 'blue', icon: TrendingUp },
                { label: 'Completed', value: statusData.completed, color: 'emerald', icon: CheckCircle2 },
                { label: 'On Hold', value: statusData.on_hold, color: 'amber', icon: Settings }
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-${item.color}-500/20 flex items-center justify-center`}>
                      <item.icon className={`w-4 h-4 text-${item.color}-400`} />
                    </div>
                    <span className="text-slate-300 text-sm">{item.label}</span>
                  </div>
                  <span className={`font-bold text-${item.color}-400`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <div className="glass rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-violet-400" />
                Recent Projects
              </h2>
              <button
                onClick={() => router.push('/dashboard/projects')}
                className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                View All →
              </button>
            </div>

            {data?.recentProjects && data.recentProjects.length > 0 ? (
              <div className="space-y-3">
                {data.recentProjects.map((project) => {
                  const statusColors = {
                    not_started: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
                    in_progress: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                    completed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                    on_hold: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  };
                  const statusClass = statusColors[project.status as keyof typeof statusColors] || statusColors.not_started;

                  return (
                    <div
                      key={project._id}
                      onClick={() => router.push(`/dashboard/projects/${project._id}`)}
                      className="group flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/30 hover:bg-slate-800 hover:border-slate-600/50 cursor-pointer transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-100 truncate group-hover:text-blue-300 transition-colors">
                          {project.name}
                        </p>
                        <p className="text-sm text-slate-400 mt-0.5">
                          {project.projectType?.name || 'Unknown Type'} • {project.assignedTo?.name || 'Unassigned'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 ml-3 flex-shrink-0">
                        <div className="hidden sm:block w-24 bg-slate-700/50 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-violet-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-300 w-10 text-right">{project.progress}%</span>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <FolderKanban className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No projects yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {user.role === 'admin' && (
          <>
            <button
              onClick={() => router.push('/dashboard/users')}
              className="glass rounded-2xl p-4 hover:bg-slate-800/80 hover:scale-[1.02] transition-all group border border-slate-700/50"
            >
              <Users className="w-8 h-8 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-slate-200 text-sm">Manage Users</p>
            </button>
            <button
              onClick={() => router.push('/dashboard/project-types')}
              className="glass rounded-2xl p-4 hover:bg-slate-800/80 hover:scale-[1.02] transition-all group border border-slate-700/50"
            >
              <Settings className="w-8 h-8 text-violet-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-slate-200 text-sm">Project Types</p>
            </button>
          </>
        )}
        <button
          onClick={() => router.push('/dashboard/projects')}
          className="glass rounded-2xl p-4 hover:bg-slate-800/80 hover:scale-[1.02] transition-all group border border-slate-700/50"
        >
          <FolderKanban className="w-8 h-8 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
          <p className="font-medium text-slate-200 text-sm">All Projects</p>
        </button>
        <button
          onClick={() => router.push('/dashboard/calendar')}
          className="glass rounded-2xl p-4 hover:bg-slate-800/80 hover:scale-[1.02] transition-all group border border-slate-700/50"
        >
          <Calendar className="w-8 h-8 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
          <p className="font-medium text-slate-200 text-sm">Calendar</p>
        </button>
      </div>
    </div>
  );
}
