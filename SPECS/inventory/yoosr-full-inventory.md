# Yoosr Project Test Inventory

## 1. Home / Dashboard

#### File: /src/app/dashboard/layout.tsx
**Layout Component** - Wraps routes in this directory.

### COMPONENTS
- **DashboardLayout** (/src/app/dashboard/layout.tsx)
  - Props: { children }: { children: React.ReactNode }

### CONVEX WIRING
- useMutation(api.profiles.ensureCurrent) (/src/app/dashboard/layout.tsx)
- useMutation(api.profiles.setAvailability) (/src/app/dashboard/layout.tsx)


#### File: /src/app/dashboard/page.tsx
**Page Component** - Initially loads as defined in this path.

### COMPONENTS
- **DashboardPage** (/src/app/dashboard/page.tsx)

### UI ELEMENTS
- Button (/src/app/dashboard/page.tsx): 
- Table (/src/app/dashboard/page.tsx): 
- TableHeader (/src/app/dashboard/page.tsx): 
- TableRow (/src/app/dashboard/page.tsx): 
- TableHead (/src/app/dashboard/page.tsx): 
- TableHead (/src/app/dashboard/page.tsx): 
- TableHead (/src/app/dashboard/page.tsx): 
- TableHead (/src/app/dashboard/page.tsx): 
- TableBody (/src/app/dashboard/page.tsx): 
- TableRow (/src/app/dashboard/page.tsx): onClick={() => router.push(`/dashboard/chat?conversationId=${conv._id}`)}
- TableCell (/src/app/dashboard/page.tsx): 
- TableCell (/src/app/dashboard/page.tsx): 
- TableCell (/src/app/dashboard/page.tsx): 
- TableCell (/src/app/dashboard/page.tsx): 
- Badge (/src/app/dashboard/page.tsx): 
- Badge (/src/app/dashboard/page.tsx): 
- Button (/src/app/dashboard/page.tsx): disabled={activityStatus === "LoadingMore"}, onClick={() => loadMoreActivity(5)}

### CONVEX WIRING
- useQuery(api.dashboard.getHomeStats, activeProject ? { projectId: activeProject._id } : "skip") (/src/app/dashboard/page.tsx)

### ERROR STATES & REAL DATA
- Loading State Handled: Loader2 (/src/app/dashboard/page.tsx)

### RED FLAGS
- Found 2 'any' type usages (/src/app/dashboard/page.tsx)

## 2. Monitor

#### File: /src/app/dashboard/monitor/page.tsx
**Page Component** - Initially loads as defined in this path.

### COMPONENTS
- **MonitorPage** (/src/app/dashboard/monitor/page.tsx)

## 3. Chat Section

#### File: /src/app/dashboard/chat/layout.tsx
**Layout Component** - Wraps routes in this directory.

### COMPONENTS
- **VisitorPanelWrapper** (/src/app/dashboard/chat/layout.tsx)
- **ChatLayoutContent** (/src/app/dashboard/chat/layout.tsx)
  - Props: {
    children,
}: {
    children: React.ReactNode
}
- **ChatLayout** (/src/app/dashboard/chat/layout.tsx)
  - Props: { children }: { children: React.ReactNode }
  - Local State: useState<"list" | "chat" | "contact">("list")

### ERROR STATES & REAL DATA
- Loading State Handled: Loader2 (/src/app/dashboard/chat/layout.tsx)
- Loading State Handled: Loader2 (/src/app/dashboard/chat/layout.tsx)


#### File: /src/app/dashboard/chat/page.tsx
**Page Component** - Initially loads as defined in this path.

### COMPONENTS
- **ChatPage** (/src/app/dashboard/chat/page.tsx)

### ERROR STATES & REAL DATA
- Loading State Handled: Loader2 (/src/app/dashboard/chat/page.tsx)

## 4. Requests

#### File: /src/app/dashboard/requests/page.tsx
**Page Component** - Initially loads as defined in this path.

### COMPONENTS
- **RequestsPage** (/src/app/dashboard/requests/page.tsx)
  - Local State: useState<RequestFilter>("unassigned")

### UI ELEMENTS
- Button (/src/app/dashboard/requests/page.tsx): onClick={() => setFilter("unassigned")}
- Badge (/src/app/dashboard/requests/page.tsx): 
- Button (/src/app/dashboard/requests/page.tsx): onClick={() => setFilter("mine")}
- Badge (/src/app/dashboard/requests/page.tsx): 
- Button (/src/app/dashboard/requests/page.tsx): onClick={() => setFilter("bot_escalated")}
- Badge (/src/app/dashboard/requests/page.tsx): 
- Table (/src/app/dashboard/requests/page.tsx): 
- TableHeader (/src/app/dashboard/requests/page.tsx): 
- TableRow (/src/app/dashboard/requests/page.tsx): 
- TableHead (/src/app/dashboard/requests/page.tsx): 
- TableHead (/src/app/dashboard/requests/page.tsx): 
- TableHead (/src/app/dashboard/requests/page.tsx): 
- TableHead (/src/app/dashboard/requests/page.tsx): 
- TableHead (/src/app/dashboard/requests/page.tsx): 
- TableBody (/src/app/dashboard/requests/page.tsx): 
- TableRow (/src/app/dashboard/requests/page.tsx): 
- TableCell (/src/app/dashboard/requests/page.tsx): 
- TableRow (/src/app/dashboard/requests/page.tsx): 
- TableCell (/src/app/dashboard/requests/page.tsx): 
- TableRow (/src/app/dashboard/requests/page.tsx): onClick={() =>
                                            router.push(
                                                `/dashboard/chat?conversationId=${req._id}`
                                            )}
- TableCell (/src/app/dashboard/requests/page.tsx): 
- TableCell (/src/app/dashboard/requests/page.tsx): 
- TableCell (/src/app/dashboard/requests/page.tsx): 
- Badge (/src/app/dashboard/requests/page.tsx): 
- Badge (/src/app/dashboard/requests/page.tsx): 
- Badge (/src/app/dashboard/requests/page.tsx): 
- TableCell (/src/app/dashboard/requests/page.tsx): 
- TableCell (/src/app/dashboard/requests/page.tsx): 
- Button (/src/app/dashboard/requests/page.tsx): disabled={assigningId === req._id}, onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleAssignToMe(req._id)
                                                    }}
- Button (/src/app/dashboard/requests/page.tsx): disabled={resolvingId === req._id}, onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleResolve(req._id)
                                                    }}
- Search (/src/app/dashboard/requests/page.tsx): 
- Input (/src/app/dashboard/requests/page.tsx): placeholder="Search requests...", value={search}

### CONVEX WIRING
- useMutation(api.conversations.update) (/src/app/dashboard/requests/page.tsx)
- useMutation(api.conversations.resolve) (/src/app/dashboard/requests/page.tsx)
- useQuery(api.settings.getMyDepartments, activeProject ? { projectId: activeProject._id } : "skip") (/src/app/dashboard/requests/page.tsx)
- useQuery(api.conversations.list, activeProject ? {
                projectId: activeProject._id,
                departmentId: myDepartments && myDepartments.length > 0 ? myDepartments[0]._id : undefined
            } : "skip") (/src/app/dashboard/requests/page.tsx)

### ERROR STATES & REAL DATA
- Loading State Handled: Loader2 (/src/app/dashboard/requests/page.tsx)
- Loading State Handled: Loader2 (/src/app/dashboard/requests/page.tsx)

### RED FLAGS
- Console usage: console.error("Error assigning conversation:", error) (/src/app/dashboard/requests/page.tsx)
- Console usage: console.error("Error resolving conversation:", error) (/src/app/dashboard/requests/page.tsx)
- Found 5 'any' type usages (/src/app/dashboard/requests/page.tsx)

## 5. Orders

#### File: /src/app/dashboard/orders/page.tsx
**Page Component** - Initially loads as defined in this path.

### COMPONENTS
- **OrdersPage** (/src/app/dashboard/orders/page.tsx)
  - Local State: useState<FilterType>("all")

### UI ELEMENTS
- Dialog (/src/app/dashboard/orders/page.tsx): 
- DialogTrigger (/src/app/dashboard/orders/page.tsx): 
- Button (/src/app/dashboard/orders/page.tsx): 
- DialogContent (/src/app/dashboard/orders/page.tsx): 
- DialogHeader (/src/app/dashboard/orders/page.tsx): 
- DialogTitle (/src/app/dashboard/orders/page.tsx): 
- DialogDescription (/src/app/dashboard/orders/page.tsx): 
- Table (/src/app/dashboard/orders/page.tsx): 
- TableHeader (/src/app/dashboard/orders/page.tsx): 
- TableRow (/src/app/dashboard/orders/page.tsx): 
- TableHead (/src/app/dashboard/orders/page.tsx): 
- TableHead (/src/app/dashboard/orders/page.tsx): 
- TableHead (/src/app/dashboard/orders/page.tsx): 
- TableHead (/src/app/dashboard/orders/page.tsx): 
- TableBody (/src/app/dashboard/orders/page.tsx): 
- TableRow (/src/app/dashboard/orders/page.tsx): 
- TableCell (/src/app/dashboard/orders/page.tsx): 
- TableCell (/src/app/dashboard/orders/page.tsx): 
- TableCell (/src/app/dashboard/orders/page.tsx): 
- TableCell (/src/app/dashboard/orders/page.tsx): 
- Badge (/src/app/dashboard/orders/page.tsx): 
- DialogFooter (/src/app/dashboard/orders/page.tsx): 
- Button (/src/app/dashboard/orders/page.tsx): onClick={() => {
                                    importDispatch({ type: "RESET" })
                                }}
- Button (/src/app/dashboard/orders/page.tsx): disabled={parsedOrders.length === 0 || importLoading}, onClick={handleImportConfirm}
- Button (/src/app/dashboard/orders/page.tsx): 
- Button (/src/app/dashboard/orders/page.tsx): onClick={() => setFilter("all")}
- Button (/src/app/dashboard/orders/page.tsx): onClick={() => setFilter("new")}
- Button (/src/app/dashboard/orders/page.tsx): onClick={() => setFilter("confirmed")}
- Button (/src/app/dashboard/orders/page.tsx): onClick={() => setFilter("cancelled")}
- Table (/src/app/dashboard/orders/page.tsx): 
- TableHeader (/src/app/dashboard/orders/page.tsx): 
- TableRow (/src/app/dashboard/orders/page.tsx): 
- TableHead (/src/app/dashboard/orders/page.tsx): 
- TableHead (/src/app/dashboard/orders/page.tsx): 
- TableHead (/src/app/dashboard/orders/page.tsx): 
- TableHead (/src/app/dashboard/orders/page.tsx): 
- TableHead (/src/app/dashboard/orders/page.tsx): 
- TableHead (/src/app/dashboard/orders/page.tsx): 
- TableHead (/src/app/dashboard/orders/page.tsx): 
- TableBody (/src/app/dashboard/orders/page.tsx): 
- TableRow (/src/app/dashboard/orders/page.tsx): 
- TableCell (/src/app/dashboard/orders/page.tsx): 
- TableRow (/src/app/dashboard/orders/page.tsx): 
- TableCell (/src/app/dashboard/orders/page.tsx): 
- TableCell (/src/app/dashboard/orders/page.tsx): 
- TableCell (/src/app/dashboard/orders/page.tsx): 
- TableCell (/src/app/dashboard/orders/page.tsx): 
- TableCell (/src/app/dashboard/orders/page.tsx): 
- Badge (/src/app/dashboard/orders/page.tsx): 
- Badge (/src/app/dashboard/orders/page.tsx): 
- Badge (/src/app/dashboard/orders/page.tsx): 
- TableCell (/src/app/dashboard/orders/page.tsx): 
- TableCell (/src/app/dashboard/orders/page.tsx): 
- Button (/src/app/dashboard/orders/page.tsx): 
- TableRow (/src/app/dashboard/orders/page.tsx): 
- TableCell (/src/app/dashboard/orders/page.tsx): 
- Input (/src/app/dashboard/orders/page.tsx): type="file"

### CONVEX WIRING
- useQuery(api.orders.listOrders, activeProject ? { projectId: activeProject._id } : "skip") (/src/app/dashboard/orders/page.tsx)
- useMutation(api.orders.updateOrderStatus) (/src/app/dashboard/orders/page.tsx)
- useMutation(api.orders.deleteOrder) (/src/app/dashboard/orders/page.tsx)
- useMutation(api.orders.batchImportOrders) (/src/app/dashboard/orders/page.tsx)

### ERROR STATES & REAL DATA
- Loading State Handled: Loader2 (/src/app/dashboard/orders/page.tsx)
- Loading State Handled: Loader2 (/src/app/dashboard/orders/page.tsx)

### RED FLAGS
- Found 8 'any' type usages (/src/app/dashboard/orders/page.tsx)

## 6. Bots

#### File: /src/app/dashboard/bots/page.tsx
**Page Component** - Initially loads as defined in this path.

### COMPONENTS
- **BotsPage** (/src/app/dashboard/bots/page.tsx)
  - Local State: useState<'all' | 'chatbot' | 'automation'>('all')

### UI ELEMENTS
- Button (/src/app/dashboard/bots/page.tsx): onClick={() => setFilter('all')}
- Button (/src/app/dashboard/bots/page.tsx): onClick={() => setFilter('chatbot')}
- Button (/src/app/dashboard/bots/page.tsx): onClick={() => setFilter('automation')}
- Button (/src/app/dashboard/bots/page.tsx): 
- Button (/src/app/dashboard/bots/page.tsx): onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                    }}
- AlertDialog (/src/app/dashboard/bots/page.tsx): 
- AlertDialogContent (/src/app/dashboard/bots/page.tsx): 
- AlertDialogHeader (/src/app/dashboard/bots/page.tsx): 
- AlertDialogTitle (/src/app/dashboard/bots/page.tsx): 
- AlertDialogDescription (/src/app/dashboard/bots/page.tsx): 
- AlertDialogFooter (/src/app/dashboard/bots/page.tsx): 
- AlertDialogCancel (/src/app/dashboard/bots/page.tsx): 
- AlertDialogAction (/src/app/dashboard/bots/page.tsx): onClick={async () => {
                                if (botPendingDelete) {
                                    await removeBot({ id: botPendingDelete })
                                    setBotPendingDelete(null)
                                }
                            }}
- CreateBotDialog (/src/app/dashboard/bots/page.tsx): 
- Search (/src/app/dashboard/bots/page.tsx): 
- Input (/src/app/dashboard/bots/page.tsx): placeholder="Search flows...", value={search}

### CONVEX WIRING
- useQuery(api.bots.list, activeProject ? { projectId: activeProject._id } : "skip") (/src/app/dashboard/bots/page.tsx)
- useMutation(api.bots.create) (/src/app/dashboard/bots/page.tsx)
- useMutation(api.bots.update) (/src/app/dashboard/bots/page.tsx)
- useMutation(api.bots.remove) (/src/app/dashboard/bots/page.tsx)

## 7. Design Studio

#### File: /src/app/design-studio/layout.tsx
**Layout Component** - Wraps routes in this directory.

### COMPONENTS
- **DesignStudioLayoutContent** (/src/app/design-studio/layout.tsx)
  - Props: {
    children,
}: {
    children: React.ReactNode;
}
- **DesignStudioLayout** (/src/app/design-studio/layout.tsx)
  - Props: {
    children,
}: {
    children: React.ReactNode;
}

### CONVEX WIRING
- useMutation(api.profiles.ensureCurrent) (/src/app/design-studio/layout.tsx)

### ERROR STATES & REAL DATA
- Loading State Handled: Loader2 (/src/app/design-studio/layout.tsx)
- Loading State Handled: Loader2 (/src/app/design-studio/layout.tsx)


#### File: /src/app/design-studio/[botId]/BotEditorClient.tsx
### COMPONENTS
- **BotEditor** (/src/app/design-studio/[botId]/BotEditorClient.tsx)
- **BotEditorClient** (/src/app/design-studio/[botId]/BotEditorClient.tsx)
  - Local State: useState<SaveState>("idle")

### UI ELEMENTS
- button (/src/app/design-studio/[botId]/BotEditorClient.tsx): onClick={() =>
                        router.push(
                            `/dashboard/bots${projectId ? `?project=${projectId}` : ""}`
                        )}

### CONVEX WIRING
- useQuery(api.bots.get, botId ? { id: botId } : "skip") (/src/app/design-studio/[botId]/BotEditorClient.tsx)
- useQuery(api.botFlows.get, botId ? { botId } : "skip") (/src/app/design-studio/[botId]/BotEditorClient.tsx)
- useMutation(api.botFlows.save) (/src/app/design-studio/[botId]/BotEditorClient.tsx)

### ERROR STATES & REAL DATA
- Loading State Handled: Loader2 (/src/app/design-studio/[botId]/BotEditorClient.tsx)
- Loading State Handled: Loader2 (/src/app/design-studio/[botId]/BotEditorClient.tsx)

### RED FLAGS
- Console usage: console.error("Save failed:", error) (/src/app/design-studio/[botId]/BotEditorClient.tsx)
- Console usage: console.error("Save failed:", error) (/src/app/design-studio/[botId]/BotEditorClient.tsx)
- Found 2 'any' type usages (/src/app/design-studio/[botId]/BotEditorClient.tsx)


#### File: /src/app/design-studio/[botId]/page.tsx
**Page Component** - Initially loads as defined in this path.

### COMPONENTS
- **BotEditorPage** (/src/app/design-studio/[botId]/page.tsx)

## 8. Knowledge Base

#### File: /src/app/dashboard/kb/layout.tsx
**Layout Component** - Wraps routes in this directory.

### COMPONENTS
- **KnowledgeBaseLayout** (/src/app/dashboard/kb/layout.tsx)
  - Props: {
    children,
}: {
    children: React.ReactNode
}

### UI ELEMENTS
- Button (/src/app/dashboard/kb/layout.tsx): 

### CONVEX WIRING
- useQuery(api.knowledgeBases.list, activeProject ? { projectId: activeProject._id } : "skip") (/src/app/dashboard/kb/layout.tsx)

### RED FLAGS
- Found 1 'any' type usages (/src/app/dashboard/kb/layout.tsx)


#### File: /src/app/dashboard/kb/page.tsx
**Page Component** - Initially loads as defined in this path.

### COMPONENTS
- **KnowledgeBasePage** (/src/app/dashboard/kb/page.tsx)


#### File: /src/app/dashboard/kb/[kbId]/page.tsx
**Page Component** - Initially loads as defined in this path.

### COMPONENTS
- **KnowledgeBaseDetailsPage** (/src/app/dashboard/kb/[kbId]/page.tsx)
  - Local State: useState<Id<"knowledge_bases"> | null>(null)

### UI ELEMENTS
- Button (/src/app/dashboard/kb/[kbId]/page.tsx): disabled={loading || contents.length === 0}, onClick={handleExport}
- Badge (/src/app/dashboard/kb/[kbId]/page.tsx): 
- Badge (/src/app/dashboard/kb/[kbId]/page.tsx): 
- Badge (/src/app/dashboard/kb/[kbId]/page.tsx): 
- Badge (/src/app/dashboard/kb/[kbId]/page.tsx): 
- Badge (/src/app/dashboard/kb/[kbId]/page.tsx): 
- Badge (/src/app/dashboard/kb/[kbId]/page.tsx): 
- Button (/src/app/dashboard/kb/[kbId]/page.tsx): onClick={() => setPendingDeleteId(item._id)}
- AlertDialog (/src/app/dashboard/kb/[kbId]/page.tsx): 
- AlertDialogContent (/src/app/dashboard/kb/[kbId]/page.tsx): 
- AlertDialogHeader (/src/app/dashboard/kb/[kbId]/page.tsx): 
- AlertDialogTitle (/src/app/dashboard/kb/[kbId]/page.tsx): 
- AlertDialogDescription (/src/app/dashboard/kb/[kbId]/page.tsx): 
- AlertDialogFooter (/src/app/dashboard/kb/[kbId]/page.tsx): 
- AlertDialogCancel (/src/app/dashboard/kb/[kbId]/page.tsx): 
- AlertDialogAction (/src/app/dashboard/kb/[kbId]/page.tsx): onClick={async () => {
                                if (pendingDeleteId) {
                                    await handleRemove(pendingDeleteId)
                                    setPendingDeleteId(null)
                                }
                            }}
