/**
 * @swagger
 * components:
 *   schemas:
 *     LeadInput:
 *       type: object
 *       required:
 *         - title
 *         - status
 *       properties:
 *         title:
 *           type: string
 *           description: Title of the lead
 *         status:
 *           type: string
 *           enum: [New, InProgress, Qualified, Closed]
 *         description:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *         company:
 *           type: string
 *       example:
 *         title: "New Sales Lead"
 *         status: "New"
 *         description: "Potential customer interested in our CRM solution"
 *         email: "contact@example.com"
 *         phone: "+1234567890"
 *         company: "Example Corp"
 *
 *     AccountInput:
 *       type: object
 *       required:
 *         - accountName
 *         - country
 *         - state
 *         - city
 *       properties:
 *         accountName:
 *           type: string
 *           description: Name of the account/company
 *           example: "Enterprise Corp"
 *         country:
 *           type: string
 *           description: Country of the account
 *           example: "India"
 *         state:
 *           type: string
 *           description: State/Province of the account
 *           example: "Maharashtra"
 *         city:
 *           type: string
 *           description: City of the account
 *           example: "Mumbai"
 *         industry:
 *           type: string
 *           description: Industry sector
 *           example: "Technology"
 *         website:
 *           type: string
 *           description: Company website
 *           example: "www.enterprise.com"
 *         description:
 *           type: string
 *           description: Account description
 *           example: "Enterprise software solutions provider"
 *         email:
 *           type: string
 *           format: email
 *           description: Primary contact email
 *           example: "contact@enterprise.com"
 *         phone:
 *           type: string
 *           description: Contact phone number
 *           example: "1234567890"
 *
 *     LeadAssignment:
 *       type: object
 *       properties:
 *         leadAssignmentId:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the lead assignment
 *         leadType:
 *           type: string
 *           description: Type/category of the lead
 *         user:
 *           $ref: '#/components/schemas/User'
 *         organisation:
 *           $ref: '#/components/schemas/Organisation'
 *         organisationId:
 *           type: string
 *           format: uuid
 *         createdBy:
 *           type: string
 *         modifiedBy:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     LeadAssignmentInput:
 *       type: object
 *       required:
 *         - leadType
 *         - userId
 *       properties:
 *         leadType:
 *           type: string
 *           description: Type/category of the lead
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID of the user to assign leads to
 *
 *     Lead:
 *       type: object
 *       properties:
 *         leadId:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         status:
 *           type: string
 *           enum: [New, InProgress, Qualified, Closed]
 *         description:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *         company:
 *           type: string
 *         owner:
 *           $ref: '#/components/schemas/User'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     LeadSchema:
 *       type: object
 *       required:
 *         - title
 *         - status
 *         - firstName
 *         - lastName
 *         - leadSource
 *         - userId
 *         - organisationId
 *         - companyAccountId
 *       properties:
 *         title:
 *           type: string
 *           description: Title of the lead
 *           example: "New Enterprise Lead"
 *         status:
 *           type: string
 *           enum: [New, InProgress, Qualified, Closed]
 *           description: Current status of the lead
 *           example: "New"
 *         firstName:
 *           type: string
 *           description: First name of the lead contact
 *           example: "John"
 *         lastName:
 *           type: string
 *           description: Last name of the lead contact
 *           example: "Doe"
 *         leadSource:
 *           type: string
 *           description: Source of the lead
 *           example: "Website"
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID of the user creating/owning the lead
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         organisationId:
 *           type: string
 *           format: uuid
 *           description: ID of the organisation
 *           example: "550e8400-e29b-41d4-a716-446655440001"
 *         companyAccountId:
 *           type: string
 *           format: uuid
 *           description: ID of the associated company account
 *           example: "550e8400-e29b-41d4-a716-446655440002"
 *         description:
 *           type: string
 *           description: Detailed description of the lead
 *           example: "Interested in enterprise CRM solution"
 *         email:
 *           type: string
 *           format: email
 *           description: Primary contact email
 *           example: "john.doe@enterprise.com"
 *         phone:
 *           type: string
 *           description: Contact phone number
 *           example: "1234567890"
 *         company:
 *           type: string
 *           description: Company name
 *           example: "Enterprise Corp"
 *         website:
 *           type: string
 *           description: Company website
 *           example: "www.enterprise.com"
 *         address:
 *           type: string
 *           description: Physical address
 *           example: "123 Business Street"
 *         city:
 *           type: string
 *           description: City name
 *           example: "Mumbai"
 *         state:
 *           type: string
 *           description: State/Province
 *           example: "Maharashtra"
 *         country:
 *           type: string
 *           description: Country name
 *           example: "India"
 *         zipCode:
 *           type: string
 *           description: Postal/ZIP code
 *           example: "400001"
 *         contactId:
 *           type: string
 *           format: uuid
 *           description: Associated contact ID
 *         accountId:
 *           type: string
 *           format: uuid
 *           description: Associated account ID
 *
 *     bulkDeleteSchema:
 *       type: object
 *       required:
 *         - ids
 *       properties:
 *         ids:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 */ 