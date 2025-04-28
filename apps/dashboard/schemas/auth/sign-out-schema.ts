import { z } from "zod";

export const signOutSchema = z.object({
  redirect: z.string(),
});

export type SignOutSchema = z.infer<typeof signOutSchema>;
