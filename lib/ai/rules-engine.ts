import type { CandidateLesson, MasterySnapshot } from './recommendation-context';
import type { Recommendation } from '../validations/ai';

/**
 * Threshold for "weak" mastery in fallback rules.
 */
const WEAK_MASTERY_THRESHOLD = 0.6;

/**
 * Find the strand name from a standard code (e.g., "Sc1.1-G3" -> "Sc1")
 */
const extractStrand = (standardCode: string): string => {
  const match = standardCode.match(/^(Sc\d+)/);
  return match ? match[1] : standardCode;
};

/**
 * Get strand display name.
 */
const getStrandName = (strandCode: string): string => {
  const strandNames: Record<string, string> = {
    Sc1: 'Scientific Inquiry',
    Sc2: 'Life Science',
    Sc3: 'Physical Science',
    Sc4: 'Earth and Space Science',
    Sc5: 'Technology and Engineering',
    Sc6: 'Science and Society',
    Sc7: 'Scientific Processes',
    Sc8: 'Scientific Thinking',
  };
  return strandNames[strandCode] || 'Science Skills';
};

/**
 * Generate reasoning text for fallback recommendation.
 */
const generateFallbackReasoning = (
  standardCodes: string[],
  masteryLevel: number
): string => {
  if (standardCodes.length === 0) {
    return 'Based on your curriculum progress, this is the recommended next lesson to continue your learning.';
  }

  const strands = [...new Set(standardCodes.map(extractStrand))];
  const strandName = getStrandName(strands[0]);
  const masteryPercent = Math.round(masteryLevel * 100);

  if (strands.length === 1) {
    return `You're at ${masteryPercent}% mastery in ${strandName}. This lesson will help strengthen these skills.`;
  }

  return `Based on your mastery levels, focusing on ${standardCodes.slice(0, 2).join(', ')} will strengthen ${strandName}.`;
};

/**
 * Deterministic fallback: select lesson based on rules.
 *
 * Rules:
 * 1. Select lesson covering weakest mastery standard with mastery < threshold
 * 2. If multiple lessons qualify, choose the earliest in curriculum order
 * 3. If no weak standards, recommend next incomplete lesson in order
 */
export const selectLessonByRules = (
  mastery: MasterySnapshot[],
  candidateLessons: CandidateLesson[]
): Recommendation | null => {
  // Filter to incomplete lessons only
  const incompleteLessons = candidateLessons.filter((l) => !l.completed);

  if (incompleteLessons.length === 0) {
    return null; // No lessons available
  }

  // Find weak standards (below threshold)
  const weakStandards = mastery.filter((m) => m.masteryLevel < WEAK_MASTERY_THRESHOLD);

  if (weakStandards.length > 0) {
    // Strategy 1: Find lesson covering weakest standard
    const weakestStandard = weakStandards[0]; // Already sorted ascending by mastery

    // Find lessons that cover this standard
    const matchingLessons = incompleteLessons.filter((lesson) =>
      lesson.standardsCovered.includes(weakestStandard.standardCode)
    );

    if (matchingLessons.length > 0) {
      // Choose earliest in curriculum order
      const selectedLesson = matchingLessons.sort((a, b) => a.order - b.order)[0];

      return {
        lessonId: selectedLesson.lessonId,
        lessonTitle: selectedLesson.lessonTitle,
        lessonSlug: selectedLesson.lessonSlug,
        focusStandards: [weakestStandard.standardCode],
        reasoning: generateFallbackReasoning(
          [weakestStandard.standardCode],
          weakestStandard.masteryLevel
        ),
        confidence: 'medium',
      };
    }
  }

  // Strategy 2: No weak standards or no matching lessons
  // Recommend next lesson in curriculum order
  const nextLesson = incompleteLessons.sort((a, b) => a.order - b.order)[0];

  return {
    lessonId: nextLesson.lessonId,
    lessonTitle: nextLesson.lessonTitle,
    lessonSlug: nextLesson.lessonSlug,
    focusStandards: nextLesson.standardsCovered.slice(0, 3), // Top 3 standards
    reasoning: generateFallbackReasoning(
      nextLesson.standardsCovered.slice(0, 2),
      1.0 // No weak mastery
    ),
    confidence: 'low',
  };
};
