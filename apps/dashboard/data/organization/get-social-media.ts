import "server-only";

import { unstable_cache as cache } from "next/cache";

import { getAuthOrganizationContext } from "@workspace/auth/context";
import { NotFoundError } from "@workspace/common/errors";

import {
  Caching,
  defaultRevalidateTimeInSeconds,
  OrganizationCacheKey,
} from "~/data/caching";
import { SocialMedia } from "~/types/organization/social-media";
import { createClient } from "@workspace/database/server";

export async function getSocialMedia(): Promise<SocialMedia> {
  const ctx = await getAuthOrganizationContext();
  const supabase = await createClient();

  return cache(
    async () => {
      const { data: organization } = await supabase
        .from("organizations")
        .select(
          `
          linkedin_profile,
          youtube_channel,
          instagram_profile,
          x_profile,
          tiktok_profile,
          facebook_page  
        `
        )
        .eq("id", ctx.organization.id)
        .single();

      if (!organization) {
        throw new NotFoundError("Organization not found");
      }

      const response: SocialMedia = {
        linkedInProfile: organization.linkedin_profile ?? undefined,
        instagramProfile: organization.instagram_profile ?? undefined,
        youTubeChannel: organization.youtube_channel ?? undefined,
        xProfile: organization.x_profile ?? undefined,
        tikTokProfile: organization.tiktok_profile ?? undefined,
        facebookPage: organization.facebook_page ?? undefined,
      };

      return response;
    },
    Caching.createOrganizationKeyParts(
      OrganizationCacheKey.SocialMedia,
      ctx.organization.id
    ),
    {
      revalidate: defaultRevalidateTimeInSeconds,
      tags: [
        Caching.createOrganizationTag(
          OrganizationCacheKey.SocialMedia,
          ctx.organization.id
        ),
      ],
    }
  )();
}
