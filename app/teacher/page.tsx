import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, ChartBar } from 'lucide-react';
import { requireRole } from '@/lib/auth/server';
import { AppHeader } from '@/components/layout/app-header';

export default async function TeacherDashboard() {
  const session = await requireRole('TEACHER');
  const user = session.user;

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader user={user} />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.name}!
            </p>
          </div>
        </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Classes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              Active classes
            </p>
            <Button className="mt-4 w-full" variant="outline">
              Manage Classes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92</div>
            <p className="text-xs text-muted-foreground">
              Across all classes
            </p>
            <Button className="mt-4 w-full" variant="outline">
              View Students
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lessons</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              Published lessons
            </p>
            <Button className="mt-4 w-full" variant="outline">
              Create Lesson
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <ChartBar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">
              Class completion rate
            </p>
            <Button className="mt-4 w-full" variant="outline">
              View Reports
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>My Classes</CardTitle>
            <CardDescription>
              Your active classes and student counts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Grade 3 Science - Class A</p>
                  <p className="text-sm text-muted-foreground">23 students</p>
                </div>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Grade 3 Science - Class B</p>
                  <p className="text-sm text-muted-foreground">25 students</p>
                </div>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Grade 4 Science - Class A</p>
                  <p className="text-sm text-muted-foreground">22 students</p>
                </div>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Grade 4 Science - Class B</p>
                  <p className="text-sm text-muted-foreground">22 students</p>
                </div>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Recent student activities in your classes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">15 students completed &quot;Photosynthesis&quot; lesson</p>
                  <p className="text-xs text-muted-foreground">Grade 3A - 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New quiz submitted: &quot;Plant Cells&quot;</p>
                  <p className="text-xs text-muted-foreground">Grade 4B - 3 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">8 students started &quot;Ecosystems&quot; lesson</p>
                  <p className="text-xs text-muted-foreground">Grade 3B - Yesterday</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Experiment data submitted: &quot;Growing Plants&quot;</p>
                  <p className="text-xs text-muted-foreground">Grade 4A - 2 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}