import {z} from "zod";
export const roleSchema = z.object({
    roleName: z.enum(["SALESPERSON","SALESMANAGER","ADMIN","USER"]),
    description: z.string(),
});

export type roleSchemaType = z.infer<typeof roleSchema>