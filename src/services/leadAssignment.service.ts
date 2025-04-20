import { AppDataSource } from "../data-source";
import { EntityManager } from "typeorm";
import { LeadAssignment } from "../entity/LeadAssignment";
import { User } from "../entity/User";
import { Role } from "../entity/Role";
import { userInfo } from "../interfaces/types";
import { ResourceNotFoundError, ValidationFailedError } from "../common/errors";
import { encryption, decrypt, roleNames } from "../common/utils";

class LeadAssignmentService {
  /**
   * Get all lead assignments for an organization
   */
  async getAllLeadAssignments(userInfo: userInfo, page = 1, limit = 10, search?: string) {
    // Convert string parameters to numbers
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    
    const leadAssignmentRepository = AppDataSource.getRepository(LeadAssignment);
    const queryBuilder = leadAssignmentRepository.createQueryBuilder("la")
      .leftJoinAndSelect("la.user", "user")
      .leftJoinAndSelect("la.organisation", "organisation")
      .where("la.organisationId = :organisationId", { 
        organisationId: userInfo.organizationId 
      });

    if (search) {
      queryBuilder.andWhere("la.leadType LIKE :search", { search: `%${search}%` });
    }

    const totalRecords = await queryBuilder.getCount();
    const totalPages = Math.ceil(totalRecords / limitNumber);
    const offset = (pageNumber - 1) * limitNumber;

    const leadAssignments = await queryBuilder
      .skip(offset)
      .take(limitNumber)
      .orderBy("la.createdAt", "DESC")
      .getMany();

    // Decrypt sensitive data
    const decryptedLeadAssignments = leadAssignments.map(la => {
      const user = la.user;
      if (user) {
        user.firstName = decrypt(user.firstName);
        user.lastName = decrypt(user.lastName);
        user.email = decrypt(user.email);
      }
      return la;
    });

    return {
      data: decryptedLeadAssignments,
      pagination: {
        totalRecords,
        totalPages,
        currentPage: pageNumber,
        limit: limitNumber
      }
    };
  }

  /**
   * Get a specific lead assignment
   */
  async getLeadAssignment(leadType: string) {
    const leadAssignmentRepository = AppDataSource.getRepository(LeadAssignment);
    const leadAssignment = await leadAssignmentRepository.findOne({
      where: { leadType },
      relations: ["user", "organisation"]
    });

    if (!leadAssignment) {
      return null;
    }

    // Decrypt user data
    if (leadAssignment.user) {
      leadAssignment.user.firstName = decrypt(leadAssignment.user.firstName);
      leadAssignment.user.lastName = decrypt(leadAssignment.user.lastName);
      leadAssignment.user.email = decrypt(leadAssignment.user.email);
    }

    return leadAssignment;
  }

  /**
   * Create a new lead assignment
   */
  async createLeadAssignment(
    data: Partial<LeadAssignment>,
    userInfo: userInfo,
    entityManager?: EntityManager
  ) {
    if (!userInfo.organizationId) {
      throw new ValidationFailedError("Organization ID is required");
    }

    const repository = entityManager 
      ? entityManager.getRepository(LeadAssignment) 
      : AppDataSource.getRepository(LeadAssignment);

    // Check if lead type already exists
    const existingAssignment = await repository.findOne({
      where: { leadType: data.leadType }
    });

    if (existingAssignment) {
      throw new ValidationFailedError("Lead type assignment already exists");
    }

    // Create new lead assignment using authenticated user's info
    const leadAssignment = new LeadAssignment({
      leadType: data.leadType,
      userId: userInfo.userId,
      organisationId: userInfo.organizationId,
      createdBy: userInfo.userId,
      modifiedBy: userInfo.userId,
    });

    return await repository.save(leadAssignment);
  }

