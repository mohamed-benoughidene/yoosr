# Sendcloud URL Indexing Audit

## Problem Description
The user reported that `https://www.sendcloud.com/en_uk/how-to-write-a-return-policy/` gets stuck in the `"indexing"` status indefinitely without throwing an error that updates the database to `"failed"`.

## Testing Steps and Audit Findings
We tested the exact fetch logic and analyzed the Convex execution environment:
1. **Network Response**: Using `curl` and a Node script, the URL responds correctly with a `200 OK` status and a `311KB` HTML body.
2. **Text Cleaning & Chunking**: The HTML strips down to roughly `174KB` of clean text. Passing this text into our `splitIntoChunks` utility yields **381 individual chunks**.
3. **The Silent Error**: By auditing `npx convex logs`, we confirmed that `indexSource` is suffering a **Function Execution Timeout** (600s/10-minute limit). 
4. **Why it doesn't fail gracefully**: The function is forcibly killed by the Convex serverless platform because the serial `for (const chunk of chunks)` loop makes 381 independent, sequential network requests to the Hugging Face `featureExtraction` API. Since the process is killed at the system level before the loop completes, it never reaches the `catch` block or the final database mutation, leaving the status forever trapped as `"indexing"`.

## Root Cause
The `indexSource` action processes chunks serially, initiating one API request per chunk. When processing large pages that generate hundreds of chunks, this serial flow drastically exceeds the function timeout limit before it can mark the processing as complete or failed.
