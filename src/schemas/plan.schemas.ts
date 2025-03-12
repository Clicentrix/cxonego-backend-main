import { z } from "zod";
import { Currency, planType } from "../common/utils";

const CurrencySchema = z.enum([
  Currency.INR,
  Currency.GBP,
  Currency.USD,
  Currency.EUR,
  Currency.AUD,
]);

const PlanTypeSchema = z.enum([planType.SUBSCRIPTION, planType.TRIAL, planType.CUSTOM]);

export const PlanSchema = z.object({
  planamount: z.string(),
  gst: z.string(),
  planname: z.string(),
  currency: CurrencySchema,
  description: z.string(),
  noOfUsers: z.string(),
  noOfDays: z.string(),
  planType: PlanTypeSchema,
  features: z.string(),
});

export type PlanSchemaType = z.infer<typeof PlanSchema>;
