import * as React from "react";
import { Metadata } from "next";
import { createTitle } from "~/lib/formatters";
import { getAuthContext } from "@workspace/auth/context";
import { redirect } from "next/navigation";
import { routes } from "@workspace/routes";

export const metadata: Metadata = {
  title: createTitle("Organizations"),
};

export default async function OrganizationsLayout(
  props: React.PropsWithChildren
) {
  const ctx = await getAuthContext();
  if (!ctx.session.user.completed_onboarding) {
    return redirect(routes.dashboard.onboarding.Index);
  }

  return <>{props.children}</>;
}
