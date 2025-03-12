import { DataSource } from "typeorm";
import * as mysql from "mysql2/promise";

interface ITenantDatabaseOptions {
  maxPoolSize: number;
  minPoolSize: number;
}

const connectionPool: Map<string, DataSource> = new Map();
const defaultOptions: ITenantDatabaseOptions = {
  maxPoolSize: 10, // Adjust based on your application's needs
  minPoolSize: 5,
};

export async function createTenantDatabase(orgID: number): Promise<void> {
  const dbName = `tenant_${orgID}`;
  const rootConnection = await mysql.createConnection({
    host: "ls-a74091719c00c0d18d2d0b083b72cbd5eda12efc.c447zwpswejw.ap-south-1.rds.amazonaws.com",
    user: "dbmaster", // Use a privileged user
    password: "Jve7Q`r&kYr$G:~w]12DP-(fOO:Q+-In",
    multipleStatements: true,
  });

  await rootConnection.query(`CREATE DATABASE IF NOT EXISTS ${dbName};`);
  await rootConnection.end();

  await initializeTenantDatabase(dbName);
}

async function initializeTenantDatabase(dbName: string): Promise<DataSource> {
  const dataSource = new DataSource({
    name: dbName,
    type: "mysql",
    host: "ls-a74091719c00c0d18d2d0b083b72cbd5eda12efc.c447zwpswejw.ap-south-1.rds.amazonaws.com",
    username: "dbmaster",
    password: "Jve7Q`r&kYr$G:~w]12DP-(fOO:Q+-In",
    database: dbName,
    entities: ["src/entity/LeadEntity.ts", "src/entity/LeadEntity.js"],
    synchronize: true, // Consider using migrations in production
    extra: {
      connectionLimit: defaultOptions.maxPoolSize,
    },
  });

  await dataSource
    .initialize()
    .then((data) => {
      console.log("Data = ", data);
    })
    .catch((err) => {
      console.log("Data = ", err);
    });
  connectionPool.set(dbName, dataSource);
  return dataSource;
}

export async function getTenantConnection(dbName: string): Promise<DataSource> {
  if (connectionPool.has(dbName)) {
    return connectionPool.get(dbName)!;
  } else {
    // This scenario handles server restarts or new tenant databases
    return await initializeTenantDatabase(dbName);
  }
}

export function closeTenantConnections(): Promise<void[]> {
  const closingConnections: Promise<void>[] = [];
  connectionPool.forEach((dataSource) => {
    closingConnections.push(dataSource.destroy());
  });
  return Promise.all(closingConnections);
}
