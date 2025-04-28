"use server";

import { checkIfSlugIsAvailableSchema } from "~/schemas/organization/check-if-slug-is-available-schema";
import { authActionClient } from "../safe-action";
import { createClient } from "@workspace/database/server";

export const checkIfSlugIsAvailable = authActionClient
  .metadata({ actionName: "checkIfSlugIsAvailable" })
  .schema(checkIfSlugIsAvailableSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();

    const { count, error } = await supabase
      .from("organizations")
      .select("*", { count: "exact", head: true });

    if (error) throw error;

    return { isAvailable: count === 0 };
  });
