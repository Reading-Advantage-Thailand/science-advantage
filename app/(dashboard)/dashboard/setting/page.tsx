'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Workspace Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure Science Advantage preferences for your organization.
        </p>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Email digest frequency: <strong>Daily summary</strong></p>
            <p>Critical alerts: <strong>Enabled</strong></p>
            <p>Curriculum updates: <strong>Enabled</strong></p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Access Controls</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Teacher self-enrollment: <strong>Disabled</strong></p>
            <p>Student invite links: <strong>Enabled</strong></p>
            <p>Multi-factor authentication: <strong>Required for admins</strong></p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Configuration Options</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Additional workspace configuration tools—including roster sync and district-wide rollouts—are in development.
          </p>
          <p>
            Contact <a className="underline" href="mailto:support@scienceadvantage.io">support@scienceadvantage.io</a> if you need these features enabled early.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
