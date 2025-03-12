import { Router } from "express";
import { bodySchemaValidator } from "../middlewares/schema.validator";
import { CalenderSchema } from "../schemas/calender.schemas";
import CalenderController from "../controllers/calender.controller";

const calenderRouter = Router();
const calenderController = new CalenderController();

calenderRouter.get("/", calenderController.getAllAppointments);

calenderRouter.post(
  "/create-calender",
  bodySchemaValidator(CalenderSchema),
  calenderController.createCalender
);

calenderRouter.put(
  "/update-calender/:appointmentId",
  bodySchemaValidator(CalenderSchema),
  calenderController.updateCalender
);

calenderRouter.delete(
  "/delete-calender/:appointmentId",
  calenderController.deleteCalender
);

calenderRouter.get("/getAppointments", calenderController.getAppointments);

calenderRouter.get("/users/", calenderController.getAllUserDataByOrgId);

calenderRouter.get("/:appointmentId", calenderController.getAppointmentById);

export default calenderRouter;