- AddContentDialog (/src/app/dashboard/kb/[kbId]/page.tsx): 

### CONVEX WIRING
- useMutation(api.knowledgeBases.getOrCreateDefault) (/src/app/dashboard/kb/[kbId]/page.tsx)
- useQuery(api.knowledgeBases.listSources, resolvedKbId ? { kbId: resolvedKbId } : "skip") (/src/app/dashboard/kb/[kbId]/page.tsx)
- useMutation(api.knowledgeBases.addSource) (/src/app/dashboard/kb/[kbId]/page.tsx)
- useMutation(api.knowledgeBases.removeSource) (/src/app/dashboard/kb/[kbId]/page.tsx)

### RED FLAGS
- Console usage: console.error("Failed to get default KB", e) (/src/app/dashboard/kb/[kbId]/page.tsx)
- Found 2 'any' type usages (/src/app/dashboard/kb/[kbId]/page.tsx)

## 9. Analytics

#### File: /src/app/dashboard/analytics/page.tsx
**Page Component** - Initially loads as defined in this path.

### COMPONENTS
- **AnalyticsPage** (/src/app/dashboard/analytics/page.tsx)
  - Local State: useState(defaultFrom)

### UI ELEMENTS
- Button (/src/app/dashboard/analytics/page.tsx): onClick={() => { setFromDate(defaultFrom); setToDate(defaultTo); }}
- Input (/src/app/dashboard/analytics/page.tsx): type="date", value={fromDate}
- Input (/src/app/dashboard/analytics/page.tsx): type="date", value={toDate}

### CONVEX WIRING
- useQuery(api.analytics.getConversationStats, activeProject ? { projectId: activeProject._id, from, to } : "skip") (/src/app/dashboard/analytics/page.tsx)
- useQuery(api.analytics.getConversationVolume, activeProject ? { projectId: activeProject._id, from, to } : "skip") (/src/app/dashboard/analytics/page.tsx)
- useQuery(api.analytics.getTokenUsage, activeProject ? { projectId: activeProject._id, from, to } : "skip") (/src/app/dashboard/analytics/page.tsx)
- useQuery(api.analytics.getCSATSummary, activeProject ? { projectId: activeProject._id, from, to } : "skip") (/src/app/dashboard/analytics/page.tsx)
- useQuery(api.analytics.getUnansweredQueries, activeProject ? { projectId: activeProject._id, limit: 20, from, to } : "skip") (/src/app/dashboard/analytics/page.tsx)
- useQuery(api.analytics.getProjectUsage, activeProject ? { projectId: activeProject._id } : "skip") (/src/app/dashboard/analytics/page.tsx)
- useQuery(api.analytics.getTagsSummary, activeProject ? { projectId: activeProject._id, from, to } : "skip") (/src/app/dashboard/analytics/page.tsx)
- useQuery(api.analytics.getSLABreachRate, activeProject ? { projectId: activeProject._id, from, to } : "skip") (/src/app/dashboard/analytics/page.tsx)

### RED FLAGS
- Found 2 'any' type usages (/src/app/dashboard/analytics/page.tsx)

## 10. Activities / Activity Log

#### File: /src/app/dashboard/activities/page.tsx
**Page Component** - Initially loads as defined in this path.

### COMPONENTS
- **ActivitiesPage** (/src/app/dashboard/activities/page.tsx)

### UI ELEMENTS
- ActivitiesDataTable (/src/app/dashboard/activities/page.tsx): 

### ERROR STATES & REAL DATA
- Loading State Handled: Loader2 (/src/app/dashboard/activities/page.tsx)

### RED FLAGS
- Found 1 'any' type usages (/src/app/dashboard/activities/page.tsx)

## 11. History

#### File: /src/app/dashboard/history/page.tsx
**Page Component** - Initially loads as defined in this path.

### COMPONENTS
- **HistoryPage** (/src/app/dashboard/history/page.tsx)
  - Local State: useState("")

### UI ELEMENTS
- Button (/src/app/dashboard/history/page.tsx): onClick={exportToCSV}
- Popover (/src/app/dashboard/history/page.tsx): 
- PopoverTrigger (/src/app/dashboard/history/page.tsx): 
- Button (/src/app/dashboard/history/page.tsx): 
- PopoverContent (/src/app/dashboard/history/page.tsx): 
- Button (/src/app/dashboard/history/page.tsx): onClick={() => setDate(undefined)}
- Table (/src/app/dashboard/history/page.tsx): 
- TableHeader (/src/app/dashboard/history/page.tsx): 
- TableRow (/src/app/dashboard/history/page.tsx): 
- TableHead (/src/app/dashboard/history/page.tsx): 
- TableHead (/src/app/dashboard/history/page.tsx): 
- TableHead (/src/app/dashboard/history/page.tsx): 
- TableHead (/src/app/dashboard/history/page.tsx): 
- TableHead (/src/app/dashboard/history/page.tsx): 
- TableBody (/src/app/dashboard/history/page.tsx): 
- TableRow (/src/app/dashboard/history/page.tsx): 
- TableCell (/src/app/dashboard/history/page.tsx): 
- TableRow (/src/app/dashboard/history/page.tsx): 
- TableCell (/src/app/dashboard/history/page.tsx): 
- TableRow (/src/app/dashboard/history/page.tsx): 
- TableCell (/src/app/dashboard/history/page.tsx): 
- TableCell (/src/app/dashboard/history/page.tsx): 
- Popover (/src/app/dashboard/history/page.tsx): 
- PopoverTrigger (/src/app/dashboard/history/page.tsx): 
- button (/src/app/dashboard/history/page.tsx): 
- PopoverContent (/src/app/dashboard/history/page.tsx): 
- TableCell (/src/app/dashboard/history/page.tsx): 
- TableCell (/src/app/dashboard/history/page.tsx): 
- TableCell (/src/app/dashboard/history/page.tsx): 
- Button (/src/app/dashboard/history/page.tsx): onClick={() => window.location.href = `/dashboard/chat?conversationId=${convo._id}`}
- Button (/src/app/dashboard/history/page.tsx): disabled={status === "LoadingMore"}, onClick={() => loadMore(50)}
- Search (/src/app/dashboard/history/page.tsx): 
- Input (/src/app/dashboard/history/page.tsx): placeholder="Search history...", value={search}

### CONVEX WIRING
- useQuery(api.profiles.list) (/src/app/dashboard/history/page.tsx)

### RED FLAGS
- Found 1 'any' type usages (/src/app/dashboard/history/page.tsx)

## 12. Contacts

#### File: /src/app/dashboard/contacts/page.tsx
**Page Component** - Initially loads as defined in this path.

### COMPONENTS
- **ContactsPage** (/src/app/dashboard/contacts/page.tsx)
  - Local State: useState(false)

### UI ELEMENTS
- Dialog (/src/app/dashboard/contacts/page.tsx): 
- DialogTrigger (/src/app/dashboard/contacts/page.tsx): 
- Button (/src/app/dashboard/contacts/page.tsx): 
- DialogContent (/src/app/dashboard/contacts/page.tsx): 
- DialogHeader (/src/app/dashboard/contacts/page.tsx): 
- DialogTitle (/src/app/dashboard/contacts/page.tsx): 
- DialogDescription (/src/app/dashboard/contacts/page.tsx): 
- Table (/src/app/dashboard/contacts/page.tsx): 
- TableHeader (/src/app/dashboard/contacts/page.tsx): 
- TableRow (/src/app/dashboard/contacts/page.tsx): 
- TableHead (/src/app/dashboard/contacts/page.tsx): 
- TableHead (/src/app/dashboard/contacts/page.tsx): 
- TableHead (/src/app/dashboard/contacts/page.tsx): 
- TableBody (/src/app/dashboard/contacts/page.tsx): 
- TableRow (/src/app/dashboard/contacts/page.tsx): 
- TableCell (/src/app/dashboard/contacts/page.tsx): 
- TableCell (/src/app/dashboard/contacts/page.tsx): 
- TableCell (/src/app/dashboard/contacts/page.tsx): 
- DialogFooter (/src/app/dashboard/contacts/page.tsx): 
- Button (/src/app/dashboard/contacts/page.tsx): onClick={() => {
                                    importDispatch({ type: "RESET" })
                                }}
- Button (/src/app/dashboard/contacts/page.tsx): disabled={parsedContacts.length === 0 || importLoading}, onClick={handleImportConfirm}
- Button (/src/app/dashboard/contacts/page.tsx): 
- Dialog (/src/app/dashboard/contacts/page.tsx): 
- DialogTrigger (/src/app/dashboard/contacts/page.tsx): 
- Button (/src/app/dashboard/contacts/page.tsx): 
- DialogContent (/src/app/dashboard/contacts/page.tsx): 
- DialogHeader (/src/app/dashboard/contacts/page.tsx): 
- DialogTitle (/src/app/dashboard/contacts/page.tsx): 
- DialogDescription (/src/app/dashboard/contacts/page.tsx): 
- DialogFooter (/src/app/dashboard/contacts/page.tsx): 
- Button (/src/app/dashboard/contacts/page.tsx): disabled={loading}, type="submit"
- Input (/src/app/dashboard/contacts/page.tsx): type="file"
- Input (/src/app/dashboard/contacts/page.tsx): value={formData.name}
- Input (/src/app/dashboard/contacts/page.tsx): type="email", value={formData.email}
- Input (/src/app/dashboard/contacts/page.tsx): type="tel", value={formData.phone}
- Input (/src/app/dashboard/contacts/page.tsx): value={formData.address}

### CONVEX WIRING
- useQuery(api.contacts.list, activeProject ? { projectId: activeProject._id } : "skip") (/src/app/dashboard/contacts/page.tsx)
- useMutation(api.contacts.create) (/src/app/dashboard/contacts/page.tsx)
- useMutation(api.contacts.batchImport) (/src/app/dashboard/contacts/page.tsx)

### ERROR STATES & REAL DATA
- Loading State Handled: Loader2 (/src/app/dashboard/contacts/page.tsx)
- Loading State Handled: Loader2 (/src/app/dashboard/contacts/page.tsx)

### RED FLAGS
- Console usage: console.error(error) (/src/app/dashboard/contacts/page.tsx)
- Console usage: console.error(error) (/src/app/dashboard/contacts/page.tsx)
- Found 6 'any' type usages (/src/app/dashboard/contacts/page.tsx)

## 13. Settings

#### File: /src/app/dashboard/settings/layout.tsx
**Layout Component** - Wraps routes in this directory.

### COMPONENTS
- **SettingsLayout** (/src/app/dashboard/settings/layout.tsx)
  - Props: { children }: SettingsLayoutProps


#### File: /src/app/dashboard/settings/page.tsx
**Page Component** - Initially loads as defined in this path.

### COMPONENTS
- **SettingsPage** (/src/app/dashboard/settings/page.tsx)
- **SettingsContent** (/src/app/dashboard/settings/page.tsx)
  - Local State: useState(false)

### UI ELEMENTS
- Tabs (/src/app/dashboard/settings/page.tsx): 
- TabsList (/src/app/dashboard/settings/page.tsx): 
- TabsTrigger (/src/app/dashboard/settings/page.tsx): value={general}
- TabsTrigger (/src/app/dashboard/settings/page.tsx): value={advanced}
- TabsContent (/src/app/dashboard/settings/page.tsx): value={general}
- Select (/src/app/dashboard/settings/page.tsx): value={defaultModel}
- SelectTrigger (/src/app/dashboard/settings/page.tsx): 
- SelectContent (/src/app/dashboard/settings/page.tsx): 
- SelectGroup (/src/app/dashboard/settings/page.tsx): 
- SelectLabel (/src/app/dashboard/settings/page.tsx): 
- SelectItem (/src/app/dashboard/settings/page.tsx): value={m.id}
- Button (/src/app/dashboard/settings/page.tsx): onClick={() =>
                                            copyToClipboard(
                                                projectId,
                                                "Project ID"
                                            )}
- Button (/src/app/dashboard/settings/page.tsx): disabled={loading}, onClick={handleSave}
- TabsContent (/src/app/dashboard/settings/page.tsx): value={advanced}
- Button (/src/app/dashboard/settings/page.tsx): disabled={confirmDelete !==
                                                    activeProject?.name ||
                                                    deleting}, onClick={handleDeleteProject}
- Input (/src/app/dashboard/settings/page.tsx): value={projectName}
- SelectValue (/src/app/dashboard/settings/page.tsx): placeholder="Select a model"
- Input (/src/app/dashboard/settings/page.tsx): type="number", placeholder="e.g. 4", value={slaHours}
- Input (/src/app/dashboard/settings/page.tsx): disabled={true}, value={projectId}
- Input (/src/app/dashboard/settings/page.tsx): placeholder="Project name", value={confirmDelete}

### CONVEX WIRING
- useMutation(api.projects.update) (/src/app/dashboard/settings/page.tsx)
- useMutation(api.projects.remove) (/src/app/dashboard/settings/page.tsx)

### ERROR STATES & REAL DATA
- Loading State Handled: Loader2 (/src/app/dashboard/settings/page.tsx)
- Loading State Handled: Loader2 (/src/app/dashboard/settings/page.tsx)


#### File: /src/app/dashboard/settings/canned-responses/page.tsx
**Page Component** - Initially loads as defined in this path.

### COMPONENTS
- **CannedResponsesPage** (/src/app/dashboard/settings/canned-responses/page.tsx)
  - Local State: useState(false)

### UI ELEMENTS
- Dialog (/src/app/dashboard/settings/canned-responses/page.tsx): 
- DialogTrigger (/src/app/dashboard/settings/canned-responses/page.tsx): 
- Button (/src/app/dashboard/settings/canned-responses/page.tsx): 
- DialogContent (/src/app/dashboard/settings/canned-responses/page.tsx): 
- DialogHeader (/src/app/dashboard/settings/canned-responses/page.tsx): 
- DialogTitle (/src/app/dashboard/settings/canned-responses/page.tsx): 
- DialogDescription (/src/app/dashboard/settings/canned-responses/page.tsx): 
- Button (/src/app/dashboard/settings/canned-responses/page.tsx): 
- DialogFooter (/src/app/dashboard/settings/canned-responses/page.tsx): 
- Button (/src/app/dashboard/settings/canned-responses/page.tsx): onClick={() => setCreateOpen(false)}
- Button (/src/app/dashboard/settings/canned-responses/page.tsx): disabled={!newTitle || !newMessage}, onClick={handleCreate}
- Table (/src/app/dashboard/settings/canned-responses/page.tsx): 
- TableHeader (/src/app/dashboard/settings/canned-responses/page.tsx): 
- TableRow (/src/app/dashboard/settings/canned-responses/page.tsx): 
- TableHead (/src/app/dashboard/settings/canned-responses/page.tsx): 
- TableHead (/src/app/dashboard/settings/canned-responses/page.tsx): 
- TableHead (/src/app/dashboard/settings/canned-responses/page.tsx): 
- TableHead (/src/app/dashboard/settings/canned-responses/page.tsx): 
- TableBody (/src/app/dashboard/settings/canned-responses/page.tsx): 
- TableRow (/src/app/dashboard/settings/canned-responses/page.tsx): 
- TableCell (/src/app/dashboard/settings/canned-responses/page.tsx): 
- TableRow (/src/app/dashboard/settings/canned-responses/page.tsx): 
- TableCell (/src/app/dashboard/settings/canned-responses/page.tsx): 
- TableCell (/src/app/dashboard/settings/canned-responses/page.tsx): 
- TableCell (/src/app/dashboard/settings/canned-responses/page.tsx): 
- TableCell (/src/app/dashboard/settings/canned-responses/page.tsx): 
- Button (/src/app/dashboard/settings/canned-responses/page.tsx): onClick={() => {
                                                setEditingId(res._id)
                                                setEditTitle(res.trigger)
                                                setEditMessage(res.message)
                                            }}
- Button (/src/app/dashboard/settings/canned-responses/page.tsx): onClick={() => setResponsePendingDelete(res._id)}
- Dialog (/src/app/dashboard/settings/canned-responses/page.tsx): 
- DialogContent (/src/app/dashboard/settings/canned-responses/page.tsx): 
- DialogHeader (/src/app/dashboard/settings/canned-responses/page.tsx): 
- DialogTitle (/src/app/dashboard/settings/canned-responses/page.tsx): 
- DialogDescription (/src/app/dashboard/settings/canned-responses/page.tsx): 
- Button (/src/app/dashboard/settings/canned-responses/page.tsx): 
- DialogFooter (/src/app/dashboard/settings/canned-responses/page.tsx): 
- Button (/src/app/dashboard/settings/canned-responses/page.tsx): onClick={() => {
                                setEditingId(null)
                                setEditTitle("")
                                setEditMessage("")
                            }}
- Button (/src/app/dashboard/settings/canned-responses/page.tsx): disabled={!editTitle || !editMessage}, onClick={handleEditSubmit}
- AlertDialog (/src/app/dashboard/settings/canned-responses/page.tsx): 
- AlertDialogContent (/src/app/dashboard/settings/canned-responses/page.tsx): 
- AlertDialogHeader (/src/app/dashboard/settings/canned-responses/page.tsx): 
- AlertDialogTitle (/src/app/dashboard/settings/canned-responses/page.tsx): 
- AlertDialogDescription (/src/app/dashboard/settings/canned-responses/page.tsx): 
- AlertDialogFooter (/src/app/dashboard/settings/canned-responses/page.tsx): 
- AlertDialogCancel (/src/app/dashboard/settings/canned-responses/page.tsx): 
- AlertDialogAction (/src/app/dashboard/settings/canned-responses/page.tsx): onClick={async () => {
                                if (responsePendingDelete) {
                                    await handleDelete(responsePendingDelete)
                                    setResponsePendingDelete(null)
                                }
                            }}
- Input (/src/app/dashboard/settings/canned-responses/page.tsx): placeholder="e.g., greeting, closing, refund-policy", value={newTitle}
- Search (/src/app/dashboard/settings/canned-responses/page.tsx): 
- Input (/src/app/dashboard/settings/canned-responses/page.tsx): placeholder="Search responses...", value={searchQuery}
- Input (/src/app/dashboard/settings/canned-responses/page.tsx): placeholder="e.g., greeting, closing, refund-policy", value={editTitle}

### CONVEX WIRING
- useQuery(api.settings.listCannedResponses, activeProject ? { projectId: activeProject._id } : "skip") (/src/app/dashboard/settings/canned-responses/page.tsx)
- useMutation(api.settings.createCannedResponse) (/src/app/dashboard/settings/canned-responses/page.tsx)
- useMutation(api.settings.updateCannedResponse) (/src/app/dashboard/settings/canned-responses/page.tsx)
- useMutation(api.settings.removeCannedResponse) (/src/app/dashboard/settings/canned-responses/page.tsx)

### RED FLAGS
- Found 3 'any' type usages (/src/app/dashboard/settings/canned-responses/page.tsx)


#### File: /src/app/dashboard/settings/departments/page.tsx
**Page Component** - Initially loads as defined in this path.

### COMPONENTS
- **DepartmentsPage** (/src/app/dashboard/settings/departments/page.tsx)
  - Local State: useReducer(departmentsReducer, initialState)

