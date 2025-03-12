import { Router } from "express";
import SubscriptionController from "../controllers/subscription.controller";
import { bodySchemaValidator } from "../middlewares/schema.validator";
import {
  CreateSubscriptionApiSchema,
  SubscriptionSchema,
  VerifySubscriptionSchema,
} from "../schemas/subscription.schemas";

const subscriptionRouter = Router({ mergeParams: true });

const subscriptionController = new SubscriptionController();

subscriptionRouter.post(
  "/create-subscription",
  bodySchemaValidator(CreateSubscriptionApiSchema),
  subscriptionController.createSuscription
);
subscriptionRouter.post(
  "/verify-subscription",
  bodySchemaValidator(VerifySubscriptionSchema),
  subscriptionController.verifySubscription
);

subscriptionRouter.post(
  "/create-subscription-by-admin",
  bodySchemaValidator(SubscriptionSchema),
  subscriptionController.createSubscriptionByAdmin
);


subscriptionRouter.get("/", subscriptionController.getAllSubscriptions);

//get all subs placed on plan type
subscriptionRouter.get(
  "/get-plans-subscriptions",
  subscriptionController.getSubscriptionsWithPlanType
);

subscriptionRouter.get(
  "/get-user-subscription/:userId",
  subscriptionController.getUserSubscriptions
);

//get user's active subscription
subscriptionRouter.get(
  "/get-active-subscription/:userId",
  subscriptionController.getUserActiveSubscription
);

subscriptionRouter.patch(
  "/cancel-subscription/:subscriptionId",
  subscriptionController.cancelSubscription
);

subscriptionRouter.post(
  "/bulkDelete",
  subscriptionController.bulkDeleteSubscriptions
);

subscriptionRouter.delete(
  "/delete-subscription/:subscriptionId",
  subscriptionController.deleteSubscription
);

subscriptionRouter.get(
  "/getStatisticsDataForSuperAdmin",
  subscriptionController.getStatisticsDataForSuperAdmin
);

subscriptionRouter.get(
  "/:subscriptionId",
  subscriptionController.getSubscriptionById
);

subscriptionRouter.post(
  "/update-payment-status",
  subscriptionController.updatePaymentStatus
);

export default subscriptionRouter;
