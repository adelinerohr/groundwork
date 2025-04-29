"use server";

import { deleteInvitationSchema } from "~/schemas/invitations/delete-invitation-schema";
import { authOrganizationActionClient } from "../safe-action";
import { revalidateTag } from "next/cache";
import { createClient } from "@workspace/database/server";
import { Caching, OrganizationCacheKey } from "~/data/caching";

export const deleteInvitation = authOrganizationActionClient
  .metadata({ actionName: "deleteInvitation" })
  .schema(deleteInvitationSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createClient();

    const { count } = await supabase
      .from("invitations")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", ctx.organization.id)
      .eq("id", parsedInput.id);

    if (!count || count < 1) throw new Error("Invitation not found");

    await supabase
      .from("invitations")
      .delete()
      .eq("id", parsedInput.id)
      .eq("organization_id", ctx.organization.id);

    revalidateTag(
      Caching.createOrganizationTag(
        OrganizationCacheKey.Invitations,
        ctx.organization.id
      )
    );
  });
