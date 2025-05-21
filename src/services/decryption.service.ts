import { Contact } from "../entity/Contact";
import { Account } from "../entity/Account";
import { Lead } from "../entity/Lead";
import { decrypt } from "../common/utils";
import { ContactSchemaType } from "../schemas/contact.schema";
import { Oppurtunity } from "../entity/Oppurtunity";
import { Note } from "../entity/Note";
import { Calender } from "../entity/Calender";
import { Refer } from "../entity/Refer";
import { Activity } from "../entity/Activity";
import { Organisation } from "../entity/Organisation";
import { CalenderUser } from "../entity/CalenderUser";
import { User } from "../entity/User";
import { Plan } from "../entity/Plan";
import { Subscription } from "../entity/Subscription";
import { CustomPlanRequest } from "../entity/CustomPlanRequest";
import { Document } from "../entity/Document";

export const accountDecryption = async (company: Account) => {
  if (company?.accountName) company.accountName = decrypt(company.accountName);
  if (company?.country) company.country = decrypt(company.country);
  if (company?.state) company.state = decrypt(company.state);
  if (company?.city) company.city = decrypt(company.city);
  if (company?.companySize) company.companySize = decrypt(company.companySize);
  if (company?.website) company.website = decrypt(company.website);
  if (company?.industry) company.industry = decrypt(company.industry);
  if (company?.businessType)
    company.businessType = decrypt(company.businessType);
  if (company?.CurrencyCode)
    company.CurrencyCode = decrypt(company.CurrencyCode);
  if (company?.annualRevenue)
    company.annualRevenue = decrypt(company.annualRevenue);
  if (company?.email) company.email = decrypt(company.email);
  if (company?.phone) company.phone = decrypt(company.phone);
  if (company?.countryCode) company.countryCode = decrypt(company.countryCode);
  if (company?.address) company.address = decrypt(company.address);
  if (company?.description) company.description = decrypt(company.description);
  if (company?.area) company.area = decrypt(company.area);

  return company;
};

export const leadDecryption = async (lead: Lead) => {
  if (lead?.firstName) lead.firstName = decrypt(lead.firstName);
  if (lead?.lastName) lead.lastName = decrypt(lead.lastName);
  if (lead?.phone) lead.phone = decrypt(lead.phone);
  if (lead?.country) lead.country = decrypt(lead.country);
  if (lead?.state) lead.state = decrypt(lead.state);
  if (lead?.city) lead.city = decrypt(lead.city);
  if (lead?.email) lead.email = decrypt(lead.email);
  if (lead?.title) lead.title = decrypt(lead.title);
  if (lead?.leadSource) lead.leadSource = decrypt(lead.leadSource);
  if (lead?.description) lead.description = decrypt(lead.description);
  if (lead?.price) lead.price = decrypt(lead.price);
  if (lead?.countryCode) lead.countryCode = decrypt(lead.countryCode);

  return lead;
};

export const contactDecryption = async (contact: Contact) => {
  if (contact?.firstName) contact.firstName = decrypt(contact.firstName);
  if (contact?.lastName) contact.lastName = decrypt(contact.lastName);
  if (contact?.countryCode) contact.countryCode = decrypt(contact.countryCode);
  if (contact?.phone) contact.phone = decrypt(contact.phone);
  if (contact?.area) contact.area = decrypt(contact.area);
  if (contact?.city) contact.city = decrypt(contact.city);
  if (contact?.state) contact.state = decrypt(contact.state);
  if (contact?.country) contact.country = decrypt(contact.country);
  if (contact?.email) contact.email = decrypt(contact.email);
  if (contact?.addressLine) contact.addressLine = decrypt(contact.addressLine);
  if (contact?.industry) contact.industry = decrypt(contact.industry);
  if (contact?.designation) contact.designation = decrypt(contact.designation);
  if (contact?.description) contact.description = decrypt(contact.description);
  if (contact?.social) contact.social = decrypt(contact.social);

  return contact;
};

