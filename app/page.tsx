"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Clock, Send, Trash2, ChevronLeft, ChevronRight, Zap, Globe, History, Code2, Loader2, Search, Filter } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface RequestHistory {
  id: number
  method: string
  url: string
  headers: Record<string, string>
  body: string | null
  response: string
  status: number
  responseTime: number
  createdAt: string
}

interface ApiResponse {
  data: any
  status: number
  headers: Record<string, string>
  responseTime: number
}

export default function RestClient() {
  const [method, setMethod] = useState("GET")
  const [url, setUrl] = useState("")
  const [headers, setHeaders] = useState("")
  const [body, setBody] = useState("")
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<RequestHistory[]>([])
  const [historyPage, setHistoryPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL_STATUS")
  const [methodFilter, setMethodFilter] = useState("ALL_METHODS")
  
  // Cache for storing history data to avoid redundant API calls
  const [historyCache, setHistoryCache] = useState<Map<string, { data: RequestHistory[], totalPages: number, timestamp: number }>>(new Map())
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes cache

  const fetchHistory = async (page = 1, reset = false) => {
    setHistoryLoading(true)
    try {
      // Create cache key based on current filters and page
      const cacheKey = `${page}-${searchTerm}-${methodFilter}-${statusFilter}`
      const now = Date.now()
      
      // Check cache first
      const cachedData = historyCache.get(cacheKey)
      if (cachedData && !reset && (now - cachedData.timestamp) < CACHE_DURATION) {
        setHistory(cachedData.data)
        setTotalPages(cachedData.totalPages)
        setHistoryPage(page)
        setHistoryLoading(false)
        return
      }
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "3", // 3 items per page
      })
      
      if (searchTerm) params.append("search", searchTerm)
      if (methodFilter && methodFilter !== "ALL_METHODS") params.append("method", methodFilter)
      if (statusFilter && statusFilter !== "ALL_STATUS") params.append("status", statusFilter)
      
      const res = await fetch(`/api/history?${params}`)
      const data = await res.json()
      
      // Update cache with new data
      const newCache = new Map(historyCache)
      newCache.set(cacheKey, {
        data: data.requests,
        totalPages: data.totalPages,
        timestamp: now
      })
      setHistoryCache(newCache)
      
      // Always replace history for page-based pagination
      setHistory(data.requests)
      setTotalPages(data.totalPages)
      setHistoryPage(page)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch request history",
        variant: "destructive",
      })
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory(1)
  }, [])

  // Reset history when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setHistoryPage(1)
      fetchHistory(1)
    }, 300) // Debounce search
    
    return () => clearTimeout(timeoutId)
  }, [searchTerm, methodFilter, statusFilter])

  const parseHeaders = (headerString: string): Record<string, string> => {
    const headers: Record<string, string> = {}
    if (!headerString.trim()) return headers

    headerString.split("\n").forEach((line) => {
      const [key, ...valueParts] = line.split(":")
      if (key && valueParts.length > 0) {
        headers[key.trim()] = valueParts.join(":").trim()
      }
    })
    return headers
  }

  const makeRequest = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a URL",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setResponse(null)

    try {
      const parsedHeaders = parseHeaders(headers)
      const requestBody = body.trim() || null

      const res = await fetch("/api/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method,
          url,
          headers: parsedHeaders,
          body: requestBody,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Request failed")
      }

      setResponse(data)
      
      // Clear cache when new request is made to ensure fresh data
      setHistoryCache(new Map())
      fetchHistory(1, true) // Refresh history after new request with cache reset

      toast({
        title: "Success",
        description: `Request completed in ${data.responseTime}ms`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Request failed",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadHistoryItem = (item: RequestHistory) => {
    setMethod(item.method)
    setUrl(item.url)
    setHeaders(
      Object.entries(item.headers)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n"),
    )
    setBody(item.body || "")

    // Parse and set the response
    try {
      const responseData = JSON.parse(item.response)
      setResponse({
        data: responseData,
        status: item.status,
        headers: {},
        responseTime: item.responseTime,
      })
    } catch (error) {
      setResponse({
        data: item.response,
        status: item.status,
        headers: {},
        responseTime: item.responseTime,
      })
    }
  }

  const clearHistory = async () => {
    try {
      const res = await fetch("/api/history", { method: "DELETE" })
      if (res.ok) {
        setHistory([])
        setHistoryPage(1)
        setTotalPages(1)
        setSearchTerm("")
        setMethodFilter("ALL_METHODS")
        setStatusFilter("ALL_STATUS")
        
        // Clear cache when history is cleared
        setHistoryCache(new Map())
        
        toast({
          title: "Success",
          description: "Request history cleared",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear history",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "bg-green-600 text-white border-green-500"
    if (status >= 300 && status < 400) return "bg-yellow-600 text-white border-yellow-500"
    if (status >= 400 && status < 500) return "bg-orange-600 text-white border-orange-500"
    if (status >= 500) return "bg-red-600 text-white border-red-500"
    return "bg-gray-600 text-white border-gray-500"
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-blue-600 text-white border-blue-500"
      case "POST":
        return "bg-green-600 text-white border-green-500"
      case "PUT":
        return "bg-yellow-600 text-white border-yellow-500"
      case "DELETE":
        return "bg-red-600 text-white border-red-500"
      case "PATCH":
        return "bg-purple-600 text-white border-purple-500"
      default:
        return "bg-gray-600 text-white border-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            REST Client Pro
          </h1>
          <p className="text-gray-400 text-lg">A powerful REST API client</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Request Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Builder Card */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="border-b border-gray-800">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Globe className="w-5 h-5" />
                  Make Request
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* URL Input Row */}
                <div className="flex gap-3 mb-6">
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="GET" className="text-gray-200 hover:bg-gray-700">GET</SelectItem>
                      <SelectItem value="POST" className="text-gray-200 hover:bg-gray-700">POST</SelectItem>
                      <SelectItem value="PUT" className="text-gray-200 hover:bg-gray-700">PUT</SelectItem>
                      <SelectItem value="DELETE" className="text-gray-200 hover:bg-gray-700">DELETE</SelectItem>
                      <SelectItem value="PATCH" className="text-gray-200 hover:bg-gray-700">PATCH</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="https://api.example.com/endpoint"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                  />
                  <Button
                    onClick={makeRequest}
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                    {loading ? "Sending..." : "Send"}
                  </Button>
                </div>

                {/* Headers and Body Tabs */}
                <Tabs defaultValue="headers" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                    <TabsTrigger value="headers" className="data-[state=active]:bg-gray-700 data-[state=active]:!text-white text-gray-300">
                      Headers
                    </TabsTrigger>
                    <TabsTrigger value="body" className="data-[state=active]:bg-gray-700 data-[state=active]:!text-white text-gray-300">
                      Body
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="headers" className="mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="headers" className="text-gray-300">
                        Request Headers (key: value, one per line)
                      </Label>
                      <Textarea
                        id="headers"
                        placeholder="Content-Type: application/json&#10;Authorization: Bearer token"
                        value={headers}
                        onChange={(e) => setHeaders(e.target.value)}
                        rows={4}
                        className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 font-mono text-sm"
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="body" className="mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="body" className="text-gray-300">
                        Request Body
                      </Label>
                      <Textarea
                        id="body"
                        placeholder='{\n  "name": "John Doe",\n  "email": "john@example.com"\n}'
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows={6}
                        className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 font-mono text-sm"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Response Panel */}
            {response && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="border-b border-gray-800">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Code2 className="w-5 h-5" />
                      Response
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(response.status)} font-semibold`}>{response.status}</Badge>
                      <Badge variant="outline" className="border-gray-600 text-gray-300">
                        <Clock className="w-3 h-3 mr-1" />
                        {response.responseTime}ms
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-96">
                    <pre className="p-4 bg-gray-950 text-green-400 font-mono text-sm leading-relaxed overflow-auto">
                      {typeof response.data === "string" ? response.data : JSON.stringify(response.data, null, 2)}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>

          {/* History Panel */}
          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <History className="w-5 h-5" />
                    Request History
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearHistory}
                    disabled={!history || history.length === 0}
                    className="text-gray-300 hover:text-white hover:bg-gray-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {/* Search and Filter Controls */}
                <div className="space-y-3 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search requests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={methodFilter} onValueChange={setMethodFilter}>
                      <SelectTrigger className="flex-1 bg-gray-800 border-gray-700 text-gray-200">
                        <SelectValue placeholder="Method" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="ALL_METHODS" className="text-gray-200 hover:bg-gray-700">All Methods</SelectItem>
                        <SelectItem value="GET" className="text-gray-200 hover:bg-gray-700">GET</SelectItem>
                        <SelectItem value="POST" className="text-gray-200 hover:bg-gray-700">POST</SelectItem>
                        <SelectItem value="PUT" className="text-gray-200 hover:bg-gray-700">PUT</SelectItem>
                        <SelectItem value="DELETE" className="text-gray-200 hover:bg-gray-700">DELETE</SelectItem>
                        <SelectItem value="PATCH" className="text-gray-200 hover:bg-gray-700">PATCH</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="flex-1 bg-gray-800 border-gray-700 text-gray-200">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="ALL_STATUS" className="text-gray-200 hover:bg-gray-700">All Status</SelectItem>
                        <SelectItem value="200" className="text-gray-200 hover:bg-gray-700">2xx Success</SelectItem>
                        <SelectItem value="300" className="text-gray-200 hover:bg-gray-700">3xx Redirect</SelectItem>
                        <SelectItem value="400" className="text-gray-200 hover:bg-gray-700">4xx Client Error</SelectItem>
                        <SelectItem value="500" className="text-gray-200 hover:bg-gray-700">5xx Server Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <ScrollArea>
                  {historyLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    </div>
                  ) : !history || history.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-300 mb-1">No requests yet</p>
                      <p className="text-gray-400 text-sm">Your request history will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {history.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-700 hover:border-gray-600 transition-all duration-200"
                          onClick={() => loadHistoryItem(item)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge className={`${getMethodColor(item.method)} text-xs font-semibold`}>
                                {item.method}
                              </Badge>
                              <Badge className={`${getStatusColor(item.status)} text-xs font-semibold`}>
                                {item.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-300">
                              <Clock className="w-3 h-3" />
                              {item.responseTime}ms
                            </div>
                          </div>
                          <p className="text-sm text-gray-100 font-medium truncate mb-1">{item.url}</p>
                          <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {/* Page Navigation */}
                {totalPages > 1 && (
                  <>
                    <Separator className="my-4 bg-gray-800" />
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchHistory(historyPage - 1)}
                        disabled={historyPage <= 1 || historyLoading}
                        className="border-gray-600 text-gray-200 hover:bg-gray-700 hover:text-white hover:border-gray-500"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </Button>
                      
                      <div className="flex items-center gap-2">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <Button
                              key={pageNum}
                              variant={historyPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => fetchHistory(pageNum)}
                              disabled={historyLoading}
                              className={
                                historyPage === pageNum
                                  ? "bg-blue-600 text-white border-blue-500 hover:bg-blue-700"
                                  : "border-gray-600 text-gray-200 hover:bg-gray-700 hover:text-white hover:border-gray-500"
                              }
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                        {totalPages > 5 && (
                          <>
                            <span className="text-gray-400">...</span>
                            <span className="text-sm text-gray-300">
                              Page {historyPage} of {totalPages}
                            </span>
                          </>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchHistory(historyPage + 1)}
                        disabled={historyPage >= totalPages || historyLoading}
                        className="border-gray-600 text-gray-200 hover:bg-gray-700 hover:text-white hover:border-gray-500"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
