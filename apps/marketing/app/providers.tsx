"use client";

import * as React from 'react';

import { ThemeProvider } from '@workspace/ui/hooks/use-theme';
import { TooltipProvider } from '@workspace/ui/components/tooltip';

export function Providers({
  children
}: React.PropsWithChildren) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme='system'
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>{children}</TooltipProvider>
    </ThemeProvider>
  )
}