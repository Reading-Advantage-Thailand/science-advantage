"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AssessmentTimer } from '@/components/features/student/assessment-timer';
import { QuestionNavigator } from '@/components/features/student/question-navigator';
import { AiRecommendationCard } from '@/components/features/student/ai-recommendation-card';
import { ContinueLearningCard } from '@/components/features/student/continue-learning-card';
import { isAiRecommendationEnabled } from '@/lib/config/features';
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
import { QuizQuestion, StudentAnswer } from './quiz-questions/types';
import { ConfettiCelebration } from '@/components/features/gamification/confetti-celebration';
import { BadgeUnlockAnimation } from '@/components/features/gamification/badge-unlock-animation';
import { LevelUpAnimation } from '@/components/features/gamification/level-up-animation';
import { GradingAnimation } from '@/components/features/student/grading-animation';
import { ScoreTracker, FeedbackMessage } from '@/components/features/student/review-feedback';
import { BadgeDefinition, BADGE_DEFINITIONS } from '@/lib/gamification/badges';
import { toast } from 'sonner';

interface QuizData {
  quizId: string;
  lessonId: string;
  lessonType: 'LESSON' | 'LAB' | 'REVIEW' | 'ASSESSMENT';
  questions: QuizQuestion[];
  totalPoints: number;
  startedAt: string;
}

interface QuestionResponse {
  questionId: string;
  studentAnswer: StudentAnswer;
  timeSpentSeconds: number;
  answeredAt: string;
  order: number;
}

interface GamificationData {
  xpAwarded: number;
  baseXp: number;
  firstAttemptBonus: number;
  streakMilestoneBonus: number;
  currentStreak: number;
  level: number;
  levelName: string;
  levelUp: boolean;
  totalXp: number;
  badgesUnlocked: string[];
  achievements: { badgeType: string; id: string; unlockedAt: string }[];
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
    studentAnswer: StudentAnswer;
    correctAnswer: StudentAnswer;
    isCorrect: boolean;
    points: number;
    timeSpentSeconds: number;
  }[];
  gamification?: GamificationData;
}

interface QuizPlayerProps {
  classId: string;
  lessonSlug: string;
  studentId?: string;
  onQuizCompleted?: (result: QuizResult) => void;
}

const AI_RECOMMENDATION_ENABLED = isAiRecommendationEnabled();

