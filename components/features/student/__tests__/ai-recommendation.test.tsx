/**
 * Tests for AI Recommendation Component
 * Run with: npm run test components/features/student/__tests__/ai-recommendation.test.tsx
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AiRecommendation } from '../ai-recommendation';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  track: vi.fn(),
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('AiRecommendation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('Loading State', () => {
    it('shows loading spinner initially', () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<AiRecommendation attemptId="attempt-1" classId="class-1" />);

      expect(screen.getByTestId('ai-recommendation-loading')).toBeInTheDocument();
      expect(screen.getByText(/Finding the best lesson/i)).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    it('displays recommendation on success', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          recommendation: {
            lessonId: 'g3-plants',
            lessonTitle: 'Plants and Animals',
            lessonSlug: 'g3-plants',
            focusStandards: ['Sc4.1', 'Sc4.2'],
            reasoning: 'This lesson addresses your weak areas in life science.',
            confidence: 'high',
          },
          fallbackUsed: false,
          traceId: 'trace-123',
          model: 'gpt-4o-mini',
          generatedAt: new Date().toISOString(),
        }),
      });

      render(<AiRecommendation attemptId="attempt-1" classId="class-1" />);

      await waitFor(() => {
        expect(screen.getByTestId('ai-recommendation-success')).toBeInTheDocument();
      });

      expect(screen.getByText('Plants and Animals')).toBeInTheDocument();
      expect(screen.getByText(/Sc4.1/)).toBeInTheDocument();
      expect(screen.getByText(/This lesson addresses/)).toBeInTheDocument();
    });

    it('shows fallback badge when fallback is used', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          recommendation: {
            lessonId: 'g3-plants',
            lessonTitle: 'Plants and Animals',
            lessonSlug: 'g3-plants',
            focusStandards: ['Sc4.1'],
            reasoning: 'Next lesson in sequence.',
            confidence: 'medium',
          },
          fallbackUsed: true,
          traceId: 'trace-123',
          model: 'rules-engine',
        }),
      });

      render(<AiRecommendation attemptId="attempt-1" classId="class-1" />);

      await waitFor(() => {
        expect(screen.getByText(/Based on curriculum rules/i)).toBeInTheDocument();
      });
    });

    it('allows expanding reasoning text', async () => {
      const user = userEvent.setup();
      const longReasoning = 'A'.repeat(150);

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          recommendation: {
            lessonId: 'g3-plants',
            lessonTitle: 'Plants',
            lessonSlug: 'g3-plants',
            focusStandards: ['Sc4.1'],
            reasoning: longReasoning,
            confidence: 'high',
          },
          fallbackUsed: false,
          traceId: 'trace-123',
          model: 'gpt-4o-mini',
        }),
      });

      render(<AiRecommendation attemptId="attempt-1" classId="class-1" />);

      await waitFor(() => {
        expect(screen.getByText('Plants')).toBeInTheDocument();
      });

      const showMoreButton = screen.getByText('Show more');
      await user.click(showMoreButton);

      expect(screen.getByText('Show less')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error message and retry button on failure', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Network error')
      );

      render(<AiRecommendation attemptId="attempt-1" classId="class-1" />);

      await waitFor(() => {
        expect(screen.getByTestId('ai-recommendation-error')).toBeInTheDocument();
      });

      expect(screen.getByText(/We couldn't generate/i)).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('allows retrying after error', async () => {
      const user = userEvent.setup();

      (global.fetch as ReturnType<typeof vi.fn>)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            recommendation: {
              lessonId: 'g3-plants',
              lessonTitle: 'Plants',
              lessonSlug: 'g3-plants',
              focusStandards: ['Sc4.1'],
              reasoning: 'Try this lesson.',
              confidence: 'high',
            },
            fallbackUsed: false,
            traceId: 'trace-456',
            model: 'gpt-4o-mini',
          }),
        });

      render(<AiRecommendation attemptId="attempt-1" classId="class-1" />);

      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });

      const retryButton = screen.getByText('Try Again');
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Plants')).toBeInTheDocument();
      });
    });

    it('handles 401 authentication error', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      render(<AiRecommendation attemptId="attempt-1" classId="class-1" />);

      await waitFor(() => {
        expect(screen.getByText(/Please sign in/i)).toBeInTheDocument();
      });
    });

    it('handles 429 rate limit error', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 429,
      });

      render(<AiRecommendation attemptId="attempt-1" classId="class-1" />);

      await waitFor(() => {
        expect(screen.getByText(/Too many requests/i)).toBeInTheDocument();
      });
    });
  });

  describe('Completion State', () => {
    it('shows completion message when no recommendations available', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          recommendation: null,
          fallbackUsed: true,
          traceId: 'trace-789',
          model: 'rules-engine',
        }),
      });

      render(<AiRecommendation attemptId="attempt-1" classId="class-1" />);

      await waitFor(() => {
        expect(screen.getByTestId('ai-recommendation-completion')).toBeInTheDocument();
      });

      expect(screen.getByText(/Congratulations/i)).toBeInTheDocument();
      expect(screen.getByText(/completed all available lessons/i)).toBeInTheDocument();
    });
  });

  describe('Feature Flag', () => {
    it('shows disabled message when feature is disabled', () => {
      process.env.NEXT_PUBLIC_FEATURE_AI_RECOMMENDATION = 'false';

      render(<AiRecommendation attemptId="attempt-1" classId="class-1" />);

      expect(screen.getByTestId('ai-recommendation-disabled')).toBeInTheDocument();
      expect(screen.getByText(/Keep exploring/i)).toBeInTheDocument();

      delete process.env.NEXT_PUBLIC_FEATURE_AI_RECOMMENDATION;
    });
  });
});
