'use client';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useRouter } from 'next/navigation';

import { authClient } from '@/lib/auth-client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Terminal, User, GraduationCap, Shield, Cog } from 'lucide-react';

import { IconLoader } from '@tabler/icons-react';

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Redirect to dashboard (which will redirect based on role)
      window.location.href = '/dashboard';
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your username below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 border border-red-500" variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={(e) => handleSubmit(e)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="username">Username</Label>
                <Input
                  onChange={(e) => setUsername(e.target.value)}
                  value={username}
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  id="password"
                  type="password"
                  required
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button disabled={loading} type="submit" className="w-full">
                  {loading ? (
                    <IconLoader className="animate-spin" stroke={2} />
                  ) : (
                    'Login'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Demo Credentials */}
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="text-sm">Demo Credentials</CardTitle>
          <CardDescription className="text-xs">
            Use these credentials to test different role access levels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 rounded-md border bg-white dark:bg-gray-950 p-3">
            <User className="h-4 w-4 text-blue-600" />
            <div className="flex-1 space-y-0.5">
              <p className="text-xs font-medium">Student</p>
              <p className="text-xs text-muted-foreground font-mono">
                student_demo / Password123!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-md border bg-white dark:bg-gray-950 p-3">
            <GraduationCap className="h-4 w-4 text-green-600" />
            <div className="flex-1 space-y-0.5">
              <p className="text-xs font-medium">Teacher</p>
              <p className="text-xs text-muted-foreground font-mono">
                teacher_demo / Password123!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-md border bg-white dark:bg-gray-950 p-3">
            <Shield className="h-4 w-4 text-purple-600" />
            <div className="flex-1 space-y-0.5">
              <p className="text-xs font-medium">Admin</p>
              <p className="text-xs text-muted-foreground font-mono">
                admin_demo / Password123!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-md border bg-white dark:bg-gray-950 p-3">
            <Cog className="h-4 w-4 text-orange-600" />
            <div className="flex-1 space-y-0.5">
              <p className="text-xs font-medium">System Admin</p>
              <p className="text-xs text-muted-foreground font-mono">
                system_demo / Password123!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
