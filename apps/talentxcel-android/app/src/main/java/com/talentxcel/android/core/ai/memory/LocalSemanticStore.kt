package com.talentxcel.android.core.ai.memory

data class SemanticDocument(
    val id: String,
    val text: String,
    val metadata: Map<String, String> = emptyMap(),
    val embedding: FloatArray? = null
)

/**
 * On-Device Semantic Store abstraction for vector search over resume sections,
 * saved jobs, and career notes without cloud leakage.
 */
class LocalSemanticStore {

    private val documents = mutableListOf<SemanticDocument>()

    fun indexDocument(doc: SemanticDocument) {
        documents.add(doc)
    }

    /**
     * Finds semantically similar local snippets using keyword overlap or vector cosine similarity.
     */
    fun findSimilar(query: String, topK: Int = 3): List<SemanticDocument> {
        val queryTokens = query.lowercase().split("\\s+".toRegex()).toSet()
        return documents
            .map { doc ->
                val docTokens = doc.text.lowercase().split("\\s+".toRegex()).toSet()
                val overlap = queryTokens.intersect(docTokens).size
                Pair(doc, overlap)
            }
            .sortedByDescending { it.second }
            .take(topK)
            .map { it.first }
    }

    fun clear() {
        documents.clear()
    }
}
