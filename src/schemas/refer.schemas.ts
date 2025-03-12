import {z} from "zod";


export const ReferSchema = z.object({
    firstName:z.string().nonempty(),
    lastName:z.string().nonempty(),
    referBy:z.string().nonempty(),   
    status:z.enum(["New","In Progress","Closed"]).nullable().optional(),  
    phone:z.string().nullable().optional(), 
    email:z.string().email().nullable().optional(),                    
    description:z.string().nullable().optional(),  
});

export type ReferSchemaType = z.infer<typeof ReferSchema>;

