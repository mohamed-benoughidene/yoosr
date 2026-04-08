# Widget Multilingual Text Fields

## Overview

The widget settings page currently stores text fields (headerTitle, welcomeMessage, onlineStatus, preChatTitle, preChatSubtitle, startChat) as a single flat object — one value per field regardless of language. When the user changes the project language (via General Settings), the widget loads a different i18n translation file (en.json, ar.json, fr.json), but the custom text overrides in the settings form remain language-agnostic. This means custom text entered by the user appears the same regardless of the active language, defeating the purpose of multilingual support.

Additionally, the PreChatForm component has hardcoded English strings for "Name", "Email", "Start Chat", and validation messages that are not connected to i18n at all.

This feature makes widget text fields multilingual: each text field stores a value per language (en, ar, fr), and the settings UI displays the appropriate set of fields based on the active project language. The PreChatForm is fixed to use i18n translation keys instead of hardcoded English strings.

## Scope / Non-Scope

### In Scope

- Database schema change: `translations` object inside `widgetConfig` becomes nested per language: `{ headerTitle: { en: "...", ar: "...", fr: "..." }, ... }`
- Backward-compatible migration: existing flat `translations` values are migrated to `en` entries
- Settings UI: text field inputs now show/hide based on the active project language (`widgetLocale`). Each field's value is read/written for the active language key
- Form validation schema (Zod) updated to support nested per-language structure
- Widget runtime (WidgetChat.tsx, PreChatForm.tsx): text resolution reads the value for the active language, with English fallback if the active language value is empty
- PreChatForm hardcoded English strings replaced with i18n translation keys (`useTranslations("widget")`)
- The `onlineStatus` and `startChat` fields remain in the schema but do NOT get new form inputs in this work (they already exist in DB/form defaults)

### Out of Scope

- Adding new languages beyond en, ar, fr
- Adding form inputs for `onlineStatus` and `startChat` (deferred)
- Making PreChatForm field labels (Name, Email, etc.) editable in settings — they will use i18n defaults only
- Changes to the embeddable widget loader (`widget.js`)
- Changes to the project language selection UI (General Settings page)

## Requirements

### R1: Database Schema — Nested Per-Language Translations

The `translations` object inside `projects.widgetConfig` shall be restructured so that each text field contains a nested object with `en`, `ar`, and `fr` keys:

```json
{
  "translations": {
    "headerTitle": { "en": "Chat with us", "ar": "دردش معنا", "fr": "Discutez avec nous" },
    "welcomeMessage": { "en": "Hi! How can we help?", "ar": "...", "fr": "..." },
    "onlineStatus": { "en": "...", "ar": "...", "fr": "..." },
    "preChatTitle": { "en": "...", "ar": "...", "fr": "..." },
    "preChatSubtitle": { "en": "...", "ar": "...", "fr": "..." },
    "startChat": { "en": "...", "ar": "...", "fr": "..." }
  }
}
```

### R2: Backward-Compatible Migration

Projects with the legacy flat `translations` format (`{ headerTitle: "..." }`) shall be migrated so that the existing value becomes the `en` entry, and `ar` / `fr` entries are initialized as empty strings.

### R3: Settings UI — Language-Aware Field Display

The widget settings page (`/dashboard/settings/widget`) shall display text input fields for the active project language only. The active language is determined by `widgetLocale` (from the project). If `widgetLocale` is unset (auto mode), English is used as the default.

- Switching the project language in General Settings changes which set of fields are shown in the widget settings Text tab
- Each field saves/reads the value for the active language key
- Fields for all 6 translation keys exist in the UI but only 4 have visible inputs in this phase: `headerTitle`, `welcomeMessage`, `preChatTitle`, `preChatSubtitle`

### R4: Form Validation

The Zod schema for widget settings shall validate the nested per-language structure. Validation rules (required, max length) apply per language entry.

### R5: Widget Runtime — Language-Aware Text Resolution

The widget iframe page and components shall resolve text by reading the value for the active language from the nested `translations` object. If the active language value is empty or missing, fall back to the English value. If English is also empty, fall back to the i18n translation file default.

Priority chain for each text field:
1. Custom translation for active language: `translations[field][activeLocale]`
2. English fallback: `translations[field]["en"]`
3. i18n translation default: `t(field)`
4. Hardcoded English default

### R6: PreChatForm i18n Fix

All hardcoded English strings in PreChatForm.tsx ("Name", "Email", "Start Chat", validation messages) shall be replaced with `useTranslations("widget")` calls using appropriate keys. The corresponding keys shall be added to `messages/ar.json` and `messages/fr.json` if not already present.

### R7: No Breaking Changes to External API

The `getPublic` project query and the widget iframe loading mechanism shall continue to function without requiring changes to the embed snippet or external consumers.

## Acceptance Criteria

### AC1
When the project language is set to Arabic, the widget settings Text tab displays input fields for Arabic values (placeholder text in Arabic, field labels still in English as UI chrome).

### AC2
When the project language is set to French, the widget settings Text tab displays input fields for French values.

### AC3
Saving settings for a language only updates that language's values — other languages' values are preserved unchanged.

### AC4
A visitor viewing the widget sees text in the project's configured language. If a custom value for that language is empty, the English custom value is shown. If English is also empty, the i18n default is shown.

### AC5
PreChatForm displays "Name", "Email", "Start Chat", and validation messages in the active widget language (Arabic when `widgetLocale` is "ar", French when "fr", English otherwise).

### AC6
Projects with existing flat `translations` data are automatically migrated: the old value becomes the `en` entry, and `ar` / `fr` are initialized as empty strings.

### AC7
TypeScript compilation passes with no errors. `bun run lint` passes. `bun run test` passes.

## Plan References

- `docs/specs/plans/010_widget-multilingual-text-fields.plan.md`
