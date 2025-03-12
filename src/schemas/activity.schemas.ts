import {z} from "zod";

export const activitySchema = z.object({
    subject : z.string(),
    activityType:z.enum(["Appointment","Task","Phone Call Outbound","Email Outbound","SMS Outbound","Whatsapp Outbound", "Documentation", "Meeting", "Data Entry"]),
    activityStatus:z.enum(["Open","In Progress","Completed"]),
    activityPriority:z.enum(["Low","Normal","High"]),
    startDate : z.string().nullable().optional(),
    dueDate : z.string(),
    actualStartDate : z.string().nullable().optional(),
    actualEndDate : z.string().nullable().optional(),
    description : z.string().nullable().optional(),            
});

export const bulkDeleteActivitySchema = z.object({
    activityIds:z.array(z.string())
})


export type activitySchemaSchemaType = z.infer<typeof activitySchema>;
export type bulkDeleteActivitySchemaType = z.infer<typeof bulkDeleteActivitySchema>;
