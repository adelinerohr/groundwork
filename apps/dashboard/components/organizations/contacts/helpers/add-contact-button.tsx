"use client";

import * as React from "react";
import NiceModal from "@ebay/nice-modal-react";

import { Button } from "@workspace/ui/components/button";
import { AddContactModal } from "./add-contact-modal";

export function AddContactButton(): React.JSX.Element {
  const handleShowAddContactModal = (): void => {
    NiceModal.show(AddContactModal);
  };
  return (
    <Button
      type="button"
      variant="default"
      size="default"
      className="whitespace-nowrap"
      onClick={handleShowAddContactModal}
    >
      Add contact
    </Button>
  );
}
