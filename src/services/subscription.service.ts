import { EntityManager, In } from "typeorm";
import { Subscription } from "../entity/Subscription";
import {
  CreateSubscriptionApiSchemaType,
  SubscriptionSchemaType,
  VerifySubscriptionSchemaType,
} from "../schemas/subscription.schemas";
import { Plan } from "../entity/Plan";
import Razorpay = require("razorpay");
import crypto = require("crypto");
import { ResourceNotFoundError, ValidationFailedError } from "../common/errors";
import { User } from "../entity/User";
import {
  auditType,
  decrypt,
  encryption,
  paymentStatus,
  planType,
  roleNames,
  subscriptionStatus,
} from "../common/utils";
import { AppDataSource } from "../data-source";
import {
  orgnizationDecryption,
  planDecryption,
  subscriptionDecryption,
  userDecryption,
} from "./decryption.service";
import { v4 } from "uuid";
import { Request } from "express";
import { Organisation } from "../entity/Organisation";
import SubscriptionEmailService from "./subscriptionEmail.service";
import { userInfo } from "../interfaces/types";
import { Audit } from "../entity/Audit";
import { sendExpiryNotification } from "./pushNotification.service";
import SuperAdminService from "./superAdmin.service";
import moment = require("moment");

class SubscriptionService {
  private subscriptionEmailService = new SubscriptionEmailService();
  private superAdminService = new SuperAdminService();
  createSubscription = async (
    loggedInUser: userInfo,
    payload: CreateSubscriptionApiSchemaType,
    transactionEntityManager: EntityManager
  ) => {
    const plansRepository = transactionEntityManager.getRepository(Plan);
    const subscription_plan = await plansRepository.findOneBy({
      planId: payload.planId,
    });

    if (!subscription_plan) {
      throw new ResourceNotFoundError("Subscription plan not found");
    }
    const usersRepository = transactionEntityManager.getRepository(User);
    const user = await usersRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.organisation", "organisation")
      .leftJoinAndSelect("user.subscriptions", "subscription")
      .leftJoinAndSelect("subscription.plan", "plan")
      .where("user.userId = :userId", { userId: payload.userId })
      .getOne();

    if (!user) {
      throw new ResourceNotFoundError(
        "User details are invalid, please try again"
      );
    }
    if (subscription_plan.planType === planType.TRIAL) {
      let hasAlreadyAvailedTrial = false;
      for (let subscription of user.subscriptions) {
        if (
          subscription.plan &&
          subscription.plan.planType === planType.TRIAL &&
          subscription.subscription_status !==
            subscriptionStatus.SUBSCRIPTION_PENDING &&
          subscription.payment_status === paymentStatus.SUCCESS
        ) {
          hasAlreadyAvailedTrial = true;
          break;
        }
      }
      if (hasAlreadyAvailedTrial) {
        throw new ResourceNotFoundError(
          "You've already purchased Trial plan in this account"
        );
      }
    }
    //place an order on razorpay
    const RAZORPAY_API_KEY = process.env.RAZORPAY_API_KEY;
    const RAZORPAY_SECRET = process.env.RAZORPAY_API_SECRET;

    if (!RAZORPAY_API_KEY || !RAZORPAY_SECRET) {
      throw new ResourceNotFoundError(
        "Razorpay credentials not found, please try again."
      );
    }

    const razorpay = new Razorpay({
      key_id: RAZORPAY_API_KEY,
      key_secret: RAZORPAY_SECRET,
    });

    const decryptedSubscriptionPlan = await planDecryption(subscription_plan);
    
    const planAmount = parseInt(decryptedSubscriptionPlan.planamount, 10);
    const noOfUsers = parseInt(decryptedSubscriptionPlan.noOfUsers, 10);
    const gst = parseFloat(decryptedSubscriptionPlan.gst);
    
    const totalAmountCalculate =
      (planAmount * 12 * noOfUsers) + (planAmount * 12 * noOfUsers * gst * 0.01);
    
    const options = {
      amount: totalAmountCalculate * 100, // amount in the smallest currency unit
      currency: payload.currency,
      receipt: v4(), //make it dynamic
    };

    try {
      const order = await razorpay.orders.create(options);
      const subscriptionRepository =
        transactionEntityManager.getRepository(Subscription);
      const subscription = new Subscription();

      subscription.admin = user;
      subscription.orgnization = user.organisation;
      subscription.plan = subscription_plan;
      subscription.subscriptionId = encryption(order.id);
      subscription.purchaseDateTime = new Date(order.created_at * 1000); //convert epoch(second to miliseconds first) time to Date
      subscription.startDateTime = null;
      subscription.endDateTime = null;
      subscription.subscription_status =
        subscriptionStatus.SUBSCRIPTION_INACTIVE;
      subscription.payment_status = paymentStatus.PENDING;
      subscription.cancellationDateTime = null;
      await subscriptionRepository.save(subscription);

      //create audit log
      const auditId = String(loggedInUser.auth_time) + loggedInUser.userId;
      await this.createAuditLogHandler(
        transactionEntityManager,
        subscription,
        auditId
      );
      return order;
    } catch (error) {
      throw new ResourceNotFoundError(
        "Not able to create order. Please try again!"
      );
    }
  };

