import { Response } from "express";
import { CustomResponse, CustomeSuccessResponse } from "../interfaces/types";
import { saltRounds } from "./constants";
import * as bcrypt from "bcrypt";
import * as base64js from "base64-js";
import * as crypto from "crypto";

export const buildResponse = (data: any, message: string, error: any = "") => {
  const response: CustomResponse = {
    data,
    message,
    error,
  };

  return response;
};

export const customeResponse = (data: any, message: string) => {
  const response: CustomeSuccessResponse = {
    data,
    message,
    success: true,
  };
  return response;
};

export const makeResponse = async (
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  payload: any
) =>
  new Promise<number>((resolve) => {
    res.status(statusCode).send({
      success,
      message,
      data: payload,
      code: statusCode,
    });
    resolve(statusCode);
  });

export const encryptString = async (string: string) => {
  return await bcrypt.hash(string, saltRounds);
};

export const crypt = (text: string): string => {
  const salt = "cxonego" + String(process.env.SECRET);
  const textToChars = (text: string): number[] =>
    text.split("").map((c) => c.charCodeAt(0));
  const byteHex = (n: number): string =>
    ("0" + Number(n).toString(16)).slice(-2);
  const applySaltToChar = (code: number): number =>
    textToChars(salt).reduce((a, b) => a ^ b, code);

  return text
    .split("")
    .map(textToChars)
    .map((chars) => applySaltToChar(chars[0]))
    .map(byteHex)
    .join("");
};

export enum statusType {
  NEW = "New",
  IN_PROGRESS = "In Progress",
  QUALIFIED = "Qualified",
  CLOSED = "Closed",
}

export enum ratingRate {
  HOT = "Hot",
  WARM = "Warm",
  COLD = "Cold",
}
export enum projectStatus {
  ONGOING = "Ongoing",
  COMPLETED = "Completed",
}

export enum status {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
}

export enum favourite {
  YES = "Yes",
  NO = "No",
}

export enum contactType {
  PROSPECT = "Prospect",
  CUSTOMER = "Customer",
  PARTNER = "Partner",
  INVESTOR = "Investor",
  PROFESSIONAL = "Professional",
  BUSINESS = "Busineess Owner",
  OWNER = "Owner",
  PERSONAL = "Personal",
  OTHER = "Other",
}

export enum roleNames {
  ADMIN = "ADMIN",
  SALESPERSON = "SALESPERSON",
  SALESMANAGER = "SALESMANAGER",
}

export enum purchaseProcess {
  INDIVIDUAL = "Individual",
  COMMITTEE = "Committee",
}
export enum forecastCategory {
  PIPELINE = "Pipeline",
  BEST_CASE = "Best Case",
  COMMITTED = "Committed",
  OMITTED = "Omitted",
  WON = "Won",
  LOST = "Lost",
}
export const MyEncryptionTransformerConfig = {
  key: process.env.ENCRYPTION_KEY,
  algorithm: "aes-256-gcm",
  ivLength: 16,
};

export enum stage {
  ANALYSIS = "Analysis",
  SOLUTIONING = "Solutioning",
  PROPOSAL = "Proposal",
  NEGOTIATION = "Negotiation",
  WON = "Won",
  LOST = "Lost",
}

export enum priorityStatus {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
}

export enum probability {
  firstRange = "10",
  secondRange = "20",
  thirdRange = "30",
  fourthRange = "40",
  fifthRange = "50",
  sixthRange = "60",
  seventhRange = "70",
  eightRange = "80",
  ninthRange = "90",
  tenthRange = "100",
}

// export function CryptoAESEncryption(attribute: string) {
//   try {
//     const cipher = crypto.createCipher("aes-256-cbc", "Secrate");
//     let encrypted = cipher.update(attribute, "utf-8", "hex");
//     encrypted += cipher.final("hex");
//     return encrypted;
//   } catch (error) {
//     throw error;
//   }
// }

// export function DecryptAESEncryption(encrypted: string) {
//   try {
//     const decipher = crypto.createDecipher("aes-256-cbc", "Secrate");
//     let decrypted = decipher.update(String(encrypted), "hex", "utf-8");
//     decrypted += decipher.final("utf-8");
//     return decrypted;
//   } catch (error) {
//     throw error;
//   }
// }

const ENCRYPTION_KEY = Buffer.from("dY1GR3phOA56dhgEICMp4jaUel7u8HeT");
const IV_LENGTH = Buffer.from("dY1GR3phOA56dhgE");

