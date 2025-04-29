"use server";

import { unstable_cache } from "next/cache";
import {
  Caching,
  OrganizationCacheKey,
  defaultRevalidateTimeInSeconds,
} from "../caching";
import { getAuthOrganizationContext } from "@workspace/auth/context";
import { createClient } from "@workspace/database/server";
import { InvitationStatus } from "~/lib/constants";
import { Invitation } from "~/types/invitations/invitation";

export async function getInvitations(): Promise<Invitation[]> {
  const ctx = await getAuthOrganizationContext();
  const supabase = await createClient();

  return unstable_cache(
    async () => {
      const { data: invitations } = await supabase
        .from("invitations")
        .select(
          `
            id,
            token,
            status,
            email,
            role,
            created_at,
            last_sent_at
          `
        )
        .eq("organization_id", ctx.organization.id)
        .neq("status", InvitationStatus.ACCEPTED);

      if (!invitations) throw new Error("No invitations found");

      const response: Invitation[] = invitations.map((invitation) => ({
        id: invitation.id,
        token: invitation.token,
        status: invitation.status,
        email: invitation.email,
        role: invitation.role,
        lastSent: new Date(invitation.last_sent_at) ?? undefined,
        dateAdded: invitation.created_at,
      }));

      return response;
    },
    Caching.createOrganizationKeyParts(
      OrganizationCacheKey.Invitations,
      ctx.organization.id
    ),
    {
      revalidate: defaultRevalidateTimeInSeconds,
      tags: [
        Caching.createOrganizationTag(
          OrganizationCacheKey.Invitations,
          ctx.organization.id
        ),
      ],
    }
  )();
}
