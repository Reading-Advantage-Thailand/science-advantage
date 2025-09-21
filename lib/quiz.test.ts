import { describe, expect, it } from "vitest";

import { sanitizeResponses, scoreQuizAttempt } from "@/lib/quiz";

describe("scoreQuizAttempt", () => {
  it("calculates score and marks responses", () => {
    const result = scoreQuizAttempt(
      [
        {
          id: "q1",
          answer: "A",
          options: ["A", "B", "C", "D"],
        },
        {
          id: "q2",
          answer: "B",
          options: ["A", "B", "C", "D"],
        },
      ],
      {
        q1: "A",
        q2: "C",
      }
    );

    expect(result.score).toBe(1);
    expect(result.maxScore).toBe(2);
    expect(result.responses).toEqual([
      {
        questionId: "q1",
        correctAnswer: "A",
        selectedOption: "A",
        isCorrect: true,
      },
      {
        questionId: "q2",
        correctAnswer: "B",
        selectedOption: "C",
        isCorrect: false,
      },
    ]);
  });

  it("treats invalid selections as unanswered", () => {
    const result = scoreQuizAttempt(
      [
        {
          id: "q1",
          answer: "A",
          options: ["A", "B", "C", "D"],
        },
      ],
      {
        q1: "Z",
      }
    );

    expect(result.score).toBe(0);
    expect(result.responses[0]).toMatchObject({
      questionId: "q1",
      selectedOption: null,
      isCorrect: false,
    });
  });
});

describe("sanitizeResponses", () => {
  it("returns a map of string responses", () => {
    const sanitized = sanitizeResponses({
      q1: "A",
      q2: 42,
      q3: null,
      q4: "B",
    });

    expect(sanitized).toEqual({
      q1: "A",
      q4: "B",
    });
  });

  it("returns null for invalid payloads", () => {
    expect(sanitizeResponses(null)).toBeNull();
    expect(sanitizeResponses(["A", "B"])).toBeNull();
  });
});
