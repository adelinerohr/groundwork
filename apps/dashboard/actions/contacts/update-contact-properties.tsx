"use server";

import { revalidateTag } from "next/cache";

import { NotFoundError } from "@workspace/common/errors";

import { authOrganizationActionClient } from "~/actions/safe-action";
import { Caching, OrganizationCacheKey } from "~/data/caching";
import { updateContactPropertiesSchema } from "~/schemas/contacts/update-contact-properties-schema";
import { createClient } from "@workspace/database/server";

export const updateContactProperties = authOrganizationActionClient
  .metadata({ actionName: "updateContactProperties" })
  .schema(updateContactPropertiesSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createClient();

    const { count } = await supabase
      .from("contacts")
      .select("id", { count: "exact", head: true })
      .eq("id", parsedInput.id)
      .eq("organization_id", ctx.organization.id);

    if (!count || count < 1) {
      throw new NotFoundError("Contact not found");
    }

    await supabase
      .from("contacts")
      .update({
        name: parsedInput.name,
        email: parsedInput.email,
        phone: parsedInput.phone,
        address: parsedInput.address,
        updated_at: new Date(),
      })
      .eq("id", parsedInput.id);

    revalidateTag(
      Caching.createOrganizationTag(
        OrganizationCacheKey.Contacts,
        ctx.organization.id
      )
    );
    revalidateTag(
      Caching.createOrganizationTag(
        OrganizationCacheKey.Contact,
        ctx.organization.id,
        parsedInput.id
      )
    );

    for (const membership of ctx.organization.memberships) {
      revalidateTag(
        Caching.createOrganizationTag(
          OrganizationCacheKey.Favorites,
          ctx.organization.id,
          membership.user_id
        )
      );
    }
  });
