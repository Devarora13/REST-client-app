import { type NextRequest, NextResponse } from "next/server"
import { RequestHistory } from "@/lib/entities/RequestHistory"
import { getORM } from "@/lib/mikro-orm"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "10"), 50) // Max 50 items per page
    const method = searchParams.get("method")
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const offset = (page - 1) * limit

    const orm = await getORM()
    const em = orm.em.fork()

    // Build filter conditions
    const where: any = {}
    
    if (method) {
      where.method = method
    }
    
    if (status) {
      where.status = Number.parseInt(status)
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

    // Cache control headers for better performance
    const headers = new Headers()
    headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=30')

    return NextResponse.json({
      requests: requests.map((req) => ({
        id: req.id,
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
        response: req.response.length > 1000 ? req.response.substring(0, 1000) + '...' : req.response, // Truncate large responses
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
