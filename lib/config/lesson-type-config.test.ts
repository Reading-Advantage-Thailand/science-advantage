import { describe, it, expect } from 'vitest';
import { LESSON_TYPE_CONFIG } from '@/lib/config/lesson-type-config';
import type { LessonType } from '@prisma/client';
import { BookOpen, FlaskConical, Gamepad2, ClipboardCheck } from 'lucide-react';

describe('lesson-type-config', () => {
  const lessonTypes: LessonType[] = ['LESSON', 'LAB', 'ASSESSMENT', 'REVIEW'];

  it('has entries for all four lesson types', () => {
    expect(lessonTypes).toHaveLength(4);
    for (const type of lessonTypes) {
      expect(LESSON_TYPE_CONFIG).toHaveProperty(type);
    }
  });

  it('each config has required properties', () => {
    for (const type of lessonTypes) {
      const config = LESSON_TYPE_CONFIG[type];
      expect(config).toHaveProperty('label');
      expect(config).toHaveProperty('color');
      expect(config).toHaveProperty('badgeClass');
      expect(config).toHaveProperty('icon');
      expect(config).toHaveProperty('accentClass');
    }
  });

  it('LESSON has forest green color and BookOpen icon', () => {
    const config = LESSON_TYPE_CONFIG['LESSON'];
    expect(config.color).toBe('forest-green');
    expect(config.icon).toBe(BookOpen);
  });

  it('LAB has blue color and FlaskConical icon', () => {
    const config = LESSON_TYPE_CONFIG['LAB'];
    expect(config.color).toBe('blue');
    expect(config.icon).toBe(FlaskConical);
  });

  it('ASSESSMENT has gold color and ClipboardCheck icon', () => {
    const config = LESSON_TYPE_CONFIG['ASSESSMENT'];
    expect(config.color).toBe('gold');
    expect(config.icon).toBe(ClipboardCheck);
  });

  it('REVIEW has coral color and Gamepad2 icon', () => {
    const config = LESSON_TYPE_CONFIG['REVIEW'];
    expect(config.color).toBe('coral');
    expect(config.icon).toBe(Gamepad2);
  });
});
