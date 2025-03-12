import { AppDataSource } from "../data-source";
import { EntityManager, In } from "typeorm";
import { ResourceNotFoundError } from "../common/errors";
import { encryption } from "../common/utils";
import { Plan } from "../entity/Plan";
import { PlanSchemaType } from "../schemas/plan.schemas";
import { planDecryption, subscriptionDecryption } from "./decryption.service";
import { Request } from "express";

class PlanServices {
  async addPlan(
    payload: PlanSchemaType,
    transactionEntityManager: EntityManager
  ) {
    const plansRepository = transactionEntityManager.getRepository(Plan);

    const monthlyAmount = parseInt(payload.planamount, 10);
    const annualAmount = monthlyAmount * 12;
    const finalAmount =
      annualAmount + (annualAmount * parseInt(payload.gst, 10)) / 100;
    const newPlan = new Plan();
    //Enc Dec of plan data
    newPlan.planamount = encryption(payload.planamount);
    newPlan.annualAmount = encryption(finalAmount.toString());
    newPlan.gst = encryption(payload.gst);
    newPlan.planname = encryption(payload.planname);
    newPlan.description = encryption(payload.description);
    newPlan.noOfDays = encryption(payload.noOfDays);
    newPlan.noOfUsers = encryption(payload.noOfUsers);
    newPlan.features = encryption(payload.features);
    newPlan.currency = payload.currency;
    newPlan.planType = payload.planType;
    const result = await plansRepository.save(newPlan);
    return {
      planId: result.planId,
    };
  }

  async getAllPlans(request: Request) {
    const planType = request.query.planType as string;
    const searchText = request.query.searchText as string;
    const page = parseInt(request.query.page as string, 10) || 1;
    const limit = parseInt(request.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;

    const plansRepository = AppDataSource.getRepository(Plan);
    const query = plansRepository.createQueryBuilder("plan");
    if (planType != "") {
      query.where("plan.planType = :planType", { planType });
    }
    query.select().orderBy("plan.updatedAt", "DESC");
    const [plans, total] = await query.getManyAndCount();

    for (let plan of plans) {
      plan = await planDecryption(plan);
    }
    return {
      plans: filterPlansByQuery(plans, searchText).slice(skip, skip + limit),
      total,
    };
  }

  async getPlanById(planId: string) {
    const plansRepository = AppDataSource.getRepository(Plan);
    const plan = await plansRepository
      .createQueryBuilder("plan")
      .leftJoinAndSelect("plan.subscriptions", "subscription")
      .where("plan.planId = :planId", { planId })
      .select()
      .orderBy("plan.updatedAt", "DESC")
      .getOne();

    if (!plan) {
      throw new ResourceNotFoundError("Plan not found");
    }
    for (let subscription of plan.subscriptions) {
      subscription = await subscriptionDecryption(subscription);
    }
    return await planDecryption(plan);
  }

  async updatePlan(
    planId: string,
    payload: PlanSchemaType,
    transactionEntityManager: EntityManager
  ) {
    const plansRepository = transactionEntityManager.getRepository(Plan);
    const plan = await plansRepository.findOneBy({ planId });
    if (!plan) {
      throw new ResourceNotFoundError("Plan not found");
    }

    const monthlyAmount = parseInt(payload.planamount, 10);
    const annualAmount = monthlyAmount * 12;
    const finalAmount =
      annualAmount + (annualAmount * parseInt(payload.gst, 10)) / 100;

    const newPlan = new Plan();
    newPlan.planId = planId;
    newPlan.planamount = encryption(payload.planamount);
    newPlan.gst = encryption(payload.gst);
    newPlan.annualAmount = encryption(finalAmount.toString());
    newPlan.planname = encryption(payload.planname);
    newPlan.description = encryption(payload.description);
    newPlan.noOfDays = encryption(payload.noOfDays);
    newPlan.noOfUsers = encryption(payload.noOfUsers);
    newPlan.features = encryption(payload.features);
    newPlan.currency = payload.currency;
    newPlan.planType = payload.planType;
    const result = await plansRepository.save(newPlan);
    return planDecryption(result);
  }

  async deletePlan(planId: string) {
    const plansRepository = AppDataSource.getRepository(Plan);
    const plan = await plansRepository.findOneBy({ planId });
    if (!plan) {
      throw new ResourceNotFoundError("Plan not found");
    }
    await plansRepository.softRemove(plan);
    return;
  }

  async bulkDeletePlans(
    transactionEntityManager: EntityManager,
    payload: string[]
  ) {
    const plansRepository = transactionEntityManager.getRepository(Plan);
    if (!payload || payload.length === 0) {
      throw new ResourceNotFoundError("No plans found to delete");
    }

    const plans = await plansRepository.findBy({
      planId: In(payload),
    });
    for (let plan of plans) {
      await plansRepository.softDelete({ planId: plan.planId });
    }

    return;
  }
}

function filterPlansByQuery(plans: Plan[], query: string): Plan[] {
  if (query === undefined || query === "") return plans;

  const lowerCaseQuery = query.toLowerCase();

  return plans.filter((plan) => {
    return (
      plan.planId?.toLowerCase().includes(lowerCaseQuery) ||
      plan.planname?.toLowerCase().includes(lowerCaseQuery) ||
      plan.description?.toLowerCase().includes(lowerCaseQuery) ||
      plan.features?.toLowerCase().includes(lowerCaseQuery)
    );
  });
}

export default PlanServices;
