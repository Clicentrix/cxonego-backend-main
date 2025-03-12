import { Router } from "express";
import {EmailPOCSchema} from "../schemas/email-poc.schemas";
import { bodySchemaValidator } from "../middlewares/schema.validator";
import EmailManagerController from "../controllers/email-poc.controller";
const emailPOC=Router({ mergeParams: true });
const emailController =new EmailManagerController()
emailPOC.post(
    "/send",
    bodySchemaValidator(EmailPOCSchema),
    emailController.sendMail
 )

export default emailPOC;