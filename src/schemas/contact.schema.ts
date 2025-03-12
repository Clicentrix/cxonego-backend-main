import {z} from "zod";


export const ContactSchema = z.object({
    firstName : z.string(),
    lastName:z.string(),
    // countryCode :z.string().regex(new RegExp("^[+][0-9]{1,5}$"), "Invalid country code format should be like +countryCode").nullable().optional(),    
    countryCode :z.string().nullable().optional(),    
    phone :z.string().optional(), 
    email:z.string().email().nullable().optional(),
    addressLine:z.string(),
    company:z.string().nullable().optional(),
    country:z.string(),
    state:z.string(),
    city:z.string(),
    status:z.enum(["Active","Inactive"]).nullable().optional(),
    area:z.string(),
    favourite:z.enum(["Yes","No"]).nullable().optional(),
    industry:z.string(),
    designation:z.string().nullable().optional(),
    description:z.string().nullable().optional(),
    social:z.string().nullable().optional(),    
    timeline:z.string().nullable().optional(),
    contactType:z.enum([ "Prospect", "Customer", "Partner", "Investor", "Professional", "Busineess Owner" ,"Owner", "Personal", "Other" ])
});



export const ContactSchemaPartial = ContactSchema.partial();

export type ContactSchemaPartialType = z.infer<typeof ContactSchemaPartial>;
export type ContactSchemaType = z.infer<typeof ContactSchema>;

