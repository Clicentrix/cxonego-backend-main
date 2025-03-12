import { RequestHandler } from "express";
import { buildResponse } from "../common/utils";

class HealthController {
    check: RequestHandler = async (_req, res) => {
        return res.status(200).send(buildResponse(null, "success", null));
    };
}

export default HealthController;