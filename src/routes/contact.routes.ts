import { Router } from "express";
import ContactController from "../controllers/contact.controller";
import { bodySchemaValidator } from "../middlewares/schema.validator";
import { ContactSchema, ContactSchemaPartial } from "../schemas/contact.schema";
import { roleNames } from "../common/utils";
import hasPermission from "../middlewares/permission.middleware";
import { uploadFileUsingMulter } from "../middlewares/file.middleware";

const contactRouter = Router();
const contactController = new ContactController();

contactRouter.get("/", contactController.getAllContacts);

contactRouter.post("/getContacts", contactController.getContacts);

contactRouter.post(
  "/",
  bodySchemaValidator(ContactSchema),
  contactController.createContact
);

contactRouter.put(
  "/:contactId",
  bodySchemaValidator(ContactSchema),
  contactController.updateContact
);

contactRouter.patch(
  "/:contactId",
  bodySchemaValidator(ContactSchemaPartial),
  contactController.partiallyUpdateContact
);

contactRouter.delete("/:contactId", contactController.deleteContact);

contactRouter.get("/:contactId", contactController.getContact);
contactRouter.post(
  "/bulk-delete",
  hasPermission([roleNames.ADMIN]),
  //bodySchemaValidator(deleteByIdSchema),
  contactController.bulkDeleteContact
);

contactRouter.post(
  "/upload-excel-contacts",
  hasPermission([roleNames.ADMIN]),
  uploadFileUsingMulter,
  contactController.UploadContactExcel
);

//related view contact by account Id working
contactRouter.post(
  "/account/:accountId",
  contactController.getContactByAccountId
);

//lookup get contacts by orgnizationId and ownerId
contactRouter.get(
  "/lookup/orgnizationId-ownerId",
  contactController.getContactsByOrgnizationIdAndOwnerId
);

contactRouter.post(
  "/upload-vcf-contacts",
  hasPermission([roleNames.ADMIN]),
  uploadFileUsingMulter,
  contactController.uploadContactsUsingVCF
);

export default contactRouter;