  verifySubscription = async (
    payload: VerifySubscriptionSchemaType,
    userInfo: userInfo
  ) => {
    const subscriptionRepository = AppDataSource.getRepository(Subscription);
    const usersRepository = AppDataSource.getRepository(User);

    const RAZORPAY_API_KEY = process.env.RAZORPAY_API_KEY;
    const RAZORPAY_SECRET = process.env.RAZORPAY_API_SECRET;
    if (!RAZORPAY_API_KEY || !RAZORPAY_SECRET) {
      throw new ResourceNotFoundError(
        "Razorpay credentials not found, could not verify the payment."
      );
    }

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      payload;

    //verify order.
    const sha = crypto.createHmac("sha256", RAZORPAY_SECRET);
    sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = sha.digest("hex");

    if (digest != razorpay_signature) {
      throw new ValidationFailedError(
        "Razorpay signature mismatch, verification failed.."
      );
    }

    //get the order using the order_id
    let subscription_order = await subscriptionRepository.findOneBy({
      subscriptionId: encryption(razorpay_order_id),
    });

    if (!subscription_order) {
      throw new ResourceNotFoundError(
        "Order Verified but subscription order not found, invalid order ID provided.."
      );
    }
    //storing reference for audit log.
    const existingSubsReference: Subscription = Object.assign(
      new Subscription(),
      subscription_order
    );
    const subscription_plan = await planDecryption(subscription_order.plan);

    const plan_duration = subscription_plan.noOfDays;

    let user = await usersRepository.findOne({
      where: { userId: subscription_order.admin.userId },
      relations: ["subscriptions"],
    });

    if (!user) {
      throw new ResourceNotFoundError("User not found");
    }
    user = await userDecryption(user);

    //we're sure about user
    //search in user.subscriptions, can return an array as per current config.
    let active_or_upcoming_subscriptions = user.subscriptions.filter(
      (subscription) => {
        return (
          subscription.subscription_status ==
            subscriptionStatus.SUBSCRIPTION_ACTIVE ||
          subscription.subscription_status ==
            subscriptionStatus.SUBSCRIPTION_UPCOMING
        );
      }
    );

    let newStartDate: Date;
    if (
      active_or_upcoming_subscriptions &&
      active_or_upcoming_subscriptions.length > 0
    ) {
      active_or_upcoming_subscriptions =
        sortSubscriptionsInDescendingOrderByEndDate(
          active_or_upcoming_subscriptions
        );
      newStartDate = getNextDay(
        active_or_upcoming_subscriptions[0].endDateTime!
      );
    } else {
      newStartDate = new Date();
    }

    subscription_order.razorpayPaymentId = encryption(razorpay_payment_id);
    subscription_order.subscription_status =
      subscriptionStatus.SUBSCRIPTION_ACTIVE;
    subscription_order.payment_status = paymentStatus.SUCCESS;
    subscription_order.startDateTime = newStartDate;
    subscription_order.endDateTime = getUpdatedEndDate(
      newStartDate,
      parseInt(plan_duration, 10) - 1
    );
    subscription_order.modifiedBy = userInfo.email;

    await subscriptionRepository.save(subscription_order);

    const auditId = String(userInfo.auth_time) + userInfo.userId;

    await this.updateAuditLogHandler(
      existingSubsReference,
      subscription_order,
      auditId,
      userInfo.email
    );

    //emails will be sent from webhook api.
    return {
      orderId: decrypt(subscription_order.subscriptionId),
      razorpayPaymentId: decrypt(subscription_order.razorpayPaymentId),
      startDateTime: subscription_order.startDateTime,
      endDateTime: subscription_order.endDateTime,
      paymentStatus: subscription_order.payment_status,
    };
  };

  //create subscription API for admin
  createSubscriptionByAdmin = async (
    payload: SubscriptionSchemaType,
    userInfo: userInfo,
    transactionEntityManager: EntityManager
  ) => {
    const subscriptionRepository =
      transactionEntityManager.getRepository(Subscription);
    const organisationRepository =
      transactionEntityManager.getRepository(Organisation);
    const plansRepository = transactionEntityManager.getRepository(Plan);
    const plan = await plansRepository.findOneBy({ planId: payload.planId });
    if (!plan) {
      throw new ResourceNotFoundError("Invalid Plan ID provided");
    }

    const organisation = await organisationRepository
      .createQueryBuilder("org")
      .leftJoinAndSelect("org.users", "user")
      .leftJoinAndSelect("user.roles", "role")
      .where("org.organisationId = :organisationId", {
        organisationId: payload.organisationId,
      })
      .select(["org", "user", "role"])
      .getOne();

    if (!organisation) {
      throw new ResourceNotFoundError(
        "Organisation not found, invalid ID provided"
      );
    }
    const adminUser = organisation.users.find((user) => {
      return user.roles.some((role) => role.roleName === roleNames.ADMIN);
    });

    if (!adminUser) {
      throw new ResourceNotFoundError(
        "Admin User not found for this Organisation, please make sure it has an admin user onboarded."
      );
    }
    //make sure all dates are valid
    const parsedStartDate = new Date(payload.startDateTime);
    if (isNaN(parsedStartDate.getTime())) {
      return new ResourceNotFoundError(
        "Invalid start date provided, format incorrect."
      );
    }
    const parsedPurchaseDateTime = new Date(payload.purchaseDateTime);
    if (isNaN(parsedPurchaseDateTime.getTime())) {
      return new ResourceNotFoundError(
        "Invalid purchase date provided, format incorrect."
      );
    }
    const endDateTime = getUpdatedEndDate(
      parsedStartDate,
      parseInt(payload.customNoOfDays, 10) - 1
    );

    if (isNaN(endDateTime.getTime())) {
      return new ResourceNotFoundError(
        "Invalid end date provided, format incorrect."
      );
    }

    // payload.subscriptionId = encryption(payload.subscriptionId);
    payload.customPlanAmount = encryption(payload.customPlanAmount);
    payload.customNoOfDays = encryption(payload.customNoOfDays);
    payload.customNoOfUsers = encryption(payload.customNoOfUsers);
    payload.customAnnualAmount = encryption(payload.customAnnualAmount);
    payload.notes = encryption(payload.notes);

    const subscription = new Subscription();
    subscription.subscriptionId = encryption(v4());
    subscription.admin = adminUser;
    subscription.orgnization = organisation;
    subscription.plan = plan;
    subscription.purchaseDateTime = parsedPurchaseDateTime;
    subscription.startDateTime = parsedStartDate;
    subscription.endDateTime = endDateTime;
    subscription.subscription_status = payload.subscriptionStatus;
    subscription.payment_status = paymentStatus.SUCCESS;
    subscription.customPlanAmount = payload.customPlanAmount;
    subscription.customNoOfDays = payload.customNoOfDays;
    subscription.customNoOfUsers = payload.customNoOfUsers;
    subscription.customAnnualAmount = payload.customAnnualAmount;
    subscription.notes = payload.notes;

    await subscriptionRepository.save(subscription);
    // create audit log
    const superAdmin = await this.superAdminService.getSuperAdmin(
      userInfo.userId
    );
    const auditId = v4();
    const auditRepository = transactionEntityManager.getRepository(Audit);
    const description = `Subscription Order Created By Admin.:
    subscriptionId: ${decrypt(subscription.subscriptionId)}
    subscription_status: ${subscription.subscription_status}
    payment_status: ${subscription.payment_status}
    razorpay_payment_id: ${subscription.razorpayPaymentId}
    `;
    const auditPayload = {
      auditId,
      description: encryption(description),
      auditType: auditType.INSERTED,
      subscription: subscription,
      owner: subscription.admin,
      modifiedBy: "Super Admin",
    };
    const auditInstance = new Audit(auditPayload as Audit);
    await auditRepository.save(auditInstance);
    return decrypt(subscription.subscriptionId);
  };

