"use server";

import { createClient } from "@workspace/database/server";
import { authOrganizationActionClient } from "../safe-action";
import { revalidateTag } from "next/cache";
import { transferOwnershipSchema } from "~/schemas/members/transfer-ownership-schema";
import {
  isOrganizationOwner,
  isOrganizationAdmin,
} from "@workspace/auth/permissions";
import { Caching, UserCacheKey, OrganizationCacheKey } from "~/data/caching";

export const transferOwnership = authOrganizationActionClient
  .metadata({ actionName: "transferOwnership" })
  .schema(transferOwnershipSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createClient();
    if (ctx.session.user.id === parsedInput.targetId) {
      throw new Error("You can't transfer ownership to yourself.");
    }

    const currentUserIsOwner = await isOrganizationOwner(
      ctx.session.user.id,
      ctx.organization.id
    );

    if (!currentUserIsOwner)
      throw new Error("Only owners can transfer ownerships.");

    const targetUserIsAdmin = await isOrganizationAdmin(
      parsedInput.targetId,
      ctx.organization.id
    );

    if (!targetUserIsAdmin) throw new Error("Only admins can become owners.");

    await Promise.all([
      supabase
        .from("memberships")
        .update({ is_owner: false })
        .eq("user_id", ctx.session.user.id)
        .eq("organization_id", ctx.organization.id),
      supabase
        .from("memberships")
        .update({ is_owner: true })
        .eq("user_id", parsedInput.targetId)
        .eq("organization_id", ctx.organization.id),
    ]);

    revalidateTag(
      Caching.createUserTag(UserCacheKey.Profile, ctx.session.user.id)
    );
    revalidateTag(
      Caching.createUserTag(UserCacheKey.Profile, parsedInput.targetId)
    );
    revalidateTag(
      Caching.createUserTag(UserCacheKey.Organizations, ctx.session.user.id)
    );
    revalidateTag(
      Caching.createUserTag(UserCacheKey.Organizations, parsedInput.targetId)
    );
    revalidateTag(
      Caching.createOrganizationTag(
        OrganizationCacheKey.Members,
        ctx.organization.id
      )
    );
    revalidateTag(
      Caching.createUserTag(UserCacheKey.PersonalDetails, parsedInput.targetId)
    );
  });
