# Widget Multilingual Text Fields Plan

## Phase 1 — Schema + Types + Migration

### Tasks

<!-- Mark each task [x] immediately after it is complete. -->

- [x] `P1.T1` Update `convex/schema.ts`: change `widgetConfig.translations` from flat fields to nested per-language structure (`{ headerTitle: { en: v.string(), ar: v.string(), fr: v.string() }, ... }`) for all 6 fields
- [x] `P1.T2` Update Zod validation schema in `src/app/[locale]/dashboard/settings/widget/schema.ts` to support nested per-language structure (`translations.headerTitle` becomes `translations: z.object({ headerTitle: z.object({ en: z.string(), ar: z.string(), fr: z.string() }), ... })`)
- [x] `P1.T3` Create migration in `convex/migrations.ts` to convert existing flat `translations` to nested format: old value → `en`, initialize `ar` and `fr` as empty strings
- [x] `P1.T4` Update `convex/projects.ts` `updateWidgetLocale` mutation if needed to ensure new language entries are initialized on projects with existing data

### Expected Files

- `convex/schema.ts`
- `src/app/[locale]/dashboard/settings/widget/schema.ts`
- `convex/migrations.ts`
- `convex/projects.ts`

### Validation

- `bun run type-check` (or `npx tsc --noEmit`)
- `bun run lint`

### Gate

- Schema accepts nested per-language translations
- Zod schema validates nested structure
- Migration converts flat → nested without data loss
- No TypeScript errors

---

## Phase 2 — Settings UI — Language-Aware Form

### Tasks

- [x] `P2.T1` Update widget settings page (`src/app/[locale]/dashboard/settings/widget/page.tsx`): read active language from project `widgetLocale` (fetch via Convex query); default to `"en"` if unset
- [x] `P2.T2` Update form inputs for the 4 visible fields (`headerTitle`, `welcomeMessage`, `preChatTitle`, `preChatSubtitle`) to read/write `translations[field][activeLocale]` instead of `translations[field]`
- [x] `P2.T3` Update form submit handler to construct the nested `translations` object with values for all 3 languages (preserve untouched languages, update only active language values)
- [x] `P2.T4` Add a language indicator in the Text tab showing which language's fields are currently being edited (e.g., "Editing: English" or "Editing: العربية")
- [x] `P2.T5` Ensure form validation errors display per the active language field

### Expected Files

- `src/app/[locale]/dashboard/settings/widget/page.tsx`

### Validation

- `bun run lint`
- Manual test: switch project language in General Settings → open widget settings → verify correct language fields shown

### Gate

- Settings form displays language-specific fields
- Saving updates only the active language's values
- Other languages' values are preserved
- Form validation works correctly

---

## Phase 3 — Widget Runtime — Language-Aware Text Resolution

### Tasks

- [x] `P3.T1` Update `src/app/widget/components/WidgetChat.tsx`: change text resolution logic to read `translations[field][activeLocale]`, fall back to `translations[field]["en"]`, then `t(field)`, then hardcoded default
- [x] `P3.T2` Update `src/app/widget/page.tsx` if needed to pass the active locale and full `translations` object to WidgetChat
- [x] `P3.T3` Verify `convex/projects.ts` `getPublic` returns the full nested `translations` object (no changes needed if already returning `widgetConfig`)
- [x] `P3.T4` Update `public/widget.js` if needed to pass locale through (likely no change needed — locale is determined server-side in widget page)

### Expected Files

- `src/app/widget/components/WidgetChat.tsx`
- `src/app/widget/page.tsx`
- `convex/projects.ts` (verify only)

### Validation

- `bun run lint`
- Manual test: set project language to Arabic with custom Arabic text → open widget → verify Arabic text appears
- Manual test: set project language to Arabic but leave Arabic field empty → verify English fallback appears

### Gate

- Widget displays text in the active project language
- English fallback works when active language value is empty
- i18n default fallback works when both custom values are empty

---

## Phase 4 — PreChatForm i18n Fix

### Tasks

- [x] `P4.T1` Update `src/app/widget/components/PreChatForm.tsx`: replace hardcoded "Name" label with `t("preChatForm.nameLabel")` (or equivalent key)
- [x] `P4.T2` Replace hardcoded "Email" label with `t("preChatForm.emailLabel")`
- [x] `P4.T3` Replace hardcoded "Start Chat" button text with `t("preChatForm.startChat")` or use `translations.startChat[activeLocale]` fallback chain
- [x] `P4.T4` Replace hardcoded validation messages ("Please enter your name", "Please enter a valid email") with i18n keys
- [x] `P4.T5` Add missing translation keys to `messages/ar.json` and `messages/fr.json` for all new PreChatForm strings
- [x] `P4.T6` Ensure PreChatForm receives the active locale and uses `useTranslations("widget")` (may need NextIntlClientProvider context — verify it's available in the widget iframe)

### Expected Files

- `src/app/widget/components/PreChatForm.tsx`
- `messages/ar.json`
- `messages/fr.json`
- `messages/en.json` (add new keys if missing)

### Validation

- `bun run lint`
- `bun run test`
- Manual test: open widget in Arabic → verify PreChatForm labels are in Arabic
- Manual test: open widget in French → verify PreChatForm labels are in French

### Gate

- PreChatForm has zero hardcoded English strings
- All text resolves through i18n with correct Arabic and French translations
- Tests pass

---

## Phase 5 — Hardening + Verification

### Tasks

- [x] `P5.T1` Run full test suite: `bun run test`
- [x] `P5.T2` Run lint: `bun run lint`
- [x] `P5.T3` Run type check: `npx tsc --noEmit`
- [ ] `P5.T4` End-to-end manual test: create a project → set language to Arabic → fill in Arabic text fields → save → open widget → verify all text is Arabic → switch to French → verify French text → switch back to Arabic → verify Arabic text preserved
- [ ] `P5.T5` Verify migration works: check that projects with legacy flat translations are correctly migrated
- [x] `P5.T6` Add unit tests for the text resolution fallback logic (active → en → i18n → default)

### Expected Files

- `src/app/widget/components/__tests__/` (new test file for text resolution)

### Validation

- `bun run test` — all passing
- `bun run lint` — no errors
- `npx tsc --noEmit` — no errors

### Gate

- All automated tests pass
- All manual acceptance criteria (AC1–AC7) verified
- No regressions in existing widget functionality

---

## Blockers

- None currently.
