import { Tier } from "@workspace/billing/tier";
import { Role } from "./constants";
import { ContactStage } from "@workspace/database/constants";

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

export const contactStageLabel: Record<ContactStage, string> = {
  [ContactStage.POTENTIAL]: "Potential",
  [ContactStage.ACTIVE]: "Active",
  [ContactStage.PAST]: "Past",
  [ContactStage.DEAD]: "Dead",
};
