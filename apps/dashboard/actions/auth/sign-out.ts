"use server";

import { redirect } from "next/navigation";
import { signOutSchema } from "~/schemas/auth/sign-out-schema";
import { authActionClient } from "../safe-action";
import { createClient } from "@workspace/database/server";

export const signOut = authActionClient
  .metadata({ actionName: "signOut" })
  .schema(signOutSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    return redirect(parsedInput.redirect);
  });
