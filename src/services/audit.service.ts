import { AppDataSource } from "../data-source";
import { Audit } from "../entity/Audit";
import { decrypt, encryption } from "../common/utils";
// import { AuditDataType } from "../schemas/audit.schemas";
import { User } from "../entity/User";
import { userDecryption } from "./decryption.service";
export class AuditServices {
  async getAccountAudits(accountId: string) {
    const audits = await AppDataSource.getRepository(Audit)
      .createQueryBuilder("audit")
      .leftJoinAndSelect("audit.owner", "user")
      //  .leftJoinAndSelect("audit.company","account")
      // .where("audit.ownerId = :userId", { userId })
      .andWhere("audit.accountId IS NOT NULL")
      .andWhere("audit.leadId IS NULL")
      .andWhere("audit.contactId IS NULL")
      .andWhere("audit.opportunityId IS NULL")
      .andWhere("audit.subscriptionId IS NULL")
      .andWhere("audit.accountId = :accountId", { accountId: accountId })
      .orderBy("audit.updatedAt", "DESC")
      .select(["audit", "user.firstName", "user.lastName"])
      .getMany();

    for (let audit of audits) {
      audit.description = decrypt(audit.description);
      audit.owner = await userDecryption(audit.owner);
    }

    const formattedAudits = await Promise.all(
      audits.map(async (audit) => {
        if (audit.auditType === "UPDATED") {
          const userRepo = AppDataSource.getRepository(User);
          const userData = await userRepo
            .createQueryBuilder("user")
            .select(["user.firstName", "user.lastName"])
            .where("user.email = :email", {
              email: encryption(audit.modifiedBy),
            })
            .getOne();

          let description = audit.description;
          description = audit.description.split("from")[1].trim();
          //here use all changebale kewords
          const keywords = [
            "owner",
            "accountName",
            "description",
            "country",
            "state",
            "city",
            "companySize",
            "website",
            "industry",
            "businessType",
            "CurrencyCode",
            "annualRevenue",
            "address",
            "area",
            "status",
            "email",
            "phone",
            "countryCode",
          ];
          // const formattedChanges: { [key: string]: string } = {};
          const formattedChanges: { change: string; label: string }[] = [];

          keywords.forEach((keyword) => {
            const regex = new RegExp(
              `${keyword} (.*?)(?: (${keywords.join("|")})|$)`
            );
            const match = description.match(regex);
            if (match && match[1]) {
              // formattedChanges[keyword] = match[1].trim();
              formattedChanges.push({
                change: match[1].trim(),
                label: keyword,
              });
            }
          });

          return {
            audit: audit,
            description: audit.description.split("from")[0].trim() + " from",
            changes: formattedChanges,
            modifierDetails: userData ? await userDecryption(userData) : null,
          };
        } else if (audit.auditType === "INSERTED") {
          return {
            audit: audit,
            description: audit.description,
            changes: {},
          };
        } else {
          const userRepo = AppDataSource.getRepository(User);
          const userData = await userRepo
            .createQueryBuilder("user")
            .select(["user.firstName", "user.lastName"])
            .where("user.email = :email", {
              email: encryption(audit.modifiedBy),
            })
            .getOne();

          return {
            audit: audit,
            description: audit.description,
            changes: {},
            deleterDetails: userData ? await userDecryption(userData) : null,
          };
        }
      })
    );

    return formattedAudits;
  }

