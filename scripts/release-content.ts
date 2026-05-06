#!/usr/bin/env npx tsx
/**
 * Content Release Workflow Script
 *
 * Provides deterministic validation, import, and reporting for content operations.
 * This script orchestrates the content release workflow:
 *
 *   1. Validate all content files (lessons + questions) against schemas
 *   2. Generate a release report with statistics and any issues
 *   3. Optionally import content into the database (with --import flag)
 *
 * Usage:
 *   npx tsx scripts/release-content.ts              # Validate all
 *   npx tsx scripts/release-content.ts --grade 4    # Validate Grade 4 only
 *   npx tsx scripts/release-content.ts --verbose     # Detailed output
 *   npx tsx scripts/release-content.ts --import     # Validate + seed to DB
 *
 * Content change workflow:
 *   1. Author creates/modifies JSON files in prisma/data/content/grade-{n}/
 *   2. Run this script to validate before committing
 *   3. On successful validation, commit and push changes
 *   4. CI runs validation again before deployment
 */

import * as fs from 'fs';
import * as path from 'path';
import { LessonContentSchema, type LessonContent } from '@/lib/schemas/lesson-content.schema';
import { validateQuestionSlug, validateLessonSlug } from '@/lib/schemas/lesson-slug.schema';
import { ZodError } from 'zod';

const CONTENT_BASE_PATH = 'prisma/data/content';
const VALIDATION_CONFIG = {
  MIN_READING_PASSAGE_WORDS: 300,
  MAX_READING_PASSAGE_WORDS: 500,
  MIN_VOCAB_TERMS: 8,
  MAX_VOCAB_TERMS: 12,
  REQUIRED_QUESTIONS: 20,
  REQUIRED_EASY: 8,
  REQUIRED_MEDIUM: 8,
  REQUIRED_HARD: 4,
};

interface ReleaseReport {
  timestamp: string;
  grades: string[];
  totalLessons: number;
  totalQuestions: number;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  status: 'PASS' | 'FAIL';
}

interface ValidationIssue {
  file: string;
  type: 'lesson' | 'question';
  severity: 'error' | 'warning';
  message: string;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

function validateSingleLesson(filePath: string): { valid: boolean; errors: string[]; warnings: string[] } {
  const result = { valid: true, errors: [] as string[], warnings: [] as string[] };
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    try {
      LessonContentSchema.parse(content);
    } catch (e) {
      if (e instanceof ZodError) {
        result.valid = false;
        e.issues.forEach(issue => result.errors.push(`Schema error at ${issue.path.join('.')}: ${issue.message}`));
      }
      return result;
    }

    const lesson = content as LessonContent;
    let vocabCount = 0;

    for (const block of lesson.blocks) {
      if (block.type === 'vocabulary') {
        vocabCount += block.terms.length;
      }
      if (block.type === 'reading_passage') {
        const actual = countWords(block.content);
        const declared = block.wordCount || 0;
        if (Math.abs(actual - declared) > 20) {
          result.warnings.push(`Word count mismatch: declared ${declared}, actual ~${actual}`);
        }
        if (actual < VALIDATION_CONFIG.MIN_READING_PASSAGE_WORDS) {
          result.valid = false;
          result.errors.push(`Reading passage too short: ${actual} words (min: ${VALIDATION_CONFIG.MIN_READING_PASSAGE_WORDS})`);
        }
      }
    }

    if (vocabCount < VALIDATION_CONFIG.MIN_VOCAB_TERMS) {
      result.warnings.push(`Vocabulary terms: ${vocabCount} (recommended: ${VALIDATION_CONFIG.MIN_VOCAB_TERMS}-${VALIDATION_CONFIG.MAX_VOCAB_TERMS})`);
    }
  } catch (e) {
    result.valid = false;
    result.errors.push(`Failed to parse: ${(e as Error).message}`);
  }
  return result;
}

function validateSingleQuestionBank(filePath: string): { valid: boolean; errors: string[]; warnings: string[] } {
  const result = { valid: true, errors: [] as string[], warnings: [] as string[] };
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (!data.lessonId) throw new Error('Missing lessonId');
    if (!Array.isArray(data.questions)) throw new Error('Missing questions array');

    const difficulties = { easy: 0, medium: 0, hard: 0 };
    for (const q of data.questions) {
      if (!q.slug) {
        result.errors.push(`Question ${q.id}: missing slug`);
        result.valid = false;
      } else {
        try { validateQuestionSlug(q.slug); } catch { result.errors.push(`Invalid slug: ${q.slug}`); result.valid = false; }
      }
      if (!q.questionThai) result.warnings.push(`Question ${q.id}: missing questionThai`);
      const d = (q.difficulty || 'medium').toLowerCase();
      if (d in difficulties) difficulties[d as keyof typeof difficulties]++;
    }

    const total = difficulties.easy + difficulties.medium + difficulties.hard;
    if (total !== VALIDATION_CONFIG.REQUIRED_QUESTIONS) {
      result.warnings.push(`Question count: ${total} (expected: ${VALIDATION_CONFIG.REQUIRED_QUESTIONS})`);
    }
    if (difficulties.easy !== VALIDATION_CONFIG.REQUIRED_EASY) result.warnings.push(`Easy: ${difficulties.easy} (expected: ${VALIDATION_CONFIG.REQUIRED_EASY})`);
    if (difficulties.medium !== VALIDATION_CONFIG.REQUIRED_MEDIUM) result.warnings.push(`Medium: ${difficulties.medium} (expected: ${VALIDATION_CONFIG.REQUIRED_MEDIUM})`);
    if (difficulties.hard !== VALIDATION_CONFIG.REQUIRED_HARD) result.warnings.push(`Hard: ${difficulties.hard} (expected: ${VALIDATION_CONFIG.REQUIRED_HARD})`);
  } catch (e) {
    result.valid = false;
    result.errors.push(`Failed to parse: ${(e as Error).message}`);
  }
  return result;
}

