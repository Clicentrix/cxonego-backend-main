import { Router } from "express";
import { bodySchemaValidator } from "../middlewares/schema.validator";
import { ReferSchema } from "../schemas/refer.schemas";
import ReferController from "../controllers/refer.controller";
import hasPermission from "../middlewares/permission.middleware";
import { roleNames } from "../common/utils";

const referRouter = Router();
const referController = new ReferController();

referRouter.get("/", referController.getAllReferalls);

referRouter.post(
  "/create-refer",
  bodySchemaValidator(ReferSchema),
  referController.createRefer
);

referRouter.put(
  "/update-refer/:referId",
  bodySchemaValidator(ReferSchema),
  referController.updateRefer
);

// referRouter.delete(
//     "/delete-refer/:referId",
//     referController.deleteRefer
// );

referRouter.post("/getAllRefer", referController.getAllRefer);

referRouter.get("/:referId", referController.getRefer);

referRouter.post(
  "/bulk-delete/",
  hasPermission([roleNames.ADMIN]),
  referController.bulkDeleteRefer
);

export default referRouter;
