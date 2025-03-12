import {z} from "zod"

export const EmailPOCSchema = z.object({
    receivers: z.array(z.string().email()),
    subject: z.string(),
    HTMLBody: z.string()
});

export type EmailPOCType = z.infer<typeof EmailPOCSchema>