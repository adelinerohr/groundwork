import { ContactStage } from "@workspace/database/constants";
import { z } from "zod";

export const addContactSchema = z.object({
  name: z
    .string({
      required_error: "Name is required.",
      invalid_type_error: "Name must be a string.",
    })
    .trim()
    .min(1, "Name is required.")
    .max(64, "Maximum 64 characters allowed."),
  email: z
    .string({
      invalid_type_error: "Email must be a string.",
    })
    .trim()
    .max(255, "Maximum 255 characters allowed.")
    .email("Enter a valid email address.")
    .optional()
    .or(z.literal("")),
  phone: z
    .string({
      invalid_type_error: "Phone must be a string.",
    })
    .trim()
    .max(16, "Maximum 16 characters allowed.")
    .optional()
    .or(z.literal("")),
  stage: z.nativeEnum(ContactStage, {
    required_error: "Stage is required",
    invalid_type_error: "Stage must be a string",
  }),
});

export type AddContactSchema = z.infer<typeof addContactSchema>;