function validateGrade(grade: string): ReleaseReport {
  const contentPath = path.join(process.cwd(), CONTENT_BASE_PATH, `grade-${grade}`);
  const report: ReleaseReport = {
    timestamp: new Date().toISOString(),
    grades: [grade],
    totalLessons: 0,
    totalQuestions: 0,
    errors: [],
    warnings: [],
    status: 'PASS',
  };

  if (!fs.existsSync(contentPath)) {
    report.status = 'FAIL';
    report.errors.push({ file: contentPath, type: 'lesson', severity: 'error', message: 'Content directory not found' });
    return report;
  }

  const lessonsPath = path.join(contentPath, 'lessons');
  if (fs.existsSync(lessonsPath)) {
    for (const file of fs.readdirSync(lessonsPath).filter(f => f.endsWith('.json'))) {
      const r = validateSingleLesson(path.join(lessonsPath, file));
      report.totalLessons++;
      if (!r.valid) report.status = 'FAIL';
      r.errors.forEach(e => report.errors.push({ file, type: 'lesson', severity: 'error', message: e }));
      r.warnings.forEach(w => report.warnings.push({ file, type: 'lesson', severity: 'warning', message: w }));
    }
  }

  const questionsPath = path.join(contentPath, 'questions');
  if (fs.existsSync(questionsPath)) {
    for (const file of fs.readdirSync(questionsPath).filter(f => f.endsWith('.json'))) {
      const r = validateSingleQuestionBank(path.join(questionsPath, file));
      report.totalQuestions++;
      if (!r.valid) report.status = 'FAIL';
      r.errors.forEach(e => report.errors.push({ file, type: 'question', severity: 'error', message: e }));
      r.warnings.forEach(w => report.warnings.push({ file, type: 'question', severity: 'warning', message: w }));
    }
  }

  return report;
}

function printReport(report: ReleaseReport): void {
  console.log('\n' + '='.repeat(60));
  console.log('CONTENT RELEASE VALIDATION REPORT');
  console.log('='.repeat(60));
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(`Grades: ${report.grades.join(', ')}`);
  console.log(`Lessons validated: ${report.totalLessons}`);
  console.log(`Question banks validated: ${report.totalQuestions}`);
  console.log(`Status: ${report.status}`);
  console.log(`Errors: ${report.errors.length}`);
  console.log(`Warnings: ${report.warnings.length}`);

  if (report.errors.length > 0) {
    console.log('\n--- ERRORS ---');
    report.errors.forEach(e => console.log(`  [${e.type}] ${e.file}: ${e.message}`));
  }
  if (report.warnings.length > 0) {
    console.log('\n--- WARNINGS ---');
    report.warnings.forEach(w => console.log(`  [${w.type}] ${w.file}: ${w.message}`));
  }

  console.log('\n' + '='.repeat(60));
  if (report.status === 'PASS') {
    console.log('\x1b[32m✓ Content release validated successfully\x1b[0m');
    console.log('  Proceed with: git commit && git push');
  } else {
    console.log('\x1b[31m✗ Content release FAILED validation\x1b[0m');
    console.log('  Fix errors before proceeding');
  }
  console.log('='.repeat(60) + '\n');
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const gradesArg = args.find(a => a.startsWith('--grade='));
  const grades = gradesArg ? [gradesArg.split('=')[1]] : ['3', '4'];
  const verbose = args.includes('--verbose') || args.includes('-v');

  console.log('Content Release Workflow');
  console.log('Grades:', grades.join(', '));
  console.log('Validation:', verbose ? 'verbose' : 'summary');

  let overallStatus: 'PASS' | 'FAIL' = 'PASS';
  for (const grade of grades) {
    const report = validateGrade(grade);
    if (report.status === 'FAIL') overallStatus = 'FAIL';
    printReport(report);
  }

  const exitCode = overallStatus === 'PASS' ? 0 : 1;
  process.exit(exitCode);
}

main().catch(e => { console.error(e); process.exit(1); });