  getAllSubscriptions = async (request: Request) => {
    const days = request.query.days as string;
    const planType = request.query.planType as string;
    const payment_status = (request.query.payment_status as string) || "";
    const subscription_status =
      (request.query.subscription_status as string) || "";

    const page = parseInt(request.query.page as string, 10) || 1;
    const limit = parseInt(request.query.limit as string, 10) || 10;
    const searchText = (request.query.searchText as string) || "";
    const fromDate =
      request.query.fromDate === ""
        ? null
        : new Date(request.query.fromDate as string);
    const toDate =
      request.query.toDate === ""
        ? null
        : new Date(request.query.toDate as string);

    if (
      (fromDate && isNaN(fromDate.getTime())) ||
      (toDate && isNaN(toDate.getTime()))
    ) {
      throw new Error("Invalid date provided, format incorrect.");
    }
    if (fromDate && toDate && fromDate > toDate) {
      throw new Error("From date cannot be greater than to date.");
    }

    const skip = (page - 1) * limit;
    const subscriptionRepository = AppDataSource.getRepository(Subscription);
    const today = new Date();
    const expiryDate =
      days != "" ? getUpdatedEndDate(today, parseInt(days, 10)) : null;
    const query = subscriptionRepository
      .createQueryBuilder("subscription")
      .leftJoinAndSelect("subscription.plan", "plan")
      .leftJoinAndSelect("subscription.admin", "admin")
      .leftJoinAndSelect("subscription.orgnization", "orgnization");
    if (expiryDate) {
      query.where("subscription.endDateTime <= :endDate", {
        endDate: expiryDate,
      });
    }
    if (fromDate && toDate) {
      query.where(
        "subscription.purchaseDateTime between :fromDate and :toDate",
        { fromDate: fromDate, toDate: toDate }
      );
    }
    if (planType != "") {
      query.andWhere("plan.planType = :planType", { planType: planType });
    }
    if (payment_status != "") {
      query.andWhere("subscription.payment_status = :payment_status", {
        payment_status,
      });
    }
    if (subscription_status != "") {
      query.andWhere(
        "subscription.subscription_status = :subscription_status",
        {
          subscription_status,
        }
      );
    }

    query.orderBy("subscription.updatedAt", "DESC");

    const [subscriptions, total] = await query.getManyAndCount();

    for (let subscription of subscriptions) {
      subscription = await subscriptionDecryption(subscription);
      subscription.plan = await planDecryption(subscription.plan!);
      subscription.admin = await userDecryption(subscription.admin!);
      subscription.orgnization = await orgnizationDecryption(
        subscription.orgnization!
      );
    }
    const filteredSubscriptions = filterSubscriptionsByQuery(
      subscriptions,
      searchText
    );

    return {
      subscriptions: filteredSubscriptions.slice(skip, skip + limit),
      total,
    };
  };

  getSubscriptionById = async (subscriptionId: string) => {
    const subscriptionRepository = AppDataSource.getRepository(Subscription);
    const encryptedSubscriptionId = encryption(subscriptionId);
    let subscription = await subscriptionRepository
      .createQueryBuilder("subscription")
      .leftJoinAndSelect("subscription.plan", "plan")
      .leftJoinAndSelect("subscription.admin", "admin")
      .leftJoinAndSelect("subscription.orgnization", "orgnization")
      .where("subscription.subscriptionId = :subscriptionId", {
        subscriptionId: encryptedSubscriptionId,
      })
      .select()
      .getOne();

    if (subscription) {
      subscription = await subscriptionDecryption(subscription);
      subscription.plan = await planDecryption(subscription.plan!);
      subscription.admin = await userDecryption(subscription.admin!);
      subscription.orgnization = await orgnizationDecryption(
        subscription.orgnization!
      );
    } else {
      throw new ResourceNotFoundError("Subscription not found");
    }
    return subscription;
  };

  getSubscriptionsWithPlanType = async (
    planType: string,
    subscription_status: string
  ) => {
    const subscriptionRepository = AppDataSource.getRepository(Subscription);
    const query = subscriptionRepository
      .createQueryBuilder("subscription")
      .leftJoinAndSelect("subscription.plan", "plan");

    if (subscription_status != "") {
      query.where("subscription.subscription_status = :subscription_status", {
        subscription_status: subscription_status,
      });
    }
    if (planType != "") {
      query.andWhere("plan.planType = :planType", { planType: planType });
    }
    query.select().orderBy("subscription.updatedAt", "DESC");

    const subscriptions = await query.getMany();

    for (let subscription of subscriptions) {
      subscription = await subscriptionDecryption(subscription);
      subscription.plan = await planDecryption(subscription.plan!);
    }
    return subscriptions;
  };

