import { Router } from "express";
import { bodySchemaValidator } from "../middlewares/schema.validator";
import hasPermission from "../middlewares/permission.middleware";
import AuthController from "../controllers/auth.controller";

import { UpdateProfile, UpdatePasswordSchema } from "../schemas/auth.schemas";
import { roleNames } from "../common/utils";

const authRouter = Router({ mergeParams: true });

const authController = new AuthController();

authRouter.post(
  "/disable-user",
  hasPermission([roleNames.ADMIN]),
  authController.disableFirebaseUser
);

export default authRouter;
