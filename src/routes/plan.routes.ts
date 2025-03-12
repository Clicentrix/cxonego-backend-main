
import { Router } from "express";
import PlanController from "../controllers/plan.controller";
import { PlanSchema } from "../schemas/plan.schemas";
import { bodySchemaValidator } from "../middlewares/schema.validator";
const planController = new PlanController();
const planRouter = Router();

planRouter.post(
    "/add-plan",
    bodySchemaValidator(PlanSchema),
    planController.addPlan
);

planRouter.get(
    "/getAllPlans",
    planController.getAllPlans
)

planRouter.get(
    "/get-plan/:planId",
    planController.getPlanById
)

planRouter.put(
    "/update-plan/:planId",
    bodySchemaValidator(PlanSchema),
    planController.updatePlan
)

planRouter.post("/bulkDelete", planController.bulkDeletePlans);

planRouter.delete(
    "/delete-plan/:planId",
    planController.deletePlan
)
export default planRouter;