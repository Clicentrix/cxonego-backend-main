import { z } from "zod";

export const DefaultSearchParams = z.object({
  page: z.string().optional(),
  size: z.string().optional(),
  order: z.enum(["ASC", "DESC"]).optional(),
});

export const DateRangeParams = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),  
});

export const InviteUsers = z.object({
  invites:z.array(
    z.object(
      {
        email:z.string()
      }
    )
  )
});
export const InviteUser = z.object({
  email: z.string(),
  company: z.string(),  
  role:z.string(),
  organizationId:z.string(),
});

export const RevenueRangeParams = z.object({
  startPrice: z.string().optional(),
  endPrice: z.string().optional(),  
});

export const RangeDate = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),  
});

export type DefaultSearchParamsType = z.infer<typeof DefaultSearchParams>;
export type DateRangeParamsType = z.infer<typeof DateRangeParams>;
export type InviteUsersType = z.infer<typeof InviteUsers>;
export type InviteUserType= z.infer<typeof InviteUser> 
export type RevenueRangeParamsType = z.infer<typeof RevenueRangeParams>;
export type RangeDateType = z.infer<typeof RangeDate>;