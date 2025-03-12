import {z} from "zod";

export const OpportunitySchema = z.object({    
    title :z.string(),
    currency :z.enum(["INR","GBP","USD","EUR","AUD"] as const),    
    purchaseTimeFrame :z.enum(["1 Month","2 Months","3 Months","4 Months","5 Months","6 Months","7 Months","8 Months","9 Months","10 Months","11 Months","12 Months"] as const).nullable().optional(),
    purchaseProcess :z.enum(["Individual","Committee"] as const),
    forecastCategory :z.enum(["Pipeline","Best Case","Committed","Omitted","Won","Lost"] as const),
    estimatedRevenue:z.string(),
    actualRevenue :z.string().nullable().optional(),
    estimatedCloseDate:z.string(),
    actualCloseDate :z.string().nullable().optional(),
    probability : z.enum(["10","20","30","40","50","60","70","80","90","100"] as const).nullable().optional(), 
    description : z.string().nullable().optional(),
    currentNeed : z.string().nullable().optional(),
    proposedSolution:z.string().nullable().optional(),
    stage:z.enum(["Analysis","Solutioning","Proposal","Negotiation","Won","Lost"] as const),
    status:z.enum(["Active","Inactive","Cancelled"] as const),
    priority :z.enum(["Low","Medium","High"] as const),
    wonReason:z.enum(["Need Fulfilled","Competitive Advantage","Relationship & Trust","Competitive Pricing","UpSelling/CrossSelling","Effective Sales Process"] as const).nullable().optional(),
    lostReason :z.enum(["Budget Constraint","Competitive Selection","Changed Needs/Priority","Decision Making Delay","No Purchase Intent","Ineffective Sales Process","Uncompetitive Pricing","Product/Service Limitations","Lack of Followup or Communication"] as const).nullable().optional(),
    wonLostDescription:z.string().nullable().optional(),
});


export const OpportunitySearchSchema = z.object({
    search:z.string().optional(),
    user:z.string().optional(),
    page:z.string().optional(),
    limit:z.string().optional(),
})

export const bulkDeleteOpportunitySchema = z.object({
    opportunityIds:z.array(z.string())
})


export const OpportunitySchemaWithDate = z.object({   
    title :z.string(),
    currency :z.enum(["INR","GBP","USD","EUR","AUD"] as const),    
    purchaseTimeFrame :z.enum(["1 Month","2 Months","3 Months","4 Months","5 Months","6 Months","7 Months","8 Months","9 Months","10 Months","11 Months","12 Months"] as const),
    purchaseProcess :z.enum(["Individual","Committee"] as const),
    forecastCategory :z.enum(["Pipeline","Best Case","Committed","Omitted","Won","Lost"] as const),
    estimatedRevenue:z.string(),
    actualRevenue :z.string(),//front end ne number pathvat ahe string thvele tar chalty ka?
    estimatedCloseDate:z.date(),
    actualCloseDate :z.date(),
    probability : z.enum(["10","20","30","40","50","60","70","80","90","100"] as const), 
    description : z.string(),
    currentNeed : z.string(),
    proposedSolution:z.string(),
    stage:z.enum(["Analysis","Solutioning","Proposal","Negotiation","Won","Lost"] as const),
    status:z.enum(["Active","Inactive","Cancelled"] as const),
    priority :z.enum(["Low","Medium","High"] as const),
});

export const OpportunityUpdateSchema = z.object({  
    title :z.string(),
    currency :z.enum(["INR","GBP","USD","EUR","AUD"] as const),    
    purchaseTimeFrame :z.enum(["1 Month","2 Months","3 Months","4 Months","5 Months","6 Months","7 Months","8 Months","9 Months","10 Months","11 Months","12 Months"] as const),
    purchaseProcess :z.enum(["Individual","Committee"] as const),
    forecastCategory :z.enum(["Pipeline","Best Case","Committed","Omitted","Won","Lost"] as const),
    estimatedRevenue:z.string(),
    actualRevenue :z.string(),//front end ne number pathvat ahe string thvele tar chalty ka?
    estimatedCloseDate:z.string(),
    actualCloseDate :z.string(),
    probability : z.enum(["10","20","30","40","50","60","70","80","90","100"] as const), 
    description : z.string(),
    currentNeed : z.string(),
    proposedSolution:z.string(),
    stage:z.enum(["Analysis","Solutioning","Proposal","Negotiation","Won","Lost"] as const),
    status:z.enum(["Active","Inactive","Cancelled"] as const),
    priority :z.enum(["Low","Medium","High"] as const),
    wonReason:z.enum(["Need Fulfilled","Competitive Advantage","Relationship & Trust","Competitive Pricing","UpSelling/CrossSelling","Effective Sales Process"] as const),
    lostReason :z.enum(["Budget Constraint","Competitive Selection","Changed Needs/Priority","Decision Making Delay","No Purchase Intent","Ineffective Sales Process","Uncompetitive Pricing","Product/Service Limitations","Lack of Followup or Communication"] as const),
});



export type OpportunitySchemaType = z.infer <typeof OpportunitySchema>;
export type bulkDeleteOpportunitySchemaType = z.infer<typeof bulkDeleteOpportunitySchema>;
export type OpportunitySchemaWithDateType = z.infer <typeof OpportunitySchemaWithDate>;