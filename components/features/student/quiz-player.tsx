"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MultipleChoiceQuestion } from './quiz-questions/multiple-choice-question';
import { MultipleSelectQuestion } from './quiz-questions/multiple-select-question';
import { TrueFalseQuestion } from './quiz-questions/true-false-question';
import { FillInBlankQuestion } from './quiz-questions/fill-in-blank-question';
import { VocabularyMatchQuestion } from './quiz-questions/vocabulary-match-question';

// Types
interface QuizQuestion {
  id: string;
  type: 'MULTIPLE_CHOICE' | 'MULTIPLE_SELECT' | 'TRUE_FALSE' | 'FILL_IN_BLANK' | 'VOCABULARY_MATCH';
  text: string;
  options: any;
  points: number;
  order: number;
}

interface QuizData {
  quizId: string;
  lessonId: string;
  questions: QuizQuestion[];
  totalPoints: number;
  startedAt: string;
}

interface QuestionResponse {
  questionId: string;
  studentAnswer: any;
  timeSpentSeconds: number;
  answeredAt: string;
  order: number;
}

interface QuizResult {
  attemptId: string;
  score: number;
  maxScore: number;
  percentage: number;
  attemptNumber: number;
  completedAt: string;
  breakdown: {
    questionId: string;
    questionText: string;
    studentAnswer: any;
    correctAnswer: any;
    isCorrect: boolean;
    points: number;
    timeSpentSeconds: number;
  }[];
}

interface QuizPlayerProps {
  classId: string;
  lessonSlug: string;
}