  async getContactAudits(contactId: string) {
    const audits = await AppDataSource.getRepository(Audit)
      .createQueryBuilder("audit")
      .leftJoinAndSelect("audit.owner", "user")
      // .where("audit.ownerId = :userId", { userId })
      .andWhere("audit.accountId IS NULL")
      .andWhere("audit.leadId IS NULL")
      .andWhere("audit.contactId IS NOT NULL")
      .andWhere("audit.opportunityId IS NULL")
      .andWhere("audit.subscriptionId IS NULL")
      .andWhere("audit.contactId = :contactId", { contactId: contactId })
      .orderBy("audit.updatedAt", "DESC")
      .select(["audit", "user.firstName", "user.lastName"])
      .getMany();

    for (let audit of audits) {
      audit.description = decrypt(audit.description);
      audit.owner = await userDecryption(audit.owner);
    }

    const formattedAudits = await Promise.all(
      audits.map(async (audit) => {
        if (audit.auditType === "UPDATED") {
          const userRepo = AppDataSource.getRepository(User);
          const userData = await userRepo
            .createQueryBuilder("user")
            .select(["user.firstName", "user.lastName"])
            .where("user.email = :email", {
              email: encryption(audit.modifiedBy),
            })
            .getOne();

          let description = audit.description;
          description = audit.description.split("from")[1].trim();

          const keywords = [
            "owner",
            "firstName",
            "lastName",
            "countryCode",
            "phone",
            "email",
            "addressLine",
            "area",
            "city",
            "state",
            "country",
            "industry",
            "designation",
            "description",
            "social",
            "notes",
            "timeline",
            "status",
            "favourite",
            "contactType",
          ];

          // const formattedChanges: { [key: string]: string } = {};
          const formattedChanges: { change: string; label: string }[] = [];

          keywords.forEach((keyword) => {
            const regex = new RegExp(
              `${keyword} (.*?)(?: (${keywords.join("|")})|$)`
            );
            const match = description.match(regex);
            if (match && match[1]) {
              // formattedChanges[keyword] = match[1].trim();
              formattedChanges.push({
                change: match[1].trim(),
                label: keyword,
              });
            }
          });

          return {
            audit: audit,
            description: audit.description.split("from")[0].trim() + " from",
            changes: formattedChanges,
            modifierDetails: userData ? await userDecryption(userData) : null,
          };
        } else if (audit.auditType === "INSERTED") {
          return {
            audit: audit,
            description: audit.description,
            changes: {},
          };
        } else {
          const userRepo = AppDataSource.getRepository(User);
          const userData = await userRepo
            .createQueryBuilder("user")
            .select(["user.firstName", "user.lastName"])
            .where("user.email = :email", {
              email: encryption(audit.modifiedBy),
            })
            .getOne();

          return {
            audit: audit,
            description: audit.description,
            changes: {},
            deleterDetails: userData ? await userDecryption(userData) : null,
          };
        }
      })
    );

    return formattedAudits;
  }

  async getLeadAudits(leadId: string) {    
    const audits = await AppDataSource.getRepository(Audit)
      .createQueryBuilder("audit")
      .leftJoinAndSelect("audit.owner", "user")
      // .where("audit.ownerId = :userId", { userId })
      .andWhere("audit.accountId IS  NULL")
      .andWhere("audit.leadId IS NOT NULL")
      .andWhere("audit.contactId IS NULL")
      .andWhere("audit.opportunityId IS NULL")
      .andWhere("audit.subscriptionId IS NULL")
      .andWhere("audit.leadId = :leadId", { leadId: leadId })
      .orderBy("audit.updatedAt", "DESC")
      .select(["audit", "user.firstName", "user.lastName"])
      .getMany();

    for (let audit of audits) {
      audit.description = decrypt(audit.description);
      audit.owner = await userDecryption(audit.owner);
    }
    console.log(audits[0]);
    
    const formattedAudits = await Promise.all(
      audits.map(async (audit) => {
        if (audit.auditType === "UPDATED") {
          const userRepo = AppDataSource.getRepository(User);
          const userData = await userRepo
            .createQueryBuilder("user")
            .select(["user.firstName", "user.lastName"])
            .where("user.email = :email", {
              email: encryption(audit.modifiedBy),
            })
            .getOne();

          let description = audit.description;
          description = audit.description.split("from")[1].trim();
          const keywords = [
            "firstName",
            "lastName",
            "countryCode",
            "phone",
            "contact",
            "title",
            "email",
            "country",
            "state",
            "city",
            "leadSource",
            "rating",
            "status",
            "price",
            "description",
            "company",
            "owner",
          ];
          // const formattedChanges: { [key: string]: string } = {};
          const formattedChanges: { change: string; label: string }[] = [];

          keywords.forEach((keyword) => {
            const regex = new RegExp(
              `${keyword} (.*?)(?: (${keywords.join("|")})|$)`
            );
            const match = description.match(regex);
            if (match && match[1]) {
              // formattedChanges[keyword] = match[1].trim();
              formattedChanges.push({
                change: match[1].trim(),
                label: keyword,
              });
            }
          });

          return {
            audit: audit,
            description: audit.description.split("from")[0].trim() + " from",
            changes: formattedChanges,
            modifierDetails: userData ? await userDecryption(userData) : null,
          };
        } else if (audit.auditType === "INSERTED") {
          return {
            audit: audit,
            description: audit.description,
            changes: {},
          };
        } else {
          const userRepo = AppDataSource.getRepository(User);
          const userData = await userRepo
            .createQueryBuilder("user")
            .select(["user.firstName", "user.lastName"])
            .where("user.email = :email", {
              email: encryption(audit.modifiedBy),
            })
            .getOne();

          return {
            audit: audit,
            description: audit.description,
            changes: {},
            deleterDetails: userData ? await userDecryption(userData) : null,
          };
        }
      })
    );
    return formattedAudits;
  }