  getUserSubscriptions = async (userId: string) => {
    const subscriptionRepository = AppDataSource.getRepository(Subscription);
    const subscriptions = await subscriptionRepository
      .createQueryBuilder("subscription")
      .leftJoinAndSelect("subscription.admin", "admin")
      .leftJoinAndSelect("subscription.plan", "plan")
      .where("admin.userId = :userId", { userId })
      .select(["subscription", "plan"])
      .orderBy("subscription.updatedAt", "DESC")
      .getMany();

    for (let subscription of subscriptions) {
      subscription = await subscriptionDecryption(subscription);
      subscription.plan = await planDecryption(subscription.plan!);
    }

    return subscriptions;
  };

  getUserActiveSubscription = async (userId: string) => {
    const subscriptionRepository = AppDataSource.getRepository(Subscription);
    const subscription = await subscriptionRepository.findOne({
      where: {
        admin: { userId: userId },
        subscription_status: subscriptionStatus.SUBSCRIPTION_ACTIVE,
        payment_status: paymentStatus.SUCCESS,
      },
    });

    // -------------------------------- user emails  -----------------------

    // await this.subscriptionEmailService.advancedSubscriptionPurchase(
    //   "Ajeet",
    //   process.env.SUPER_ADMIN_EMAIL!,
    //   "Standard Subscription Plan",
    //   "abcd-2392-cdfc-1234",
    //   "2 june",
    //   "10 Dec",
    //   "999"
    // );

    // await this.subscriptionEmailService.subscriptionActivation(
    //   "Ajeet",
    //   process.env.SUPER_ADMIN_EMAIL!,
    //   "Standard Subscription Plan",
    //   "abcd-2392-cdfc-1234",
    //   "26 June 2025",
    //   "2 june"
    // );

    // -------------------------------- admin emails  -----------------------

    // await this.subscriptionEmailService.subscriptionReport(
    //   "Admin",
    //   process.env.SUPER_ADMIN_EMAIL!,
    //   "1 Dec",
    //   "26 June 2025",
    //   100,
    //   923
    // );

    // ------------------------------ finished.  -----------------------
    if (!subscription) {
      return null;
    }
    await subscriptionDecryption(subscription);
    subscription.plan = await planDecryption(subscription.plan!);
    subscription.admin = await userDecryption(subscription.admin!);
    subscription.admin.organisation = await orgnizationDecryption(
      subscription.admin!.organisation!
    );
    subscription.orgnization = await orgnizationDecryption(
      subscription.orgnization!
    );
    return subscription;
  };

  cancelSubscription = async (
    transcactionEntityManager: EntityManager,
    subscriptionId: string,
    userInfo: userInfo
  ) => {
    const subscriptionRepository =
      transcactionEntityManager.getRepository(Subscription);
    const encryptedId = encryption(subscriptionId);
    const subscription = await subscriptionRepository.findOne({
      where: { subscriptionId: encryptedId },
    });

    if (!subscription) {
      throw new ResourceNotFoundError(
        "Subscription not found, invalid subscriptionId provided."
      );
    }

    subscription.subscription_status =
      subscriptionStatus.SUBSCRIPTION_CANCELLED;
    subscription.cancellationDateTime = new Date();

    await subscriptionRepository.save(subscription);

    //create audit
    const auditId = String(userInfo.auth_time) + userInfo.userId;
    await this.cancelAuditLogHandler(
      transcactionEntityManager,
      subscription,
      auditId,
      userInfo.email
    );
    const decryptedSubsObject = await subscriptionDecryption(subscription);
    decryptedSubsObject.admin = await userDecryption(
      decryptedSubsObject.admin!
    );
    decryptedSubsObject.plan = await planDecryption(decryptedSubsObject.plan!);

    const userName =
      decryptedSubsObject.admin?.firstName +
      " " +
      decryptedSubsObject.admin?.lastName;
    const email = decryptedSubsObject.admin?.email;
    const planName = decryptedSubsObject.plan?.planname;
    const cancellationDate = decryptedSubsObject.cancellationDateTime!;

    try {
      //inform client.
      await this.subscriptionEmailService.subscriptionCancellation(
        userName,
        email,
        planName,
        subscriptionId,
        cancellationDate.toDateString()
      );
      //inform admin.
      await this.subscriptionEmailService.cancellationRequested(
        "Admin",
        userName,
        process.env.SUPER_ADMIN_EMAIL!,
        subscriptionId,
        planName,
        cancellationDate.toDateString()
      );
    } catch (error) {}
    return {};
  };

  deleteSubscription = async (
    transcactionEntityManager: EntityManager,
    subscriptionId: string,
    userInfo: userInfo
  ) => {
    const subscriptionRepository =
      transcactionEntityManager.getRepository(Subscription);
    const encryptedId = encryption(subscriptionId);

    const subscriptionWithAdmin = await subscriptionRepository.findOneBy({
      subscriptionId: encryptedId,
    });

    const subscription = await subscriptionRepository
      .createQueryBuilder("subscription")
      .where("subscription.subscriptionId = :subscriptionId", {
        subscriptionId: encryptedId,
      })
      .getOne();

    if (!subscription || !subscriptionWithAdmin) {
      throw new ResourceNotFoundError(
        "Subscription not found, invalid subscriptionId provided."
      );
    }

    await subscriptionRepository.softRemove(subscription);
    //create audit
    const auditId = String(userInfo.auth_time) + userInfo.userId;
    await this.deleteAuditLogHandler(
      transcactionEntityManager,
      subscriptionWithAdmin,
      auditId,
      userInfo.email
    );
    return {};
  };

  bulkDeleteSubscriptions = async (
    transcactionEntityManager: EntityManager,
    subscriptionIds: string[],
    userInfo: userInfo
  ) => {
    const subscriptionRepository =
      transcactionEntityManager.getRepository(Subscription);
    const encryptedIds = subscriptionIds.map((id) => encryption(id));

    const subscriptions = await subscriptionRepository.findBy({
      subscriptionId: In(encryptedIds),
    });
    for (let subscription of subscriptions) {
      await subscriptionRepository.softDelete(subscription.subscriptionId);
      const auditId = String(userInfo.auth_time) + userInfo.userId;
      await this.deleteAuditLogHandler(
        transcactionEntityManager,
        subscription,
        auditId,
        userInfo.email
      );
    }
    return {};
  };

