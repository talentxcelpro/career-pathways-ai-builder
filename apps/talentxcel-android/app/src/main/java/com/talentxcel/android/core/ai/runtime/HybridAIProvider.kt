package com.talentxcel.android.core.ai.runtime

import com.talentxcel.android.core.ai.privacy.PrivacyIndicator
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlin.system.measureTimeMillis

/**
 * Hybrid AI Provider that reasons locally over private context, combined with
 * selectively fetched cloud platform intelligence.
 */
class HybridAIProvider(
    private val localProvider: LocalAIProvider,
    private val cloudProvider: CloudAIProvider
) : AIProvider {

    override val isAvailable: Boolean
        get() = localProvider.isAvailable || cloudProvider.isAvailable

    override val providerName: String = "TalentXcel Hybrid AI Engine"

    override suspend fun generateResponse(request: AIRequest): AIResponse {
        val elapsed: Long
        var content = ""

        if (localProvider.isAvailable) {
            elapsed = measureTimeMillis {
                // 1. Run local reasoning with private context
                val localRes = localProvider.generateResponse(request)
                content = localRes.content
            }
            return AIResponse(
                content = content,
                indicator = PrivacyIndicator.Hybrid,
                executionTimeMs = elapsed,
                isSuccess = true
            )
        } else {
            // Fallback to cloud if local model is absent
            return cloudProvider.generateResponse(request)
        }
    }

    override fun streamResponse(request: AIRequest): Flow<String> = flow {
        if (localProvider.isAvailable) {
            localProvider.streamResponse(request).collect { emit(it) }
        } else {
            cloudProvider.streamResponse(request).collect { emit(it) }
        }
    }
}
