export type QuizQuestionForScoring = {
  id: string;
  answer: string;
  options: string[];
};

type ResponsesPayload = Record<string, string>;

export type ScoredResponse = {
  questionId: string;
  selectedOption: string | null;
  correctAnswer: string;
  isCorrect: boolean;
};

export type ScoringResult = {
  score: number;
  maxScore: number;
  responses: ScoredResponse[];
};

export function scoreQuizAttempt(
  questions: QuizQuestionForScoring[],
  responses: ResponsesPayload
): ScoringResult {
  const scoredResponses = questions.map((question) => {
    const rawSelection = responses[question.id];
    const selectedOption =
      typeof rawSelection === "string" && question.options.includes(rawSelection)
        ? rawSelection
        : null;

    return {
      questionId: question.id,
      selectedOption,
      correctAnswer: question.answer,
      isCorrect: selectedOption === question.answer,
    } satisfies ScoredResponse;
  });

  const score = scoredResponses.reduce(
    (total, response) => total + (response.isCorrect ? 1 : 0),
    0
  );

  return {
    score,
    maxScore: questions.length,
    responses: scoredResponses,
  } satisfies ScoringResult;
}

export function sanitizeResponses(payload: unknown): ResponsesPayload | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const sanitized: ResponsesPayload = {};

  for (const [questionId, value] of Object.entries(payload)) {
    if (typeof questionId !== "string") {
      continue;
    }

    if (typeof value === "string") {
      sanitized[questionId] = value;
    }
  }

  return sanitized;
}
