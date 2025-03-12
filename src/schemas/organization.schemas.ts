import {z} from "zod";


export const OrganizationSchema = z.object({
    industry : z.string(),
    name:z.string(),  
    country : z.string(),
    state:z.string(), 
    city : z.string(),
    companySize:z.string(),   
    companyToken: z.string(),
    contactToken: z.string(),   
});

export type OrganizationSchemaType = z.infer<typeof OrganizationSchema>;

