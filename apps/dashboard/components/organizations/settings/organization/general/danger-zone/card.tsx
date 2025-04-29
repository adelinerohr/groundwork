"use client";

import * as React from "react";
import NiceModal from "@ebay/nice-modal-react";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardFooter } from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/utils";

import { Profile } from "~/types/account/profile";
import { DeleteOrganizationModal } from "./modal";

interface DeleteOrganizationCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  profile: Profile;
}

export function DeleteOrganizationCard({
  profile,
  className,
  ...other
}: DeleteOrganizationCardProps): React.JSX.Element {
  const handleShowDeleteOrganizationModal = (): void => {
    NiceModal.show(DeleteOrganizationModal);
  };
  return (
    <Card className={cn("border-destructive", className)} {...other}>
      <CardContent className="pt-6">
        <p className="text-sm font-normal text-muted-foreground">
          Deleting your organization is irreversible. All the data will be
          permanently removed from our servers.
        </p>
      </CardContent>
      <Separator />
      <CardFooter className="flex w-full justify-end pt-6">
        <Button
          type="button"
          variant="destructive"
          size="default"
          disabled={!profile.isOwner}
          onClick={handleShowDeleteOrganizationModal}
        >
          Delete organization
        </Button>
      </CardFooter>
    </Card>
  );
}
