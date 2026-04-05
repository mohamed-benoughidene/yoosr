# Part 14: State Management & Data Fetching

## 📊 Visual Map

```
State Management Layers
├── Convex Client         → Primary data layer
│   ├── ConvexProvider    → React context provider
│   ├── useQuery()        → Reactive data fetching
│   ├── useMutation()     → Data mutations
│   └── Optimistic updates → UI updates before server confirms
│
├── React State           → Component-level state
│   ├── useState()        → Local state
│   ├── useReducer()      → Complex state logic
│   └── useContext()      → Shared state
│
├── Custom Hooks          → Reusable state logic
│   └── src/hooks/        → Hook implementations
│
├── Form State            → Form management
│   └── react-hook-form   → Form state and validation
│
└── URL State             → Search params, route state
    └── useSearchParams() → URL-based state
```

## 📁 File Inventory

| File/Directory | Purpose |
|----------------|---------|
| `src/hooks/` | Custom React hooks |
| `src/context/` | React context providers |
| `src/app/providers.tsx` | App-level providers (if present) |
| `convex/` | Convex queries and mutations (data layer) |

## ✅ Analysis Checklist

- [ ] How is Convex integrated with React?
- [ ] What's the data fetching strategy? (useQuery patterns)
- [ ] Are mutations using useMutation()?
- [ ] Is optimistic UI updates implemented?
- [ ] How is loading state tracked?
- [ ] Are there custom hooks for data fetching?
- [ ] What's in the `src/hooks/` directory?
- [ ] What's in the `src/context/` directory?
- [ ] How is form state managed? (react-hook-form)
- [ ] Is there global state beyond Convex?
- [ ] How is URL search params used for state?
- [ ] Are there any caching patterns?
- [ ] How is pagination state handled?
- [ ] Is there infinite scroll or load more?
- [ ] How are errors surfaced to UI?
- [ ] Are there any derived state patterns?

## 🔗 Dependencies

- **Depends on:** Part 05 (queries), Part 06 (mutations), Part 01 (convex, react deps)
- **Connected to:** Part 13 (pages), Part 15 (features), Part 09 (components)

## 📝 Agent Findings

<!-- Fill in during analysis -->

## 🔍 Key Patterns to Identify

- Data fetching philosophy
- Optimistic UI approach
- Custom hook patterns
- Form state management
- Loading and error state strategies

## ⚠️ Potential Concerns to Watch For

- Over-fetching data
- No optimistic updates
- Missing loading states
- No error boundaries
- Tight coupling between state and UI
- No reusable data fetching hooks
- Inconsistent mutation patterns
- No pagination state management
- Form state anti-patterns
