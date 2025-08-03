import { type NextRequest, NextResponse } from "next/server"
import { RequestHistory } from "@/lib/entities/RequestHistory"
import { getORM } from "@/lib/mikro-orm"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "3"), 50)
    const method = searchParams.get("method")
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const offset = (page - 1) * limit

    const orm = await getORM()
    const em = orm.em.fork()

    const where: any = {}
    
    if (method) {
      where.method = method
    }
    
    if (status) {
      const statusCode = Number.parseInt(status)
      // Handle status ranges (2xx, 3xx, 4xx, 5xx)
      if (statusCode === 200) {
        where.status = { $gte: 200, $lt: 300 } // 2xx range
      } else if (statusCode === 300) {
        where.status = { $gte: 300, $lt: 400 } // 3xx range
      } else if (statusCode === 400) {
        where.status = { $gte: 400, $lt: 500 } // 4xx range
      } else if (statusCode === 500) {
        where.status = { $gte: 500, $lt: 600 } // 5xx range
      } else {
        // For exact status codes (if needed)
        where.status = statusCode
      }
    }
    
    if (search) {
      where.$or = [
        { url: { $ilike: `%${search}%` } },
        { response: { $ilike: `%${search}%` } }
      ]
    }

    const [requests, total] = await em.findAndCount(
      RequestHistory,
      where,
      {
        orderBy: { createdAt: "DESC" },
        limit,
        offset,
      },
    )

    const totalPages = Math.ceil(total / limit)

    const headers = new Headers()
    headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=30')

    return NextResponse.json({
      requests: requests.map((req) => ({
        id: req.id,
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
        response: req.response.length > 1000 ? req.response.substring(0, 1000) + '...' : req.response,
        status: req.status,
        responseTime: req.responseTime,
        createdAt: req.createdAt.toISOString(),
      })),
      totalPages,
      currentPage: page,
      total,
      hasMore: page < totalPages,
    }, { headers })
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
