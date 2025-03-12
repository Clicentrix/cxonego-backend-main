import { AppDataSource } from "../data-source";
import { EntityManager, UpdateResult } from "typeorm";
import { Lead } from "../entity/Lead";
import { Account } from "../entity/Account";
import { encryption, roleNames } from "../common/utils";
import { decrypt } from "../common/utils";
import { Contact } from "../entity/Contact";
import {
  accountDecryption,
  activityDecryption,
  contactDecryption,
  leadDecryption,
  opportunityDecryption,
  orgnizationDecryption,
  userDecryption,
} from "./decryption.service";
import { DateRangeParamsType } from "../schemas/comman.schemas";
import { Role } from "../entity/Role";
import { Activity } from "../entity/Activity";
import { Oppurtunity } from "../entity/Oppurtunity";
import { User } from "../entity/User";
import { userInfo } from "../interfaces/types";
import { Organisation } from "../entity/Organisation";
import { v4 } from "uuid";
import { ActivityRemainder } from "../entity/ActivityReminder";
import moment = require("moment");

class ActivityService {
  async getAllActivity(userInfo: userInfo) {
    const activities = await AppDataSource.getRepository(Activity)
      .createQueryBuilder("activity")
      .leftJoinAndSelect("activity.owner", "user")
      .leftJoinAndSelect("activity.organization", "organisation")
      // .where("user.userId = :userId", { userId: userInfo.userId })
      .where("organisation.organisationId = :organizationId", {
        organizationId: userInfo.organizationId,
      })
      .select(["activity", "user.userId", "user.firstName", "user.lastName"])
      .orderBy("activity.updatedAt", "DESC")
      .getMany();

    for (let activity of activities) {
      try {
        activity = await activityDecryption(activity);
        activity.owner = await userDecryption(activity.owner);
      } catch (error) {
        console.log("error while decrypting this activity");
      }
    }

    return activities;
  }

  async createActivity(
    payload: Activity,
    user: userInfo,
    transactionEntityManager: EntityManager
  ) {
    const userRepo = AppDataSource.getRepository(User);
    const userData = await userRepo.findOne({ where: { userId: user.userId } });
    if (userData) {
      payload.owner = userData as User;
    }

    const organizationRepo = AppDataSource.getRepository(Organisation);
    if (user.organizationId) {
      const orgnizationData = await organizationRepo.findOne({
        where: { organisationId: user.organizationId },
      });
      if (orgnizationData) payload.organization = orgnizationData;
    }

    if (payload.company) {
      const account = await transactionEntityManager
        .getRepository(Account)
        .createQueryBuilder("Account")
        .where("Account.accountId = :accountId", { accountId: payload.company })
        .getOne();
      if (account) payload.company = account;
    }

    if (payload.contact) {
      const contact = await transactionEntityManager
        .getRepository(Contact)
        .createQueryBuilder("contact")
        .where("contact.contactId = :contactId", {
          contactId: String(payload.contact),
        })
        .getOne();
      if (contact) payload.contact = contact;
    }

    if (payload.lead) {
      const lead = await transactionEntityManager
        .getRepository(Lead)
        .createQueryBuilder("Lead")
        .where("Lead.leadId = :lead", { lead: payload.lead })
        .getOne();
      if (lead) payload.lead = lead;
    }

    if (payload.opportunity) {
      const oppurtunitydata = await transactionEntityManager
        .getRepository(Oppurtunity)
        .createQueryBuilder("Oppurtunity")
        .where("Oppurtunity.opportunityId = :opportunityId", {
          opportunityId: payload.opportunity,
        })
        .getOne();
      if (oppurtunitydata) payload.opportunity = oppurtunitydata;
    }

    //Enc Dec code for activity table
    if (payload.subject) payload.subject = encryption(payload.subject);
    if (payload.description)
      payload.description = encryption(payload.description);

    const dueDate = payload.dueDate;
    const targetDate = new Date(dueDate);
    const halfHourBefore = new Date(targetDate.getTime() - 30 * 60 * 1000); // minus 30 min from time for reminder
    payload.notificationDateTime = halfHourBefore;
    const activity = new Activity({
      ...payload,
      activityId: await this.getActivityId(new Date()),
    } as Activity);

    let activityData = await activity.save();

    //Notification code

    const activityReminderPayload = {
      notificationId: v4(),
      fcmWebToken: activityData?.owner?.fcmWebToken,
      fcmAndroidToken: activityData?.owner?.fcmAndroidToken,
      notificationDateTime: activityData?.notificationDateTime,
      activitySubject: activityData?.subject,
      description: activityData.description,
      activity: activityData,
    } as ActivityRemainder;

    const activityReminder = new ActivityRemainder(activityReminderPayload);
    await activityReminder.save();

    return activityData;
  }

  async getActivityId(date: Date) {
    const month = String(
      date.getMonth() + 1 >= 10
        ? date.getMonth() + 1
        : "0" + (date.getMonth() + 1)
    );
    const year = String(date.getFullYear().toString().slice(-2));
    const lastActivity = await AppDataSource.getRepository(Activity)
      .createQueryBuilder("Activity")
      .withDeleted()
      .select()
      .orderBy("Activity.createdAt", "DESC")
      .getOne();

    let activityNo = "00";
    const yearFromRecord = String(lastActivity?.activityId.slice(4, 6));
    const activityIdFromRecord = String(lastActivity?.activityId.substring(6));

    if (year === yearFromRecord) {
      activityNo = activityIdFromRecord;
    }
    const activityId =
      "AT" + month + year + "0" + (Number(activityNo) + 1).toString();

    return activityId;
  }

