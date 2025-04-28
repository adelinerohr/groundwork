import { InvitationStatus, Role } from "@workspace/database/constants";
import { createClient } from "@workspace/database/server";
import { routes } from "@workspace/routes";
import { APP_NAME } from "@workspace/common/app";
import { sendInvitationEmail } from "@workspace/email/send-invitation-email";

export async function checkIfCanInvite(
  email: string,
  organizationId: string
): Promise<boolean> {
  const supabase = await createClient();

  const [memberShipCount, invitationCount] = await Promise.all([
    supabase
      .from("memberships")
      .select("id, users (email)", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("users.email", email),
    supabase
      .from("invitations")
      .select("id, users (email)", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("users.email", email)
      .eq("status", InvitationStatus.PENDING),
  ]);

  return memberShipCount.count === 0 && invitationCount.count === 0;
}

export async function createInvitation(
  email: string,
  role: Role,
  organizationId: string
) {
  const supabase = await createClient();

  const { error: revokeError } = await supabase
    .from("invitations")
    .update({ status: InvitationStatus.REVOKED })
    .eq("organization_id", organizationId)
    .eq("email", email)
    .eq("status", InvitationStatus.PENDING);

  if (revokeError) throw new Error("Failed to revoke invitation.");

  const { data: invitation, error: createError } = await supabase
    .from("invitations")
    .insert({
      email: email,
      role: role,
      organization_id: organizationId,
      status: InvitationStatus.PENDING,
    })
    .select("id, role, email, token")
    .single();

  if (createError) throw new Error("Failed to create invitation");

  return invitation;
}

interface SendInvitationParams {
  email: string;
  organizationName: string;
  invitedByEmail: string;
  invitedByName: string;
  token: string;
  invitationId: string;
  organizationId: string;
}

export async function sendInvitationRequest({
  email,
  organizationName,
  invitedByEmail,
  invitedByName,
  token,
  invitationId,
  organizationId,
}: SendInvitationParams): Promise<void> {
  const supabase = await createClient();

  await sendInvitationEmail({
    recipient: email,
    appName: APP_NAME,
    organizationName,
    invitedByEmail,
    invitedByName,
    inviteLink: `${routes.dashboard.invitations.Request}/${token}`,
  });

  await supabase
    .from("invitations")
    .update({ last_sent_at: new Date() })
    .eq("inviation_id", invitationId)
    .eq("organization_id", organizationId);
}
