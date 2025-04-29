import { NotFoundError } from "@workspace/common/errors";
import { Role } from "@workspace/database/constants";
import { createClient } from "@workspace/database/server";

export async function isOrganizationOwner(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const supabase = await createClient();
  const { data: membership } = await supabase
    .from("memberships")
    .select("is_owner")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .single();

  if (!membership) {
    throw new NotFoundError("Membership not found");
  }

  return membership.is_owner;
}

export async function isOrganizationAdmin(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const supabase = await createClient();
  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .single();

  if (!membership) {
    throw new NotFoundError("Membership not found");
  }

  return membership.role === Role.ADMIN;
}

export async function isOrganizationMember(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const supabase = await createClient();
  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .single();

  if (!membership) {
    throw new NotFoundError("Membership not found");
  }

  return membership.role === Role.MEMBER;
}
