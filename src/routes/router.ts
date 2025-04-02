import { Router } from "express";

import authRouter from "./auth.routes";
import emailPOC from "./email-poc.routes";
import leadRouter from "./lead.routes";
import accountRouter from "./account.routes";
import userRouter from "./user.routes";
import contactRouter from "./contact.routes";
import roleRouter from "./role.routes";
import servicesRouter from "./services.routes";
import oppurtunityRouter from "./oppurtunity.routes";
import moodRouter from "./mood.routes";
import activityRouter from "./activity.routes";
import dashboardRouter from "./dashboard.routes";
import auditRouter from "./audit.routes";
import calenderRouter from "./calender.routes";
import organizationRouter from "./organization.routes";
import referRouter from "./refer.routes";
import noteRouter from "./note.routes";
import healthRouter from "./health.routes";
import planRouter from "./plan.routes";
import subscriptionRouter from "./subscription.routes";
import customPlanRequestRouter from "./customPlanRequest.routes";
import superAdminRouter from "./superAdmin.routes";
import cronRouter from "./cron.routes";
import documentRouter from "./document.routes";
// import customeToken from "./firebaseToken.routes";

const router = Router({ mergeParams: true });
router.use("/auth", authRouter)
router.use("/lead", leadRouter);
router.use("/contact", contactRouter);
router.use("/account", accountRouter);
router.use("/users/auth", authRouter);
router.use("/email-poc", emailPOC);
router.use("/users/role", roleRouter);
router.use("/users", userRouter);
router.use("/services", servicesRouter);
router.use("/opportunity", oppurtunityRouter);
router.use("/moodimage", moodRouter);
router.use("/activity", activityRouter);
router.use("/dashboard", dashboardRouter);
router.use("/audit", auditRouter);
router.use("/calender", calenderRouter);
router.use("/organization", organizationRouter);
router.use("/refer", referRouter);
router.use("/note", noteRouter);
router.use("/health", healthRouter);
router.use("/plan", planRouter);
router.use("/subscription", subscriptionRouter);
router.use("/customPlanRequest", customPlanRequestRouter);
router.use("/superAdmin", superAdminRouter);
router.use("/cron", cronRouter)
router.use("/document", documentRouter)
export default router;
