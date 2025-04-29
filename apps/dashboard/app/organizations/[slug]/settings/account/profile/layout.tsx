import * as React from "react";
import { type Metadata } from "next";

import { routes } from "@workspace/routes";
import { AnnotatedLayout } from "@workspace/ui/components/annotated";
import {
  Page,
  PageBody,
  PageHeader,
  PagePrimaryBar,
} from "@workspace/ui/components/page";
import { Separator } from "@workspace/ui/components/separator";

import { createTitle } from "~/lib/formatters";
import { OrganizationPageTitle } from "~/components/common/layout/organization-page-title";

export const metadata: Metadata = {
  title: createTitle("Profile"),
};

export type ProfileLayoutProps = {
  personalDetails: React.ReactNode;
  dangerZone: React.ReactNode;
};

export default function ProfileLayout({
  personalDetails,
  dangerZone,
}: ProfileLayoutProps): React.JSX.Element {
  return (
    <Page>
      <PageHeader>
        <PagePrimaryBar>
          <OrganizationPageTitle
            index={{
              route: routes.dashboard.organizations.slug.settings.account.Index,
              title: "Account",
            }}
            title="Profile"
          />
        </PagePrimaryBar>
      </PageHeader>
      <PageBody>
        <AnnotatedLayout>
          {personalDetails}
          <Separator />
          {dangerZone}
        </AnnotatedLayout>
      </PageBody>
    </Page>
  );
}
