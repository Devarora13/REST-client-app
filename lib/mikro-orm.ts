import { MikroORM } from "@mikro-orm/core"
import { PostgreSqlDriver } from "@mikro-orm/postgresql"
import { RequestHistory } from "./entities/RequestHistory"

let orm: MikroORM | null = null

export async function getORM() {
  if (orm) {
    return orm
  }

  orm = await MikroORM.init({
    driver: PostgreSqlDriver,
    clientUrl: process.env.DATABASE_URL,
    entities: [RequestHistory],
    debug: process.env.NODE_ENV === "development",
    allowGlobalContext: true,
  })

  return orm
}

export async function closeDatabaseConnection() {
  if (orm) {
    await orm.close()
    orm = null
  }
}
