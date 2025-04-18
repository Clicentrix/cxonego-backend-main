import { Request, Response } from "express";
import SuperAdminService from "../services/superAdmin.service";
import { makeResponse } from "../common/utils";
import { errorHandler } from "../common/errors";
import { AppDataSource } from "../data-source";

const superAdminService = new SuperAdminService();

class SuperAdminController {
  async login(request: Request, response: Response) {
    try {
      const result = await superAdminService.login(request.body);
      if (result == true) {
        return makeResponse(response, 200, true, "Login Successful", result);
      }
      return makeResponse(response, 200, false, "Login Failed", result);
    } catch (error) {
      errorHandler(response, error);
    }
  }

  async createSuperAdmin(request: Request, response: Response) {
    try {
      const result = await superAdminService.createSuperAdmin(request.body);
      return makeResponse(response, 200, true, "Super Admin Created", result);
    } catch (error) {
      errorHandler(response, error);
    }
  }

  async updateSuperAdmin(request: Request, response: Response) {
    try {
      const result = await AppDataSource.transaction(
        async (transactionalEntityManager) => {
          return await superAdminService.updateSuperAdmin(
            request.body,
            request.params.id,
            transactionalEntityManager
          );
        }
      );
      return makeResponse(response, 200, true, "Super Admin Updated", result);
    } catch (error) {
      errorHandler(response, error);
    }
  }

  async deleteSuperAdmin(request: Request, response: Response) {
    try {
      const result = await AppDataSource.transaction(
        async (transactionalEntityManager) => {
          return await superAdminService.deleteSuperAdmin(
            request.params.id,
            transactionalEntityManager
          );
        }
      );
      return makeResponse(response, 200, true, "Super Admin Deleted", result);
    } catch (error) {
      errorHandler(response, error);
    }
  }

  async verifyCaptcha(request: Request, response: Response) {
    try {
      console.log("Received captcha verification request from:", request.ip);
      
      // Validate request
      if (!request.body || !request.body.token) {
        return makeResponse(
          response, 
          400, 
          false, 
          "Missing captcha token in request body", 
          null
        );
      }
      
      const result = await superAdminService.verifyCaptcha(request);
      
      if (result) {
        return makeResponse(
          response, 
          200, 
          true, 
          "Captcha verification successful", 
          { verified: true }
        );
      } else {
        return makeResponse(
          response,
          400,
          false,
          "Captcha verification failed. Please try again.",
          { verified: false }
        );
      }
    } catch (error) {
      console.error("Error in captcha verification controller:", error);
      
      // Handle specific error types
      if (error.message && error.message.includes("secret key not found")) {
        return makeResponse(
          response,
          500,
          false,
          "Server configuration error. Please contact support.",
          null
        );
      }
      
      errorHandler(response, error);
    }
  }

  async disableUser(request: Request, response: Response) {
    try {
      const result = await superAdminService.disableUser(
        request.body.userId,
        request.body.isBlocked
      );
      return makeResponse(response, 200, true, "User Updated", result);
    } catch (error) {
      errorHandler(response, error);
    }
  }

  async deleteUserFromInvitedList(request: Request, response: Response) {
    try {
      const { adminId, userEmail } = request.body;
      await superAdminService.deleteUserFromInvitedList(adminId, userEmail);
      return makeResponse(response, 200, true, "User Deleted", "");
    } catch (error) {
      errorHandler(response, error);
    }
  }
}

export default SuperAdminController;
