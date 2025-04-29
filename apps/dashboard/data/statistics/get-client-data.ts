"use server";

import { getAuthOrganizationContext } from "@workspace/auth/context";
import { NotFoundError, ValidationError } from "@workspace/common/errors";
import { createClient } from "@workspace/database/server";
import { endOfDay, startOfDay } from "date-fns";
import { unstable_cache as cache } from "next/cache";
import {
  getClientDataSchema,
  GetClientDataSchema,
} from "~/schemas/statistics/get-client-data-schema";
import {
  Caching,
  defaultRevalidateTimeInSeconds,
  OrganizationCacheKey,
} from "../caching";

export async function getClientData(
  input: GetClientDataSchema
): Promise<number> {
  const ctx = await getAuthOrganizationContext();
  const supabase = await createClient();

  const result = getClientDataSchema.safeParse(input);
  if (!result.success) {
    throw new ValidationError(JSON.stringify(result.error.flatten()));
  }
  const parsedInput = result.data;

  return cache(
    async () => {
      const { data: contacts, error } = await supabase
        .from("contacts")
        .select("created_at")
        .eq("organization_id", ctx.organization.id)
        .gte("created_at", startOfDay(parsedInput.from).toISOString())
        .lte("created_at", endOfDay(parsedInput.to).toISOString());

      if (!contacts) {
        throw new NotFoundError("Contact not found");
      }

      return contacts.length;
    },
    Caching.createOrganizationKeyParts(
      OrganizationCacheKey.ClientData,
      ctx.organization.id,
      parsedInput.from.toISOString(),
      parsedInput.to.toISOString()
    ),
    {
      revalidate: defaultRevalidateTimeInSeconds,
      tags: [
        Caching.createOrganizationTag(
          OrganizationCacheKey.ClientData,
          ctx.organization.id
        ),
        Caching.createOrganizationTag(
          OrganizationCacheKey.Contacts,
          ctx.organization.id
        ),
      ],
    }
  )();
}
