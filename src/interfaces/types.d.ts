export interface CustomResponse {
  data: any;
  error: any;
  message: string;
}

export interface CustomeSuccessResponse{
  data: any;
  message: string;
  success:boolean
}

export interface JwtPayload {
  id: number;
  isAdmin: boolean;
  collegeId?: number;
}

export type RequestContext = {
  auth?: JwtPayload;
  tenantCollegeId?: number;
};

interface userInfo  {
  userId: string,
  email: string,
  emailVerified:boolean,
  role: Role[],
  auth_time: number,
  organizationId : string | null
}


import { Request } from 'express';
import { Role } from '../entity/Role';
export interface CustomRequest extends Request {
  user: userInfo; 
}



export type VerificationQuery = {
  userId:string,
  date: string
}