export function QuizPlayer({ classId, lessonSlug }: QuizPlayerProps) {
  const router = useRouter();

  // Quiz state
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [questionStartTimes, setQuestionStartTimes] = useState<Record<number, number>>({});
  const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({});

  // UI state
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  // Fetch quiz on mount
  useEffect(() => {
    async function fetchQuiz() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/lessons/${lessonSlug}/quiz`);

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Please sign in to take this quiz');
          } else if (response.status === 403) {
            throw new Error('You are not enrolled in a class with this lesson');
          } else if (response.status === 404) {
            throw new Error('Lesson not found');
          } else if (response.status === 500) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to load quiz');
          } else {
            throw new Error('Failed to load quiz');
          }
        }

        const data: QuizData = await response.json();
        setQuizData(data);

        // Initialize timing for first question
        setQuestionStartTimes({ 0: Date.now() });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchQuiz();
  }, [lessonSlug]);

  // Track timing when question changes
  const recordQuestionTime = useCallback((questionIndex: number) => {
    if (!quizData) return;

    const question = quizData.questions[questionIndex];
    const startTime = questionStartTimes[questionIndex];

    if (startTime) {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      setQuestionTimes(prev => ({
        ...prev,
        [question.id]: timeSpent
      }));
    }
  }, [quizData, questionStartTimes]);

  // Navigate to next question
  const handleNext = useCallback(() => {
    if (!quizData || currentQuestionIndex >= quizData.questions.length - 1) return;

    recordQuestionTime(currentQuestionIndex);
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);
    setQuestionStartTimes(prev => ({
      ...prev,
      [nextIndex]: Date.now()
    }));
  }, [currentQuestionIndex, quizData, recordQuestionTime]);

  // Navigate to previous question
  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex <= 0) return;

    recordQuestionTime(currentQuestionIndex);
    const prevIndex = currentQuestionIndex - 1;
    setCurrentQuestionIndex(prevIndex);
    setQuestionStartTimes(prev => ({
      ...prev,
      [prevIndex]: Date.now()
    }));
  }, [currentQuestionIndex, recordQuestionTime]);

  // Handle answer change
  const handleAnswerChange = useCallback((questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  }, []);

  // Check if all questions are answered
  const allQuestionsAnswered = useCallback(() => {
    if (!quizData) return false;
    return quizData.questions.every(q => answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '');
  }, [quizData, answers]);

  // Submit quiz
  const handleSubmit = useCallback(async () => {
    if (!quizData || !allQuestionsAnswered()) return;

    try {
      setSubmitting(true);

      // Record time for current question
      recordQuestionTime(currentQuestionIndex);

      // Prepare responses
      const responses: QuestionResponse[] = quizData.questions.map((question) => ({
        questionId: question.id,
        studentAnswer: answers[question.id],
        timeSpentSeconds: questionTimes[question.id] || 0,
        answeredAt: new Date().toISOString(),
        order: question.order
      }));

      const response = await fetch(`/api/lessons/${lessonSlug}/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attemptId: quizData.quizId,
          responses
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please sign in to submit this quiz');
        } else if (response.status === 403) {
          throw new Error('Not authorized to submit this quiz');
        } else if (response.status === 400) {
          const data = await response.json();
          throw new Error(data.error || 'Invalid quiz submission');
        } else if (response.status === 409) {
          throw new Error('This quiz has already been submitted');
        } else {
          throw new Error('Failed to submit quiz');
        }
      }

      const resultData: QuizResult = await response.json();
      setResult(resultData);
      setShowSubmitDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setShowSubmitDialog(false);
    } finally {
      setSubmitting(false);
    }
  }, [quizData, answers, questionTimes, currentQuestionIndex, lessonSlug, allQuestionsAnswered, recordQuestionTime]);

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
        <span className="ml-2 text-gray-600">Loading quiz...</span>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => router.push(`/student/classes/${classId}`)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to curriculum
        </Button>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  // Render results screen
  if (result) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/student/classes/${classId}`)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to curriculum
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Quiz Results</CardTitle>
              {getScoreBadge(result.percentage)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Summary */}
            <div className="text-center">
              <div className="mb-2 text-6xl font-bold text-gray-900">
                {result.percentage.toFixed(1)}%
              </div>
              <div className="text-lg text-gray-600">
                {result.score} out of {result.maxScore} points
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Attempt #{result.attemptNumber}
              </div>
            </div>

            {/* Retake Button */}
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  setResult(null);
                  setAnswers({});
                  setQuestionTimes({});
                  setCurrentQuestionIndex(0);
                  setQuestionStartTimes({});
                  window.location.reload(); // Reload to fetch new quiz
                }}
                className="gap-2"
              >
                Retake Quiz
              </Button>
            </div>

            {/* Question Breakdown */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold">Question Breakdown</h3>
              {result.breakdown.map((item, index) => (
                <div
                  key={item.questionId}
                  className={`rounded-lg border p-4 ${
                    item.isCorrect
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <span className="font-semibold text-gray-900">
                      Question {index + 1}
                    </span>
                    {item.isCorrect ? (
                      <Badge className="bg-green-600">Correct</Badge>
                    ) : (
                      <Badge variant="destructive">Incorrect</Badge>
                    )}
                  </div>
                  <p className="mb-3 text-sm text-gray-700">{item.questionText}</p>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="font-medium">Your answer:</span>{' '}
                      <span>{formatAnswer(item.studentAnswer)}</span>
                    </div>
                    {!item.isCorrect && (
                      <div>
                        <span className="font-medium text-green-700">Correct answer:</span>{' '}
                        <span className="text-green-700">{formatAnswer(item.correctAnswer)}</span>
                      </div>
                    )}
                    <div className="text-gray-500">
                      Time spent: {item.timeSpentSeconds}s
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render quiz (no quiz data)
  if (!quizData) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => router.push(`/student/classes/${classId}`)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to curriculum
        </Button>
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
          <p className="text-sm text-gray-600">No quiz available.</p>
        </div>
      </div>
    );
  }

  // Render quiz questions
  const currentQuestion = quizData.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.push(`/student/classes/${classId}`)}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to curriculum
      </Button>

      {/* Progress Indicator */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
        <span className="text-sm font-medium text-gray-700">
          Question {currentQuestionIndex + 1} of {quizData.questions.length}
        </span>
        <span className="text-sm text-gray-600">
          {quizData.totalPoints} points total
        </span>
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">
              Question {currentQuestionIndex + 1}
            </CardTitle>
            <Badge variant="outline">{currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-900">{currentQuestion.text}</p>

          {/* Render appropriate question type */}
          {currentQuestion.type === 'MULTIPLE_CHOICE' && (
            <MultipleChoiceQuestion
              question={currentQuestion}
              value={answers[currentQuestion.id]}
              onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            />
          )}
          {currentQuestion.type === 'MULTIPLE_SELECT' && (
            <MultipleSelectQuestion
              question={currentQuestion}
              value={answers[currentQuestion.id] || []}
              onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            />
          )}
          {currentQuestion.type === 'TRUE_FALSE' && (
            <TrueFalseQuestion
              question={currentQuestion}
              value={answers[currentQuestion.id]}
              onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            />
          )}
          {currentQuestion.type === 'FILL_IN_BLANK' && (
            <FillInBlankQuestion
              question={currentQuestion}
              value={answers[currentQuestion.id] || ''}
              onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            />
          )}
          {currentQuestion.type === 'VOCABULARY_MATCH' && (
            <VocabularyMatchQuestion
              question={currentQuestion}
              value={answers[currentQuestion.id] || {}}
              onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        {isLastQuestion ? (
          <Button
            onClick={() => {
              if (!allQuestionsAnswered()) {
                alert('Please answer all questions before submitting.');
                return;
              }
              setShowSubmitDialog(true);
            }}
            disabled={!allQuestionsAnswered() || submitting}
            className="gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Submit Quiz
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="gap-2"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your quiz? You have answered{' '}
              {Object.keys(answers).length} of {quizData.questions.length} questions.
              Once submitted, you cannot change your answers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Helper function to get color-coded score badge
function getScoreBadge(percentage: number) {
  if (percentage >= 90) {
    return <Badge className="bg-blue-600 text-white">Excellent!</Badge>;
  } else if (percentage >= 80) {
    return <Badge className="bg-green-600 text-white">Great!</Badge>;
  } else if (percentage >= 60) {
    return <Badge className="bg-yellow-600 text-white">Good!</Badge>;
  } else {
    return <Badge className="bg-red-600 text-white">Keep Trying!</Badge>;
  }
}

// Helper function to format answers for display
function formatAnswer(answer: any): string {
  if (Array.isArray(answer)) {
    return answer.join(', ');
  } else if (typeof answer === 'object' && answer !== null) {
    return Object.entries(answer)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  } else {
    return String(answer);
  }
}
