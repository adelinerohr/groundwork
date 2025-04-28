"use client";

import * as React from "react";

import { ScrollArea } from "@workspace/ui/components/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@workspace/ui/components/sidebar";

import { Organization } from "~/types/organization/organization";
import { Profile } from "~/types/account/profile";
import { NavMain } from "./sidebar-helpers/nav-main";
import { NavSupport } from "./sidebar-helpers/nav-support";
import { NavUser } from "./sidebar-helpers/nav-user";
import { OrganizationSwitcher } from "./sidebar-helpers/organization-switcher";

export type AppSidebarProps = {
  organizations: Organization[];
  profile: Profile;
};

export function AppSidebar({
  organizations,
  profile,
}: AppSidebarProps): React.JSX.Element {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex h-14 flex-row items-center py-0">
        <OrganizationSwitcher organizations={organizations} />
      </SidebarHeader>
      <SidebarContent className="overflow-hidden">
        <ScrollArea
          verticalScrollBar
          /* Overriding the hardcoded { disply:table } to get full flex height */
          className="h-full [&>[data-radix-scroll-area-viewport]>div]:!flex [&>[data-radix-scroll-area-viewport]>div]:h-full [&>[data-radix-scroll-area-viewport]>div]:flex-col"
        >
          <NavMain />
          <NavSupport className="mt-auto pb-0" />
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="h-14">
        <NavUser profile={profile} className="p-0" />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
