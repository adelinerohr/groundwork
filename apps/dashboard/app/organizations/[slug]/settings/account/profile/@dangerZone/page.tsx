import { getAuthContext } from "@workspace/auth/context";
import { createClient } from "@workspace/database/server";
import * as React from "react";
import { DeleteAccountCard } from "~/components/organizations/settings/account/profile/danger-zone/card";

import { PersonalDetailsCard } from "~/components/organizations/settings/account/profile/personal-details/card";
import { getPersonalDetails } from "~/data/account/get-personal-details";

export default async function DangerZonePage(): Promise<React.JSX.Element> {
  const supabase = await createClient();
  const ctx = await getAuthContext();

  const ownedOrganizationIds = ctx.session.user.memberships
    .filter((membership) => membership.is_owner)
    .map((membership) => membership.organization_id);

  let ownedOrganizations: {
    name: string;
    slug: string;
  }[] = [];

  if (ownedOrganizationIds.length > 0) {
    const { data } = await supabase
      .from("organizations")
      .select("name, slug")
      .in("id", ownedOrganizationIds);
    if (data) ownedOrganizations = data;
  }

  return <DeleteAccountCard ownedOrganizations={ownedOrganizations} />;
}