  async getActivityByactivityId(
    userId: string,
    role: Role[],
    activityId: string
  ) {
    try {
      let activityRepo;
      if (role.length === 1 && role[0].roleName === roleNames.SALESPERSON) {
        activityRepo = await AppDataSource.getRepository(Activity)
          .createQueryBuilder("Activity")
          .select()
          .leftJoinAndSelect("Activity.company", "Account")
          .leftJoinAndSelect("Activity.contact", "Contact")
          .leftJoinAndSelect("Activity.lead", "Lead")
          .leftJoinAndSelect("Activity.opportunity", "Oppurtunity")
          .leftJoinAndSelect("Activity.owner", "user")
          .where("Activity.activityId = :activityId", { activityId })
          .andWhere("Activity.ownerId = :ownerId", { ownerId: userId })
          .orderBy("Activity.updatedAt", "DESC");
      } else {
        activityRepo = await AppDataSource.getRepository(Activity)
          .createQueryBuilder("Activity")
          .select()
          .leftJoinAndSelect("Activity.company", "Account")
          .leftJoinAndSelect("Activity.contact", "Contact")
          .leftJoinAndSelect("Activity.lead", "Lead")
          .leftJoinAndSelect("Activity.opportunity", "Oppurtunity")
          .leftJoinAndSelect("Activity.owner", "user")
          .where("Activity.activityId = :activityId", { activityId })
          .orderBy("Activity.updatedAt", "DESC");
      }

      let activity = await activityRepo.getOne();

      if (activity) {
        activity =
          activity !== null && activity !== undefined
            ? await activityDecryption(activity)
            : activity;

        activity.lead =
          activity.lead !== null && activity.lead !== undefined
            ? await leadDecryption(activity.lead)
            : activity.lead;

        activity.company =
          activity.company !== null && activity.company !== undefined
            ? await accountDecryption(activity.company as Account)
            : activity.company;

        activity.contact =
          activity.contact !== null && activity.contact !== undefined
            ? await contactDecryption(activity.contact as Contact)
            : activity.contact;

        activity.opportunity =
          activity.opportunity !== null && activity.opportunity !== undefined
            ? await opportunityDecryption(activity.opportunity as Oppurtunity)
            : activity.opportunity;

        activity.owner =
          activity.owner !== null && activity.owner !== undefined
            ? await userDecryption(activity.owner as User)
            : activity.owner;
      }

      return activity;
    } catch (error) {
      return;
    }
  }

