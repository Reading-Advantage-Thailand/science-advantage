'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserMenu } from '@/components/features/auth/user-menu';

interface MobileNavProps {
  logo: React.ReactNode;
  navItems: Array<{ href: string; label: string; isActive?: (pathname: string) => boolean }>;
  user: { name: string; email: string | null } | null;
}

export function MobileNav({ logo, navItems, user }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      menuRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        ref={menuButtonRef}
        type="button"
        className="lg:hidden p-2 -m-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-rose-500 rounded-md min-w-[44px] min-h-[44px] flex items-center justify-center"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-menu-title"
        >
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div
            id="mobile-menu"
            ref={menuRef}
            tabIndex={-1}
            className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-xl flex flex-col"
            onKeyDown={(e) => {
              if (e.key === 'Tab') {
                const focusableElements = menuRef.current?.querySelectorAll(
                  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
                );
                if (!focusableElements || focusableElements.length === 0) return;

                const firstElement = focusableElements[0] as HTMLElement;
                const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

                if (e.shiftKey && document.activeElement === firstElement) {
                  e.preventDefault();
                  lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                  e.preventDefault();
                  firstElement.focus();
                }
              }
            }}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 id="mobile-menu-title" className="text-lg font-semibold text-gray-900">
                Navigation
              </h2>
              <button
                type="button"
                className="p-2 -m-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-rose-500 rounded-md min-w-[44px] min-h-[44px] flex items-center justify-center"
                onClick={() => setIsOpen(false)}
                aria-label="Close navigation menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4">
              <div className="space-y-1">
                {navItems.map((item) => {
                  const isActive = item.isActive ? item.isActive(pathname) : pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center min-h-[44px] px-4 py-3 rounded-lg text-base font-medium transition-colors',
                        isActive
                          ? 'bg-rose-50 text-rose-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>

            {user && (
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

interface ResponsiveNavProps {
  logo: React.ReactNode;
  navItems: Array<{ href: string; label: string; isActive?: (pathname: string) => boolean }>;
  user: { name: string; email: string | null } | null;
}

export function ResponsiveNav({ logo, navItems, user }: ResponsiveNavProps) {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            {logo}
            <div className="hidden lg:flex">
              <nav className="flex gap-1">
                {navItems.map((item) => {
                  const isActive = item.isActive ? item.isActive(pathname) : pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] flex items-center',
                        isActive
                          ? 'bg-rose-50 text-rose-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden lg:block">
              {user && (
                <div className="text-sm text-gray-600 mr-4">
                  <span className="font-medium text-gray-900">{user.name}</span>
                </div>
              )}
            </div>
            <MobileNav
              logo={logo}
              navItems={navItems}
              user={user}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export function ResponsiveNavLogo({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-3">
      {children}
    </Link>
  );
}