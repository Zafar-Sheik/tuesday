'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  Calendar,
  Users,
  LogOut,
  X,
  Briefcase,
  Truck,
  Package,
  Wrench,
  Fuel,
  Clock,
  Settings
} from 'lucide-react';

interface MobileNavProps {
  user: {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'developer' | 'technician';
  };
}

export default function MobileNav({ user }: MobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = user.role === 'admin';
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
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: isTechnician ? 'My Tasks' : 'Projects', icon: FolderKanban, href: '/dashboard/projects' },
    { label: 'Deliveries', icon: Truck, href: '/dashboard/deliveries' },
    { label: 'Collections', icon: Package, href: '/dashboard/collections' },
    { label: 'Job Cards', icon: Briefcase, href: '/dashboard/job-cards' },
    { label: 'Workshop', icon: Wrench, href: '/dashboard/workshops' },
    { label: 'Fuel', icon: Fuel, href: '/dashboard/fuel-management' },
    { label: 'Calendar', icon: Calendar, href: '/dashboard/calendar' },
    { label: 'Users', icon: Users, href: '/dashboard/users', show: isAdmin },
    { label: 'Project Types', icon: Settings, href: '/dashboard/project-types', show: isAdmin },
  ];

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={() => setMenuOpen(true)}
        className="fixed top-4 right-4 z-40 p-3 bg-slate-800/90 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-lg text-slate-200 hover:text-white hover:bg-slate-700/90 transition-all md:hidden"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 md:hidden" onClick={() => setMenuOpen(false)}>
          <div
            className="absolute right-0 top-0 bottom-0 w-72 bg-slate-900 shadow-2xl flex flex-col border-l border-slate-700/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
              <span className="font-bold text-slate-100 text-lg">Menu</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-100 truncate">{user.name}</p>
                  <p className="text-xs text-slate-400 capitalize">{user.role}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 min-h-0 p-2 overflow-y-auto">
              <ul className="space-y-1">
                {menuItems.map((item) => {
                  if (item.show === false) return null;
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-600/30 to-violet-600/30 text-blue-400 border border-blue-500/30'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Logout */}
            <div className="p-2 border-t border-slate-700/50">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
