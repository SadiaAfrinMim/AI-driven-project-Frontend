'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const userData = Cookies.get('user');
    let role = 'user';
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const userRole = (user.role || 'USER').toLowerCase();
        role = userRole === 'admin' ? 'admin' : userRole === 'manager' ? 'manager' : 'user';
      } catch {
        role = 'user';
      }
    }
    router.replace(`/dashboard/${role}`);
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    </div>
  );
}
