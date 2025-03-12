import {z} from "zod";

export const getSignedURLSchema = z.object({
    key:z.string(),
    contentType:z.string()
})

export type getSignedURLSchemaType = z.infer<typeof getSignedURLSchema>