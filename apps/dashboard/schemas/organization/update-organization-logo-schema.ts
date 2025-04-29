import { z } from "zod";

export const updateOrganizationLogoSchema = z.object({
  logo: z
    .string({
      invalid_type_error: "Logo must be a string.",
    })
    .optional()
    .or(z.literal("")),
});

export type UpdateOrganizationLogoSchema = z.infer<
  typeof updateOrganizationLogoSchema
>;
