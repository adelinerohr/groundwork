"use server";

import { redirect } from "next/navigation";
import { actionClient } from "../safe-action";
import { returnValidationErrors } from "next-safe-action";
import { signUpSchema } from "~/schemas/auth/sign-up-schema";
import { createClient } from "@workspace/database/server";
import { routes } from "@workspace/routes";

export const signUp = actionClient
  .metadata({ actionName: "signUp" })
  .schema(signUpSchema)
  .action(async ({ parsedInput }) => {
    const normalizedEmail = parsedInput.email.toLowerCase();
    const supabase = await createClient();

    const { count, error: countError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("email", normalizedEmail);

    console.log(countError);
    if (countError) throw countError;

    if (count! > 0) {
      return returnValidationErrors(signUpSchema, {
        _errors: ["Email address is already associated with an account."],
      });
    }

    const { error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: parsedInput.password,
      options: {
        data: {
          name: parsedInput.name,
        },
      },
    });

    console.log(error);

    if (error) {
      return returnValidationErrors(signUpSchema, {
        _errors: [error.message],
      });
    }

    return redirect(routes.dashboard.onboarding.Index);
  });