### UI ELEMENTS
- Dialog (/src/app/dashboard/settings/departments/page.tsx): 
- DialogTrigger (/src/app/dashboard/settings/departments/page.tsx): 
- Button (/src/app/dashboard/settings/departments/page.tsx): 
- DialogContent (/src/app/dashboard/settings/departments/page.tsx): 
- DialogHeader (/src/app/dashboard/settings/departments/page.tsx): 
- DialogTitle (/src/app/dashboard/settings/departments/page.tsx): 
- DialogDescription (/src/app/dashboard/settings/departments/page.tsx): 
- Select (/src/app/dashboard/settings/departments/page.tsx): value={botId}
- SelectTrigger (/src/app/dashboard/settings/departments/page.tsx): 
- SelectContent (/src/app/dashboard/settings/departments/page.tsx): 
- SelectItem (/src/app/dashboard/settings/departments/page.tsx): disabled={true}, value={none}
- SelectItem (/src/app/dashboard/settings/departments/page.tsx): value={bot._id}
- Badge (/src/app/dashboard/settings/departments/page.tsx): 
- button (/src/app/dashboard/settings/departments/page.tsx): onClick={() => removeTag(tag)}
- Button (/src/app/dashboard/settings/departments/page.tsx): onClick={addTag}, type="button"
- DialogFooter (/src/app/dashboard/settings/departments/page.tsx): 
- Button (/src/app/dashboard/settings/departments/page.tsx): onClick={() => dispatch({ type: "SET_CREATE_OPEN", payload: false })}
- Button (/src/app/dashboard/settings/departments/page.tsx): onClick={handleSave}
- Table (/src/app/dashboard/settings/departments/page.tsx): 
- TableHeader (/src/app/dashboard/settings/departments/page.tsx): 
- TableRow (/src/app/dashboard/settings/departments/page.tsx): 
- TableHead (/src/app/dashboard/settings/departments/page.tsx): 
- TableHead (/src/app/dashboard/settings/departments/page.tsx): 
- TableHead (/src/app/dashboard/settings/departments/page.tsx): 
- TableHead (/src/app/dashboard/settings/departments/page.tsx): 
- TableBody (/src/app/dashboard/settings/departments/page.tsx): 
- TableRow (/src/app/dashboard/settings/departments/page.tsx): 
- TableCell (/src/app/dashboard/settings/departments/page.tsx): 
- TableRow (/src/app/dashboard/settings/departments/page.tsx): 
- TableCell (/src/app/dashboard/settings/departments/page.tsx): 
- Badge (/src/app/dashboard/settings/departments/page.tsx): 
- Badge (/src/app/dashboard/settings/departments/page.tsx): 
- TableCell (/src/app/dashboard/settings/departments/page.tsx): 
- Badge (/src/app/dashboard/settings/departments/page.tsx): 
- button (/src/app/dashboard/settings/departments/page.tsx): onClick={() => handleRemoveMember(memberId, dept._id)}
- Popover (/src/app/dashboard/settings/departments/page.tsx): 
- PopoverTrigger (/src/app/dashboard/settings/departments/page.tsx): 
- Button (/src/app/dashboard/settings/departments/page.tsx): 
- PopoverContent (/src/app/dashboard/settings/departments/page.tsx): 
- Button (/src/app/dashboard/settings/departments/page.tsx): onClick={(e) => {
                                                                                    // The popover trigger automatically handles state, we just dispatch the action
                                                                                    handleAssignMember(m.userId, dept._id)
                                                                                    // Clicking a portal item will close it if not intercepted
                                                                                }}
- TableCell (/src/app/dashboard/settings/departments/page.tsx): 
- Badge (/src/app/dashboard/settings/departments/page.tsx): 
- TableCell (/src/app/dashboard/settings/departments/page.tsx): 
- Button (/src/app/dashboard/settings/departments/page.tsx): onClick={() => handleEdit(dept)}
- Button (/src/app/dashboard/settings/departments/page.tsx): onClick={() => dispatch({ type: "SET_DEPT_PENDING_DELETE", payload: dept._id })}
- AlertDialog (/src/app/dashboard/settings/departments/page.tsx): 
- AlertDialogContent (/src/app/dashboard/settings/departments/page.tsx): 
- AlertDialogHeader (/src/app/dashboard/settings/departments/page.tsx): 
- AlertDialogTitle (/src/app/dashboard/settings/departments/page.tsx): 
- AlertDialogDescription (/src/app/dashboard/settings/departments/page.tsx): 
- AlertDialogFooter (/src/app/dashboard/settings/departments/page.tsx): 
- AlertDialogCancel (/src/app/dashboard/settings/departments/page.tsx): 
- AlertDialogAction (/src/app/dashboard/settings/departments/page.tsx): onClick={async () => {
                                    if (deptPendingDelete) {
                                        await handleDelete(deptPendingDelete)
                                        dispatch({ type: "SET_DEPT_PENDING_DELETE", payload: null })
                                    }
                                }}
- Input (/src/app/dashboard/settings/departments/page.tsx): placeholder="e.g. Customer Support", value={newDeptName}
- Input (/src/app/dashboard/settings/departments/page.tsx): placeholder="Handles general inquiries", value={newDesc}
- Switch (/src/app/dashboard/settings/departments/page.tsx): 
- SelectValue (/src/app/dashboard/settings/departments/page.tsx): placeholder="Choose a bot"
- Input (/src/app/dashboard/settings/departments/page.tsx): placeholder="Add tag (e.g. arabic, support)", value={tagInput}

### CONVEX WIRING
- useQuery(api.settings.listDepartments, activeProject ? { projectId: activeProject._id } : "skip") (/src/app/dashboard/settings/departments/page.tsx)
- useQuery(api.bots.list, activeProject ? { projectId: activeProject._id } : "skip") (/src/app/dashboard/settings/departments/page.tsx)
- useMutation(api.settings.createDepartment) (/src/app/dashboard/settings/departments/page.tsx)
- useMutation(api.settings.addMemberToDepartment) (/src/app/dashboard/settings/departments/page.tsx)
- useMutation(api.settings.removeMemberFromDepartment) (/src/app/dashboard/settings/departments/page.tsx)
- useMutation(api.settings.updateDepartment) (/src/app/dashboard/settings/departments/page.tsx)
- useMutation(api.settings.removeDepartment) (/src/app/dashboard/settings/departments/page.tsx)

### RED FLAGS
- Found 4 'any' type usages (/src/app/dashboard/settings/departments/page.tsx)


#### File: /src/app/dashboard/settings/groups/page.tsx
**Page Component** - Initially loads as defined in this path.

### COMPONENTS
- **SettingsGroupsPage** (/src/app/dashboard/settings/groups/page.tsx)


#### File: /src/app/dashboard/settings/integrations/page.tsx
**Page Component** - Initially loads as defined in this path.

### COMPONENTS
- **IntegrationsPage** (/src/app/dashboard/settings/integrations/page.tsx)
  - Local State: useState<IntegrationDef | null>(null)

### UI ELEMENTS
- Button (/src/app/dashboard/settings/integrations/page.tsx): onClick={() => setActiveConfig(null)}
- Button (/src/app/dashboard/settings/integrations/page.tsx): disabled={saving}, onClick={handleSave}
- Switch (/src/app/dashboard/settings/integrations/page.tsx): 
- Input (/src/app/dashboard/settings/integrations/page.tsx): type="field.type", placeholder="field.placeholder", value={formValues[field.key] || ""}

### CONVEX WIRING
- useQuery(api.integrations.list, activeProject ? { projectId: activeProject._id } : "skip") (/src/app/dashboard/settings/integrations/page.tsx)
- useMutation(api.integrations.upsert) (/src/app/dashboard/settings/integrations/page.tsx)
- useAction(api.integrations.saveChannelIntegration) (/src/app/dashboard/settings/integrations/page.tsx)
- useAction(api.integrations.registerTelegramWebhook) (/src/app/dashboard/settings/integrations/page.tsx)

### RED FLAGS
- Found 3 'any' type usages (/src/app/dashboard/settings/integrations/page.tsx)


#### File: /src/app/dashboard/settings/labels/page.tsx
**Page Component** - Initially loads as defined in this path.

### COMPONENTS
- **LabelsPage** (/src/app/dashboard/settings/labels/page.tsx)
  - Local State: useState("")

### UI ELEMENTS
- Select (/src/app/dashboard/settings/labels/page.tsx): value={newColor}
- SelectTrigger (/src/app/dashboard/settings/labels/page.tsx): 
- SelectContent (/src/app/dashboard/settings/labels/page.tsx): 
- SelectItem (/src/app/dashboard/settings/labels/page.tsx): value={c.value}
- Button (/src/app/dashboard/settings/labels/page.tsx): disabled={!newName.trim() || creating}, onClick={handleCreate}
- Table (/src/app/dashboard/settings/labels/page.tsx): 
- TableHeader (/src/app/dashboard/settings/labels/page.tsx): 
- TableRow (/src/app/dashboard/settings/labels/page.tsx): 
- TableHead (/src/app/dashboard/settings/labels/page.tsx): 
- TableHead (/src/app/dashboard/settings/labels/page.tsx): 
- TableHead (/src/app/dashboard/settings/labels/page.tsx): 
- TableHead (/src/app/dashboard/settings/labels/page.tsx): 
- TableBody (/src/app/dashboard/settings/labels/page.tsx): 
- TableRow (/src/app/dashboard/settings/labels/page.tsx): 
- TableCell (/src/app/dashboard/settings/labels/page.tsx): 
- TableRow (/src/app/dashboard/settings/labels/page.tsx): 
- TableCell (/src/app/dashboard/settings/labels/page.tsx): 
- TableCell (/src/app/dashboard/settings/labels/page.tsx): 
- TableCell (/src/app/dashboard/settings/labels/page.tsx): 
- TableCell (/src/app/dashboard/settings/labels/page.tsx): 
- Button (/src/app/dashboard/settings/labels/page.tsx): onClick={() => handleDelete(label._id)}
- SelectValue (/src/app/dashboard/settings/labels/page.tsx): 
- Input (/src/app/dashboard/settings/labels/page.tsx): placeholder="Label name (e.g., bug, feature-request, urgent)", value={newName}

### CONVEX WIRING
- useQuery(api.settings.listLabels, activeProject ? { projectId: activeProject._id } : "skip") (/src/app/dashboard/settings/labels/page.tsx)
- useMutation(api.settings.createLabel) (/src/app/dashboard/settings/labels/page.tsx)
- useMutation(api.settings.removeLabel) (/src/app/dashboard/settings/labels/page.tsx)


#### File: /src/app/dashboard/settings/operating-hours/page.tsx
**Page Component** - Initially loads as defined in this path.

### COMPONENTS
- **OperatingHoursPage** (/src/app/dashboard/settings/operating-hours/page.tsx)
  - Local State: useState(false)

### UI ELEMENTS
- Button (/src/app/dashboard/settings/operating-hours/page.tsx): disabled={saving}, onClick={handleSave}
- Select (/src/app/dashboard/settings/operating-hours/page.tsx): value={timezone}
- SelectTrigger (/src/app/dashboard/settings/operating-hours/page.tsx): 
- SelectContent (/src/app/dashboard/settings/operating-hours/page.tsx): 
- SelectItem (/src/app/dashboard/settings/operating-hours/page.tsx): value={tz}
- Select (/src/app/dashboard/settings/operating-hours/page.tsx): value={slot.start}
- SelectTrigger (/src/app/dashboard/settings/operating-hours/page.tsx): 
- SelectContent (/src/app/dashboard/settings/operating-hours/page.tsx): 
- SelectItem (/src/app/dashboard/settings/operating-hours/page.tsx): value={t}
- Select (/src/app/dashboard/settings/operating-hours/page.tsx): value={slot.end}
- SelectTrigger (/src/app/dashboard/settings/operating-hours/page.tsx): 
- SelectContent (/src/app/dashboard/settings/operating-hours/page.tsx): 
- SelectItem (/src/app/dashboard/settings/operating-hours/page.tsx): value={t}
- Button (/src/app/dashboard/settings/operating-hours/page.tsx): onClick={() => removeSlot(dayIndex, slotIndex)}
- Button (/src/app/dashboard/settings/operating-hours/page.tsx): onClick={() => addSlot(dayIndex)}
- Switch (/src/app/dashboard/settings/operating-hours/page.tsx): 
- SelectValue (/src/app/dashboard/settings/operating-hours/page.tsx): 
- Switch (/src/app/dashboard/settings/operating-hours/page.tsx): 
- SelectValue (/src/app/dashboard/settings/operating-hours/page.tsx): 
- SelectValue (/src/app/dashboard/settings/operating-hours/page.tsx): 

### CONVEX WIRING
- useQuery(api.settings.getOperatingHours, activeProject ? { projectId: activeProject._id } : "skip") (/src/app/dashboard/settings/operating-hours/page.tsx)
- useMutation(api.settings.upsertOperatingHours) (/src/app/dashboard/settings/operating-hours/page.tsx)


#### File: /src/app/dashboard/settings/webhooks/page.tsx
**Page Component** - Initially loads as defined in this path.

### COMPONENTS
- **WebhooksPage** (/src/app/dashboard/settings/webhooks/page.tsx)
  - Local State: useState("")

### UI ELEMENTS
- Button (/src/app/dashboard/settings/webhooks/page.tsx): disabled={isSubmitting || !url || selectedEvents.length === 0}, type="submit"
- Button (/src/app/dashboard/settings/webhooks/page.tsx): onClick={() => {
                                                    navigator.clipboard.writeText(newWebhookSecret);
                                                    setCopiedSecret(true);
                                                    setTimeout(() => setCopiedSecret(false), 2000);
                                                    toast.success("Secret copied to clipboard");
                                                }}
- Button (/src/app/dashboard/settings/webhooks/page.tsx): onClick={() => setNewWebhookSecret(null)}
- Table (/src/app/dashboard/settings/webhooks/page.tsx): 
- TableHeader (/src/app/dashboard/settings/webhooks/page.tsx): 
- TableRow (/src/app/dashboard/settings/webhooks/page.tsx): 
- TableHead (/src/app/dashboard/settings/webhooks/page.tsx): 
- TableHead (/src/app/dashboard/settings/webhooks/page.tsx): 
- TableHead (/src/app/dashboard/settings/webhooks/page.tsx): 
- TableHead (/src/app/dashboard/settings/webhooks/page.tsx): 
- TableBody (/src/app/dashboard/settings/webhooks/page.tsx): 
- TableRow (/src/app/dashboard/settings/webhooks/page.tsx): 
- TableCell (/src/app/dashboard/settings/webhooks/page.tsx): 
- TableRow (/src/app/dashboard/settings/webhooks/page.tsx): 
- TableCell (/src/app/dashboard/settings/webhooks/page.tsx): 
- TableRow (/src/app/dashboard/settings/webhooks/page.tsx): 
- TableCell (/src/app/dashboard/settings/webhooks/page.tsx): 
- TableCell (/src/app/dashboard/settings/webhooks/page.tsx): 
- Badge (/src/app/dashboard/settings/webhooks/page.tsx): 
- TableCell (/src/app/dashboard/settings/webhooks/page.tsx): 
- TableCell (/src/app/dashboard/settings/webhooks/page.tsx): 
- Button (/src/app/dashboard/settings/webhooks/page.tsx): onClick={() => setWebhookPendingDelete(sub._id)}
- AlertDialog (/src/app/dashboard/settings/webhooks/page.tsx): 
- AlertDialogContent (/src/app/dashboard/settings/webhooks/page.tsx): 
- AlertDialogHeader (/src/app/dashboard/settings/webhooks/page.tsx): 
- AlertDialogTitle (/src/app/dashboard/settings/webhooks/page.tsx): 
- AlertDialogDescription (/src/app/dashboard/settings/webhooks/page.tsx): 
- AlertDialogFooter (/src/app/dashboard/settings/webhooks/page.tsx): 
- AlertDialogCancel (/src/app/dashboard/settings/webhooks/page.tsx): 
- AlertDialogAction (/src/app/dashboard/settings/webhooks/page.tsx): onClick={async () => {
                                if (webhookPendingDelete) {
                                    try {
                                        await removeWebhook({ id: webhookPendingDelete });
                                        toast.success("Webhook deleted");
                                        setWebhookPendingDelete(null);
                                    } catch (error: any) {
                                        const errorMessage = error.data?.message || error.message || "Failed to delete webhook";
                                        toast.error(errorMessage);
                                    }
                                }
                            }}
- Input (/src/app/dashboard/settings/webhooks/page.tsx): type="url", placeholder="https://api.yourdomain.com/webhooks", value={url}
- Checkbox (/src/app/dashboard/settings/webhooks/page.tsx): 
- Switch (/src/app/dashboard/settings/webhooks/page.tsx): 

### CONVEX WIRING
- useQuery(api.webhooks.list, activeProject ? { projectId: activeProject._id } : "skip") (/src/app/dashboard/settings/webhooks/page.tsx)
- useMutation(api.webhooks.create) (/src/app/dashboard/settings/webhooks/page.tsx)
- useMutation(api.webhooks.update) (/src/app/dashboard/settings/webhooks/page.tsx)
- useMutation(api.webhooks.remove) (/src/app/dashboard/settings/webhooks/page.tsx)

### ERROR STATES & REAL DATA
- Loading State Handled: Loader2 (/src/app/dashboard/settings/webhooks/page.tsx)
- Loading State Handled: Loader2 (/src/app/dashboard/settings/webhooks/page.tsx)

### RED FLAGS
- Found 4 'any' type usages (/src/app/dashboard/settings/webhooks/page.tsx)


#### File: /src/app/dashboard/settings/widget/page.tsx
**Page Component** - Initially loads as defined in this path.

### COMPONENTS
- **WidgetSetupPage** (/src/app/dashboard/settings/widget/page.tsx)
  - Local State: useReducer(widgetSettingsReducer, initialState)

### UI ELEMENTS
- Tabs (/src/app/dashboard/settings/widget/page.tsx): 
- TabsList (/src/app/dashboard/settings/widget/page.tsx): 
- TabsTrigger (/src/app/dashboard/settings/widget/page.tsx): value={appearance}
- TabsTrigger (/src/app/dashboard/settings/widget/page.tsx): value={translations}
- TabsTrigger (/src/app/dashboard/settings/widget/page.tsx): value={behavior}
- TabsTrigger (/src/app/dashboard/settings/widget/page.tsx): value={installation}
- TabsContent (/src/app/dashboard/settings/widget/page.tsx): value={appearance}
- Button (/src/app/dashboard/settings/widget/page.tsx): onClick={() => applyTheme(key)}
- TabsContent (/src/app/dashboard/settings/widget/page.tsx): value={behavior}
- TabsContent (/src/app/dashboard/settings/widget/page.tsx): value={translations}
- TabsContent (/src/app/dashboard/settings/widget/page.tsx): value={installation}
- Select (/src/app/dashboard/settings/widget/page.tsx): value={selectedPlatform}
- SelectTrigger (/src/app/dashboard/settings/widget/page.tsx): 
- SelectContent (/src/app/dashboard/settings/widget/page.tsx): 
- SelectItem (/src/app/dashboard/settings/widget/page.tsx): value={p.id}
- Button (/src/app/dashboard/settings/widget/page.tsx): onClick={() => copyToClipboard(getSnippet(selectedPlatform), 'generic')}
- Button (/src/app/dashboard/settings/widget/page.tsx): disabled={loading}, onClick={handleSave}
- Button (/src/app/dashboard/settings/widget/page.tsx): onClick={() => window.open(`/test-widget?projectId=${activeProject?._id}`, '_blank')}
- Button (/src/app/dashboard/settings/widget/page.tsx): onClick={() => {
                            try {
                                const win = iframeRef.current?.contentWindow
                                if (win) {
                                    win.localStorage.removeItem("yoosr_visitor_id")
                                    dispatch({ type: "INC_IFRAME_KEY" })
                                    toast.success("Visitor session reset")
                                }
                            } catch (e) {
                                // Fallback if CORS prevents direct access (though same-origin should work)
                                localStorage.removeItem("yoosr_visitor_id")
                                dispatch({ type: "INC_IFRAME_KEY" })
                                toast.success("Visitor session reset (global)")
                            }
                        }}
