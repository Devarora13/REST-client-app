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
import { Clock, Send, Trash2, ChevronLeft, ChevronRight, Zap, Globe, History, Code2, Loader2 } from "lucide-react"
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

  const fetchHistory = async (page = 1) => {
    setHistoryLoading(true)
    try {
      const res = await fetch(`/api/history?page=${page}&limit=10`)
      const data = await res.json()
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
    fetchHistory()
  }, [])

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
      fetchHistory() // Refresh history after new request

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
          <p className="text-gray-400 text-lg">A powerful REST API client with beautiful dark interface</p>
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
                    <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
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
                    <TabsTrigger value="headers" className="data-[state=active]:bg-gray-700">
                      Headers
                    </TabsTrigger>
                    <TabsTrigger value="body" className="data-[state=active]:bg-gray-700">
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
                    disabled={history.length === 0}
                    className="text-gray-400 hover:text-white hover:bg-gray-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <ScrollArea className="h-96">
                  {historyLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    </div>
                  ) : history.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400 mb-1">No requests yet</p>
                      <p className="text-gray-500 text-sm">Your request history will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {history.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-750 hover:border-gray-600 transition-all duration-200"
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
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Clock className="w-3 h-3" />
                              {item.responseTime}ms
                            </div>
                          </div>
                          <p className="text-sm text-white font-medium truncate mb-1">{item.url}</p>
                          <p className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {totalPages > 1 && (
                  <>
                    <Separator className="my-4 bg-gray-800" />
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchHistory(historyPage - 1)}
                        disabled={historyPage <= 1 || historyLoading}
                        className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </Button>
                      <span className="text-sm text-gray-400">
                        Page {historyPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchHistory(historyPage + 1)}
                        disabled={historyPage >= totalPages || historyLoading}
                        className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
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
