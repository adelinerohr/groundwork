"use server";

import { createClient } from "@workspace/database/server";
import { authActionClient } from "~/actions/safe-action";
import { checkIfEmailIsAvailableSchema } from "~/schemas/account/check-if-email-is-available-schema";

export const checkIfEmailIsAvailable = authActionClient
  .metadata({ actionName: "checkIfEmailIsAvailable" })
  .schema(checkIfEmailIsAvailableSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();
    const normalizedEmail = parsedInput.email.toLowerCase();

    const { count } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("email", normalizedEmail);

    return { isAvailable: count === 0 };
  });
