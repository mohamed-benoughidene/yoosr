/**
 * Embedding model configuration for knowledge base semantic search.
 *
 * Used by convex/knowledge.ts for generating and querying embeddings.
 * If changing the model, you MUST re-index all knowledge_base_chunks
 * because different models produce different vector dimensions.
 */
export const EMBEDDING_CONFIG = {
    /** OpenRouter model ID for generating embeddings */
    model: process.env.EMBEDDING_MODEL || "intfloat/multilingual-e5-large",
    /** Vector dimensions — must match the model's output */
    dimensions: parseInt(process.env.EMBEDDING_DIMENSIONS || "1024", 10),
} as const;
