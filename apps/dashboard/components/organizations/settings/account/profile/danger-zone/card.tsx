"use client";

import * as React from "react";
import NiceModal from "@ebay/nice-modal-react";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardFooter } from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/utils";
import { DeleteAccountModal } from "~/components/common/modals/profile/delete-account-modal";

interface DeleteAccountCardProps extends React.HTMLAttributes<HTMLDivElement> {
  ownedOrganizations: { name: string; slug: string }[];
}

export function DeleteAccountCard({
  ownedOrganizations,
  className,
  ...props
}: DeleteAccountCardProps): React.JSX.Element {
  const handleShowDeleteAccountModal = (): void => {
    NiceModal.show(DeleteAccountModal, { ownedOrganizations });
  };

  return (
    <Card className={cn("border-destructive", className)} {...props}>
      <CardContent className="pt-6">
        <p className="text-sm font-normal text-muted-foreground">
          Deleting your account is irreversible. All your data will be
          permanently removed from our servers.
        </p>
      </CardContent>
      <Separator />
      <CardFooter className="flex w-full justify-end pt-6">
        <Button
          type="button"
          variant="destructive"
          size="default"
          onClick={handleShowDeleteAccountModal}
        >
          Delete account
        </Button>
      </CardFooter>
    </Card>
  );
}
