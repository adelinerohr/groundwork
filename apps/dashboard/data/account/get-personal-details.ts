"use server";

import { unstable_cache as cache } from "next/cache";

import { createClient } from "@workspace/database/server";
import { PersonalDetails } from "~/types/account/personal-details";
import { getAuthContext } from "@workspace/auth/context";
import { NotFoundError } from "@workspace/common/errors";
import {
  Caching,
  UserCacheKey,
  defaultRevalidateTimeInSeconds,
} from "../caching";

export async function getPersonalDetails(): Promise<PersonalDetails> {
  const supabase = await createClient();
  const ctx = await getAuthContext();

  return cache(
    async () => {
      const { data: userFromDb } = await supabase
        .from("users")
        .select("id, image, name, phone, email")
        .eq("id", ctx.session.user.id)
        .single();

      if (!userFromDb) throw new NotFoundError("User not found");

      const response: PersonalDetails = {
        id: userFromDb.id,
        image: userFromDb.image ?? undefined,
        name: userFromDb.name,
        phone: userFromDb.phone ?? undefined,
        email: userFromDb.email ?? undefined,
      };

      return response;
    },
    Caching.createUserKeyParts(
      UserCacheKey.PersonalDetails,
      ctx.session.user.id
    ),
    {
      revalidate: defaultRevalidateTimeInSeconds,
      tags: [
        Caching.createUserTag(
          UserCacheKey.PersonalDetails,
          ctx.session.user.id
        ),
      ],
    }
  )();
}
