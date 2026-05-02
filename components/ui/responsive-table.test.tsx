import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResponsiveTable } from '@/components/ui/responsive-table';

const TEST_DATA = [
  { id: '1', name: 'Alice', score: 95 },
  { id: '2', name: 'Bob', score: 87 },
  { id: '3', name: 'Charlie', score: 72 },
];

describe('ResponsiveTable', () => {
  beforeEach(() => {
    global.resizeTo = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders header and all rows in desktop view', () => {
    render(
      <ResponsiveTable
        data={TEST_DATA}
        renderHeader={() => (
          <thead>
            <tr>
              <th>Name</th>
              <th>Score</th>
            </tr>
          </thead>
        )}
        renderRow={(item) => (
          <tr key={item.id}>
            <td>{item.name}</td>
            <td>{item.score}</td>
          </tr>
        )}
      />
    );

    expect(screen.getByText('Alice')).toBeDefined();
    expect(screen.getByText('Bob')).toBeDefined();
    expect(screen.getByText('Charlie')).toBeDefined();
  });

  it('shows empty state when no data', () => {
    render(
      <ResponsiveTable
        data={[]}
        renderHeader={() => (
          <thead>
            <tr>
              <th>Name</th>
            </tr>
          </thead>
        )}
        renderRow={() => null}
        emptyMessage="No items found"
      />
    );

    expect(screen.getByText('No items found')).toBeDefined();
  });

  it('switches to card layout on mobile viewport', () => {
    global.innerWidth = 375;
    fireEvent(window, new Event('resize'));

    const { container } = render(
      <ResponsiveTable
        data={TEST_DATA}
        renderHeader={() => (
          <thead>
            <tr>
              <th>Name</th>
              <th>Score</th>
            </tr>
          </thead>
        )}
        renderRow={(item) => (
          <div key={item.id} className="card-item">
            {item.name}: {item.score}
          </div>
        )}
      />
    );

    const cards = container.querySelectorAll('.card-item');
    expect(cards.length).toBe(3);
  });
});