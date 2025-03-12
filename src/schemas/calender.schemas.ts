import {z} from "zod";


export const CalenderSchema = z.object({
    title : z.string(),
    agenda:z.string().nullable().optional(),
    startDateTime: z.string().nullable().optional(),
    endDateTime: z.string().nullable().optional(),          
    Notes:z.string().nullable().optional(),   
    status:z.string(),        
});


export type CalenderSchemaType = z.infer<typeof CalenderSchema>;

