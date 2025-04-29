"use server";

import { unstable_cache as cache } from "next/cache";

import { getAuthOrganizationContext } from "@workspace/auth/context";
import { NotFoundError, ValidationError } from "@workspace/common/errors";

import {
  Caching,
  defaultRevalidateTimeInSeconds,
  OrganizationCacheKey,
} from "~/data/caching";
import {
  getContactsSchema,
  type GetContactsSchema,
} from "~/schemas/contacts/get-contacts-schema";
import { Contact } from "~/types/contacts/contact";
import { createClient } from "@workspace/database/server";

export async function getContacts(input: GetContactsSchema): Promise<{
  contacts: Contact[];
  filteredCount: number;
  totalCount: number;
}> {
  const ctx = await getAuthOrganizationContext();
  const supabase = await createClient();

  const result = getContactsSchema.safeParse(input);
  if (!result.success) {
    throw new ValidationError(JSON.stringify(result.error.flatten()));
  }

  const parsedInput = result.data;

  const from = parsedInput.pageIndex * parsedInput.pageSize;
  const to = from + parsedInput.pageSize - 1;

  return cache(
    async () => {
      // Main filtered query
      const {
        data: contacts,
        count: filteredCount,
        error,
      } = await supabase
        .from("contacts")
        .select(
          `
          id,
          image,
          name,
          email,
          address,
          phone,
          created_at,
          stage
        `,
          { count: "exact" }
        )
        .eq("organization_id", ctx.organization.id)
        .range(from, to)
        .order(parsedInput.sortBy, {
          ascending: parsedInput.sortDirection === "asc",
        });

      if (!contacts) {
        throw new NotFoundError("Contacts not found");
      }

      // Total count for organization (unfiltered)
      const { count: totalCount } = await supabase
        .from("contacts")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", ctx.organization.id);

      // Map contacts
      const mapped: Contact[] = contacts.map((contact: any) => ({
        id: contact.id,
        image: contact.image ?? undefined,
        name: contact.name,
        email: contact.email ?? undefined,
        address: contact.address ?? undefined,
        phone: contact.phone ?? undefined,
        createdAt: contact.created_at,
        stage: contact.stage,
      }));

      return {
        contacts: mapped,
        filteredCount: filteredCount ?? 0,
        totalCount: totalCount ?? 0,
      };
    },
    Caching.createOrganizationKeyParts(
      OrganizationCacheKey.Contacts,
      ctx.organization.id,
      parsedInput.pageIndex.toString(),
      parsedInput.pageSize.toString(),
      parsedInput.sortBy,
      parsedInput.sortDirection,
      parsedInput.searchQuery?.toString() ?? ""
    ),
    {
      revalidate: defaultRevalidateTimeInSeconds,
      tags: [
        Caching.createOrganizationTag(
          OrganizationCacheKey.Contacts,
          ctx.organization.id
        ),
      ],
    }
  )();
}
