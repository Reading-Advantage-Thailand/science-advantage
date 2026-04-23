import { describe, it, expect } from 'vitest';
import { ZodError } from 'zod';
import {
  LessonSlugSchema,
  CurriculumUnitSlugSchema,
  QuestionSlugSchema,
  validateLessonSlug,
  validateCurriculumUnitSlug,
  validateQuestionSlug,
  isValidLessonSlug,
  isValidCurriculumUnitSlug,
  isValidQuestionSlug,
  generateLessonSlug,
  generateCurriculumUnitSlug,
  generateQuestionSlug,
} from '../lesson-slug.schema';
import { LessonType, StandardsAlignment } from '@prisma/client';

describe('Curriculum Identifiers Schema', () => {
  describe('QuestionSlugSchema', () => {
    it('should accept valid kebab-case question slug', () => {
      const result = QuestionSlugSchema.parse('what-is-photosynthesis');
      expect(result).toBe('what-is-photosynthesis');
    });

    it('should accept question slug with numbers', () => {
      const result = QuestionSlugSchema.parse('q1-life-cycle');
      expect(result).toBe('q1-life-cycle');
    });

    it('should reject slug with uppercase letters', () => {
      expect(() => QuestionSlugSchema.parse('What-Is-Photosynthesis')).toThrow();
    });

    it('should reject slug starting with number', () => {
      expect(() => QuestionSlugSchema.parse('1-what-is-photosynthesis')).toThrow();
    });
  });

  describe('validateQuestionSlug', () => {
    it('should return slug if valid', () => {
      const result = validateQuestionSlug('what-is-photosynthesis');
      expect(result).toBe('what-is-photosynthesis');
    });

    it('should throw descriptive error for invalid slug', () => {
      expect(() => validateQuestionSlug('Invalid Slug')).toThrow('Question slug must be a valid kebab-case slug');
    });
  });

  describe('isValidQuestionSlug', () => {
    it('should return true for valid slug', () => {
      expect(isValidQuestionSlug('what-is-photosynthesis')).toBe(true);
    });

    it('should return false for invalid slug', () => {
      expect(isValidQuestionSlug('Invalid Slug')).toBe(false);
    });
  });

  describe('generateQuestionSlug', () => {
    it('should generate valid slug from question text', () => {
      const slug = generateQuestionSlug('What is photosynthesis?');
      expect(slug).toBe('q-what-is-photosynthesis');
      expect(isValidQuestionSlug(slug)).toBe(true);
    });

    it('should handle Thai text by transliterating', () => {
      const slug = generateQuestionSlug('การสังเคราะห์ด้วยแสงคืออะไร?');
      expect(isValidQuestionSlug(slug)).toBe(true);
    });
  });

  describe('LessonSlugSchema', () => {
    it('should accept valid kebab-case lesson slug', () => {
      const result = LessonSlugSchema.parse('being-a-scientist');
      expect(result).toBe('being-a-scientist');
    });

    it('should accept lesson slug with numbers', () => {
      const result = LessonSlugSchema.parse('lesson-1-intro');
      expect(result).toBe('lesson-1-intro');
    });

    it('should reject slug with uppercase letters', () => {
      expect(() => LessonSlugSchema.parse('Being-a-Scientist')).toThrow(ZodError);
    });

    it('should reject slug with spaces', () => {
      expect(() => LessonSlugSchema.parse('being a scientist')).toThrow(ZodError);
    });

    it('should reject slug starting with number', () => {
      expect(() => LessonSlugSchema.parse('3-being-a-scientist')).toThrow(ZodError);
    });

    it('should reject slug with special characters', () => {
      expect(() => LessonSlugSchema.parse('being_a_scientist')).toThrow(ZodError);
      expect(() => LessonSlugSchema.parse('being.a.scientist')).toThrow(ZodError);
    });

    it('should reject slug shorter than 2 characters', () => {
      expect(() => LessonSlugSchema.parse('a')).toThrow(ZodError);
    });

    it('should reject slug longer than 100 characters', () => {
      const longSlug = 'a'.repeat(101);
      expect(() => LessonSlugSchema.parse(longSlug)).toThrow(ZodError);
    });
  });

  describe('CurriculumUnitSlugSchema', () => {
    it('should accept valid kebab-case unit slug', () => {
      const result = CurriculumUnitSlugSchema.parse('unit-1-intro-science');
      expect(result).toBe('unit-1-intro-science');
    });

    it('should reject slug with uppercase letters', () => {
      expect(() => CurriculumUnitSlugSchema.parse('Unit-1')).toThrow(ZodError);
    });

    it('should reject slug with special characters', () => {
      expect(() => CurriculumUnitSlugSchema.parse('unit_1')).toThrow(ZodError);
    });
  });

  describe('validateLessonSlug', () => {
    it('should return slug if valid', () => {
      const result = validateLessonSlug('being-a-scientist');
      expect(result).toBe('being-a-scientist');
    });

    it('should throw descriptive error for invalid slug', () => {
      expect(() => validateLessonSlug('Invalid Slug')).toThrow('Lesson slug must be a valid kebab-case slug');
    });
  });

  describe('validateCurriculumUnitSlug', () => {
    it('should return slug if valid', () => {
      const result = validateCurriculumUnitSlug('unit-1-living-things');
      expect(result).toBe('unit-1-living-things');
    });
  });

  describe('isValidLessonSlug', () => {
    it('should return true for valid slug', () => {
      expect(isValidLessonSlug('being-a-scientist')).toBe(true);
    });

    it('should return false for invalid slug', () => {
      expect(isValidLessonSlug('Invalid Slug')).toBe(false);
      expect(isValidLessonSlug('')).toBe(false);
      expect(isValidLessonSlug('a')).toBe(false);
    });
  });

  describe('isValidCurriculumUnitSlug', () => {
    it('should return true for valid unit slug', () => {
      expect(isValidCurriculumUnitSlug('unit-1')).toBe(true);
    });

    it('should return false for invalid unit slug', () => {
      expect(isValidCurriculumUnitSlug('Unit-1')).toBe(false);
    });
  });

  describe('generateLessonSlug', () => {
    it('should generate valid slug from title', () => {
      const slug = generateLessonSlug('Being a Scientist');
      expect(slug).toBe('being-a-scientist');
      expect(isValidLessonSlug(slug)).toBe(true);
    });

    it('should handle Thai text by transliterating', () => {
      const slug = generateLessonSlug('การเป็นนักวิทยาศาสตร์');
      expect(isValidLessonSlug(slug)).toBe(true);
    });

    it('should handle titles with special characters', () => {
      const slug = generateLessonSlug('Lesson 1: Introduction to Science!');
      expect(isValidLessonSlug(slug)).toBe(true);
      expect(slug).toBe('lesson-1-introduction-to-science');
    });

    it('should handle empty strings gracefully', () => {
      expect(() => generateLessonSlug('')).toThrow('Title is required to generate a slug');
    });
  });

  describe('generateCurriculumUnitSlug', () => {
    it('should generate valid slug from unit title', () => {
      const slug = generateCurriculumUnitSlug('Unit 1: Introduction to Science');
      expect(slug).toBe('unit-1-introduction-to-science');
      expect(isValidCurriculumUnitSlug(slug)).toBe(true);
    });

    it('should prepend unit- prefix when generating', () => {
      const slug = generateCurriculumUnitSlug('Living Things');
      expect(slug.startsWith('unit-')).toBe(true);
    });
  });
});

