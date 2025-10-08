import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ChartBar, School, UserCheck } from 'lucide-react';
import { requireRole } from '@/lib/auth/server';
import { AppHeader } from '@/components/layout/app-header';

export default async function AdminDashboard() {
  const session = await requireRole('ADMIN');
  const user = session.user;

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader user={user} />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.name}!
            </p>
          </div>
        </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
            <Button className="mt-4 w-full" variant="outline">
              Manage Users
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground">
              Across all grades
            </p>
            <Button className="mt-4 w-full" variant="outline">
              View Classes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Teachers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">16</div>
            <p className="text-xs text-muted-foreground">
              +2 new this month
            </p>
            <Button className="mt-4 w-full" variant="outline">
              Manage Teachers
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <ChartBar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82%</div>
            <p className="text-xs text-muted-foreground">
              Platform-wide average
            </p>
            <Button className="mt-4 w-full" variant="outline">
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>
              Breakdown of users by role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Students</p>
                    <p className="text-sm text-muted-foreground">1,180 users</p>
                  </div>
                </div>
                <div className="text-lg font-semibold">94.6%</div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Teachers</p>
                    <p className="text-sm text-muted-foreground">52 users</p>
                  </div>
                </div>
                <div className="text-lg font-semibold">4.2%</div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Admins</p>
                    <p className="text-sm text-muted-foreground">12 users</p>
                  </div>
                </div>
                <div className="text-lg font-semibold">1.0%</div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">System</p>
                    <p className="text-sm text-muted-foreground">3 users</p>
                  </div>
                </div>
                <div className="text-lg font-semibold">0.2%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>
              Platform performance and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Database Status</p>
                  <p className="text-sm text-muted-foreground">PostgreSQL</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Healthy</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">API Response Time</p>
                  <p className="text-sm text-muted-foreground">Average last 24h</p>
                </div>
                <div className="text-lg font-semibold">124ms</div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Storage Usage</p>
                  <p className="text-sm text-muted-foreground">Google Cloud Storage</p>
                </div>
                <div className="text-lg font-semibold">2.4GB</div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Active Sessions</p>
                  <p className="text-sm text-muted-foreground">Currently online</p>
                </div>
                <div className="text-lg font-semibold">342</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent System Activity</CardTitle>
          <CardDescription>
            Recent administrative actions and system events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New teacher account created: Sarah Johnson</p>
                <p className="text-xs text-muted-foreground">2 hours ago - Admin: John Doe</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Database backup completed successfully</p>
                <p className="text-xs text-muted-foreground">6 hours ago - Automated</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New class created: Grade 5 Science - Class C</p>
                <p className="text-xs text-muted-foreground">Yesterday - Teacher: Mike Wilson</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">System maintenance scheduled for this weekend</p>
                <p className="text-xs text-muted-foreground">2 days ago - Admin: System</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}