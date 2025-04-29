"use server";

import { createClient } from "@workspace/database/server";
import { authOrganizationActionClient } from "../safe-action";
import { revalidateTag } from "next/cache";
import { revokeInvitationSchema } from "~/schemas/invitations/revoke-invitation-schema";
import { InvitationStatus } from "@workspace/database/constants";
import { APP_NAME } from "@workspace/common/app";
import { Caching, OrganizationCacheKey } from "~/data/caching";
import { sendRevokedInvitationEmail } from "@workspace/email/send-revoked-invitation-email";

export const revokeInvitation = authOrganizationActionClient
  .metadata({ actionName: "revokeInvitation" })
  .schema(revokeInvitationSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createClient();

    const { data: invitation } = await supabase
      .from("invitations")
      .select("status, email")
      .eq("organization_id", ctx.organization.id)
      .eq("id", parsedInput.id)
      .single();

    if (!invitation) throw new Error("Invitation not found");

    await supabase
      .from("invitations")
      .update({ status: InvitationStatus.REVOKED })
      .eq("organization_id", ctx.organization.id)
      .eq("id", parsedInput.id)
      .eq("status", InvitationStatus.PENDING);

    if (invitation.status === InvitationStatus.PENDING) {
      try {
        await sendRevokedInvitationEmail({
          recipient: invitation.email,
          appName: APP_NAME,
          organizationName: ctx.organization.name,
        });
      } catch (e) {
        console.error(e);
      }
    }

    revalidateTag(
      Caching.createOrganizationTag(
        OrganizationCacheKey.Invitations,
        ctx.organization.id
      )
    );
  });
