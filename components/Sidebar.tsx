'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  Calendar,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Briefcase,
  Wrench,
  Code,
  Truck,
  Package,
  Fuel
} from 'lucide-react';

interface SidebarProps {
  user: {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'developer' | 'technician';
  };
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const prefetchProjects = useCallback(() => {
    fetch('/api/projects', { method: 'GET' }).catch(() => {});
  }, []);

  const isAdmin = user.role === 'admin';
  const isDeveloper = user.role === 'developer';
  const isTechnician = user.role === 'technician';

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

   const menuItems = [
     {
       label: 'Dashboard',
       icon: LayoutDashboard,
       href: '/dashboard',
       show: true,
     },
     {
       label: isTechnician ? 'Daily Route' : 'Projects',
       icon: FolderKanban,
       href: '/dashboard/projects',
       show: true,
     },
     {
       label: 'Deliveries',
       icon: Truck,
       href: '/dashboard/deliveries',
       show: true,
     },
     {
       label: 'Collections',
       icon: Package,
       href: '/dashboard/collections',
       show: true,
     },
     {
       label: 'Job Cards',
       icon: Package,
       href: '/dashboard/job-cards',
       show: true,
     },
     {
       label: 'Workshop',
       icon: Wrench,
       href: '/dashboard/workshops',
       show: true,
     },
     {
       label: 'Fuel Management',
       icon: Fuel,
       href: '/dashboard/fuel-management',
       show: true,
     },
     {
       label: 'Calendar',
       icon: Calendar,
       href: '/dashboard/calendar',
       show: true,
     },
     {
       label: 'Users',
       icon: Users,
       href: '/dashboard/users',
       show: isAdmin,
     },
     {
       label: 'Project Types',
       icon: Briefcase,
       href: '/dashboard/project-types',
       show: isAdmin,
     },
   ];

  const roleIcon = isAdmin ? Settings : isDeveloper ? Code : Wrench;
  const RoleIcon = roleIcon;

  return (
    <aside 
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-50 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-linear-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <FolderKanban className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">PM System</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            )}
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize flex items-center gap-1">
                  <RoleIcon className="w-3 h-3" />
                  {user.role}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 min-h-0 p-2 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              if (!item.show) return null;
              
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onMouseEnter={item.href === '/dashboard/projects' ? prefetchProjects : undefined}
                    onFocus={item.href === '/dashboard/projects' ? prefetchProjects : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                    } ${collapsed ? 'justify-center' : ''}`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="font-medium">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-3 py-2.5 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