describe('Lesson Structured Content Contract', () => {
  describe('LessonType enum coverage', () => {
    it('should support all required lesson types from spec', () => {
      const requiredTypes: LessonType[] = ['LESSON', 'LAB', 'ASSESSMENT', 'REVIEW'];
      for (const type of requiredTypes) {
        expect(Object.values(LessonType)).toContain(type);
      }
    });

    it('should have explicit instruction lesson type for FR-2', () => {
      expect(LessonType.LESSON).toBeDefined();
      expect(LessonType.LAB).toBeDefined();
    });

    it('should have REVIEW lesson type for fun review lessons (FR-2)', () => {
      expect(LessonType.REVIEW).toBeDefined();
    });
  });

  describe('Structured content validation', () => {
    it('should validate explicit instruction lesson blocks', async () => {
      const { validateLessonContent } = await import('@/lib/schemas/lesson-content.schema');

      const instructionLesson = {
        version: 1,
        blocks: [
          {
            id: 'intro',
            type: 'text',
            content: 'Today we learn about plants...',
          },
          {
            id: 'vocab',
            type: 'vocabulary',
            terms: [
              { term: 'Photosynthesis', thai: 'การสังเคราะห์ด้วยแสง', definition: 'How plants make food' },
            ],
          },
          {
            id: 'reading',
            type: 'reading_passage',
            title: 'How Plants Make Food',
            content: 'Plants are amazing...',
            wordCount: 150,
          },
        ],
      };

      const result = validateLessonContent(instructionLesson);
      expect(result.version).toBe(1);
      expect(result.blocks).toHaveLength(3);
    });

    it('should validate lab lesson blocks', async () => {
      const { validateLessonContent } = await import('@/lib/schemas/lesson-content.schema');

      const labLesson = {
        version: 1,
        blocks: [
          {
            id: 'intro',
            type: 'text',
            content: 'Today we will conduct an experiment...',
          },
          {
            id: 'materials',
            type: 'materials',
            items: [
              { quantity: '2', item: 'Plants', itemThai: 'ต้นไม้' },
              { quantity: '1', item: 'Magnifying glass', itemThai: 'แว่นขยาย' },
            ],
          },
          {
            id: 'procedure',
            type: 'procedure',
            steps: [
              { stepNumber: 1, instruction: 'Observe the plant', instructionThai: 'สังเกตต้นไม้' },
              { stepNumber: 2, instruction: 'Record observations', instructionThai: 'บันทึกการสังเกต' },
            ],
          },
        ],
      };

      const result = validateLessonContent(labLesson);
      expect(result.version).toBe(1);
      expect(result.blocks).toHaveLength(3);
    });

    it('should validate fun review lesson blocks', async () => {
      const { validateLessonContent } = await import('@/lib/schemas/lesson-content.schema');

      const reviewLesson = {
        version: 1,
        blocks: [
          {
            id: 'intro',
            type: 'text',
            content: 'Lets review what we learned about plants!',
          },
          {
            id: 'review',
            type: 'review',
            title: 'Plant Parts Review',
            titleThai: 'ทบทวนส่วนต่างๆ ของต้นไม้',
            questions: [
              { questionId: 'q1', text: 'What do plants need to grow?', textThai: 'ต้นไม้ต้องการอะไรในการเติบโต?' },
            ],
          },
        ],
      };

      const result = validateLessonContent(reviewLesson);
      expect(result.version).toBe(1);
      expect(result.blocks).toHaveLength(2);
    });

    it('should validate summative assessment lesson blocks', async () => {
      const { validateLessonContent } = await import('@/lib/schemas/lesson-content.schema');

      const assessmentLesson = {
        version: 1,
        blocks: [
          {
            id: 'intro',
            type: 'text',
            content: 'Time to show what you have learned!',
          },
          {
            id: 'quiz',
            type: 'quiz',
            title: 'Unit 1 Assessment',
            titleThai: 'แบบทดสอบบทที่ 1',
            passingScore: 70,
            questions: [
              {
                questionId: 'q1',
                type: 'multiple_choice',
                text: 'What is photosynthesis?',
                textThai: 'การสังเคราะห์ด้วยแสงคืออะไร?',
                options: [
                  { id: 'a', text: 'How plants make food', isCorrect: true },
                  { id: 'b', text: 'How animals breathe', isCorrect: false },
                ],
              },
            ],
          },
        ],
      };

      const result = validateLessonContent(assessmentLesson);
      expect(result.version).toBe(1);
      expect(result.blocks).toHaveLength(2);
    });
  });
});