- Input (/src/app/dashboard/settings/widget/page.tsx): type="color", value={primaryColor}
- Input (/src/app/dashboard/settings/widget/page.tsx): value={primaryColor}
- Input (/src/app/dashboard/settings/widget/page.tsx): placeholder="https://example.com/logo.png", value={logoUrl}
- Switch (/src/app/dashboard/settings/widget/page.tsx): 
- Switch (/src/app/dashboard/settings/widget/page.tsx): 
- Input (/src/app/dashboard/settings/widget/page.tsx): type="number", value={welcomeDelay}
- Input (/src/app/dashboard/settings/widget/page.tsx): type="number", value={autoCloseMinutes}
- Input (/src/app/dashboard/settings/widget/page.tsx): value={translations.headerTitle}
- Input (/src/app/dashboard/settings/widget/page.tsx): value={translations.welcomeMessage}
- Input (/src/app/dashboard/settings/widget/page.tsx): value={translations.preChatTitle}
- Input (/src/app/dashboard/settings/widget/page.tsx): value={translations.preChatSubtitle}
- SelectValue (/src/app/dashboard/settings/widget/page.tsx): placeholder="Select platform"

### CONVEX WIRING
- useMutation(api.projects.update) (/src/app/dashboard/settings/widget/page.tsx)

### ERROR STATES & REAL DATA
- Loading State Handled: Loader2 (/src/app/dashboard/settings/widget/page.tsx)

### RED FLAGS
- Found 1 'any' type usages (/src/app/dashboard/settings/widget/page.tsx)

## 14. Widget

#### File: /src/app/test-widget/page.tsx
**Page Component** - Initially loads as defined in this path.

### COMPONENTS
- **TestWidgetPage** (/src/app/test-widget/page.tsx)

### UI ELEMENTS
- Button (/src/app/test-widget/page.tsx): 
- Button (/src/app/test-widget/page.tsx): 
- Button (/src/app/test-widget/page.tsx): 
- Button (/src/app/test-widget/page.tsx): 


#### File: /src/app/widget/layout.tsx
**Layout Component** - Wraps routes in this directory.

### COMPONENTS
- **WidgetLayout** (/src/app/widget/layout.tsx)
  - Props: {
    children,
}: {
    children: React.ReactNode
}


#### File: /src/app/widget/page.tsx
**Page Component** - Initially loads as defined in this path.

### COMPONENTS
- **WidgetPage** (/src/app/widget/page.tsx)
  - Local State: useReducer(chatReducer, initialState)

### UI ELEMENTS
- button (/src/app/widget/page.tsx): disabled={loading || conversationStatus === 1000}, onClick={() => handleSendText(btn.label)}
- button (/src/app/widget/page.tsx): disabled={loading}, onClick={() => fileInputRef.current?.click()}
- button (/src/app/widget/page.tsx): disabled={loading || !input.trim() || conversationStatus === 1000}, onClick={handleSend}
- PreChatForm (/src/app/widget/page.tsx): 
- input (/src/app/widget/page.tsx): type="file"
- input (/src/app/widget/page.tsx): disabled={loading || conversationStatus === 1000}, type="text", placeholder="conversationStatus === 1000 ? "This conversation is resolved" : "Type a message..."", value={input}

### RED FLAGS
- Console usage: console.error("Failed to submit rating", error) (/src/app/widget/page.tsx)
- Found 5 'any' type usages (/src/app/widget/page.tsx)


#### File: /src/app/widget/rating-component.tsx
### COMPONENTS
- **RatingComponent** (/src/app/widget/rating-component.tsx)
  - Props: { onSubmit, primaryColor }: RatingComponentProps
  - Local State: useState(0)

### UI ELEMENTS
- button (/src/app/widget/rating-component.tsx): onClick={() => setRating(star)}, type="button"
- button (/src/app/widget/rating-component.tsx): disabled={loading}, onClick={handleSubmit}

### RED FLAGS
- Console usage: console.error("Failed to submit rating", error) (/src/app/widget/rating-component.tsx)


#### File: /src/app/widget/components/PreChatForm.tsx
### COMPONENTS
- **PreChatForm** (/src/app/widget/components/PreChatForm.tsx)
  - Props: { onSubmit, primaryColor, title, subtitle, contactMethod = "email" }: PreChatFormProps
  - Local State: useState("")

### UI ELEMENTS
- button (/src/app/widget/components/PreChatForm.tsx): type="submit"
- input (/src/app/widget/components/PreChatForm.tsx): type="text", placeholder="John Doe", value={name}
- input (/src/app/widget/components/PreChatForm.tsx): type="email", placeholder="john@example.com", value={email}
- input (/src/app/widget/components/PreChatForm.tsx): type="tel", placeholder="+1 (555) 000-0000", value={phone}

## 15. Channels / Integrations

#### File: /src/app/dashboard/apps/page.tsx
**Page Component** - Initially loads as defined in this path.

### COMPONENTS
- **AppsPage** (/src/app/dashboard/apps/page.tsx)

### UI ELEMENTS
- Badge (/src/app/dashboard/apps/page.tsx): 
- Badge (/src/app/dashboard/apps/page.tsx): 
- Badge (/src/app/dashboard/apps/page.tsx): 
- Button (/src/app/dashboard/apps/page.tsx): disabled={true}
- Button (/src/app/dashboard/apps/page.tsx): disabled={loading}, onClick={() => router.push(`/dashboard/apps/${app.id}`)}

### CONVEX WIRING
- useQuery(api.integrations.list, activeProject ? { projectId: activeProject._id } : "skip") (/src/app/dashboard/apps/page.tsx)

### ERROR STATES & REAL DATA
- Loading State Handled: Loader2 (/src/app/dashboard/apps/page.tsx)

### RED FLAGS
- Found 1 'any' type usages (/src/app/dashboard/apps/page.tsx)


#### File: /src/app/dashboard/apps/[provider]/page.tsx
**Page Component** - Initially loads as defined in this path.

### COMPONENTS
- **AppDetailsPage** (/src/app/dashboard/apps/[provider]/page.tsx)
  - Props: { params }: { params: Promise<{ provider: string }> }
  - Local State: useState(false)

### UI ELEMENTS
- Button (/src/app/dashboard/apps/[provider]/page.tsx): 
- Button (/src/app/dashboard/apps/[provider]/page.tsx): onClick={() => router.back()}
- Badge (/src/app/dashboard/apps/[provider]/page.tsx): 
- Button (/src/app/dashboard/apps/[provider]/page.tsx): disabled={saving}, onClick={handleUninstall}
- Button (/src/app/dashboard/apps/[provider]/page.tsx): disabled={saving}, onClick={handleSave}
- Input (/src/app/dashboard/apps/[provider]/page.tsx): type="password", placeholder="123456:ABC-DEF1234ghIwkl...", value={credentialValue}
- Input (/src/app/dashboard/apps/[provider]/page.tsx): type="password", placeholder="sk-...", value={credentialValue}

### CONVEX WIRING
- useQuery(api.integrations.list, activeProject ? { projectId: activeProject._id } : "skip") (/src/app/dashboard/apps/[provider]/page.tsx)
- useMutation(api.integrations.upsert) (/src/app/dashboard/apps/[provider]/page.tsx)
- useMutation(api.integrations.remove) (/src/app/dashboard/apps/[provider]/page.tsx)

### ERROR STATES & REAL DATA
- Loading State Handled: Loader2 (/src/app/dashboard/apps/[provider]/page.tsx)
- Loading State Handled: Loader2 (/src/app/dashboard/apps/[provider]/page.tsx)

### RED FLAGS
- Found 2 'any' type usages (/src/app/dashboard/apps/[provider]/page.tsx)

## 16. Cross-cutting Features

