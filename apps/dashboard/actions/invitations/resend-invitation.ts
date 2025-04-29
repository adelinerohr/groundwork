"use server";

import { resendInvitationSchema } from "~/schemas/invitations/resend-invitation-schema";
import { authOrganizationActionClient } from "../safe-action";
import { revalidateTag } from "next/cache";
import { createClient } from "@workspace/database/server";
import { NotFoundError, PreConditionError } from "@workspace/common/errors";
import { InvitationStatus } from "@workspace/database/constants";
import { sendInvitationRequest } from "@workspace/auth/invitations";
import { Caching, OrganizationCacheKey } from "~/data/caching";

export const resendInvitation = authOrganizationActionClient
  .metadata({ actionName: "resendInvitation" })
  .schema(resendInvitationSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createClient();

    const { data: invitation } = await supabase
      .from("invitations")
      .select("status, email, token")
      .eq("organization_id", ctx.organization.id)
      .eq("id", parsedInput.id)
      .single();

    if (!invitation) throw new NotFoundError("Invitation not found");
    if (invitation.status === InvitationStatus.ACCEPTED) {
      throw new PreConditionError("Invitation already accepted");
    }
    if (invitation.status === InvitationStatus.REVOKED) {
      throw new PreConditionError("Invitation was revoked");
    }

    await sendInvitationRequest({
      email: invitation.email,
      organizationName: ctx.organization.name,
      invitedByEmail: ctx.session.user.email ?? "",
      invitedByName: ctx.session.user.name,
      token: invitation.token,
      invitationId: parsedInput.id,
      organizationId: ctx.organization.id,
    });

    revalidateTag(
      Caching.createOrganizationTag(
        OrganizationCacheKey.Invitations,
        ctx.organization.id
      )
    );
  });
