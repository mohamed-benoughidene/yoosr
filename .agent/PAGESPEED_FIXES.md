# Yoosr PageSpeed / Lighthouse Report — Problems & What They Mean (Mar 31, 2026)

Source: the PageSpeed Insights export for `https://yoosr.vercel.app/en` (23 pages).
Key scores (page 2):
- Performance: **67**
- Accessibility: **96**
- Best Practices: **96**
- SEO: **100**

The main issues are performance (especially **LCP**) and missing security headers (CSP / Trusted Types), plus a couple of concrete asset errors.

---

## 1) Performance (Score 67) — What’s hurting it

### 1.1 Largest Contentful Paint (LCP) is slow
From page 2:
- **FCP:** 4.6s
- **LCP:** 5.8s (this is the big one)
- **TBT:** 20ms (JS isn’t blocking much)
- **CLS:** 0 (layout stability is good)

**Interpretation**
- Your JS is not the problem (low TBT).
- The page becomes “visibly useful” late mainly due to **render-blocking resources, fonts, and initial navigation latency**, not main-thread blocking.

---

## 2) Render-blocking requests (Est. savings ~2,120ms)

Page 3 shows:
- **“Render blocking requests — Est savings of 2,120 ms”**
- Critical path includes CSS chunks and Google Fonts CSS.

Also page 4 “critical request chain” indicates:
- `…chunks/2473c16c0c2f6b5f.css` (small but still in chain)
- `…chunks/ab4a154c21a9e461.css` (~31.9 KiB)
- Multiple `fonts.googleapis.com/css2?...` requests
- Then `fonts.gstatic.com` `.woff2` downloads (notably ~79KB and ~72KB)

**Why this is bad**
- CSS and font CSS are requested early and block first render.
- Font files (woff2) are large and are in the LCP critical chain, pushing LCP out.

**What to fix**
- Reduce critical CSS size (split non-above-the-fold CSS).
- Consider self-hosting fonts or reducing font families/weights.
- Ensure `font-display: swap` (Lighthouse notes font display checks—page 7; it says “Consider setting font-display to swap or optional…”, even though your Google Fonts URLs show `display=optional` in some cases; ensure it’s consistent and not overridden).
- Verify you aren’t loading more font subsets than needed (Arabic + mono + others).

---

## 3) Document request latency + redirects (Est. savings ~470ms)

Page 3:
- **“Document request latency — Est savings of 470 ms”**
- It explicitly says: **“Had redirects (3 redirects, +472 ms)”**
- Server response is fast (observed **8ms**), compression is on.

**Why this matters**
- Redirect chains delay the first byte of the *final* HTML and delay discovering CSS/fonts/JS.
- Even with a fast server, redirects add unavoidable round-trips on mobile networks.

**What to fix**
- Remove redirect chain so the first navigation goes directly to the final URL.
  - Common causes: `http -> https`, non-www -> www, missing trailing slash, locale routing `/` -> `/en`, etc.
- Ensure your canonical entrypoint is the one you share and the one search/social link to.

---

## 4) Forced reflow (layout thrash) — flagged

Page 3 shows:
- **“Forced reflow … can result in poor performance”**
- It references call sites in JS bundles (e.g. `…chunks/fa1b6eb866dec702.js:322:6064`).

**Why this matters**
- Forced reflows happen when code reads layout (like `offsetWidth`) after modifying DOM/styles, causing synchronous layout calculation.
- This can create intermittent jank and sometimes delays rendering of important elements.

**What to fix**
- In the components that animate/measure layout:
  - batch DOM reads, then batch DOM writes
  - prefer `requestAnimationFrame`
  - avoid repeatedly measuring in scroll/resize handlers without throttling
- Use Chrome Performance panel to pinpoint which code triggers those reads (Lighthouse only gives a hint to bundle location).

---

## 5) Unused JavaScript (Est. savings ~26KiB) + “Legacy JavaScript” (Est. savings ~14KiB)

Page 5:
- **“Reduce unused JavaScript — Est savings of 26 KiB”**

Page 4:
- **“Legacy JavaScript — Est savings of 14 KiB”**
- It lists polyfills for modern features (`Array.prototype.at`, `flat`, `flatMap`, `Object.fromEntries`, etc.) (page 5)

**Why this matters**
- Not huge, but it’s “easy wins”: shipping less JS improves load/parse time and can reduce long-tail mobile slowdowns.

**What to fix**
- Ensure Next.js output targets modern browsers appropriately (avoid unnecessary transpilation/polyfills).
- Check if a dependency forces legacy polyfills into the bundle.
- Use dynamic import for code not needed on landing.

---

## 6) Minify CSS (Est. savings ~2KiB) + Reduce unused CSS

Page 6:
- **“Minify CSS — Est savings of 2 KiB”**

Page 8:
- “Reduce unused CSS” is listed in diagnostics.

**Why this matters**
- Small savings but related to render-blocking CSS.
- If CSS is in the critical path, every KB matters more.

**What to fix**
- Confirm CSS is minified in production build (it should be, but this report suggests some CSS could be smaller).
- Reduce above-the-fold CSS to only what’s needed for the hero.

---

## 7) Non-composited animations (5 elements found)

Page 6:
- **“Avoid non-composited animations — 5 animated elements found”**
- It points to SVG paths like:
  - `path.flow-edge edge-1/2/3`
