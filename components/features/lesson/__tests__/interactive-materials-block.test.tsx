import { cleanup, render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { InteractiveMaterialsBlock } from '../blocks/interactive-materials-block';

const mockMaterialsBlock = {
  type: 'materials' as const,
  id: 'materials-1',
  items: [
    { item: 'Safety goggles', quantity: '1 pair', itemThai: 'แว่นตานิรภัย' },
    { item: 'Beaker', quantity: '2', itemThai: 'บีกเกอร์' },
    { item: 'Bunsen burner', itemThai: 'เตาเบอร์นเซอร์' },
    { item: 'Thermometer', quantity: '1', itemThai: 'เทอร์โมมิเตอร์' },
  ],
};

describe('InteractiveMaterialsBlock', () => {
  beforeEach(() => {
    localStorage.clear();
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
    localStorage.clear();
  });

  it('renders materials list', () => {
    render(<InteractiveMaterialsBlock block={mockMaterialsBlock} />);
    expect(screen.getByText('Safety goggles')).toBeInTheDocument();
    expect(screen.getByText('Beaker')).toBeInTheDocument();
  });

  it('shows initial gathering progress', () => {
    render(<InteractiveMaterialsBlock block={mockMaterialsBlock} />);
    expect(screen.getByText('0 of 4 gathered')).toBeInTheDocument();
  });

  it('updates progress when item is checked', async () => {
    const user = userEvent.setup();
    render(<InteractiveMaterialsBlock block={mockMaterialsBlock} />);

    await user.click(screen.getByLabelText(/Mark Safety goggles as gathered/i));

    expect(screen.getByText('1 of 4 gathered')).toBeInTheDocument();
  });

  it('persists checked state to localStorage', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<InteractiveMaterialsBlock block={mockMaterialsBlock} />);

    await user.click(screen.getByLabelText(/Mark Beaker as gathered/i));

    expect(localStorage.getItem('materials-checklist-materials-1')).toContain('Beaker');

    unmount();

    const { container } = render(<InteractiveMaterialsBlock block={mockMaterialsBlock} />);
    expect(screen.getByText('1 of 4 gathered')).toBeInTheDocument();
  });

  it('shows all materials gathered message', async () => {
    const user = userEvent.setup();
    render(<InteractiveMaterialsBlock block={mockMaterialsBlock} />);

    for (const item of mockMaterialsBlock.items) {
      await user.click(screen.getByLabelText(new RegExp(`Mark ${item.item} as gathered`, 'i')));
    }

    expect(screen.getByText('All materials gathered! Ready to begin.')).toBeInTheDocument();
  });

  it('shows Thai items when showThai is true', () => {
    render(<InteractiveMaterialsBlock block={mockMaterialsBlock} showThai />);
    expect(screen.getByText('แว่นตานิรภัย')).toBeInTheDocument();
  });

  it('hides Thai items when showThai is false', () => {
    render(<InteractiveMaterialsBlock block={mockMaterialsBlock} showThai={false} />);
    expect(screen.queryByText('แว่นตานิรภัย')).not.toBeInTheDocument();
  });

  it('applies strikethrough to checked items', async () => {
    const user = userEvent.setup();
    render(<InteractiveMaterialsBlock block={mockMaterialsBlock} />);

    await user.click(screen.getByLabelText(/Mark Thermometer as gathered/i));

    const thermometerLabel = screen.getByText('Thermometer').closest('label');
    expect(thermometerLabel).toHaveClass('line-through');
  });

  it('renders correct accessibility role', () => {
    render(<InteractiveMaterialsBlock block={mockMaterialsBlock} />);
    expect(screen.getByRole('region', { name: /materials checklist/i })).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <InteractiveMaterialsBlock block={mockMaterialsBlock} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('displays quantity labels', () => {
    render(<InteractiveMaterialsBlock block={mockMaterialsBlock} />);
    expect(screen.getByText('1 pair')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});