  async getOpportunityAudits(opportunityId: string) {
    const audits = await AppDataSource.getRepository(Audit)
      .createQueryBuilder("audit")
      .leftJoinAndSelect("audit.owner", "user")
      // .where("audit.ownerId = :userId", { userId })
      .andWhere("audit.accountId IS NULL")
      .andWhere("audit.leadId IS NULL")
      .andWhere("audit.contactId IS NULL")
      .andWhere("audit.subscriptionId IS NULL")
      .andWhere("audit.opportunityId IS NOT NULL")
      .andWhere("audit.opportunityId = :opportunityId", {
        opportunityId: opportunityId,
      })
      .orderBy("audit.updatedAt", "DESC")
      .select(["audit", "user.firstName", "user.lastName"])
      .getMany();

    for (let audit of audits) {
      audit.description = decrypt(audit.description);
      audit.owner = await userDecryption(audit.owner);
    }

    const formattedAudits = await Promise.all(
      audits.map(async (audit) => {
        if (audit.auditType === "UPDATED") {
          const userRepo = AppDataSource.getRepository(User);
          const userData = await userRepo
            .createQueryBuilder("user")
            .select(["user.firstName", "user.lastName"])
            .where("user.email = :email", {
              email: encryption(audit.modifiedBy),
            })
            .getOne();

          let description = audit.description;
          description = audit.description.split("from")[1].trim();
            
          const keywords = [
            "title",
            "currency",
            "purchaseTimeFrame",
            "purchaseProcess",
            "forecastCategory",
            "estimatedRevenue",
            "actualRevenue",
            "estimatedCloseDate",
            "actualCloseDate",
            "description",
            "currentNeed",
            "proposedSolution",
            "probability",
            "stage",
            "status",
            "priority",
            "wonReason",
            "lostReason",
            "wonLostDescription",
            "contact",
            "company",
            "owner"
          ];

          // const formattedChanges: { [key: string]: string } = {};
          const formattedChanges: { change: string; label: string }[] = [];

          keywords.forEach((keyword) => {
            const regex = new RegExp(
              `${keyword} (.*?)(?: (${keywords.join("|")})|$)`
            );
            const match = description.match(regex);
            if (match && match[1]) {
              // formattedChanges[keyword] = match[1].trim();
              formattedChanges.push({
                change: match[1].trim(),
                label: keyword,
              });
            }
          });

          return {
            audit: audit,
            description: audit.description.split("from")[0].trim() + " from",
            changes: formattedChanges,
            modifierDetails: userData ? await userDecryption(userData) : null,
          };
        } else if (audit.auditType === "INSERTED") {
          return {
            audit: audit,
            description: audit.description,
            changes: {},
          };
        } else {
          const userRepo = AppDataSource.getRepository(User);
          const userData = await userRepo
            .createQueryBuilder("user")
            .select(["user.firstName", "user.lastName"])
            .where("user.email = :email", {
              email: encryption(audit.modifiedBy),
            })
            .getOne();

          return {
            audit: audit,
            description: audit.description,
            changes: {},
            deleterDetails: userData ? await userDecryption(userData) : null,
          };
        }
      })
    );
    return formattedAudits;
  }

  async getSubscriptionAudits(subscriptionId: string) {
    const auditRepository = AppDataSource.getRepository(Audit);
    const encryptedSubscriptionId = encryption(subscriptionId);

    const audits = await auditRepository
      .createQueryBuilder("audit")
      .leftJoinAndSelect("audit.owner", "user")
      .andWhere("audit.accountId IS NULL")
      .andWhere("audit.leadId IS NULL")
      .andWhere("audit.contactId IS NULL")
      .andWhere("audit.opportunityId IS NULL")
      .andWhere("audit.subscriptionId IS NOT NULL")
      .andWhere("audit.subscriptionId = :subscriptionId", {
        subscriptionId: encryptedSubscriptionId,
      })
      .orderBy("audit.updatedAt", "DESC")
      .select(["audit", "user.firstName", "user.lastName"])
      .getMany();

    for (let audit of audits) {
      audit.description = decrypt(audit.description);
      audit.owner = await userDecryption(audit.owner);
    }
    return audits;
  }

}
