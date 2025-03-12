import { z } from "zod";
import { customRequestStatus } from "../common/utils";

const onboardingStatusSchema = z.enum([
  customRequestStatus.APPROVED,
  customRequestStatus.REJECTED,
  customRequestStatus.PENDING,
]);

export const CustomPlanRequestSchema = z.object({
  name: z.string(),
  email: z.string().email({ message: "Please enter a valid email" }),
  countryCode: z.string(),
  phone: z.string(),
  organization: z.string(),
  message: z.string(),
  onboardingStatus: onboardingStatusSchema,
});

export type CustomPlanRequestSchemaType = z.infer<
  typeof CustomPlanRequestSchema
>;