#### File: /convex/analytics.ts
### RED FLAGS
- Unbounded .collect(): ctx.db
            .query("conversations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect() (/convex/analytics.ts)
- Unbounded .collect(): ctx.db
            .query("conversations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect() (/convex/analytics.ts)
- Unbounded .collect(): ctx.db
            .query("messages")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect() (/convex/analytics.ts)
- Unbounded .collect(): ctx.db
            .query("conversations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect() (/convex/analytics.ts)
- Unbounded .collect(): ctx.db
            .query("unanswered_queries")
            .withIndex("by_projectId_count", (q) => q.eq("projectId", args.projectId))
            .order("desc")
            .collect() (/convex/analytics.ts)
- Unbounded .collect(): ctx.db
            .query("conversations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect() (/convex/analytics.ts)
- Unbounded .collect(): ctx.db
            .query("conversations")
            .withIndex("by_projectId", q => q.eq("projectId", args.projectId))
            .collect() (/convex/analytics.ts)
- Unbounded .collect(): ctx.db
            .query("conversations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect() (/convex/analytics.ts)


#### File: /convex/bot.ts
### RED FLAGS
- Console usage: console.warn("[BOT ENGINE] Failed to log token usage:", e.message) (/convex/bot.ts)
- Console usage: console.error("[BOT ENGINE] AI Task failed:", e.message) (/convex/bot.ts)
- Console usage: console.error("[BOT ENGINE] searchSimilarChunks failed:", e.message) (/convex/bot.ts)
- Console usage: console.error("[BOT ENGINE] KB answer generation failed:", e.message) (/convex/bot.ts)
- Console usage: console.error("Code action error:", e.message) (/convex/bot.ts)
- Console usage: console.warn("[BOT ENGINE] Failed to log token usage:", e.message) (/convex/bot.ts)
- Console usage: console.error("[BOT ENGINE] AI Assistant failed:", e.message) (/convex/bot.ts)
- Console usage: console.warn("Unknown bot action type: ", action._type) (/convex/bot.ts)
- Console usage: console.warn(`[BOT ENGINE] Step limit reached for convo ${args.conversationId}, stopping to prevent infinite loop.`) (/convex/bot.ts)
- Found 31 'any' type usages (/convex/bot.ts)


#### File: /convex/botEngine.ts
### RED FLAGS
- Found 3 'any' type usages (/convex/botEngine.ts)


#### File: /convex/botFlows.ts
### RED FLAGS
- Found 16 'any' type usages (/convex/botFlows.ts)


#### File: /convex/bots.ts
### RED FLAGS
- Unbounded .collect(): ctx.db
            .query("bots")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect() (/convex/bots.ts)
- Unbounded .collect(): ctx.db
            .query("bot_flows")
            .withIndex("by_botId", (q) => q.eq("botId", args.id))
            .collect() (/convex/bots.ts)
- Found 4 'any' type usages (/convex/bots.ts)


#### File: /convex/contacts.ts
### RED FLAGS
- Unbounded .collect(): ctx.db
            .query("contacts")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect() (/convex/contacts.ts)
- Unbounded .collect(): ctx.db
            .query("contacts")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
            .collect() (/convex/contacts.ts)
- Found 3 'any' type usages (/convex/contacts.ts)


#### File: /convex/conversations.ts
### RED FLAGS
- Unbounded .collect(): ctx.db
                .query("contacts")
                .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
                .collect() (/convex/conversations.ts)
- Unbounded .collect(): ctx.db
            .query("conversations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect() (/convex/conversations.ts)
- Unbounded .collect(): ctx.db
            .query("conversations")
            .collect() (/convex/conversations.ts)
- Unbounded .collect(): ctx.db
            .query("conversations")
            .withIndex("by_projectId", (q) => q.eq("projectId", integration.projectId))
            .collect() (/convex/conversations.ts)
- Console usage: console.error("[sendMetaMessage] Meta API error:", err) (/convex/conversations.ts)
- Console usage: console.error("[sendMetaMessage] fetch error:", err) (/convex/conversations.ts)
- Unbounded .collect(): ctx.db
            .query("conversations")
            .withIndex("by_projectId", (q) => q.eq("projectId", integration.projectId))
            .collect() (/convex/conversations.ts)
- Console usage: console.error("[sendTelegramMessage] Telegram API error:", err) (/convex/conversations.ts)
- Console usage: console.error("[sendTelegramMessage] fetch error:", err) (/convex/conversations.ts)
- Found 19 'any' type usages (/convex/conversations.ts)


#### File: /convex/dashboard.ts
### RED FLAGS
- Unbounded .collect(): ctx.db
            .query("profiles")
            .withIndex("by_orgId", q => q.eq("orgId", project.orgId))
            .collect() (/convex/dashboard.ts)


#### File: /convex/debug.ts
### RED FLAGS
- Unbounded .collect(): ctx.db.query("bot_flows").collect() (/convex/debug.ts)
- Found 3 'any' type usages (/convex/debug.ts)


#### File: /convex/dev.ts
### RED FLAGS
- Unbounded .collect(): ctx.db.query("projects").collect() (/convex/dev.ts)
- Unbounded .collect(): ctx.db.query("bots").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect() (/convex/dev.ts)
- Unbounded .collect(): ctx.db.query("bot_flows").withIndex("by_botId", (q) => q.eq("botId", bot._id)).collect() (/convex/dev.ts)
- Unbounded .collect(): ctx.db.query("knowledge_bases").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect() (/convex/dev.ts)
- Unbounded .collect(): ctx.db.query("knowledge_base_sources").withIndex("by_kbId", (q) => q.eq("kbId", kb._id)).collect() (/convex/dev.ts)
- Unbounded .collect(): ctx.db.query("messages").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect() (/convex/dev.ts)
- Unbounded .collect(): ctx.db.query("conversations").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect() (/convex/dev.ts)
- Unbounded .collect(): ctx.db.query("contacts").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect() (/convex/dev.ts)
- Unbounded .collect(): ctx.db.query("integrations").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect() (/convex/dev.ts)
- Unbounded .collect(): ctx.db.query("activity_logs").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect() (/convex/dev.ts)
- Unbounded .collect(): ctx.db.query("departments").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect() (/convex/dev.ts)
- Unbounded .collect(): ctx.db.query("canned_responses").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect() (/convex/dev.ts)
- Unbounded .collect(): ctx.db.query("labels").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect() (/convex/dev.ts)
- Unbounded .collect(): ctx.db.query("operating_hours").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect() (/convex/dev.ts)


#### File: /convex/diagnostic.ts
### RED FLAGS
- Unbounded .collect(): ctx.db.query("bot_flows").order("desc").collect() (/convex/diagnostic.ts)


#### File: /convex/http.ts
### RED FLAGS
- Console usage: console.error("Error processing Meta webhook:", error) (/convex/http.ts)
- Console usage: console.error("Error processing Telegram webhook:", error) (/convex/http.ts)
- Found 4 'any' type usages (/convex/http.ts)


#### File: /convex/integrations.ts
### RED FLAGS
- Unbounded .collect(): ctx.db
            .query("integrations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect() (/convex/integrations.ts)
- Unbounded .collect(): ctx.db
            .query("integrations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect() (/convex/integrations.ts)
- Found 4 'any' type usages (/convex/integrations.ts)


#### File: /convex/knowledge.ts
### RED FLAGS
- Console usage: console.warn("Source too large, indexing first 200 chunks only.") (/convex/knowledge.ts)
- Console usage: console.error("Missing OPENROUTER_API_KEY") (/convex/knowledge.ts)
- Console usage: console.error("Unexpected embedding format from OpenRouter", data) (/convex/knowledge.ts)
- Console usage: console.error("Failed to embed chunk batch", e.message) (/convex/knowledge.ts)
- Console usage: console.error("Failed to process URL source:", e.message) (/convex/knowledge.ts)
- Console usage: console.error("Failed to process file source:", e.message) (/convex/knowledge.ts)
- Console usage: console.error("Missing OPENROUTER_API_KEY") (/convex/knowledge.ts)
- Console usage: console.error("OpenRouter API error", error.message) (/convex/knowledge.ts)
- Console usage: console.error("OpenRouter API returned an unrecognized format", embedding) (/convex/knowledge.ts)
- Found 13 'any' type usages (/convex/knowledge.ts)


#### File: /convex/knowledgeBases.ts
### RED FLAGS
- Unbounded .collect(): ctx.db
            .query("knowledge_bases")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect() (/convex/knowledgeBases.ts)
- Unbounded .collect(): ctx.db
            .query("knowledge_base_sources")
            .withIndex("by_kbId", (q) => q.eq("kbId", args.kbId))
            .collect() (/convex/knowledgeBases.ts)


#### File: /convex/labels.ts
### RED FLAGS
- Unbounded .collect(): ctx.db
            .query("labels")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect() (/convex/labels.ts)


#### File: /convex/messages.ts
### RED FLAGS
- Found 2 'any' type usages (/convex/messages.ts)


#### File: /convex/migrations.ts
### RED FLAGS
- Unbounded .collect(): ctx.db.query("conversations").collect() (/convex/migrations.ts)


#### File: /convex/notifications.ts
### RED FLAGS
- Unbounded .collect(): ctx.db
            .query("notifications")
            .withIndex("by_recipient", (q) => q.eq("recipientId", args.recipientId))
            .order("desc")
            .collect() (/convex/notifications.ts)
- Unbounded .collect(): ctx.db
            .query("notifications")
            .withIndex("by_project_recipient", (q) =>
                q.eq("projectId", project._id).eq("recipientId", userId)
            )
            .collect() (/convex/notifications.ts)


#### File: /convex/orders.ts
### RED FLAGS
- Unbounded .collect(): ctx.db
            .query("orders")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect() (/convex/orders.ts)
- Found 4 'any' type usages (/convex/orders.ts)


#### File: /convex/profiles.ts
### RED FLAGS
- Unbounded .collect(): ctx.db.query("profiles").collect() (/convex/profiles.ts)
- Found 6 'any' type usages (/convex/profiles.ts)


#### File: /convex/projects.ts
### RED FLAGS
- Unbounded .collect(): ctx.db
            .query("projects")
            .withIndex("by_orgId", (q) => q.eq("orgId", identity.org_id!))
            .collect() (/convex/projects.ts)
- Unbounded .collect(): ctx.db.query("bots").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect() (/convex/projects.ts)
- Unbounded .collect(): ctx.db.query("bot_flows").withIndex("by_botId", (q) => q.eq("botId", bot._id)).collect() (/convex/projects.ts)
- Unbounded .collect(): ctx.db.query("knowledge_bases").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect() (/convex/projects.ts)
- Unbounded .collect(): ctx.db.query("knowledge_base_sources").withIndex("by_kbId", (q) => q.eq("kbId", kb._id)).collect() (/convex/projects.ts)
- Unbounded .collect(): ctx.db.query("messages").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect() (/convex/projects.ts)
- Unbounded .collect(): ctx.db.query("conversations").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect() (/convex/projects.ts)
- Unbounded .collect(): ctx.db.query("contacts").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect() (/convex/projects.ts)
- Unbounded .collect(): ctx.db.query("integrations").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect() (/convex/projects.ts)
- Unbounded .collect(): ctx.db.query("activity_logs").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect() (/convex/projects.ts)
- Unbounded .collect(): ctx.db.query("departments").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect() (/convex/projects.ts)
- Unbounded .collect(): ctx.db.query("canned_responses").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect() (/convex/projects.ts)
- Unbounded .collect(): ctx.db.query("labels").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect() (/convex/projects.ts)
- Unbounded .collect(): ctx.db.query("operating_hours").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect() (/convex/projects.ts)
- Unbounded .collect(): ctx.db.query("project_usage").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect() (/convex/projects.ts)
- Unbounded .collect(): ctx.db.query("unanswered_queries").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect() (/convex/projects.ts)
- Unbounded .collect(): ctx.db.query("webhook_subscriptions").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect() (/convex/projects.ts)
- Found 2 'any' type usages (/convex/projects.ts)


#### File: /convex/routing.ts
### RED FLAGS
- Unbounded .collect(): ctx.db
                .query("conversations")
                .withIndex("by_projectId_status", (q) => q.eq("projectId", args.projectId).eq("status", 200))
                .collect() (/convex/routing.ts)


#### File: /convex/settings.ts
### RED FLAGS
- Unbounded .collect(): ctx.db
            .query("departments")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect() (/convex/settings.ts)
- Unbounded .collect(): ctx.db
            .query("departments")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect() (/convex/settings.ts)
- Unbounded .collect(): ctx.db
            .query("canned_responses")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect() (/convex/settings.ts)
- Unbounded .collect(): ctx.db
            .query("labels")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect() (/convex/settings.ts)
- Unbounded .collect(): ctx.db
            .query("conversations")
            .withIndex("by_projectId", (q) => q.eq("projectId", label.projectId))
            .collect() (/convex/settings.ts)
- Found 15 'any' type usages (/convex/settings.ts)


#### File: /convex/tags.ts
### RED FLAGS
- Console usage: console.error("Failed to parse tags from LLM", result.text) (/convex/tags.ts)
- Console usage: console.error("Failed to call AI for tags extraction:", error) (/convex/tags.ts)
- Unbounded .collect(): ctx.db.query("labels")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect() (/convex/tags.ts)
- Found 2 'any' type usages (/convex/tags.ts)


#### File: /convex/webhooks.ts
### RED FLAGS
- Console usage: console.error(`Webhook ${sub.url} failed with status ${response.status}`) (/convex/webhooks.ts)
- Console usage: console.error(`Error firing webhook to ${sub.url}:`, error) (/convex/webhooks.ts)
- Unbounded .collect(): ctx.db
            .query("webhook_subscriptions")
            .withIndex("by_projectId_isActive", q =>
                q.eq("projectId", args.projectId).eq("isActive", true)
            )
            .collect() (/convex/webhooks.ts)
- Unbounded .collect(): ctx.db
            .query("webhook_subscriptions")
            .withIndex("by_projectId", q => q.eq("projectId", args.projectId))
            .collect() (/convex/webhooks.ts)
- Unbounded .collect(): ctx.db.query("webhook_subscriptions").collect() (/convex/webhooks.ts)
- Found 6 'any' type usages (/convex/webhooks.ts)


#### File: /convex/_generated/api.d.ts
### RED FLAGS
- Found 2 'any' type usages (/convex/_generated/api.d.ts)


#### File: /convex/lib/crypto.ts
### RED FLAGS
- Found 4 'any' type usages (/convex/lib/crypto.ts)


#### File: /src/components/ConvexClientProvider.tsx
### COMPONENTS
- **ConvexClientProvider** (/src/components/ConvexClientProvider.tsx)
  - Props: { children }: { children: ReactNode }


#### File: /src/components/providers.tsx
### COMPONENTS
- **Providers** (/src/components/providers.tsx)
  - Props: { children }: { children: React.ReactNode }


#### File: /src/context/ProjectContext.tsx
### COMPONENTS
- **ProjectProvider** (/src/context/ProjectContext.tsx)
  - Props: { children }: { children: React.ReactNode }

### CONVEX WIRING
- useQuery(api.projects.list) (/src/context/ProjectContext.tsx)
- useMutation(api.projects.create) (/src/context/ProjectContext.tsx)

### RED FLAGS
- Console usage: console.error("Error creating project:", error) (/src/context/ProjectContext.tsx)
- Found 1 'any' type usages (/src/context/ProjectContext.tsx)


#### File: /src/lib/notifications.ts
### RED FLAGS
- Console usage: console.warn("Sound playback was prevented. This is normal if the user hasn't interacted with the page yet.", err) (/src/lib/notifications.ts)
- Console usage: console.error("Audio error:", error) (/src/lib/notifications.ts)
- Console usage: console.warn("This browser does not support desktop notification") (/src/lib/notifications.ts)


#### File: /src/components/activities/ActivitiesDataTable.tsx
### COMPONENTS
- **ActivitiesDataTable** (/src/components/activities/ActivitiesDataTable.tsx)
  - Props: {
    columns,
    data,
    loadMore,
    status,
}: DataTableProps<TData, TValue>

### UI ELEMENTS
- Table (/src/components/activities/ActivitiesDataTable.tsx): 
- TableHeader (/src/components/activities/ActivitiesDataTable.tsx): 
- TableRow (/src/components/activities/ActivitiesDataTable.tsx): 
- TableHead (/src/components/activities/ActivitiesDataTable.tsx): 
- TableBody (/src/components/activities/ActivitiesDataTable.tsx): 
- TableRow (/src/components/activities/ActivitiesDataTable.tsx): 
- TableCell (/src/components/activities/ActivitiesDataTable.tsx): 
- TableRow (/src/components/activities/ActivitiesDataTable.tsx): 
- TableCell (/src/components/activities/ActivitiesDataTable.tsx): 
- Button (/src/components/activities/ActivitiesDataTable.tsx): disabled={!table.getCanPreviousPage()}, onClick={() => table.previousPage()}
- Button (/src/components/activities/ActivitiesDataTable.tsx): disabled={!table.getCanNextPage() &&
                        (status === "Exhausted" || status === "LoadingMore" || !loadMore)}, onClick={handleNextPage}


#### File: /src/components/activities/columns.tsx
### UI ELEMENTS
- Badge (/src/components/activities/columns.tsx): 


#### File: /src/components/analytics/AnalyticsCSAT.tsx
### COMPONENTS
- **AnalyticsCSAT** (/src/components/analytics/AnalyticsCSAT.tsx)
  - Props: { data, isLoading }: Props

### ERROR STATES & REAL DATA
- Loading State Handled: Loader2 (/src/components/analytics/AnalyticsCSAT.tsx)


#### File: /src/components/analytics/AnalyticsTagsChart.tsx
### COMPONENTS
- **AnalyticsTagsChart** (/src/components/analytics/AnalyticsTagsChart.tsx)
  - Props: { data, isLoading }: Props

### ERROR STATES & REAL DATA
- Loading State Handled: Loader2 (/src/components/analytics/AnalyticsTagsChart.tsx)


#### File: /src/components/analytics/AnalyticsUnansweredQueries.tsx
### COMPONENTS
- **AnalyticsUnansweredQueries** (/src/components/analytics/AnalyticsUnansweredQueries.tsx)
  - Props: { data, isLoading }: Props
  - Local State: useState<UnansweredQuery | null>(null)

### UI ELEMENTS
- Table (/src/components/analytics/AnalyticsUnansweredQueries.tsx): 
- TableHeader (/src/components/analytics/AnalyticsUnansweredQueries.tsx): 
- TableRow (/src/components/analytics/AnalyticsUnansweredQueries.tsx): 
- TableHead (/src/components/analytics/AnalyticsUnansweredQueries.tsx): 
- TableHead (/src/components/analytics/AnalyticsUnansweredQueries.tsx): 
- TableHead (/src/components/analytics/AnalyticsUnansweredQueries.tsx): 
- TableHead (/src/components/analytics/AnalyticsUnansweredQueries.tsx): 
- TableBody (/src/components/analytics/AnalyticsUnansweredQueries.tsx): 
- TableRow (/src/components/analytics/AnalyticsUnansweredQueries.tsx): 
- TableCell (/src/components/analytics/AnalyticsUnansweredQueries.tsx): 
- TableCell (/src/components/analytics/AnalyticsUnansweredQueries.tsx): 
- Badge (/src/components/analytics/AnalyticsUnansweredQueries.tsx): 
- TableCell (/src/components/analytics/AnalyticsUnansweredQueries.tsx): 
- TableCell (/src/components/analytics/AnalyticsUnansweredQueries.tsx): 
- Button (/src/components/analytics/AnalyticsUnansweredQueries.tsx): onClick={() => handleOpenDialog(row)}
- Dialog (/src/components/analytics/AnalyticsUnansweredQueries.tsx): 
- DialogContent (/src/components/analytics/AnalyticsUnansweredQueries.tsx): 
- DialogHeader (/src/components/analytics/AnalyticsUnansweredQueries.tsx): 
- DialogTitle (/src/components/analytics/AnalyticsUnansweredQueries.tsx): 
- DialogDescription (/src/components/analytics/AnalyticsUnansweredQueries.tsx): 
- Select (/src/components/analytics/AnalyticsUnansweredQueries.tsx): disabled={!kbs || kbs.length === 0}, value={selectedKbId}
- SelectTrigger (/src/components/analytics/AnalyticsUnansweredQueries.tsx): 
- SelectContent (/src/components/analytics/AnalyticsUnansweredQueries.tsx): 
- SelectItem (/src/components/analytics/AnalyticsUnansweredQueries.tsx): value={kb._id}
- DialogFooter (/src/components/analytics/AnalyticsUnansweredQueries.tsx): 
- Button (/src/components/analytics/AnalyticsUnansweredQueries.tsx): disabled={isSaving}, onClick={() => setSelectedQuery(null)}
- Button (/src/components/analytics/AnalyticsUnansweredQueries.tsx): disabled={isSaving || !answer.trim() || !selectedKbId}, onClick={handleSaveToKB}
- Input (/src/components/analytics/AnalyticsUnansweredQueries.tsx): value={selectedQuery?.query || ""}
- SelectValue (/src/components/analytics/AnalyticsUnansweredQueries.tsx): placeholder="Select a knowledge base"

### CONVEX WIRING
- useMutation(api.knowledgeBases.addSource) (/src/components/analytics/AnalyticsUnansweredQueries.tsx)
- useMutation(api.analytics.dismissUnansweredQuery) (/src/components/analytics/AnalyticsUnansweredQueries.tsx)
- useQuery(api.knowledgeBases.list, activeProject ? { projectId: activeProject._id } : "skip") (/src/components/analytics/AnalyticsUnansweredQueries.tsx)

### ERROR STATES & REAL DATA
- Loading State Handled: Loader2 (/src/components/analytics/AnalyticsUnansweredQueries.tsx)
- Loading State Handled: Loader2 (/src/components/analytics/AnalyticsUnansweredQueries.tsx)

### RED FLAGS
- Console usage: console.error("Failed to add to KB:", error) (/src/components/analytics/AnalyticsUnansweredQueries.tsx)


#### File: /src/components/analytics/AnalyticsUsageQuotas.tsx
### COMPONENTS
- **AnalyticsUsageQuotas** (/src/components/analytics/AnalyticsUsageQuotas.tsx)
  - Props: { data, isLoading, maxTokens = 500000, maxConversations = 1000 }: Props

### ERROR STATES & REAL DATA
- Loading State Handled: Loader2 (/src/components/analytics/AnalyticsUsageQuotas.tsx)


#### File: /src/components/analytics/ConversationVolumeChart.tsx
### COMPONENTS
- **ConversationVolumeChart** (/src/components/analytics/ConversationVolumeChart.tsx)
  - Props: { data, isLoading }: Props

### ERROR STATES & REAL DATA
- Loading State Handled: Loader2 (/src/components/analytics/ConversationVolumeChart.tsx)


#### File: /src/components/chat/ChatArea.tsx
### COMPONENTS
- **ChatAreaContent** (/src/components/chat/ChatArea.tsx)
  - Props: { conversationId: propConversationId, onBack, onOpenContact }: ChatAreaProps
- **ChatArea** (/src/components/chat/ChatArea.tsx)
  - Props: props: ChatAreaProps
  - Local State: useState("")

### UI ELEMENTS
- Button (/src/components/chat/ChatArea.tsx): onClick={onBack}
- Button (/src/components/chat/ChatArea.tsx): onClick={onOpenContact}
- Badge (/src/components/chat/ChatArea.tsx): 
- Button (/src/components/chat/ChatArea.tsx): onClick={handleResolve}
- Button (/src/components/chat/ChatArea.tsx): 
- Dialog (/src/components/chat/ChatArea.tsx): 
- DialogContent (/src/components/chat/ChatArea.tsx): 
- DialogHeader (/src/components/chat/ChatArea.tsx): 
- DialogTitle (/src/components/chat/ChatArea.tsx): 
- Dialog (/src/components/chat/ChatArea.tsx): 
- DialogContent (/src/components/chat/ChatArea.tsx): 
- DialogHeader (/src/components/chat/ChatArea.tsx): 
- DialogTitle (/src/components/chat/ChatArea.tsx): 
- button (/src/components/chat/ChatArea.tsx): onClick={() => loadMore(30)}
- Tabs (/src/components/chat/ChatArea.tsx): value={messageMode}
- TabsList (/src/components/chat/ChatArea.tsx): 
- TabsTrigger (/src/components/chat/ChatArea.tsx): value={public}
- TabsTrigger (/src/components/chat/ChatArea.tsx): value={internal}
- Button (/src/components/chat/ChatArea.tsx): disabled={isResolved}
- Button (/src/components/chat/ChatArea.tsx): disabled={isResolved}, onClick={() => fileInputRef.current?.click()}
- Button (/src/components/chat/ChatArea.tsx): disabled={isSending || !inputValue.trim() || isResolved}, onClick={handleSendMessage}
- Input (/src/components/chat/ChatArea.tsx): placeholder="Search agents...", value={agentSearch}
- Input (/src/components/chat/ChatArea.tsx): placeholder="Search departments...", value={departmentSearch}
- input (/src/components/chat/ChatArea.tsx): type="file"

### CONVEX WIRING
- useQuery(api.conversations.get, conversationId ? { id: conversationId } : "skip") (/src/components/chat/ChatArea.tsx)
- useQuery(api.settings.listDepartments, conversation?.projectId ? { projectId: conversation.projectId } : "skip") (/src/components/chat/ChatArea.tsx)
- useQuery(api.settings.listCannedResponses, conversation?.projectId ? { projectId: conversation.projectId } : "skip") (/src/components/chat/ChatArea.tsx)
- useMutation(api.messages.sendMessage) (/src/components/chat/ChatArea.tsx)
- useMutation(api.conversations.relayToMeta) (/src/components/chat/ChatArea.tsx)
- useMutation(api.conversations.relayToTelegram) (/src/components/chat/ChatArea.tsx)
- useMutation(api.conversations.resolve) (/src/components/chat/ChatArea.tsx)
- useMutation(api.conversations.markAsRead) (/src/components/chat/ChatArea.tsx)
- useMutation(api.conversations.update) (/src/components/chat/ChatArea.tsx)
- useMutation(api.conversations.transferToDepartment) (/src/components/chat/ChatArea.tsx)
- useMutation(api.messages.send) (/src/components/chat/ChatArea.tsx)

### ERROR STATES & REAL DATA
- Loading State Handled: Loader2 (/src/components/chat/ChatArea.tsx)
- Loading State Handled: Loader2 (/src/components/chat/ChatArea.tsx)

### RED FLAGS
- Console usage: console.error("Failed to relay to Meta:", metaErr) (/src/components/chat/ChatArea.tsx)
- Console usage: console.error("Failed to relay to Telegram:", telegramErr) (/src/components/chat/ChatArea.tsx)
- Console usage: console.error("Error sending message:", error) (/src/components/chat/ChatArea.tsx)
- Console usage: console.error("Error resolving conversation:", error) (/src/components/chat/ChatArea.tsx)
- Console usage: console.error("Failed to assign:", error) (/src/components/chat/ChatArea.tsx)
- Console usage: console.error("Failed to transfer conversation:", error) (/src/components/chat/ChatArea.tsx)
- Console usage: console.error("Failed to transfer to department:", error) (/src/components/chat/ChatArea.tsx)
- Console usage: console.error("Error sending attachment:", error) (/src/components/chat/ChatArea.tsx)
- Found 1 'any' type usages (/src/components/chat/ChatArea.tsx)


#### File: /src/components/chat/ConversationList.tsx
### COMPONENTS
- **ConversationListContent** (/src/components/chat/ConversationList.tsx)
  - Props: { onSelectConversation }: { onSelectConversation?: (id: string) => void }
- **ConversationList** (/src/components/chat/ConversationList.tsx)
  - Props: { onSelectConversation }: { onSelectConversation?: (id: string) => void }
  - Local State: useState<ChatTab>("all")

### UI ELEMENTS
- Badge (/src/components/chat/ConversationList.tsx): onClick={() => setActiveTab(tab.key)}
- Badge (/src/components/chat/ConversationList.tsx): 
- Search (/src/components/chat/ConversationList.tsx): 
- Input (/src/components/chat/ConversationList.tsx): placeholder="Search...", value={searchQuery}

### CONVEX WIRING
- useQuery(api.conversations.list, activeProject ? { projectId: activeProject._id } : "skip") (/src/components/chat/ConversationList.tsx)
- useMutation(api.conversations.create) (/src/components/chat/ConversationList.tsx)

### RED FLAGS
- Console usage: console.error("Error creating new chat:", error) (/src/components/chat/ConversationList.tsx)
- Found 2 'any' type usages (/src/components/chat/ConversationList.tsx)


#### File: /src/components/dashboard/AppSidebar.tsx
### COMPONENTS
- **OrgSwitcher** (/src/components/dashboard/AppSidebar.tsx)
- **NavUser** (/src/components/dashboard/AppSidebar.tsx)
- **AppSidebar** (/src/components/dashboard/AppSidebar.tsx)
  - Props: { ...props }: React.ComponentProps<typeof Sidebar>

### UI ELEMENTS
- SidebarMenuButton (/src/components/dashboard/AppSidebar.tsx): 
- SidebarMenuButton (/src/components/dashboard/AppSidebar.tsx): 
- SidebarMenuButton (/src/components/dashboard/AppSidebar.tsx): 
- OrganizationSwitcher (/src/components/dashboard/AppSidebar.tsx): 
- OrgSwitcher (/src/components/dashboard/AppSidebar.tsx): 


#### File: /src/components/dashboard/NotificationBell.tsx
### COMPONENTS
- **NotificationBell** (/src/components/dashboard/NotificationBell.tsx)
  - Local State: useState(false)

### UI ELEMENTS
- Popover (/src/components/dashboard/NotificationBell.tsx): 
- PopoverTrigger (/src/components/dashboard/NotificationBell.tsx): 
- Button (/src/components/dashboard/NotificationBell.tsx): 
- PopoverContent (/src/components/dashboard/NotificationBell.tsx): 
- Button (/src/components/dashboard/NotificationBell.tsx): onClick={handleMarkAllRead}
- Button (/src/components/dashboard/NotificationBell.tsx): onClick={handleClearAll}
- button (/src/components/dashboard/NotificationBell.tsx): onClick={() => handleNotificationClick(notif._id, notif.conversationId)}

### CONVEX WIRING
- useQuery(api.notifications.unreadCount) (/src/components/dashboard/NotificationBell.tsx)
- useQuery(api.notifications.listForCurrentUser) (/src/components/dashboard/NotificationBell.tsx)
- useMutation(api.notifications.markAsRead) (/src/components/dashboard/NotificationBell.tsx)
- useMutation(api.notifications.markAllRead) (/src/components/dashboard/NotificationBell.tsx)
- useMutation(api.notifications.clearAll) (/src/components/dashboard/NotificationBell.tsx)

### RED FLAGS
- Console usage: console.error("Failed to mark as read:", e) (/src/components/dashboard/NotificationBell.tsx)
- Console usage: console.error("Failed to mark all as read:", e) (/src/components/dashboard/NotificationBell.tsx)
- Console usage: console.error("Failed to clear notifications:", e) (/src/components/dashboard/NotificationBell.tsx)
- Found 1 'any' type usages (/src/components/dashboard/NotificationBell.tsx)


#### File: /src/components/dashboard/SiteHeader.tsx
### COMPONENTS
- **SiteHeader** (/src/components/dashboard/SiteHeader.tsx)

### UI ELEMENTS
- Switch (/src/components/dashboard/SiteHeader.tsx): disabled={profile === undefined}

### CONVEX WIRING
- useQuery(api.profiles.getMe) (/src/components/dashboard/SiteHeader.tsx)
- useMutation(api.profiles.setAvailability) (/src/components/dashboard/SiteHeader.tsx)

### RED FLAGS
- Console usage: console.error("Failed to update availability:", error) (/src/components/dashboard/SiteHeader.tsx)


#### File: /src/components/design-studio/AIPromptBar.tsx
### COMPONENTS
- **AIPromptBar** (/src/components/design-studio/AIPromptBar.tsx)
  - Props: { onGenerate, visible = true }: AIPromptBarProps
  - Local State: useState("")

### UI ELEMENTS
- Popover (/src/components/design-studio/AIPromptBar.tsx): 
- PopoverTrigger (/src/components/design-studio/AIPromptBar.tsx): 
- Button (/src/components/design-studio/AIPromptBar.tsx): 
- PopoverContent (/src/components/design-studio/AIPromptBar.tsx): 
- button (/src/components/design-studio/AIPromptBar.tsx): onClick={() => {
                                        setPrompt(ex.prompt);
                                        setExamplesOpen(false);
                                    }}, type="button"
- Button (/src/components/design-studio/AIPromptBar.tsx): disabled={!prompt.trim() || isGenerating}, onClick={handleGenerate}
- input (/src/components/design-studio/AIPromptBar.tsx): disabled={isGenerating}, type="text", placeholder="Describe a flow to generate… Each submission replaces the canvas", value={prompt}

### CONVEX WIRING
- useAction(api.aiFlowBuilder.generateFlow) (/src/components/design-studio/AIPromptBar.tsx)

### ERROR STATES & REAL DATA
- Loading State Handled: Loader2 (/src/components/design-studio/AIPromptBar.tsx)


#### File: /src/components/design-studio/BlockPalette.tsx
### COMPONENTS
- **BlockPalette** (/src/components/design-studio/BlockPalette.tsx)
  - Props: { onAddNode }: BlockPaletteProps

### UI ELEMENTS
- button (/src/components/design-studio/BlockPalette.tsx): onClick={() =>
                                onAddNode(block.type, { ...block.defaultData })}


#### File: /src/components/design-studio/DebuggerPanel.tsx
### COMPONENTS
- **DebuggerPanel** (/src/components/design-studio/DebuggerPanel.tsx)
  - Props: { projectId, botId, onActiveNodeChange, onClose }: DebuggerPanelProps

### UI ELEMENTS
- Button (/src/components/design-studio/DebuggerPanel.tsx): onClick={onClose}

### CONVEX WIRING
- useQuery(api.conversations.list, projectId ? { projectId: projectId as Id<"projects"> } : "skip") (/src/components/design-studio/DebuggerPanel.tsx)
- useQuery(api.conversations.getBotState, activeConv ? { conversationId: activeConv._id } : "skip") (/src/components/design-studio/DebuggerPanel.tsx)

### ERROR STATES & REAL DATA
- Loading State Handled: Loader2 (/src/components/design-studio/DebuggerPanel.tsx)

### RED FLAGS
- Found 2 'any' type usages (/src/components/design-studio/DebuggerPanel.tsx)


#### File: /src/components/design-studio/FlowEditor.tsx
### COMPONENTS
- **FlowEditor** (/src/components/design-studio/FlowEditor.tsx)
  - Props: {
    initialNodes,
    initialEdges,
    activeNodeId,
    onFlowChange,
}: FlowEditorProps
  - Local State: useState<Node | null>(null)

### RED FLAGS
- Found 3 'any' type usages (/src/components/design-studio/FlowEditor.tsx)


#### File: /src/components/design-studio/FlowToolbar.tsx
### COMPONENTS
- **FlowToolbarContent** (/src/components/design-studio/FlowToolbar.tsx)
  - Props: { botName, saveState, onSave, isDebuggerOpen, onToggleDebugger, isAIBarOpen, onToggleAIBar }: FlowToolbarProps
- **FlowToolbar** (/src/components/design-studio/FlowToolbar.tsx)
  - Props: props: FlowToolbarProps

### UI ELEMENTS
- Button (/src/components/design-studio/FlowToolbar.tsx): onClick={() =>
                        router.push(
                            `/dashboard/bots${projectId ? `?project=${projectId}` : ""}`
                        )}
- Button (/src/components/design-studio/FlowToolbar.tsx): disabled={saveState === "saving"}, onClick={onSave}
- Button (/src/components/design-studio/FlowToolbar.tsx): onClick={onToggleAIBar}
- Button (/src/components/design-studio/FlowToolbar.tsx): onClick={onToggleDebugger}

### ERROR STATES & REAL DATA
- Loading State Handled: Loader2 (/src/components/design-studio/FlowToolbar.tsx)
- Loading State Handled: Loader2 (/src/components/design-studio/FlowToolbar.tsx)


#### File: /src/components/design-studio/NodePropertiesPanel.tsx
### COMPONENTS
- **NodePropertiesPanelContent** (/src/components/design-studio/NodePropertiesPanel.tsx)
  - Props: {
    node,
    onUpdateNode,
    onClose,
    onDeleteNode,
}: NodePropertiesPanelProps
- **NodePropertiesPanel** (/src/components/design-studio/NodePropertiesPanel.tsx)
  - Props: props: NodePropertiesPanelProps

### UI ELEMENTS
- Button (/src/components/design-studio/NodePropertiesPanel.tsx): onClick={onClose}
- Button (/src/components/design-studio/NodePropertiesPanel.tsx): onClick={() => {
                                    const textVariations = [...(data.textVariations || (data.text ? [data.text] : [""]))];
                                    if (!data.textVariations && !data.text) textVariations[0] = "";
                                    textVariations.push("");
                                    update("textVariations", textVariations);
                                }}
- Button (/src/components/design-studio/NodePropertiesPanel.tsx): onClick={() => {
                                            const textVariations = [...(data.textVariations || [data.text])];
                                            textVariations.splice(i, 1);
                                            update("textVariations", textVariations);
                                            if (i === 0 && textVariations.length > 0) update("text", textVariations[0]);
                                        }}
- Button (/src/components/design-studio/NodePropertiesPanel.tsx): onClick={() => {
                                        const buttons = [...(data.buttons || [])];
                                        buttons.push({
                                            label: "",
                                            value: "",
                                            type: "text",
                                        });
                                        update("buttons", buttons);
                                    }}
- Button (/src/components/design-studio/NodePropertiesPanel.tsx): onClick={() => {
                                            const buttons = data.buttons.filter(
                                                (_: any, j: number) => j !== i
                                            );
                                            update("buttons", buttons);
                                        }}
- Select (/src/components/design-studio/NodePropertiesPanel.tsx): value={data.operator || "equals"}
- SelectTrigger (/src/components/design-studio/NodePropertiesPanel.tsx): 
- SelectContent (/src/components/design-studio/NodePropertiesPanel.tsx): 
- SelectItem (/src/components/design-studio/NodePropertiesPanel.tsx): value={equals}
- SelectItem (/src/components/design-studio/NodePropertiesPanel.tsx): value={notEquals}
- SelectItem (/src/components/design-studio/NodePropertiesPanel.tsx): value={contains}
- SelectItem (/src/components/design-studio/NodePropertiesPanel.tsx): value={greaterThan}
- SelectItem (/src/components/design-studio/NodePropertiesPanel.tsx): value={lessThan}
- Select (/src/components/design-studio/NodePropertiesPanel.tsx): value={data.method || "GET"}
- SelectTrigger (/src/components/design-studio/NodePropertiesPanel.tsx): 
- SelectContent (/src/components/design-studio/NodePropertiesPanel.tsx): 
- SelectItem (/src/components/design-studio/NodePropertiesPanel.tsx): value={GET}
- SelectItem (/src/components/design-studio/NodePropertiesPanel.tsx): value={POST}
- SelectItem (/src/components/design-studio/NodePropertiesPanel.tsx): value={PUT}
- SelectItem (/src/components/design-studio/NodePropertiesPanel.tsx): value={DELETE}
- Button (/src/components/design-studio/NodePropertiesPanel.tsx): 
- Select (/src/components/design-studio/NodePropertiesPanel.tsx): value={data.labelName || ""}
- SelectTrigger (/src/components/design-studio/NodePropertiesPanel.tsx): 
- SelectContent (/src/components/design-studio/NodePropertiesPanel.tsx): 
- SelectItem (/src/components/design-studio/NodePropertiesPanel.tsx): disabled={true}, value={none}
- SelectItem (/src/components/design-studio/NodePropertiesPanel.tsx): value={lbl.name}
- Select (/src/components/design-studio/NodePropertiesPanel.tsx): value={data.departmentId || ""}
- SelectTrigger (/src/components/design-studio/NodePropertiesPanel.tsx): 
- SelectContent (/src/components/design-studio/NodePropertiesPanel.tsx): 
- SelectItem (/src/components/design-studio/NodePropertiesPanel.tsx): disabled={true}, value={none}
- SelectItem (/src/components/design-studio/NodePropertiesPanel.tsx): value={dept._id}
- Select (/src/components/design-studio/NodePropertiesPanel.tsx): value={data.priority || "normal"}
- SelectTrigger (/src/components/design-studio/NodePropertiesPanel.tsx): 
- SelectContent (/src/components/design-studio/NodePropertiesPanel.tsx): 
- SelectItem (/src/components/design-studio/NodePropertiesPanel.tsx): value={low}
- SelectItem (/src/components/design-studio/NodePropertiesPanel.tsx): value={normal}
- SelectItem (/src/components/design-studio/NodePropertiesPanel.tsx): value={high}
- SelectItem (/src/components/design-studio/NodePropertiesPanel.tsx): value={urgent}
- Button (/src/components/design-studio/NodePropertiesPanel.tsx): onClick={() => onDeleteNode(node.id)}
- Input (/src/components/design-studio/NodePropertiesPanel.tsx): placeholder="Block name", value={data.label || ""}
- Input (/src/components/design-studio/NodePropertiesPanel.tsx): placeholder="Button label", value={btn.label}
- Input (/src/components/design-studio/NodePropertiesPanel.tsx): placeholder="e.g., user_email", value={data.attributeKey || ""}
- Input (/src/components/design-studio/NodePropertiesPanel.tsx): placeholder="e.g., {{email}} or a static value", value={data.attributeValue || ""}
- Input (/src/components/design-studio/NodePropertiesPanel.tsx): placeholder="e.g., lead_score", value={data.attributeKey || ""}
- SelectValue (/src/components/design-studio/NodePropertiesPanel.tsx): 
- Input (/src/components/design-studio/NodePropertiesPanel.tsx): placeholder="Value to compare against", value={data.compareValue || ""}
- SelectValue (/src/components/design-studio/NodePropertiesPanel.tsx): 
- Input (/src/components/design-studio/NodePropertiesPanel.tsx): placeholder="https://api.example.com/endpoint", value={data.url || ""}
- Input (/src/components/design-studio/NodePropertiesPanel.tsx): placeholder="e.g., api_response", value={data.responseVariable || ""}
- Input (/src/components/design-studio/NodePropertiesPanel.tsx): placeholder="{{lastUserText}}", value={data.userInput || ""}
- Input (/src/components/design-studio/NodePropertiesPanel.tsx): placeholder="fallbackModel", value={data.model || ""}
- Input (/src/components/design-studio/NodePropertiesPanel.tsx): placeholder="e.g., gpt_reply", value={data.outputVariable || ""}
- Input (/src/components/design-studio/NodePropertiesPanel.tsx): placeholder="fallbackModel", value={data.model || ""}
- Input (/src/components/design-studio/NodePropertiesPanel.tsx): type="number", value={data.maxTurns || 3}
- Input (/src/components/design-studio/NodePropertiesPanel.tsx): placeholder="e.g., assistant_reply", value={data.assignTo || ""}
- Input (/src/components/design-studio/NodePropertiesPanel.tsx): type="number", value={data.delaySeconds || 1}
- Input (/src/components/design-studio/NodePropertiesPanel.tsx): placeholder="e.g. {{user_message}}", value={data.query || ""}
- Input (/src/components/design-studio/NodePropertiesPanel.tsx): placeholder="e.g. kb_reply", value={data.assignTo || ""}
- SelectValue (/src/components/design-studio/NodePropertiesPanel.tsx): placeholder="Select a label"
- Input (/src/components/design-studio/NodePropertiesPanel.tsx): placeholder="e.g. email_address", value={data.attribute || ""}
- Input (/src/components/design-studio/NodePropertiesPanel.tsx): placeholder="e.g. tech_support_bot", value={data.slug || ""}
- SelectValue (/src/components/design-studio/NodePropertiesPanel.tsx): placeholder="Select a department"
- Input (/src/components/design-studio/NodePropertiesPanel.tsx): placeholder="e.g. code_result", value={data.assignTo || ""}
- SelectValue (/src/components/design-studio/NodePropertiesPanel.tsx): placeholder="Select priority"

### CONVEX WIRING
- useQuery(api.settings.listDepartments, projectId ? { projectId } : "skip") (/src/components/design-studio/NodePropertiesPanel.tsx)
- useQuery(api.settings.listLabels, projectId ? { projectId } : "skip") (/src/components/design-studio/NodePropertiesPanel.tsx)

### RED FLAGS
- Found 5 'any' type usages (/src/components/design-studio/NodePropertiesPanel.tsx)


#### File: /src/components/landing/AnalyticsSection.tsx
### COMPONENTS
- **AnalyticsSection** (/src/components/landing/AnalyticsSection.tsx)


#### File: /src/components/landing/ChannelsSection.tsx
### COMPONENTS
- **ChannelsSection** (/src/components/landing/ChannelsSection.tsx)


#### File: /src/components/landing/CtaSection.tsx
### COMPONENTS
- **CtaSection** (/src/components/landing/CtaSection.tsx)

### UI ELEMENTS
- Button (/src/components/landing/CtaSection.tsx): 
- Button (/src/components/landing/CtaSection.tsx): 


#### File: /src/components/landing/DesignStudioSection.tsx
### COMPONENTS
- **DesignStudioSection** (/src/components/landing/DesignStudioSection.tsx)


#### File: /src/components/landing/FeaturesGrid.tsx
### COMPONENTS
- **FeaturesGrid** (/src/components/landing/FeaturesGrid.tsx)


#### File: /src/components/landing/Hero.tsx
### COMPONENTS
- **Hero** (/src/components/landing/Hero.tsx)

### UI ELEMENTS
- Button (/src/components/landing/Hero.tsx): 
- Button (/src/components/landing/Hero.tsx): 


#### File: /src/components/landing/HowItWorks.tsx
### COMPONENTS
- **HowItWorks** (/src/components/landing/HowItWorks.tsx)


#### File: /src/components/landing/OrdersSection.tsx
### COMPONENTS
- **OrdersSection** (/src/components/landing/OrdersSection.tsx)


#### File: /src/components/landing/ScrollReveal.tsx
### COMPONENTS
- **ScrollReveal** (/src/components/landing/ScrollReveal.tsx)
  - Props: {
  children,
  delay = 0,
  className = "",
}: ScrollRevealProps


#### File: /src/components/landing/Testimonials.tsx
### COMPONENTS
- **Testimonials** (/src/components/landing/Testimonials.tsx)


#### File: /src/components/layout/Footer.tsx
### COMPONENTS
- **Footer** (/src/components/layout/Footer.tsx)
- **SocialLink** (/src/components/layout/Footer.tsx)
  - Props: { href, icon: Icon, label }: any
- **FooterLink** (/src/components/layout/Footer.tsx)
  - Props: { href, children }: any

### UI ELEMENTS
- Button (/src/components/layout/Footer.tsx): 
- Input (/src/components/layout/Footer.tsx): placeholder="Enter your email"

### RED FLAGS
- Found 2 'any' type usages (/src/components/layout/Footer.tsx)


#### File: /src/components/layout/Header.tsx
### COMPONENTS
- **Header** (/src/components/layout/Header.tsx)
- **BasicNav** (/src/components/layout/Header.tsx)
- **ListItem** (/src/components/layout/Header.tsx)

### RED FLAGS
- Found 1 'any' type usages (/src/components/layout/Header.tsx)


#### File: /src/components/layout/MobileNav.tsx
### COMPONENTS
- **MobileNav** (/src/components/layout/MobileNav.tsx)

### UI ELEMENTS
- Button (/src/components/layout/MobileNav.tsx): 
- Button (/src/components/layout/MobileNav.tsx): 
- Button (/src/components/layout/MobileNav.tsx): 


#### File: /src/components/layout/NavbarCTA.tsx
### COMPONENTS
- **NavbarCTA** (/src/components/layout/NavbarCTA.tsx)

### UI ELEMENTS
- Button (/src/components/layout/NavbarCTA.tsx): 
- Button (/src/components/layout/NavbarCTA.tsx): 
- Button (/src/components/layout/NavbarCTA.tsx): 
- UserButton (/src/components/layout/NavbarCTA.tsx): 


#### File: /src/components/pricing/PricingTable.tsx
### COMPONENTS
- **PricingTable** (/src/components/pricing/PricingTable.tsx)
  - Local State: useState(false)

### UI ELEMENTS
- Button (/src/components/pricing/PricingTable.tsx): 
- Switch (/src/components/pricing/PricingTable.tsx): 


#### File: /src/components/settings/SettingsSidebar.tsx
### COMPONENTS
- **SettingsSidebar** (/src/components/settings/SettingsSidebar.tsx)
  - Props: { className, ...props }: SettingsSidebarProps


#### File: /src/components/ui/accordion.tsx
### UI ELEMENTS
- AccordionPrimitive.Header (/src/components/ui/accordion.tsx): 
- AccordionPrimitive.Trigger (/src/components/ui/accordion.tsx): 
- AccordionPrimitive.Content (/src/components/ui/accordion.tsx): 
- AccordionPrimitive.Item (/src/components/ui/accordion.tsx): 


#### File: /src/components/ui/alert-dialog.tsx
### COMPONENTS
- **AlertDialogHeader** (/src/components/ui/alert-dialog.tsx)
- **AlertDialogFooter** (/src/components/ui/alert-dialog.tsx)

### UI ELEMENTS
- AlertDialogPortal (/src/components/ui/alert-dialog.tsx): 
- AlertDialogPrimitive.Overlay (/src/components/ui/alert-dialog.tsx): 
- AlertDialogOverlay (/src/components/ui/alert-dialog.tsx): 
- AlertDialogPrimitive.Content (/src/components/ui/alert-dialog.tsx): 
- AlertDialogPrimitive.Title (/src/components/ui/alert-dialog.tsx): 
- AlertDialogPrimitive.Description (/src/components/ui/alert-dialog.tsx): 
- AlertDialogPrimitive.Action (/src/components/ui/alert-dialog.tsx): 
- AlertDialogPrimitive.Cancel (/src/components/ui/alert-dialog.tsx): 


#### File: /src/components/ui/badge.tsx
### COMPONENTS
- **Badge** (/src/components/ui/badge.tsx)
  - Props: { className, variant, ...props }: BadgeProps


#### File: /src/components/ui/button.tsx
### COMPONENTS
- **Button** (/src/components/ui/button.tsx)
  - Props: {
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }


#### File: /src/components/ui/calendar.tsx
### COMPONENTS
- **Calendar** (/src/components/ui/calendar.tsx)
  - Props: {
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}
- **CalendarDayButton** (/src/components/ui/calendar.tsx)
  - Props: {
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>

### UI ELEMENTS
- Button (/src/components/ui/calendar.tsx): 


#### File: /src/components/ui/chart.tsx
### COMPONENTS
- **ChartStyle** (/src/components/ui/chart.tsx)


#### File: /src/components/ui/checkbox.tsx
### UI ELEMENTS
- CheckboxPrimitive.Root (/src/components/ui/checkbox.tsx): 
- CheckboxPrimitive.Indicator (/src/components/ui/checkbox.tsx): 


#### File: /src/components/ui/dialog.tsx
### COMPONENTS
- **DialogHeader** (/src/components/ui/dialog.tsx)
- **DialogFooter** (/src/components/ui/dialog.tsx)

### UI ELEMENTS
- DialogPortal (/src/components/ui/dialog.tsx): 
- DialogPrimitive.Content (/src/components/ui/dialog.tsx): 
- DialogPrimitive.Close (/src/components/ui/dialog.tsx): 
- DialogPrimitive.Overlay (/src/components/ui/dialog.tsx): 
- DialogOverlay (/src/components/ui/dialog.tsx): 
- DialogPrimitive.Title (/src/components/ui/dialog.tsx): 
- DialogPrimitive.Description (/src/components/ui/dialog.tsx): 


#### File: /src/components/ui/dropdown-menu.tsx
### COMPONENTS
- **DropdownMenuShortcut** (/src/components/ui/dropdown-menu.tsx)

### UI ELEMENTS
- DropdownMenuPrimitive.CheckboxItem (/src/components/ui/dropdown-menu.tsx): 


#### File: /src/components/ui/form.tsx
### COMPONENTS
- **FormField** (/src/components/ui/form.tsx)

### UI ELEMENTS
- FormFieldContext.Provider (/src/components/ui/form.tsx): value={{ name: props.name }}
- FormItemContext.Provider (/src/components/ui/form.tsx): value={{ id }}


#### File: /src/components/ui/input.tsx
### UI ELEMENTS
- input (/src/components/ui/input.tsx): type="type"


#### File: /src/components/ui/popover.tsx
### UI ELEMENTS
- PopoverPrimitive.Portal (/src/components/ui/popover.tsx): 
- PopoverPrimitive.Content (/src/components/ui/popover.tsx): 


#### File: /src/components/ui/resizable.tsx
### COMPONENTS
- **ResizablePanelGroup** (/src/components/ui/resizable.tsx)
- **ResizableHandle** (/src/components/ui/resizable.tsx)


#### File: /src/components/ui/select.tsx
### UI ELEMENTS
- SelectPrimitive.Trigger (/src/components/ui/select.tsx): 
- SelectPrimitive.Icon (/src/components/ui/select.tsx): 
- SelectPrimitive.ScrollUpButton (/src/components/ui/select.tsx): 
- SelectPrimitive.ScrollDownButton (/src/components/ui/select.tsx): 
- SelectPrimitive.Portal (/src/components/ui/select.tsx): 
- SelectPrimitive.Content (/src/components/ui/select.tsx): 
- SelectPrimitive.Viewport (/src/components/ui/select.tsx): 
- SelectPrimitive.Item (/src/components/ui/select.tsx): 
- SelectPrimitive.ItemIndicator (/src/components/ui/select.tsx): 
- SelectPrimitive.ItemText (/src/components/ui/select.tsx): 
- SelectScrollUpButton (/src/components/ui/select.tsx): 
- SelectScrollDownButton (/src/components/ui/select.tsx): 
- SelectPrimitive.Label (/src/components/ui/select.tsx): 
- SelectPrimitive.Separator (/src/components/ui/select.tsx): 


#### File: /src/components/ui/sheet.tsx
### COMPONENTS
- **SheetHeader** (/src/components/ui/sheet.tsx)
- **SheetFooter** (/src/components/ui/sheet.tsx)


#### File: /src/components/ui/sidebar.tsx
### UI ELEMENTS
- Button (/src/components/ui/sidebar.tsx): onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
- button (/src/components/ui/sidebar.tsx): onClick={toggleSidebar}
- Input (/src/components/ui/sidebar.tsx): 

### ERROR STATES & REAL DATA
- Loading State Handled: Skeleton (/src/components/ui/sidebar.tsx)
- Loading State Handled: Skeleton (/src/components/ui/sidebar.tsx)


#### File: /src/components/ui/skeleton.tsx
### COMPONENTS
- **Skeleton** (/src/components/ui/skeleton.tsx)
  - Props: {
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>


#### File: /src/components/ui/switch.tsx
### UI ELEMENTS
- SwitchPrimitives.Root (/src/components/ui/switch.tsx): 
- SwitchPrimitives.Thumb (/src/components/ui/switch.tsx): 


#### File: /src/components/ui/tabs.tsx
### UI ELEMENTS
- TabsPrimitive.List (/src/components/ui/tabs.tsx): 
- TabsPrimitive.Trigger (/src/components/ui/tabs.tsx): 
- TabsPrimitive.Content (/src/components/ui/tabs.tsx): 


#### File: /src/components/dashboard/bots/create-bot-dialog.tsx
### COMPONENTS
- **CreateBotDialog** (/src/components/dashboard/bots/create-bot-dialog.tsx)
  - Props: { onCreate }: { onCreate: (name: string, description: string, type: BotType) => Promise<void> }
  - Local State: useState(false)

### UI ELEMENTS
- Dialog (/src/components/dashboard/bots/create-bot-dialog.tsx): 
- DialogTrigger (/src/components/dashboard/bots/create-bot-dialog.tsx): 
- Button (/src/components/dashboard/bots/create-bot-dialog.tsx): 
- DialogContent (/src/components/dashboard/bots/create-bot-dialog.tsx): 
- DialogHeader (/src/components/dashboard/bots/create-bot-dialog.tsx): 
- DialogTitle (/src/components/dashboard/bots/create-bot-dialog.tsx): 
- DialogDescription (/src/components/dashboard/bots/create-bot-dialog.tsx): 
- DialogFooter (/src/components/dashboard/bots/create-bot-dialog.tsx): 
- Button (/src/components/dashboard/bots/create-bot-dialog.tsx): disabled={loading}, onClick={() => setOpen(false)}
- Button (/src/components/dashboard/bots/create-bot-dialog.tsx): disabled={!name || loading}, onClick={handleSubmit}
- Input (/src/components/dashboard/bots/create-bot-dialog.tsx): placeholder="e.g., Customer Support Bot", value={name}

### RED FLAGS
- Console usage: console.error("Error creating bot:", error) (/src/components/dashboard/bots/create-bot-dialog.tsx)


#### File: /src/components/dashboard/contacts/contacts-list.tsx
### COMPONENTS
- **ContactsList** (/src/components/dashboard/contacts/contacts-list.tsx)

### UI ELEMENTS
- Button (/src/components/dashboard/contacts/contacts-list.tsx): onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
- Badge (/src/components/dashboard/contacts/contacts-list.tsx): 
- Button (/src/components/dashboard/contacts/contacts-list.tsx): 
- Button (/src/components/dashboard/contacts/contacts-list.tsx): 
- DropdownMenuCheckboxItem (/src/components/dashboard/contacts/contacts-list.tsx): 
- Table (/src/components/dashboard/contacts/contacts-list.tsx): 
- TableHeader (/src/components/dashboard/contacts/contacts-list.tsx): 
- TableRow (/src/components/dashboard/contacts/contacts-list.tsx): 
- TableHead (/src/components/dashboard/contacts/contacts-list.tsx): 
- TableBody (/src/components/dashboard/contacts/contacts-list.tsx): 
- TableRow (/src/components/dashboard/contacts/contacts-list.tsx): onClick={() => {
                                        setSelectedContact(row.original)
                                        setEditDialogOpen(true)
                                    }}
- TableCell (/src/components/dashboard/contacts/contacts-list.tsx): onClick={(e) => {
                                                // Prevent opening edit dialog when clicking on selection checkbox or actions
                                                if (cell.column.id === "select" || cell.column.id === "actions") {
                                                    e.stopPropagation()
                                                }
                                            }}
- TableRow (/src/components/dashboard/contacts/contacts-list.tsx): 
- TableCell (/src/components/dashboard/contacts/contacts-list.tsx): 
- Button (/src/components/dashboard/contacts/contacts-list.tsx): disabled={!table.getCanPreviousPage()}, onClick={() => table.previousPage()}
- Button (/src/components/dashboard/contacts/contacts-list.tsx): disabled={!table.getCanNextPage()}, onClick={() => table.nextPage()}
- AlertDialog (/src/components/dashboard/contacts/contacts-list.tsx): 
- AlertDialogContent (/src/components/dashboard/contacts/contacts-list.tsx): 
- AlertDialogHeader (/src/components/dashboard/contacts/contacts-list.tsx): 
- AlertDialogTitle (/src/components/dashboard/contacts/contacts-list.tsx): 
- AlertDialogDescription (/src/components/dashboard/contacts/contacts-list.tsx): 
- AlertDialogFooter (/src/components/dashboard/contacts/contacts-list.tsx): 
- AlertDialogCancel (/src/components/dashboard/contacts/contacts-list.tsx): 
- AlertDialogAction (/src/components/dashboard/contacts/contacts-list.tsx): onClick={async () => {
                                if (contactPendingDelete) {
                                    await handleDelete(contactPendingDelete)
                                    setContactPendingDelete(null)
                                }
                            }}
- Checkbox (/src/components/dashboard/contacts/contacts-list.tsx): 
- Checkbox (/src/components/dashboard/contacts/contacts-list.tsx): 
- Input (/src/components/dashboard/contacts/contacts-list.tsx): placeholder="Filter by name...", value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
- EditContactDialog (/src/components/dashboard/contacts/contacts-list.tsx): 

### CONVEX WIRING
- useQuery(api.contacts.list, activeProject ? { projectId: activeProject._id } : "skip") (/src/components/dashboard/contacts/contacts-list.tsx)
- useMutation(api.contacts.remove) (/src/components/dashboard/contacts/contacts-list.tsx)

### RED FLAGS
- Found 1 'any' type usages (/src/components/dashboard/contacts/contacts-list.tsx)


#### File: /src/components/dashboard/contacts/edit-contact-dialog.tsx
### COMPONENTS
- **EditContactDialog** (/src/components/dashboard/contacts/edit-contact-dialog.tsx)
  - Props: { contact, open, onOpenChange }: EditContactDialogProps
  - Local State: useState(false)

### UI ELEMENTS
- Dialog (/src/components/dashboard/contacts/edit-contact-dialog.tsx): 
- DialogContent (/src/components/dashboard/contacts/edit-contact-dialog.tsx): 
- DialogHeader (/src/components/dashboard/contacts/edit-contact-dialog.tsx): 
- DialogTitle (/src/components/dashboard/contacts/edit-contact-dialog.tsx): 
- DialogDescription (/src/components/dashboard/contacts/edit-contact-dialog.tsx): 
- DialogFooter (/src/components/dashboard/contacts/edit-contact-dialog.tsx): 
- Button (/src/components/dashboard/contacts/edit-contact-dialog.tsx): disabled={loading}, type="submit"
- Input (/src/components/dashboard/contacts/edit-contact-dialog.tsx): value={formData.name}
- Input (/src/components/dashboard/contacts/edit-contact-dialog.tsx): type="email", value={formData.email}
- Input (/src/components/dashboard/contacts/edit-contact-dialog.tsx): type="tel", value={formData.phone}
- Input (/src/components/dashboard/contacts/edit-contact-dialog.tsx): value={formData.address}

### CONVEX WIRING
- useMutation(api.contacts.update) (/src/components/dashboard/contacts/edit-contact-dialog.tsx)

### ERROR STATES & REAL DATA
- Loading State Handled: Loader2 (/src/components/dashboard/contacts/edit-contact-dialog.tsx)

### RED FLAGS
- Console usage: console.error(error) (/src/components/dashboard/contacts/edit-contact-dialog.tsx)


#### File: /src/components/dashboard/kb/add-content-dialog.tsx
### COMPONENTS
- **AddContentDialog** (/src/components/dashboard/kb/add-content-dialog.tsx)
  - Props: { onAdd }: { onAdd: (type: string, value: string) => Promise<void> }
  - Local State: useState(false)

### UI ELEMENTS
- Dialog (/src/components/dashboard/kb/add-content-dialog.tsx): 
- DialogTrigger (/src/components/dashboard/kb/add-content-dialog.tsx): 
- Button (/src/components/dashboard/kb/add-content-dialog.tsx): 
- DialogContent (/src/components/dashboard/kb/add-content-dialog.tsx): 
- DialogHeader (/src/components/dashboard/kb/add-content-dialog.tsx): 
- DialogTitle (/src/components/dashboard/kb/add-content-dialog.tsx): 
- DialogDescription (/src/components/dashboard/kb/add-content-dialog.tsx): 
- Tabs (/src/components/dashboard/kb/add-content-dialog.tsx): 
- TabsList (/src/components/dashboard/kb/add-content-dialog.tsx): 
- TabsTrigger (/src/components/dashboard/kb/add-content-dialog.tsx): value={url}
- TabsTrigger (/src/components/dashboard/kb/add-content-dialog.tsx): value={text}
- TabsTrigger (/src/components/dashboard/kb/add-content-dialog.tsx): value={file}
- TabsContent (/src/components/dashboard/kb/add-content-dialog.tsx): value={url}
- Button (/src/components/dashboard/kb/add-content-dialog.tsx): 
- DialogFooter (/src/components/dashboard/kb/add-content-dialog.tsx): 
- Button (/src/components/dashboard/kb/add-content-dialog.tsx): disabled={!url}, onClick={() => handleSubmit('url')}
- TabsContent (/src/components/dashboard/kb/add-content-dialog.tsx): value={text}
- DialogFooter (/src/components/dashboard/kb/add-content-dialog.tsx): 
- Button (/src/components/dashboard/kb/add-content-dialog.tsx): disabled={!text}, onClick={() => handleSubmit('text')}
- TabsContent (/src/components/dashboard/kb/add-content-dialog.tsx): value={file}
- Button (/src/components/dashboard/kb/add-content-dialog.tsx): type="button"
- DialogFooter (/src/components/dashboard/kb/add-content-dialog.tsx): 
- Button (/src/components/dashboard/kb/add-content-dialog.tsx): disabled={!file || loading}, onClick={() => handleSubmit('file')}
- Input (/src/components/dashboard/kb/add-content-dialog.tsx): placeholder="https://example.com/page", value={url}
- input (/src/components/dashboard/kb/add-content-dialog.tsx): type="file"

### CONVEX WIRING
- useAction(api.knowledgeBases.generateKbUploadUrl) (/src/components/dashboard/kb/add-content-dialog.tsx)

### RED FLAGS
- Console usage: console.error("Error adding content:", error) (/src/components/dashboard/kb/add-content-dialog.tsx)


#### File: /src/components/dashboard/monitor/canned-response-picker.tsx
### COMPONENTS
- **CannedResponsePicker** (/src/components/dashboard/monitor/canned-response-picker.tsx)
  - Props: {
    responses,
    query,
    onSelect,
    onClose,
}: CannedResponsePickerProps
  - Local State: useState(0)

### UI ELEMENTS
- button (/src/components/dashboard/monitor/canned-response-picker.tsx): onClick={() => onSelect(res.message)}


#### File: /src/components/dashboard/monitor/chat-display.tsx
### COMPONENTS
- **ChatDisplay** (/src/components/dashboard/monitor/chat-display.tsx)
  - Props: { conversation, onBack, onOpenContact }: ChatDisplayProps
  - Local State: useState<"public" | "internal">("public")

### UI ELEMENTS
- Button (/src/components/dashboard/monitor/chat-display.tsx): onClick={onBack}
- Button (/src/components/dashboard/monitor/chat-display.tsx): onClick={onOpenContact}
- Button (/src/components/dashboard/monitor/chat-display.tsx): onClick={handleJoinLeave}
- Button (/src/components/dashboard/monitor/chat-display.tsx): 
- Dialog (/src/components/dashboard/monitor/chat-display.tsx): 
- DialogContent (/src/components/dashboard/monitor/chat-display.tsx): 
- DialogHeader (/src/components/dashboard/monitor/chat-display.tsx): 
- DialogTitle (/src/components/dashboard/monitor/chat-display.tsx): 
- Dialog (/src/components/dashboard/monitor/chat-display.tsx): 
- DialogContent (/src/components/dashboard/monitor/chat-display.tsx): 
- DialogHeader (/src/components/dashboard/monitor/chat-display.tsx): 
- DialogTitle (/src/components/dashboard/monitor/chat-display.tsx): 
- button (/src/components/dashboard/monitor/chat-display.tsx): onClick={() => loadMore(30)}
- Tabs (/src/components/dashboard/monitor/chat-display.tsx): value={messageMode}
- TabsList (/src/components/dashboard/monitor/chat-display.tsx): 
- TabsTrigger (/src/components/dashboard/monitor/chat-display.tsx): value={public}
- TabsTrigger (/src/components/dashboard/monitor/chat-display.tsx): value={internal}
- Button (/src/components/dashboard/monitor/chat-display.tsx): disabled={conversation.status === 1000}
- Button (/src/components/dashboard/monitor/chat-display.tsx): disabled={conversation.status === 1000}
- Button (/src/components/dashboard/monitor/chat-display.tsx): disabled={!inputValue.trim() || conversation.status === 1000}, onClick={handleSend}
- Button (/src/components/dashboard/monitor/chat-display.tsx): disabled={!inputValue.trim() || conversation.status === 1000}, onClick={handleSendAsOpen}
- Button (/src/components/dashboard/monitor/chat-display.tsx): disabled={!inputValue.trim() || conversation.status === 1000}
- Input (/src/components/dashboard/monitor/chat-display.tsx): placeholder="Search agents...", value={agentSearch}
- Input (/src/components/dashboard/monitor/chat-display.tsx): placeholder="Search departments...", value={departmentSearch}

### CONVEX WIRING
- useQuery(api.settings.listDepartments, projectId ? { projectId: projectId as Id<"projects"> } : "skip") (/src/components/dashboard/monitor/chat-display.tsx)
- useQuery(api.settings.listCannedResponses, projectId ? { projectId: projectId as Id<"projects"> } : "skip") (/src/components/dashboard/monitor/chat-display.tsx)
- useMutation(api.messages.sendMessage) (/src/components/dashboard/monitor/chat-display.tsx)
- useMutation(api.conversations.relayToMeta) (/src/components/dashboard/monitor/chat-display.tsx)
- useMutation(api.conversations.relayToTelegram) (/src/components/dashboard/monitor/chat-display.tsx)
- useMutation(api.conversations.join) (/src/components/dashboard/monitor/chat-display.tsx)
- useMutation(api.conversations.leave) (/src/components/dashboard/monitor/chat-display.tsx)
- useMutation(api.conversations.resolve) (/src/components/dashboard/monitor/chat-display.tsx)
- useMutation(api.conversations.updateConversationStatus) (/src/components/dashboard/monitor/chat-display.tsx)
- useMutation(api.conversations.update) (/src/components/dashboard/monitor/chat-display.tsx)
- useMutation(api.conversations.transferToDepartment) (/src/components/dashboard/monitor/chat-display.tsx)
- useMutation(api.messages.send) (/src/components/dashboard/monitor/chat-display.tsx)

### ERROR STATES & REAL DATA
- Loading State Handled: Skeleton (/src/components/dashboard/monitor/chat-display.tsx)
- Loading State Handled: Skeleton (/src/components/dashboard/monitor/chat-display.tsx)
- Loading State Handled: Skeleton (/src/components/dashboard/monitor/chat-display.tsx)

### RED FLAGS
- Console usage: console.error("Failed to relay to Meta:", metaErr) (/src/components/dashboard/monitor/chat-display.tsx)
- Console usage: console.error("Failed to relay to Telegram:", telegramErr) (/src/components/dashboard/monitor/chat-display.tsx)
- Console usage: console.error("Failed to send message:", error) (/src/components/dashboard/monitor/chat-display.tsx)
- Console usage: console.error("Failed to send as open:", error) (/src/components/dashboard/monitor/chat-display.tsx)
- Console usage: console.error("Failed to set status to pending:", error) (/src/components/dashboard/monitor/chat-display.tsx)
- Console usage: console.error("Failed to resolve conversation:", error) (/src/components/dashboard/monitor/chat-display.tsx)
- Console usage: console.error("Failed to toggle join status:", error) (/src/components/dashboard/monitor/chat-display.tsx)
- Console usage: console.error("Failed to close conversation:", error) (/src/components/dashboard/monitor/chat-display.tsx)
- Console usage: console.error("Failed to transfer conversation:", error) (/src/components/dashboard/monitor/chat-display.tsx)
- Console usage: console.error("Failed to transfer to department:", error) (/src/components/dashboard/monitor/chat-display.tsx)
- Found 2 'any' type usages (/src/components/dashboard/monitor/chat-display.tsx)


#### File: /src/components/dashboard/monitor/conversation-list.tsx
### COMPONENTS
- **ConversationList** (/src/components/dashboard/monitor/conversation-list.tsx)
  - Props: {
    items,
    selectedId,
    onSelect,
    activeDeptId,
    onDeptChange,
    onSelectConversation,
}: ConversationListProps
  - Local State: useReducer(filtersReducer, initialFilters)

### UI ELEMENTS
- Popover (/src/components/dashboard/monitor/conversation-list.tsx): 
- PopoverTrigger (/src/components/dashboard/monitor/conversation-list.tsx): 
- Button (/src/components/dashboard/monitor/conversation-list.tsx): 
- PopoverContent (/src/components/dashboard/monitor/conversation-list.tsx): 
- Button (/src/components/dashboard/monitor/conversation-list.tsx): onClick={() => dispatch({ type: "SET_LABEL", payload: null })}
- Button (/src/components/dashboard/monitor/conversation-list.tsx): onClick={() => dispatch({ type: "SET_LABEL", payload: activeLabel === label.name ? null : label.name })}
- Button (/src/components/dashboard/monitor/conversation-list.tsx): 
- Button (/src/components/dashboard/monitor/conversation-list.tsx): 
- Button (/src/components/dashboard/monitor/conversation-list.tsx): 
- Button (/src/components/dashboard/monitor/conversation-list.tsx): 
- button (/src/components/dashboard/monitor/conversation-list.tsx): onClick={() => {
                                onSelect(item.id);
                                if (onSelectConversation) onSelectConversation(item.id);
                            }}
- Badge (/src/components/dashboard/monitor/conversation-list.tsx): 
- Badge (/src/components/dashboard/monitor/conversation-list.tsx): 
- Badge (/src/components/dashboard/monitor/conversation-list.tsx): 
- Badge (/src/components/dashboard/monitor/conversation-list.tsx): 
- Badge (/src/components/dashboard/monitor/conversation-list.tsx): 
- Badge (/src/components/dashboard/monitor/conversation-list.tsx): 
- Badge (/src/components/dashboard/monitor/conversation-list.tsx): 
- Search (/src/components/dashboard/monitor/conversation-list.tsx): 
- Input (/src/components/dashboard/monitor/conversation-list.tsx): placeholder="Search conversations...", value={searchQuery}
- Filter (/src/components/dashboard/monitor/conversation-list.tsx): 
- Filter (/src/components/dashboard/monitor/conversation-list.tsx): 

### CONVEX WIRING
- useQuery(api.labels.listLabels, projectId ? { projectId } : "skip") (/src/components/dashboard/monitor/conversation-list.tsx)
- useQuery(api.settings.listDepartments, projectId ? { projectId } : "skip") (/src/components/dashboard/monitor/conversation-list.tsx)


#### File: /src/components/dashboard/monitor/monitor-layout.tsx
**Layout Component** - Wraps routes in this directory.

### COMPONENTS
- **MonitorLayout** (/src/components/dashboard/monitor/monitor-layout.tsx)

### CONVEX WIRING
- useQuery(api.conversations.getConversations, projectId ? {
            projectId,
            departmentId: activeDeptId ?? undefined
        } : "skip") (/src/components/dashboard/monitor/monitor-layout.tsx)

### ERROR STATES & REAL DATA
- Loading State Handled: Skeleton (/src/components/dashboard/monitor/monitor-layout.tsx)
- Loading State Handled: Skeleton (/src/components/dashboard/monitor/monitor-layout.tsx)
- Loading State Handled: Skeleton (/src/components/dashboard/monitor/monitor-layout.tsx)


#### File: /src/components/dashboard/settings/operating-hours.tsx
### COMPONENTS
- **OperatingHoursSettings** (/src/components/dashboard/settings/operating-hours.tsx)

### UI ELEMENTS
- Form (/src/components/dashboard/settings/operating-hours.tsx): 
- FormItem (/src/components/dashboard/settings/operating-hours.tsx): 
- FormLabel (/src/components/dashboard/settings/operating-hours.tsx): 
- FormDescription (/src/components/dashboard/settings/operating-hours.tsx): 
- FormControl (/src/components/dashboard/settings/operating-hours.tsx): 
- Button (/src/components/dashboard/settings/operating-hours.tsx): type="submit"
- FormField (/src/components/dashboard/settings/operating-hours.tsx): 
- Switch (/src/components/dashboard/settings/operating-hours.tsx): 


#### File: /src/components/dashboard/settings/SettingsSidebar.tsx
### COMPONENTS
- **SettingsSidebar** (/src/components/dashboard/settings/SettingsSidebar.tsx)
  - Props: { className, ...props }: React.HTMLAttributes<HTMLElement>


#### File: /src/components/dashboard/shared/VisitorPanel.tsx
### COMPONENTS
- **InlineEditField** (/src/components/dashboard/shared/VisitorPanel.tsx)
  - Props: {
    value,
    placeholder,
    icon: Icon,
    multiline,
    onSave,
}: {
    value: string
    placeholder: string
    icon: React.ElementType
    multiline?: boolean
    onSave: (value: string) => void
}
- **VisitorPanel** (/src/components/dashboard/shared/VisitorPanel.tsx)
  - Props: { conversationId, onBack }: { conversationId: Id<"conversations">, onBack?: () => void }
  - Local State: useState(false)

### UI ELEMENTS
- button (/src/components/dashboard/shared/VisitorPanel.tsx): 
- button (/src/components/dashboard/shared/VisitorPanel.tsx): 
- Button (/src/components/dashboard/shared/VisitorPanel.tsx): onClick={onBack}
- Accordion (/src/components/dashboard/shared/VisitorPanel.tsx): type="multiple"
- AccordionItem (/src/components/dashboard/shared/VisitorPanel.tsx): value={visitor-info}
- AccordionTrigger (/src/components/dashboard/shared/VisitorPanel.tsx): 
- AccordionContent (/src/components/dashboard/shared/VisitorPanel.tsx): 
- AccordionItem (/src/components/dashboard/shared/VisitorPanel.tsx): value={conversation-details}
- AccordionTrigger (/src/components/dashboard/shared/VisitorPanel.tsx): 
- AccordionContent (/src/components/dashboard/shared/VisitorPanel.tsx): 
- Select (/src/components/dashboard/shared/VisitorPanel.tsx): value={conversation.priority || "normal"}
- SelectTrigger (/src/components/dashboard/shared/VisitorPanel.tsx): 
- Badge (/src/components/dashboard/shared/VisitorPanel.tsx): 
- Badge (/src/components/dashboard/shared/VisitorPanel.tsx): 
- Badge (/src/components/dashboard/shared/VisitorPanel.tsx): 
- Badge (/src/components/dashboard/shared/VisitorPanel.tsx): 
- SelectContent (/src/components/dashboard/shared/VisitorPanel.tsx): 
- SelectItem (/src/components/dashboard/shared/VisitorPanel.tsx): value={low}
- SelectItem (/src/components/dashboard/shared/VisitorPanel.tsx): value={normal}
- SelectItem (/src/components/dashboard/shared/VisitorPanel.tsx): value={high}
- SelectItem (/src/components/dashboard/shared/VisitorPanel.tsx): value={urgent}
- AccordionItem (/src/components/dashboard/shared/VisitorPanel.tsx): value={technical-info}
- AccordionTrigger (/src/components/dashboard/shared/VisitorPanel.tsx): 
- AccordionContent (/src/components/dashboard/shared/VisitorPanel.tsx): 
- AccordionItem (/src/components/dashboard/shared/VisitorPanel.tsx): value={tags}
- AccordionTrigger (/src/components/dashboard/shared/VisitorPanel.tsx): 
- AccordionContent (/src/components/dashboard/shared/VisitorPanel.tsx): 
- Popover (/src/components/dashboard/shared/VisitorPanel.tsx): 
- PopoverTrigger (/src/components/dashboard/shared/VisitorPanel.tsx): 
- Button (/src/components/dashboard/shared/VisitorPanel.tsx): 
- PopoverContent (/src/components/dashboard/shared/VisitorPanel.tsx): 
- Button (/src/components/dashboard/shared/VisitorPanel.tsx): onClick={() => handleAssignTag(label.name)}
- Badge (/src/components/dashboard/shared/VisitorPanel.tsx): 
- button (/src/components/dashboard/shared/VisitorPanel.tsx): onClick={() => handleRemoveTag(tag)}
- AccordionItem (/src/components/dashboard/shared/VisitorPanel.tsx): value={orders}
- AccordionTrigger (/src/components/dashboard/shared/VisitorPanel.tsx): 
- AccordionContent (/src/components/dashboard/shared/VisitorPanel.tsx): 
- Badge (/src/components/dashboard/shared/VisitorPanel.tsx): 
- Badge (/src/components/dashboard/shared/VisitorPanel.tsx): 
- Badge (/src/components/dashboard/shared/VisitorPanel.tsx): 
- Button (/src/components/dashboard/shared/VisitorPanel.tsx): 
- Button (/src/components/dashboard/shared/VisitorPanel.tsx): onClick={() => {
                                        setIsOrderFormOpen(true);
                                        setOrderForm(prev => ({
                                            ...prev,
                                            contactName: prev.contactName || conversation?.visitorName || "",
                                            phone: prev.phone || conversation?.visitorPhone || ""
                                        }));
                                    }}
- Select (/src/components/dashboard/shared/VisitorPanel.tsx): value={orderForm.status}
- SelectTrigger (/src/components/dashboard/shared/VisitorPanel.tsx): 
- SelectContent (/src/components/dashboard/shared/VisitorPanel.tsx): 
- SelectItem (/src/components/dashboard/shared/VisitorPanel.tsx): value={new}
- SelectItem (/src/components/dashboard/shared/VisitorPanel.tsx): value={confirmed}
- SelectItem (/src/components/dashboard/shared/VisitorPanel.tsx): value={cancelled}
- Button (/src/components/dashboard/shared/VisitorPanel.tsx): disabled={orderFormSaving}, onClick={() => setIsOrderFormOpen(false)}
- Button (/src/components/dashboard/shared/VisitorPanel.tsx): disabled={orderFormSaving || !orderForm.product.trim() || !orderForm.contactName.trim()}, onClick={handleCreateOrder}
- Button (/src/components/dashboard/shared/VisitorPanel.tsx): disabled={contactSaving}, onClick={handleSaveContact}
- Input (/src/components/dashboard/shared/VisitorPanel.tsx): placeholder="placeholder", value={draft}
- Input (/src/components/dashboard/shared/VisitorPanel.tsx): placeholder="John Doe", value={orderForm.contactName}
- Input (/src/components/dashboard/shared/VisitorPanel.tsx): placeholder="+1 234 567 890", value={orderForm.phone}
- Input (/src/components/dashboard/shared/VisitorPanel.tsx): placeholder="Product name or description", value={orderForm.product}
- SelectValue (/src/components/dashboard/shared/VisitorPanel.tsx): 

### CONVEX WIRING
- useQuery(api.conversations.get, { id: conversationId }) (/src/components/dashboard/shared/VisitorPanel.tsx)
- useQuery(api.contacts.findByConversation, { conversationId }) (/src/components/dashboard/shared/VisitorPanel.tsx)
- useQuery(api.labels.listLabels, activeProject ? { projectId: activeProject._id } : "skip") (/src/components/dashboard/shared/VisitorPanel.tsx)
- useQuery(api.profiles.getByUserId, conversation?.assignedTo ? { userId: conversation.assignedTo } : "skip") (/src/components/dashboard/shared/VisitorPanel.tsx)
- useMutation(api.conversations.updateVisitorInfo) (/src/components/dashboard/shared/VisitorPanel.tsx)
- useMutation(api.conversations.update) (/src/components/dashboard/shared/VisitorPanel.tsx)
- useMutation(api.contacts.create) (/src/components/dashboard/shared/VisitorPanel.tsx)
- useMutation(api.contacts.update) (/src/components/dashboard/shared/VisitorPanel.tsx)
- useMutation(api.tags.assignTagToConversation) (/src/components/dashboard/shared/VisitorPanel.tsx)
- useMutation(api.tags.removeTagFromConversation) (/src/components/dashboard/shared/VisitorPanel.tsx)
- useQuery(api.orders.listOrders, activeProject ? { projectId: activeProject._id } : "skip") (/src/components/dashboard/shared/VisitorPanel.tsx)
- useMutation(api.orders.createOrder) (/src/components/dashboard/shared/VisitorPanel.tsx)
- useMutation(api.orders.updateOrderStatus) (/src/components/dashboard/shared/VisitorPanel.tsx)

### ERROR STATES & REAL DATA
- Loading State Handled: Loader2 (/src/components/dashboard/shared/VisitorPanel.tsx)
- Loading State Handled: Loader2 (/src/components/dashboard/shared/VisitorPanel.tsx)
- Loading State Handled: Loader2 (/src/components/dashboard/shared/VisitorPanel.tsx)
- Loading State Handled: Loader2 (/src/components/dashboard/shared/VisitorPanel.tsx)

### RED FLAGS
- Found 4 'any' type usages (/src/components/dashboard/shared/VisitorPanel.tsx)


#### File: /src/components/design-studio/nodes/AIAssistantNode.tsx
### COMPONENTS
- **AIAssistantNode** (/src/components/design-studio/nodes/AIAssistantNode.tsx)
  - Props: { data, selected }: NodeProps

### RED FLAGS
- Found 1 'any' type usages (/src/components/design-studio/nodes/AIAssistantNode.tsx)


#### File: /src/components/design-studio/nodes/AITaskNode.tsx
### COMPONENTS
- **AITaskNode** (/src/components/design-studio/nodes/AITaskNode.tsx)
  - Props: { data, selected }: NodeProps

### RED FLAGS
- Found 1 'any' type usages (/src/components/design-studio/nodes/AITaskNode.tsx)


#### File: /src/components/design-studio/nodes/ApplyLabelNode.tsx
### COMPONENTS
- **ApplyLabelNode** (/src/components/design-studio/nodes/ApplyLabelNode.tsx)
  - Props: { data, selected }: NodeProps

### RED FLAGS
- Found 1 'any' type usages (/src/components/design-studio/nodes/ApplyLabelNode.tsx)


#### File: /src/components/design-studio/nodes/AskKnowledgeBaseNode.tsx
### COMPONENTS
- **AskKnowledgeBaseNode** (/src/components/design-studio/nodes/AskKnowledgeBaseNode.tsx)
  - Props: { data, selected }: NodeProps

### RED FLAGS
- Found 1 'any' type usages (/src/components/design-studio/nodes/AskKnowledgeBaseNode.tsx)


#### File: /src/components/design-studio/nodes/CaptureUserReplyNode.tsx
### COMPONENTS
- **CaptureUserReplyNode** (/src/components/design-studio/nodes/CaptureUserReplyNode.tsx)
  - Props: { data, selected }: NodeProps

### RED FLAGS
- Found 1 'any' type usages (/src/components/design-studio/nodes/CaptureUserReplyNode.tsx)


#### File: /src/components/design-studio/nodes/ChangeDepartmentNode.tsx
### COMPONENTS
- **ChangeDepartmentNode** (/src/components/design-studio/nodes/ChangeDepartmentNode.tsx)
  - Props: { data, selected }: NodeProps

### RED FLAGS
- Found 1 'any' type usages (/src/components/design-studio/nodes/ChangeDepartmentNode.tsx)


#### File: /src/components/design-studio/nodes/ClearTranscriptNode.tsx
### COMPONENTS
- **ClearTranscriptNode** (/src/components/design-studio/nodes/ClearTranscriptNode.tsx)
  - Props: { data, selected }: NodeProps


#### File: /src/components/design-studio/nodes/CloseNode.tsx
### COMPONENTS
- **CloseNode** (/src/components/design-studio/nodes/CloseNode.tsx)
  - Props: { data, selected }: NodeProps

### RED FLAGS
- Found 1 'any' type usages (/src/components/design-studio/nodes/CloseNode.tsx)


#### File: /src/components/design-studio/nodes/CodeActionNode.tsx
### COMPONENTS
- **CodeActionNode** (/src/components/design-studio/nodes/CodeActionNode.tsx)
  - Props: { data, selected }: NodeProps

### RED FLAGS
- Found 1 'any' type usages (/src/components/design-studio/nodes/CodeActionNode.tsx)


#### File: /src/components/design-studio/nodes/ConditionNode.tsx
### COMPONENTS
- **ConditionNode** (/src/components/design-studio/nodes/ConditionNode.tsx)
  - Props: { data, selected }: NodeProps

### RED FLAGS
- Found 1 'any' type usages (/src/components/design-studio/nodes/ConditionNode.tsx)


#### File: /src/components/design-studio/nodes/HITLHandoffNode.tsx
### COMPONENTS
- **HITLHandoffNode** (/src/components/design-studio/nodes/HITLHandoffNode.tsx)
  - Props: { data, selected }: NodeProps

### RED FLAGS
- Found 1 'any' type usages (/src/components/design-studio/nodes/HITLHandoffNode.tsx)


#### File: /src/components/design-studio/nodes/IfOnlineAgentNode.tsx
### COMPONENTS
- **IfOnlineAgentNode** (/src/components/design-studio/nodes/IfOnlineAgentNode.tsx)
  - Props: { data, selected }: NodeProps

### RED FLAGS
- Found 1 'any' type usages (/src/components/design-studio/nodes/IfOnlineAgentNode.tsx)


#### File: /src/components/design-studio/nodes/IfOperatingHoursNode.tsx
### COMPONENTS
- **IfOperatingHoursNode** (/src/components/design-studio/nodes/IfOperatingHoursNode.tsx)
  - Props: { data, selected }: NodeProps

### RED FLAGS
- Found 1 'any' type usages (/src/components/design-studio/nodes/IfOperatingHoursNode.tsx)


#### File: /src/components/design-studio/nodes/ReplaceBotNode.tsx
### COMPONENTS
- **ReplaceBotNode** (/src/components/design-studio/nodes/ReplaceBotNode.tsx)
  - Props: { data, selected }: NodeProps

### RED FLAGS
- Found 1 'any' type usages (/src/components/design-studio/nodes/ReplaceBotNode.tsx)


#### File: /src/components/design-studio/nodes/ReplyNode.tsx
### COMPONENTS
- **ReplyNode** (/src/components/design-studio/nodes/ReplyNode.tsx)
  - Props: { data, selected }: NodeProps

### RED FLAGS
- Found 2 'any' type usages (/src/components/design-studio/nodes/ReplyNode.tsx)


#### File: /src/components/design-studio/nodes/SetAttributeNode.tsx
### COMPONENTS
- **SetAttributeNode** (/src/components/design-studio/nodes/SetAttributeNode.tsx)
  - Props: { data, selected }: NodeProps

### RED FLAGS
- Found 1 'any' type usages (/src/components/design-studio/nodes/SetAttributeNode.tsx)


#### File: /src/components/design-studio/nodes/SetPriorityNode.tsx
### COMPONENTS
- **SetPriorityNode** (/src/components/design-studio/nodes/SetPriorityNode.tsx)
  - Props: { data, selected }: NodeProps

### UI ELEMENTS
- Badge (/src/components/design-studio/nodes/SetPriorityNode.tsx): 

### RED FLAGS
- Found 1 'any' type usages (/src/components/design-studio/nodes/SetPriorityNode.tsx)


#### File: /src/components/design-studio/nodes/StartNode.tsx
### COMPONENTS
- **StartNode** (/src/components/design-studio/nodes/StartNode.tsx)
  - Props: { selected }: NodeProps


#### File: /src/components/design-studio/nodes/WaitNode.tsx
### COMPONENTS
- **WaitNode** (/src/components/design-studio/nodes/WaitNode.tsx)
  - Props: { data, selected }: NodeProps

### RED FLAGS
- Found 1 'any' type usages (/src/components/design-studio/nodes/WaitNode.tsx)


#### File: /src/components/design-studio/nodes/WebRequestNode.tsx
### COMPONENTS
- **WebRequestNode** (/src/components/design-studio/nodes/WebRequestNode.tsx)
  - Props: { data, selected }: NodeProps

### RED FLAGS
- Found 1 'any' type usages (/src/components/design-studio/nodes/WebRequestNode.tsx)

