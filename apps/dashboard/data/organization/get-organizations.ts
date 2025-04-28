"use server";

import { Organization } from "~/types/organization/organization";
import { unstable_cache } from "next/cache";
import {
  Caching,
  defaultRevalidateTimeInSeconds,
  UserCacheKey,
} from "../caching";
import { getAuthContext } from "@workspace/auth/context";
import { createClient } from "@workspace/database/server";

export async function getOrganizations(): Promise<Organization[]> {
  const ctx = await getAuthContext();
  const supabase = await createClient();

  return unstable_cache(
    async () => {
      const { data: organizations, error } = await supabase
        .from("organizations")
        .select("id, logo, name, slug, memberships (created_at)");

      if (error) throw error;

      const response: Organization[] = organizations
        .sort(
          (a, b) =>
            a.memberships[0].created_at.getTime() -
            b.memberships[0].created_at.getTime()
        )
        .map((organization) => ({
          id: organization.id,
          logo: organization.logo ?? undefined,
          name: organization.name,
          slug: organization.slug,
          memberCount: organization.memberships.length,
        }));

      return response;
    },
    Caching.createUserKeyParts(UserCacheKey.Organizations, ctx.session.user.id),
    {
      revalidate: defaultRevalidateTimeInSeconds,
      tags: [
        Caching.createUserTag(UserCacheKey.Organizations, ctx.session.user.id),
      ],
    }
  )();
}
