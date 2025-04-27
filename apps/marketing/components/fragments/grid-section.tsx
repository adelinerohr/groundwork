import * as React from 'react';

import { cn } from '@workspace/ui/lib/utils';

interface GridSectionProps extends React.HtmlHTMLAttributes<HTMLDivElement> {
  hideVerticalGridLines?: boolean;
  hideBottomGridLine?: boolean;
  containerProps?: React.HtmlHTMLAttributes<HTMLDivElement>;
}

export function GridSection({
  children,
  hideVerticalGridLines,
  hideBottomGridLine,
  containerProps: { className = '', ...containerProps } = {},
  ...props
}: GridSectionProps) {
  return (
    <section {...props}>
      <div
        className={cn('px-2 sm:container', className)}
        {...containerProps}
      >
        <div className="relative grid">
          {!hideVerticalGridLines && (
            <>
              <div className="absolute inset-y-0 block w-px bg-border" />
              <div className="absolute inset-y-0 right-0 w-px bg-border" />
            </>
          )}
          {children}
        </div>
      </div>
      {!hideBottomGridLine && <div className="h-px w-full bg-border" />}
    </section>
  );
}
