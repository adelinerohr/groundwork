"use server";

import { createClient } from "@workspace/database/server";
import { revalidateTag } from "next/cache";

import { authOrganizationActionClient } from "~/actions/safe-action";
import { Caching, OrganizationCacheKey } from "~/data/caching";
import { updateSocialMediaSchema } from "~/schemas/organization/update-social-media-schema";

export const updateSocialMedia = authOrganizationActionClient
  .metadata({ actionName: "updateSocialMedia" })
  .schema(updateSocialMediaSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createClient();

    await supabase
      .from("organizations")
      .update({
        linkedin_profile: parsedInput.linkedInProfile,
        instagram_profile: parsedInput.instagramProfile,
        youtube_channel: parsedInput.youTubeChannel,
        x_profile: parsedInput.xProfile,
        tiktok_profile: parsedInput.tikTokProfile,
        facebook_page: parsedInput.facebookPage,
      })
      .eq("id", ctx.organization.id);

    revalidateTag(
      Caching.createOrganizationTag(
        OrganizationCacheKey.SocialMedia,
        ctx.organization.id
      )
    );
  });
