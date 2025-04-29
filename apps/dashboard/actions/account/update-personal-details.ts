"use server";

import { revalidateTag } from "next/cache";
import { authActionClient } from "../safe-action";
import { updatePersonalDetailsSchema } from "~/schemas/account/update-personal-details-schema";
import { Maybe } from "@workspace/common/maybe";
import { createClient } from "@workspace/database/server";
import { Caching, UserCacheKey, OrganizationCacheKey } from "~/data/caching";

export const updatePersonalDetails = authActionClient
  .metadata({ actionName: "updatePersonalDetails" })
  .schema(updatePersonalDetailsSchema)
  .action(async ({ parsedInput, ctx }) => {
    let imageUrl: Maybe<string> = undefined;
    const supabase = await createClient();

    const { error } = await supabase
      .from("users")
      .update({
        avatar_url: imageUrl,
        name: parsedInput.name,
        phone: parsedInput.phone,
      })
      .eq("id", ctx.session.user.id);

    if (error) throw error;

    revalidateTag(
      Caching.createUserTag(UserCacheKey.PersonalDetails, ctx.session.user.id)
    );

    for (const membership of ctx.session.user.memberships) {
      revalidateTag(
        Caching.createOrganizationTag(
          OrganizationCacheKey.Members,
          membership.organization_id
        )
      );
    }
  });
