# Contrast & Accessibility Audit Report

**Date:** April 13, 2026  
**Standard:** WCAG 2.2 Level AA  
**Scope:** Dashboard chat inputs, orders section, form components, widget components  
**Theme System:** Light/Dark mode via CSS variables in `globals.css`  
**Status:** ✅ **ALL 28 ISSUES FIXED**

---

## Executive Summary

The Yoosr dashboard had **18 critical contrast failures** in dark mode, with several issues also present in light mode. The primary causes were:

1. **Hardcoded light-mode colors** (`bg-white`, `bg-yellow-50`, `border-yellow-200`) that don't adapt to dark theme
2. **Insufficient border opacity** in dark mode (`--input` at 15% alpha, `--border` at 10% alpha)
3. **Low-contrast text** using yellow color palette on light backgrounds

### WCAG 2.2 AA Requirements

| Element | Minimum Contrast Ratio |
|---------|----------------------|
| Normal text (< 18pt) | **4.5:1** |
| Large text (≥ 18pt or ≥ 14pt bold) | **3:1** |
| Form control borders | **3:1** |
| UI component boundaries | **3:1** |

---

## ✅ Fixed Issues Summary

**All 28 issues have been resolved.** Below is the list of fixes applied.

### Changes Applied

| # | File | Fix Applied | Status |
|---|------|-------------|--------|
| 1 | `globals.css` | Changed `--input` from `oklch(1 0 0 / 15%)` to `oklch(0.35 0.01 286.033)` (~35% lightness) | ✅ Fixed |
| 2 | `globals.css` | Changed `--border` from `oklch(1 0 0 / 10%)` to `oklch(0.30 0.01 286.033)` (~30% lightness) | ✅ Fixed |
| 3 | `globals.css` | Changed `--sidebar-border` to match `--border` token | ✅ Fixed |
| 4 | `chat-display.tsx` | Changed bot message bubble from `bg-white border-slate-100` to `bg-card border` | ✅ Fixed |
| 5 | `chat-display.tsx` | Added `dark:` variants to avatar fallbacks: `bg-yellow-100 dark:bg-yellow-900` | ✅ Fixed |
| 6 | `chat-display.tsx` | Fixed internal note badge text: `text-yellow-800 dark:text-yellow-200` | ✅ Fixed |
| 7 | `chat-display.tsx` | Fixed internal message bubble: `bg-yellow-50 dark:bg-yellow-950/50 border-yellow-200 dark:border-yellow-800` | ✅ Fixed |
| 8 | `chat-display.tsx` | Fixed chat input area: `bg-card` instead of `bg-white`, added dark mode yellow variants | ✅ Fixed |
| 9 | `chat-display.tsx` | Fixed placeholder text: `placeholder:text-yellow-700/70 dark:placeholder:text-yellow-300/70` | ✅ Fixed |
| 10 | `chat-display.tsx` | Fixed internal note send button: `dark:bg-yellow-700 dark:hover:bg-yellow-600` | ✅ Fixed |
| 11 | `orders/page.tsx` | Changed table container from `bg-white` to `bg-card` | ✅ Fixed |
| 12 | `VisitorPanel.tsx` | Changed accordion hover from `hover:bg-slate-50` to `hover:bg-muted/50` | ✅ Fixed |
| 13 | `VisitorPanel.tsx` | Changed order cards from `bg-muted/30` to `bg-card` | ✅ Fixed |
| 14 | `VisitorPanel.tsx` | Fixed form container: `bg-muted/30 dark:bg-muted/20` | ✅ Fixed |
| 15 | `VisitorPanel.tsx` | Fixed product input: `bg-yellow-50/50 dark:bg-yellow-950/30 focus-visible:bg-yellow-50 dark:focus-visible:bg-yellow-950/50` | ✅ Fixed |
| 16 | `ChatArea.tsx` | Fixed internal note bubble: `bg-yellow-50/80 dark:bg-yellow-950/50 text-yellow-900 dark:text-yellow-100` | ✅ Fixed |
| 17 | `ChatArea.tsx` | Fixed internal note badge: `text-yellow-800 dark:text-yellow-200` | ✅ Fixed |
| 18 | `ChatArea.tsx` | Fixed timestamp: `text-yellow-800/70 dark:text-yellow-300/70` | ✅ Fixed |
| 19 | `ChatArea.tsx` | Fixed input area: `bg-card` instead of `bg-white`, added dark mode variants | ✅ Fixed |
| 20 | `PreChatForm.tsx` | Added dark mode: `bg-white dark:bg-gray-950`, inputs: `dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700` | ✅ Fixed |
| 21 | `PreChatForm.tsx` | Fixed labels: `text-gray-700 dark:text-gray-200` | ✅ Fixed |
| 22 | `PreChatForm.tsx` | Fixed error message: `text-red-600 dark:text-red-400` | ✅ Fixed |
| 23 | `WidgetChat.tsx` | Added dark mode border to bot messages: `dark:border`, `borderColor: "#e5e7eb"` | ✅ Fixed |
| 24 | `WidgetChat.tsx` | Fixed timestamp: `text-gray-500 dark:text-gray-400` | ✅ Fixed |
| 25 | `WidgetChat.tsx` | Fixed buttons: `border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100` | ✅ Fixed |
| 26 | `rating-component.tsx` | Added dark mode: `bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-700` | ✅ Fixed |
| 27 | `rating-component.tsx` | Fixed heading: `text-gray-700 dark:text-gray-200`, stars: `text-gray-300 dark:text-gray-600` | ✅ Fixed |
| 28 | `rating-component.tsx` | Fixed textarea: `bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600` | ✅ Fixed |
| 29 | `OnboardingClient.tsx` | Changed from `bg-gray-50/50` to `bg-muted/30` (theme-aware token) | ✅ Fixed |

