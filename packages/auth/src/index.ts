"use server";

import { cache } from "react";
import { createClient } from "@workspace/database/server";

export async function auth() {
  const supabase = await createClient();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("Error fetching session: ", error.message);
    return null;
  }

  return session;
}

export const dedupedAuth = cache(auth);