// export const encryption=(text:string)=>{
//   const encoder = btoa(text);
//   return encoder;
// }
/*
export const encryption=(text:string)=>{
    try{
    const encoder = btoa(text);    
    return encoder;
  }catch(e){
    return text;
  }
}

export const decrypt=(encodedString:string)=>{
  try{
    const decoder = atob(encodedString);  
    console.log("DECODER : ",decoder);
    return decoder;
  }catch(e){
    return encodedString;
  }
  
}
*/
export enum Currency {
  INR = "INR",
  GBP = "GBP",
  USD = "USD",
  EUR = "EUR",
  AUD = "AUD",
}

export enum purchaseTimeFrame {
  first_MONTH = "1 Month",
  second_MONTH = "2 Months",
  third_MONTH = "3 Months",
  fourth_MONTH = "4 Months",
  fifth_MONTH = "5 Months",
  sixth_MONTH = "6 Months",
  seventh_MONTH = "7 Months",
  eight_MONTH = "8 Months",
  ninth_MONTH = "9 Months",
  tenth_MONTH = "10 Months",
  eleventh_MONTH = "11 Months",
  twelve_MONTH = "12 Months",
}
// Encrypt plaintext using AES-GCM

export enum opportunityStatus {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
  CANCELLED = "Cancelled",
}

export enum opportunityWonReason {
  NEED_FULFILLED = "Need Fulfilled",
  COMPETITIVE_ADVANTAGE = "Competitive Advantage",
  RELATIONSHIP_TRUST = "Relationship & Trust",
  COMPETITIVE_PRICING = "Competitive Pricing",
  UPSELLING_CROSSSELLING = "UpSelling/CrossSelling",
  EFFECTIVE_SALES_PROCESS = "Effective Sales Process",
}

export enum opportunityLostReason {
  BUDGET_CONSTRAINT = "Budget Constraint",
  COMPETITOR_SELECTION = "Competitive Selection",
  CHANGED_NEED = "Changed Needs/Priority",
  DECISION_MAKING_DELAY = "Decision Making Delay",
  NO_PURCHASE_INTENT = "No Purchase Intent",
  INEFFECTIVE_SALES_PROCESS = "Ineffective Sales Process",
  UNCOMPETITIVE_PRICING = "Uncompetitive Pricing",
  PRODUCT_SERVICE_LIMITATIONS = "Product/Service Limitations",
  LACK_OF_FOLLOWUP = "Lack of Followup or Communication",
}

export enum moodCategory {
  HAPPY = "HAPPY",
  NEUTRAL = "NEUTRAL",
  LOW = "LOW",
}

export enum activityType {
  APPOINTMENT = "Appointment",
  TASK = "Task",
  PHONE_CALL_OUTBOUND = "Phone Call Outbound",
  EMAIL_OUTBOUND = "Email Outbound",
  SMS_OUTBOUND = "SMS Outbound",
  WATSAPP_OUTBOUND = "Whatsapp Outbound",
  DOCUMENTATION = "Documentation",
  MEETING = "Meeting",
  DATA_ENTRY = "Data Entry",
}

export enum activityStatus {
  OPEN = "Open",
  IN_PROGRESS = "In Progress",
  COMPLETED = "Completed",
}

export enum activityPriority {
  LOW = "Low",
  NORMAL = "Normal",
  HIGH = "High",
}

export enum auditType {
  UPDATED = "UPDATED",
  INSERTED = "INSERTED",
  DELETED = "DELETED",
}

export const capitalizeFirstLetter = (inputString: string) => {
  console.log("inputString is : ", inputString);
  if (inputString !== null && typeof inputString === "string") {
    return (
      inputString.charAt(0).toUpperCase() + inputString.slice(1).toLowerCase()
    );
  } else {
    return null;
  }
};

export enum calenderStatus {
  PENDING = "Pending",
  IN_PROGRESS = "In Progress",
  COMPLETED = "Completed",
  CANCELLED = "Cancelled",
}

export enum referStatus {
  New = "New",
  In_progress = "In Progress",
  Closed = "Closed",
}

//-------------------
const key = Buffer.from("df32a38775fe682bf3bede615b8707c2", "hex");
const staticIV = Buffer.from("9ad530ff86c4b33c21258adaf364e354", "hex");

// Log keys at module load to see them once
console.log("Cryptography Key (hex):", key.toString('hex'));
console.log("Cryptography IV (hex):", staticIV.toString('hex'));

