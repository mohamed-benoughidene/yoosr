# URL Source Handling Audit in `indexSource`

This audit examines the implementation of URL source processing within the `indexSource` action in `convex/knowledge.ts`.

## 1. Verbatim Code Analysis

The following code block represents the branch handling `source.type === "url"`:

```typescript
        } else if (source.type === "url") {
            try {
                const response = await fetch(source.value, {
                    headers: { "User-Agent": "Mozilla/5.0 (compatible; YoosrBot/1.0)" },
                    signal: AbortSignal.timeout(10000)
                });

                const htmlText = await response.text();

                let cleanedText = htmlText.replace(/<[^>]*>/g, " ");
                cleanedText = cleanedText.replace(/\s+/g, " ");
                cleanedText = cleanedText
                    .replace(/&amp;/g, "&")
                    .replace(/&lt;/g, "<")
                    .replace(/&gt;/g, ">")
                    .replace(/&nbsp;/g, " ")
                    .replace(/&quot;/g, '"');
                cleanedText = cleanedText.trim();

                if (!cleanedText) {
                    throw new Error("Text is empty after stripping HTML");
                }

                // Simple chunking by double newline
                const chunks = cleanedText.split('\n\n').filter((c: string) => c.trim().length > 0);

                if (!process.env.HUGGINGFACE_API_KEY) {
                    console.error("Missing HUGGINGFACE_API_KEY");
                    await ctx.runMutation(internal.knowledge.updateSourceStatusInternal, { id: args.sourceId, status: "failed" });
                    return;
                }

                const { HfInference } = await import("@huggingface/inference");
                const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

                let hasErrors = false;
                for (const chunk of chunks) {
                    try {
                        const output = await hf.featureExtraction({
                            model: "BAAI/bge-m3",
                            inputs: chunk.trim(),
                        });

                        if (Array.isArray(output)) {
                            await ctx.runMutation(internal.knowledge.insertChunkInternal, {
                                sourceId: args.sourceId,
                                projectId: args.projectId,
                                text: chunk.trim(),
                                embedding: output as number[]
                            });
                        } else {
                            hasErrors = true;
                        }
                    } catch (e: any) {
                        console.error("Failed to embed chunk", e.message);
                        hasErrors = true;
                    }
                }

                // Mark as indexed if all good, otherwise failed
                await ctx.runMutation(internal.knowledge.updateSourceStatusInternal, {
                    id: args.sourceId,
                    status: hasErrors && chunks.length > 0 ? "failed" : "indexed"
                });
            } catch (e: any) {
                console.error("Failed to process URL source:", e.message);
                await ctx.runMutation(internal.knowledge.updateSourceStatusInternal, { id: args.sourceId, status: "failed" });
            }
```

## 2. Audit Questionnaire

### **Is there any fetch() call?**
**Yes.** The code calls `fetch(source.value, ...)` on line 93. It correctly sets a custom `User-Agent` (`"Mozilla/5.0 (compatible; YoosrBot/1.0)"`) and includes an `AbortSignal.timeout(10000)` to ensure the request is terminated after 10 seconds.

### **Are there any try/catch blocks around the fetch?**
**Yes.** The entire URL processing logic is wrapped in a `try/catch` block (Lines 92–158). This ensures that network errors, timeout exceptions, or parsing failures are caught gracefully.

### **What does the catch block do?**
The `catch` block (Lines 155–158):
1.  Logs the failure to the console with the specific error message: `console.error("Failed to process URL source:", e.message)`.
2.  Updates the source record's status to `"failed"` in the database by calling the `internal.knowledge.updateSourceStatusInternal` mutation.

---
**Auditor**: Antigravity
**Date**: March 01, 2026
