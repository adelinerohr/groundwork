import { routes } from "@workspace/routes";

export function getRedirectAfterSignIn(): string {
  return `${routes.dashboard.organizations.Index}`;
}
