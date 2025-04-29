"use server";

import { createClient } from "@workspace/database/server";
import { authOrganizationActionClient } from "../safe-action";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { removeMemberSchema } from "~/schemas/members/remove-member-schema";
import { isOrganizationAdmin } from "@workspace/auth/permissions";
import { routes } from "@workspace/routes";
import { Caching, OrganizationCacheKey, UserCacheKey } from "~/data/caching";

export const removeMember = authOrganizationActionClient
  .metadata({ actionName: "removeMember" })
  .schema(removeMemberSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createClient();
    const isLeaving = ctx.session.user.id === parsedInput.id;

    if (!isLeaving) {
      const currentUserIsAdmin = await isOrganizationAdmin(
        ctx.session.user.id,
        ctx.organization.id
      );
      if (!currentUserIsAdmin) throw new Error("Insufficient permissions");
    }

    const { data: membership } = await supabase
      .from("memberships")
      .select(
        `
        id,
        role,
        is_owner,
        users ( email )
      `
      )
      .eq("organization_id", ctx.organization.id)
      .eq("user_id", parsedInput.id)
      .single();

    if (!membership) throw new Error("Membership not found");
    if (membership.is_owner) throw new Error("Owners cannot be removed");

    await Promise.all([
      supabase
        .from("verification_tokens")
        .delete()
        .eq("identifier", (membership.users as any).email!),
      supabase.from("memberships").delete().eq("id", membership.id),
    ]);

    revalidateTag(
      Caching.createOrganizationTag(
        OrganizationCacheKey.Members,
        ctx.organization.id
      )
    );

    revalidateTag(Caching.createUserTag(UserCacheKey.Profile, parsedInput.id));

    revalidateTag(
      Caching.createUserTag(UserCacheKey.Organizations, parsedInput.id)
    );

    if (isLeaving) redirect(routes.dashboard.organizations.Index);
  });
