import { dedupedAuth } from ".";
import { redirect } from "next/navigation";
import { routes } from "@workspace/routes";
import { cache } from "react";
import { createClient } from "@workspace/database/server";
import { cookies } from "next/headers";

const dedupedGetActiveOrganization = cache(async function (
  organizationSlug: string
) {
  const supabase = await createClient();

  const { data: organization, error } = await supabase
    .from("organizations")
    .select(
      `
      id,
      logo,
      name,
      slug,
      tier,
      stripe_customer_id,
      memberships (user_id)
    `
    )
    .eq("slug", organizationSlug)
    .single();

  if (error) throw error;
  if (!organization) {
    return redirect(routes.dashboard.organizations.Index);
  }

  return {
    ...organization,
    logo: organization.logo ?? undefined,
  };
});

const dedupedGetUserInfo = cache(async function (userId: string) {
  const supabase = await createClient();

  const { data: userInfo, error } = await supabase
    .from("users")
    .select(
      `
      name,
      phone,
      image,
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

export async function getAuthOrganizationContext() {
  const session = await dedupedAuth();
  if (!session) return redirect(`${routes.dashboard.auth.SignIn}`);

  const cookieStore = await cookies();
  const organizationSlug = cookieStore.get("organizationSlug")?.value;
  if (!organizationSlug) {
    console.warn("No organizationSlug in cookies");
    return redirect(routes.dashboard.organizations.Index);
  }

  console.log(organizationSlug);

  const activeOrganization =
    await dedupedGetActiveOrganization(organizationSlug);
  const userInfo = await dedupedGetUserInfo(session.user.id);

  if (
    !userInfo.memberships.some(
      (m) => m.organization_id === activeOrganization.id
    )
  ) {
    return redirect(routes.dashboard.organizations.Index);
  }

  const enrichedSession = {
    ...session,
    user: {
      ...session.user,
      ...userInfo,
    },
  };

  return {
    session: enrichedSession,
    organization: activeOrganization,
  };
}