export function QuizPlayer({ classId, lessonSlug, studentId, onQuizCompleted }: QuizPlayerProps) {
  const router = useRouter();

  // Quiz state
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, StudentAnswer>>({});
  const [questionStartTimes, setQuestionStartTimes] = useState<Record<number, number>>({});
  const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({});

  // UI state
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  // Celebration state
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiIntensity, setConfettiIntensity] = useState<'low' | 'medium' | 'high'>('low');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ oldLevel: number; newLevel: number } | null>(null);
  const [currentBadge, setCurrentBadge] = useState<BadgeDefinition | null>(null);
  const [, setBadgeQueue] = useState<BadgeDefinition[]>([]);

  // Assessment-specific state
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [showGradingAnimation, setShowGradingAnimation] = useState(false);

  // Review-specific state
  const [correctCount, setCorrectCount] = useState(0);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);

  // Determine if this is an assessment or review
  const isAssessment = quizData?.lessonType === 'ASSESSMENT';
  const isReview = quizData?.lessonType === 'REVIEW';
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

  // Navigate to next question (or auto-advance in review mode)
  const handleNext = useCallback(() => {
    if (!quizData) return;

    // In review mode, check answer immediately before advancing
    if (isReview && lastAnswerCorrect === false) {
      return; // Don't advance if answer was wrong (they need to see feedback)
    }

    if (currentQuestionIndex >= quizData.questions.length - 1) return;

    recordQuestionTime(currentQuestionIndex);
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);
    setQuestionStartTimes(prev => ({
      ...prev,
      [nextIndex]: Date.now()
    }));
    setLastAnswerCorrect(null); // Reset feedback for new question
  }, [currentQuestionIndex, quizData, isReview, lastAnswerCorrect, recordQuestionTime]);

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
  const handleAnswerChange = useCallback((questionId: string, answer: StudentAnswer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));

    // Immediate feedback for review mode
    if (isReview && quizData) {
      const question = quizData.questions.find(q => q.id === questionId);
      if (question?.correctAnswer !== undefined) {
        const isCorrect = Array.isArray(answer)
          ? JSON.stringify(answer.sort()) === JSON.stringify([question.correctAnswer].flat().sort())
          : answer === question.correctAnswer;

        setLastAnswerCorrect(isCorrect);
        if (isCorrect) {
          setCorrectCount(prev => prev + 1);
          if (correctCount + 1 === quizData.questions.length) {
            // All questions answered correctly in review mode
          }
        }
      }
    }
  }, [isReview, quizData, correctCount]);

  // Toggle mark for review (assessment mode)
  const toggleMarkForReview = useCallback((questionIndex: number) => {
    setMarkedForReview(prev => {
      const next = new Set(prev);
      if (next.has(questionIndex)) {
        next.delete(questionIndex);
      } else {
        next.add(questionIndex);
      }
      return next;
    });
  }, []);

  // Check if all questions are answered
  const allQuestionsAnswered = useCallback(() => {
    if (!quizData) return false;
    return quizData.questions.every(q => {
      const answer = answers[q.id];
      if (answer === undefined || answer === null) return false;
      if (typeof answer === 'string') return answer !== '';
      if (Array.isArray(answer)) return answer.length > 0;
      if (typeof answer === 'object') return Object.keys(answer).length > 0;
      return true; // boolean or number
    });
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

      if (isAssessment) {
        setShowGradingAnimation(true);
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const delay = prefersReducedMotion ? 0 : 2500;
        await new Promise(resolve => setTimeout(resolve, delay));
        setShowGradingAnimation(false);
      }

      setResult(resultData);
      setShowSubmitDialog(false);
      onQuizCompleted?.(resultData);

      // Trigger celebration animations
      const gamification = resultData.gamification;
      if (gamification) {
        // Confetti based on score
        const intensity: 'low' | 'medium' | 'high' =
          resultData.percentage >= 90 ? 'high' :
          resultData.percentage >= 80 ? 'medium' : 'low';
        setConfettiIntensity(intensity);
        setShowConfetti(true);

        // Level up
        if (gamification.levelUp) {
          setLevelUpData({
            oldLevel: gamification.level - 1,
            newLevel: gamification.level,
          });
          setShowLevelUp(true);
        }

        // Badge unlocks
        if (gamification.badgesUnlocked.length > 0) {
          const badges = gamification.badgesUnlocked
            .map(type => BADGE_DEFINITIONS.find(b => b.id === type))
            .filter((b): b is BadgeDefinition => b !== undefined);
          setBadgeQueue(badges.slice(1));
          setCurrentBadge(badges[0] ?? null);
        }

        // Streak milestone toast
        if (gamification.streakMilestoneBonus > 0) {
          toast(`Streak milestone! +${gamification.streakMilestoneBonus} bonus XP`, {
            description: `You're on a ${gamification.currentStreak}-day streak!`,
            duration: 4000,
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setShowSubmitDialog(false);
    } finally {
      setSubmitting(false);
    }
  }, [quizData, answers, questionTimes, currentQuestionIndex, lessonSlug, allQuestionsAnswered, recordQuestionTime, onQuizCompleted, isAssessment]);

  const handleBadgeDismiss = useCallback(() => {
    setCurrentBadge(null);
    setBadgeQueue(prev => {
      const [next, ...rest] = prev;
      if (next) {
        // Small delay before showing next badge
        setTimeout(() => setCurrentBadge(next), 300);
      }
      return rest;
    });
  }, []);

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

  // Render grading animation
  if (showGradingAnimation) {
    return <GradingAnimation />;
  }

  // Render results screen
  if (result) {
    return (
      <div className="space-y-6">
        {/* Celebration Overlays */}
        <ConfettiCelebration
          trigger={showConfetti}
          intensity={confettiIntensity}
          onComplete={() => setShowConfetti(false)}
        />
        {showLevelUp && levelUpData && (
          <LevelUpAnimation
            oldLevel={levelUpData.oldLevel}
            newLevel={levelUpData.newLevel}
            onDismiss={() => {
              setShowLevelUp(false);
              setLevelUpData(null);
            }}
          />
        )}
        {currentBadge && (
          <BadgeUnlockAnimation badge={currentBadge} onDismiss={handleBadgeDismiss} />
        )}
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

            {/* AI Recommendation */}
            {AI_RECOMMENDATION_ENABLED ? (
              <AiRecommendationCard
                attemptId={result.attemptId}
                classId={classId}
                lessonSlug={lessonSlug}
                studentId={studentId}
              />
            ) : (
              <ContinueLearningCard classId={classId} lessonSlug={lessonSlug} />
            )}

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
  const currentAnswer = answers[currentQuestion.id];
  const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;

  const currentAnswerString = typeof currentAnswer === 'string' ? currentAnswer : undefined;
  const currentAnswerArray = Array.isArray(currentAnswer)
    ? currentAnswer.filter((item): item is string => typeof item === 'string')
    : [];
  const currentAnswerRecord =
    currentAnswer && typeof currentAnswer === 'object' && !Array.isArray(currentAnswer)
      ? (currentAnswer as Record<string, string>)
      : {};

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

      {/* Assessment-specific features */}
      {isAssessment && quizData.startedAt && (
        <AssessmentTimer
          durationMinutes={30}
          startTime={new Date(quizData.startedAt)}
          onTimeUp={handleSubmit}
        />
      )}

      {/* Question Navigator (Assessment mode) */}
      {isAssessment && (
        <QuestionNavigator
          totalQuestions={quizData.questions.length}
          answeredQuestions={new Set(
            quizData.questions
              .map((q, i) => (answers[q.id] !== undefined ? i : -1))
              .filter(i => i !== -1)
          )}
          markedForReview={markedForReview}
          currentIndex={currentQuestionIndex}
          onNavigate={(index) => {
            recordQuestionTime(currentQuestionIndex);
            setCurrentQuestionIndex(index);
            setQuestionStartTimes(prev => ({
              ...prev,
              [index]: Date.now()
            }));
          }}
        />
      )}

      {/* Review-specific features */}
      {isReview && (
        <>
          <ScoreTracker correctCount={correctCount} totalCount={quizData.questions.length} />
          {lastAnswerCorrect !== null && (
            <FeedbackMessage isCorrect={lastAnswerCorrect} />
          )}
        </>
      )}

      {/* Progress Indicator */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
        <span className="text-sm font-medium text-gray-700">
          Question {currentQuestionIndex + 1} of {quizData.questions.length}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            {quizData.totalPoints} points total
          </span>
          {isAssessment && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleMarkForReview(currentQuestionIndex)}
              className={markedForReview.has(currentQuestionIndex) ? 'text-amber-600' : ''}
            >
              <Bookmark className={`h-4 w-4 mr-1 ${markedForReview.has(currentQuestionIndex) ? 'fill-amber-500' : ''}`} />
              {markedForReview.has(currentQuestionIndex) ? 'Marked for Review' : 'Mark for Review'}
            </Button>
          )}
        </div>
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
            value={currentAnswerString}
            onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
          />
        )}
        {currentQuestion.type === 'MULTIPLE_SELECT' && (
          <MultipleSelectQuestion
              question={currentQuestion}
              value={currentAnswerArray}
              onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            />
          )}
        {currentQuestion.type === 'TRUE_FALSE' && (
          <TrueFalseQuestion
              question={currentQuestion}
              value={currentAnswerString}
              onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            />
          )}
        {currentQuestion.type === 'FILL_IN_BLANK' && (
          <FillInBlankQuestion
              question={currentQuestion}
              value={currentAnswerString ?? ''}
              onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            />
          )}
        {currentQuestion.type === 'VOCABULARY_MATCH' && (
          <VocabularyMatchQuestion
              question={currentQuestion}
              value={currentAnswerRecord}
              onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:relative md:bg-transparent md:border-0 md:p-0">
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={
              currentQuestionIndex === 0 ||
              (isAssessment && !markedForReview.has(currentQuestionIndex - 1))
            }
            className="gap-2 min-h-[44px] min-w-[44px] md:min-h-[40px]"
            aria-label="Previous question"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
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
              className="gap-2 min-h-[44px] min-w-[44px] md:min-h-[40px]"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Submit Quiz</span>
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="gap-2 min-h-[44px] min-w-[44px] md:min-h-[40px]"
              aria-label="Next question"
            >
              <span className="hidden sm:inline">Next</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              {isAssessment ? (
                <>You have answered </>
              ) : (
                <>Are you sure you want to submit your quiz? You have answered </>
              )}{Object.keys(answers).length} of {quizData.questions.length} questions.
              {isAssessment && Object.keys(answers).length < quizData.questions.length && (
                <> There are {quizData.questions.length - Object.keys(answers).length} unanswered questions.</>

              )}Once submitted, you cannot change your answers.
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
function formatAnswer(answer: StudentAnswer): string {
  if (Array.isArray(answer)) {
    return answer.join(', ');
  }

  if (typeof answer === 'object' && answer !== null) {
    return Object.entries(answer)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  }

  if (typeof answer === 'boolean') {
    return answer ? 'True' : 'False';
  }

  return answer === null || typeof answer === 'undefined' ? '' : String(answer);
}
