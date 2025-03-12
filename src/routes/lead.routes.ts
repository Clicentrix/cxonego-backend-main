import { Router } from "express";
import LeadController from "../controllers/lead.controller";
import {  LeadSchema ,bulkDeleteSchema} from "../schemas/lead.schemas";
import { bodySchemaValidator } from "../middlewares/schema.validator";
import { uploadFileUsingMulter } from "../middlewares/file.middleware";
import hasPermission from "../middlewares/permission.middleware";

import { roleNames } from "../common/utils";

const leadRouter = Router();
const leadController=new LeadController();

leadRouter.get("/", leadController.getAllLeads);

leadRouter.post(
    "/create-lead",    
    bodySchemaValidator(LeadSchema),
    leadController.createLead
);

leadRouter.post(
    "/get-leads",
    hasPermission([roleNames.ADMIN,roleNames.SALESMANAGER,roleNames.SALESPERSON]),
    leadController.getLeads
);

leadRouter.put(
    "/update-lead/:leadId",
    hasPermission([roleNames.ADMIN,roleNames.SALESPERSON,roleNames.SALESMANAGER]),
    bodySchemaValidator(LeadSchema),
    leadController.updateLead
);

leadRouter.get(
    "/get-lead/:leadId",
    hasPermission([roleNames.SALESPERSON,roleNames.ADMIN,roleNames.SALESMANAGER]),
    leadController.getLead
);

leadRouter.delete(
    "/delete-lead/:leadId",
    hasPermission([roleNames.ADMIN]),
    leadController.deleteLead
);

leadRouter.post(
    "/upload-excel-leads",
    hasPermission([roleNames.ADMIN]), 
    uploadFileUsingMulter,
    leadController.uploadLeadUsingExcel
)

leadRouter.post(
    "/bulk-delete",
    hasPermission([roleNames.ADMIN]),
    bodySchemaValidator(bulkDeleteSchema),
    leadController.bulkDeleteLead
)

//related view - get leads by contact Id
leadRouter.post(
    "/bycontact/:contactId",
    leadController.getLeadsByContactId
)

//related view - get leads by account Id
leadRouter.post(
    "/byaccount/:accountId",
    leadController.getLeadsByAccountId
)

export default leadRouter;