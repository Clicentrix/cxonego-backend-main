import { z } from "zod";

export const SuperAdminSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string(),
  password: z.string(),
});

export const DeleteUserScehma = z.object({
  adminId: z.string(),
  userEmail: z.string(),
});

export type DeleteUserScehma = z.infer<typeof DeleteUserScehma>;
export type SuperAdminSchemaType = z.infer<typeof SuperAdminSchema>;
