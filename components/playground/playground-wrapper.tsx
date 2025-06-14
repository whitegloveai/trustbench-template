"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { Code, Copy, Database, Globe, Info, Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { ApiClient, getItemsResponse } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert } from "@/components/global/alert"
import { Icons } from "@/components/global/icons"

type PlaygroundWrapperProps = {
  title: string
  description?: string
}

// Define a type to track the current data view
type DataViewType = "all" | "workspace" | "none"

export function PlaygroundWrapper({ title, description }: PlaygroundWrapperProps) {
  const [results, setResults] = useState<getItemsResponse>()
  const [activeTab, setActiveTab] = useState<string>("response")
  const [itemIdToDelete, setItemIdToDelete] = useState<string>("")
  // Track which type of data we're currently viewing
  const [currentView, setCurrentView] = useState<DataViewType>("none")
  const params = useParams()
  const slug = params.slug as string

  const { mutate: fetchAllItems, isPending } = useMutation({
    mutationFn: () => ApiClient.getItems(),
    onSuccess: (data) => {
      toast.success("Items fetched successfully")
      setResults(data)
      setActiveTab("response")
      setCurrentView("all")
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const { mutate: fetchWorkspaceItems, isPending: isFetchingWorkspaceItems } = useMutation({
    mutationFn: () => ApiClient.getItemsBySlug(slug),
    onSuccess: (data) => {
      toast.success("Workspace items fetched successfully")
      setResults(data)
      setActiveTab("response")
      setCurrentView("workspace")
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const { mutate: fetchItemsMadeByMe, isPending: isFetchingItemsMadeByMe } = useMutation({
    mutationFn: () => ApiClient.getItemsMadeByMe(),
    onSuccess: (data) => {
      toast.success("Items made by me fetched successfully")
      setResults(data)
      setActiveTab("response")
      setCurrentView("all")
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const { mutate: deleteItem, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => ApiClient.deleteItem(id),
    onSuccess: () => {
      toast.success("Item deleted successfully")

      // Only refresh if we're on the response tab and have data
      if (activeTab === "response" && currentView !== "none") {
        // Refresh based on the current view type
        if (currentView === "workspace") {
          fetchWorkspaceItems()
        } else if (currentView === "all") {
          fetchAllItems()
        }
      }

      setItemIdToDelete("")
    },
    onError: (error: any) => {
      // Remove console.log
      // Extract error details from the API response
      const errorMessage = error.message || "Failed to delete item"
      const errorDescription = error.description || "An unexpected error occurred"

      toast.error(errorMessage, {
        description: errorDescription,
      })
    },
  })

  const isFetching = isPending || isFetchingWorkspaceItems || isDeleting

  const copyToClipboard = () => {
    if (results) {
      navigator.clipboard.writeText(JSON.stringify(results, null, 2))
      toast.success("Copied to clipboard")
    }
  }

  const handleDeleteItem = () => {
    if (!itemIdToDelete.trim()) {
      toast.error("Please enter an item ID")
      return
    }
    deleteItem(itemIdToDelete)
  }

  // Function to clear results and reset view state
  const clearResults = () => {
    setResults(undefined)
    setCurrentView("none")
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* Main content area */}
        <div className="order-2 lg:order-1">
          <Card className="border-border/40 h-full shadow-sm">
            <CardHeader className="bg-muted/20 border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">Response</CardTitle>
                <div className="flex gap-1">
                  {results && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={clearResults}
                        className="h-8 w-8"
                        title="Clear results"
                      >
                        <Trash2 className="text-muted-foreground size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={copyToClipboard}
                        className="h-8 w-8"
                        title="Copy to clipboard"
                      >
                        <Copy className="size-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-muted/20 grid w-full grid-cols-2 rounded-none border-b px-6">
                  <TabsTrigger value="response">Response</TabsTrigger>
                  <TabsTrigger value="code">Code</TabsTrigger>
                </TabsList>
                <TabsContent value="response" className="p-0">
                  <ScrollArea className="h-[400px] w-full rounded-md">
                    <div className="flex h-full min-h-[400px] items-start p-6">
                      {isFetching ? (
                        <div className="text-muted-foreground flex h-[300px] w-full flex-col items-center justify-center gap-2">
                          <Loader2 className="size-8 animate-spin" />
                          <span>Fetching data...</span>
                        </div>
                      ) : !results?.data ? (
                        <div className="text-muted-foreground flex h-[300px] w-full flex-col items-center justify-center gap-2">
                          <Database className="size-12 opacity-20" />
                          <div className="text-center">
                            <p className="font-medium">No data available</p>
                            <p className="text-sm">Use the controls to fetch data</p>
                          </div>
                        </div>
                      ) : (
                        <pre className="w-full font-mono text-sm break-words whitespace-pre-wrap">
                          {JSON.stringify(results, null, 2)}
                        </pre>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="code" className="p-0">
                  <ScrollArea className="h-[400px] w-full rounded-md">
                    <div className="p-6">
                      <div className="space-y-6">
                        <div>
                          <h3 className="mb-2 text-sm font-medium">Direct API Calls</h3>
                          <div className="bg-muted rounded-md p-4">
                            <pre className="font-mono text-sm">
                              <code>{`// Example code to fetch data
import { ApiClient } from "@/lib/api-client"

// Fetch all items
const allItems = await ApiClient.getItems()

// Fetch items by slug
const workspaceItems = await ApiClient.getItemsBySlug("${slug}")

// Delete an item
const deleteResponse = await ApiClient.deleteItem("item-id-here")
`}</code>
                            </pre>
                          </div>
                        </div>

                        <div>
                          <h3 className="mb-2 text-sm font-medium">Using React Query</h3>
                          <div className="bg-muted rounded-md p-4">
                            <pre className="font-mono text-sm">
                              <code>{`// Example using React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ApiClient } from "@/lib/api-client"

// Query client instance (typically created at app root)
const queryClient = useQueryClient()

// Query hook for fetching all items
function useAllItems() {
  return useQuery({
    queryKey: ['items'],
    queryFn: () => ApiClient.getItems(),
  })
}

// Query hook for fetching workspace items
function useWorkspaceItems(slug: string) {
  return useQuery({
    queryKey: ['items', slug],
    queryFn: () => ApiClient.getItemsBySlug(slug),
    enabled: !!slug, // Only run if slug is available
  })
}

// Example component using the hooks
function ItemsComponent({ slug }) {
  // Track which view we're currently displaying
  const [view, setView] = useState('all') // 'all' or 'workspace'
  const [itemIdToDelete, setItemIdToDelete] = useState('')
  
  // Only fetch the data for the current view to avoid unnecessary requests
  const { data: allItems, isLoading: isLoadingAll } = useQuery({
    queryKey: ['items'],
    queryFn: () => ApiClient.getItems(),
    enabled: view === 'all', // Only fetch when this view is active
  })
  
  const { data: workspaceItems, isLoading: isLoadingWorkspace } = useQuery({
    queryKey: ['items', slug],
    queryFn: () => ApiClient.getItemsBySlug(slug),
    enabled: view === 'workspace' && !!slug, // Only fetch when this view is active
  })
  
  // Determine which data to display based on current view
  const currentData = view === 'all' ? allItems : workspaceItems
  const isLoading = view === 'all' ? isLoadingAll : isLoadingWorkspace
  
  // Mutation for deleting an item
  const { mutate: deleteItem, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => ApiClient.deleteItem(id),
    onSuccess: () => {
      // Invalidate the appropriate queries based on the current view
      if (view === 'all') {
        queryClient.invalidateQueries({ queryKey: ['items'] })
      } else {
        queryClient.invalidateQueries({ queryKey: ['items', slug] })
      }
      setItemIdToDelete('')
    },
  })
  
  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button 
          onClick={() => setView('all')} 
          className={\`btn \${view === 'all' ? 'btn-primary' : 'btn-outline'}\`}
        >
          All Items
        </button>
        <button 
          onClick={() => setView('workspace')} 
          className={\`btn \${view === 'workspace' ? 'btn-primary' : 'btn-outline'}\`}
        >
          Workspace Items
        </button>
      </div>
      
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <h3>Found {currentData?.data?.length || 0} items</h3>
          <ul>
            {currentData?.data?.map(item => (
              <li key={item.id} className="flex items-center gap-2">
                {item.name}
                <button 
                  onClick={() => deleteItem(item.id)}
                  disabled={isDeleting}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}`}</code>
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="bg-muted/10 text-muted-foreground border-t px-6 py-3 text-xs">
              {results ? (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono">
                    {results.data?.length || 0} items
                  </Badge>
                  <span>·</span>
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
              ) : (
                <span>Ready to fetch data</span>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Controls sidebar */}
        <div className="order-1 lg:order-2">
          <Card className="border-border/40 h-full shadow-sm">
            <CardHeader className="bg-muted/20 border-b px-6 py-4">
              <CardTitle className="text-lg font-medium">API Controls</CardTitle>
              <CardDescription>Select an endpoint to test</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* GET section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-500 text-white">GET</Badge>
                    <h3 className="font-medium">Items</h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Info className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs text-sm">Fetch all items from the API</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="space-y-2">
                    <Button
                      onClick={() => fetchAllItems()}
                      disabled={isFetching}
                      className="w-full justify-start gap-2"
                    >
                      <Globe className="size-4" />
                      <span>All items</span>
                      {isPending && <Loader2 className="ml-auto size-4 animate-spin" />}
                    </Button>

                    <Button
                      onClick={() => fetchWorkspaceItems()}
                      disabled={isFetching}
                      className="w-full justify-start gap-2"
                    >
                      <Database className="size-4" />
                      <span>Workspace items</span>
                      {isFetchingWorkspaceItems && (
                        <Loader2 className="ml-auto size-4 animate-spin" />
                      )}
                    </Button>

                    <Button
                      onClick={() => fetchItemsMadeByMe()}
                      disabled={isFetchingItemsMadeByMe}
                      className="w-full justify-start gap-2"
                    >
                      <Icons.user className="size-4" />
                      <span>Made by current user</span>
                      {isFetchingItemsMadeByMe && (
                        <Loader2 className="ml-auto size-4 animate-spin" />
                      )}
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* DELETE section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-500 text-white">DELETE</Badge>
                    <h3 className="font-medium">Delete Item</h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Info className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs text-sm">Delete an item by its ID</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter item ID"
                        value={itemIdToDelete}
                        onChange={(e) => setItemIdToDelete(e.target.value)}
                        disabled={isFetching}
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={handleDeleteItem}
                        disabled={isFetching || !itemIdToDelete.trim()}
                        className="shrink-0"
                      >
                        {isDeleting ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>
                    </div>
                    {results?.data && results.data.length > 0 && (
                      <div className="text-muted-foreground text-xs">
                        <p>Available IDs:</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {results.data.slice(0, 5).map((item) => (
                            <Badge
                              key={item.id}
                              variant="outline"
                              className="cursor-pointer font-mono"
                              onClick={() => setItemIdToDelete(item.id)}
                            >
                              {item.id}
                            </Badge>
                          ))}
                          {results.data.length > 5 && (
                            <span className="text-muted-foreground">
                              +{results.data.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Workspace info */}
                <div className="bg-muted/30 rounded-md border p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Code className="text-muted-foreground size-4" />
                    <span className="font-medium">Current workspace:</span>
                    <Badge variant="outline" className="font-mono">
                      {slug}
                    </Badge>
                  </div>
                </div>
                <Alert variant="info" title="GET Request retrieves all items" icon="info" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