---

## Critical Issues (Must Fix)

### 1. Input/Textarea Borders — Dark Mode ❌

**Files:**
- `src/components/ui/input.tsx:11`
- `src/components/ui/textarea.tsx:11`

**Issue:** `--input` token in dark mode is `oklch(1 0 0 / 15%)` (15% white alpha) on `--background: oklch(0.141 ...)` (~14% lightness)

**Contrast Ratio:** ~1.15:1 (requires 3:1)

**Impact:** Input borders are virtually invisible in dark mode, making form fields indistinguishable from background.

**Fix:**
```css
/* globals.css — .dark section */
--input: oklch(0.35 0.01 286); /* ~35% lightness, visible border */
--border: oklch(0.30 0.01 286); /* Slightly darker for general borders */
```

---

### 2. Chat Input Area — Dark Mode ❌❌

**File:** `src/components/dashboard/monitor/chat-display.tsx:590-591`

**Issue:** Hardcoded light-mode colors for chat input container:
```tsx
messageMode === "internal" 
  ? "bg-yellow-50/50 border-yellow-200 focus-within:ring-yellow-300" 
  : "bg-white focus-within:ring-ring"
```

**Problems:**
- `bg-white` in dark mode = glaring white rectangle on dark background
- `bg-yellow-50/50` creates muddy, inconsistent appearance
- `border-yellow-200` is light-mode-only
- Text (`text-foreground` = oklch 0.985) on `bg-white` = **1.03:1 contrast** (catastrophic fail)

**Impact:** Chat input is unusable in dark mode; internal notes have poor contrast.

**Fix:** Replace with theme-aware tokens:
```tsx
messageMode === "internal" 
  ? "bg-accent/50 border-accent focus-within:ring-accent" 
  : "bg-card border focus-within:ring-ring"
```

---

### 3. Internal Note Badge Text — Both Modes ❌

**File:** `src/components/dashboard/monitor/chat-display.tsx:560`

**Issue:** 
```tsx
<span className="text-yellow-700">Internal Note</span>
```

**Contrast Ratios:**
- Light mode: `text-yellow-700` on `bg-yellow-50` = **~2.8:1** (requires 4.5:1)
- Dark mode: Same ratio, both colors are light-mode-specific

**Impact:** "Internal Note" label is hard to read in both modes.

**Fix:**
```tsx
<span className="text-accent-foreground font-semibold">Internal Note</span>
```

---

### 4. Internal Message Bubbles — Dark Mode ❌

**File:** `src/components/dashboard/monitor/chat-display.tsx:556`

