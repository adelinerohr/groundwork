"use server";

import {
  CompleteOnboardingSchema,
  completeOnboardingSchema,
  OnboardingStep,
} from "~/schemas/onboarding/complete-onboarding-schema";
import { authActionClient } from "../safe-action";
import { v4 } from "uuid";
import { SupabaseClient } from "@workspace/database/constants";
import { InvitationStatus, Role } from "~/lib/constants";
import {
  checkIfCanInvite,
  createInvitation,
  sendInvitationRequest,
} from "@workspace/auth/invitations";
import { revalidateTag } from "next/cache";
import { Caching, OrganizationCacheKey, UserCacheKey } from "~/data/caching";
import { replaceOrgSlug, routes } from "@workspace/routes";
import { createClient } from "@workspace/database/server";

export const completeOnboarding = authActionClient
  .metadata({ actionName: "completeOnboarding" })
  .schema(completeOnboardingSchema)
  .action(async ({ parsedInput, ctx }) => {
    const organizationId = v4();
    const userId = ctx.session.user.id;
    const userEmail = ctx.session.user.email!.toLowerCase();
    const supabase = await createClient();

    // Handle Profile Step
    console.log("Completing profile step...");
    if (parsedInput.activeSteps.includes(OnboardingStep.Profile)) {
      await handleProfileStep(parsedInput.profileStep, userId, supabase);
    }

    // Handle Organization Step
    console.log("Completing organization step...");
    if (parsedInput.activeSteps.includes(OnboardingStep.Organization)) {
      await handleOrganizationStep(
        parsedInput.organizationStep,
        userId,
        organizationId,
        supabase
      );
    }

    // Handle pending invitations step
    console.log("Completing invitations step...");
    if (parsedInput.activeSteps.includes(OnboardingStep.PendingInvitations)) {
      await handlePendingInvitationsStep(
        parsedInput.pendingInvitationsStep,
        userId,
        userEmail,
        supabase
      );
    }

    revalidateTag(Caching.createUserTag(UserCacheKey.PersonalDetails, userId));
    revalidateTag(Caching.createUserTag(UserCacheKey.Preferences, userId));
    revalidateTag(Caching.createUserTag(UserCacheKey.Organizations, userId));

    if (
      parsedInput.activeSteps.includes(OnboardingStep.Organization) &&
      parsedInput.organizationStep
    ) {
      // Handle Invite Team Step
      console.log("Completing invite team step...");
      if (parsedInput.activeSteps.includes(OnboardingStep.InviteTeam)) {
        await handleInviteTeamStep(
          parsedInput.inviteTeamStep,
          organizationId,
          parsedInput.organizationStep.name,
          ctx.session.user.name,
          ctx.session.user.email!
        );
      }
    }

    const { data: memberships, error: membershipsError } = await supabase
      .from("memberships")
      .select("organizations (id, slug)")
      .eq("user_id", ctx.session.user.id);

    if (membershipsError) throw membershipsError;

    for (const membership of memberships) {
      revalidateTag(
        Caching.createOrganizationTag(
          OrganizationCacheKey.Members,
          membership.organizations[0].id
        )
      );

      revalidateTag(
        Caching.createOrganizationTag(
          OrganizationCacheKey.Invitations,
          membership.organizations[0].id
        )
      );
    }

    let redirect: string = routes.dashboard.organizations.Index;

    // Newly created organization
    if (
      parsedInput.activeSteps.includes(OnboardingStep.Organization) &&
      parsedInput.organizationStep?.slug
    ) {
      redirect = replaceOrgSlug(
        routes.dashboard.organizations.slug.Home,
        parsedInput.organizationStep.slug
      );
    }
    // Has only one organization
    else if (memberships.length === 1) {
      redirect = replaceOrgSlug(
        routes.dashboard.organizations.slug.Home,
        memberships[0].organizations[0].slug
      );
    }

    console.log();
    return { redirect };
  });

async function handleProfileStep(
  step: CompleteOnboardingSchema["profileStep"],
  userId: string,
  supabase: SupabaseClient
) {
  if (!step) return;

  const { error } = await supabase
    .from("users")
    .update({
      image: step.image,
      name: step.name,
      phone: step.name,
      completed_onboarding: true,
    })
    .eq("id", userId);

  if (error) throw error;
}

async function handleOrganizationStep(
  step: CompleteOnboardingSchema["organizationStep"],
  userId: string,
  organizationId: string,
  supabase: SupabaseClient
) {
  if (!step) return;

  console.log("Adding organization...");
  const { error: organizationError } = await supabase
    .from("organizations")
    .insert([
      {
        id: organizationId,
        name: step.name,
        slug: step.slug,
      },
    ]);

  if (organizationError) throw organizationError;

  console.log("Adding membership...");
  const { error: membershipError } = await supabase.from("memberships").insert([
    {
      user_id: userId,
      organization_id: organizationId,
      role: Role.ADMIN,
      is_owner: true,
    },
  ]);

  if (membershipError) throw membershipError;
}

async function handleInviteTeamStep(
  step: CompleteOnboardingSchema["inviteTeamStep"],
  organizationId: string,
  organizationName: string,
  userName: string,
  userEmail: string
): Promise<void> {
  if (!step || !step.invitations) return;

  for (const invitation of step.invitations) {
    if (!invitation.email) continue;

    const canInvite = await checkIfCanInvite(invitation.email, organizationId);
    if (!canInvite) continue;

    try {
      const newInvitation = await createInvitation(
        invitation.email,
        invitation.role,
        organizationId
      );
      await sendInvitationRequest({
        email: newInvitation.email,
        organizationName: organizationName,
        invitedByEmail: userEmail,
        invitedByName: userName,
        token: newInvitation.token,
        invitationId: newInvitation.id,
        organizationId: organizationId,
      });
    } catch (e) {
      console.error(e);
    }
  }
}

async function handlePendingInvitationsStep(
  step: CompleteOnboardingSchema["pendingInvitationsStep"],
  userId: string,
  userEmail: string,
  supabase: SupabaseClient
): Promise<void> {
  if (!step || !step.invitationIds) return;

  for (const invitationId of step.invitationIds) {
    const { data: pendingInvitation } = await supabase
      .from("invitations")
      .select("organization_id, role")
      .eq("id", invitationId)
      .eq("email", userEmail)
      .eq("status", InvitationStatus.PENDING)
      .single();

    if (!pendingInvitation) continue;

    const { error: membershipError } = await supabase
      .from("memberships")
      .insert([
        {
          user_id: userId,
          organization_id: pendingInvitation.organization_id,
          role: pendingInvitation.role,
        },
      ]);

    if (membershipError) throw membershipError;

    const { error: acceptedError } = await supabase
      .from("invitations")
      .update({ status: InvitationStatus.ACCEPTED })
      .eq("id", invitationId);

    if (acceptedError) throw acceptedError;
  }
}
