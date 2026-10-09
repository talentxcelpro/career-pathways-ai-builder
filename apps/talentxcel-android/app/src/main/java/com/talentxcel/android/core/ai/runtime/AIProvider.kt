package com.talentxcel.android.core.ai.runtime

import com.talentxcel.android.core.ai.privacy.PrivacyIndicator
import kotlinx.coroutines.flow.Flow

data class AIRequest(
    val prompt: String,
    val systemPrompt: String? = null,
    val context: Map<String, Any?> = emptyMap(),
    val temperature: Float = 0.7f,
    val maxTokens: Int = 1024
)

data class AIResponse(
    val content: String,
    val indicator: PrivacyIndicator,
    val executionTimeMs: Long,
    val tokensGenerated: Int = 0,
    val isSuccess: Boolean = true,
    val errorMessage: String? = null
)

/**
 * Common abstraction for all TalentXcel AI Providers.
 * Enables zero-refactor replacement of local engines (GGUF, ONNX, MediaPipe, etc.)
 * or cloud backends.
 */
interface AIProvider {
    val isAvailable: Boolean
    val providerName: String
    
    suspend fun generateResponse(request: AIRequest): AIResponse
    fun streamResponse(request: AIRequest): Flow<String>
}
