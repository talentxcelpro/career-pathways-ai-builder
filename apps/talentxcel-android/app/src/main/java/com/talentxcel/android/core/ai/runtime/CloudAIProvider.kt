package com.talentxcel.android.core.ai.runtime

import com.talentxcel.android.core.ai.privacy.AIPrivacyGuard
import com.talentxcel.android.core.ai.privacy.PrivacyIndicator
import com.talentxcel.android.core.network.SupabaseClientProvider
import io.github.jan.supabase.functions.functions
import io.ktor.client.statement.bodyAsText
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import kotlin.system.measureTimeMillis

@Serializable
data class CloudAIResponsePayload(
    val message: String? = null,
    val response: String? = null,
    val answer: String? = null
)

/**
 * Cloud AI Provider connecting to TalentXcel Supabase Edge Function 'ai-chat'.
 * Enforces data minimization before transmission.
 */
class CloudAIProvider : AIProvider {

    override val isAvailable: Boolean = true
    override val providerName: String = "TalentXcel Cloud AI (Edge Function)"

    override suspend fun generateResponse(request: AIRequest): AIResponse {
        val sanitizedPrompt = AIPrivacyGuard.minimizeForCloud(request.prompt)
        var responseText = ""
        val elapsed = measureTimeMillis {
            try {
                val payload = buildJsonObject {
                    put("message", sanitizedPrompt)
                    put("prompt", sanitizedPrompt)
                    request.systemPrompt?.let { put("systemPrompt", it) }
                }

                val result = SupabaseClientProvider.client.functions.invoke(
                    function = "ai-chat",
                    body = payload
                )

                val bodyStr = result.bodyAsText()
                val parsed = try {
                    Json { ignoreUnknownKeys = true }.decodeFromString<CloudAIResponsePayload>(bodyStr)
                } catch (e: Exception) {
                    null
                }

                responseText = parsed?.message ?: parsed?.response ?: parsed?.answer ?: bodyStr
            } catch (e: Exception) {
                responseText = "Unable to connect to TalentXcel AI services: ${e.localizedMessage}"
            }
        }

        return AIResponse(
            content = responseText,
            indicator = PrivacyIndicator.Cloud,
            executionTimeMs = elapsed,
            isSuccess = !responseText.startsWith("Unable to connect")
        )
    }

    override fun streamResponse(request: AIRequest): Flow<String> = flow {
        val res = generateResponse(request)
        emit(res.content)
    }
}
