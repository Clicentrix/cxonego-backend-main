import ServicesController from "../controllers/services.controller";
import {Router} from "express";
import { bodySchemaValidator } from "../middlewares/schema.validator";
import { getSignedURLSchema } from "../schemas/services.schemas";

const servicesController = new ServicesController();

const servicesRouter=Router();

servicesRouter.post(
    "/get-signed-url",
    bodySchemaValidator(getSignedURLSchema),
    servicesController.getSignedURL
)

export default servicesRouter;