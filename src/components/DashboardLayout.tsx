'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Cookies from 'js-cookie';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'MANAGER';
  profileImage?: string;
  bio?: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadUserFromCookie = () => {
    const accessToken = Cookies.get('accessToken');
    const userData = Cookies.get('user');

    if (!accessToken || !userData) {
      router.push('/login');
      setIsLoading(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch {
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is authenticated
    loadUserFromCookie();

    // Listen for live profile updates (e.g. new Cloudinary profile photo) so Sidebar + header reflect it immediately
    const handleProfileUpdate = () => {
      console.log('🔄 [DASHBOARD LAYOUT] userProfileUpdated event - reloading user for Sidebar image');
      loadUserFromCookie();
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('userProfileUpdated', handleProfileUpdate);
  }, [router]);

  const handleLogout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('user');
    Cookies.remove('role');
    router.push('/login');
    toast.success('Logged out successfully!');
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50">
      <div className="flex">
        <Sidebar user={user} onLogout={handleLogout} />
        <div className="flex-1  transition-all duration-300 ease-in-out">
          {/* Dashboard Header */}
          <header className="bg-white/95 backdrop-blur-xl border-b border-gray-200/70 px-8 py-7 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {user.role === 'ADMIN' ? 'Admin Dashboard' :
                   user.role === 'MANAGER' ? 'Manager Dashboard' :
                   'My Dashboard'}
                </h1>
                <p className="text-sm text-gray-600 mt-2">
                  {user.role === 'ADMIN'
                    ? 'Complete system control and monitoring'
                    : user.role === 'MANAGER'
                    ? 'Manage platform content and monitor user activity'
                    : 'Welcome back! Here\'s your personal overview'}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Badge
                  variant="secondary"
                  className={`${
                    user.role === 'ADMIN' ? 'bg-red-100 text-red-800 border-red-200' :
                    user.role === 'MANAGER' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                    'bg-green-100 text-green-800 border-green-200'
                  }`}
                >
                  {user.role}
                </Badge>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>
          </header>

          <main className="p-6 lg:p-10 bg-transparent min-h-[calc(100vh-80px)]">
            <div className="max-w-[1600px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}