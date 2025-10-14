'use client';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock } from 'lucide-react';

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Self-Service Signup Disabled</CardTitle>
          <CardDescription>
            Science Advantage accounts are provisioned by your district administrator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 border border-amber-500 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            <Lock className="h-4 w-4" />
            <AlertDescription>
              Please contact your system administrator to request a new account.
            </AlertDescription>
          </Alert>

          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              • Teachers and administrators can create new users through the internal onboarding
              tools.
            </p>
            <p>
              • To explore the platform right away, use one of the demo accounts listed on the login
              page.
            </p>
            <p>
              • Need access? Email <a className="underline" href="mailto:support@scienceadvantage.io">support@scienceadvantage.io</a>.
            </p>
          </div>

          <div className="mt-6 text-center text-sm">
            Already have an account?{' '}
            <a href="/login" className="underline underline-offset-4">
              Log in
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
