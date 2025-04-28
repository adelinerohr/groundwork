import * as React from "react";
import { type Metadata } from "next";

import { redirect } from "next/navigation";
import { ChevronLeftIcon } from "lucide-react";
import { OnboardingStep } from "~/schemas/onboarding/complete-onboarding-schema";
import { createTitle } from "~/lib/formatters";
import { getAuthContext } from "@workspace/auth/context";
import { routes } from "@workspace/routes";
import { SignOutButton } from "~/components/onboarding/helpers/sign-out-button";
import { Logo } from "@workspace/ui/components/logo";
import { OnboardingWizard } from "~/components/onboarding/wizard/onboarding-wizard";

export const metadata: Metadata = {
  title: createTitle("Onboarding"),
};

export default async function OnboardingPage() {
  const ctx = await getAuthContext();

  if (ctx.session.user.completed_onboarding) {
    return redirect(routes.dashboard.organizations.Index);
  }

  return (
    <div className="relative min-h-screen bg-background">
      <div className="absolute inset-x-0 top-0 mx-auto flex min-w-80 items-center justify-center p-4">
        <Logo />
      </div>
      <SignOutButton variant={"link"} className="absolute left-4 top-4">
        <ChevronLeftIcon className="mr-2 size-4 shrink-0" />
        Sign out
      </SignOutButton>
      <OnboardingWizard
        activeSteps={[
          OnboardingStep.Profile,
          OnboardingStep.Organization,
          OnboardingStep.InviteTeam,
        ]}
        metadata={{ user: ctx.session.user }}
      />
    </div>
  );
}
