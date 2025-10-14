'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IconLoader } from '@tabler/icons-react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

interface SessionResponse {
  session: {
    user: {
      name: string | null;
      email: string | null;
    };
  } | null;
}

export default function AccountSettingsPage() {
  const router = useRouter();
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch session');
        }

        const data: SessionResponse = await response.json();

        if (!data.session) {
          router.push('/login');
          return;
        }

        setFullname(data.session.user.name ?? '');
        setEmail(data.session.user.email ?? '');
      } catch (error) {
        console.error('Failed to load account information:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, [router]);

  if (loading) {
    return (
      <div className="px-4 lg:px-6 lg:w-1/2 grid gap-4">
        <Skeleton className="w-1/2 h-[20px] rounded-full" />
        <Skeleton className="w-2/3 h-[20px] rounded-full" />
        <Separator className="mb-4" />
        <Skeleton className="w-full h-[20px] rounded-full" />
        <Skeleton className="w-full h-[30px] rounded-full" />
        <Skeleton className="w-full h-[20px] rounded-full" />
        <Skeleton className="w-full h-[30px] rounded-full" />
        <Skeleton className="w-full h-[30px] rounded-full" />
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6">
      <h1 className="text-lg font-medium">Account Settings</h1>
      <p className="text-sm text-muted-foreground mb-2">
        Edit your account information
      </p>
      <Separator className="mb-4" />
      <form className="lg:w-1/2 space-y-6">
        <div className="grid gap-3">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            value={fullname}
            onChange={(event) => setFullname(event.target.value)}
            placeholder="Science Advantage User"
            required
          />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="user@example.com"
            required
          />
        </div>

        <Button type="button" className="w-full" disabled>
          <IconLoader className="mr-2 h-4 w-4 animate-spin" />
          Save changes (coming soon)
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Need to change your password?{' '}
          <a href="/login" className="underline underline-offset-4">
            Reset password
          </a>
        </div>
      </form>
    </div>
  );
}