export const multipleleadsDecryption = async (leads: Array<Lead>) => {
  const leadsArray: Array<Lead> = [];
  for (let lead of leads) {
    if (lead?.firstName) lead.firstName = decrypt(lead.firstName);
    if (lead?.lastName) lead.lastName = decrypt(lead.lastName);
    if (lead?.phone) lead.phone = decrypt(lead.phone);
    if (lead?.country) lead.country = decrypt(lead.country);
    if (lead?.state) lead.state = decrypt(lead.state);
    if (lead?.city) lead.city = decrypt(lead.city);
    if (lead?.email) lead.email = decrypt(lead.email);
    if (lead?.title) lead.title = decrypt(lead.title);
    if (lead?.leadSource) lead.leadSource = decrypt(lead.leadSource);
    if (lead?.description) lead.description = decrypt(lead.description);
    leadsArray.push(lead);
  }

  return leadsArray;
};

export const contactDecryptionFilter = async (contact: ContactSchemaType) => {
  if (contact?.firstName) contact.firstName = decrypt(contact.firstName);
  if (contact?.lastName) contact.lastName = decrypt(contact.lastName);
  if (contact?.countryCode) contact.countryCode = decrypt(contact.countryCode);
  if (contact?.phone) contact.phone = decrypt(contact.phone);
  if (contact?.area) contact.area = decrypt(contact.area);
  if (contact?.city) contact.city = decrypt(contact.city);
  if (contact?.state) contact.state = decrypt(contact.state);
  if (contact?.country) contact.country = decrypt(contact.country);
  if (contact?.email) contact.email = decrypt(contact.email);
  if (contact?.addressLine) contact.addressLine = decrypt(contact.addressLine);
  if (contact?.industry) contact.industry = decrypt(contact.industry);
  if (contact?.designation) contact.designation = decrypt(contact.designation);
  if (contact?.description) contact.description = decrypt(contact.description);
  if (contact?.social) contact.social = decrypt(contact.social);

  return contact;
};

export const opportunityDecryption = async (opportunity: Oppurtunity) => {
  if (opportunity?.title) opportunity.title = decrypt(opportunity.title);
  if (opportunity?.description)
    opportunity.description = decrypt(opportunity.description);
  if (opportunity?.currentNeed)
    opportunity.currentNeed = decrypt(opportunity.currentNeed);
  if (opportunity?.proposedSolution)
    opportunity.proposedSolution = decrypt(opportunity.proposedSolution);
  if (opportunity?.wonLostDescription)
    opportunity.wonLostDescription = decrypt(opportunity.wonLostDescription);
  if (opportunity?.estimatedRevenue)
    opportunity.estimatedRevenue = decrypt(opportunity.estimatedRevenue);
  if (opportunity?.actualRevenue)
    opportunity.actualRevenue = decrypt(opportunity.actualRevenue);

  return opportunity;
};

export const noteDecryption = async (note: Note) => {
  if (note?.note) note.note = decrypt(note.note);
  if (note?.tags) note.tags = decrypt(note.tags);
  return note;
};

export const calenderDecryption = async (calenderdata: Calender) => {
  if (calenderdata?.title) calenderdata.title = decrypt(calenderdata.title);
  if (calenderdata?.agenda) calenderdata.agenda = decrypt(calenderdata.agenda);
  if (calenderdata?.Notes) calenderdata.Notes = decrypt(calenderdata.Notes);

  return calenderdata;
};

export const calenderUserDecryption = async (
  calenderUsersdata: Array<CalenderUser>
) => {
  const calenderUsersArray: Array<CalenderUser> = [];
  for (let caluser of calenderUsersdata) {
    if (caluser?.firstName) caluser.firstName = decrypt(caluser.firstName);
    if (caluser?.lastName) caluser.lastName = decrypt(caluser.lastName);
    if (caluser?.email) caluser.email = decrypt(caluser.email);
    calenderUsersArray.push(caluser);
  }
  return calenderUsersArray;
};

