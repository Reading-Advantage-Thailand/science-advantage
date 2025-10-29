import type { RecommendationContext } from '../recommendation-context';

/**
 * Build the system prompt for AI recommendation.
 */
export const buildSystemPrompt = (): string => {
  return `You are an educational AI assistant helping Thai elementary students improve their science mastery.

Your task is to recommend the best next lesson based on:
1. The student's current mastery gaps (weakest standards)
2. The lesson they just completed
3. Available curriculum lessons
4. Pedagogical best practices

GUARDRAILS:
- You MUST recommend a lesson from the provided candidate list (use exact lessonId)
- NEVER recommend a lesson that is already completed
- Avoid unsafe, inappropriate, or off-topic content
- Keep reasoning student-friendly (max 3 sentences, < 320 characters)
- Reasoning should be encouraging and specific to their needs

CURRICULUM STRUCTURE:
- Lessons are ordered sequentially within curriculum units
- Standards are organized by strands (Sc1-Sc8 for Thai, NGSS for US)
- Students should master foundational standards before advanced ones

OUTPUT FORMAT:
You must respond with a valid JSON object matching this schema:
{
  "recommendedLessonId": "string (exact lessonId from candidates)",
  "recommendedLessonSlug": "string (exact slug from candidates)",
  "lessonTitle": "string (exact title from candidates)",
  "focusStandards": ["array of standard codes this lesson addresses"],
  "reasoning": "string (student-friendly explanation, max 320 chars)",
  "confidence": "high" | "medium" | "low",
  "nextBestAlternatives": [
    {
      "lessonId": "string",
      "lessonTitle": "string"
    }
  ]
}`;
};

/**
 * Build the user prompt with context.
 */
export const buildUserPrompt = (context: RecommendationContext): string => {
  const { student, mastery, attempt, candidateLessons } = context;

  // Format mastery data
  const masteryText = mastery.length > 0
    ? mastery
        .map(
          (m, i) =>
            `${i + 1}. ${m.standardCode}: ${m.description}
   - Mastery: ${(m.masteryLevel * 100).toFixed(0)}%
   - Evidence count: ${m.evidenceCount}
   - Last assessed: ${m.lastAssessedAt.toISOString()}`
        )
        .join('\n')
    : 'No mastery gaps identified (all standards above threshold).';

  // Format attempt summary
  const attemptText = `Lesson: ${attempt.lessonTitle}
Score: ${attempt.score}/${attempt.maxScore} (${attempt.scorePercentage.toFixed(0)}%)
Questions: ${attempt.correctCount}/${attempt.questionsCount} correct`;

  // Format candidate lessons
  const availableLessons = candidateLessons.filter((l) => !l.completed);

  const candidatesText = availableLessons.length > 0
    ? availableLessons
        .map(
          (l) =>
            `- ID: ${l.lessonId}
  Title: ${l.lessonTitle}
  Slug: ${l.lessonSlug}
  Standards: ${l.standardsCovered.join(', ') || 'None specified'}
  Order: ${l.order}`
        )
        .join('\n')
    : 'No available lessons (all completed)';

  return `STUDENT CONTEXT:
- Alias: ${student.studentAlias} (anonymized)
- Grade: ${student.gradeLevel}
- Curriculum: ${student.curriculum}

MASTERY SNAPSHOT (Weakest Standards):
${masteryText}

RECENT ATTEMPT SUMMARY:
${attemptText}

CANDIDATE LESSONS (Not Yet Completed):
${candidatesText}

Based on this information, recommend the best next lesson for this student. Focus on addressing their weakest mastery areas while maintaining pedagogical progression.`;
};

/**
 * Build complete prompt for AI recommendation.
 */
export const buildRecommendationPrompt = (
  context: RecommendationContext
): { system: string; user: string } => {
  return {
    system: buildSystemPrompt(),
    user: buildUserPrompt(context),
  };
};
