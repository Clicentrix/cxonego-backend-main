import { z } from "zod";
interface Audit {
    auditId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    modifiedBy: string;
    owner: string;
    subject: string;
    auditType: string;
    description: string;
    user: {
        firstName: string;
        lastName: string;
    };
}

const Audit = z.object({
    auditId: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    deletedAt: z.string().nullable(),
    modifiedBy: z.string(),
    owner: z.string(),
    subject: z.string(),
    auditType: z.string(),
    description: z.string(),
    user: z.object({
        firstName: z.string(),
        lastName: z.string(),
    }),
});

export const AuditData = z.object({
    audit: Audit,
    description: z.string(),
    changes: z.record(z.string()),
});

export type AuditDataType = z.infer<typeof AuditData>;