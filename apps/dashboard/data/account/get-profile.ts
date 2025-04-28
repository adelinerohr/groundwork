"use server";

import { Profile } from "~/types/account/profile";
import { createClient } from "@workspace/database/server";

export async function getProfile(): Promise<Profile> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated.");

  const { data: profile, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw new Error(error.message);

  return profile as Profile;
}
