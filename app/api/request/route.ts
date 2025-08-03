import { type NextRequest, NextResponse } from "next/server"
import { RequestHistory } from "@/lib/entities/RequestHistory"
import { getORM } from "@/lib/mikro-orm"

export async function POST(request: NextRequest) {
  try {
    const { method, url, headers, body } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    const startTime = Date.now()

    const fetchOptions: RequestInit = {
      method,
      headers: {
        ...headers,
        "User-Agent": "REST-Client/1.0",
      },
    }

    if (body && ["POST", "PUT", "PATCH"].includes(method)) {
      fetchOptions.body = body
    }

    let response: Response
    let responseData: any
    let responseTime: number

    try {
      response = await fetch(url, fetchOptions)
      responseTime = Date.now() - startTime

      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json()
      } else {
        responseData = await response.text()
      }
    } catch (fetchError) {
      responseTime = Date.now() - startTime
      return NextResponse.json(
        {
          error: `Request failed: ${fetchError instanceof Error ? fetchError.message : "Unknown error"}`,
          responseTime,
        },
        { status: 500 },
      )
    }

    try {
      const orm = await getORM()
      const em = orm.em.fork()

      const requestHistory = new RequestHistory()
      requestHistory.method = method
      requestHistory.url = url
      requestHistory.headers = headers || {}
      requestHistory.body = body || null
      requestHistory.response = typeof responseData === "string" ? responseData : JSON.stringify(responseData)
      requestHistory.status = response.status
      requestHistory.responseTime = responseTime
      requestHistory.createdAt = new Date()

      await em.persistAndFlush(requestHistory)
    } catch (dbError) {
      console.error("Failed to save request history:", dbError)
    }

    return NextResponse.json({
      data: responseData,
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      responseTime,
    })
  } catch (error) {
    console.error("Request handler error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
