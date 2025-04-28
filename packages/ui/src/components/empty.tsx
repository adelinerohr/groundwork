import * as React from "react";

import { cn } from "../lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};
function EmptyState({
  title,
  description,
  icon,
  children,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      role="region"
      aria-label={title}
      className={cn(
        "flex h-full flex-col items-center justify-center gap-6 rounded-lg border px-8 py-12 sm:px-10 md:px-12",
        className
      )}
      {...props}
    >
      {icon}
      <div className="mx-auto flex max-w-sm flex-col gap-2 text-balance text-center">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

function EmptyText({
  className,
  children,
  ...other
}: React.HtmlHTMLAttributes<HTMLParagraphElement>): React.JSX.Element {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...other}>
      {children}
    </p>
  );
}

export { EmptyState, EmptyText };
