import { type NextRequest, NextResponse } from "next/server"
import { RequestHistory } from "@/lib/entities/RequestHistory"
import { getORM } from "@/lib/mikro-orm"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    const orm = await getORM()
    const em = orm.em.fork()

    const [requests, total] = await em.findAndCount(
      RequestHistory,
      {},
      {
        orderBy: { createdAt: "DESC" },
        limit,
        offset,
      },
    )

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      requests: requests.map((req) => ({
        id: req.id,
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
        response: req.response,
        status: req.status,
        responseTime: req.responseTime,
        createdAt: req.createdAt.toISOString(),
      })),
      totalPages,
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("History fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const orm = await getORM()
    const em = orm.em.fork()

    await em.nativeDelete(RequestHistory, {})

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("History clear error:", error)
    return NextResponse.json({ error: "Failed to clear history" }, { status: 500 })
  }
}
