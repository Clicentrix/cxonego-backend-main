import { Router } from "express";
import HealthController from "../controllers/health.controller";

const healthController = new HealthController();
const healthRouter = Router({ mergeParams: true });

healthRouter.get("/", healthController.check);

export default healthRouter;