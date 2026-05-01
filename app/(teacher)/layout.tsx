import { requireRole } from '@/lib/auth/server';
import { ResponsiveNav, ResponsiveNavLogo } from '@/components/ui/responsive-nav';
import Image from 'next/image';

const TEACHER_NAV_ITEMS = [
  { href: '/teacher', label: 'Dashboard', isActive: (pathname: string) => pathname === '/teacher' },
  { href: '/teacher/classes', label: 'Classes', isActive: (pathname: string) => pathname === '/teacher/classes' || pathname.startsWith('/teacher/classes/') },
];

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole('TEACHER');

  const logo = (
    <ResponsiveNavLogo href="/teacher">
      <Image
        src="/science-advantage.png"
        alt="Science Advantage"
        width={40}
        height={40}
        className="rounded-lg"
      />
      <span className="font-bold text-xl text-rose-800">Science Advantage</span>
    </ResponsiveNavLogo>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <ResponsiveNav
        logo={logo}
        navItems={TEACHER_NAV_ITEMS}
        user={session.user}
      />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {children}
      </main>
    </div>
  );
}