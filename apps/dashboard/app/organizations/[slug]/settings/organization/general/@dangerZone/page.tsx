import * as React from "react";
import { DeleteOrganizationCard } from "~/components/organizations/settings/organization/general/danger-zone/card";
import { getProfile } from "~/data/account/get-profile";

export default async function DangerZonePage(): Promise<React.JSX.Element> {
  const profile = await getProfile();
  return <DeleteOrganizationCard profile={profile} />;
}
