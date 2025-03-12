import { Request, Response } from "express";
import { errorHandler } from "../common/errors";
import { makeResponse } from "../common/utils";
import { AppDataSource } from "../data-source";
import CustomPlanRequestServices from "../services/customPlanRequest.service";

const customPlanRequestService = new CustomPlanRequestServices();
class CustomPlanRequestController {
  createCustomPlanRequest = async (request: Request, response: Response) => {
    try {
      const customPlanRequest = await AppDataSource.transaction(
        async (transactionEntityManager) => {
          return await customPlanRequestService.addCustomPlanRequest(
            transactionEntityManager,
            request.body
          );
        }
      );
      if (!customPlanRequest) {
        return makeResponse(
          response,
          404,
          false,
          "Custom Plan Request not created",
          null
        );
      }
      return makeResponse(
        response,
        201,
        true,
        "Custom Plan Request created successfully",
        customPlanRequest
      );
    } catch (error) {
      errorHandler(response, error);
    }
  };

  getCustomPlanRequests = async (request: Request, response: Response) => {
    try {
      const customPlanRequest =
        await customPlanRequestService.getCustomPlanRequests(request);
      if (customPlanRequest.requests.length === 0) {
        return makeResponse(
          response,
          200,
          true,
          "Custom Plan Request not found",
          null
        );
      }
      return makeResponse(
        response,
        200,
        true,
        "Custom Plan Request fetched successfully",
        customPlanRequest
      );
    } catch (error) {
      errorHandler(response, error);
    }
  };

  getCustomPlanRequestById = async (request: Request, response: Response) => {
    try {
      const customPlanRequest =
        await customPlanRequestService.getCustomPlanRequestById(
          request.params.id
        );
      return makeResponse(
        response,
        200,
        true,
        "Custom Plan Request fetched successfully",
        customPlanRequest
      );
    } catch (error) {
      errorHandler(response, error);
    }
  };

  deleteCustomPlanRequest = async (request: Request, response: Response) => {
    try {
      const customPlanRequest = await AppDataSource.transaction(
        async (transactionEntityManager) => {
          return await customPlanRequestService.deleteCustomPlanRequest(
            transactionEntityManager,
            request.params.id as string
          );
        }
      );
      return makeResponse(
        response,
        200,
        true,
        "Custom Plan Request deleted successfully",
        customPlanRequest
      );
    } catch (error) {
      errorHandler(response, error);
    }
  };

  updateCustomPlanRequest = async (request: Request, response: Response) => {
    try {
      const customPlanRequest = await AppDataSource.transaction(
        async (transactionEntityManager) => {
          return await customPlanRequestService.updateCustomPlanRequest(
            transactionEntityManager,
            request.params.id as string,
            request.body
          );
        }
      );
      return makeResponse(
        response,
        200,
        true,
        "Custom Plan Request updated successfully",
        customPlanRequest
      );
    } catch (error) {
      errorHandler(response, error);
    }
  };

  bulkDeleteRequests= async (request: Request, response: Response) => {
    try {
      const customPlanRequest = await AppDataSource.transaction(
        async (transactionEntityManager) => {
          return await customPlanRequestService.bulkDeleteRequests(
            transactionEntityManager,
            request.body.requestIds
          );
        }
      );
      return makeResponse(
        response,
        200,
        true,
        "Requests deleted successfully",
        customPlanRequest
      );
    } catch (error) {
      errorHandler(response, error);
    }
  };
}

export default CustomPlanRequestController;
