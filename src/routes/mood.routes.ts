import { Router } from "express";
import MoodController from "../controllers/mood.controller";
import { bodySchemaValidator } from "../middlewares/schema.validator";
import { MoodSchemaArray } from "../schemas/mood.schemas";

const moodRouter = Router();
const moodController = new MoodController();

moodRouter.post(
    "/add",
    bodySchemaValidator(MoodSchemaArray),
    moodController.addMoodImage
);

moodRouter.get(
    "/getAllMoodImages",    
    moodController.getAllMoodImages
);

moodRouter.put(
    "/setMood",    
    moodController.setMoodOfUser
);

export default moodRouter;