export const referDecryption = async (referdata: Refer) => {
  if (referdata?.firstName) referdata.firstName = decrypt(referdata.firstName);
  if (referdata?.lastName) referdata.lastName = decrypt(referdata.lastName);
  if (referdata?.phone) referdata.phone = decrypt(referdata.phone);
  if (referdata?.email) referdata.email = decrypt(referdata.email);
  if (referdata?.referBy) referdata.referBy = decrypt(referdata.referBy);
  if (referdata?.company) referdata.company = decrypt(referdata.company);
  if (referdata?.description)
    referdata.description = decrypt(referdata.description);
  if (referdata?.countryCode)
    referdata.countryCode = decrypt(referdata.countryCode);

  return referdata;
};

export const activityDecryption = async (activitydata: Activity) => {
  if (activitydata?.subject)
    activitydata.subject = decrypt(activitydata.subject);
  if (activitydata?.description)
    activitydata.description = decrypt(activitydata.description);
  return activitydata;
};

export const orgnizationDecryption = async (orgnizationdata: Organisation) => {
  if (orgnizationdata?.industry)
    orgnizationdata.industry = decrypt(orgnizationdata.industry);
  if (orgnizationdata?.name)
    orgnizationdata.name = decrypt(orgnizationdata.name);
  if (orgnizationdata?.address)
    orgnizationdata.address = decrypt(orgnizationdata.address);
  if (orgnizationdata?.country)
    orgnizationdata.country = decrypt(orgnizationdata.country);
  if (orgnizationdata?.state)
    orgnizationdata.state = decrypt(orgnizationdata.state);
  if (orgnizationdata?.city)
    orgnizationdata.city = decrypt(orgnizationdata.city);
  if (orgnizationdata?.phone)
    orgnizationdata.phone = decrypt(orgnizationdata.phone);
  if (orgnizationdata?.email)
    orgnizationdata.email = decrypt(orgnizationdata.email);
  if (orgnizationdata?.website)
    orgnizationdata.website = decrypt(orgnizationdata.website);
  if (orgnizationdata?.companySize)
    orgnizationdata.companySize = decrypt(orgnizationdata.companySize);

  return orgnizationdata;
};

export const userDecryption = async (userdata: User) => {
  if (userdata?.email) userdata.email = decrypt(userdata.email);
  if (userdata?.firstName) userdata.firstName = decrypt(userdata.firstName);
  if (userdata?.lastName) userdata.lastName = decrypt(userdata.lastName);
  if (userdata?.countryCode) userdata.countryCode = decrypt(userdata.countryCode);
  if (userdata?.phone) userdata.phone = decrypt(userdata.phone);
  if (userdata?.country) userdata.country = decrypt(userdata.country);
  if (userdata?.state) userdata.state = decrypt(userdata.state);
  if (userdata?.city) userdata.city = decrypt(userdata.city);
  if (userdata?.theme) userdata.theme = decrypt(userdata.theme);
  if (userdata?.currency) userdata.currency = decrypt(userdata.currency);
  if (userdata?.industry) userdata.industry = decrypt(userdata.industry);
  if (userdata?.jobtitle) userdata.jobtitle = decrypt(userdata.jobtitle);
  if (userdata?.primaryIntension) userdata.primaryIntension = decrypt(userdata.primaryIntension);
  if (userdata?.otp) userdata.otp = decrypt(userdata.otp);

  return userdata;
};

export const planDecryption = async (planData: Plan) => {
  if (planData?.planamount) planData.planamount = decrypt(planData.planamount);
  if (planData?.annualAmount)
    planData.annualAmount = decrypt(planData.annualAmount);
  if (planData?.gst) planData.gst = decrypt(planData.gst);
  if (planData?.description)
    planData.description = decrypt(planData.description);
  if (planData?.planname) planData.planname = decrypt(planData.planname);
  if (planData?.noOfUsers) planData.noOfUsers = decrypt(planData.noOfUsers);
  if (planData?.noOfDays) planData.noOfDays = decrypt(planData.noOfDays);
  if (planData?.features) planData.features = decrypt(planData.features);
  return planData;
};

