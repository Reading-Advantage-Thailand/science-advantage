'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface AppHeaderProps {
  user: {
    name: string;
    username: string;
    email: string | null;
    role: string;
  };
}

const roleStyles: Record<string, { bg: string; text: string }> = {
  SYSTEM: { bg: 'bg-yellow-500', text: 'text-yellow-900' },
  ADMIN: { bg: 'bg-purple-500', text: 'text-white' },
  TEACHER: { bg: 'bg-green-500', text: 'text-white' },
  STUDENT: { bg: 'bg-blue-500', text: 'text-white' },
};

export function AppHeader({ user }: AppHeaderProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const roleStyle = roleStyles[user.role] || roleStyles.STUDENT;

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xl">Science Advantage</span>
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {/* User Info Header */}
              <div className="px-2 py-3">
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email || `@${user.username}`}</p>
                {!user.email && (
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-red-500">⚠</span> Not verified email
                  </p>
                )}
                <div className="mt-2 flex gap-2">
                  <Badge className={`${roleStyle.bg} ${roleStyle.text} text-xs px-2 py-0.5`}>
                    {user.role}
                  </Badge>
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* Dashboard Links */}
              <DropdownMenuItem onClick={() => router.push('/student')}>
                Learner Home
              </DropdownMenuItem>

              {['TEACHER', 'ADMIN', 'SYSTEM'].includes(user.role) && (
                <DropdownMenuItem onClick={() => router.push('/teacher')}>
                  Teacher dashboard
                </DropdownMenuItem>
              )}

              {['ADMIN', 'SYSTEM'].includes(user.role) && (
                <DropdownMenuItem onClick={() => router.push('/admin')}>
                  Admin dashboard
                </DropdownMenuItem>
              )}

              {user.role === 'SYSTEM' && (
                <DropdownMenuItem onClick={() => router.push('/system')}>
                  System dashboard
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              {/* Settings & Support */}
              <DropdownMenuItem onClick={() => router.push('/support')}>
                Contact Support
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => router.push('/settings')}>
                Settings
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Sign Out */}
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Signing out...' : 'Sign Out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
