'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Users,
  Package,
  MessageSquare,
  Bot,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  BarChart3,
  CheckCircle
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'MANAGER';
  profileImage?: string;
  bio?: string;
}

interface SidebarProps {
  user: User;
  onLogout: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Settings },
  { name: 'Profile', href: '/dashboard/profile', icon: Users },
  { name: 'Items', href: '/dashboard/items', icon: Package },
  { name: 'Reviews', href: '/dashboard/reviews', icon: MessageSquare },
  { name: 'AI Assistant', href: '/dashboard/ai', icon: Bot },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, roles: ['ADMIN', 'MANAGER'] },
  { name: 'Manage Users', href: '/dashboard/users', icon: Users, roles: ['ADMIN', 'MANAGER'] },
  { name: 'Approvals', href: '/dashboard/approvals', icon: CheckCircle, roles: ['ADMIN'] },
];

export function Sidebar({ user, onLogout }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const filteredNavigation = navigation.filter(
    item => !item.roles || item.roles.includes(user.role)
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white/98 backdrop-blur-xl border-r border-gray-200/60 shadow-2xl transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <h1 className="text-lg font-bold tracking-tight">AI Suggester</h1>
            </div>
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="px-4 py-5 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200/50">
            <div className="flex items-center space-x-3">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="h-10 w-10 rounded-xl border-2 border-white shadow-md"
                />
              ) : (
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-600 truncate mb-1">{user.email}</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6">
            <div className="space-y-1">
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden
                      ${isActive
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 transform scale-[1.02]'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 hover:shadow-md hover:transform hover:scale-[1.01]'
                      }
                    `}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-500 group-hover:text-blue-600'
                    }`} />
                    <span className="flex-1">{item.name}</span>
                    <ChevronRight className={`h-4 w-4 transition-all duration-200 ${
                      isActive
                        ? 'text-white opacity-100'
                        : 'text-gray-400 opacity-0 group-hover:opacity-100 group-hover:text-blue-600'
                    }`} />
                    {isActive && (
                      <div className="absolute inset-0 bg-white/10 rounded-xl animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Logout Section */}
          <div className="px-3 py-4 border-t border-gray-200/50 bg-gray-50/50">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200 rounded-lg py-3 px-4"
              onClick={onLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              <span className="font-medium">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}