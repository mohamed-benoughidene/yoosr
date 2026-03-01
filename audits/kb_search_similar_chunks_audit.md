# Knowledge Base Search Similar Chunks Audit

## Issue
The `searchSimilarChunks` internal action inside `convex/knowledge.ts` was returning 0 results, resulting in the Unanswered Queries block being triggered instead of returning context chunks from the database.

## Investigation

We inserted debug logging in several places within `searchSimilarChunks` to identify where the results were failing.

We observed the following logs:
```text
[KB DEBUG] embedding type: object isArray: true length: 1024 first element type: number

[KB DEBUG] flatEmbedding length: 1024

[KB DEBUG] vectorSearch raw results: 5 [{"_id":"m97b0t1vhpyv24z90snwht0je1822kh1","_score":0.486646831035614},{"_id":"m9749284qd8m1k1mycfpfevv21822fa7","_score":0.486646831035614}]

[KB DEBUG] after score filter (min 0.60): 0 scores: [ 0.486646831035614, 0.486646831035614, 0.4828968346118927, 0.48289671540260315, 0.48289671540260315 ]
```

## Root Cause
The `BAAI/bge-m3` model returns similarities that are around ~**`0.48`**. The algorithm limits were artificially blocking correct answers since `MIN_RELEVANCE_SCORE` was hardcoded to `0.60`.

```typescript
const MIN_RELEVANCE_SCORE = 0.60;
const results = await ctx.vectorSearch("knowledge_base_chunks", "by_embedding", { ... });
const relevantResults = results.filter((r: any) => r._score >= MIN_RELEVANCE_SCORE);
```
Since the `0.48` score is lower than `0.60`, `relevantResults.length` evaluated to `0`, hiding the chunks.

## Additional Fix Before Auditing
We observed that the Hugging Face Inference API occasionally requires dimensionality normalizations on its outputs. We placed a guard check ahead of the vector search identical to the indexing function logic.
```typescript
const is1D = Array.isArray(embedding) && embedding.length > 0 && typeof embedding[0] === 'number';
const flatEmbedding = is1D ? embedding : (embedding as number[][])[0];
```
