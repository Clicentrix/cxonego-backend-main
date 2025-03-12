// import { DataSource } from "typeorm";
// import { SqlDatabase } from "langchain/sql_db";
// import { ChatOpenAI } from "@langchain/openai";
// import { PromptTemplate } from "@langchain/core/prompts";
// import { RunnableSequence } from "@langchain/core/runnables";
// import { StringOutputParser } from "@langchain/core/output_parsers";

// export const datasource = new DataSource({
//     type: "mysql",
//     host: process.env.DATABASE_HOST,
//     port: Number.parseInt(process.env.DATABASE_PORT ?? "3306"),
//     username: process.env.DATABASE_USER_NAME,
//     password: process.env.DATABASE_PASSWORD,
//     database: process.env.DATABASE_NAME,
//   });

//   const db = async()=> await SqlDatabase.fromDataSourceParams({
//     appDataSource: datasource,
//   });
//   const llm = new ChatOpenAI();
  
//   const prompt =PromptTemplate.fromTemplate("how many leads I have?");
//   console.log(prompt);
  