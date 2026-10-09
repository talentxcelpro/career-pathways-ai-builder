package com.talentxcel.android.core.ai.runtime

import com.talentxcel.android.core.ai.model.ModelManager
import com.talentxcel.android.core.ai.privacy.PrivacyIndicator
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlin.system.measureTimeMillis

/**
 * On-Device AI Provider implementing local inference without internet access.
 * Communicates with the local quantized model managed by ModelManager.
 */
class LocalAIProvider(
    private val modelManager: ModelManager
) : AIProvider {

    override val isAvailable: Boolean
        get() = modelManager.isModelLoaded()

    override val providerName: String = "Google Gemini Nano (On-Device)"

    override suspend fun generateResponse(request: AIRequest): AIResponse {
        val startTime = System.currentTimeMillis()
        
        if (!isAvailable) {
            return AIResponse(
                content = "Local AI model is not installed. Please download a model in Settings -> AI & Privacy, or enable Cloud AI.",
                indicator = PrivacyIndicator.OnDevice,
                executionTimeMs = System.currentTimeMillis() - startTime,
                isSuccess = false,
                errorMessage = "LOCAL_MODEL_NOT_FOUND"
            )
        }

        var resultText = ""
        val elapsed = measureTimeMillis {
            // Execute local quantized inference
            resultText = modelManager.runInference(
                prompt = request.prompt,
                systemPrompt = request.systemPrompt,
                context = request.context
            )
        }

        return AIResponse(
            content = resultText,
            indicator = PrivacyIndicator.OnDevice,
            executionTimeMs = elapsed,
            tokensGenerated = resultText.split("\\s+".toRegex()).size,
            isSuccess = true
        )
    }

    override fun streamResponse(request: AIRequest): Flow<String> = flow {
        if (!isAvailable) {
            emit("Local model not loaded.")
            return@flow
        }

        val fullResponse = modelManager.runInference(
            prompt = request.prompt,
            systemPrompt = request.systemPrompt,
            context = request.context
        )

        // Stream tokens / words progressively for responsive UX
        val tokens = fullResponse.split(" ")
        for (token in tokens) {
            emit("$token ")
            delay(25) // Smooth token output pace
        }
    }
}
