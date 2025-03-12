import { Router } from "express";
import AccountController from "../controllers/account.controller";
import { bodySchemaValidator } from "../middlewares/schema.validator";
import { accountSchema, deleteByIdSchema } from "../schemas/company.schema";
import hasPermission from "../middlewares/permission.middleware";
import { roleNames } from "../common/utils";
import { uploadFileUsingMulter } from "../middlewares/file.middleware";

const accountRouter = Router();
const accountController = new AccountController();

//get all accounts
accountRouter.get("/", accountController.getAllAccounts);

accountRouter.post(
    "/getAccounts",
    accountController.getAccounts
);

//create a new account
accountRouter.post(
    "/",
    bodySchemaValidator(accountSchema),
    accountController.createAccount
);

//update account by account Id
accountRouter.put(
    "/:accountId",
    bodySchemaValidator(accountSchema),
    accountController.updateAccount
);

accountRouter.patch(
    "/update-contact/:accountId",
    bodySchemaValidator(accountSchema),
    accountController.partiallyUpdateAccount
);

//delete single account by account Id
accountRouter.delete(
    "/:accountId",
    hasPermission([roleNames.ADMIN]),
    accountController.deleteAccount
)

//delete bulk account by account Id's
accountRouter.post(
    "/bulk-delete",
    hasPermission([roleNames.ADMIN]),
    bodySchemaValidator(deleteByIdSchema),
    accountController.bulkDeleteAccount
)

//get account by account Id
accountRouter.get(
    "/:accountId",
    accountController.getAccount
)

accountRouter.post(
    "/leads/:accountId",
    accountController.leadsByAccountId
)
accountRouter.get(
    "/contacts/:accountId",
    accountController.contactByAccountId
)

accountRouter.post(
    "/upload-excel-accounts",    
    hasPermission([roleNames.ADMIN]),    
    uploadFileUsingMulter,
    accountController.UploadAccountExcel
)

//lookup get accounts by orgnizationId
accountRouter.get(
    "/lookup/orgnizationId",
    accountController.getAccountsByOrgnizationId
);

export default accountRouter;