# Part 04: Database Schema Design

## 📊 Visual Map

```
convex/
└── schema.ts              → Master schema file
    ├── Tables (Convex documents)
    │   ├── users          → User accounts and profiles
    │   ├── contacts       → Contact management
    │   ├── conversations  → Chat conversations
    │   ├── messages       → Chat messages
    │   ├── projects       → Project entities
    │   ├── bots           → Bot configurations
    │   ├── botFlows         → Bot conversation flows
    │   ├── activityLogs   → Audit/activity logging
    │   ├── notifications  → Push/email notifications
    │   ├── knowledgeBases → AI knowledge bases
    │   ├── settings       → Application settings
    │   ├── profiles       → User profiles
    │   ├── orders         → Order management
    │   ├── feedback       → User feedback
    │   ├── tags           → Tagging system
    │   └── labels         → Label/categorization system
    │
    └── Relationships
        ├── References between tables
        ├── Foreign key patterns
        └── Embedded documents
```

## 📁 File Inventory

| File | Purpose |
|------|---------|
| `convex/schema.ts` | Master schema defining all database tables and relationships |

## ✅ Analysis Checklist

- [ ] What tables/collections are defined?
- [ ] What are the fields for each table?
- [ ] What data types are used? (string, number, boolean, arrays, objects)
- [ ] Which fields are indexed for query performance?
- [ ] What relationships exist between tables?
- [ ] Are there foreign key patterns or document references?
- [ ] What validation rules are in place?
- [ ] Are there any embedded/nested documents vs normalized references?
- [ ] What's the naming convention for tables and fields?
- [ ] Are timestamps consistently tracked? (creation, updates)
- [ ] What's the expected data volume for each table?
- [ ] Are there any migration files? (see `migrations.ts`)
- [ ] Is the schema normalized or denormalized? Why?

## 🔗 Dependencies

- **Depends on:** Part 03 (project structure)
- **Connected to:** Part 05 (queries), Part 06 (mutations), Part 07 (auth), Part 14 (state management)

## 📝 Agent Findings

<!-- Fill in during analysis -->

## 🔍 Key Patterns to Identify

- Schema design philosophy (normalized vs denormalized)
- Indexing strategy
- Relationship patterns
- Data modeling conventions
- Timestamp tracking patterns

## ⚠️ Potential Concerns to Watch For

- Missing indexes on frequently queried fields
- N+1 query potential from relationships
- Inconsistent naming conventions
- Missing validation at schema level
- Over- or under-normalization
- No audit trail/logging
- Missing soft-delete patterns
- Inconsistent timestamp handling