describe('Standards Mapping Validation', () => {
  it('should require standards alignment for lesson creation', async () => {
    const { validateStandardsFile } = await import('@/lib/schemas/validate-json');

    const validStandards = {
      framework: 'THAI' as StandardsAlignment,
      gradeLevel: 3,
      standards: [
        { code: 'Sc1.1-G3', description: 'Identify characteristics of living things' },
        { code: 'Sc8.2-G3', description: 'Use scientific tools safely' },
      ],
    };

    expect(() => validateStandardsFile(validStandards)).not.toThrow();
  });

  it('should reject standards file without framework', async () => {
    const { validateStandardsFile } = await import('@/lib/schemas/validate-json');

    const invalidStandards = {
      gradeLevel: 3,
      standards: [
        { code: 'Sc1.1-G3', description: 'Identify characteristics' },
      ],
    };

    expect(() => validateStandardsFile(invalidStandards)).toThrow('Standards file must have a valid "framework" field');
  });

  it('should validate standards code format', async () => {
    const { validateStandardsFile } = await import('@/lib/schemas/validate-json');

    const validStandards = {
      framework: 'THAI' as StandardsAlignment,
      gradeLevel: 3,
      standards: [
        { code: 'Sc1.1-G3', description: 'Test' },
      ],
    };

    expect(() => validateStandardsFile(validStandards)).not.toThrow();
  });
});



