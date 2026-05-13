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
  Fuel
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
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: isTechnician ? 'Daily Route' : 'Projects', icon: FolderKanban, href: '/dashboard/projects' },
    { label: 'Deliveries', icon: Truck, href: '/dashboard/deliveries' },
    { label: 'Collections', icon: Package, href: '/dashboard/collections' },
    { label: 'Job Cards', icon: Package, href: '/dashboard/job-cards' },
    { label: 'Workshop', icon: Wrench, href: '/dashboard/workshops' },
    { label: 'Fuel Management', icon: Fuel, href: '/dashboard/fuel-management' },
    { label: 'Calendar', icon: Calendar, href: '/dashboard/calendar' },
    { label: 'Users', icon: Users, href: '/dashboard/users', show: isAdmin },
    { label: 'Project Types', icon: Briefcase, href: '/dashboard/project-types', show: isAdmin },
  ];

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={() => setMenuOpen(true)}
        className="fixed top-4 right-4 z-40 p-2 bg-white rounded-lg shadow-md"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50">
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <span className="font-bold text-gray-900">Menu</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            {/* User Info */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
            </div>

            {/* Menu Items - scrollable */}
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
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${
                          isActive 
                            ? 'bg-indigo-50 text-indigo-600' 
                            : 'text-gray-600'
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
            <div className="p-2 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 w-full text-red-600 hover:bg-red-50 rounded-lg"
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
