package com.talentxcel.android.core.ai.agent

import com.talentxcel.android.core.ai.AIOrchestrator
import com.talentxcel.android.core.ai.memory.MemoryCategory
import com.talentxcel.android.core.ai.memory.MemoryManager
import com.talentxcel.android.core.ai.runtime.AIRequest
import com.talentxcel.android.core.ai.tools.AIToolRegistry
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * The Personal AI Career Agent for a TalentXcel user.
 * Operates with local context, respects user permissions, and leverages private on-device reasoning.
 */
class PersonalAIAgent(
    val userId: String,
    private val orchestrator: AIOrchestrator,
    private val memoryManager: MemoryManager,
    private val toolRegistry: AIToolRegistry
) {
    private val _agentState = MutableStateFlow<AgentState>(AgentState.Idle)
    val agentState: StateFlow<AgentState> = _agentState.asStateFlow()

    /**
     * Handles user intent following the THINK -> PLAN -> EXECUTE cycle.
     */
    suspend fun processUserIntent(userMessage: String) {
        _agentState.value = AgentState.Thinking("Analyzing your career intent...")

        // Save conversation history to private local memory
        memoryManager.addMemory(
            category = MemoryCategory.CONVERSATION,
            content = "User: $userMessage"
        )

        // Prepare context from private local memory
        val memoryContext = memoryManager.getContextString()
        val systemPrompt = """
            You are TalentXcel Personal AI Agent, an empowering, private career co-pilot.
            Your mission is to help the user advance their career, find matching opportunities, 
            and elevate their skills. Always protect private user information.
            
            Private User Context:
            $memoryContext
        """.trimIndent()

        _agentState.value = AgentState.Thinking("Synthesizing context...")

        val response = orchestrator.processRequest(
            prompt = userMessage,
            systemPrompt = systemPrompt,
            context = mapOf(
                "userId" to userId,
                "memory" to memoryContext
            )
        )

        // Record agent reply to local memory
        memoryManager.addMemory(
            category = MemoryCategory.CONVERSATION,
            content = "Agent: ${response.content.take(120)}..."
        )

        _agentState.value = AgentState.Responding(response.content, response.indicator)
    }

    fun setLocalPreference(prefersLocal: Boolean) {
        orchestrator.userPrefersLocal = prefersLocal
    }

    fun resetState() {
        _agentState.value = AgentState.Idle
    }
}
