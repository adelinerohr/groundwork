import * as React from "react";

import { Card, CardContent } from "@workspace/ui/components/card";
import { EmptyText } from "@workspace/ui/components/empty";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { cn } from "@workspace/ui/lib/utils";

import { Invoice } from "~/types/billing/invoice";
import { InvoiceList } from "./list";

export type InvoicesCardProps = React.HTMLAttributes<HTMLDivElement> & {
  invoices: Invoice[];
};

export function InvoicesCard({
  invoices,
  className,
  ...other
}: InvoicesCardProps): React.JSX.Element {
  return (
    <Card className={cn("flex h-full flex-col", className)} {...other}>
      <CardContent className="max-h-72 flex-1 overflow-hidden p-0">
        {invoices.length > 0 ? (
          <ScrollArea className="h-full">
            <InvoiceList invoices={invoices} />
          </ScrollArea>
        ) : (
          <EmptyText className="p-6">No invoices received yet.</EmptyText>
        )}
      </CardContent>
    </Card>
  );
}
