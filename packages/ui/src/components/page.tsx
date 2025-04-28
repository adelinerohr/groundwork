import * as React from "react";

import { cn } from "../lib/utils";
import { ScrollArea } from "./scroll-area";
import { Separator } from "./separator";
import { SidebarTrigger } from "./sidebar";

function Page({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex h-full flex-col", className)} {...props}>
      {children}
    </div>
  );
}

function PageHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("sticky top-0 z-20 bg-background", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function PagePrimaryBar({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative flex h-14 flex-row items-center gap-1 border-b px-4 sm:px-6",
        className
      )}
      {...props}
    >
      <SidebarTrigger />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="flex w-full flex-row items-center justify-between">
        {children}
      </div>
    </div>
  );
}

function PageTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <h1 className={cn("text-sm font-semibold", className)} {...props}>
      {children}
    </h1>
  );
}

function PageActions({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      {children}
    </div>
  );
}

function PageSecondaryBar({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative flex h-12 items-center justify-between gap-2 border-b px-4 sm:px-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function PageBody({
  className,
  children,
  disableScroll,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  disableScroll?: boolean;
}) {
  if (disableScroll) {
    return (
      <div className={cn("flex h-full flex-col", className)} {...props}>
        {children}
      </div>
    );
  }

  return (
    <div className={cn("grow overflow-hidden", className)} {...props}>
      <ScrollArea className="h-full">{children}</ScrollArea>
    </div>
  );
}

export {
  Page,
  PageActions,
  PageBody,
  PageHeader,
  PagePrimaryBar,
  PageSecondaryBar,
  PageTitle,
};
