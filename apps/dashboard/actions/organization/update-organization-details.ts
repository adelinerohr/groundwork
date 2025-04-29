"use server";

import { createClient } from "@workspace/database/server";
import { revalidateTag } from "next/cache";

import { authOrganizationActionClient } from "~/actions/safe-action";
import { Caching, OrganizationCacheKey, UserCacheKey } from "~/data/caching";
import { updateOrganizationDetailsSchema } from "~/schemas/organization/update-organization-details-schema";

export const updateOrganizationDetails = authOrganizationActionClient
  .metadata({ actionName: "updateOrganizationDetails" })
  .schema(updateOrganizationDetailsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createClient();

    await supabase
      .from("organizations")
      .update({
        name: parsedInput.name,
        address: parsedInput.address,
        phone: parsedInput.phone,
        email: parsedInput.email,
        website: parsedInput.website,
      })
      .eq("id", ctx.organization.id);

    for (const membership of ctx.organization.memberships) {
      revalidateTag(
        Caching.createUserTag(UserCacheKey.Organizations, membership.user_id)
      );
    }

    revalidateTag(
      Caching.createOrganizationTag(
        OrganizationCacheKey.OrganizationDetails,
        ctx.organization.id
      )
    );
  });
