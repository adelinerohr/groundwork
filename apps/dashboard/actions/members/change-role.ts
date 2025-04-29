"use server";

import { createClient } from "@workspace/database/server";
import { Caching, OrganizationCacheKey, UserCacheKey } from "~/data/caching";
import { changeRoleSchema } from "~/schemas/members/change-role-schema";
import { authOrganizationActionClient } from "../safe-action";
import { revalidateTag } from "next/cache";

export const changeRole = authOrganizationActionClient
  .metadata({ actionName: "changeRole " })
  .schema(changeRoleSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createClient();

    const { data: membership } = await supabase
      .from("memberships")
      .select("is_owner")
      .eq("user_id", parsedInput.id)
      .eq("organization_id", ctx.organization.id)
      .single();

    if (!membership) throw new Error("Membership not found.");
    if (membership.is_owner) throw new Error("Owners have to be admin.");

    await supabase
      .from("memberships")
      .update({
        role: parsedInput.role,
      })
      .eq("user_id", parsedInput.id);

    revalidateTag(
      Caching.createOrganizationTag(
        OrganizationCacheKey.Members,
        ctx.organization.id
      )
    );

    revalidateTag(
      Caching.createUserTag(UserCacheKey.PersonalDetails, parsedInput.id)
    );
  });
