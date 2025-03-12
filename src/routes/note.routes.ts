import { Router } from "express";
import { roleNames } from "../common/utils";
import NoteController from "../controllers/note.controller";
import hasPermission from "../middlewares/permission.middleware";

const noteRouter = Router();
const noteController = new NoteController();

noteRouter.get("/", noteController.getAllNotesData);

//create note
noteRouter.post("/", noteController.createNote);

//fetch all notes
noteRouter.post("/getAllNotes", noteController.getAllNotes);

//fetch notes by note Id
noteRouter.get("/:noteId", noteController.getNoteByNoteId);

//related view - fetch notes by account Id
noteRouter.post("/account/:accountId", noteController.getNoteByaccountId);

//related view - fetch notes by contact Id
noteRouter.post("/contact/:contactId", noteController.getNoteBycontactId);

//related view - fetch notes by lead Id
noteRouter.post("/lead/:leadId", noteController.getNoteByleadId);

//related view - fetch notes by opportunity Id
noteRouter.post(
  "/opportunity/:opportunityId",
  noteController.getNoteByOpportunityId
);

//related view - fetch notes by activity Id
noteRouter.post("/activity/:activityId", noteController.getNoteByActivityId);

//update note by note id
noteRouter.put("/:noteId", noteController.updateNote);

//bulk delete
noteRouter.post(
  "/bulk-delete",
  hasPermission([roleNames.ADMIN]),
  noteController.bulkDeleteNote
);

export default noteRouter;
