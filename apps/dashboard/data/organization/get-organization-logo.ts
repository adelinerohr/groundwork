"use server";

import { unstable_cache as cache } from "next/cache";

import {
  Caching,
  defaultRevalidateTimeInSeconds,
  OrganizationCacheKey,
} from "../caching";
import { getAuthOrganizationContext } from "@workspace/auth/context";
import { createClient } from "@workspace/database/server";

export async function getOrganizationLogo(): Promise<string | undefined> {
  const ctx = await getAuthOrganizationContext();
  const supabase = await createClient();

  return cache(
    async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("logo")
        .eq("id", ctx.organization.id)
        .single();

      if (error) throw error;

      return data.logo ?? undefined;
    },
    Caching.createOrganizationKeyParts(
      OrganizationCacheKey.OrganizationDetails,
      ctx.organization.id
    ),
    {
      revalidate: defaultRevalidateTimeInSeconds,
      tags: [
        Caching.createOrganizationTag(
          OrganizationCacheKey.OrganizationDetails,
          ctx.organization.id
        ),
      ],
    }
  )();
}
