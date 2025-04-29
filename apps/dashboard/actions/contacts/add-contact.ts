"use server";

import { createClient } from "@workspace/database/server";
import { revalidateTag } from "next/cache";

import { authOrganizationActionClient } from "~/actions/safe-action";
import { Caching, OrganizationCacheKey } from "~/data/caching";
import { addContactSchema } from "~/schemas/contacts/add-contact-schema";

export const addContact = authOrganizationActionClient
  .metadata({ actionName: "addContact" })
  .schema(addContactSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createClient();

    await supabase.from("contacts").insert([
      {
        name: parsedInput.name,
        email: parsedInput.email,
        phone: parsedInput.phone,
        updated_at: new Date(),
        organization_id: ctx.organization.id,
        stage: parsedInput.stage,
      },
    ]);

    revalidateTag(
      Caching.createOrganizationTag(
        OrganizationCacheKey.Contacts,
        ctx.organization.id
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
