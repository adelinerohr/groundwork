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
  title: createTitle("General"),
};

export type OrganizationGeneralLayoutProps = {
  organizationLogo: React.ReactNode;
  organizationSlug: React.ReactNode;
  organizationDetails: React.ReactNode;
  socialMedia: React.ReactNode;
  dangerZone: React.ReactNode;
};

export default function OrganizationGeneralLayout({
  organizationLogo,
  organizationSlug,
  organizationDetails,
  socialMedia,
  dangerZone,
}: OrganizationGeneralLayoutProps): React.JSX.Element {
  return (
    <Page>
      <PageHeader>
        <PagePrimaryBar>
          <OrganizationPageTitle
            index={{
              route:
                routes.dashboard.organizations.slug.settings.organization.Index,
              title: "Organization",
            }}
            title="General"
          />
        </PagePrimaryBar>
      </PageHeader>
      <PageBody>
        <AnnotatedLayout>
          {organizationLogo}
          <Separator />
          {organizationSlug}
          <Separator />
          {organizationDetails}
          <Separator />
          {socialMedia}
          <Separator />
          {dangerZone}
        </AnnotatedLayout>
      </PageBody>
    </Page>
  );
}