  async getActivityByaccountId(
    userId: string,
    role: Role[],
    search: string | undefined,
    page: number = 1,
    limit: number = 7,
    createdAt: string,
    updatedAt: string,
    dateRange: DateRangeParamsType,
    activityType: string[] | undefined,
    activityStatus: string[] | undefined,
    activityPriority: string[] | undefined,
    startDate: string,
    dueDate: string,
    actualStartDate: string,
    actualEndDate: string,
    accountId: string,
    organizationId: string | null
  ) {
    try {
      let activityRepo;
      if (role.length === 1 && role[0].roleName === roleNames.SALESPERSON) {
        activityRepo = await AppDataSource.getRepository(Activity)
          .createQueryBuilder("Activity")
          .select()
          .leftJoinAndSelect("Activity.company", "Account")
          .leftJoinAndSelect("Activity.contact", "Contact")
          .leftJoinAndSelect("Activity.lead", "Lead")
          .leftJoinAndSelect("Activity.opportunity", "Oppurtunity")
          .leftJoinAndSelect("Activity.owner", "user")
          .where("Activity.accountId = :accountId", { accountId })
          .andWhere("Activity.ownerId = :ownerId", { ownerId: userId })
          .andWhere("Activity.organizationId=:organizationId", {
            organizationId: organizationId,
          })
          .orderBy("Activity.updatedAt", "DESC");
      } else {
        activityRepo = await AppDataSource.getRepository(Activity)
          .createQueryBuilder("Activity")
          .select()
          .leftJoinAndSelect("Activity.company", "Account")
          .leftJoinAndSelect("Activity.contact", "Contact")
          .leftJoinAndSelect("Activity.lead", "Lead")
          .leftJoinAndSelect("Activity.opportunity", "Oppurtunity")
          .leftJoinAndSelect("Activity.owner", "user")
          .where("Activity.accountId = :accountId", { accountId })
          .andWhere("Activity.organizationId=:organizationId", {
            organizationId: organizationId,
          })
          .orderBy("Activity.updatedAt", "DESC");
      }

      if (activityType && activityType.length > 0) {
        activityRepo.andWhere("Activity.activityType IN (:activityType)", {
          activityType,
        });
      }

      if (activityStatus && activityStatus.length > 0) {
        activityRepo.andWhere("Activity.activityStatus IN (:activityStatus)", {
          activityStatus,
        });
      }

      if (activityPriority && activityPriority.length > 0) {
        activityRepo.andWhere(
          "Activity.activityPriority IN (:activityPriority)",
          { activityPriority }
        );
      }

      if (createdAt != undefined) {
        activityRepo.orderBy(
          "Activity.createdAt",
          createdAt == "DESC" ? "DESC" : "ASC"
        );
      }

      if (updatedAt != undefined) {
        activityRepo.orderBy(
          "Activity.updatedAt",
          updatedAt == "DESC" ? "DESC" : "ASC"
        );
      }

      if (startDate != undefined) {
        activityRepo.orderBy(
          "Activity.startDate",
          startDate == "DESC" ? "DESC" : "ASC"
        );
      }

      if (dueDate != undefined) {
        activityRepo.orderBy(
          "Activity.dueDate",
          dueDate == "DESC" ? "DESC" : "ASC"
        );
      }

      if (actualStartDate != undefined) {
        activityRepo.orderBy(
          "Activity.actualStartDate",
          actualStartDate == "DESC" ? "DESC" : "ASC"
        );
      }

      if (actualEndDate != undefined) {
        activityRepo.orderBy(
          "Activity.actualEndDate",
          actualEndDate == "DESC" ? "DESC" : "ASC"
        );
      }

      if (dateRange) {
        if (dateRange.startDate && dateRange.endDate) {
          activityRepo.andWhere(
            "DATE(Activity.updatedAt) BETWEEN :startDate AND :endDate",
            {
              startDate: dateRange.startDate,
              endDate: dateRange.endDate,
            }
          );
        }
      }

      const activities = await activityRepo.getMany();

      let searchedData: Activity[] = [];

      for (let activity of activities) {
        activity =
          activity !== null && activity !== undefined
            ? await activityDecryption(activity)
            : activity;

        activity.lead =
          activity.lead !== null && activity.lead !== undefined
            ? await leadDecryption(activity.lead)
            : activity.lead;

        activity.company =
          activity.company !== null && activity.company !== undefined
            ? await accountDecryption(activity.company as Account)
            : activity.company;

        activity.contact =
          activity.contact !== null && activity.contact !== undefined
            ? await contactDecryption(activity.contact as Contact)
            : activity.contact;

        activity.opportunity =
          activity.opportunity !== null && activity.opportunity !== undefined
            ? await opportunityDecryption(activity.opportunity as Oppurtunity)
            : activity.opportunity;

        activity.owner =
          activity.owner !== null && activity.owner !== undefined
            ? await userDecryption(activity.owner as User)
            : activity.owner;
      }

      let skip = 0;
      if (search) {
        skip = 1;

        searchedData = await activities.filter((activity) => {
          if (
            activity?.activityPriority
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.activityStatus
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.activityType
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.subject
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.startDate
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.dueDate
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.actualStartDate
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.description
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.actualEndDate
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.owner?.firstName
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.owner?.lastName
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase())
          ) {
            return true;
          }
        });
      }

      if (searchedData.length === 0 && skip === 0) {
        searchedData = activities;
      }
      const total = searchedData.length;
      searchedData = searchedData.slice((page - 1) * limit, page * limit);

      const pagination = {
        total,
        page: page,
        limit: limit,
        data: searchedData,
      };
      return pagination;
    } catch (error) {
      return;
    }
  }

  async getActivityBycontactId(
    userId: string,
    role: Role[],
    search: string | undefined,
    page: number = 1,
    limit: number = 7,
    createdAt: string,
    updatedAt: string,
    dateRange: DateRangeParamsType,
    activityType: string[] | undefined,
    activityStatus: string[] | undefined,
    activityPriority: string[] | undefined,
    startDate: string,
    dueDate: string,
    actualStartDate: string,
    actualEndDate: string,
    contactId: string,
    organizationId: string | null
  ) {
    try {
      let activityRepo;
      if (role.length === 1 && role[0].roleName === roleNames.SALESPERSON) {
        activityRepo = await AppDataSource.getRepository(Activity)
          .createQueryBuilder("Activity")
          .select()
          .leftJoinAndSelect("Activity.company", "Account")
          .leftJoinAndSelect("Activity.contact", "Contact")
          .leftJoinAndSelect("Activity.lead", "Lead")
          .leftJoinAndSelect("Activity.opportunity", "Oppurtunity")
          .leftJoinAndSelect("Activity.owner", "user")
          .where("Activity.contactId = :contactId", { contactId: contactId })
          .andWhere("Activity.ownerId = :ownerId", { ownerId: userId })
          .andWhere("Activity.organizationId=:organizationId", {
            organizationId: organizationId,
          })
          .orderBy("Activity.updatedAt", "DESC");
      } else {
        activityRepo = await AppDataSource.getRepository(Activity)
          .createQueryBuilder("Activity")
          .select()
          .leftJoinAndSelect("Activity.company", "Account")
          .leftJoinAndSelect("Activity.contact", "Contact")
          .leftJoinAndSelect("Activity.lead", "Lead")
          .leftJoinAndSelect("Activity.opportunity", "Oppurtunity")
          .leftJoinAndSelect("Activity.owner", "user")
          .where("Activity.contactId = :contactId", { contactId: contactId })
          .andWhere("Activity.organizationId=:organizationId", {
            organizationId: organizationId,
          })
          .orderBy("Activity.updatedAt", "DESC");
      }

      if (activityType && activityType.length > 0) {
        activityRepo.andWhere("Activity.activityType IN (:activityType)", {
          activityType,
        });
      }

      if (activityStatus && activityStatus.length > 0) {
        activityRepo.andWhere("Activity.activityStatus IN (:activityStatus)", {
          activityStatus,
        });
      }

      if (activityPriority && activityPriority.length > 0) {
        activityRepo.andWhere(
          "Activity.activityPriority IN (:activityPriority)",
          { activityPriority }
        );
      }

      if (createdAt != undefined) {
        activityRepo.orderBy(
          "Activity.createdAt",
          createdAt == "DESC" ? "DESC" : "ASC"
        );
      }

      if (updatedAt != undefined) {
        activityRepo.orderBy(
          "Activity.updatedAt",
          updatedAt == "DESC" ? "DESC" : "ASC"
        );
      }

      if (startDate != undefined) {
        activityRepo.orderBy(
          "Activity.startDate",
          startDate == "DESC" ? "DESC" : "ASC"
        );
      }

      if (dueDate != undefined) {
        activityRepo.orderBy(
          "Activity.dueDate",
          dueDate == "DESC" ? "DESC" : "ASC"
        );
      }

      if (actualStartDate != undefined) {
        activityRepo.orderBy(
          "Activity.actualStartDate",
          actualStartDate == "DESC" ? "DESC" : "ASC"
        );
      }

      if (actualEndDate != undefined) {
        activityRepo.orderBy(
          "Activity.actualEndDate",
          actualEndDate == "DESC" ? "DESC" : "ASC"
        );
      }

      if (dateRange) {
        if (dateRange.startDate && dateRange.endDate) {
          activityRepo.andWhere(
            "DATE(Activity.updatedAt) BETWEEN :startDate AND :endDate",
            {
              startDate: dateRange.startDate,
              endDate: dateRange.endDate,
            }
          );
        }
      }

      const activities = await activityRepo.getMany();

      let searchedData: Activity[] = [];

      for (let activity of activities) {
        activity =
          activity !== null && activity !== undefined
            ? await activityDecryption(activity)
            : activity;

        activity.lead =
          activity.lead !== null && activity.lead !== undefined
            ? await leadDecryption(activity.lead)
            : activity.lead;

        activity.company =
          activity.company !== null && activity.company !== undefined
            ? await accountDecryption(activity.company as Account)
            : activity.company;

        activity.contact =
          activity.contact !== null && activity.contact !== undefined
            ? await contactDecryption(activity.contact as Contact)
            : activity.contact;

        activity.opportunity =
          activity.opportunity !== null && activity.opportunity !== undefined
            ? await opportunityDecryption(activity.opportunity as Oppurtunity)
            : activity.opportunity;

        activity.owner =
          activity.owner !== null && activity.owner !== undefined
            ? await userDecryption(activity.owner as User)
            : activity.owner;
      }

      let skip = 0;
      if (search) {
        skip = 1;
        searchedData = await activities.filter((activity) => {
          if (
            activity?.activityPriority
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.activityStatus
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.activityType
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.subject
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.startDate
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.dueDate
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.actualStartDate
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.description
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.actualEndDate
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.owner?.firstName
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.owner?.lastName
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase())
          ) {
            return true;
          }
        });
      }

      if (searchedData.length === 0 && skip === 0) {
        searchedData = activities;
      }
      const total = searchedData.length;
      searchedData = searchedData.slice((page - 1) * limit, page * limit);
      const pagination = {
        total,
        page: page,
        limit: limit,
        data: searchedData,
      };
      return pagination;
    } catch (error) {
      return;
    }
  }

  async getActivityByleadId(
    userId: string,
    role: Role[],
    search: string | undefined,
    page: number = 1,
    limit: number = 7,
    createdAt: string,
    updatedAt: string,
    dateRange: DateRangeParamsType,
    activityType: string[] | undefined,
    activityStatus: string[] | undefined,
    activityPriority: string[] | undefined,
    startDate: string,
    dueDate: string,
    actualStartDate: string,
    actualEndDate: string,
    leadId: string,
    organizationId: string | null
  ) {
    try {
      let activityRepo;
      if (role.length === 1 && role[0].roleName === roleNames.SALESPERSON) {
        activityRepo = await AppDataSource.getRepository(Activity)
          .createQueryBuilder("Activity")
          .select()
          .leftJoinAndSelect("Activity.company", "Account")
          .leftJoinAndSelect("Activity.contact", "Contact")
          .leftJoinAndSelect("Activity.lead", "Lead")
          .leftJoinAndSelect("Activity.opportunity", "Oppurtunity")
          .leftJoinAndSelect("Activity.owner", "user")
          .where("Activity.leadId = :leadId", { leadId: leadId })
          .andWhere("Activity.ownerId = :ownerId", { ownerId: userId })
          .andWhere("Activity.organizationId=:organizationId", {
            organizationId: organizationId,
          })
          .orderBy("Activity.updatedAt", "DESC");
      } else {
        activityRepo = await AppDataSource.getRepository(Activity)
          .createQueryBuilder("Activity")
          .select()
          .leftJoinAndSelect("Activity.company", "Account")
          .leftJoinAndSelect("Activity.contact", "Contact")
          .leftJoinAndSelect("Activity.lead", "Lead")
          .leftJoinAndSelect("Activity.opportunity", "Oppurtunity")
          .leftJoinAndSelect("Activity.owner", "user")
          .where("Activity.leadId = :leadId", { leadId: leadId })
          .andWhere("Activity.organizationId=:organizationId", {
            organizationId: organizationId,
          })
          .orderBy("Activity.updatedAt", "DESC");
      }

      if (activityType && activityType.length > 0) {
        activityRepo.andWhere("Activity.activityType IN (:activityType)", {
          activityType,
        });
      }

      if (activityStatus && activityStatus.length > 0) {
        activityRepo.andWhere("Activity.activityStatus IN (:activityStatus)", {
          activityStatus,
        });
      }

      if (activityPriority && activityPriority.length > 0) {
        activityRepo.andWhere(
          "Activity.activityPriority IN (:activityPriority)",
          { activityPriority }
        );
      }

      if (createdAt != undefined) {
        activityRepo.orderBy(
          "Activity.createdAt",
          createdAt == "DESC" ? "DESC" : "ASC"
        );
      }

      if (updatedAt != undefined) {
        activityRepo.orderBy(
          "Activity.updatedAt",
          updatedAt == "DESC" ? "DESC" : "ASC"
        );
      }

      if (startDate != undefined) {
        activityRepo.orderBy(
          "Activity.startDate",
          startDate == "DESC" ? "DESC" : "ASC"
        );
      }

      if (dueDate != undefined) {
        activityRepo.orderBy(
          "Activity.dueDate",
          dueDate == "DESC" ? "DESC" : "ASC"
        );
      }

      if (actualStartDate != undefined) {
        activityRepo.orderBy(
          "Activity.actualStartDate",
          actualStartDate == "DESC" ? "DESC" : "ASC"
        );
      }

      if (actualEndDate != undefined) {
        activityRepo.orderBy(
          "Activity.actualEndDate",
          actualEndDate == "DESC" ? "DESC" : "ASC"
        );
      }

      if (dateRange) {
        if (dateRange.startDate && dateRange.endDate) {
          activityRepo.andWhere(
            "DATE(Activity.updatedAt) BETWEEN :startDate AND :endDate",
            {
              startDate: dateRange.startDate,
              endDate: dateRange.endDate,
            }
          );
        }
      }

      const activities = await activityRepo.getMany();

      let searchedData: Activity[] = [];

      for (let activity of activities) {
        activity =
          activity !== null && activity !== undefined
            ? await activityDecryption(activity)
            : activity;

        activity.lead =
          activity.lead !== null && activity.lead !== undefined
            ? await leadDecryption(activity.lead)
            : activity.lead;

        activity.company =
          activity.company !== null && activity.company !== undefined
            ? await accountDecryption(activity.company as Account)
            : activity.company;

        activity.contact =
          activity.contact !== null && activity.contact !== undefined
            ? await contactDecryption(activity.contact as Contact)
            : activity.contact;

        activity.opportunity =
          activity.opportunity !== null && activity.opportunity !== undefined
            ? await opportunityDecryption(activity.opportunity as Oppurtunity)
            : activity.opportunity;

        activity.owner =
          activity.owner !== null && activity.owner !== undefined
            ? await userDecryption(activity.owner as User)
            : activity.owner;
      }

      let skip = 0;
      if (search) {
        skip = 1;

        searchedData = await activities.filter((activity) => {
          if (
            activity?.activityPriority
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.activityStatus
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.activityType
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.subject
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.startDate
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.dueDate
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.actualStartDate
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.description
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.actualEndDate
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.owner?.firstName
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.owner?.lastName
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase())
          ) {
            return true;
          }
        });
      }

      if (searchedData.length === 0 && skip === 0) {
        searchedData = activities;
      }
      const total = searchedData.length;
      searchedData = searchedData.slice((page - 1) * limit, page * limit);
      const pagination = {
        total,
        page: page,
        limit: limit,
        data: searchedData,
      };
      return pagination;
    } catch (error) {
      return;
    }
  }

  async getActivityByOpportunityId(
    userId: string,
    role: Role[],
    search: string | undefined,
    page: number = 1,
    limit: number = 7,
    createdAt: string,
    updatedAt: string,
    dateRange: DateRangeParamsType,
    activityType: string[] | undefined,
    activityStatus: string[] | undefined,
    activityPriority: string[] | undefined,
    startDate: string,
    dueDate: string,
    actualStartDate: string,
    actualEndDate: string,
    opportunityId: string,
    organizationId: string | null
  ) {
    try {
      let activityRepo;
      if (role.length === 1 && role[0].roleName === roleNames.SALESPERSON) {
        activityRepo = await AppDataSource.getRepository(Activity)
          .createQueryBuilder("Activity")
          .select()
          .leftJoinAndSelect("Activity.company", "Account")
          .leftJoinAndSelect("Activity.contact", "Contact")
          .leftJoinAndSelect("Activity.lead", "Lead")
          .leftJoinAndSelect("Activity.opportunity", "Oppurtunity")
          .leftJoinAndSelect("Activity.owner", "user")
          .where("Activity.opportunityId = :opportunityId", {
            opportunityId: opportunityId,
          })
          .andWhere("Activity.ownerId = :ownerId", { ownerId: userId })
          .andWhere("Activity.organizationId=:organizationId", {
            organizationId: organizationId,
          })
          .orderBy("Activity.updatedAt", "DESC");
      } else {
        activityRepo = await AppDataSource.getRepository(Activity)
          .createQueryBuilder("Activity")
          .select()
          .leftJoinAndSelect("Activity.company", "Account")
          .leftJoinAndSelect("Activity.contact", "Contact")
          .leftJoinAndSelect("Activity.lead", "Lead")
          .leftJoinAndSelect("Activity.opportunity", "Oppurtunity")
          .leftJoinAndSelect("Activity.owner", "user")
          .where("Activity.opportunityId = :opportunityId", {
            opportunityId: opportunityId,
          })
          .andWhere("Activity.organizationId=:organizationId", {
            organizationId: organizationId,
          })
          .orderBy("Activity.updatedAt", "DESC");
      }

      if (activityType && activityType.length > 0) {
        activityRepo.andWhere("Activity.activityType IN (:activityType)", {
          activityType,
        });
      }

      if (activityStatus && activityStatus.length > 0) {
        activityRepo.andWhere("Activity.activityStatus IN (:activityStatus)", {
          activityStatus,
        });
      }

      if (activityPriority && activityPriority.length > 0) {
        activityRepo.andWhere(
          "Activity.activityPriority IN (:activityPriority)",
          { activityPriority }
        );
      }

      if (createdAt != undefined) {
        activityRepo.orderBy(
          "Activity.createdAt",
          createdAt == "DESC" ? "DESC" : "ASC"
        );
      }

      if (updatedAt != undefined) {
        activityRepo.orderBy(
          "Activity.updatedAt",
          updatedAt == "DESC" ? "DESC" : "ASC"
        );
      }

      if (startDate != undefined) {
        activityRepo.orderBy(
          "Activity.startDate",
          startDate == "DESC" ? "DESC" : "ASC"
        );
      }

      if (dueDate != undefined) {
        activityRepo.orderBy(
          "Activity.dueDate",
          dueDate == "DESC" ? "DESC" : "ASC"
        );
      }

      if (actualStartDate != undefined) {
        activityRepo.orderBy(
          "Activity.actualStartDate",
          actualStartDate == "DESC" ? "DESC" : "ASC"
        );
      }

      if (actualEndDate != undefined) {
        activityRepo.orderBy(
          "Activity.actualEndDate",
          actualEndDate == "DESC" ? "DESC" : "ASC"
        );
      }

      if (dateRange) {
        if (dateRange.startDate && dateRange.endDate) {
          activityRepo.andWhere(
            "DATE(Activity.updatedAt) BETWEEN :startDate AND :endDate",
            {
              startDate: dateRange.startDate,
              endDate: dateRange.endDate,
            }
          );
        }
      }

      const activities = await activityRepo.getMany();

      let searchedData: Activity[] = [];

      for (let activity of activities) {
        activity =
          activity !== null && activity !== undefined
            ? await activityDecryption(activity)
            : activity;

        activity.lead =
          activity.lead !== null && activity.lead !== undefined
            ? await leadDecryption(activity.lead)
            : activity.lead;

        activity.company =
          activity.company !== null && activity.company !== undefined
            ? await accountDecryption(activity.company as Account)
            : activity.company;

        activity.contact =
          activity.contact !== null && activity.contact !== undefined
            ? await contactDecryption(activity.contact as Contact)
            : activity.contact;

        activity.opportunity =
          activity.opportunity !== null && activity.opportunity !== undefined
            ? await opportunityDecryption(activity.opportunity as Oppurtunity)
            : activity.opportunity;

        activity.owner =
          activity.owner !== null && activity.owner !== undefined
            ? await userDecryption(activity.owner as User)
            : activity.owner;
      }

      let skip = 0;
      if (search) {
        skip = 1;

        searchedData = await activities.filter((activity) => {
          if (
            activity?.activityPriority
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.activityStatus
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.activityType
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.subject
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.startDate
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.dueDate
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.actualStartDate
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.description
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.actualEndDate
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.owner?.firstName
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.owner?.lastName
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase())
          ) {
            return true;
          }
        });
      }

      if (searchedData.length === 0 && skip === 0) {
        searchedData = activities;
      }
      const total = searchedData.length;
      searchedData = searchedData.slice((page - 1) * limit, page * limit);
      const pagination = {
        total,
        page: page,
        limit: limit,
        data: searchedData,
      };
      return pagination;
    } catch (error) {
      return;
    }
  }

  async getAllActivities(
    userId: string,
    _role: Role[],
    search: string | undefined,
    page: number = 1,
    limit: number = 7,
    createdAt: string,
    updatedAt: string,
    dateRange: DateRangeParamsType,
    activityType: string[] | undefined,
    activityStatus: string[] | undefined,
    activityPriority: string[] | undefined,
    startDate: string,
    dueDate: string,
    actualStartDate: string,
    actualEndDate: string,
    organizationId: string | null,
    view: string | null
  ) {
    try {
      let activityRepo;
      if (view == "myView" || view === "null") {
        // if(role.length===1 && role[0].roleName===roleNames.SALESPERSON){
        activityRepo = AppDataSource.getRepository(Activity)
          .createQueryBuilder("Activity")
          .select()
          .leftJoinAndSelect("Activity.company", "Account")
          .leftJoinAndSelect("Activity.contact", "Contact")
          .leftJoinAndSelect("Activity.lead", "Lead")
          .leftJoinAndSelect("Activity.opportunity", "Oppurtunity")
          .leftJoinAndSelect("Activity.owner", "user")
          .where("Activity.ownerId=:owner", { owner: userId })
          .andWhere("Activity.organizationId=:organizationId", {
            organizationId: organizationId,
          })
          .orderBy("Activity.updatedAt", "DESC");
      } else {
        activityRepo = AppDataSource.getRepository(Activity)
          .createQueryBuilder("Activity")
          .select()
          .leftJoinAndSelect("Activity.company", "Account")
          .leftJoinAndSelect("Activity.contact", "Contact")
          .leftJoinAndSelect("Activity.lead", "Lead")
          .leftJoinAndSelect("Activity.opportunity", "Oppurtunity")
          .leftJoinAndSelect("Activity.owner", "user")
          .where("Activity.organizationId=:organizationId", {
            organizationId: organizationId,
          })
          .orderBy("Activity.updatedAt", "DESC");
      }

      if (activityType && activityType.length > 0) {
        activityRepo.andWhere("Activity.activityType IN (:activityType)", {
          activityType,
        });
      }

      if (activityStatus && activityStatus.length > 0) {
        activityRepo.andWhere("Activity.activityStatus IN (:activityStatus)", {
          activityStatus,
        });
      }

      if (activityPriority && activityPriority.length > 0) {
        activityRepo.andWhere(
          "Activity.activityPriority IN (:activityPriority)",
          { activityPriority }
        );
      }

      if (createdAt != undefined) {
        activityRepo.orderBy(
          "Activity.createdAt",
          createdAt == "DESC" ? "DESC" : "ASC"
        );
      }

      if (updatedAt != undefined) {
        activityRepo.orderBy(
          "Activity.updatedAt",
          updatedAt == "DESC" ? "DESC" : "ASC"
        );
      }

      if (startDate != undefined) {
        activityRepo.orderBy(
          "Activity.startDate",
          startDate == "DESC" ? "DESC" : "ASC"
        );
      }

      if (dueDate != undefined) {
        activityRepo.orderBy(
          "Activity.dueDate",
          dueDate == "DESC" ? "DESC" : "ASC"
        );
      }

      if (actualStartDate != undefined) {
        activityRepo.orderBy(
          "Activity.actualStartDate",
          actualStartDate == "DESC" ? "DESC" : "ASC"
        );
      }

      if (actualEndDate != undefined) {
        activityRepo.orderBy(
          "Activity.actualEndDate",
          actualEndDate == "DESC" ? "DESC" : "ASC"
        );
      }

      if (dateRange) {
        if (dateRange.startDate && dateRange.endDate) {
          activityRepo.andWhere(
            "DATE(Activity.updatedAt) BETWEEN :startDate AND :endDate",
            {
              startDate: dateRange.startDate,
              endDate: dateRange.endDate,
            }
          );
        }
      }

      const activities = await activityRepo.getMany();

      let searchedData: Activity[] = [];

      for (let activity of activities) {
        if (activity && activity != undefined) {
          try {
            activity = await activityDecryption(activity);
          } catch (error) {
            console.log("failed decryption.");
          }
        }

        activity.lead =
          activity.lead !== null && activity.lead !== undefined
            ? await leadDecryption(activity.lead)
            : activity.lead;

        activity.company =
          activity.company !== null && activity.company !== undefined
            ? await accountDecryption(activity.company as Account)
            : activity.company;

        activity.contact =
          activity.contact !== null && activity.contact !== undefined
            ? await contactDecryption(activity.contact as Contact)
            : activity.contact;

        activity.opportunity =
          activity.opportunity !== null && activity.opportunity !== undefined
            ? await opportunityDecryption(activity.opportunity as Oppurtunity)
            : activity.opportunity;

        activity.owner =
          activity.owner !== null && activity.owner !== undefined
            ? await userDecryption(activity.owner as User)
            : activity.owner;
      }

      let skip = 0;
      if (search) {
        skip = 1;

        searchedData = await activities.filter((activity) => {
          if (
            activity?.activityPriority
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.activityStatus
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.activityType
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.subject
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.startDate
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.dueDate
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.actualStartDate
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.description
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.actualEndDate
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.owner?.firstName
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            activity?.owner?.lastName
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase())
          ) {
            return true;
          }
        });
      }

      if (searchedData.length === 0 && skip === 0) {
        searchedData = activities;
      }
      const total = searchedData.length;
      searchedData = searchedData.slice((page - 1) * limit, page * limit);
      const pagination = {
        total,
        page: page,
        limit: limit,
        data: searchedData,
      };
      return pagination;
    } catch (error) {
      return error;
    }
  }

  async updateActivity(activityId: string, payload: Activity, user: userInfo) {
    payload.modifiedBy = user.email;
    const activityRepo = await AppDataSource.getRepository(Activity);
    const isExists = await activityRepo.findOneBy({ activityId: activityId });
    if (!isExists) {
      return;
    }

    if (payload.company) {
      const account = await AppDataSource.getRepository(Account)
        .createQueryBuilder("Account")
        .where("Account.accountId = :accountId", { accountId: payload.company })
        .getOne();
      if (account) payload.company = account;
    }

    if (payload.contact) {
      const contact = await AppDataSource.getRepository(Contact)
        .createQueryBuilder("contact")
        .where("contact.contactId = :contactId", {
          contactId: String(payload.contact),
        })
        .getOne();
      if (contact) payload.contact = contact;
    }

    if (payload.lead) {
      const lead = await AppDataSource.getRepository(Lead)
        .createQueryBuilder("Lead")
        .where("Lead.leadId = :lead", { lead: payload.lead })
        .getOne();
      if (lead) payload.lead = lead;
    }

    if (payload.opportunity) {
      const oppurtunitydata = await AppDataSource.getRepository(Oppurtunity)
        .createQueryBuilder("Oppurtunity")
        .where("Oppurtunity.opportunityId = :opportunityId", {
          opportunityId: payload.opportunity,
        })
        .getOne();
      if (oppurtunitydata) payload.opportunity = oppurtunitydata;
    }
    //Enc Dec code for activity table

    if (payload.subject) payload.subject = encryption(payload.subject);
    if (payload.description)
      payload.description = encryption(payload.description);

    const duedate = payload.dueDate;
    const targetDate = new Date(duedate);
    const halfHourBefore = new Date(targetDate.getTime() - 30 * 60 * 1000); // minus 30 min from time for reminder
    payload.notificationDateTime = halfHourBefore;

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

    const activity = new Activity(payload);

    const result: UpdateResult = await activityRepo.update(
      activityId,
      activity
    );

    //Activity Reminder table
    const activityReminderRepo = await AppDataSource.getRepository(
      ActivityRemainder
    );
    await activityReminderRepo
      .createQueryBuilder()
      .update(ActivityRemainder)
      .set({
        fcmWebToken: activity?.owner?.fcmWebToken,
        fcmAndroidToken: activity?.owner?.fcmAndroidToken,
        notificationDateTime: activity?.notificationDateTime,
        activitySubject: activity?.subject,
        description: activity.description,
        updatedAt: () => "CURRENT_TIMESTAMP",
      })
      .where("activityId = :activityId", { activityId })
      .execute();

    return result;
  }

  async deleteActivity(
    activityId: string,
    user: userInfo,
    transactionEntityManager: EntityManager
  ) {
    try {
      const activityRepository =
        transactionEntityManager.getRepository(Activity);
      const activty = await activityRepository.findOne({
        where: { activityId: activityId },
      });

      if (!activty) {
        throw new Error("Activity does not exist");
      }

      await AppDataSource.getRepository(Activity).softDelete(activityId);
      await activityRepository.update(activityId, { modifiedBy: user.email });

      return activty;
    } catch (error) {
      throw new Error("Activity does not exist");
    }
  }

  async bulkDeleteActivity(
    activityIds: Array<string>,
    _userId: string,
    _auth_time: number,
    email: string,
    transactionEntityManager: EntityManager
  ) {
    try {
      // const auditId = String(auth_time)+userId;
      const activityRepository = await transactionEntityManager.getRepository(
        Activity
      );
      const { activityCanBeDelete, activityCanNotBeDeleted } =
        await this.isActivityExistsByIdToBulkdelete(
          transactionEntityManager,
          activityIds
        );
      for (const activityId of activityCanBeDelete) {
        await activityRepository.softDelete(activityId);
        await activityRepository.update(activityId, { modifiedBy: email });
        /*
                const activityData = await activityRepository.findOne({ 
                   withDeleted: true, // Include soft-deleted entities
                   where: { activityId: activityId } 
                });
                if(activityData){                    
                 await this.deleteAuditLogHandler(transactionEntityManager,activityData,auditId);            
                }
              */
      }
      return {
        deleted: activityCanBeDelete,
        activitiesNotFound: activityCanNotBeDeleted,
      };
    } catch (error) {
      return;
    }
  }

  async isActivityExistsByIdToBulkdelete(
    transactionEntityManager: EntityManager,
    activityIds: Array<string>
  ) {
    const activityRepository = transactionEntityManager.getRepository(Activity);
    const activityCanNotBeDeleted: Array<string> = [];
    const activityCanBeDelete: Array<string> = [];
    for (const activityId of activityIds) {
      const activity = await activityRepository.findOne({
        where: {
          activityId: activityId,
        },
      });

      if (activity) {
        activityCanBeDelete.push(activityId);
      } else {
        activityCanNotBeDeleted.push(activityId);
      }
    }
    return { activityCanBeDelete, activityCanNotBeDeleted };
  }

  async getActivityReminderData(currentDateTime: Date, halfHourAfter: Date) {
    try {
      const activityReminderRepo =
        AppDataSource.getRepository(ActivityRemainder);
      const query = activityReminderRepo
        .createQueryBuilder("activityReminder")
        .leftJoinAndSelect("activityReminder.activity", "activity")
        .leftJoinAndSelect("activity.owner", "owner")
        .leftJoinAndSelect("owner.organisation", "organisation")
        .leftJoinAndSelect("owner.roles", "role")
        .where(
          "activityReminder.notificationDateTime >= :startDate AND activityReminder.notificationDateTime < :endDate",
          {
            startDate: currentDateTime,
            endDate: halfHourAfter,
          }
        );
      const results = await query.getMany();
      return results;
    } catch (error) {
      return [];
    }
  }
}
export default ActivityService;
