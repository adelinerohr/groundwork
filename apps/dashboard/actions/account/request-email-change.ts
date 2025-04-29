"use server";

import { PreConditionError } from "@workspace/common/errors";
import { createClient } from "@workspace/database/server";
import { authActionClient } from "~/actions/safe-action";
import { requestEmailChangeSchema } from "~/schemas/account/request-email-change-schema";

export const requestEmailChange = authActionClient
  .metadata({ actionName: "checkIfEmailIsAvailable" })
  .schema(requestEmailChangeSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createClient();
    const normalizedEmail = parsedInput.email.toLowerCase();

    const { count } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("email", normalizedEmail);

    if (!count || count > 0) {
      throw new PreConditionError("Email address is already taken");
    }

    const { data, error } = await supabase.auth.updateUser({
      email: normalizedEmail,
    });

    if (error) {
      throw new Error(error.message);
    }
  });
