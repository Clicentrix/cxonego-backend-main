import { Request } from "express";

export interface JwtPayload {
  id: number;
}

export type RequestContext = {
  auth?: JwtPayload;
};

export type CustomRequest = Request & { context: RequestContext };
