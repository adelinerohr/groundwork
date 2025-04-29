import { Tier } from "@workspace/billing/tier";
import { Role } from "./constants";

export const roleLabels: Record<Role, string> = {
  [Role.MEMBER]: "Member",
  [Role.ADMIN]: "Admin",
};

export const tierLabels: Record<Tier, string> = {
  [Tier.Free]: "Free",
  [Tier.Pro]: "Pro",
  [Tier.ProPendingCancel]: "Pro",
  [Tier.Enterprise]: "Enterprise",
  [Tier.EnterprisePendingCancel]: "Enerprise",
};
