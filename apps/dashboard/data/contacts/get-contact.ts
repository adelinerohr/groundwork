"use server";

import { unstable_cache as cache } from "next/cache";

import { getAuthOrganizationContext } from "@workspace/auth/context";
import { ValidationError } from "@workspace/common/errors";

import {
  Caching,
  defaultRevalidateTimeInSeconds,
  OrganizationCacheKey,
} from "~/data/caching";
import { Contact } from "~/types/contacts/contact";
import { createClient } from "@workspace/database/server";
import {
  getContactSchema,
  GetContactSchema,
} from "~/schemas/contacts/get-contact-schema";
import { notFound } from "next/navigation";

export async function getContact(input: GetContactSchema): Promise<Contact> {
  const ctx = await getAuthOrganizationContext();
  const supabase = await createClient();

  const result = getContactSchema.safeParse(input);
  if (!result.success) {
    throw new ValidationError(JSON.stringify(result.error.flatten()));
  }

  const parsedInput = result.data;

  return cache(
    async () => {
      // Main filtered query
      const { data: contact } = await supabase
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
        .eq("id", parsedInput.id)
        .single();

      if (!contact) {
        return notFound();
      }

      const response: Contact = {
        id: contact.id,
        image: contact.image ?? undefined,
        name: contact.name,
        email: contact.email ?? undefined,
        address: contact.address ?? undefined,
        phone: contact.phone ?? undefined,
        createdAt: contact.created_at,
        stage: contact.stage,
      };

      return response;
    },
    Caching.createOrganizationKeyParts(
      OrganizationCacheKey.Contact,
      ctx.organization.id,
      parsedInput.id
    ),
    {
      revalidate: defaultRevalidateTimeInSeconds,
      tags: [
        Caching.createOrganizationTag(
          OrganizationCacheKey.Contact,
          ctx.organization.id,
          parsedInput.id
        ),
      ],
    }
  )();
}
