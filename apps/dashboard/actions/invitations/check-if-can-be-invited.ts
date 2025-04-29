"use server";

import { checkIfCanBeInvitedSchema } from "~/schemas/invitations/check-if-can-be-invited-schema";
import { authOrganizationActionClient } from "../safe-action";
import { checkIfCanInvite } from "@workspace/auth/invitations";

export const checkIfCanBeInvited = authOrganizationActionClient
  .metadata({ actionName: "checkIfCanBeInvited" })
  .schema(checkIfCanBeInvitedSchema)
  .action(async ({ parsedInput, ctx }) => {
    const normalizedEmail = parsedInput.email.toLowerCase();
    const canInvite = await checkIfCanInvite(
      normalizedEmail,
      ctx.organization.id
    );

    return { canInvite };
  });
