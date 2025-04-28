import type { Metadata } from "next";

import { dedupedAuth } from "@workspace/auth";
import { routes } from "@workspace/routes";

import { createTitle } from "~/lib/formatters";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@workspace/ui/components/logo";

export const metadata: Metadata = {
  title: createTitle("Auth"),
};

export default async function AuthLayout({
  children,
}: React.PropsWithChildren) {
  const session = await dedupedAuth();
  if (session) return redirect(routes.dashboard.organizations.Index);

  return (
    <main className="h-screen dark:bg-background bg-gray-50 px-4">
      <div className="mx-auto w-full min-w-[320px] space-y-6 py-12 max-w-sm">
        <Link href={routes.marketing.Index} className="block w-fit mx-auto">
          <Logo />
        </Link>
        {children}
      </div>
    </main>
  );
}
