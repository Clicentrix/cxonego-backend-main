import {z} from "zod";
export const botSchema = z.object({
    prompt:z.string()
})

export type botSchemaType = z.infer<typeof botSchema>