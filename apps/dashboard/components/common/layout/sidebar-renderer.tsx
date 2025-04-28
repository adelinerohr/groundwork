"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import {
  baseUrl,
  getPathname,
  replaceOrgSlug,
  routes,
} from "@workspace/routes";

import { useActiveOrganization } from "~/hooks/use-active-organization";
import { Organization } from "~/types/organization/organization";
import { Profile } from "~/types/account/profile";
import { AppSidebar } from "./app-sidebar";
import { SettingsSidebar } from "./settings-sidebar";

export type SidebarRendererProps = {
  organizations: Organization[];
  profile: Profile;
};

export function SidebarRenderer(
  props: SidebarRendererProps
): React.JSX.Element {
  const pathname = usePathname();
  const activeOrganization = useActiveOrganization();
  const settingsRoute = replaceOrgSlug(
    routes.dashboard.organizations.slug.settings.Index,
    activeOrganization.slug
  );

  if (pathname.startsWith(getPathname(settingsRoute, baseUrl.Dashboard))) {
    return <SettingsSidebar />;
  }

  return <AppSidebar {...props} />;
}