  getStatisticsDataForSuperAdmin = async () => {
    const response = {
      totalUsers: 0,
      totalOrganisations: 0,
      totalSubscribers: 0,
      totalTrialUsers: 0,
      activeSubscribers: 0,
      activeTrialUsers: 0,
      expiringSubscriptions: 0,
      expiringTrials: 0,
    };
    const today = new Date();
    const dateAfterAMonth = getUpdatedEndDate(today, 30);

    const userRepository = AppDataSource.getRepository(User);
    const organisationRepository = AppDataSource.getRepository(Organisation);

    const totalUsers = await userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.organisation", "organisation")
      .leftJoinAndSelect("user.subscriptions", "subscription")
      .leftJoinAndSelect("subscription.plan", "plan")
      .where("organisation.organisationId IS NOT NULL")
      .getMany();
    response.totalUsers = totalUsers.length;
    response.totalOrganisations = await organisationRepository.count();

    const successPaymentStatus = paymentStatus.SUCCESS;

    //get all who have ever purchased a subscription, may not have an active one.
    response.totalSubscribers = totalUsers.filter((user) => {
      return (
        user.subscriptions &&
        user.subscriptions.some(
          (subscription) =>
            subscription.plan?.planType === planType.SUBSCRIPTION &&
            subscription.payment_status === successPaymentStatus
        )
      );
    }).length;

    response.totalTrialUsers = totalUsers.filter((user) => {
      return (
        user.subscriptions &&
        user.subscriptions.some(
          (subscription) =>
            subscription.plan?.planType === planType.TRIAL &&
            subscription.payment_status === successPaymentStatus
        )
      );
    }).length;

    response.activeSubscribers = totalUsers.filter((user) => {
      return (
        user.subscriptions &&
        user.subscriptions.some(
          (subscription) =>
            subscription.plan?.planType === planType.SUBSCRIPTION &&
            subscription.payment_status === successPaymentStatus &&
            subscription.subscription_status ===
              subscriptionStatus.SUBSCRIPTION_ACTIVE
        )
      );
    }).length;

    response.activeTrialUsers = totalUsers.filter((user) => {
      return (
        user.subscriptions &&
        user.subscriptions.some(
          (subscription) =>
            subscription.plan?.planType === planType.TRIAL &&
            subscription.payment_status === successPaymentStatus &&
            subscription.subscription_status ===
              subscriptionStatus.SUBSCRIPTION_ACTIVE
        )
      );
    }).length;

    response.expiringSubscriptions = totalUsers.filter((user) => {
      return (
        user.subscriptions &&
        user.subscriptions.some(
          (subscription) =>
            subscription.plan?.planType === planType.SUBSCRIPTION &&
            subscription.payment_status === successPaymentStatus &&
            subscription.subscription_status ===
              subscriptionStatus.SUBSCRIPTION_ACTIVE &&
            subscription.endDateTime &&
            subscription.endDateTime <= dateAfterAMonth
        )
      );
    }).length;

    response.expiringTrials = totalUsers.filter((user) => {
      return (
        user.subscriptions &&
        user.subscriptions.some(
          (subscription) =>
            subscription.plan?.planType === planType.TRIAL &&
            subscription.payment_status === successPaymentStatus &&
            subscription.subscription_status ===
              subscriptionStatus.SUBSCRIPTION_ACTIVE &&
            subscription.endDateTime &&
            subscription.endDateTime <= dateAfterAMonth
        )
      );
    }).length;
    return response;
  };

  //called by webhook.
  updatePaymentStatus = async (request: Request) => {
    const payload = request.body;
    const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET!;

    const sha = crypto.createHmac("sha256", RAZORPAY_WEBHOOK_SECRET);
    sha.update(JSON.stringify(payload));
    const digest = sha.digest("hex");

    if (digest === request.headers["x-razorpay-signature"]) {
      try {
        const entity = payload.payload.payment.entity;
        const subscriptionRepository =
          AppDataSource.getRepository(Subscription);

        const razorpay_order_id = entity.order_id;
        const razorpay_payment_id = entity.id;
        const failureReason = entity.error_description;
        if (
          request.body.event === "payment.captured" &&
          entity.captured === true
        ) {
          await this.updateSubscriptionDetails(
            razorpay_order_id,
            razorpay_payment_id
          );
        } else if (
          request.body.event === "payment.failed" &&
          entity.captured === false
        ) {
          const subscriptionId = encryption(entity.order_id);

          const subscription = await subscriptionRepository.findOneBy({
            subscriptionId: subscriptionId,
          });

          const username = `${decrypt(
            subscription?.admin?.firstName || ""
          )} ${decrypt(subscription?.admin?.lastName || "")}`;
          const email = decrypt(subscription?.admin?.email || "");
          const planName = decrypt(subscription?.plan?.planname || "");
          if (subscription) {
            //sign of duplicate webhook req.
            if (subscription.payment_status === paymentStatus.FAILED) {
              return;
            }
            const existingSubsReference: Subscription = Object.assign(
              new Subscription(),
              subscription
            );

            subscription.payment_status = paymentStatus.FAILED;
            await subscriptionRepository.save(subscription);
            //create audit for subscription update.

            const auditId = v4();
            await this.updateAuditLogHandler(
              existingSubsReference,
              subscription,
              auditId,
              email
            );
            //email user.
            await this.subscriptionEmailService.subscriptionFailure(
              username,
              email,
              planName,
              razorpay_order_id,
              failureReason
            );
          }
        }
      } catch (error) {
        console.log("error sending emails... ", error);
      }
    } else {
      console.log("not legit request, ignoring...");
    }
    return true;
  };

