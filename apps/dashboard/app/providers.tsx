"use client";

import * as React from "react";
import NiceModal from "@ebay/nice-modal-react";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { MonitoringProvider } from "@workspace/monitoring/hooks/use-monitoring";
import { TooltipProvider } from "@workspace/ui/components/tooltip";

export function Providers({
  children,
}: React.PropsWithChildren): React.JSX.Element {
  return (
    <MonitoringProvider>
      <NuqsAdapter>
        <TooltipProvider>
          <NiceModal.Provider>{children}</NiceModal.Provider>
        </TooltipProvider>
      </NuqsAdapter>
    </MonitoringProvider>
  );
}
