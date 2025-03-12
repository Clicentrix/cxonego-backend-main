import { z } from "zod";

export const UpdateProfile = z.object({
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  picture: z.string().nullable().optional(),
  email_verified: z.boolean().nullable().optional(),
  password:z.string().nullable().optional()
});
export const UpdatePasswordSchema = z.object({
  oldPassword:z.string(),
  newPassword:z.string()
})
export type UpdatePasswordSchemaType = z.infer<typeof UpdatePasswordSchema>;
export type UpdateProfileSchema = z.infer<typeof UpdateProfile>;
