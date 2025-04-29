"use client";

import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "@workspace/ui/lib/utils";
import { useMediaQuery, UseMediaQueryOptions } from "../hooks/use-media-query";

function ScrollArea({
  verticalScrollBar = true,
  horizontalScrollBar = false,
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root> & {
  verticalScrollBar?: boolean;
  horizontalScrollBar?: boolean;
}) {
  return (
    <ScrollAreaPrimitive.Root className={cn("relative", className)} {...props}>
      <ScrollAreaPrimitive.Viewport className="size-full rounded-[inherit]">
        {children}
      </ScrollAreaPrimitive.Viewport>
      {verticalScrollBar && <ScrollBar forceMount orientation="vertical" />}
      {horizontalScrollBar && <ScrollBar forceMount orientation="horizontal" />}
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="bg-border relative flex-1 rounded-full"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

function ResponsiveScrollArea({
  breakpoint,
  mediaQueryOptions,
  children,
  fallbackProps,
  ...scrollAreaProps
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root> & {
  verticalScrollBar?: boolean;
  horizontalScrollBar?: boolean;
  breakpoint: string;
  mediaQueryOptions?: UseMediaQueryOptions;
  fallbackProps?: React.HTMLAttributes<HTMLDivElement>;
}) {
  const isBreakpointMatched = useMediaQuery(breakpoint, mediaQueryOptions);

  if (isBreakpointMatched) {
    return <ScrollArea {...scrollAreaProps}>{children}</ScrollArea>;
  }

  return <div {...fallbackProps}>{children}</div>;
}

export { ScrollArea, ScrollBar, ResponsiveScrollArea };
