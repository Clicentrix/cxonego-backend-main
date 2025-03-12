import {Request,Response} from "express";
import { errorHandler } from "../common/errors";
import PresignerSignedURL from "../services/presigned-url.service";
import { makeResponse } from "../common/utils";


class ServicesController {
    
    async getSignedURL(request:Request,response:Response){
        try{
            const key:string = request.body.key;
            const contentType:string = request.body.contentType;
            const url = await new PresignerSignedURL().getSignedURL(key,contentType);
            return makeResponse(response, 200, true,"",{"url":url});
        }catch(error){
            errorHandler(response, error.message);
        }
    }
}
export default ServicesController;