  updateSubscriptionDetails = async (
    subscriptionId: string,
    razorpay_payment_id: string
  ) => {
    const subscriptionRepository = AppDataSource.getRepository(Subscription);
    const usersRepository = AppDataSource.getRepository(User);

    //get the order using the order_id
    const subscription_order = await subscriptionRepository.findOneBy({
      subscriptionId: encryption(subscriptionId),
    });

    if (!subscription_order) {
      return;
    }
    //sign of duplicate webhook req.
    if (subscription_order.payment_status == paymentStatus.SUCCESS) {
      return;
    }
    //storing reference for audit log.
    const existingSubsReference: Subscription = Object.assign(
      new Subscription(),
      subscription_order
    );

    const username = `${decrypt(
      subscription_order?.admin?.firstName || ""
    )} ${decrypt(subscription_order?.admin?.lastName || "")}`;
    const email = decrypt(subscription_order?.admin?.email || "");
    const planName = decrypt(subscription_order?.plan?.planname || "");
    const subscription_plan = await planDecryption(subscription_order.plan);

    const plan_duration = subscription_plan.noOfDays;

    let user = await usersRepository.findOne({
      where: { userId: subscription_order.admin.userId },
      relations: ["subscriptions"],
    });

    if (!user) {
      return;
    }
    user = await userDecryption(user);

    //we're sure about user
    //search in user.subscriptions, can return an array as per current config.
    //compare with ids to avoid picking current subs in case of duplicate req.
    let active_or_upcoming_subscriptions = user.subscriptions.filter(
      (subscription) => {
        return (
          (subscription.subscription_status ==
            subscriptionStatus.SUBSCRIPTION_ACTIVE ||
            subscription.subscription_status ==
              subscriptionStatus.SUBSCRIPTION_UPCOMING) &&
          subscription.subscriptionId != subscription_order.subscriptionId
        );
      }
    );

    let newStartDate: Date;
    if (
      active_or_upcoming_subscriptions &&
      active_or_upcoming_subscriptions.length > 0
    ) {
      active_or_upcoming_subscriptions =
        sortSubscriptionsInDescendingOrderByEndDate(
          active_or_upcoming_subscriptions
        );
      newStartDate = getNextDay(
        active_or_upcoming_subscriptions[0].endDateTime!
      );
    } else {
      newStartDate = new Date();
    }

    subscription_order.razorpayPaymentId = encryption(razorpay_payment_id);
    //we'll not mark any to upcoming, decide by end date.
    subscription_order.subscription_status =
      subscriptionStatus.SUBSCRIPTION_ACTIVE;
    subscription_order.payment_status = paymentStatus.SUCCESS;
    subscription_order.startDateTime = newStartDate;
    subscription_order.endDateTime = getUpdatedEndDate(
      newStartDate,
      parseInt(plan_duration, 10) - 1
    );
    subscription_order.modifiedBy = user.email;

    await subscriptionRepository.save(subscription_order);

    //create audit for subscription update.
    const auditId = v4();
    await this.updateAuditLogHandler(
      existingSubsReference,
      subscription_order,
      auditId,
      user.email
    );

    try {
      //email user.
      await this.subscriptionEmailService.orderSuccess(
        username,
        email,
        planName,
        subscriptionId,
        razorpay_payment_id,
        subscription_order.subscription_status,
        subscription_order.payment_status
      );
      //email admin
      const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;
      if (!SUPER_ADMIN_EMAIL) {
        return;
      }
      // console.log("emailing admin...", SUPER_ADMIN_EMAIL);
      await this.subscriptionEmailService.subscriptionReceived(
        "Admin",
        username,
        email,
        process.env.SUPER_ADMIN_EMAIL!,
        subscriptionId,
        razorpay_payment_id,
        planName
      );
    } catch (error) {}
  };

  getExpiringSubscriptionsAndSendReminders = async () => {
    const today = new Date();
    const tomorrow = formatDate(getUpdatedEndDate(today, 1));
    const dateAfterAMonth = formatDate(getUpdatedEndDate(today, 30));
    const dateAfter15Days = formatDate(getUpdatedEndDate(today, 15));
    const dateAfter7Days = formatDate(getUpdatedEndDate(today, 7));

    const subscriptions = await this.getExpiringSubscriptions();
    for (const subscription of subscriptions) {
      if (subscription.endDateTime === null) continue;
      const userName = subscription.admin.firstName;
      const userEmail = subscription.admin.email;
      const planName = subscription.plan?.planname;
      const expiryDate = formatDate(subscription.endDateTime);
      const fcmWebToken = subscription.admin.fcmWebToken;
      const fcmAndroidToken = subscription.admin.fcmAndroidToken;
      const tokens = [];
      if (fcmAndroidToken) tokens.push(fcmAndroidToken);
      if (fcmWebToken) tokens.push(fcmWebToken);

      try {
        await this.subscriptionEmailService.subscriptionExpiryReminder(
          userName,
          userEmail,
          planName,
          expiryDate
        );
        let remaningDays;
        if (expiryDate == dateAfterAMonth) {
          remaningDays = 30;
        } else if (expiryDate == dateAfter15Days) {
          remaningDays = 15;
        } else if (expiryDate == dateAfter7Days) {
          remaningDays = 7;
        } else if (expiryDate == tomorrow) {
          remaningDays = 1;
        }
        const title = `Reminder: Your Subscription is Expiring!`;
        const description = `Dear ${userName},\n\nYour ${planName} subscription is expiring in ${remaningDays} days. Please renew your subscription to avoid any disruption.`;

        await sendExpiryNotification(tokens, title, description);
      } catch (error) {
        console.log("Error sending email or notification: ", error);
      }
    }
  };

