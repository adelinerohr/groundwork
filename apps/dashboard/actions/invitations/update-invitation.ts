"use server";

import { updateInvitationSchema } from "~/schemas/invitations/update-invitation-schema";
import { authOrganizationActionClient } from "../safe-action";
import { revalidateTag } from "next/cache";
import { createClient } from "@workspace/database/server";
import { Role } from "@workspace/database/constants";
import { isOrganizationAdmin } from "@workspace/auth/permissions";
import { Caching, OrganizationCacheKey } from "~/data/caching";
import { ForbiddenError, NotFoundError } from "@workspace/common/errors";

export const updateInvitation = authOrganizationActionClient
  .metadata({ actionName: "updateInvitation" })
  .schema(updateInvitationSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createClient();

    const { data: invitation } = await supabase
      .from("invitations")
      .select("role, email")
      .eq("organization_id", ctx.organization.id)
      .eq("id", parsedInput.id)
      .single();

    if (!invitation) throw new NotFoundError("Invitation not found");

    if (invitation.role !== Role.ADMIN && parsedInput.role === Role.ADMIN) {
      const currentUserIsAdmin = await isOrganizationAdmin(
        ctx.session.user.id,
        ctx.organization.id
      );
      if (!currentUserIsAdmin)
        throw new ForbiddenError("Insufficient permissions");
    }

    await supabase
      .from("invitations")
      .update({ role: parsedInput.role })
      .eq("id", parsedInput.id);

    revalidateTag(
      Caching.createOrganizationTag(
        OrganizationCacheKey.Invitations,
        ctx.organization.id
      )
    );
  });
