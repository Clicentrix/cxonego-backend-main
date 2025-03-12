import { Router } from "express";
import DashboardController from "../controllers/dashboard.controller";

const dashboardRouter = Router();
const dashboardController = new DashboardController();

dashboardRouter.get(
    "/get-status-lead-counts",
    dashboardController.getAllLeadStatusCounts
);

dashboardRouter.get(
    "/get-status-lead-percentage",
    dashboardController.getAllLeadStatusPercentage
);

dashboardRouter.get(
    "/qualified-lead-rate",
    dashboardController.qualifiedLeadRate
);

dashboardRouter.get(
    "/avg-est-lead-price",
    dashboardController.getAvgAndEstPrice
);

dashboardRouter.get(
    "/leads",
    dashboardController.getLeadsData
);

//All lead data for dashboard in one api 
dashboardRouter.post(
    "/leads-all",
    dashboardController.getLeadsDashboardData
);

//All opportunity data for dashboard  in one api 
dashboardRouter.post(
    "/opportunity-all",
    dashboardController.getOpportunityDashboardData
);


//All activity data for dashboard in one api 
dashboardRouter.post(
    "/activity-all",
    dashboardController.getActivityDashboardData
);

export default dashboardRouter;