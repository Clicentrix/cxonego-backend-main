import { RequestHandler, Request, Response } from "express";
import EmailManager from "../services/email-manager.service";
import { makeResponse } from "../common/utils";
import { ValidationFailedError, errorHandler } from "../common/errors";

class EmailManagerController {
  emailManager = new EmailManager();
  sendMail: RequestHandler = async (request: Request, response: Response) => {
    try {
      const { receivers, subject, HTMLBody } = request.body;
      if (!receivers || !subject || !HTMLBody) {
        throw new ValidationFailedError(
          `receiver,subject,HTMLBody are required`
        );
      }
      this.emailManager.sendEmail(receivers, subject, HTMLBody);
      return makeResponse(response,200,true,"email has been sent",undefined);
    } catch (error) {
        return makeResponse(
            response,400,false,"fail to send mail",error);
    }
  };
}

export default EmailManagerController;
