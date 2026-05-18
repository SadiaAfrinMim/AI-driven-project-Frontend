'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { loginSchema, type LoginFormData } from '@/lib/validations';
import { api, fetchApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await fetchApi(api.auth.login, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      Cookies.set('accessToken', response.data.accessToken, { expires: 7 });
      Cookies.set('user', JSON.stringify(response.data.user), { expires: 7 });
      Cookies.set('role', response.data.user.role, { expires: 7 });

      router.push('/dashboard');
      toast.success('Login successful!');
    } catch (error: any) {
      console.error('Login failed:', error);
      const message = error?.message || 'Login failed. Please check your credentials.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Demo Login - Auto fills and logs in with demo accounts
  const handleDemoLogin = async (role: 'USER' | 'MANAGER' | 'ADMIN') => {
    setIsLoading(true);
    try {
      const demoCredentials = {
        USER: { email: 'user@demo.com', password: 'password123' },
        MANAGER: { email: 'manager@demo.com', password: 'password123' },
        ADMIN: { email: 'admin@demo.com', password: 'password123' }
      };

      const response = await fetchApi(api.auth.login, {
        method: 'POST',
        body: JSON.stringify(demoCredentials[role]),
      });

      Cookies.set('accessToken', response.data.accessToken, { expires: 7 });
      Cookies.set('user', JSON.stringify(response.data.user), { expires: 7 });
      Cookies.set('role', response.data.user.role, { expires: 7 });

      router.push('/dashboard');
      toast.success(`Logged in as ${role}!`);
    } catch (error: any) {
      console.error('Demo login failed:', error);
      toast.error('Demo login failed. Make sure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
              {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Quick Demo Access</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" onClick={() => handleDemoLogin('USER')} disabled={isLoading}>
                User
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDemoLogin('MANAGER')} disabled={isLoading}>
                Manager
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDemoLogin('ADMIN')} disabled={isLoading}>
                Admin
              </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-2">Click any button to login instantly</p>
          </div>

          <div className="mt-6 text-center text-sm">
            Don&apos;t have an account?{' '}
            <a href="/register" className="text-blue-600 hover:underline font-medium">Create one</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