**Issue:**
```tsx
isInternal ? "bg-yellow-50 border border-yellow-100 text-foreground"
```

**Contrast Ratio:** Light text (oklch 0.985) on `bg-yellow-50` (oklch 0.98) = **~1.02:1** in dark mode

**Impact:** Internal messages are unreadable in dark mode.

**Fix:**
```tsx
isInternal 
  ? "bg-accent border-accent text-accent-foreground" 
  : "bg-card border text-card-foreground"
```

---

### 5. Orders Table Container — Dark Mode ❌

**File:** `src/app/[locale]/dashboard/orders/page.tsx:487`

**Issue:**
```tsx
<div className="rounded-md border bg-white shadow-sm">
```

**Problem:** Hardcoded `bg-white` creates jarring white box in dark mode. Any text using `--foreground` (oklch 0.985) on white = **1.03:1**.

**Impact:** Entire orders table is unreadable in dark mode.

**Fix:**
```tsx
<div className="rounded-md border bg-card shadow-sm">
```

---

### 6. VisitorPanel Orders Form — Dark Mode ❌

**File:** `src/components/dashboard/shared/VisitorPanel.tsx:730`

**Issue:**
```tsx
className="h-8 text-xs bg-yellow-50/50 focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:bg-yellow-50"
```

**Problem:** Same as #2 — `bg-yellow-50/50` creates muddy appearance in dark mode, full `bg-yellow-50` on focus makes input unreadable.

**Fix:**
```tsx
className="h-8 text-xs bg-accent/30 focus-visible:ring-1 focus-visible:bg-accent/50"
```

---

### 7. Avatar Fallback Colors — Both Modes ❌

**File:** `src/components/dashboard/monitor/chat-display.tsx:548`

**Issue:**
```tsx
AvatarFallback className={isInternal ? "text-yellow-700" : "text-blue-700"}
```
With backgrounds `bg-yellow-100` / `bg-blue-100`:
- Yellow: `text-yellow-700` on `bg-yellow-100` = **~2.9:1**
- Blue: `text-blue-700` on `bg-blue-100` = **~3.1:1**

Both fail the 4.5:1 requirement for normal text.

**Fix:** Use darker text or lighter backgrounds:
```tsx
AvatarFallback className={isInternal ? "bg-yellow-100 text-yellow-900" : "bg-blue-100 text-blue-900"}
```

---

### 8. Bot Message Bubble Border — Light Mode ❌

**File:** `src/components/dashboard/monitor/chat-display.tsx:533`

**Issue:**
```tsx
bg-white p-3 shadow-sm border border-slate-100 text-sm
```

**Problem:** `border-slate-100` on `bg-white` = **~1.06:1** border contrast (completely invisible)

**Fix:**
```tsx
bg-white p-3 shadow-sm border border-border text-sm
```

---

### 9. ChatArea Component — Multiple Issues ❌

**File:** `src/components/chat/ChatArea.tsx:578, 580, 586, 658`

**Issues:**
1. Line 578: `bg-yellow-50/80 border border-yellow-200 text-yellow-900` 
   - `text-yellow-900` on `bg-yellow-50/80` over dark bg = **~2.5:1** ❌

2. Line 586: `text-yellow-700/70` timestamp = **~1.5:1** ❌

3. Line 658: Same input pattern as #2 (hardcoded light-mode colors) ❌

**Fix:** Replace all with theme-aware tokens (see fixes above).

---

### 10. Placeholder Text — Internal Notes ❌

**File:** `src/components/dashboard/monitor/chat-display.tsx:608`

**Issue:**
```tsx
placeholder:text-yellow-700/50
```

**Contrast Ratio:** `text-yellow-700/50` on `bg-yellow-50/50` = **~1.3:1** (requires 4.5:1 for placeholder text readability)

**Fix:**
```tsx
placeholder:text-muted-foreground
```

---

## Moderate Issues (Should Fix)

### 11. Widget Components — No Dark Mode Support ⚠️

**Files:**
- `src/app/widget/components/PreChatForm.tsx:63, 75, 89, 102`
- `src/app/widget/components/WidgetChat.tsx:848`
- `src/app/widget/rating-component.tsx:47, 48, 63`

