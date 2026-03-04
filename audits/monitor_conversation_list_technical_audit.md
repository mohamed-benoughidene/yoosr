# Monitor Conversation List Technical Audit

Performed on: 2026-03-04

---

### 1. Search Fields
Based on the `Conversation` interface in `conversation-list.tsx`, the following fields are available for searching:
- **Primary Search Fields**:
  - `user.name` (Visitor's full name)
  - `user.email` (Visitor's email address)
  - `lastMessage` (Snippet of the last message sent)
- **Secondary Search Fields**:
  - `details.department` (Department name)
  - `channel` (Source: web, whatsapp, facebook, email)
  - `tags` (Array of labels applied)

---

### 2. Dept Filter UI
- **Implementation**: Uses a `DropdownMenu` component.
- **Option Visibility**: Iterates through the `departments` query result.
- **Data Access**: The component has access to the full department object, including `_id` and `name`.
- **Current JSX**:
  ```tsx
  <DropdownMenu>
      <DropdownMenuTrigger asChild>
          <Button
              variant={activeDept ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs shrink-0"
          >
              <Filter className="mr-2 h-3 w-3" />
              {activeDept ? `Dept: ${activeDept}` : "Dept"}
          </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]" align="start">
          <DropdownMenuLabel className="text-xs font-medium">Filter by department</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setActiveDept(null)} className="text-xs">
              All Departments
          </DropdownMenuItem>
          {departments?.map((dept) => (
              <DropdownMenuItem
                  key={dept._id}
                  onClick={() => setActiveDept(dept.name)}
                  className="text-xs"
              >
                  <div className="flex items-center justify-between w-full">
                      <span className="truncate">{dept.name}</span>
                      {activeDept === dept.name && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                  </div>
              </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
  </DropdownMenu>
  ```

---

### 3. Agent Filter UI Pattern
The codebase uses **Clerk Organizations** to manage agents. 
- **Existing Pattern**: Found in `ChatDisplay.tsx`, it uses the `useOrganization` hook from `@clerk/nextjs`.
- **Logic**:
  ```tsx
  const { memberships } = useOrganization({ 
      memberships: { infinite: true, pageSize: 50 } 
  });

  const projectMembers = (memberships?.data ?? []).map(m => ({
      userId: m.publicUserData?.userId ?? "",
      profile: {
          fullName: `${m.publicUserData?.firstName ?? ''} ${m.publicUserData?.lastName ?? ''}`.trim() || m.publicUserData?.identifier || 'Agent',
          avatarUrl: m.publicUserData?.imageUrl,
      },
      role: m.role,
  }));
  ```
- **Recommendation**: The `ConversationList` should adopt this pattern to fetch and list available agents for filtering.

---

### 4. Status Filter UI
- **Implementation**: Currently a plain, non-interactive button.
- **State/Handlers**: None. It has no click handler and is not connected to any filter logic.
- **Current JSX**:
  ```tsx
  <Button variant="outline" size="sm" className="h-8 text-xs shrink-0">
      <SlidersHorizontal className="mr-2 h-3 w-3" />
      Status
  </Button>
  ```

---

### 5. SLA Sort Logic
- **Current Pattern**: Uses a `sortBy` state with a `DropdownMenu`.
- **Sort Handler**: Implemented in the `filteredItems` calculation.
- **Current JSX**:
  ```tsx
  <DropdownMenu>
      <DropdownMenuTrigger asChild>
          <Button
              variant={sortBy === "priority" ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs shrink-0"
          >
              <SlidersHorizontal className="mr-2 h-3 w-3" />
              {sortBy === "priority" ? "Sort: Priority" : "Sort: Recent"}
          </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[150px]">
          <DropdownMenuLabel className="text-xs font-medium">Sort by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setSortBy("timestamp")} className="text-xs">
              Recent
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSortBy("priority")} className="text-xs">
              Priority
          </DropdownMenuItem>
      </DropdownMenuContent>
  </DropdownMenu>
  ```
- **Sort Logic**:
  ```tsx
  .sort((a, b) => {
      if (sortBy === "priority") {
          const priorityA = a.priority || "normal";
          const priorityB = b.priority || "normal";
          if (priorityOrder[priorityA] !== priorityOrder[priorityB]) {
              return priorityOrder[priorityA] - priorityOrder[priorityB];
          }
      }
      return b.timestamp - a.timestamp;
  });
  ```
- **Consistent SLA Integration**: To add SLA sort, a new literal "sla" should be added to the `sortBy` state, a new `DropdownMenuItem` added to the menu, and a sort condition added to the `.sort()` block using `a.slaDeadline`.
