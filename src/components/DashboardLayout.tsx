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
          <main className="p-6 lg:p-10 bg-transparent min-h-[calc(100vh-64px)]">
            <div className="max-w-[1600px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}