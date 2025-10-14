'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleLogOut() {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to log out');
      }

      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  }
  return (
    <button onClick={() => handleLogOut()}>
      {loading ? 'Logging out...' : 'Log out'}
    </button>
  );
}