export const subscriptionDecryption = async (
  subscriptionData: Subscription
) => {
  if (subscriptionData?.subscriptionId)
    subscriptionData.subscriptionId = decrypt(subscriptionData.subscriptionId);
  if (subscriptionData?.razorpayPaymentId)
    subscriptionData.razorpayPaymentId = decrypt(
      subscriptionData.razorpayPaymentId
    );
  if (subscriptionData?.customNoOfDays)
    subscriptionData.customNoOfDays = decrypt(subscriptionData.customNoOfDays);
  if (subscriptionData?.customNoOfUsers)
    subscriptionData.customNoOfUsers = decrypt(
      subscriptionData.customNoOfUsers
    );
  if (subscriptionData?.customPlanAmount)
    subscriptionData.customPlanAmount = decrypt(
      subscriptionData.customPlanAmount
    );
  if (subscriptionData?.customAnnualAmount)
    subscriptionData.customAnnualAmount = decrypt(
      subscriptionData.customAnnualAmount
    );
  if (subscriptionData?.notes)
    subscriptionData.notes = decrypt(subscriptionData.notes);
  return subscriptionData;
};

export const customPlanRequestDecryption = async (
  requestData: CustomPlanRequest
) => {
  if (requestData?.name) requestData.name = decrypt(requestData.name);
  if (requestData?.email) requestData.email = decrypt(requestData.email);
  if (requestData?.phone) requestData.phone = decrypt(requestData.phone);
  if (requestData?.countryCode)
    requestData.countryCode = decrypt(requestData.countryCode);
  if (requestData?.organization)
    requestData.organization = decrypt(requestData.organization);
  if (requestData?.message) requestData.message = decrypt(requestData.message);
  return requestData;
};