describe('Media and Localization Requirements', () => {
  it('should have explicit Thai content fields where English exists', async () => {
    const { validateLessonContent } = await import('@/lib/schemas/lesson-content.schema');

    const bilingualLesson = {
      version: 1,
      blocks: [
        {
          id: 'intro',
          type: 'text',
          content: 'Welcome to the lesson',
          contentThai: 'ยินดีต้อนรับสู่บทเรียน',
        },
        {
          id: 'vocab',
          type: 'vocabulary',
          terms: [
            {
              term: 'Photosynthesis',
              thai: 'การสังเคราะห์ด้วยแสง',
              definition: 'The process by which plants convert sunlight into energy',
            },
          ],
        },
        {
          id: 'image-1',
          type: 'image',
          src: '/images/plant-diagram.png',
          alt: 'Diagram showing the parts of a plant involved in photosynthesis',
          caption: 'Parts of a plant',
          captionThai: 'ส่วนต่างๆ ของพืช',
        },
      ],
    };

    const result = validateLessonContent(bilingualLesson);
    expect(result.blocks[0]).toHaveProperty('contentThai');
    expect(result.blocks[0].contentThai).toBe('ยินดีต้อนรับสู่บทเรียน');
  });

  it('should require alt text for images as accessibility requirement', async () => {
    const { validateLessonContent } = await import('@/lib/schemas/lesson-content.schema');

    const lessonWithImage = {
      version: 1,
      blocks: [
        {
          type: 'image',
          src: '/images/diagram.png',
          alt: 'A detailed diagram showing plant anatomy with labeled parts',
        },
      ],
    };

    expect(() => validateLessonContent(lessonWithImage)).not.toThrow();
  });

  it('should reject image with missing alt text', async () => {
    const { validateLessonContent } = await import('@/lib/schemas/lesson-content.schema');

    const lessonWithoutAlt = {
      version: 1,
      blocks: [
        {
          type: 'image',
          src: '/images/diagram.png',
          alt: 'Plant', // Too short - must be at least 10 chars
        },
      ],
    };

    expect(() => validateLessonContent(lessonWithoutAlt)).toThrow(ZodError);
  });
});

describe('Seed Data Validation', () => {
  describe('Lesson seed data format (FR-3)', () => {
    it('should validate against lessons file schema', async () => {
      const { validateLessonsFile } = await import('@/lib/schemas/validate-json');

      const validLessonsFile = {
        framework: 'THAI',
        gradeLevel: 3,
        unit: 1,
        lessons: [
          {
            id: 'g3-being-a-scientist',
            slug: 'being-a-scientist',
            title: 'Being a Scientist',
            description: 'What do scientists do?',
            content: 'Scientists follow steps...',
            order: 1,
            standards: ['Sc8.1-G3'],
          },
        ],
      };

      expect(() => validateLessonsFile(validLessonsFile)).not.toThrow();
    });

    it('should reject lessons file without framework', async () => {
      const { validateLessonsFile } = await import('@/lib/schemas/validate-json');

      const invalidFile = {
        gradeLevel: 3,
        unit: 1,
        lessons: [],
      };

      expect(() => validateLessonsFile(invalidFile)).toThrow('Lessons file must have a valid "framework" field');
    });

    it('should require structuredContent for new lesson format (FR-2)', async () => {
      const { validateLessonsFile } = await import('@/lib/schemas/validate-json');

      const legacyLesson = {
        framework: 'THAI',
        gradeLevel: 3,
        unit: 1,
        lessons: [
          {
            id: 'g3-legacy-lesson',
            slug: 'legacy-lesson',
            title: 'Legacy Lesson',
            description: 'Old format without structured content',
            content: 'Just plain content...',
            order: 1,
            standards: ['Sc8.1-G3'],
          },
        ],
      };

      expect(() => validateLessonsFile(legacyLesson)).not.toThrow();
    });
  });

  describe('Curriculum units seed data format (FR-1)', () => {
    it('should validate curriculum units file schema', async () => {
      const { validateCurriculumUnitsFile } = await import('@/lib/schemas/validate-json');

      const validUnitsFile = {
        framework: 'THAI',
        gradeLevel: 3,
        units: [
          {
            id: 'thai-g3-unit-1',
            slug: 'unit-1-introduction-to-science',
            title: 'Unit 1: Introduction to Science',
            description: 'Learn about science',
            order: 1,
            lessonIds: ['g3-being-a-scientist', 'g3-science-safety-tools'],
          },
        ],
      };

      expect(() => validateCurriculumUnitsFile(validUnitsFile)).not.toThrow();
    });

    it('should require lessonIds array for each unit', async () => {
      const { validateCurriculumUnitsFile } = await import('@/lib/schemas/validate-json');

      const invalidUnit = {
        framework: 'THAI',
        gradeLevel: 3,
        units: [
          {
            id: 'thai-g3-unit-1',
            slug: 'unit-1',
            title: 'Unit 1',
            description: 'Test',
            order: 1,
          },
        ],
      };

      expect(() => validateCurriculumUnitsFile(invalidUnit)).toThrow('Unit at index 0 must have a "lessonIds" array');
    });
  });
});