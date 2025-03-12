import { Router } from "express";
import { bodySchemaValidator } from "../middlewares/schema.validator";
import { OrganizationSchema} from "../schemas/organization.schemas";
import OrganizationController from "../controllers/organization.controller";
import hasPermission from "../middlewares/permission.middleware";
import { roleNames } from "../common/utils";

const organizationRouter = Router();
const organizationController = new OrganizationController();

organizationRouter.post(
    "/create-organization",
    bodySchemaValidator(OrganizationSchema),
    organizationController.createOrganization
);

organizationRouter.get(
    "/get-organization/:organizationId",    
    organizationController.getOrganizationById
);


organizationRouter.get(
    "/getAllOrganization",    
    organizationController.getAllOrganization
);

organizationRouter.put(
    "/update-organization/:organizationId",
    bodySchemaValidator(OrganizationSchema),
    organizationController.updateOrganization
);

organizationRouter.patch(
    "/:organizationId",
    organizationController.updateOrganizationPartially
);

organizationRouter.delete(
    "/delete-organization/:organizationId",   
    hasPermission([roleNames.ADMIN]), 
    organizationController.deleteOrganization
);
export default organizationRouter;