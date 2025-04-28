"use client";

import * as React from "react";

import { Button, type ButtonProps } from "@workspace/ui/components/button";
import { toast } from "sonner";

import { signOut } from "~/actions/auth/sign-out";
import { routes } from "@workspace/routes";

export function SignOutButton(props: ButtonProps): React.JSX.Element {
  const handleSignOut = async (): Promise<void> => {
    const result = await signOut({ redirect: routes.dashboard.auth.SignIn });
    if (result?.serverError || result?.validationErrors) {
      toast.error("Couldn't sign out");
    }
  };
  return (
    <Button
      {...props}
      onClick={(e) => {
        props.onClick?.(e);
        handleSignOut();
      }}
    />
  );
}
