package com.talentxcel.android.core.ai.agent

import com.talentxcel.android.core.ai.privacy.PrivacyIndicator

sealed class AgentState {
    object Idle : AgentState()
    data class Thinking(val step: String) : AgentState()
    data class Planning(val proposedPlan: String) : AgentState()
    data class AskingConfirmation(val actionTitle: String, val details: String) : AgentState()
    data class ExecutingTool(val toolName: String) : AgentState()
    data class Responding(val text: String, val indicator: PrivacyIndicator) : AgentState()
    data class Error(val message: String) : AgentState()
}
