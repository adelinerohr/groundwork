import { dedupedAuth } from ".";
import { redirect } from "next/navigation";
import { routes } from "@workspace/routes";
import { cache } from "react";
import { createClient } from "@workspace/database/server";

const dedupedGetUserInfo = cache(async function (userId: string) {
  const supabase = await createClient();

  const { data: userInfo, error } = await supabase
    .from("users")
    .select(
      `
      name,
      phone,
      avatar_url,
      completed_onboarding,
      email,
      memberships (
        organization_id,
        role,
        is_owner
      )  
    `
    )
    .eq("id", userId)
    .single();

  if (error) throw error;
  if (!userInfo) {
    supabase.auth.signOut();
  }

  return userInfo;
});

export async function getAuthContext() {
  const session = await dedupedAuth();
  if (!session) return redirect(`${routes.dashboard.auth.SignIn}`);

  const userInfo = await dedupedGetUserInfo(session.user.id);

  const enrichedSession = {
    ...session,
    user: {
      ...session.user,
      ...userInfo,
    },
  };

  return { session: enrichedSession };
}