export const documentDecryption = async (document: Document) => {
  // Skip if document is null or undefined
  if (!document) return document;
  
  // Detect if the document has already been processed by checking if fileName is not in Base64 format
  // This check is primarily for the AES-encrypted Base64 string.
  // We are modifying the original document object here.
  const isPotentiallyAESEncryptedBase64 = (fieldValue: string | null | undefined): boolean => {
    if (!fieldValue) return false;
    // AES encrypted Base64 strings are usually longer and contain + or /
    return fieldValue.length >= 16 && (fieldValue.includes('+') || fieldValue.includes('/') || fieldValue.includes('='));
  };

  console.log("Starting documentDecryption for documentId:", document.documentId);

  if (isPotentiallyAESEncryptedBase64(document.fileName)) {
    console.log("BEFORE AES DECRYPTION - fileName:", document.fileName?.substring(0,50));
    document.fileName = decrypt(document.fileName!);
    console.log("AFTER AES DECRYPTION - fileName:", document.fileName?.substring(0,50));
  } else if (document.fileName) {
    console.log("Skipping AES decryption for fileName (doesn't look AES/Base64 encrypted):", document.fileName?.substring(0,50));
  }

  if (isPotentiallyAESEncryptedBase64(document.description)) {
    console.log("BEFORE AES DECRYPTION - description:", document.description?.substring(0,50));
    document.description = decrypt(document.description!);
    console.log("AFTER AES DECRYPTION - description:", document.description?.substring(0,50));
  } else if (document.description) {
    console.log("Skipping AES decryption for description (doesn't look AES/Base64 encrypted):", document.description?.substring(0,50));
  }

  // For documentType and customDocumentType, we rely on the improved decrypt function
  // which handles short, potentially unencrypted values.
  if (document.documentType) {
    console.log("BEFORE AES DECRYPTION - documentType:", document.documentType);
    document.documentType = decrypt(document.documentType);
    console.log("AFTER AES DECRYPTION - documentType:", document.documentType);
  }
  if (document.customDocumentType) {
    console.log("BEFORE AES DECRYPTION - customDocumentType:", document.customDocumentType);
    document.customDocumentType = decrypt(document.customDocumentType);
    console.log("AFTER AES DECRYPTION - customDocumentType:", document.customDocumentType);
  }

  // Now, attempt to Base64 decode fileName and description if they still look like Base64
  // This handles cases where the *original* data might have been Base64 encoded before AES encryption (double encoding).
  const tryBase64Decode = (value: string | null | undefined): string | null | undefined => {
    if (!value) return value; // if value is null, undefined, or empty string, return it as is.

    const looksLikeBase64 = /^[A-Za-z0-9+/=]+$/.test(value) && value.length > 3 && (value.length % 4 === 0 || value.includes('='));
    
    if (looksLikeBase64) {
      try {
        const decoded = Buffer.from(value, 'base64').toString('utf8');
        if (Buffer.from(decoded, 'utf8').toString('base64') === value || Buffer.from(decoded, 'utf8').toString('base64').replace(/=+$/, '') === value.replace(/=+$/, '')) {
            if (decoded !== value) { 
              console.log(`Successfully Base64 decoded field that was previously: ${value.substring(0,30)}... to: ${decoded.substring(0,30)}...`);
              return decoded;
            } else {
              return value;
            }
        } else {
            return value; 
        }
      } catch (e) {
        return value; 
      }
    }
    return value;
  };

  // For fileName (string)
  if (document.fileName) { 
    const originalFileName = document.fileName;
    const decodedFileName = tryBase64Decode(originalFileName);
    if (typeof decodedFileName === 'string') {
        document.fileName = decodedFileName;
        if (originalFileName !== document.fileName) {
            console.log(`fileName changed after Base64 decode attempt. Original: ${originalFileName.substring(0,50)}, New: ${document.fileName?.substring(0,50)}`);
        }
    } else {
        // Should not happen if originalFileName is string, as tryBase64Decode would return a string.
        // If it somehow becomes non-string, revert or set to empty to satisfy type 'string'.
        // For safety, if decodedFileName is null/undefined, assign empty string or original.
        // Given tryBase64Decode logic, if originalFileName is string, decodedFileName will be string.
        // So, this else might be unreachable if originalFileName is string.
        document.fileName = originalFileName; // Fallback to original if something unexpected happens
    }
  } else if (document.fileName === null || document.fileName === undefined) {
    // If fileName was null/undefined from DB (though type is string, TypeORM might make it so if not initialized)
    (document as any).fileName = ""; // Coerce to empty string if it was null/undefined to satisfy string type
  }

  // For description (string, but nullable in DB column means it can be undefined/null on object before initialization)
  if (document.description !== undefined && document.description !== null && document.description !== '') { // If it's a non-empty string
    const originalDescription = document.description;
    const decodedDescription = tryBase64Decode(originalDescription); 
    if (typeof decodedDescription === 'string') {
        document.description = decodedDescription;
        if (originalDescription !== document.description) {
            console.log(`description changed after Base64 decode attempt. Original: ${originalDescription.substring(0,50)}, New: ${document.description?.substring(0,50)}`);
        }
    } else {
        // This path implies tryBase64Decode made a string into null/undefined - should not happen.
        // Fallback to original or empty string.
        document.description = originalDescription; // Fallback to original
    }
  } else {
    // If document.description was initially null, undefined, or empty string, ensure it's an empty string.
    document.description = "";
  }
  
  console.log("Finished documentDecryption for documentId:", document.documentId);
  return document;
};

export const multipleDocumentsDecryption = async (documents: Array<Document>): Promise<Array<Document>> => {
  if (!documents || documents.length === 0) return documents;
  
  // Modify documents in place
  for (let i = 0; i < documents.length; i++) {
    documents[i] = await documentDecryption(documents[i]);
  }
  return documents;
};