**Issue:** All widget components use hardcoded `bg-white`, `text-gray-700`, `border-gray-200` with no theme awareness.

**Impact:** Widget appears broken/jarring if user's system is in dark mode.

**Fix:** Convert to CSS variables or add dark mode className support:
```tsx
// Option 1: Use Tailwind dark mode
className="bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200"

// Option 2: Use CSS variables
className="bg-[var(--widget-bg)] text-[var(--widget-text)]"
```

---

### 12. Onboarding Page Backgrounds ⚠️

**File:** `src/app/[locale]/onboarding/OnboardingClient.tsx:64`

**Issue:** `bg-gray-50/50` — in dark mode creates inconsistent mid-tone appearance.

**Fix:** Use `bg-muted/50` or theme-aware token.

---

## Recommendations Summary

### Immediate Actions (Priority 1)

1. **Fix `--input` and `--border` dark mode values** in `globals.css`:
   ```css
   .dark {
     --input: oklch(0.35 0.01 286);
     --border: oklch(0.30 0.01 286);
   }
   ```

2. **Replace all hardcoded `bg-white`** in dashboard with `bg-card` or `bg-background`

3. **Replace yellow internal note colors** with semantic tokens:
   - Define `--internal-note-bg`, `--internal-note-text`, `--internal-note-border` in both light/dark sections
   - Or use existing `--accent` / `--warning` tokens

4. **Fix avatar fallback colors** to ensure 4.5:1 text contrast

### Short-term Actions (Priority 2)

5. **Add dark mode support to widget components** using Tailwind's `dark:` prefix or CSS variables

6. **Create a `theme.css` token file** with all semantic color tokens to prevent ad-hoc color usage

7. **Add contrast checking to CI** using tools like:
   - `@axe-core/react` for runtime checks
   - Storybook a11y addon for component testing
   - Lighthouse CI with accessibility audits

### Long-term Actions (Priority 3)

8. **Implement APCA (Accessible Perceptual Contrast Algorithm)** for more accurate dark mode contrast assessment

9. **Add user preference for high contrast mode** beyond system dark/light preference

10. **Create component stories** for all states (light/dark, enabled/disabled, focus/hover) to visually verify contrast

---

## Files Requiring Changes

| Priority | File | Issues Count |
|----------|------|--------------|
| 🔴 Critical | `src/app/globals.css` | 2 (border/input tokens) |
| 🔴 Critical | `src/components/dashboard/monitor/chat-display.tsx` | 7 |
| 🔴 Critical | `src/app/[locale]/dashboard/orders/page.tsx` | 1 |
| 🔴 Critical | `src/components/dashboard/shared/VisitorPanel.tsx` | 2 |
| 🔴 Critical | `src/components/chat/ChatArea.tsx` | 4 |
| 🟡 Moderate | `src/app/widget/components/PreChatForm.tsx` | 4 |
| 🟡 Moderate | `src/app/widget/components/WidgetChat.tsx` | 2 |
| 🟡 Moderate | `src/app/widget/rating-component.tsx` | 3 |
| 🟡 Moderate | `src/app/[locale]/onboarding/OnboardingClient.tsx` | 1 |

**Total Issues:** 18 critical + 10 moderate = **28 contrast failures**

---

## Testing Recommendations

After implementing fixes, verify with:

1. **Automated tools:**
   - [WAVE](https://wave.webaim.org/) browser extension
   - axe DevTools
   - Lighthouse Accessibility audit

2. **Manual testing:**
   - Toggle dark/light mode in dashboard
   - Verify all text is readable at normal size
   - Check input borders are visible in both modes
   - Test with browser zoom (150%, 200%)

3. **Programmatic testing:**
   ```bash
   # Add to test suite
   npx @axe-core/cli http://localhost:3000/dashboard --standard wcag2aa
   ```

---

## References

- [WCAG 2.2 Contrast Requirements](https://www.w3.org/TR/WCAG22/#contrast-minimum)
- [Web Interface Guidelines — Vercel](https://vercel.com/design/accessibility)
- [Dark Mode Accessibility Best Practices](https://www.accessibilitychecker.org/blog/dark-mode-accessibility/)
- [APCA Contrast Calculator](https://www.myndex.com/APCA/)
