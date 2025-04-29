"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { replaceOrgSlug, routes } from "@workspace/routes";

import { authOrganizationActionClient } from "~/actions/safe-action";
import { Caching, UserCacheKey } from "~/data/caching";
import { updateOrganizationSlugSchema } from "~/schemas/organization/update-organization-slug-schema";
import { createClient } from "@workspace/database/server";

export const updateOrganizationSlug = authOrganizationActionClient
  .metadata({ actionName: "updateOrganizationSlug" })
  .schema(updateOrganizationSlugSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createClient();

    if (parsedInput.slug !== ctx.organization.slug) {
      await supabase
        .from("organizations")
        .update({ slug: parsedInput.slug })
        .eq("id", ctx.organization.id);

      for (const membership of ctx.organization.memberships) {
        revalidateTag(
          Caching.createUserTag(UserCacheKey.Organizations, membership.user_id)
        );
      }

      redirect(
        `${replaceOrgSlug(
          routes.dashboard.organizations.slug.settings.organization.General,
          parsedInput.slug
        )}?slugUpdated=true`
      );
    }
  });
