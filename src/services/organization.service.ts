import { AppDataSource } from "../data-source";
import { EntityManager } from "typeorm";
import { v4 } from "uuid";
import { ResourceNotFoundError } from "../common/errors";
import { userInfo } from "../interfaces/types";
import { Organisation } from "../entity/Organisation";
import { encryption } from "../common/utils";
import { orgnizationDecryption, userDecryption } from "./decryption.service";
import { Request } from "express";

class OrganizationServices {
  async createOrganization(
    payload: Organisation,
    transactionEntityManager: EntityManager
  ) {
    try {
      const organizationRepository =
        await transactionEntityManager.getRepository(Organisation);
      payload.organisationId = v4();
      //Enc Dec of refer data
      if (payload.industry) payload.industry = encryption(payload.industry);
      if (payload.name) payload.name = encryption(payload.name);
      if (payload.companyToken)
        payload.companyToken = encryption(payload.companyToken);
      if (payload.contactToken)
        payload.contactToken = encryption(payload.contactToken);
      if (payload.address) payload.address = encryption(payload.address);
      if (payload.country) payload.country = encryption(payload.country);
      if (payload.state) payload.state = encryption(payload.state);
      if (payload.city) payload.city = encryption(payload.city);
      if (payload.phone) payload.phone = encryption(payload.phone);
      if (payload.email) payload.email = encryption(payload.email);
      if (payload.website) payload.website = encryption(payload.website);
      if (payload.companySize)
        payload.companySize = encryption(payload.companySize);

      const organization = await organizationRepository.save(payload);

      return await orgnizationDecryption(organization);
    } catch (error) {
      console.log(error);
      throw new Error("Fail to create organisation");
    }
  }

  async getAllOrganization(request: Request) {
    const page = parseInt(request.query.page as string, 10) || 1;
    const limit =
      request.query.limit === ""
        ? ""
        : parseInt(request.query.limit as string, 10) || 10;
    const searchText = (request.query.searchText as string) || "";

    let query = AppDataSource.getRepository(Organisation)
      .createQueryBuilder("Organisation")
      .select()
      .orderBy("Organisation.updatedAt", "DESC");

    const [organizations, total] = await query.getManyAndCount();

    for (let organization of organizations) {
      organization = await orgnizationDecryption(organization);
    }
    const filteredOrgs =
      limit === ""
        ? filterOrganisationsByQuery(organizations, searchText)
        : filterOrganisationsByQuery(organizations, searchText).slice(
            (page - 1) * limit,
            (page - 1) * limit + limit
          );
    return { organizations: filteredOrgs, total };
  }

  async getOrganizationById(
    organizationId: string,
    transactionEntityManager: EntityManager
  ) {
    let organisationRepo = await transactionEntityManager
      .getRepository(Organisation)
      .createQueryBuilder("Organisation")
      .leftJoinAndSelect("Organisation.users", "users")
      .leftJoinAndSelect("Organisation.subscriptions", "subscriptions")
      .select()
      .where("Organisation.organisationId = :organizationId", {
        organizationId: organizationId,
      });

    let organization = await organisationRepo.getOne();

    if (organization) {
      organization = await orgnizationDecryption(organization);
      for (let user of organization.users) {
        user = await userDecryption(user);
      }
    }

    return organization;
  }

  async updateOrganization(
    payload: Organisation,
    organizationId: string,
    user: userInfo,
    transactionEntityManager: EntityManager
  ) {
    try {
      const organisationRepository =
        transactionEntityManager.getRepository(Organisation);
      const organisation = await organisationRepository.findOne({
        where: { organisationId: organizationId },
      });
      if (!organisation) {
        throw new ResourceNotFoundError("Organisation not found");
      }

      payload.modifiedBy = user?.email;
      //Enc Dec of refer data
      if (payload.industry) payload.industry = encryption(payload.industry);
      if (payload.name) payload.name = encryption(payload.name);
      if (payload.address) payload.address = encryption(payload.address);
      if (payload.companyToken)
        payload.companyToken = encryption(payload.companyToken);
      if (payload.contactToken)
        payload.contactToken = encryption(payload.contactToken);
      if (payload.country) payload.country = encryption(payload.country);
      if (payload.state) payload.state = encryption(payload.state);
      if (payload.city) payload.city = encryption(payload.city);
      if (payload.phone) payload.phone = encryption(payload.phone);
      if (payload.email) payload.email = encryption(payload.email);
      if (payload.website) payload.website = encryption(payload.website);
      if (payload.companySize)
        payload.companySize = encryption(payload.companySize);

      const organisationEntity = new Organisation(payload);
      const update = await organisationRepository.update(
        organizationId,
        organisationEntity
      );

      return update;
    } catch (error) {
      return;
    }
  }

  updateOrganizationPartially = async (
    payload: Partial<Organisation>,
    organizationId: string,
    // user: userInfo,
    transactionEntityManager: EntityManager
  ) => {
    const organisationRepository =
      transactionEntityManager.getRepository(Organisation);

    const organisation = await organisationRepository.findOne({
      where: { organisationId: organizationId },
    });

    if (!organisation) {
      throw new ResourceNotFoundError("Organisation not found");
    }

    const res = await organisationRepository.update(organizationId, payload);
    return res;
  };

  async deleteOrganization(
    organizationId: string,
    user: userInfo,
    transactionEntityManager: EntityManager
  ) {
    try {
      const organizationRepository =
        transactionEntityManager.getRepository(Organisation);
      const organization = await organizationRepository.findOne({
        where: { organisationId: organizationId },
      });
      if (!organization) {
        throw new Error("Organization does not exist");
      }

      await AppDataSource.getRepository(Organisation).softDelete(
        organizationId
      );
      await organizationRepository.update(organizationId, {
        modifiedBy: user.email,
      });

      return organization;
    } catch (error) {
      throw new Error("Organization does not exist");
    }
  }
}

function filterOrganisationsByQuery(
  organisations: Organisation[],
  query: string
): Organisation[] {
  if (query === undefined || query === "") return organisations;
  const lowerCaseQuery = query.toLowerCase();

  return organisations.filter((organisation) => {
    return (
      organisation?.organisationId?.toLowerCase().includes(lowerCaseQuery) ||
      organisation?.name?.toLowerCase().includes(lowerCaseQuery) ||
      organisation?.industry?.toLowerCase().includes(lowerCaseQuery) ||
      organisation?.address?.toLowerCase().includes(lowerCaseQuery) ||
      organisation?.country?.toLowerCase().includes(lowerCaseQuery) ||
      organisation?.state?.toLowerCase().includes(lowerCaseQuery) ||
      organisation?.city?.toLowerCase().includes(lowerCaseQuery) ||
      organisation?.phone?.toLowerCase().includes(lowerCaseQuery) ||
      organisation?.email?.toLowerCase().includes(lowerCaseQuery) ||
      organisation?.website?.toLowerCase().includes(lowerCaseQuery)
    );
  });
}

export default OrganizationServices;
