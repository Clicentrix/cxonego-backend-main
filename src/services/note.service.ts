import { AppDataSource } from "../data-source";
import { EntityManager, Repository, UpdateResult } from "typeorm";
import { ResourceNotFoundError } from "../common/errors";
import { Account } from "../entity/Account";
import { decrypt, roleNames } from "../common/utils";
import { Contact } from "../entity/Contact";
import logger from "../common/logger";
import { Role } from "../entity/Role";
import { Activity } from "../entity/Activity";
import { Oppurtunity } from "../entity/Oppurtunity";
import { User } from "../entity/User";
import { userInfo } from "../interfaces/types";
import { Note } from "../entity/Note";
import { Lead } from "../entity/Lead";
import {
  accountDecryption,
  contactDecryption,
  leadDecryption,
  opportunityDecryption,
  noteDecryption,
  activityDecryption,
  userDecryption,
  orgnizationDecryption,
} from "./decryption.service";
import { Organisation } from "../entity/Organisation";
import { DateRangeParamsType } from "../schemas/comman.schemas";

class NoteService {
  async getAllNotesData(userInfo: userInfo) {
    const notes = await AppDataSource.getRepository(Note)
      .createQueryBuilder("note")
      .leftJoinAndSelect("note.owner", "user")
      .leftJoinAndSelect("note.organization", "organisation")
      .where("organisation.organisationId = :organizationId", {
        organizationId: userInfo.organizationId,
      })
      .select(["note", "user.userId", "user.firstName", "user.lastName"])
      .orderBy("note.updatedAt", "DESC")
      .getMany();
    for (let note of notes) {
      note = await noteDecryption(note);
      note.owner = await userDecryption(note.owner);
    }
    return notes;
  }
  async createNote(
    payload: Note,
    user: userInfo,
    transactionEntityManager: EntityManager
  ) {
    try {
      const userRepo = AppDataSource.getRepository(User);
      const userData = await userRepo.findOne({
        where: { userId: user.userId },
      });
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
          .where("Account.accountId = :accountId", {
            accountId: payload.company,
          })
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

      if (payload.Lead) {
        const lead = await transactionEntityManager
          .getRepository(Lead)
          .createQueryBuilder("Lead")
          .where("Lead.leadId = :lead", { lead: payload.Lead })
          .getOne();
        if (lead) payload.Lead = lead;
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

      if (payload.activity) {
        const activity = await transactionEntityManager
          .getRepository(Activity)
          .createQueryBuilder("Activity")
          .where("Activity.activityId = :activityId", {
            activityId: payload.activity,
          })
          .getOne();
        if (activity) payload.activity = activity;
      }

      const note = new Note({
        ...payload,
        noteId: await this.getNoteId(new Date()),
      } as Note);

      let noteData = await note.save();
      return noteData;
    } catch (error) {
      console.error(error);
      return;
    }
  }

  async getNoteId(date: Date) {
    const month = String(
      date.getMonth() + 1 >= 10
        ? date.getMonth() + 1
        : "0" + (date.getMonth() + 1)
    );
    const year = String(date.getFullYear().toString().slice(-2));
    const lastNote = await AppDataSource.getRepository(Note)
      .createQueryBuilder("Note")
      .withDeleted()
      .select()
      .orderBy("Note.createdAt", "DESC")
      .getOne();

    let noteNo = "00";
    const yearFromRecord = String(lastNote?.noteId.slice(4, 6));
    const noteIdFromRecord = String(lastNote?.noteId.substring(6));
    if (year === yearFromRecord) {
      noteNo = noteIdFromRecord;
    }
    const activityId =
      "NT" + month + year + "0" + (Number(noteNo) + 1).toString();

    return activityId;
  }

  async getAllNotes(
    userId: string,
    role: Role[],
    search: string | undefined,
    page: number = 1,
    limit: number = 7,
    createdAt: string,
    updatedAt: string,
    organizationId: string | null,
    dateRange: DateRangeParamsType
  ) {
    try {
      let noteRepo;

      if (
        role.length === 1 &&
        (role[0].roleName === roleNames.SALESPERSON ||
          role[0].roleName === roleNames.SALESMANAGER)
      ) {
        noteRepo = AppDataSource.getRepository(Note)
          .createQueryBuilder("Note")
          .select([
            "Note.createdAt",
            "Note.updatedAt",
            "Note.deletedAt",
            "Note.modifiedBy",
            "Note.noteId",
            "Note.note",
            "Note.tags",
            "user.userId",
            "user.email",
            "user.firstName",
            "user.lastName",
            "Account",
            "Contact",
            "Lead",
            "Opportunity",
          ])
          .leftJoin("Note.company", "Account")
          .leftJoin("Note.contact", "Contact")
          .leftJoin("Note.Lead", "Lead")
          .leftJoin("Note.opportunity", "Opportunity")
          .leftJoin("Note.owner", "user")
          .where("Note.ownerId=:owner", { owner: userId })
          .andWhere("Note.organizationId=:organizationId", {
            organizationId: organizationId,
          })
          .orderBy("Note.updatedAt", "DESC");
      } else {
        noteRepo = AppDataSource.getRepository(Note)
          .createQueryBuilder("Note")
          .select([
            "Note.createdAt",
            "Note.updatedAt",
            "Note.deletedAt",
            "Note.modifiedBy",
            "Note.noteId",
            "Note.note",
            "Note.tags",
            "user.userId",
            "user.email",
            "user.firstName",
            "user.lastName",
            "Account",
            "Contact",
            "Lead",
            "Opportunity",
          ])
          .leftJoin("Note.company", "Account")
          .leftJoin("Note.contact", "Contact")
          .leftJoin("Note.Lead", "Lead")
          .leftJoin("Note.opportunity", "Opportunity")
          .leftJoin("Note.owner", "user")
          .where("Note.ownerId=:owner", { owner: userId })  //added later as per new change.
          .andWhere("Note.organizationId=:organizationId", {
            organizationId: organizationId,
          })
          .orderBy("Note.updatedAt", "DESC");
      }

      if (createdAt != undefined) {
        noteRepo.orderBy(
          "Note.createdAt",
          createdAt == "DESC" ? "DESC" : "ASC"
        );
      }

      if (updatedAt != undefined) {
        noteRepo.orderBy(
          "Note.updatedAt",
          updatedAt == "DESC" ? "DESC" : "ASC"
        );
      }

      if (dateRange) {
        if (dateRange.startDate && dateRange.endDate) {
          noteRepo.andWhere(
            "DATE(Note.updatedAt) BETWEEN :startDate AND :endDate",
            {
              startDate: dateRange.startDate,
              endDate: dateRange.endDate,
            }
          );
        }
      }

      const notes = await noteRepo.getMany();

      let searchedData: Note[] = [];

      for (let note of notes) {
        note =
          note !== null && note !== undefined
            ? await noteDecryption(note)
            : note;

        note.Lead =
          note.Lead !== null && note.Lead !== undefined
            ? await leadDecryption(note.Lead)
            : note.Lead;

        note.company =
          note.company !== null && note.company !== undefined
            ? await accountDecryption(note.company as Account)
            : note.company;

        note.contact =
          note.contact !== null && note.contact !== undefined
            ? await contactDecryption(note.contact as Contact)
            : note.contact;

        note.opportunity =
          note.opportunity !== null && note.opportunity !== undefined
            ? await opportunityDecryption(note.opportunity as Oppurtunity)
            : note.opportunity;

        note.owner =
          note.owner !== null && note.owner !== undefined
            ? await userDecryption(note.owner as User)
            : note.owner;
      }

      let skip = 0;
      if (search) {
        skip = 1;

        searchedData = await notes.filter((note) => {
          if (
            note?.note
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            note?.tags
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            note?.owner?.firstName
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase()) ||
            note?.owner?.lastName
              ?.toString()
              .toLowerCase()
              .includes(String(search).toLowerCase())
          ) {
            return true;
          }
        });
      }

      if (searchedData.length === 0 && skip === 0) {
        searchedData = notes;
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

  async getNoteByNoteId(
    userId: string,
    role: Role[],
    noteId: string,
    organizationId: string | null
  ) {
    try {
      let noteRepo;
      if (role.length === 1 && role[0].roleName === roleNames.SALESPERSON) {
        noteRepo = AppDataSource.getRepository(Note)
          .createQueryBuilder("Note")
          .select([
            "Note.createdAt",
            "Note.updatedAt",
            "Note.deletedAt",
            "Note.modifiedBy",
            "Note.noteId",
            "Note.note",
            "Note.tags",
            "user.userId",
            "user.email",
            "user.firstName",
            "user.lastName",
            "Account",
            "Contact",
            "Lead",
            "Opportunity",
          ])
          .leftJoin("Note.company", "Account")
          .leftJoin("Note.contact", "Contact")
          .leftJoin("Note.Lead", "Lead")
          .leftJoin("Note.opportunity", "Opportunity")
          .leftJoin("Note.owner", "user")
          .where("Note.ownerId=:owner", { owner: userId })
          .andWhere("Note.noteId = :noteId", { noteId })
          .andWhere("Note.organizationId=:organizationId", {
            organizationId: organizationId,
          })
          .orderBy("Note.updatedAt", "DESC");
      } else {
        noteRepo = AppDataSource.getRepository(Note)
          .createQueryBuilder("Note")
          .select([
            "Note.createdAt",
            "Note.updatedAt",
            "Note.deletedAt",
            "Note.modifiedBy",
            "Note.noteId",
            "Note.note",
            "Note.tags",
            "user.userId",
            "user.email",
            "user.firstName",
            "user.lastName",
            "Account",
            "Contact",
            "Lead",
            "Opportunity",
          ])
          .leftJoin("Note.company", "Account")
          .leftJoin("Note.contact", "Contact")
          .leftJoin("Note.Lead", "Lead")
          .leftJoin("Note.opportunity", "Opportunity")
          .leftJoin("Note.owner", "user")
          .where("Note.noteId = :noteId", { noteId })
          .andWhere("Note.organizationId=:organizationId", {
            organizationId: organizationId,
          })
          .orderBy("Note.updatedAt", "DESC");
      }

      let note = await noteRepo.getOne();

      if (note) {
        note =
          note !== null && note !== undefined
            ? await noteDecryption(note)
            : note;

        note.Lead =
          note.Lead !== null && note.Lead !== undefined
            ? await leadDecryption(note.Lead)
            : note.Lead;

        note.company =
          note.company !== null && note.company !== undefined
            ? await accountDecryption(note.company as Account)
            : note.company;

        note.contact =
          note.contact !== null && note.contact !== undefined
            ? await contactDecryption(note.contact as Contact)
            : note.contact;

        note.opportunity =
          note.opportunity !== null && note.opportunity !== undefined
            ? await opportunityDecryption(note.opportunity as Oppurtunity)
            : note.opportunity;

        note.owner =
          note.owner !== null && note.owner !== undefined
            ? await userDecryption(note.owner as User)
            : note.owner;
      }

      return note;
    } catch (error) {
      return;
    }
  }

  async getNoteByaccountId(
    userId: string,
    role: Role[],
    search: string | undefined,
    page: number = 1,
    limit: number = 7,
    createdAt: string,
    updatedAt: string,
    accountId: string,
    organizationId: string | null,
    dateRange: DateRangeParamsType
  ) {
    try {
      let noteRepo;
      if (
        role.length === 1 &&
        (role[0].roleName === roleNames.SALESPERSON ||
          role[0].roleName === roleNames.SALESMANAGER)
      ) {
        noteRepo = await AppDataSource.getRepository(Note)
          .createQueryBuilder("Note")
          .select([
            "Note.createdAt",
            "Note.updatedAt",
            "Note.deletedAt",
            "Note.modifiedBy",
            "Note.noteId",
            "Note.note",
            "Note.tags",
            "user.userId",
            "user.email",
            "user.firstName",
            "user.lastName",
            "Account",
            "Contact",
            "Lead",
            "Opportunity",
          ])
          .leftJoin("Note.company", "Account")
          .leftJoin("Note.contact", "Contact")
          .leftJoin("Note.Lead", "Lead")
          .leftJoin("Note.opportunity", "Opportunity")
          .leftJoin("Note.owner", "user")
          .where("Note.accountId = :accountId", { accountId })
          .andWhere("Note.ownerId = :ownerId", { ownerId: userId })
          .andWhere("Note.organizationId=:organizationId", {
            organizationId: organizationId,
          })
          .orderBy("Note.updatedAt", "DESC");
      } else {
        noteRepo = await AppDataSource.getRepository(Note)
          .createQueryBuilder("Note")
          .select([
            "Note.createdAt",
            "Note.updatedAt",
            "Note.deletedAt",
            "Note.modifiedBy",
            "Note.noteId",
            "Note.note",
            "Note.tags",
            "user.userId",
            "user.email",
            "user.firstName",
            "user.lastName",
            "Account",
            "Contact",
            "Lead",
            "Opportunity",
          ])
          .leftJoin("Note.company", "Account")
          .leftJoin("Note.contact", "Contact")
          .leftJoin("Note.Lead", "Lead")
          .leftJoin("Note.opportunity", "Opportunity")
          .leftJoin("Note.owner", "user")
          .where("Note.accountId = :accountId", { accountId })
          .andWhere("Note.organizationId=:organizationId", {
            organizationId: organizationId,
          })
          .orderBy("Note.updatedAt", "DESC");
      }

      if (createdAt != undefined) {
        noteRepo.orderBy(
          "Note.createdAt",
          createdAt == "DESC" ? "DESC" : "ASC"
        );
      }

      if (updatedAt != undefined) {
        noteRepo.orderBy(
          "Note.updatedAt",
          updatedAt == "DESC" ? "DESC" : "ASC"
        );
      }

      if (dateRange) {
        if (dateRange.startDate && dateRange.endDate) {
          noteRepo.andWhere(
            "DATE(Note.updatedAt) BETWEEN :startDate AND :endDate",
            {
              startDate: dateRange.startDate,
              endDate: dateRange.endDate,
            }
          );
        }
      }

      const notes = await noteRepo.getMany();

      let searchedData: Note[] = [];

      for (let note of notes) {
        note =
          note !== null && note !== undefined
            ? await noteDecryption(note)
            : note;

        note.Lead =
          note.Lead !== null && note.Lead !== undefined
            ? await leadDecryption(note.Lead)
            : note.Lead;

        note.company =
          note.company !== null && note.company !== undefined
            ? await accountDecryption(note.company as Account)
            : note.company;

        note.contact =
          note.contact !== null && note.contact !== undefined
            ? await contactDecryption(note.contact as Contact)
            : note.contact;

        note.opportunity =
          note.opportunity !== null && note.opportunity !== undefined
            ? await opportunityDecryption(note.opportunity as Oppurtunity)
            : note.opportunity;

        note.owner =
          note.owner !== null && note.owner !== undefined
            ? await userDecryption(note.owner as User)
            : note.owner;
      }

      let skip = 0;
      if (search) {
        skip = 1;

        searchedData = await notes.filter((note) => {
          if (
            note.note
              .toString()
              .toLowerCase()
              .includes(String(search).toLowerCase())
          ) {
            return true;
          }
        });
      }

      if (searchedData.length === 0 && skip === 0) {
        searchedData = notes;
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

  async getNoteBycontactId(
    userId: string,
    role: Role[],
    search: string | undefined,
    page: number = 1,
    limit: number = 7,
    createdAt: string,
    updatedAt: string,
    contactId: string,
    organizationId: string | null,
    dateRange: DateRangeParamsType
  ) {
    try {
      let noteRepo;
      if (
        role.length === 1 &&
        (role[0].roleName === roleNames.SALESPERSON ||
          role[0].roleName === roleNames.SALESMANAGER)
      ) {
        noteRepo = await AppDataSource.getRepository(Note)
          .createQueryBuilder("Note")
          .select([
            "Note.createdAt",
            "Note.updatedAt",
            "Note.deletedAt",
            "Note.modifiedBy",
            "Note.noteId",
            "Note.note",
            "Note.tags",
            "user.userId",
            "user.email",
            "user.firstName",
            "user.lastName",
            "Account",
            "Contact",
            "Lead",
            "Opportunity",
          ])
          .leftJoin("Note.company", "Account")
          .leftJoin("Note.contact", "Contact")
          .leftJoin("Note.Lead", "Lead")
          .leftJoin("Note.opportunity", "Opportunity")
          .leftJoin("Note.owner", "user")
          .where("Note.contactId = :contactId", { contactId: contactId })
          .andWhere("Note.ownerId = :ownerId", { ownerId: userId })
          .andWhere("Note.organizationId=:organizationId", {
            organizationId: organizationId,
          })
          .orderBy("Note.updatedAt", "DESC");
      } else {
        noteRepo = await AppDataSource.getRepository(Note)
          .createQueryBuilder("Note")
          .select([
            "Note.createdAt",
            "Note.updatedAt",
            "Note.deletedAt",
            "Note.modifiedBy",
            "Note.noteId",
            "Note.note",
            "Note.tags",
            "user.userId",
            "user.email",
            "user.firstName",
            "user.lastName",
            "Account",
            "Contact",
            "Lead",
            "Opportunity",
          ])
          .leftJoin("Note.company", "Account")
          .leftJoin("Note.contact", "Contact")
          .leftJoin("Note.Lead", "Lead")
          .leftJoin("Note.opportunity", "Opportunity")
          .leftJoin("Note.owner", "user")
          .where("Note.contactId = :contactId", { contactId: contactId })
          .andWhere("Note.organizationId=:organizationId", {
            organizationId: organizationId,
          })
          .orderBy("Note.updatedAt", "DESC");
      }

      if (createdAt != undefined) {
        noteRepo.orderBy(
          "Note.createdAt",
          createdAt == "DESC" ? "DESC" : "ASC"
        );
      }

      if (updatedAt != undefined) {
        noteRepo.orderBy(
          "Note.updatedAt",
          updatedAt == "DESC" ? "DESC" : "ASC"
        );
      }

      if (dateRange) {
        if (dateRange.startDate && dateRange.endDate) {
          noteRepo.andWhere(
            "DATE(Note.updatedAt) BETWEEN :startDate AND :endDate",
            {
              startDate: dateRange.startDate,
              endDate: dateRange.endDate,
            }
          );
        }
      }

      const notes = await noteRepo.getMany();

      let searchedData: Note[] = [];

      for (let note of notes) {
        note =
          note !== null && note !== undefined
            ? await noteDecryption(note)
            : note;

        note.Lead =
          note.Lead !== null && note.Lead !== undefined
            ? await leadDecryption(note.Lead)
            : note.Lead;

        note.company =
          note.company !== null && note.company !== undefined
            ? await accountDecryption(note.company as Account)
            : note.company;

        note.contact =
          note.contact !== null && note.contact !== undefined
            ? await contactDecryption(note.contact as Contact)
            : note.contact;

        note.opportunity =
          note.opportunity !== null && note.opportunity !== undefined
            ? await opportunityDecryption(note.opportunity as Oppurtunity)
            : note.opportunity;

        note.owner =
          note.owner !== null && note.owner !== undefined
            ? await userDecryption(note.owner as User)
            : note.owner;
      }

      let skip = 0;
      if (search) {
        skip = 1;

        searchedData = await notes.filter((note) => {
          if (
            note.note
              .toString()
              .toLowerCase()
              .includes(String(search).toLowerCase())
          ) {
            return true;
          }
        });
      }

      if (searchedData.length === 0 && skip === 0) {
        searchedData = notes;
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

  async getNoteByleadId(
    userId: string,
    role: Role[],
    search: string | undefined,
    page: number = 1,
    limit: number = 7,
    createdAt: string,
    updatedAt: string,
    leadId: string,
    organizationId: string | null,
    dateRange: DateRangeParamsType
  ) {
    try {
      let noteRepo;
      if (
        role.length === 1 &&
        (role[0].roleName === roleNames.SALESPERSON ||
          role[0].roleName === roleNames.SALESMANAGER)
      ) {
        noteRepo = await AppDataSource.getRepository(Note)
          .createQueryBuilder("Note")
          .select([
            "Note.createdAt",
            "Note.updatedAt",
            "Note.deletedAt",
            "Note.modifiedBy",
            "Note.noteId",
            "Note.note",
            "Note.tags",
            "user.userId",
            "user.email",
            "user.firstName",
            "user.lastName",
            "Account",
            "Contact",
            "Lead",
            "Opportunity",
          ])
          .leftJoin("Note.company", "Account")
          .leftJoin("Note.contact", "Contact")
          .leftJoin("Note.Lead", "Lead")
          .leftJoin("Note.opportunity", "Opportunity")
          .leftJoin("Note.owner", "user")
          .where("Note.leadId = :leadId", { leadId: leadId })
          .andWhere("Note.ownerId = :ownerId", { ownerId: userId })
          .andWhere("Note.organizationId=:organizationId", {
            organizationId: organizationId,
          })
          .orderBy("Note.updatedAt", "DESC");
      } else {
        noteRepo = await AppDataSource.getRepository(Note)
          .createQueryBuilder("Note")
          .select([
            "Note.createdAt",
            "Note.updatedAt",
            "Note.deletedAt",
            "Note.modifiedBy",
            "Note.noteId",
            "Note.note",
            "Note.tags",
            "user.userId",
            "user.email",
            "user.firstName",
            "user.lastName",
            "Account",
            "Contact",
            "Lead",
            "Opportunity",
          ])
          .leftJoin("Note.company", "Account")
          .leftJoin("Note.contact", "Contact")
          .leftJoin("Note.Lead", "Lead")
          .leftJoin("Note.opportunity", "Opportunity")
          .leftJoin("Note.owner", "user")
          .where("Note.leadId = :leadId", { leadId: leadId })
          .andWhere("Note.organizationId=:organizationId", {
            organizationId: organizationId,
          })
          .orderBy("Note.updatedAt", "DESC");
      }

      if (createdAt != undefined) {
        noteRepo.orderBy(
          "Note.createdAt",
          createdAt == "DESC" ? "DESC" : "ASC"
        );
      }

      if (updatedAt != undefined) {
        noteRepo.orderBy(
          "Note.updatedAt",
          updatedAt == "DESC" ? "DESC" : "ASC"
        );
      }

      if (dateRange) {
        if (dateRange.startDate && dateRange.endDate) {
          noteRepo.andWhere(
            "DATE(Note.updatedAt) BETWEEN :startDate AND :endDate",
            {
              startDate: dateRange.startDate,
              endDate: dateRange.endDate,
            }
          );
        }
      }

      const notes = await noteRepo.getMany();

      let searchedData: Note[] = [];

      for (let note of notes) {
        note =
          note !== null && note !== undefined
            ? await noteDecryption(note)
            : note;

        note.Lead =
          note.Lead !== null && note.Lead !== undefined
            ? await leadDecryption(note.Lead)
            : note.Lead;

        note.company =
          note.company !== null && note.company !== undefined
            ? await accountDecryption(note.company as Account)
            : note.company;

        note.contact =
          note.contact !== null && note.contact !== undefined
            ? await contactDecryption(note.contact as Contact)
            : note.contact;

        note.opportunity =
          note.opportunity !== null && note.opportunity !== undefined
            ? await opportunityDecryption(note.opportunity as Oppurtunity)
            : note.opportunity;

        note.owner =
          note.owner !== null && note.owner !== undefined
            ? await userDecryption(note.owner as User)
            : note.owner;
      }

      let skip = 0;
      if (search) {
        skip = 1;

        searchedData = await notes.filter((note) => {
          if (
            note.note
              .toString()
              .toLowerCase()
              .includes(String(search).toLowerCase())
          ) {
            return true;
          }
        });
      }

      if (searchedData.length === 0 && skip === 0) {
        searchedData = notes;
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

  async getNoteByOpportunityId(
    userId: string,
    role: Role[],
    search: string | undefined,
    page: number = 1,
    limit: number = 7,
    createdAt: string,
    updatedAt: string,
    opportunityId: string,
    organizationId: string | null,
    dateRange: DateRangeParamsType
  ) {
    try {
      let noteRepo;
      if (
        role.length === 1 &&
        (role[0].roleName === roleNames.SALESPERSON ||
          role[0].roleName === roleNames.SALESMANAGER)
      ) {
        noteRepo = await AppDataSource.getRepository(Note)
          .createQueryBuilder("Note")
          .select([
            "Note.createdAt",
            "Note.updatedAt",
            "Note.deletedAt",
            "Note.modifiedBy",
            "Note.noteId",
            "Note.note",
            "Note.tags",
            "user.userId",
            "user.email",
            "user.firstName",
            "user.lastName",
            "Account",
            "Contact",
            "Lead",
            "Opportunity",
          ])
          .leftJoin("Note.company", "Account")
          .leftJoin("Note.contact", "Contact")
          .leftJoin("Note.Lead", "Lead")
          .leftJoin("Note.opportunity", "Opportunity")
          .leftJoin("Note.owner", "user")
          .where("Note.opportunityId = :opportunityId", {
            opportunityId: opportunityId,
          })
          .andWhere("Note.ownerId = :ownerId", { ownerId: userId })
          .andWhere("Note.organizationId=:organizationId", {
            organizationId: organizationId,
          })
          .orderBy("Note.updatedAt", "DESC");
      } else {
        noteRepo = await AppDataSource.getRepository(Note)
          .createQueryBuilder("Note")
          .select([
            "Note.createdAt",
            "Note.updatedAt",
            "Note.deletedAt",
            "Note.modifiedBy",
            "Note.noteId",
            "Note.note",
            "Note.tags",
            "user.userId",
            "user.email",
            "user.firstName",
            "user.lastName",
            "Account",
            "Contact",
            "Lead",
            "Opportunity",
          ])
          .leftJoin("Note.company", "Account")
          .leftJoin("Note.contact", "Contact")
          .leftJoin("Note.Lead", "Lead")
          .leftJoin("Note.opportunity", "Opportunity")
          .leftJoin("Note.owner", "user")
          .where("Note.opportunityId = :opportunityId", {
            opportunityId: opportunityId,
          })
          .andWhere("Note.organizationId=:organizationId", {
            organizationId: organizationId,
          })
          .orderBy("Note.updatedAt", "DESC");
      }

      if (createdAt != undefined) {
        noteRepo.orderBy(
          "Note.createdAt",
          createdAt == "DESC" ? "DESC" : "ASC"
        );
      }

      if (updatedAt != undefined) {
        noteRepo.orderBy(
          "Note.updatedAt",
          updatedAt == "DESC" ? "DESC" : "ASC"
        );
      }

      if (dateRange) {
        if (dateRange.startDate && dateRange.endDate) {
          noteRepo.andWhere(
            "DATE(Note.updatedAt) BETWEEN :startDate AND :endDate",
            {
              startDate: dateRange.startDate,
              endDate: dateRange.endDate,
            }
          );
        }
      }

      const notes = await noteRepo.getMany();

      let searchedData: Note[] = [];

      for (let note of notes) {
        note =
          note !== null && note !== undefined
            ? await noteDecryption(note)
            : note;

        note.Lead =
          note.Lead !== null && note.Lead !== undefined
            ? await leadDecryption(note.Lead)
            : note.Lead;

        note.company =
          note.company !== null && note.company !== undefined
            ? await accountDecryption(note.company as Account)
            : note.company;

        note.contact =
          note.contact !== null && note.contact !== undefined
            ? await contactDecryption(note.contact as Contact)
            : note.contact;

        note.opportunity =
          note.opportunity !== null && note.opportunity !== undefined
            ? await opportunityDecryption(note.opportunity as Oppurtunity)
            : note.opportunity;

        note.owner =
          note.owner !== null && note.owner !== undefined
            ? await userDecryption(note.owner as User)
            : note.owner;
      }

      let skip = 0;
      if (search) {
        skip = 1;

        searchedData = await notes.filter((note) => {
          if (
            note.note
              .toString()
              .toLowerCase()
              .includes(String(search).toLowerCase())
          ) {
            return true;
          }
        });
      }

      if (searchedData.length === 0 && skip === 0) {
        searchedData = notes;
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

  async updateNote(noteId: string, payload: Note, user: userInfo) {
    try {
      payload.modifiedBy = user.email;

      const noteRepo = AppDataSource.getRepository(Note);

      let company;
      if (payload.company) {
        company = await AppDataSource.getRepository(Account).findOne({
          where: { accountId: String(payload.company) },
        });
        if (!company) {
          throw new ResourceNotFoundError("Account not found");
        }
        payload.company = company;
      }

      let contact;
      if (payload.contact) {
        contact = await AppDataSource.getRepository(Contact).findOne({
          where: { contactId: String(payload.contact) },
        });
        if (!company) {
          throw new ResourceNotFoundError("Contact not found");
        }
        if (contact) payload.contact = contact;
      }

      let lead;
      if (payload.Lead) {
        lead = await AppDataSource.getRepository(Lead).findOne({
          where: { leadId: String(payload.Lead) },
        });
        if (!lead) {
          throw new ResourceNotFoundError("Lead not found");
        }
        payload.Lead = lead;
      }

      let opportunity;
      if (payload.opportunity) {
        opportunity = await AppDataSource.getRepository(Oppurtunity).findOne({
          where: { opportunityId: String(payload.opportunity) },
        });
        if (!opportunity) {
          throw new ResourceNotFoundError("Opportunity not found");
        }
        if (opportunity) payload.opportunity = opportunity;
      }

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

      let activity;
      if (payload.activity) {
        activity = await AppDataSource.getRepository(Activity).findOne({
          where: { activityId: String(payload.activity) },
        });
        if (!activity) {
          throw new ResourceNotFoundError("Activity not found");
        }
        if (activity) payload.activity = activity;
      }

      const note = new Note(payload);
      const result: UpdateResult = await noteRepo.update(noteId, note);
      return result;
    } catch (error) {
      logger.error(error);
      return;
    }
  }

  async bulkDeleteNote(
    noteIds: Array<string>,
    email: string,
    transactionEntityManager: EntityManager
  ) {
    try {
      const noteRepository = await transactionEntityManager.getRepository(Note);
      const { noteCanBeDelete, noteCanNotBeDeleted } =
        await this.isNoteExistsByIdToBulkdelete(
          transactionEntityManager,
          noteIds
        );
      for (const noteId of noteCanBeDelete) {
        await noteRepository.softDelete(noteId);
        await noteRepository.update(noteId, { modifiedBy: email });
      }
      return { deleted: noteCanBeDelete, notesNotFound: noteCanNotBeDeleted };
    } catch (error) {
      return;
    }
  }
  async isNoteExistsByIdToBulkdelete(
    transactionEntityManager: EntityManager,
    noteIds: Array<string>
  ) {
    const noteCanNotBeDeleted: Array<string> = [];
    const noteCanBeDelete: Array<string> = [];
    for (const noteId of noteIds) {
      const note = await transactionEntityManager
        .getRepository(Note)
        .createQueryBuilder("Note")
        .select(["Note.noteId"])
        .where("Note.noteId=:noteId", { noteId: noteId });

      if (note) {
        noteCanBeDelete.push(noteId);
      } else {
        noteCanNotBeDeleted.push(noteId);
      }
    }
    return { noteCanBeDelete, noteCanNotBeDeleted };
  }

  async getNoteByActivityId(
    userId: string,
    role: Role[],
    search: string | undefined,
    page: number = 1,
    limit: number = 7,
    createdAt: string,
    updatedAt: string,
    activityId: string,
    organizationId: string | null,
    dateRange: DateRangeParamsType
  ) {
    try {
      let noteRepo;
      if (
        role.length === 1 &&
        (role[0].roleName === roleNames.SALESPERSON ||
          role[0].roleName === roleNames.SALESMANAGER)
      ) {
        noteRepo = await AppDataSource.getRepository(Note)
          .createQueryBuilder("Note")
          .select([
            "Note.createdAt",
            "Note.updatedAt",
            "Note.deletedAt",
            "Note.modifiedBy",
            "Note.noteId",
            "Note.note",
            "Note.tags",
            "user.userId",
            "user.email",
            "user.firstName",
            "user.lastName",
            "Account",
            "Contact",
            "Lead",
            "Opportunity",
            "Activity",
          ])
          .leftJoin("Note.company", "Account")
          .leftJoin("Note.contact", "Contact")
          .leftJoin("Note.Lead", "Lead")
          .leftJoin("Note.opportunity", "Opportunity")
          .leftJoin("Note.activity", "Activity")
          .leftJoin("Note.owner", "user")
          .where("Note.activityId = :activityId", { activityId: activityId })
          .andWhere("Note.ownerId = :ownerId", { ownerId: userId })
          .andWhere("Note.organizationId=:organizationId", {
            organizationId: organizationId,
          })
          .orderBy("Note.updatedAt", "DESC");
      } else {
        noteRepo = await AppDataSource.getRepository(Note)
          .createQueryBuilder("Note")
          .select([
            "Note.createdAt",
            "Note.updatedAt",
            "Note.deletedAt",
            "Note.modifiedBy",
            "Note.noteId",
            "Note.note",
            "Note.tags",
            "user.userId",
            "user.email",
            "user.firstName",
            "user.lastName",
            "Account",
            "Contact",
            "Lead",
            "Opportunity",
            "Activity",
          ])
          .leftJoin("Note.company", "Account")
          .leftJoin("Note.contact", "Contact")
          .leftJoin("Note.Lead", "Lead")
          .leftJoin("Note.opportunity", "Opportunity")
          .leftJoin("Note.activity", "Activity")
          .leftJoin("Note.owner", "user")
          .where("Note.activityId = :activityId", { activityId: activityId })
          .andWhere("Note.organizationId=:organizationId", {
            organizationId: organizationId,
          })
          .orderBy("Note.updatedAt", "DESC");
      }

      if (createdAt != undefined) {
        noteRepo.orderBy(
          "Note.createdAt",
          createdAt == "DESC" ? "DESC" : "ASC"
        );
      }

      if (updatedAt != undefined) {
        noteRepo.orderBy(
          "Note.updatedAt",
          updatedAt == "DESC" ? "DESC" : "ASC"
        );
      }

      if (dateRange) {
        if (dateRange.startDate && dateRange.endDate) {
          noteRepo.andWhere(
            "DATE(Note.updatedAt) BETWEEN :startDate AND :endDate",
            {
              startDate: dateRange.startDate,
              endDate: dateRange.endDate,
            }
          );
        }
      }

      const notes = await noteRepo.getMany();

      let searchedData: Note[] = [];

      for (let note of notes) {
        note =
          note !== null && note !== undefined
            ? await noteDecryption(note)
            : note;

        note.Lead =
          note.Lead !== null && note.Lead !== undefined
            ? await leadDecryption(note.Lead)
            : note.Lead;

        note.company =
          note.company !== null && note.company !== undefined
            ? await accountDecryption(note.company as Account)
            : note.company;

        note.contact =
          note.contact !== null && note.contact !== undefined
            ? await contactDecryption(note.contact as Contact)
            : note.contact;

        note.opportunity =
          note.opportunity !== null && note.opportunity !== undefined
            ? await opportunityDecryption(note.opportunity as Oppurtunity)
            : note.opportunity;

        note.activity =
          note.activity !== null && note.activity !== undefined
            ? await activityDecryption(note.activity as Activity)
            : note.activity;

        note.owner =
          note.owner !== null && note.owner !== undefined
            ? await userDecryption(note.owner as User)
            : note.owner;
      }

      let skip = 0;
      if (search) {
        skip = 1;

        searchedData = await notes.filter((note) => {
          if (
            note.note
              .toString()
              .toLowerCase()
              .includes(String(search).toLowerCase())
          ) {
            return true;
          }
        });
      }

      if (searchedData.length === 0 && skip === 0) {
        searchedData = notes;
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
}
export default NoteService;
