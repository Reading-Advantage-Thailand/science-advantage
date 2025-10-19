import { StandardsAlignment } from '@prisma/client';

const STANDARDS_LABEL: Record<StandardsAlignment, string> = {
  THAI: 'Thai National Standards',
  NGSS: 'NGSS',
};

export function getStandardsAlignmentLabel(alignment: StandardsAlignment) {
  return STANDARDS_LABEL[alignment] ?? alignment;
}

export function formatStudentCount(count: number) {
  if (count === 0) {
    return 'No students yet';
  }

  return `${count} ${count === 1 ? 'student' : 'students'}`;
}