  getExpiringSubscriptions = async () => {
    const today = new Date();
    const tomorrow = formatDate(getUpdatedEndDate(today, 1));
    const dateAfterAMonth = formatDate(getUpdatedEndDate(today, 30));
    const dateAfter15Days = formatDate(getUpdatedEndDate(today, 15));
    const dateAfter7Days = formatDate(getUpdatedEndDate(today, 7));

    const subscriptionRepository = AppDataSource.getRepository(Subscription);
    const subscriptions = await subscriptionRepository
      .createQueryBuilder("subscription")
      .leftJoinAndSelect("subscription.plan", "plan")
      .leftJoinAndSelect("subscription.admin", "admin")
      .where("subscription.subscription_status = :subscriptionStatus", {
        subscriptionStatus: subscriptionStatus.SUBSCRIPTION_ACTIVE,
      })
      // .andWhere("plan.planType = :planType", {
      //   planType: planType.SUBSCRIPTION,
      // })
      .andWhere(
        "DATE(subscription.endDateTime) = :dateAfterAMonth OR DATE(subscription.endDateTime) = :dateAfter15Days OR DATE(subscription.endDateTime) = :dateAfter7Days OR DATE(subscription.endDateTime) = :dateAfterTomorrow",
        {
          dateAfterAMonth: dateAfterAMonth,
          dateAfter15Days: dateAfter15Days,
          dateAfter7Days: dateAfter7Days,
          dateAfterTomorrow: tomorrow,
        }
      )
      .getMany();

    for (let subscription of subscriptions) {
      subscription = await subscriptionDecryption(subscription);
      subscription.plan = await planDecryption(subscription.plan);
      subscription.admin = await userDecryption(subscription.admin!);
    }
    return subscriptions;
  };

  updateSubscriptionStatusAndSendReminders = async () => {
    const today = new Date();
    today.setHours(0, 30, 0, 0); // Set time to 00:30:00

    const usersRepository = AppDataSource.getRepository(User);
    const subscriptionRepository = AppDataSource.getRepository(Subscription);

    const users = await usersRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.subscriptions", "subscription")
      .leftJoinAndSelect("user.roles", "role")
      .leftJoinAndSelect("subscription.plan", "plan")
      .where("subscription.subscription_status IN (:...subscriptionStatuses)", {
        subscriptionStatuses: [
          subscriptionStatus.SUBSCRIPTION_ACTIVE,
          subscriptionStatus.SUBSCRIPTION_UPCOMING,
        ],
      })
      .distinct(true)
      .getMany();

    for (let user of users) {
      //only for admins.
      const isAdmin = user.roles.some(
        (role) => role.roleName === roleNames.ADMIN
      );
      if (!isAdmin) {
        continue;
      }

      const totalSubscriptions = user.subscriptions.length;
      if (totalSubscriptions === 0) {
        continue;
      }
      const userName = `${decrypt(user.firstName)} ${decrypt(user.lastName)}`;
      const email = decrypt(user.email);
      try {
        let nearestExpiringSubscription: Subscription | null = null;
        for (const subscription of user.subscriptions) {
          if (
            subscription.subscription_status ===
              subscriptionStatus.SUBSCRIPTION_ACTIVE ||
            subscription.subscription_status ===
              subscriptionStatus.SUBSCRIPTION_UPCOMING
          ) {
            if (!subscription.endDateTime) {
              subscription.subscription_status =
                subscriptionStatus.SUBSCRIPTION_INACTIVE;
              await subscriptionRepository.save(subscription);
              continue;
            }
            const endDateTime = new Date(subscription.endDateTime);
            if (endDateTime < today) {
              subscription.subscription_status =
                subscriptionStatus.SUBSCRIPTION_INACTIVE;
              if (!nearestExpiringSubscription) {
                nearestExpiringSubscription = subscription;
              } else if (nearestExpiringSubscription) {
                const currentDueDate = new Date(
                  nearestExpiringSubscription.endDateTime!
                );
                const newDate = new Date(subscription.endDateTime!);
                if (newDate > currentDueDate) {
                  nearestExpiringSubscription = subscription;
                }
              }
              await subscriptionRepository.save(subscription);
            }
          }
        }
        if (!nearestExpiringSubscription) continue;
        const currentPlanName = decrypt(
          nearestExpiringSubscription.plan.planname
        );
        await this.subscriptionEmailService.subscriptionExpiration(
          userName,
          email,
          currentPlanName,
          `${nearestExpiringSubscription.endDateTime}`
        );
      } catch (error) {
        console.log("error sending emails", error, user);
      }
    }
  };

  sendMonthlyReportToSuperAdmin = async () => {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1);
    today.setHours(0, 0, 0, 0); // Set time to 00:00:00
    lastMonth.setHours(0, 0, 0, 0);
    const usersRepository = AppDataSource.getRepository(User);
    const organisationRepository = AppDataSource.getRepository(Organisation);
    const subscriptionRepository = AppDataSource.getRepository(Subscription);

    const users = await usersRepository
      .createQueryBuilder("user")
      .where("user.createdAt >= :lastMonth AND user.createdAt <= :today", {
        lastMonth,
        today,
      })
      .getCount();
    const organisations = await organisationRepository
      .createQueryBuilder("organisation")
      .where(
        "organisation.createdAt >= :lastMonth AND organisation.createdAt <= :today",
        { lastMonth, today }
      )
      .getCount();

    const subscriptions = await subscriptionRepository
      .createQueryBuilder("subscription")
      .where(
        "subscription.createdAt >= :lastMonth AND subscription.createdAt <= :today",
        { lastMonth, today }
      )
      .andWhere("subscription.payment_status = :paymentStatus", {
        paymentStatus: paymentStatus.SUCCESS,
      })
      .getCount();

