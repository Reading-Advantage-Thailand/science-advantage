import { requireRole } from '@/lib/auth/server';
import { ResponsiveNav, ResponsiveNavLogo } from '@/components/ui/responsive-nav';
import Image from 'next/image';

const SYSTEM_NAV_ITEMS = [
  { href: '/system', label: 'Dashboard', isActive: (pathname: string) => pathname === '/system' },
  { href: '/schools', label: 'Schools', isActive: (pathname: string) => pathname === '/schools' },
];

export default async function SystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole('SYSTEM');

  const logo = (
    <ResponsiveNavLogo href="/system">
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
        navItems={SYSTEM_NAV_ITEMS}
        user={session.user}
      />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {children}
      </main>
    </div>
  );
}