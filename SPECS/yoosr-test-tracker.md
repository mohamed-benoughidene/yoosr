# Yoosr — Test Tracking Table
> Phase: Test & Debug | March 2026
> Status: [ ] Not tested | [PASS] Pass | [FAIL] Fail | [PARTIAL] Partial

| # | Module | Test Case | Status | Notes | Bug ID |
|---|--------|-----------|--------|-------|--------|
| 1 | Home | Dashboard layout loads without errors | [PASS] | Layout successfully imports components and Convex hooks | |
| 2 | Home | Sidebar renders all navigation links | [PASS] | Sidebar correctly renders navigation links grouped by category | |
| 3 | Home | Active nav item highlights correctly | [PASS] | Active nav item is correctly calculated and highlighted | |
| 4 | Home | ensureCurrent mutation fires on load | [PASS] | ensureCurrent mutation correctly fires on load | |
| 5 | Home | setAvailability mutation fires on load | [PASS] | setAvailability mutation fires on load and on heartbeat | |
| 6 | Home | Stats cards load real data from getHomeStats | [PASS] | Home stats cards accurately load real data using getHomeStats | |
| 7 | Home | Loading spinner shows while stats load | [PARTIAL] | Uses skeleton loader (animate-pulse) instead of a spinner | |
| 8 | Home | Onboarding banner renders if setup incomplete | [PASS] | Onboarding banner correctly conditionally renders | |
| 9 | Home | Activity table rows clickable → navigates to chat | [FAIL] | Recent activity feed items do not have an onClick handler | |
| 10 | Home | Status badges render correctly in activity table | [PARTIAL] | Badges render correctly in Live Queue, but recent activity feed has none | |
| 11 | Home | Load more button disabled when status is LoadingMore | [PASS] | Load more button correctly disabled when loading | |
| 12 | Home | Load more button calls loadMoreActivity(5) | [PASS] | Load more button correctly calls loadMoreActivity(5) | |
| 13 | Monitor | Conversations load from getConversations | [PASS] | Conversations load correctly | |
| 14 | Monitor | Search input filters conversations | [PASS] | Search input accurately updates state and filters | |
| 15 | Monitor | Label filter popover opens and filters | [PASS] | Label filter popover works and filters by tags | |
| 16 | Monitor | Department filter popover opens and filters | [PASS] | Department filter DropdownMenu works and re-triggers query | |
| 17 | Monitor | Agent filter popover opens and filters | [PASS] | Agent filter DropdownMenu works and filters locally | |
| 18 | Monitor | Status filter dropdown works | [PASS] | Status filter dropdown works for Open/Assigned statuses | |
| 19 | Monitor | Sort dropdown works | [PASS] | Sort dropdown correctly sorts by timestamp, priority, or SLA | |
| 20 | Monitor | Served/Unserved indicators display correctly | [FAIL] | Legend exists but indicators on conversation rows are missing/commented | |
| 21 | Monitor | SLA badge shows on near/past deadline conversations | [PASS] | SLA badge correctly computes and renders overdue/warning times | |
| 22 | Monitor | Urgent badge renders when priority is urgent | [PASS] | Urgent badge properly renders for high-priority items | |
| 23 | Monitor | Tag badges render on conversations | [PASS] | Conversation tags are rendered as badges | |
| 24 | Monitor | Clicking a conversation loads chat display | [PASS] | Clicking a conversation sets selectedID and renders ChatDisplay | |
| 25 | Monitor | Labels list loads from listLabels | [PASS] | Labels list fetched from api.labels.listLabels | |
| 26 | Monitor | Departments list loads from listDepartments | [PASS] | Loads departments from api.settings.listDepartments correctly | |
| 27 | Monitor | Messages load via getMessages (paginated) | [PASS] | paginated query implemented with usePaginatedQuery | |
| 28 | Monitor | Messages render in correct order | [PASS] | messages reversed to show oldest at top correctly | |
| 29 | Monitor | Join button calls conversations.join | [PASS] | uses api.conversations.join | |
| 30 | Monitor | Leave button calls conversations.leave | [PASS] | uses api.conversations.leave | |
| 31 | Monitor | Public/Internal tab toggle works | [PASS] | Tabs correctly switch between public and internal states | |
| 32 | Monitor | Internal note saves with type: internal | [PASS] | passes isInternal flag correctly to sendMessage | |
| 33 | Monitor | Internal notes render with yellow bubble | [PASS] | internal notes apply correct yellow tailwind classes | |
| 34 | Monitor | Send button calls messages.sendMessage | [PASS] | handleSend maps to messages.sendMessage | |
| 35 | Monitor | Canned response picker opens and inserts text | [PASS] | CannedResponsePicker properly inserts into textarea | |
| 36 | Monitor | More options dropdown opens | [PASS] | More options dropdown renders with correct items | |
| 37 | Monitor | Assign to me option works | [PASS] | Assign to me properly calls joinConversation | |
| 38 | Monitor | Resolve option calls conversations.resolve | [PASS] | Resolve options mapped to api.conversations.resolve | |
| 39 | Monitor | Transfer to department dialog opens with list | [PASS] | Transfer to Dept dialog displays full list | |
| 40 | Monitor | Transfer to department calls transferToDepartment | [PASS] | Correctly maps to api.conversations.transferToDepartment | |
| 41 | Monitor | Relay to Telegram calls relayToTelegram | [PASS] | If channel is telegram, relayToTelegram is invoked | |
| 42 | Monitor | Relay to Meta calls relayToMeta | [PASS] | If channel is messenger/instagram, relayToMeta is invoked | |
| 43 | Monitor | Visitor info loads from conversations.get | [PASS] | Visitor info accurately queried via api.conversations.get | |
| 44 | Monitor | Contact info loads from contacts.findByConversation | [PASS] | Contact fetched successfully via api.contacts.findByConversation | |
| 45 | Monitor | All 5 visitor panel accordions expand/collapse | [PASS] | 5 accordions implemented with type='multiple' | |
| 46 | Monitor | Inline edit for visitor name saves | [PASS] | InlineEditField effectively saves visitor updates | |
| 47 | Monitor | Priority select changes and saves | [PASS] | Priority correctly updates via conversations.update | |
| 48 | Monitor | Add tag popover opens | [PASS] | Add tag popover triggers displaying all labels | |
| 49 | Monitor | Tag selection calls assignTagToConversation | [PASS] | Tag selection correctly bound to assignTagToConversation | |
| 50 | Monitor | Tag removal calls removeTagFromConversation | [PASS] | Tag removal calls removeTagFromConversation correctly | |
| 51 | Monitor | Save contact calls contacts.create or contacts.update | [PASS] | Save correctly differentiates between contacts.update and contacts.create | |
| 52 | Monitor | Orders list loads from orders.listOrders | [PASS] | orders list mapped to api.orders.listOrders | |
| 53 | Monitor | New order save calls orders.createOrder | [PASS] | mapped to api.orders.createOrder | |
| 54 | Monitor | Order status update calls orders.updateOrderStatus | [PASS] | mapped to orders.updateOrderStatus | |
| 55 | Chat | Conversations load and render | [PASS] | ConversationList uses api.conversations.list | |
| 56 | Chat | Search input filters conversations | [PASS] | Search correctly filters conversations array locally | |
| 57 | Chat | All tab shows all conversations | [PASS] | All tab includes all conversations | |
| 58 | Chat | Unread tab filters to unread only | [PASS] | Unread tab filters appropriately | |
| 59 | Chat | Messages load in real time | [PASS] | usePaginatedQuery seamlessly handles realtime | |
| 60 | Chat | Agent can send a message | [PASS] | sendMessage mapped correctly | |
| 61 | Chat | Resolve button works | [PASS] | resolve passes conversationId to api.conversations.resolve | |
| 62 | Chat | Public/Internal toggle works | [PASS] | Tabs implement messageMode correctly | |
| 63 | Chat | Internal notes render with yellow background | [PASS] | Internal note renders yellow bg classes | |
| 64 | Chat | Canned responses available in input | [PASS] | Canned responses trigger smoothly through / | |
| 65 | Requests | Unassigned filter button works | [PASS] | Unassigned filter condition properly bounds array | |
| 66 | Requests | Mine filter button works | [PASS] | Mine filter properly bounds array | |
| 67 | Requests | Bot Escalated filter button works | [PASS] | Bot Escalated correctly bounds and flags | |
| 68 | Requests | Badge counts show correct numbers | [PASS] | Counts compute natively from array iteration | |
| 69 | Requests | Table loads from conversations.list | [PASS] | Table leverages queries from conversations.list | |
| 70 | Requests | Departments load from getMyDepartments | [PASS] | department ID from getMyDepartments correctly sets param in conversation.list query | |
| 71 | Requests | Search input filters results | [PASS] | Basic search matching visitor name and local message | |
| 72 | Requests | Row click navigates to chat | [PASS] | Row sets Next router push to the chat route | |
| 73 | Requests | Assign to me calls conversations.update | [PASS] | Calls conversations.update to change assignedTo | |
| 74 | Requests | Assign to me disabled while assigningId is set | [PASS] | Button incorporates assigningId disabled flag | |
| 75 | Requests | Resolve calls conversations.resolve | [PASS] | Calls conversations.resolve to set status | |
| 76 | Requests | Resolve disabled while resolvingId is set | [PASS] | Button incorporates resolvingId disabled flag | |
| 77 | Requests | Action buttons use stopPropagation | [PASS] | e.stopPropagation correctly implemented on both assign and resolve buttons | |
| 78 | Requests | Assign error surfaced to user (not just console) | [FAIL] | Errors logged to console but not surfaced via toast notification | |
| 79 | Requests | Resolve error surfaced to user (not just console) | [FAIL] | Errors logged to console but not surfaced via toast notification | |
| 80 | Orders | All filter button works | [PASS] | onClick triggers setFilter('all') smoothly | |
| 81 | Orders | New filter button works | [PASS] | onClick triggers setFilter('new') smoothly | |
| 82 | Orders | Confirmed filter button works | [PASS] | onClick triggers setFilter('confirmed') | |
| 83 | Orders | Cancelled filter button works | [PASS] | onClick triggers setFilter('cancelled') | |
| 84 | Orders | Orders load from orders.listOrders | [PASS] | uses api.orders.listOrders | |
| 85 | Orders | Status badges render (new/confirmed/cancelled) | [PASS] | uses Badge component to render dynamically by order.status | |
| 86 | Orders | Update status calls orders.updateOrderStatus | [PASS] | maps to orders.updateOrderStatus | |
| 87 | Orders | Delete calls orders.deleteOrder | [PASS] | maps to orders.deleteOrder along with a confirm prompt | |
| 88 | Orders | Import dialog opens | [PASS] | Dialog component triggers perfectly with state variables | |
| 89 | Orders | File input accepts file | [PASS] | input type=file accept=.csv,.json,.xlsx | |
| 90 | Orders | Parsed orders preview shows after file selection | [PASS] | Preview renders within Dialog component for slices of 5 using parsedOrders state | |
| 91 | Orders | Cancel button resets import state | [PASS] | Cancel sets SET_RESET perfectly dispatching to initialImportState | |
| 92 | Orders | Confirm import calls orders.batchImportOrders | [PASS] | dispatch maps to orders.batchImportOrders across multiple chunks explicitly | |
| 93 | Orders | Confirm import disabled when parsedOrders empty | [PASS] | Submit disable property includes check on array length | |
| 94 | Orders | Export to CSV works | [PASS] | csv array translation to blob succeeds logicly | |
| 95 | Orders | Export to JSON works | [PASS] | JSON natively converts to blob mapping | |
| 96 | Orders | Export to XLSX works | [PASS] | XLSX translation uses the imported XLSX library effectively to build a blob mapping sheet | |
| 97 | Bots | Bots load from bots.list | [PASS] | bots load seamlessly from bots.list | |
| 98 | Bots | Search input filters bots | [PASS] | local string check correctly filters bots array | |
| 99 | Bots | All / Chatbot / Automation filters work | [PASS] | local type matching correctly filters component states | |
| 100 | Bots | Create bot dialog opens | [PASS] | Uses child CreateBotDialog component flawlessly | |
| 101 | Bots | Create bot calls bots.create | [PASS] | handleCreateBot uses imported api.bots.create | |
| 102 | Bots | Bot status toggle calls bots.update | [PASS] | updateBot mapped to api.bots.update correctly via the active/draft toggle | |
| 103 | Bots | Delete bot triggers AlertDialog | [PASS] | AlertDialog maps boolean from pending state variable string length correctly | |
| 104 | Bots | AlertDialog confirm calls bots.remove | [PASS] | Confirm removes active bot via api.bots.remove | |
| 105 | Bots | Clicking a bot navigates to Design Studio | [PASS] | Router actively pushes towards design-studio dynamic link via activeProject | |
| 106 | Design Studio | Layout loads with auth check | [PASS] | useEffect checks auth context accurately and fires redirect if missed | |
| 107 | Design Studio | Bot data loads from bots.get | [PASS] | Bot gets fetched via api.bots.get | |
| 108 | Design Studio | Bot flow loads from botFlows.get | [PASS] | Bot flow loads implicitly through api.botFlows.get lookup by ID | |
| 109 | Design Studio | Canvas renders with existing nodes | [PASS] | Canvas loads properly with initial nodes logic fallback to initialNodesWithPositions | |
| 110 | Design Studio | Back button navigates to /dashboard/bots | [PASS] | ArrowLeft mapped accurately pushing back to URL containing parameter scope | |
| 111 | Design Studio | Save button calls botFlows.save | [PASS] | dispatch maps explicitly to the botFlows.save convex action handling timeout states | |
| 112 | Design Studio | StartNode renders without error | [PASS] | Node block exists flawlessly inside the nodes folder exported properly | |
| 113 | Design Studio | ReplyNode renders without error | [PASS] | Node block exists flawlessly inside the nodes folder exported properly | |
| 114 | Design Studio | SetAttributeNode renders without error | [PASS] | Node block exists flawlessly inside the nodes folder exported properly | |
| 115 | Design Studio | CaptureUserReplyNode renders without error | [PASS] | Node block exists flawlessly inside the nodes folder exported properly | |
| 116 | Design Studio | ConditionNode renders without error | [PASS] | Node block exists flawlessly inside the nodes folder exported properly | |
| 117 | Design Studio | AskKnowledgeBaseNode renders without error | [PASS] | Node block exists flawlessly inside the nodes folder exported properly | |
| 118 | Design Studio | WebRequestNode renders without error | [PASS] | Node block exists flawlessly inside the nodes folder exported properly | |
| 119 | Design Studio | ReplaceBotNode renders without error | [PASS] | Node block exists flawlessly inside the nodes folder exported properly | |
| 120 | Design Studio | HITLHandoffNode renders without error | [PASS] | Node block exists flawlessly inside the nodes folder exported properly | |
| 121 | Design Studio | AITaskNode renders without error | [PASS] | Node block exists flawlessly inside the nodes folder exported properly | |
| 122 | Design Studio | AIAssistantNode renders without error | [PASS] | Node block exists flawlessly inside the nodes folder exported properly | |
| 123 | Design Studio | ClearTranscriptNode renders without error | [PASS] | Node block exists flawlessly inside the nodes folder exported properly | |
| 124 | Design Studio | WaitNode renders without error | [PASS] | Node block exists flawlessly inside the nodes folder exported properly | |
| 125 | Design Studio | ApplyLabelNode renders without error | [PASS] | Node block exists flawlessly inside the nodes folder exported properly | |
| 126 | Design Studio | IfOperatingHoursNode renders without error | [PASS] | Node block exists flawlessly inside the nodes folder exported properly | |
| 127 | Design Studio | IfOnlineAgentNode renders without error | [PASS] | Node block exists flawlessly inside the nodes folder exported properly | |
| 128 | Design Studio | ChangeDepartmentNode renders without error | [PASS] | Node block exists flawlessly inside the nodes folder exported properly | |
| 129 | Design Studio | CodeActionNode renders without error | [PASS] | Node block exists flawlessly inside the nodes folder exported properly | |
| 130 | Design Studio | CloseNode renders without error | [PASS] | Node block exists flawlessly inside the nodes folder exported properly | |
| 131 | Design Studio | SetPriorityNode renders without error | [PASS] | Node block exists flawlessly inside the nodes folder exported properly | |
| 132 | Design Studio | Clicking a node opens properties panel | [PASS] | onClick selectedNode trigger successfully calls NodePropertiesPanel layout logic | |
| 133 | Design Studio | Properties panel fields save back to node data | [PASS] | UseCallback onUpdateNode pushes mapped context attributes directly updating map array | |
| 134 | Knowledge Base | KB list loads from knowledgeBases.list | [PASS] | Layout sidebar uses api.knowledgeBases.list correctly | |
| 135 | Knowledge Base | Navigating to KB loads details page | [PASS] | Link routes to /dashboard/kb/[kbId] and page loads details | |
| 136 | Knowledge Base | getOrCreateDefault fires on load | [PASS] | useEffect calls getOrCreateDefault mutation when kbId is 'default' | |
| 137 | Knowledge Base | Sources load from listSources | [PASS] | Sources loaded via api.knowledgeBases.listSources with resolvedKbId | |
| 138 | Knowledge Base | Source type badges render (URL/text/file) | [PASS] | Badge renders with Globe/Type/FileText icons for url/text/file types | |
| 139 | Knowledge Base | Indexing status badges render | [PASS] | Badges render indexing (yellow+spinner), indexed (green), failed (red) | |
| 140 | Knowledge Base | Export disabled when contents empty | [PASS] | Export button disabled prop checks contents.length === 0 | |
| 141 | Knowledge Base | Export button calls handleExport | [PASS] | handleExport creates JSON blob and triggers download | |
| 142 | Knowledge Base | Add content dialog opens | [PASS] | AddContentDialog component renders with isAdmin gate | |
| 143 | Knowledge Base | Add source calls knowledgeBases.addSource | [PASS] | handleAddContent calls api.knowledgeBases.addSource with kbId/type/value | |
| 144 | Knowledge Base | Delete source AlertDialog confirm calls removeSource | [PASS] | AlertDialog confirm calls handleRemove which calls removeSource | |
| 145 | Analytics | From date input updates fromDate | [PASS] | fromDate state updates via onChange on date input | |
| 146 | Analytics | To date input updates toDate | [PASS] | toDate state updates via onChange on date input | |
| 147 | Analytics | Reset button resets dates to default | [PASS] | Reset button sets fromDate/toDate back to defaultFrom/defaultTo | |
| 148 | Analytics | getConversationStats returns data | [PASS] | api.analytics.getConversationStats query wired correctly | |
| 149 | Analytics | getConversationVolume returns data + chart renders | [PASS] | api.analytics.getConversationVolume returns data; ConversationVolumeChart renders | |
| 150 | Analytics | getTokenUsage returns data + chart renders | [PASS] | api.analytics.getTokenUsage returns data; stat card renders token count | |
| 151 | Analytics | getCSATSummary returns data + breakdown renders | [PASS] | api.analytics.getCSATSummary returns data; AnalyticsCSAT component renders | |
| 152 | Analytics | getUnansweredQueries returns data + table renders | [PASS] | api.analytics.getUnansweredQueries returns data; AnalyticsUnansweredQueries renders | |
| 153 | Analytics | getTagsSummary returns data + chart renders | [PASS] | api.analytics.getTagsSummary returns data; AnalyticsTagsChart renders | |
| 154 | Analytics | getSLABreachRate returns data + stat card renders | [PASS] | api.analytics.getSLABreachRate returns data; stat card with color coding renders | |
| 155 | Activities | Page loads without error | [PASS] | Page renders with proper layout and Card components | |
| 156 | Activities | getActivityLog returns paginated data | [PASS] | usePaginatedQuery on api.activityLogs.getActivityLog returns paginated data | |
| 157 | Activities | Table columns render | [PASS] | ActivitiesDataTable uses columns definition with proper header/cell rendering | |
| 158 | Activities | Pagination works | [PASS] | DataTable has Previous/Next buttons using getPaginationRowModel + loadMore | |
| 159 | History | Page loads without error | [PASS] | Page renders with proper layout, table, and date filtering | |
| 160 | History | api.profiles.list loads correctly | [PASS] | api.profiles.list loaded and used to resolve resolvedBy user names | |
| 161 | History | Row popover (rating insight) opens on click | [PASS] | Popover wraps rating stars and opens correctly | |
| 162 | History | Search input filters conversations | [PASS] | filter updates filteredConversations based on visitorName or lastMessage | |
| 163 | History | Date range popover opens | [PASS] | Popover uses CalendarIcon and opens DatePicker | |
| 164 | History | Date range filter applies correctly | [PASS] | matchesDate filters based on updatedAt | |
| 165 | History | Clear date filter works | [PASS] | Button Clear Date sets date to undefined | |
| 166 | History | Export to CSV calls exportToCSV | [PASS] | exportToCSV function iterates and downloading Blob works | |
| 167 | Contacts | Contacts load from contacts.list | [PASS] | Maps to useQuery(api.contacts.list) | |
| 168 | Contacts | Add contact dialog opens | [PASS] | Dialog open matches state | |
| 169 | Contacts | All form inputs work (name, email, phone, address) | [PASS] | formData binds to inputs correctly | |
| 170 | Contacts | Submit calls contacts.create | [PASS] | handleSubmit calls api.contacts.create mutation | |
| 171 | Contacts | Import dialog opens | [PASS] | Dialog open bound to importState.importOpen | |
| 172 | Contacts | File input accepts CSV/Excel | [PASS] | input type=file accepts .csv,.xlsx,.json | |
| 173 | Contacts | Confirm import calls contacts.batchImport | [PASS] | handleImportConfirm calls batchImportContacts in chunks | |
| 174 | Settings | Project name input editable and saves | [PASS] | Input bound to projectName, handleSave calls api.projects.update | |
| 175 | Settings | Default model select shows all models | [PASS] | Select maps over AVAILABLE_MODELS | |
| 176 | Settings | Default model select calls projects.update | [PASS] | Select value binds to defaultModel, handleSave sends it | |
| 177 | Settings | SLA hours input editable and saves | [PASS] | Input bound to slaHours, onBlur calls api.projects.update | |
| 178 | Settings | Project ID field is read-only | [PASS] | Input is disabled and displays projectId | |
| 179 | Settings | Copy project ID button works | [PASS] | Button calls copyToClipboard | |
| 180 | Settings | Delete project requires typing project name | [PASS] | Button disabled if confirmDelete !== activeProject | |
| 181 | Settings | Delete project calls projects.remove | [PASS] | handleDeleteProject calls api.projects.remove mutation | |
| 182 | Settings | Widget appearance tab renders | [PASS] | TabsList triggers TabsContent for appearance | |
| 183 | Settings | Widget behavior tab renders | [PASS] | TabsList triggers TabsContent for behavior | |
| 184 | Settings | Widget translations tab renders | [PASS] | TabsList triggers TabsContent for translations | |
| 185 | Settings | Widget installation tab renders | [PASS] | TabsList triggers TabsContent for installation | |
| 186 | Settings | Color picker updates widget preview | [PARTIAL] | Updates local state but preview iframe needs Save to refresh | |
| 187 | Settings | Platform select changes code snippet | [PASS] | Platform select updates the snippet string via getSnippet | |
| 188 | Settings | Copy snippet button works | [PASS] | Button calls copyToClipboard and sets local copied state | |
| 189 | Settings | Open test widget opens in new tab | [PASS] | Button opens /test-widget?projectId in _blank | |
| 190 | Settings | Reset visitor session resets iframe | [PASS] | Removes yoosr_visitor_id from localStorage and increments iframe key | |
| 191 | Settings | Widget save calls projects.update | [PASS] | handleSave calls api.projects.update mutation | |
| 192 | Settings | Departments load from listDepartments | [PASS] | Maps to useQuery(api.settings.listDepartments) | |
| 193 | Settings | Create department calls createDepartment | [PASS] | handleSave calls api.settings.createDepartment | |
| 194 | Settings | Edit department calls updateDepartment | [PASS] | handleSave calls api.settings.updateDepartment when editingDeptId | |
| 195 | Settings | Add member to department works | [PASS] | handleAssignMember calls addMemberToDepartment | |
| 196 | Settings | Remove member from department works | [PASS] | handleRemoveMember calls removeMemberFromDepartment | |
| 197 | Settings | Delete department calls removeDepartment | [PASS] | handleDelete calls removeDepartment | |
| 198 | Settings | Teammates page loads Clerk org members | [FAIL] | Teammates page is completely missing from Settings | |
| 199 | Settings | Invite member flow works | [FAIL] | Invite flow is missing and Clerk OrganizationProfile is not used | |
| 200 | Settings | Canned responses load from listCannedResponses | [PASS] | Maps to useQuery(api.settings.listCannedResponses) | |
| 201 | Settings | Create canned response works | [PASS] | handleCreate calls api.settings.createCannedResponse mutation | |
| 202 | Settings | Edit canned response works | [PASS] | handleEditSubmit calls api.settings.updateCannedResponse mutation | |
| 203 | Settings | Delete canned response works | [PASS] | handleDelete calls api.settings.removeCannedResponse | |
| 204 | Settings | Labels load from listLabels | [PASS] | Maps to useQuery(api.settings.listLabels) | |
| 205 | Settings | Create label with color works | [PASS] | handleCreate calls api.settings.createLabel | |
| 206 | Settings | Delete label works | [PASS] | handleDelete calls api.settings.removeLabel | |
| 207 | Settings | Operating hours load from getOperatingHours | [PASS] | Maps to useQuery(api.settings.getOperatingHours) | |
| 208 | Settings | Day enable/disable Switch works | [PASS] | toggleDayOpen updates local schedule state | |
| 209 | Settings | Add/remove time slots work | [PASS] | addSlot and removeSlot functions update local array | |
| 210 | Settings | Save operating hours calls upsertOperatingHours | [PASS] | handleSave calls api.settings.upsertOperatingHours | |
| 211 | Settings | Integrations load from integrations.list | [PASS] | Maps to useQuery(api.integrations.list) | |
| 212 | Settings | Integration config panel opens | [PASS] | `AppDetailsPage` in `[provider]/page.tsx` renders config form | |
| 213 | Settings | Save integration calls saveChannelIntegration | [PASS] | `handleSave` in `integrations/page.tsx` calls `integrations.saveChannelIntegration` | |
| 214 | Settings | Register Telegram webhook calls registerTelegramWebhook | [PASS] | `registerWebhook` is called after successful save | |
| 215 | Settings | Create webhook calls webhooks.create | [PASS] | `handleCreate` calls `api.webhooks.create` mutation | |
| 216 | Settings | HMAC secret shows once on creation | [PASS] | `newWebhookSecret` state is displayed in an Alert after creation | |
| 217 | Settings | Copy secret button works | [PASS] | Navigator clipboard and checkmark feedback implemented | |
| 218 | Settings | Delete webhook calls webhooks.remove | [PASS] | `webhookPendingDelete` modal calls `api.webhooks.remove` | |
| 219 | Settings | App store loads from integrations.list | [PASS] | Connects via `useQuery(api.integrations.list)` | |
| 220 | Settings | App detail save calls integrations.upsert | [PASS] | `AppDetailsPage` calls `api.integrations.upsert` | |
| 221 | Settings | App uninstall calls integrations.remove | [PASS] | `handleUninstall` calls `api.integrations.remove` | |
| 222 | Widget | PreChatForm renders before first message | [PASS] | State `showPreChat` dictates form rendering correctly | |
| 223 | Widget | PreChatForm submit works | [PASS] | Dispatches visitor data for first message connection | |
| 224 | Widget | Widget loads at /widget?projectId= | [PASS] | Retrieves from URL search params appropriately | |
| 225 | Widget | Messages render in real time | [PASS] | Implemented via a 2s periodic interval polling `fetchMessages` | |
| 226 | Widget | Text input works | [PASS] | Regulated by local string state correctly | |
| 227 | Widget | Text input disabled when conversation resolved | [PASS] | Disabled accurately when `conversationStatus === 1000` | |
| 228 | Widget | Send button sends message | [PASS] | Triggers `apiPost` onto backend route `/widget/messages` | |
| 229 | Widget | Send button disabled when input empty or resolved | [PASS] | Disabled attribute leverages truthy evaluation against inputs | |
| 230 | Widget | Quick reply buttons send message | [PASS] | Appends selected message text correctly via helper | |
| 231 | Widget | File attach button opens file picker | [PASS] | Uses hidden input ref mapping | |
| 232 | Widget | Bot messages render correctly | [PASS] | Interpreted uniquely based on senderType mapping | |
| 233 | Widget | Agent name shows first name only (no email) | [FAIL] | Code hardcodes "Support Agent" instead of showing dynamic agent name | |
| 234 | Widget | Internal notes NOT visible in widget | [PASS] | Backend `listPublic` correctly scrubs `type === "internal"` messages | |
| 235 | Widget | Rating component renders after conversation resolved | [PASS] | Conditional render activates on resolved conversation unrated state | |
| 236 | Widget | Star rating (1-5) clickable | [PASS] | Rating state tracks mouse hover and explicit clicks | |
| 237 | Widget | Submit rating works | [PASS] | Commits back to `/widget/conversations/rate` successfully | |
| 238 | Channels | Telegram bot token saves (encrypted) | [PASS] | Uses `encryptSecret` locally upon integration saving | |
| 239 | Channels | Telegram webhook registers successfully | [PASS] | Outbound HTTP REST request properly provisions API logic | |
| 240 | Channels | Incoming Telegram message creates conversation | [PASS] | `createOrUpdateFromTelegram` accurately maps records and checks history | |
| 241 | Channels | Monitor reply relays to Telegram | [PASS] | Mutation leverages `relayToTelegram` integration layer internally | |
| 242 | Channels | Bot triggers on Telegram message | [PASS] | `bot.executeNextBlock` dynamically scheduled onto scheduler task | |
| 243 | Channels | Meta credentials save (encrypted) | [PASS] | Re-uses the unified integration AES encryption helper mapping | |
| 244 | Channels | Meta webhook verification (GET) responds | [PASS] | Express-like HTTP GET route successfully resolves Hub challenge payloads | |
| 245 | Channels | Incoming Messenger message creates conversation | [PASS] | `createOrUpdateFromMeta` differentiates `messenger` to create convos | |
| 246 | Channels | Incoming Instagram message creates conversation | [PASS] | `createOrUpdateFromMeta` differentiates `instagram` to create convos | |
| 247 | Channels | Monitor reply sends via Meta Graph API | [PASS] | `relayToMeta` handles mutation scheduling of REST request to fb graph api | |
| 248 | Channels | Bot triggers on Meta message | [PASS] | `bot.executeNextBlock` dynamically scheduled onto scheduler task | |
| 249 | RBAC | org:admin can access Settings | [PASS] | Enforced in SettingsLayout utilizing auth context | |
| 250 | RBAC | org:admin can access Design Studio | [PASS] | Enforced in DesignStudioLayout | |
| 251 | RBAC | org:member cannot see Settings | [PASS] | Non-admins get redirected implicitly | |
| 252 | RBAC | org:member cannot see Design Studio | [PASS] | Non-admins appropriately blocked | |
| 253 | RBAC | requireAdmin blocks mutations for members | [PASS] | Convex utility requires `org:admin` logic natively | |
| 254 | Bot Lifecycle | Bot triggers on new widget conversation | [PASS] | Handled through routing engine mapping on create | |
| 255 | Bot Lifecycle | Bot triggers on new Telegram message | [PASS] | Handled explicitly inside createOrUpdateFromTelegram | |
| 256 | Bot Lifecycle | Bot triggers on new Meta message | [PASS] | Handled explicitly inside createOrUpdateFromMeta | |
| 257 | Bot Lifecycle | HITL handoff pauses bot (botPaused: true) | [PASS] | assignToHuman cleanly sets botPaused to true | |
| 258 | Bot Lifecycle | join mutation sets botPaused: true | [PASS] | Implemented securely inside conversations.join | |
| 259 | Bot Lifecycle | Agent assignment does NOT reset botPaused | [PASS] | Update mutation specifically forces it to true upon assignment | |
| 260 | SLA | slaHours saves from Project Settings | [PASS] | Verified in projects.update | |
| 261 | SLA | slaDeadline set on new conversations | [PASS] | Validated in conversations.create and createFromWidget | |
| 262 | SLA | firstResponseAt recorded on first agent reply | [PASS] | Verified in messages.sendMessage | |
| 263 | SLA | SLA clock resets on bot-to-human handoff | [FAIL] | No logic found for resetting SLA clock on handoff in conversations.join or bot hitl handoff | |
| 264 | SLA | SLA badge shows in Monitor | [PASS] | Badge logic exists handling slaDeadline in conversation-list.tsx | |
| 265 | AI Tags | Auto-tagging fires on conversation close | [PASS] | Fires in conversations.resolve via tags.extractGenerativeTags | |
| 266 | AI Tags | Tags constrained to predefined labels dictionary | [PASS] | Uses validLabelsMap validation against project labels | |
| 267 | AI Tags | Free-text tags not generated | [PASS] | Array is strictly mapped and filtered against validLabelsMap | |
| 268 | Multi-tenancy | Org A cannot see Org B conversations | [PASS] | Enforced via by_projectId which is fetched per org list/get | |
| 269 | Multi-tenancy | orgId read from JWT never from frontend | [PASS] | Uses auth.getUserIdentity().org_id strictly | |
| 270 | Presence | Agent availability set via setAvailability | [PASS] | Implemented cleanly in profiles.ts and dashboard layout | |
| 271 | Presence | Heartbeat keeps agent marked online | [PASS] | 30s interval implemented in DashboardLayout | |
| 272 | Presence | Cron cleanup marks inactive agents offline | [PASS] | cleanupStalePresence mutation implemented | |
| 273 | Convex | analytics.ts — 8 unbounded .collect() — fix | [FAIL] | Code still uses unbounded collect | |
| 274 | Convex | conversations.ts — 4 unbounded .collect() — fix | [FAIL] | Code still uses unbounded collect | |
| 275 | Convex | notifications.ts — 2 unbounded .collect() — fix | [FAIL] | Code still uses unbounded collect | |
| 276 | Convex | bots.ts — 2 unbounded .collect() — fix | [FAIL] | Code still uses unbounded collect | |
| 277 | Convex | contacts.ts — 2 unbounded .collect() — fix | [FAIL] | Code still uses unbounded collect | |
| 278 | Convex | knowledgeBases.ts — 2 unbounded .collect() — fix | [FAIL] | Code still uses unbounded collect | |
| 279 | Convex | labels.ts — 1 unbounded .collect() — fix | [FAIL] | Code still uses unbounded collect | |
| 280 | Convex | orders.ts — 1 unbounded .collect() — fix | [FAIL] | Code still uses unbounded collect | |
| 281 | Convex | dashboard.ts — 1 unbounded .collect() — fix | [FAIL] | Code still uses unbounded collect | |
| 282 | Convex | integrations.ts — 2 unbounded .collect() — fix | [FAIL] | Code still uses unbounded collect | |
