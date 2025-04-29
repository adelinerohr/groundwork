"use server";

import { NotFoundError } from "@workspace/common/errors";
import { authOrganizationActionClient } from "../safe-action";
import { createClient } from "@workspace/database/server";
import { revalidateTag } from "next/cache";
import { Caching, OrganizationCacheKey } from "~/data/caching";
import { deleteContactSchema } from "~/schemas/contacts/delete-contact-schema";

export const deleteContact = authOrganizationActionClient
  .metadata({ actionName: "deleteContact" })
  .schema(deleteContactSchema)
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
      .delete()
      .eq("id", parsedInput.id)
      .eq("organization_id", ctx.organization.id);

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
