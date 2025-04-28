"use client";

import * as React from "react";
import { LifeBuoyIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  type SidebarGroupProps,
} from "@workspace/ui/components/sidebar";

export function NavSupport({ ...props }: SidebarGroupProps): React.JSX.Element {
  return (
    <SidebarGroup {...props}>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            type="button"
            tooltip="Feedback"
            className="text-muted-foreground"
          >
            <LifeBuoyIcon className="size-4 shrink-0" />
            <span>Support</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
