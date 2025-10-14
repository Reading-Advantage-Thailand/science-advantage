import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/server';

export default async function DashboardRedirect() {
  const session = await requireAuth();

  // Redirect based on user role
  const roleRoutes: Record<string, string> = {
    STUDENT: '/student',
    TEACHER: '/teacher',
    ADMIN: '/admin',
    SYSTEM: '/system',
  };

  redirect(roleRoutes[session.user.role] || '/student');
}