export function encryption(text: string) {
  try {
    // console.log("[Encryption] Using Key:", key.toString('hex')); // Optional: uncomment for per-call logging
    // console.log("[Encryption] Using IV:", staticIV.toString('hex')); // Optional: uncomment for per-call logging
    const cipher = crypto.createCipheriv("aes-128-cbc", key, staticIV);
    let encrypted = cipher.update(text, "utf8", "base64");
    encrypted += cipher.final("base64");
    return encrypted;
  } catch (error) {
    console.error("ENCRYPTION error:", error);
    throw error; // or handle it appropriately
  }
}

// Function to decrypt an encrypted text using AES-128-CBC and Base64 decoding
export function decrypt(encryptedData: string) {
  if (!encryptedData || encryptedData.trim() === "") {
    return encryptedData;
  }

  // Heuristic: If the data is short and doesn't contain characters outside of A-Za-z0-9
  // (like +, / which are common in Base64 from AES), it might be plaintext already.
  // Our AES encrypted Base64 strings are typically longer.
  // This is to avoid ERR_OSSL_WRONG_FINAL_BLOCK_LENGTH for short, unencrypted enum-like values
  // that might not have been processed by the entity's encrypt() hook.
  if (encryptedData.length < 16 && /^[A-Za-z0-9]+$/.test(encryptedData) && !encryptedData.includes('+') && !encryptedData.includes('/')) {
    // Example: "MSA", "OTHER", "NDA"
    // These would fail decryption with ERR_OSSL_WRONG_FINAL_BLOCK_LENGTH
    // if they were not actually encrypted.
    console.log("Data appears to be unencrypted or not in expected Base64 format (short, specific charset):", encryptedData.substring(0, 20) + "...");
    return encryptedData;
  }

  // Existing check for general Base64 characters.
  // This will catch malformed Base64 strings but allows short ones like "MSA" to pass.
  // The check above is more specific for our potential plaintext enum issue.
  if (!/^[A-Za-z0-9+/=]*$/.test(encryptedData)) {
    console.log("Data is not valid Base64:", encryptedData.substring(0, 20) + "...");
    return encryptedData;
  }
  
  // Additional check: valid Base64 strings usually have a length multiple of 4.
  // However, our encryption output might not always be padded to a multiple of 4 by default with '='
  // if the Base64 library/encoder used during encryption strips them. But crypto's output usually has it.
  // Let's be cautious and rely on the try-catch for most Base64 structural issues.

  try {
    // console.log("[Decryption] Using Key:", key.toString('hex')); // Optional: uncomment for per-call logging
    // console.log("[Decryption] Using IV:", staticIV.toString('hex')); // Optional: uncomment for per-call logging
    const decipher = crypto.createDecipheriv("aes-128-cbc", key, staticIV);
    let decrypted = decipher.update(encryptedData, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch(error) {
    const err = error as Error & { code?: string };
    if (err.code === 'ERR_OSSL_WRONG_FINAL_BLOCK_LENGTH' && encryptedData.length < 16) {
      console.warn(`Decryption failed (ERR_OSSL_WRONG_FINAL_BLOCK_LENGTH) for short data: "${encryptedData}". Returning original.`);
      return encryptedData; // Likely an unencrypted short string like an enum value
    }
    console.error("DECRYPTION ERROR for data:", encryptedData.substring(0, 50) + (encryptedData.length > 50 ? "..." : ""));
    console.error("Error details:", err.message, err.code ? `(code: ${err.code})` : '');
    return encryptedData; // Return original data on decryption failure
  }
}

export enum subscriptionStatus {
  SUBSCRIPTION_ACTIVE = "Active", //currently active
  SUBSCRIPTION_INACTIVE = "Inactive", //expired
  SUBSCRIPTION_DISABLED = "disabled", //disabled by admin
  // SUBSCRIPTION_EXPIRED = "Expired",
  SUBSCRIPTION_PENDING = "pending", //wasn't activated for some reason.
  SUBSCRIPTION_CANCELLED = "cancelled", //was cancelled by user
  SUBSCRIPTION_UPCOMING = "Upcoming", //upcoming
}

export enum trialStatus {
  TRIAL_ACTIVE = "Trial Active", //active
  TRIAL_PENDING = "Trial pending", //wasn't activated for some reason: payment failure etc
  TRIAL_EXPIRED = "Trial Expired", //expired
}

export enum paymentStatus {
  SUCCESS = "Success",
  FAILED = "Failed",
  PENDING = "Pending",
}

export enum planType {
  TRIAL = "Trial",
  SUBSCRIPTION = "Subscription",
  CUSTOM = "Custom",
}

export enum customRequestStatus {
  PENDING = "Pending",
  APPROVED = "Approved",
  REJECTED = "Rejected",
}
