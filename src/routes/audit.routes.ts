import { Router } from "express";
import { AuditController } from "../controllers/audit.controller";

const auditController = new AuditController();
const auditRouter = Router();

auditRouter.get("/account/:accountId", auditController.getAccountAudits);

auditRouter.get("/contact/:contactId", auditController.getContactAudits);

auditRouter.get("/lead/:leadId", auditController.getLeadAudits);

auditRouter.get(
  "/opportunity/:opportunityId",
  auditController.getOpportunityAudits
);

auditRouter.get(
  "/subscription/:subscriptionId",
  auditController.getSubscriptionAudits
);
export default auditRouter;
