import { MikroORM } from "@mikro-orm/core"
import { PostgreSqlDriver } from "@mikro-orm/postgresql"
import { RequestHistory } from "./entities/RequestHistory"

let orm: MikroORM | null = null

export async function getORM() {
  if (orm) {
    return orm
  }

  try {
    orm = await MikroORM.init({
      driver: PostgreSqlDriver,
      clientUrl: process.env.DATABASE_URL || "postgresql://localhost:5432/rest_client_db",
      entities: [RequestHistory],
      debug: process.env.NODE_ENV === "development",
      allowGlobalContext: true,
      driverOptions: {
        connection: {
          ssl: process.env.NODE_ENV === "production" || process.env.DATABASE_URL?.includes('neon.tech') ? {
            rejectUnauthorized: false
          } : false,
        },
      },
      pool: {
        min: 2,
        max: 10,
        acquireTimeoutMillis: 30000,
        createTimeoutMillis: 30000,
        destroyTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 100,
      },
      connect: true,
      ensureDatabase: false, 
    })

    if (process.env.NODE_ENV === "development") {
      const generator = orm.getSchemaGenerator()
      await generator.updateSchema()
    }

    console.log("Database connected successfully")
    return orm
  } catch (error) {
    console.error("Failed to connect to database:", error)
    throw new Error("Database connection failed")
  }
}

export async function closeDatabaseConnection() {
  if (orm) {
    await orm.close()
    orm = null
  }
}
