import { Entity, PrimaryKey, Property, Index } from "@mikro-orm/core"

@Entity()
export class RequestHistory {
  @PrimaryKey()
  id!: number

  @Property()
  method!: string

  @Property({ type: "text" })
  url!: string

  @Property({ type: "json" })
  headers!: Record<string, string>

  @Property({ type: "text", nullable: true })
  body?: string | null

  @Property({ type: "text" })
  response!: string

  @Property()
  status!: number

  @Property()
  responseTime!: number

  @Property({ index: true })
  createdAt!: Date
}
