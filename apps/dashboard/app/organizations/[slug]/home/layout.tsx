import * as React from "react";
import { type Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@workspace/ui/components/button";
import {
  Page,
  PageActions,
  PageBody,
  PageHeader,
  PagePrimaryBar,
  PageSecondaryBar,
} from "@workspace/ui/components/page";

import { TransitionProvider } from "~/hooks/use-transition-context";
import { createTitle } from "~/lib/formatters";
import { MailIcon } from "lucide-react";
import { OrganizationPageTitle } from "~/components/common/layout/organization-page-title";
import { HomeSpinner } from "~/components/organizations/home/helpers/home-spinner";
import { HomeFilters } from "~/components/organizations/home/helpers/home-filters";

export const metadata: Metadata = {
  title: createTitle("Home"),
};

export type HomeLayoutProps = {
  statistics: React.ReactNode;
};

export default function HomeLayout({
  statistics,
}: HomeLayoutProps): React.JSX.Element {
  return (
    <TransitionProvider>
      <Page>
        <PageHeader>
          <PagePrimaryBar>
            <OrganizationPageTitle
              title="Overview"
              info=" Lead and contact engagement metrics"
            />
            <PageActions>
              <Link
                href="https://github.com/achromaticlabs/pro"
                target="_blank"
                className={buttonVariants({ variant: "ghost", size: "icon" })}
              >
                <MailIcon className="size-4 shrink-0" />
                <span className="sr-only">Email</span>
              </Link>
            </PageActions>
          </PagePrimaryBar>
          <PageSecondaryBar>
            <HomeFilters />
          </PageSecondaryBar>
        </PageHeader>
        <PageBody>
          <div className="mx-auto max-w-6xl space-y-2 p-2 sm:space-y-8 sm:p-6">
            {statistics}
          </div>
          <HomeSpinner />
        </PageBody>
      </Page>
    </TransitionProvider>
  );
}
