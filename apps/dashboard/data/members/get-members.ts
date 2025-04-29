"use server";

import { unstable_cache } from "next/cache";

import {
  Caching,
  defaultRevalidateTimeInSeconds,
  OrganizationCacheKey,
} from "../caching";
import { createClient } from "@workspace/database/server";
import { getAuthOrganizationContext } from "@workspace/auth/context";
import { Member } from "~/types/organization/member";
import { NotFoundError } from "@workspace/common/errors";

export async function getMembers(): Promise<Member[]> {
  const ctx = await getAuthOrganizationContext();
  const supabase = await createClient();

  return unstable_cache(
    async () => {
      const { data: members } = await supabase
        .from("memberships")
        .select(
          `
            role,
            is_owner,
            users (
              id,
              image,
              name,
              email,
              created_at
            )
        `
        )
        .eq("organization_id", ctx.organization.id)
        .order("created_at", { ascending: true });

      if (!members) throw new NotFoundError("No members found");

      const response: Member[] = members.map((member) => ({
        id: (member.users as any).id,
        email: (member.users as any).email,
        name: (member.users as any).name,
        avatar_url: (member.users as any).avatar_url ?? undefined,
        role: member.role,
        isOwner: member.is_owner,
        dateAdded: new Date((member.users as any).created_at),
        lastLogin: new Date((member.users as any).last_login) ?? undefined,
      }));

      return response;
    },
    Caching.createOrganizationKeyParts(
      OrganizationCacheKey.Members,
      ctx.organization.id
    ),
    {
      revalidate: defaultRevalidateTimeInSeconds,
      tags: [
        Caching.createOrganizationTag(
          OrganizationCacheKey.Members,
          ctx.organization.id
        ),
      ],
    }
  )();
}
