'use client';

import { useState, createContext, useContext, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FolderKanban, Calendar, Users, Settings, ChevronLeft, ChevronRight, LogOut, Briefcase, Wrench, Code, Truck, Package, Fuel, KeyRound } from 'lucide-react';

interface SidebarProps {
  user: {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'developer' | 'technician';
  };
}

interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  setCollapsed: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const isAdmin = user.role === 'admin';
  const isDeveloper = user.role === 'developer';
  const isTechnician = user.role === 'technician';

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', show: true },
    { label: isTechnician ? 'My Tasks' : 'Projects', icon: FolderKanban, href: '/dashboard/projects', show: true },
    { label: 'Deliveries', icon: Truck, href: '/dashboard/deliveries', show: true },
    { label: 'Collections', icon: Package, href: '/dashboard/collections', show: true },
    { label: 'Job Cards', icon: Briefcase, href: '/dashboard/job-cards', show: true },
    { label: 'Workshop', icon: Wrench, href: '/dashboard/workshops', show: true },
    { label: 'Fuel', icon: Fuel, href: '/dashboard/fuel-management', show: true },
    { label: 'Calendar', icon: Calendar, href: '/dashboard/calendar', show: true },
    { label: 'Passwords', icon: KeyRound, href: '/dashboard/passwords', show: true },
    { label: 'Users', icon: Users, href: '/dashboard/users', show: isAdmin },
    { label: 'Project Types', icon: Settings, href: '/dashboard/project-types', show: isAdmin },
  ];

  const roleIcon = isAdmin ? Settings : isDeveloper ? Code : Wrench;
  const RoleIcon = roleIcon;

  // Apply margin to body/content via CSS variable
  useEffect(() => {
    const root = document.documentElement;
    if (collapsed) {
      root.style.setProperty('--sidebar-offset', '4rem');
    } else {
      root.style.setProperty('--sidebar-offset', '16rem');
    }
  }, [collapsed]);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <aside
        className={`hidden md:block fixed left-0 top-0 h-full bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 transition-all duration-300 z-40 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="flex flex-col h-full w-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50 flex-shrink-0">
            {!collapsed && (
              <Link href="/dashboard" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/50 transition-shadow">
                  <FolderKanban className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-slate-100 group-hover:text-white transition-colors">Tuesday</span>
              </Link>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-slate-100"
            >
              {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-slate-700/50 flex-shrink-0">
            <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex-shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-100 truncate text-sm">{user.name}</p>
                  <p className="text-xs text-slate-400 capitalize flex items-center gap-1 mt-0.5">
                    <RoleIcon className="w-3 h-3" />
                    {user.role}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Menu Items - Scrollable */}
          <nav className="flex-1 min-h-0 p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                if (!item.show) return null;

                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600/20 to-violet-600/20 text-blue-400 border border-blue-500/30'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                      } ${collapsed ? 'justify-center' : ''}`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-500 to-violet-500 rounded-r-full" />
                      )}
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-400' : 'group-hover:text-slate-100'}`} />
                      {!collapsed && <span className="font-medium text-sm truncate">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout - Fixed at bottom */}
          <div className="p-2 border-t border-slate-700/50 flex-shrink-0">
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 px-3 py-2.5 w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <LogOut className="w-5 h-5" />
              {!collapsed && <span className="font-medium text-sm">Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </SidebarContext.Provider>
  );
}