import { EntityManager, In } from "typeorm";
import { AppDataSource } from "../data-source";
import { CustomPlanRequest } from "../entity/CustomPlanRequest";
import { CustomPlanRequestSchemaType } from "../schemas/customPlanRequest.schemas";
import { encryption } from "../common/utils";
import { customPlanRequestDecryption } from "./decryption.service";
import { ResourceNotFoundError } from "../common/errors";
import { Request } from "express";
import SubscriptionEmailService from "./subscriptionEmail.service";

const subscriptionEmailService = new SubscriptionEmailService();
class CustomPlanRequestService {
  async addCustomPlanRequest(
    transactionEntityManager: EntityManager,
    payload: CustomPlanRequestSchemaType
  ) {
    const customPlanRequestRepository =
      transactionEntityManager.getRepository(CustomPlanRequest);

    const username = payload.name;
    const email = payload.email;
    const message = payload.message;

    payload.email = encryption(payload.email);
    payload.name = encryption(payload.name);
    payload.countryCode = encryption(payload.countryCode);
    payload.phone = encryption(payload.phone);
    payload.organization = encryption(payload.organization);
    payload.message = encryption(payload.message);

    const result = await customPlanRequestRepository.save(payload);

    //inform admin.
    const adminName = process.env.SUPER_ADMIN_NAME!;
    const adminEmail = process.env.SUPER_ADMIN_EMAIL!;
    console.log(adminName, adminEmail, message);

    await subscriptionEmailService.newCustomPlanRequest(
      username,
      email,
      adminEmail,
      adminName,
      message
    );
    return result;
  }

  async getCustomPlanRequests(request: Request) {
    const customPlanRequestRepository =
      AppDataSource.getRepository(CustomPlanRequest);

    const page = parseInt(request.query.page as string, 10) || 1;
    const limit = parseInt(request.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;
    const onboardingStatus = request.query.onboardingStatus as string;
    const searchText = request.query.searchText as string;
    const query = customPlanRequestRepository.createQueryBuilder("cpr");

    if (onboardingStatus != "") {
      query.where("cpr.onboardingStatus = :onboardingStatus", {
        onboardingStatus: onboardingStatus,
      });
    }

    const [result, total] = await query
      .orderBy("cpr.updatedAt", "DESC")
      .getManyAndCount();

    for (let item of result) {
      item = await customPlanRequestDecryption(item);
    }
    return {
      requests: filterRequestsWithSeachText(result, searchText).slice(
        skip,
        skip + limit
      ),
      total: total,
    };
  }

  async getCustomPlanRequestById(id: string) {
    const customPlanRequestRepository =
      AppDataSource.getRepository(CustomPlanRequest);
    const result = await customPlanRequestRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!result)
      throw new ResourceNotFoundError("Custom Plan Request not found");

    return customPlanRequestDecryption(result);
  }

  async deleteCustomPlanRequest(
    transactionEntityManager: EntityManager,
    id: string
  ) {
    const customPlanRequestRepository =
      transactionEntityManager.getRepository(CustomPlanRequest);
    const result = await customPlanRequestRepository.delete({ id: id });
    return result;
  }

  async updateCustomPlanRequest(
    transactionEntityManager: EntityManager,
    id: string,
    payload: CustomPlanRequestSchemaType
  ) {
    const customPlanRequestRepository =
      transactionEntityManager.getRepository(CustomPlanRequest);

    payload.email = encryption(payload.email);
    payload.name = encryption(payload.name);
    payload.countryCode = encryption(payload.countryCode);
    payload.phone = encryption(payload.phone);
    payload.organization = encryption(payload.organization);
    payload.message = encryption(payload.message);

    const result = await customPlanRequestRepository.update(
      { id: id },
      payload
    );
    return result;
  }

  async bulkDeleteRequests(
    transactionEntityManager: EntityManager,
    payload: string[]
  ) {
    const customPlanRequestRepository =
      transactionEntityManager.getRepository(CustomPlanRequest);
    if (!payload || payload.length === 0) {
      throw new ResourceNotFoundError("No requests found");
    }

    const requests = await customPlanRequestRepository.findBy({
      id: In(payload),
    });
    for (let request of requests) {
      await customPlanRequestRepository.softDelete({ id: request.id });
    }

    return;
  }
}

function filterRequestsWithSeachText(
  requests: CustomPlanRequest[],
  searchText: string
) {
  if (searchText != "") {
    return requests.filter((request) => {
      return (
        request.email?.includes(searchText) ||
        request.name?.includes(searchText) ||
        // request.countryCode?.includes(searchText) ||
        request.phone?.includes(searchText) ||
        request.organization?.includes(searchText)
        // request.message?.includes(searchText)
      );
    });
  }
  return requests;
}

export default CustomPlanRequestService;
