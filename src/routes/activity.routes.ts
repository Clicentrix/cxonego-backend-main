import { Router } from "express";
import { roleNames } from "../common/utils";
import ActivityController from "../controllers/activity.controller";
import hasPermission from "../middlewares/permission.middleware";
import { bodySchemaValidator } from "../middlewares/schema.validator";
import { activitySchema, bulkDeleteActivitySchema } from "../schemas/activity.schemas";

const activityRouter = Router();
const activityController = new ActivityController();

activityRouter.get("/", activityController.getAllActivity);

activityRouter.post(
    "/",
    bodySchemaValidator(activitySchema),
    activityController.createActivity
);

//fetch all activity
activityRouter.post(
    "/getActivities",
    activityController.getActivities
);

//fetch activity by activity Id
activityRouter.get(
    "/:activityId",
    activityController.getActivityByactivityId
)

//related view - fetch activity by account Id
activityRouter.post(
    "/account/:accountId",
    activityController.getActivityByaccountId
)

//related view - fetch activity by contact Id
activityRouter.post(
    "/contact/:contactId",
    activityController.getActivityBycontactId
)

//related view - fetch activity by lead Id
activityRouter.post(
    "/lead/:leadId",
    activityController.getActivityByleadId
)

//related view - fetch activity by opportunity Id
activityRouter.post(
    "/opportunity/:opportunityId",
    activityController.getActivityByOpportunityId
)

activityRouter.put(
    "/:activityId",
    bodySchemaValidator(activitySchema),
    activityController.updateActivity
);

activityRouter.delete(
    "/delete-activity/:activityId",
    hasPermission([roleNames.ADMIN]),
    activityController.deleteActivity
);

activityRouter.post(
    "/bulk-delete",
    hasPermission([roleNames.ADMIN]),
    bodySchemaValidator(bulkDeleteActivitySchema),
    activityController.bulkDeleteActivity
)

export default activityRouter;