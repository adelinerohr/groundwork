import "server-only";

import { unstable_cache as cache } from "next/cache";

import { getAuthOrganizationContext } from "@workspace/auth/context";
import { NotFoundError } from "@workspace/common/errors";

import {
  Caching,
  defaultRevalidateTimeInSeconds,
  OrganizationCacheKey,
} from "~/data/caching";
import { OrganizationDetails } from "~/types/organization/organization-details";
import { createClient } from "@workspace/database/server";

export async function getOrganizationDetails(): Promise<OrganizationDetails> {
  const ctx = await getAuthOrganizationContext();
  const supabase = await createClient();

  return cache(
    async () => {
      const { data: organization } = await supabase
        .from("organizations")
        .select("name, address, phone, email, website")
        .eq("id", ctx.organization.id)
        .single();

      if (!organization) {
        throw new NotFoundError("Organization not found");
      }

      const response: OrganizationDetails = {
        name: organization.name,
        address: organization.address ? organization.address : undefined,
        phone: organization.phone ? organization.phone : undefined,
        email: organization.email ? organization.email : undefined,
        website: organization.website ? organization.website : undefined,
      };

      return response;
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
