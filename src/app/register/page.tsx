'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { registerSchema, type RegisterFormData } from '@/lib/validations';
import { api, fetchApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Cookies from 'js-cookie';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'USER',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await fetchApi(api.auth.register, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      Cookies.set('accessToken', response.data.accessToken, { expires: 7 });
      Cookies.set('user', JSON.stringify(response.data.user), { expires: 7 });
      Cookies.set('role', response.data.user.role, { expires: 7 });

      router.push('/dashboard');
      toast.success('Account created successfully!');
    } catch (error: any) {
      console.error('Registration failed:', error);
      const message = error?.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Join our AI-powered platform</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" {...register('name')} />
                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
                {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
              {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <Label>Account Type</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {[
                      { value: 'USER', label: 'User', desc: 'Browse & Review' },
                      { value: 'MANAGER', label: 'Manager', desc: 'Manage Content' },
                      { value: 'ADMIN', label: 'Admin', desc: 'Full Control' }
                    ].map((roleOption) => (
                      <button
                        key={roleOption.value}
                        type="button"
                        onClick={() => field.onChange(roleOption.value)}
                        className={`p-3 border rounded-lg text-left transition-all ${
                          field.value === roleOption.value 
                            ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' 
                            : 'hover:border-gray-400'
                        }`}
                      >
                        <div className="font-semibold text-sm">{roleOption.label}</div>
                        <div className="text-xs text-gray-500">{roleOption.desc}</div>
                      </button>
                    ))}
                  </div>
                )}
              />
              <p className="text-xs text-gray-500 mt-1">Choose your role. You can request changes later.</p>
            </div>

            <div>
              <Label htmlFor="bio">Bio (Optional)</Label>
              <Textarea id="bio" placeholder="Tell us about yourself..." {...register('bio')} />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          {/* Quick Demo Registration */}
          <div className="mt-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Quick Demo Accounts</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => quickRegister('USER')} 
                disabled={isLoading}
              >
                User
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => quickRegister('MANAGER')} 
                disabled={isLoading}
              >
                Manager
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => quickRegister('ADMIN')} 
                disabled={isLoading}
              >
                Admin
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:underline font-medium">Sign in here</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Quick demo registration function
async function quickRegister(role: 'USER' | 'MANAGER' | 'ADMIN') {
  const demoData = {
    USER: {
      name: 'Demo User',
      email: 'user@demo.com',
      password: 'password123',
      role: 'USER' as const
    },
    MANAGER: {
      name: 'Demo Manager',
      email: 'manager@demo.com',
      password: 'password123',
      role: 'MANAGER' as const
    },
    ADMIN: {
      name: 'Demo Admin',
      email: 'admin@demo.com',
      password: 'password123',
      role: 'ADMIN' as const
    }
  };

  try {
    const response = await fetchApi(api.auth.register, {
      method: 'POST',
      body: JSON.stringify(demoData[role])
    });

    Cookies.set('accessToken', response.data.accessToken, { expires: 7 });
    Cookies.set('user', JSON.stringify(response.data.user), { expires: 7 });
    Cookies.set('role', response.data.user.role, { expires: 7 });

    window.location.href = '/dashboard';
  } catch (error: any) {
    alert(error?.message || 'Failed to register demo account');
  }
}

