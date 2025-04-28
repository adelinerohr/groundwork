"use server";

import { redirect } from "next/navigation";
import { actionClient } from "../safe-action";
import { passThroughCredentialsSchema } from "~/schemas/auth/pass-through-credentials-schema";
import { returnValidationErrors } from "next-safe-action";
import { createClient } from "@workspace/database/server";
import { routes } from "@workspace/routes";

export const signInWithCredentials = actionClient
  .metadata({ actionName: "signInWithCredentials" })
  .schema(passThroughCredentialsSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: parsedInput.email,
      password: parsedInput.password,
    });

    if (error) {
      return returnValidationErrors(passThroughCredentialsSchema, {
        _errors: [error.message],
      });
    }

    return redirect(routes.dashboard.organizations.Index);
  });