  /**
   * Update an existing lead assignment
   */
  async updateLeadAssignment(
    leadType: string,
    data: Partial<LeadAssignment>,
    userInfo: userInfo,
    entityManager?: EntityManager
  ) {
    const repository = entityManager 
      ? entityManager.getRepository(LeadAssignment) 
      : AppDataSource.getRepository(LeadAssignment);
    
    const whereClause: any = { leadType };
    if (userInfo.organizationId !== null) {
      whereClause.organisationId = userInfo.organizationId;
    }

    const leadAssignment = await repository.findOne({
      where: whereClause
    });

    if (!leadAssignment) {
      throw new ResourceNotFoundError("Lead assignment not found");
    }

    const userRepository = entityManager
      ? entityManager.getRepository(User)
      : AppDataSource.getRepository(User);

    // Check if new user exists and belongs to the same organization
    if (data.userId) {
      const user = await userRepository.findOne({
        where: { userId: data.userId },
        relations: ["organisation"]
      });

      if (!user) {
        throw new ResourceNotFoundError("User not found");
      }

      if (user.organisation.organisationId !== userInfo.organizationId) {
        throw new ValidationFailedError("User does not belong to your organization");
      }
    }

    Object.assign(leadAssignment, {
      ...data,
      modifiedBy: userInfo.userId
    });

    return await repository.save(leadAssignment);
  }

  /**
   * Delete a lead assignment
   */
  async deleteLeadAssignment(
    leadType: string, 
    userInfo: userInfo,
    entityManager?: EntityManager
  ) {
    const repository = entityManager 
      ? entityManager.getRepository(LeadAssignment) 
      : AppDataSource.getRepository(LeadAssignment);
    
    const whereClause: any = { leadType };
    if (userInfo.organizationId !== null) {
      whereClause.organisationId = userInfo.organizationId;
    }

    const leadAssignment = await repository.findOne({
      where: whereClause
    });

    if (!leadAssignment) {
      throw new ResourceNotFoundError("Lead assignment not found");
    }

    return await repository.remove(leadAssignment);
  }

  /**
   * Register a new lead type and assign it to the default handler
   */
  async registerLeadType(
    leadType: string,
    organisationId: string,
    userId: string,
    entityManager?: EntityManager
  ) {
    const repository = entityManager 
      ? entityManager.getRepository(LeadAssignment) 
      : AppDataSource.getRepository(LeadAssignment);

    const userRepository = entityManager
      ? entityManager.getRepository(User)
      : AppDataSource.getRepository(User);

    // Check if lead type already exists
    const existingAssignment = await repository.findOne({
      where: { leadType, organisationId }
    });

    // If it exists, just return it
    if (existingAssignment) {
      return existingAssignment;
    }

    // Find the default handler user from INDIAMART_HANDLER_EMAIL
    const indiaMartEmail = process.env.INDIAMART_HANDLER_EMAIL;
    if (!indiaMartEmail) {
      throw new Error('INDIAMART_HANDLER_EMAIL not configured in environment');
    }

    const defaultHandler = await userRepository.findOne({
      where: { 
        email: encryption(indiaMartEmail),
        organisation: { organisationId }
      },
      relations: ['organisation']
    });

    if (!defaultHandler) {
      throw new Error(`Default handler with email ${process.env.INDIAMART_HANDLER_EMAIL} not found in organization`);
    }

    // Create new entry with default handler as the owner
    const leadAssignment = new LeadAssignment({
      leadType,
      organisationId,
      userId: defaultHandler.userId,
      createdBy: userId,
      modifiedBy: userId,
    });

    return await repository.save(leadAssignment);
  }

  /**
   * Get the assigned user for a specific lead type
   */
  async getAssignedUserForLeadType(
    leadType: string,
    organisationId: string,
    entityManager?: EntityManager
  ) {
    const repository = entityManager 
      ? entityManager.getRepository(LeadAssignment) 
      : AppDataSource.getRepository(LeadAssignment);

    const assignment = await repository.findOne({
      where: { leadType, organisationId },
      relations: ["user"]
    });

    console.log(assignment?.user);

    return assignment?.user || null;
  }
}

export default new LeadAssignmentService(); 