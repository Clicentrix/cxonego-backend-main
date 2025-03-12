import { z } from "zod";
import { subscriptionStatus } from "../common/utils";

const SubscriptionStatusSchema = z.enum([
  subscriptionStatus.SUBSCRIPTION_INACTIVE,
  subscriptionStatus.SUBSCRIPTION_ACTIVE,
  subscriptionStatus.SUBSCRIPTION_CANCELLED,
  subscriptionStatus.SUBSCRIPTION_DISABLED,
  subscriptionStatus.SUBSCRIPTION_PENDING,
  subscriptionStatus.SUBSCRIPTION_UPCOMING,
]);

export const SubscriptionSchema = z.object({
  startDateTime: z.string(),
  purchaseDateTime: z.string(),
  customPlanAmount: z.string(),
  customAnnualAmount: z.string(),
  customNoOfDays: z.string(),
  customNoOfUsers: z.string(),
  notes: z.string(),
  planId: z.string(),
  organisationId: z.string(),
  subscriptionStatus: SubscriptionStatusSchema,
});

export const CreateSubscriptionApiSchema = z.object({
  planId: z.string(),
  userId: z.string(),
  // amount: z.number(),  //we may need it when emi payments will be there.
  currency: z.string(),
});

export const VerifySubscriptionSchema = z.object({
  razorpay_payment_id: z.string(),
  razorpay_order_id: z.string(),
  razorpay_signature: z.string(),
});

export type VerifySubscriptionSchemaType = z.infer<
  typeof VerifySubscriptionSchema
>;
export type CreateSubscriptionApiSchemaType = z.infer<
  typeof CreateSubscriptionApiSchema
>;
export type SubscriptionSchemaType = z.infer<typeof SubscriptionSchema>;
