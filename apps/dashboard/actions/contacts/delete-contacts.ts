"use server";

import { deleteContactsSchema } from "~/schemas/contacts/delete-contacts-schema";
import { authOrganizationActionClient } from "../safe-action";
import { createClient } from "@workspace/database/server";
import { revalidateTag } from "next/cache";
import { Caching, OrganizationCacheKey } from "~/data/caching";

export const deleteContacts = authOrganizationActionClient
  .metadata({ actionName: "deleteContacts" })
  .schema(deleteContactsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createClient();

    await supabase
      .from("contacts")
      .delete()
      .in("id", parsedInput.ids)
      .eq("organization_id", ctx.organization.id);

    revalidateTag(
      Caching.createOrganizationTag(
        OrganizationCacheKey.Contacts,
        ctx.organization.id
      )
    );

    for (const id of parsedInput.ids) {
      revalidateTag(
        Caching.createOrganizationTag(OrganizationCacheKey.Contact, id)
      );
    }

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