- It mentions: **Unsupported CSS Property: `stroke-dashoffset`** (drawEdge)

**Why this matters**
- Animating SVG stroke properties often can’t be GPU-composited and may cause jank.
- On low-end devices, this can impact smoothness and sometimes rendering timing.

**What to fix**
- Consider reducing the complexity of those animations:
  - reduce frequency, simplify paths, or remove on mobile
  - switch to transform/opacity animations when possible (these are typically composited)
- If the animation is purely decorative, load it after LCP or disable until after first paint.

---

## 8) “Avoid long main-thread tasks — 1 long task found”

Page 6-7:
- Mentions 1 long task; page 7 shows `…chunks/f091…eb2ea3.js` total 5,220ms with 73ms (report formatting is weird, but Lighthouse says it found a long task).

**Why this matters**
- Even though TBT is only 20ms overall (page 2), a single long task can still harm responsiveness.

**What to fix**
- Identify what runs at startup in that chunk.
- Move non-critical work to idle time (`requestIdleCallback`) or after first render.
- Lazy-load non-essential components.

---

## 9) Excessive network payload size (549KiB)

Page 8:
- **“Avoid enormous network payloads — Total size was 549 KiB”**
- Largest items include:
  - JS chunk `…9acf66e95c17faef.js` (~70KB)
  - CSS chunk (~31.9KB)
  - Fonts (multiple woff2, plus local woff2 assets ~31.5KB and ~28.6KB)

**Why this matters**
- On Slow 4G, 500KB+ can be noticeable, especially with extra redirects and font chains.

**What to fix**
- Biggest win is usually **fonts** and **redirect removal**, not micro-optimizing JS here (since TBT is already low).

---

## 10) Accessibility (Score 96) — Real issue: color contrast

Page 10:
- **“Background and foreground colors do not have a sufficient contrast ratio.”**
- It flags text like:
  - “Product video coming soon”
  - footer text such as “© 2026 Yoosr … Terms of Service · Privacy Policy …”

**Why this matters**
- Low-contrast text is hard/impossible for many users to read.
- This is a real usability issue, and it’s one of the few accessibility failures in your report.

**What to fix**
- Adjust those specific text colors (or background) to meet WCAG contrast:
  - normal text should be at least 4.5:1
  - large text 3:1

---

## 11) Best Practices (Score 96) — Concrete problems

### 11.1 Console errors: missing font files (404)
Page 17 shows browser console errors:
- Requests for `…cabinet-grotesk/...woff2` return **404 Not Found**

**Why this matters**
- 404s slow down loading (extra request + fallback).
- Can cause inconsistent typography and layout differences.
- Indicates broken asset paths or build output mismatch.

**What to fix**
- Find where “cabinet-grotesk” is referenced:
  - CSS `@font-face` URL
  - Next/font local configuration
  - Static `/public` path mismatch
- Ensure the font files exist in the deployed output and URLs match exactly (case-sensitive).

---

## 12) Security headers missing (High severity flags)

Page 18-19:
- **“Ensure CSP is effective against XSS attacks”** → **No CSP found in enforcement mode (High)**
- **“Mitigate DOM-based XSS with Trusted Types”** → **No CSP header with Trusted Types directive found (High)**

Page 21 also notes clickjacking mitigation:
- “Mitigate clickjacking with XFO or CSP” (unscored but important)

**Why this matters**
- Without CSP, you have weaker protection against XSS.
- Without Trusted Types (where applicable), DOM XSS sinks are less protected.
- Without `frame-ancestors` (or X-Frame-Options), clickjacking risk is higher.

**What to fix**
- Add security headers at the Next.js / Vercel level:
  - `Content-Security-Policy` (start with report-only if needed, then enforce)
  - Consider `require-trusted-types-for 'script'` + Trusted Types policy if your app can support it
  - `frame-ancestors 'none'` (or restrict to allowed domains) for clickjacking
  - Optional: HSTS, COOP/COEP depending on your needs

---

## 13) Misc diagnostics worth tracking (not necessarily failing)

From pages 7–9:
- DOM size: **482 elements**, max depth **14** (not huge, but keep an eye on it)
- Some suggestions like “User Timing marks and measures” (page 9) — helpful for real-user monitoring.

---

# Prioritized Fix List (highest impact first)

1. **Remove the 3-redirect chain** on initial navigation (page 3).
2. **Reduce render-blocking CSS + font critical chain** (pages 3–5):
   - reduce font payload, simplify families/weights, consider self-hosting
   - ensure consistent `font-display` behavior
3. **Fix the font 404s** (`cabinet-grotesk` missing files) (page 17).
4. **Add CSP + Trusted Types directive** (pages 18–19) and clickjacking protection (page 21).
5. **Fix low-contrast text** in footer/placeholder content (pages 10–11).
6. **Review SVG/path animations** using `stroke-dashoffset` (page 6) and postpone/disable before LCP if decorative.
7. **Investigate forced reflow** call sites (page 3) to avoid layout thrashing.

---

# If you want, I can turn this into a checklist per repo location
If you tell me where the landing page code lives (likely `app/[locale]/page.tsx` or similar) and where fonts are configured (Next/font or CSS), I can map each issue to:
- exact file(s) to inspect
- what change to make
- how to verify in Lighthouse after the fix