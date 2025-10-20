import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { requireRole } from '@/lib/auth/server';

interface StudentClassPageProps {
  params: Promise<{ classId: string }>;
}

export default async function StudentClassPage({
  params,
}: StudentClassPageProps) {
  await requireRole('STUDENT');
  const { classId } = await params;

  return (
    <div className="space-y-6">
      <Link
        href="/student"
        className="inline-flex items-center gap-2 text-sm font-medium text-rose-600 transition hover:text-rose-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">
          Class overview coming soon
        </h1>
        <p className="mt-2 text-gray-600">
          You&apos;re looking at class{' '}
          <span className="font-semibold text-gray-900">{classId}</span>. The
          full student curriculum experience will ship with Sprint 2 Story #65.
        </p>
        <p className="mt-3 text-sm text-gray-500">
          Until then, you can head back to your dashboard to join additional
          classes or review your enrolled courses.
        </p>
      </div>
    </div>
  );
}
