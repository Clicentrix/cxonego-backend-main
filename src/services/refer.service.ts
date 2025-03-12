import { AppDataSource } from "../data-source";
import { UpdateResult, EntityManager, Repository } from "typeorm";
import { v4 } from "uuid";
import { User } from "../entity/User";
import { ResourceNotFoundError } from "../common/errors";
import { userInfo } from "../interfaces/types";
import { Refer } from "../entity/Refer";
import { Organisation } from "../entity/Organisation";
import {
  orgnizationDecryption,
  referDecryption,
  userDecryption,
} from "./decryption.service";
import { encryption } from "../common/utils";
class ReferServices {
  async getAllReferalls(userInfo: userInfo) {
    const referalls = await AppDataSource.getRepository(Refer)
      .createQueryBuilder("refer")
      .leftJoinAndSelect("refer.owner", "user")
      .leftJoinAndSelect("refer.organization", "organisation")
      .where("organisation.organisationId = :organisationId", {
        organisationId: userInfo.organizationId,
      })
      .select(["refer", "user.userId", "user.firstName", "user.lastName"])
      .orderBy("refer.updatedAt", "DESC")
      .getMany();

    for (let refer of referalls) {
      refer = await referDecryption(refer);
      refer.owner = await userDecryption(refer.owner);
    }
    return referalls;
  }

  async getReferralId(date: Date) {
    const month = String(
      date.getMonth() + 1 >= 10
        ? date.getMonth() + 1
        : "0" + (date.getMonth() + 1)
    );
    const year = String(date.getFullYear().toString()?.slice(-2));

    const lastReferral = await AppDataSource.getRepository(Refer)
      .createQueryBuilder("referEntity")
      .withDeleted()
      .select()
      .orderBy("referEntity.createdAt", "DESC")
      .getOne();
    let referNo = "00";
    const yearFromRecord = String(lastReferral?.referIdForUsers?.slice(3, 5)); //C032409,C0324010

    const referIdFromRecord = String(
      lastReferral?.referIdForUsers?.substring(5)
    );

    if (year === yearFromRecord) {
      referNo = referIdFromRecord;
    }
    const referId = "R" + month + year + "0" + (Number(referNo) + 1).toString();

    return referId;
  }

  async createRefer(
    payload: Refer,
    user: userInfo,
    transactionEntityManager: EntityManager
  ) {
    payload.referId = v4();
    const userRepo = await transactionEntityManager.getRepository(User);
    const userData = await userRepo.findOne({ where: { userId: user.userId } });
    if (userData) {
      payload.owner = userData;
    }

    const organizationRepo = AppDataSource.getRepository(Organisation);
    if (user.organizationId) {
      const orgnizationData = await organizationRepo.findOne({
        where: { organisationId: user.organizationId },
      });
      if (orgnizationData) payload.organization = orgnizationData;
    }

    /*    
        if(payload.company){
            const account = await transactionEntityManager.getRepository(Account)
            .createQueryBuilder("Account")
            .where("Account.accountId = :accountId", {accountId:payload.company})
            .getOne();
            if (account){
                payload.company = account;
            }             
        }
    */
    //Enc Dec of refer data
    if (payload.firstName) payload.firstName = encryption(payload.firstName);
    if (payload.lastName) payload.lastName = encryption(payload.lastName);
    if (payload.phone) payload.phone = encryption(payload.phone);
    if (payload.email) payload.email = encryption(payload.email);
    if (payload.referBy) payload.referBy = encryption(payload.referBy);
    if (payload.company) payload.company = encryption(payload.company);
    if (payload.description)
      payload.description = encryption(payload.description);
    if (payload.countryCode)
      payload.countryCode = encryption(payload.countryCode);
    payload.referIdForUsers = await this.getReferralId(new Date());
    //save data in refer table
    let referInstance = new Refer(payload);
    let referObj = await referInstance.save();
    if (referObj) {
      referObj = await referDecryption(referObj);
    }
    return referObj;
  }

  async updateRefer(
    payload: Refer,
    user: userInfo,
    referId: string,
    transactionEntityManager: EntityManager
  ) {
    payload.modifiedBy = user.email;

    const userRepo = AppDataSource.getRepository(User);
    const userObj: User = payload.owner;
    if (payload.owner) {
      const userData = await userRepo.findOne({
        where: { userId: userObj.userId },
      });
      if (userData) {
        payload.owner = userData as User;
      }
    }

    const referRepository = transactionEntityManager.getRepository(Refer);
    const refer = await referRepository.findOne({
      where: { referId: referId },
    });
    if (!refer) {
      throw new ResourceNotFoundError("Refer not found");
    }

    //Enc Dec of refer data
    if (payload.firstName) payload.firstName = encryption(payload.firstName);
    if (payload.lastName) payload.lastName = encryption(payload.lastName);
    if (payload.phone) payload.phone = encryption(payload.phone);
    if (payload.email) payload.email = encryption(payload.email);
    if (payload.referBy) payload.referBy = encryption(payload.referBy);
    if (payload.company) payload.company = encryption(payload.company);
    if (payload.description)
      payload.description = encryption(payload.description);
    if (payload.countryCode)
      payload.countryCode = encryption(payload.countryCode);

    const referEntity = new Refer(payload);
    const update = await referRepository.update(referId, referEntity);
    return update;
  }

  async deleteRefer(
    referId: string,
    user: userInfo,
    transactionEntityManager: EntityManager
  ) {
    const referRepository = transactionEntityManager.getRepository(Refer);
    const refer = await referRepository.findOne({
      where: { referId: referId },
    });
    if (!refer) {
      throw new ResourceNotFoundError("Refer not found");
    }

    const result = await referRepository.softDelete(referId);
    await referRepository.update(referId, { modifiedBy: user.email });

    return result;
  }

