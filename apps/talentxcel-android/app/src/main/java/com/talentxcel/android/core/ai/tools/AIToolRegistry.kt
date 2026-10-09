package com.talentxcel.android.core.ai.tools

/**
 * Central registry of all tools available to the Personal Career Agent.
 */
class AIToolRegistry(
    private val permissionManager: AgentPermissionManager
) {
    private val tools = mutableMapOf<String, AITool>()

    init {
        registerTool(object : AITool {
            override val name: String = "searchJobs"
            override val description: String = "Searches available opportunities matching query and filters."
            override val impactLevel: ToolImpactLevel = ToolImpactLevel.READ_ONLY
            override val requiredPermission: String = "READ_JOBS"

            override suspend fun execute(parameters: Map<String, Any?>): ToolExecutionResult {
                val query = parameters["query"] as? String ?: ""
                return ToolExecutionResult(
                    isSuccess = true,
                    data = listOf("Frontend Architect", "Lead Mobile Engineer"),
                    message = "Found 2 matching roles for '$query'."
                )
            }
        })

        registerTool(object : AITool {
            override val name: String = "saveJob"
            override val description: String = "Saves a job to the user's bookmarks."
            override val impactLevel: ToolImpactLevel = ToolImpactLevel.LOW_IMPACT
            override val requiredPermission: String = "SAVE_JOB"

            override suspend fun execute(parameters: Map<String, Any?>): ToolExecutionResult {
                val jobId = parameters["jobId"] as? String ?: return ToolExecutionResult(false, null, "Missing jobId")
                return ToolExecutionResult(true, null, "Job $jobId saved to your bookmarks.")
            }
        })

        registerTool(object : AITool {
            override val name: String = "applyToJob"
            override val description: String = "Submits a job application on behalf of the user."
            override val impactLevel: ToolImpactLevel = ToolImpactLevel.HIGH_IMPACT
            override val requiredPermission: String = "SUBMIT_APPLICATION"

            override suspend fun execute(parameters: Map<String, Any?>): ToolExecutionResult {
                val jobId = parameters["jobId"] as? String ?: return ToolExecutionResult(false, null, "Missing jobId")
                val jobTitle = parameters["jobTitle"] as? String ?: "Target Role"

                // Must trigger user confirmation before final submission
                var confirmedResult: ToolExecutionResult = ToolExecutionResult(false, null, "Pending approval")
                permissionManager.requestConfirmation(
                    toolName = name,
                    description = "Apply to $jobTitle (ID: $jobId) using your current TalentXcel profile and resume?",
                    parameters = parameters,
                    onConfirm = {
                        confirmedResult = ToolExecutionResult(true, jobId, "Application successfully submitted for $jobTitle.")
                    },
                    onReject = {
                        confirmedResult = ToolExecutionResult(false, null, "Application cancelled by user.")
                    }
                )

                return confirmedResult
            }
        })
    }

    fun registerTool(tool: AITool) {
        tools[tool.name] = tool
    }

    fun getTool(name: String): AITool? = tools[name]

    fun getAllTools(): List<AITool> = tools.values.toList()
}
