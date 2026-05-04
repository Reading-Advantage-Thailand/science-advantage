import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { StepModeProcedureBlock } from '../blocks/step-mode-procedure-block';

const mockProcedureBlock = {
  type: 'procedure' as const,
  id: 'procedure-1',
  steps: [
    {
      stepNumber: 1,
      instruction: 'Put on your safety goggles',
      instructionThai: 'สวมแว่นตานิรภัย',
    },
    {
      stepNumber: 2,
      instruction: 'Gather your materials',
      instructionThai: 'รวบรวมอุปกรณ์ของคุณ',
      subSteps: ['Beaker', 'Bunsen burner', 'Thermometer'],
    },
    {
      stepNumber: 3,
      instruction: 'Light the Bunsen burner',
      instructionThai: 'จุดเตาเบอร์นเซอร์',
    },
  ],
};

describe('StepModeProcedureBlock', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders with step counter', () => {
    render(<StepModeProcedureBlock block={mockProcedureBlock} />);
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
  });

  it('shows first step initially', () => {
    render(<StepModeProcedureBlock block={mockProcedureBlock} />);
    expect(screen.getByText('Put on your safety goggles')).toBeInTheDocument();
  });

  it('shows Thai instruction when showThai is true', () => {
    render(<StepModeProcedureBlock block={mockProcedureBlock} showThai />);
    expect(screen.getByText('สวมแว่นตานิรภัย')).toBeInTheDocument();
  });

  it('hides Thai instruction when showThai is false', () => {
    render(<StepModeProcedureBlock block={mockProcedureBlock} showThai={false} />);
    expect(screen.queryByText('สวมแว่นตานิรภัย')).not.toBeInTheDocument();
  });

  it('navigates to next step when Next is clicked', async () => {
    const user = userEvent.setup();
    render(<StepModeProcedureBlock block={mockProcedureBlock} />);

    await user.click(screen.getByText('Next'));

    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
    expect(screen.getByText('Gather your materials')).toBeInTheDocument();
  });

  it('navigates to previous step when Previous is clicked', async () => {
    const user = userEvent.setup();
    render(<StepModeProcedureBlock block={mockProcedureBlock} />);

    await user.click(screen.getByText('Next'));
    await user.click(screen.getByText('Next'));

    await user.click(screen.getByText('Previous'));

    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
  });

  it('disables Previous button on first step', () => {
    render(<StepModeProcedureBlock block={mockProcedureBlock} />);
    expect(screen.getByText('Previous').closest('button')).toBeDisabled();
  });

  it('disables Next button on last step', async () => {
    const user = userEvent.setup();
    render(<StepModeProcedureBlock block={mockProcedureBlock} />);

    await user.click(screen.getByText('Next'));
    await user.click(screen.getByText('Next'));

    expect(screen.getByText('Next').closest('button')).toBeDisabled();
  });

  it('shows substeps when present', async () => {
    const user = userEvent.setup();
    render(<StepModeProcedureBlock block={mockProcedureBlock} />);

    await user.click(screen.getByText('Next'));

    expect(screen.getByText('Beaker')).toBeInTheDocument();
    expect(screen.getByText('Bunsen burner')).toBeInTheDocument();
    expect(screen.getByText('Thermometer')).toBeInTheDocument();
  });

  it('shows completion progress', async () => {
    const user = userEvent.setup();
    render(<StepModeProcedureBlock block={mockProcedureBlock} />);

    expect(screen.getByText('0 of 3 completed')).toBeInTheDocument();
  });

  it('updates completion count when checkbox is toggled', async () => {
    const user = userEvent.setup();
    render(<StepModeProcedureBlock block={mockProcedureBlock} />);

    const checkbox = screen.getByLabelText(/Mark as complete/i);
    await user.click(checkbox);

    expect(screen.getByText('1 of 3 completed')).toBeInTheDocument();
  });

  it('renders with correct accessibility role', () => {
    render(<StepModeProcedureBlock block={mockProcedureBlock} />);
    expect(screen.getByRole('region', { name: /step-by-step procedure/i })).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <StepModeProcedureBlock block={mockProcedureBlock} className="my-custom-class" />
    );
    expect(container.firstChild).toHaveClass('my-custom-class');
  });
});