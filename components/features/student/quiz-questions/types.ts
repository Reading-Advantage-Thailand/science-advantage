"use client";

export type QuizQuestionType =
  | 'MULTIPLE_CHOICE'
  | 'MULTIPLE_SELECT'
  | 'TRUE_FALSE'
  | 'FILL_IN_BLANK'
  | 'VOCABULARY_MATCH';

export type QuestionOptions =
  | string[]
  | {
    terms: string[];
    definitions: string[];
  }
  | null
  | undefined;

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  text: string;
  options?: QuestionOptions;
  points: number;
  order: number;
  correctAnswer?: string | string[];
}

export type StudentAnswer =
  | string
  | string[]
  | Record<string, string>
  | number
  | boolean
  | null
  | undefined;