  async getRefer(referId: string, transactionEntityManager: EntityManager) {
    let referRepo = await transactionEntityManager
      .getRepository(Refer)
      .createQueryBuilder("Refer")
      .leftJoinAndSelect("Refer.owner", "user")
      .where("Refer.referId = :referId", { referId: referId });

    let referData = await referRepo.getOne();

    if (referData) {
      referData = await referDecryption(referData);
      if (referData.owner)
        referData.owner = await userDecryption(referData.owner);
    }

    return referData;
  }

  async getAllRefer(
    user: userInfo,
    search: string | undefined,
    page: number,
    limit: number,
    createdAt: string,
    updatedAt: string,
    status: string[] | undefined,
    referBy: string | undefined,
    company: string | undefined,
    _view: string | null
  ) {
    try {
      //all referal is visible to every one
      let referRepo = AppDataSource.getRepository(Refer)
        .createQueryBuilder("Refer")
        .select()
        .leftJoinAndSelect("Refer.owner", "user")
        .where("Refer.organizationId=:organizationId", {
          organizationId: user.organizationId,
        })
        .orderBy("Refer.updatedAt", "DESC");

      if (createdAt != undefined) {
        referRepo.orderBy(
          "Refer.createdAt",
          createdAt == "DESC" ? "DESC" : "ASC"
        );
      }

      if (updatedAt != undefined) {
        referRepo.orderBy(
          "Refer.updatedAt",
          updatedAt == "DESC" ? "DESC" : "ASC"
        );
      }

      if (status && status.length > 0) {
        referRepo.andWhere("Refer.status IN (:status)", { status });
      }
      //if both column encrypt then below code is not use
      /*if(referBy){                                            
                referRepo.andWhere("Refer.referBy LIKE :referBy", { referBy: `%${referBy}%` });
            }

            if(company){                                            
                referRepo.andWhere("Refer.company LIKE :company", { company: `%${company}%` });
            }*/

      const refers = await referRepo.getMany();

      for (let refer of refers) {
        refer = await referDecryption(refer);
        if (refer.owner) refer.owner = await userDecryption(refer.owner);
      }

      let searchedData: Refer[] = [];
      let skip = 0;
      if (search && refers.length > 0) {
        skip = 1;
        searchedData = await refers.filter((refer) => {
          if (
            refer.firstName
              ?.toLowerCase()
              .includes(String(search).toLowerCase()) ||
            refer.lastName
              ?.toLowerCase()
              .includes(String(search).toLowerCase()) ||
            refer.phone?.toLowerCase().includes(String(search).toLowerCase()) ||
            refer.email?.toLowerCase().includes(String(search).toLowerCase()) ||
            refer.referBy
              ?.toLowerCase()
              .includes(String(search).toLowerCase()) ||
            refer.status
              ?.toLowerCase()
              .includes(String(search).toLowerCase()) ||
            refer.description
              ?.toLowerCase()
              .includes(String(search).toLowerCase()) ||
            refer.countryCode
              ?.toLowerCase()
              .includes(String(search).toLowerCase()) ||
            refer.company?.toLowerCase().includes(String(search).toLowerCase())
          ) {
            return true;
          }
          return false;
        });
      }

      if (referBy || company) {
        skip = 1;
        searchedData = await refers.filter((refer) => {
          const matchreferBy =
            !referBy ||
            refer.referBy?.toLowerCase().includes(referBy.toLowerCase());
          const matchcompany =
            !company ||
            refer.company?.toLowerCase().includes(company.toLowerCase());
          return matchreferBy && matchcompany;
        });
      }

      let total = 0;

      if (skip == 0 && searchedData.length == 0) {
        total = refers.length;
        searchedData = refers;
      } else {
        total = searchedData.length;
      }

      searchedData = searchedData.slice((page - 1) * limit, page * limit);

      const pagination = {
        total: total,
        page: page,
        limit: limit,
        data: searchedData,
      };
      return pagination;
    } catch (error) {
      return;
    }
  }

  async bulkDeleteRefer(
    referIds: Array<string>,
    user: userInfo,
    transactionEntityManager: EntityManager
  ) {
    try {
      const referRepository = await transactionEntityManager.getRepository(
        Refer
      );
      const { referCanBeDelete, referCanNotBeDeleted } =
        await this.isReferExistsByIdToBulkdelete(
          transactionEntityManager,
          referIds
        );
      for (const referId of referCanBeDelete) {
        await referRepository.softDelete(referId);
        await referRepository.update(referId, { modifiedBy: user.email });
      }
      return {
        deleted: referCanBeDelete,
        refersNotFound: referCanNotBeDeleted,
      };
    } catch (error) {
      return;
    }
  }

  async isReferExistsByIdToBulkdelete(
    transactionEntityManager: EntityManager,
    referIds: Array<string>
  ) {
    const referRepository = transactionEntityManager.getRepository(Refer);
    const referCanNotBeDeleted: Array<string> = [];
    const referCanBeDelete: Array<string> = [];
    for (const referId of referIds) {
      const refer = await referRepository.findOne({
        where: {
          referId: referId,
        },
      });
      if (refer) {
        referCanBeDelete.push(referId);
      } else {
        referCanNotBeDeleted.push(referId);
      }
    }
    return { referCanBeDelete, referCanNotBeDeleted };
  }
}

export default ReferServices;
