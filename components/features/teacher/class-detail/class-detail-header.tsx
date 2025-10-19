import Link from "next/link";

import { getStandardsAlignmentLabel } from "@/lib/utils/class-format";
import type { StandardsAlignment } from "@prisma/client";

interface ClassDetailHeaderProps {
  classTitle: string;
  gradeLevel: number;
  standardsAlignment: StandardsAlignment;
  studentCount: number;
}

export function ClassDetailHeader({
  classTitle,
  gradeLevel,
  standardsAlignment,
  studentCount,
}: ClassDetailHeaderProps) {
  return (
    <header className="space-y-4">
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li>
            <Link href="/teacher" className="transition hover:text-rose-700">
              Teacher
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/teacher/classes" className="transition hover:text-rose-700">
              Classes
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-gray-900">{classTitle}</li>
        </ol>
      </nav>

      <div className="flex flex-col gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">Curriculum</p>
          <h1 className="text-3xl font-bold text-gray-900">{classTitle}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span>Grade {gradeLevel}</span>
          <span aria-hidden="true">•</span>
          <span>{getStandardsAlignmentLabel(standardsAlignment)}</span>
          <span aria-hidden="true">•</span>
          <span>{studentCount === 1 ? '1 student enrolled' : `${studentCount} students enrolled`}</span>
        </div>
      </div>
    </header>
  );
}
