"use server";

import { revalidateTag } from "next/cache";
import { createAdminClient } from "@workspace/database/admin";

import { authActionClient } from "~/actions/safe-action";
import { Caching, OrganizationCacheKey } from "~/data/caching";

export const deleteAccount = authActionClient
  .metadata({ actionName: "deleteAccount" })
  .action(async ({ ctx }) => {
    const supabase = await createAdminClient();
    if (
      ctx.session.user.memberships.some((membership) => membership.is_owner)
    ) {
      throw new Error("Cannot delete account while owning an organization");
    }

    await Promise.all([
      supabase.from("invitations").delete().eq("email", ctx.session.user.email),
      supabase.from("memberships").delete().eq("id", ctx.session.user.id),
      supabase.from("users").delete().eq("id", ctx.session.user.id),
      supabase.auth.admin.deleteUser(ctx.session.user.id),
    ]);

    for (const membership of ctx.session.user.memberships) {
      revalidateTag(
        Caching.createOrganizationTag(
          OrganizationCacheKey.Members,
          membership.organization_id
        )
      );
    }
  });
