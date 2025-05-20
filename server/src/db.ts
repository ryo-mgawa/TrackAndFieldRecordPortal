import { Pool } from "pg";
import dotenv from "dotenv";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

dotenv.config();
console.log("DB_DATABASE:", process.env.DB_DATABASE);

const isGCP =
  process.env.NODE_ENV === "production" &&
  (process.env.GCP_PROJECT || process.env.GOOGLE_CLOUD_PROJECT);

async function getSecret(name: string): Promise<string> {
  try {
    const client = new SecretManagerServiceClient();
    const projectId =
      process.env.GCP_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
    const [version] = await client.accessSecretVersion({
      name: `projects/${projectId}/secrets/${name}/versions/latest`,
    });
    return version.payload?.data?.toString() || "";
  } catch (err) {
    console.error(`Failed to get secret ${name}:`, err);
    throw err;
  }
}

let pool: Pool;
let poolPromise: Promise<Pool>;

if (isGCP) {
  poolPromise = (async () => {
    const [user, host, database, password, port] = await Promise.all([
      getSecret("DB_USER"),
      getSecret("DB_HOST"),
      getSecret("DB_DATABASE"),
      getSecret("DB_PASSWORD"),
      getSecret("DB_PORT"),
    ]);
    return new Pool({
      user,
      host,
      database,
      password,
      port: port ? parseInt(port, 10) : 5432,
    });
  })();
} else {
  dotenv.config();
  pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  });
}

export { pool, poolPromise, isGCP };
