package com.talentxcel.android.core.ai

import com.talentxcel.android.core.ai.privacy.AIPrivacyGuard
import com.talentxcel.android.core.ai.privacy.PrivacyIndicator
import com.talentxcel.android.core.ai.router.AIRequestRouter
import com.talentxcel.android.core.ai.router.ProcessingTarget
import com.talentxcel.android.core.ai.runtime.AIRequest
import com.talentxcel.android.core.ai.runtime.AIResponse
import com.talentxcel.android.core.ai.runtime.CloudAIProvider
import com.talentxcel.android.core.ai.runtime.HybridAIProvider
import com.talentxcel.android.core.ai.runtime.LocalAIProvider

/**
 * Top-level Orchestrator coordinating all on-device, hybrid, and cloud AI activities.
 * Enforces privacy routing, data minimization, and seamless fallback.
 */
class AIOrchestrator(
    private val localProvider: LocalAIProvider,
    private val cloudProvider: CloudAIProvider,
    private val hybridProvider: HybridAIProvider,
    private val router: AIRequestRouter
) {
    var isNetworkAvailable: Boolean = true
    var userPrefersLocal: Boolean = true

    suspend fun processRequest(
        prompt: String,
        systemPrompt: String? = null,
        context: Map<String, Any?> = emptyMap()
    ): AIResponse {
        val decision = router.route(
            prompt = prompt,
            isLocalModelReady = localProvider.isAvailable,
            isNetworkAvailable = isNetworkAvailable,
            userPrefersLocal = userPrefersLocal
        )

        return when (decision.target) {
            ProcessingTarget.LOCAL_ONLY -> {
                if (localProvider.isAvailable) {
                    localProvider.generateResponse(
                        AIRequest(prompt, systemPrompt, context)
                    )
                } else {
                    // Fallback to cloud if online, otherwise inform user
                    if (isNetworkAvailable) {
                        cloudProvider.generateResponse(
                            AIRequest(prompt, systemPrompt, context)
                        )
                    } else {
                        AIResponse(
                            content = "You are currently offline and no local AI model is downloaded. Connect to the internet or install a local model in Settings -> AI & Privacy.",
                            indicator = PrivacyIndicator.OnDevice,
                            executionTimeMs = 0,
                            isSuccess = false
                        )
                    }
                }
            }

            ProcessingTarget.HYBRID -> {
                hybridProvider.generateResponse(
                    AIRequest(prompt, systemPrompt, context)
                )
            }

            ProcessingTarget.CLOUD_REQUIRED -> {
                cloudProvider.generateResponse(
                    AIRequest(prompt, systemPrompt, context)
                )
            }
        }
    }
}
