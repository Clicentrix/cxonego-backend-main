import {z} from "zod"; 
    
export const MoodSchemaArray =
 z.object({
  imgarray:z.array(
    z.object({
    imageUrl : z.string(),
    moodCategory :z.enum(["HAPPY","NEUTRAL","LOW",] as const),    
    })
  )
})

export const MoodSchema = 
z.object({
    imageUrl : z.string(),
    moodCategory :z.enum(["HAPPY","NEUTRAL","LOW",] as const),        
})
  

export type MoodSchemaArrayType = z.infer <typeof MoodSchemaArray>;
export type MoodSchemaType = z.infer <typeof MoodSchema>;