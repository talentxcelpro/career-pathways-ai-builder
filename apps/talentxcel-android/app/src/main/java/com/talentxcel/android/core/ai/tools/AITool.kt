package com.talentxcel.android.core.ai.tools

enum class ToolImpactLevel {
    READ_ONLY,       // e.g. search jobs, read profile (no confirmation required)
    LOW_IMPACT,      // e.g. save job to bookmarks
    HIGH_IMPACT      // e.g. apply to job, modify profile (requires explicit user confirmation)
}

data class ToolExecutionResult(
    val isSuccess: Boolean,
    val data: Any? = null,
    val message: String
)

/**
 * Contract for controlled AI Tools invocable by the Personal Career Agent.
 */
interface AITool {
    val name: String
    val description: String
    val impactLevel: ToolImpactLevel
    val requiredPermission: String

    suspend fun execute(parameters: Map<String, Any?>): ToolExecutionResult
}
