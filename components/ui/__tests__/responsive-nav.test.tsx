import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MobileNav, ResponsiveNav, ResponsiveNavLogo } from '../responsive-nav';
import React from 'react';

const MOCK_USER = { name: 'Test User', email: 'test@example.com' as string | null };
const MOCK_NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', isActive: (p: string) => p === '/dashboard' },
  { href: '/settings', label: 'Settings', isActive: (p: string) => p === '/settings' },
];

const MOCK_LOGO = <span>Logo</span>;

describe('MobileNav', () => {
  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders hamburger button when menu is closed', () => {
    render(<MobileNav logo={MOCK_LOGO} navItems={MOCK_NAV_ITEMS} user={MOCK_USER} />);

    const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
    expect(menuButton).toBeInTheDocument();
  });

  it('opens mobile menu when hamburger button is clicked', () => {
    render(<MobileNav logo={MOCK_LOGO} navItems={MOCK_NAV_ITEMS} user={MOCK_USER} />);

    const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
    fireEvent.click(menuButton);

    const closeButtons = screen.getAllByRole('button', { name: /close navigation menu/i });
    expect(closeButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('closes mobile menu when close button is clicked', () => {
    render(<MobileNav logo={MOCK_LOGO} navItems={MOCK_NAV_ITEMS} user={MOCK_USER} />);

    const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
    fireEvent.click(menuButton);

    const closeButtons = screen.getAllByRole('button', { name: /close navigation menu/i });
    expect(closeButtons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(closeButtons[0]);

    const openButton = screen.getByRole('button', { name: /open navigation menu/i });
    expect(openButton).toBeInTheDocument();
  });

  it('closes mobile menu when escape key is pressed', () => {
    render(<MobileNav logo={MOCK_LOGO} navItems={MOCK_NAV_ITEMS} user={MOCK_USER} />);

    const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
    fireEvent.click(menuButton);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('button', { name: /close navigation menu/i })).not.toBeInTheDocument();
  });

  it('closes mobile menu when overlay is clicked', () => {
    render(<MobileNav logo={MOCK_LOGO} navItems={MOCK_NAV_ITEMS} user={MOCK_USER} />);

    const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
    fireEvent.click(menuButton);

    const overlay = document.querySelector('.fixed.inset-0.bg-black\\/50') as HTMLElement;
    if (overlay) {
      fireEvent.click(overlay);
    }

    const openButton = screen.getByRole('button', { name: /open navigation menu/i });
    expect(openButton).toBeInTheDocument();
  });

  it('renders navigation items in mobile menu', () => {
    render(<MobileNav logo={MOCK_LOGO} navItems={MOCK_NAV_ITEMS} user={MOCK_USER} />);

    const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
    fireEvent.click(menuButton);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('closes menu when a navigation link is clicked', () => {
    render(<MobileNav logo={MOCK_LOGO} navItems={MOCK_NAV_ITEMS} user={MOCK_USER} />);

    const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
    fireEvent.click(menuButton);

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    if (dashboardLink) {
      fireEvent.click(dashboardLink);
    }

    expect(screen.queryByRole('button', { name: /close navigation menu/i })).not.toBeInTheDocument();
  });

  it('displays user info when user prop is provided', () => {
    render(<MobileNav logo={MOCK_LOGO} navItems={MOCK_NAV_ITEMS} user={MOCK_USER} />);

    const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
    fireEvent.click(menuButton);

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('renders with correct aria attributes when open', () => {
    render(<MobileNav logo={MOCK_LOGO} navItems={MOCK_NAV_ITEMS} user={MOCK_USER} />);

    const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(menuButton);

    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('ResponsiveNav', () => {
  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders logo and nav items', () => {
    render(<ResponsiveNav logo={MOCK_LOGO} navItems={MOCK_NAV_ITEMS} user={MOCK_USER} />);

    expect(screen.getByText('Logo')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('shows hamburger menu button on all screen sizes', () => {
    render(<ResponsiveNav logo={MOCK_LOGO} navItems={MOCK_NAV_ITEMS} user={MOCK_USER} />);

    const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
    expect(menuButton).toBeInTheDocument();
  });

  it('displays user name on desktop', () => {
    render(<ResponsiveNav logo={MOCK_LOGO} navItems={MOCK_NAV_ITEMS} user={MOCK_USER} />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
  });
});

describe('ResponsiveNavLogo', () => {
  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders children within Link', () => {
    render(<ResponsiveNavLogo href="/test">Logo Content</ResponsiveNavLogo>);

    const link = screen.getByRole('link', { name: /logo content/i });
    expect(link).toHaveAttribute('href', '/test');
    expect(screen.getByText('Logo Content')).toBeInTheDocument();
  });
});