    try {
      //send email
      const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;
      const SUPER_ADMIN_NAME = process.env.SUPER_ADMIN_NAME;
      if (SUPER_ADMIN_EMAIL && SUPER_ADMIN_NAME) {
        await this.subscriptionEmailService.subscriptionReport(
          SUPER_ADMIN_NAME,
          SUPER_ADMIN_EMAIL,
          formatDate(lastMonth),
          formatDate(today),
          subscriptions,
          users,
          organisations
        );
      }
    } catch (error) {
      console.log("error sending emails", error);
    }
  };

  /**
   *
   * AUDIT APIs
   *
   */
  createAuditLogHandler = async (
    transactionEntityManager: EntityManager,
    subscription: Subscription,
    auditId: string
  ) => {
    const auditRepository = transactionEntityManager.getRepository(Audit);
    const description = `Subscription Order Created:
    subscriptionId: ${decrypt(subscription.subscriptionId)}
    subscription_status: ${subscription.subscription_status}
    payment_status: ${subscription.payment_status}
    razorpay_payment_id: ${subscription.razorpayPaymentId}
    `;
    const payload = {
      auditId,
      description: encryption(description),
      auditType: auditType.INSERTED,
      subscription: subscription,
      owner: subscription.admin,
      modifiedBy: decrypt(subscription.admin.email),
    };
    const auditInstance = new Audit(payload as Audit);
    return await auditRepository.save(auditInstance);
  };

  updateAuditLogHandler = async (
    subscription: Subscription,
    updatedSubscription: Subscription,
    auditId: string,
    modifiedBy: string
  ) => {
    const auditRepository = AppDataSource.getRepository(Audit);
    const subscriptionId = decrypt(subscription.subscriptionId);
    const razorpay_payment_id = decrypt(subscription.razorpayPaymentId);
    const updated_razorpay_payment_id = decrypt(
      updatedSubscription.razorpayPaymentId
    );

    const description = `Subscription with id: ${subscriptionId} updated with following details:,
    razorpay_payment_id: ${razorpay_payment_id} -> ${updated_razorpay_payment_id},
    payment_status: ${subscription.payment_status} -> ${updatedSubscription.payment_status},
    subscription_status: ${subscription.subscription_status} -> ${updatedSubscription.subscription_status},
    startDate: ${subscription.startDateTime} -> ${updatedSubscription.startDateTime},
    endDate: ${subscription.endDateTime} -> ${updatedSubscription.endDateTime},
    `;

    const payload = {
      auditId,
      description: encryption(description),
      subscription: subscription,
      auditType: auditType.UPDATED,
      owner: subscription.admin,
      modifiedBy: modifiedBy,
    };

    const auditInstance = new Audit(payload as Audit);
    await auditRepository.insert(auditInstance);
    return;
  };

  cancelAuditLogHandler = async (
    transactionEntityManager: EntityManager,
    subscription: Subscription,
    auditId: string,
    modifiedBy: string
  ) => {
    const auditRepository = transactionEntityManager.getRepository(Audit);
    const subscriptionId = decrypt(subscription.subscriptionId);
    const formattedDate = moment(subscription.cancellationDateTime)
      .utc()
      .format("MMM DD YYYY HH:mm:ss");
    const description = `Subscription cancelled:
    id: ${subscriptionId}
    subscription_status: ${subscription.subscription_status}
    cencellation_date: ${formattedDate}
    `;
    const payload = {
      auditId,
      description: encryption(description),
      subscription: subscription,
      owner: subscription.admin,
      modifiedBy: modifiedBy,
      auditType: auditType.UPDATED,
    };
    const auditInstance = new Audit(payload as Audit);
    return await auditRepository.save(auditInstance);
  };

  deleteAuditLogHandler = async (
    transactionEntityManager: EntityManager,
    subscription: Subscription,
    auditId: string,
    modifiedBy: string
  ) => {
    const auditRepository = transactionEntityManager.getRepository(Audit);
    const subscriptionId = decrypt(subscription.subscriptionId);
    const description = `Subscription deleted:
    id: ${subscriptionId}
    `;
    const payload = {
      auditId,
      description: encryption(description),
      subscription: subscription,
      auditType: auditType.DELETED,
      owner: subscription.admin,
      modifiedBy: modifiedBy,
    };
    const auditInstance = new Audit(payload as Audit);
    return await auditRepository.insert(auditInstance);
  };
}

function getNextDay(date: Date): Date {
  const nextDay = new Date(date);
  nextDay.setDate(date.getDate() + 1);
  return nextDay;
}
function getUpdatedEndDate(startDate: Date, duration: number): Date {
  const newDate = new Date(startDate);
  newDate.setDate(newDate.getDate() + duration);
  return newDate;
}

function filterSubscriptionsByQuery(
  subscriptions: Subscription[],
  query: string
): Subscription[] {
  if (query === undefined || query === "") return subscriptions;

  const lowerCaseQuery = query.toLowerCase();

  return subscriptions.filter((subscription) => {
    const { subscriptionId, plan, admin, orgnization } = subscription;

    return (
      subscriptionId?.toLowerCase().includes(lowerCaseQuery) ||
      plan.planId?.toLowerCase().includes(lowerCaseQuery) ||
      plan.planname?.toLowerCase().includes(lowerCaseQuery) ||
      plan.description?.toLowerCase().includes(lowerCaseQuery) ||
      plan.features?.toLowerCase().includes(lowerCaseQuery) ||
      admin.userId?.toLowerCase().includes(lowerCaseQuery) ||
      admin.email?.toLowerCase().includes(lowerCaseQuery) ||
      admin.firstName?.toLowerCase().includes(lowerCaseQuery) ||
      admin.lastName?.toLowerCase().includes(lowerCaseQuery) ||
      admin.phone?.toLowerCase().includes(lowerCaseQuery) ||
      orgnization?.name?.toLowerCase().includes(lowerCaseQuery)
    );
  });
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function sortSubscriptionsInDescendingOrderByEndDate(
  subscriptions: Subscription[]
) {
  subscriptions.sort((a, b) => {
    if (a.endDateTime === null && b.endDateTime === null) {
      return 0; // Both are null, consider them equal
    } else if (a.endDateTime === null) {
      return 1; // a is null, place a after b
    } else if (b.endDateTime === null) {
      return -1; // b is null, place b after a
    } else {
      return b.endDateTime.getTime() - a.endDateTime.getTime(); // Both are non-null, compare normally
    }
  });
  return subscriptions;
}
export default SubscriptionService;
