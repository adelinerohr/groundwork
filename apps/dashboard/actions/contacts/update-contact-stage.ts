"use server";

import { updateContactStageSchema } from "~/schemas/contacts/update-contact-stage-schema";
import { authOrganizationActionClient } from "../safe-action";
import { revalidateTag } from "next/cache";
import { createClient } from "@workspace/database/server";
import { Caching, OrganizationCacheKey } from "~/data/caching";

export const updateContactStage = authOrganizationActionClient
  .metadata({ actionName: "updateContactStage" })
  .schema(updateContactStageSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createClient();

    const { count } = await supabase
      .from("contacts")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", ctx.organization.id)
      .eq("id", parsedInput.id);

    if (!count || count < 1) throw new Error("Contact not found");

    await supabase
      .from("contacts")
      .update({
        stage: parsedInput.stage,
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
  });
