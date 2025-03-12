import RoleController from "../controllers/role.controller";
import {Router} from "express";
import {roleSchema} from "../schemas/role.schemas";
import { bodySchemaValidator } from "../middlewares/schema.validator";
const roleRouter=Router({ mergeParams: true });
const roleController=new RoleController();
roleRouter.get(
    "/",
    roleController.getRoles
)
roleRouter.post(
    "/",
    bodySchemaValidator(roleSchema),
    roleController.createRole
)
roleRouter.put(
    "/:roleId",
    bodySchemaValidator(roleSchema),
    roleController.updateRole
)
roleRouter.delete(
    "/delete-role/:roleId",
    roleController.deleteRole
)
export default roleRouter;