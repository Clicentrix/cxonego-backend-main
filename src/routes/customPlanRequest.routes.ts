import { Router } from "express";
import CustomPlanRequestController from "../controllers/customPlanRequest.controller";
import { bodySchemaValidator } from "../middlewares/schema.validator";
import { CustomPlanRequestSchema } from "../schemas/customPlanRequest.schemas";

const customPlanRequestRouter = Router({ mergeParams: true });
const customPlanRequestController = new CustomPlanRequestController();

customPlanRequestRouter.post(
  "/",
  bodySchemaValidator(CustomPlanRequestSchema),
  customPlanRequestController.createCustomPlanRequest
);
customPlanRequestRouter.get(
  "/",
  customPlanRequestController.getCustomPlanRequests
);
customPlanRequestRouter.get(
  "/:id",
  customPlanRequestController.getCustomPlanRequestById
);
customPlanRequestRouter.put(
  "/:id",
  bodySchemaValidator(CustomPlanRequestSchema),
  customPlanRequestController.updateCustomPlanRequest
);

customPlanRequestRouter.post("/bulkDelete", customPlanRequestController.bulkDeleteRequests);

customPlanRequestRouter.delete(
  "/:id",
  customPlanRequestController.deleteCustomPlanRequest
);

export default customPlanRequestRouter;
