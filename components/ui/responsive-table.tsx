'use client';

import * as React from 'react';

interface ResponsiveTableProps<T extends { id: string }> {
  data: T[];
  renderHeader: () => React.ReactNode;
  renderRow: (item: T, index: number) => React.ReactNode;
  keyExtractor?: (item: T) => string;
  emptyMessage?: string;
  className?: string;
}

export function ResponsiveTable<T extends { id: string }>({
  data,
  renderHeader,
  renderRow,
  keyExtractor = (item) => item.id,
  emptyMessage = 'No data available.',
  className = '',
}: ResponsiveTableProps<T>) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-600">
        {emptyMessage}
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className={`space-y-4 ${className}`}>
        {data.map((item, index) => (
          <div
            key={keyExtractor(item)}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
          >
            {renderRow(item, index)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">{renderHeader()}</table>
    </div>
  );
}