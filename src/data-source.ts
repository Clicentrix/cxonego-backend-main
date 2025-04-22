import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { ISTDateSubscriber } from "./ist-date-subscriber";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DATABASE_HOST,
  port: Number.parseInt(process.env.DATABASE_PORT ?? "3306"),
  username: process.env.DATABASE_USER_NAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: false,
  logging: ["error"],
  // logging:true,
  entities: ["src/entity/*.ts", "src/entity/*.js"],
  migrations: ["src/migration/*.ts", "src/migration/*.js"],
  extra: {
    timezone: "Z", 
  },
});
