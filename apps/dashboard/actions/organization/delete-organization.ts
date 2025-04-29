"use server";

import { revalidateTag } from "next/cache";

import { isOrganizationOwner } from "@workspace/auth/permissions";
import { ForbiddenError } from "@workspace/common/errors";

import { authOrganizationActionClient } from "~/actions/safe-action";
import { Caching, UserCacheKey } from "~/data/caching";
import { createClient } from "@workspace/database/server";

export const deleteOrganization = authOrganizationActionClient
  .metadata({ actionName: "deleteOrganization" })
  .action(async ({ ctx }) => {
    const supabase = await createClient();

    const currentUserIsOwner = await isOrganizationOwner(
      ctx.session.user.id,
      ctx.organization.id
    );
    if (!currentUserIsOwner) {
      throw new ForbiddenError("Only owners can delete an organization.");
    }

    await Promise.all([
      supabase
        .from("memberships")
        .delete()
        .eq("organization_id", ctx.organization.id),
      supabase.from("organizations").delete().eq("id", ctx.organization.id),
    ]);

    for (const membership of ctx.organization.memberships) {
      revalidateTag(
        Caching.createUserTag(UserCacheKey.Organizations, membership.user_id)
      );
      revalidateTag(
        Caching.createUserTag(UserCacheKey.Profile, membership.user_id)
      );
    }
  });
