package com.talentxcel.android.core.ai.tools

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class PendingActionConfirmation(
    val toolName: String,
    val description: String,
    val parameters: Map<String, Any?>,
    val onConfirm: suspend () -> Unit,
    val onReject: () -> Unit
)

/**
 * Ensures the Personal AI Agent never silently executes high-impact actions.
 * Prompts user for approval before submission.
 */
class AgentPermissionManager {

    private val _pendingConfirmation = MutableStateFlow<PendingActionConfirmation?>(null)
    val pendingConfirmation: StateFlow<PendingActionConfirmation?> = _pendingConfirmation.asStateFlow()

    fun requestConfirmation(
        toolName: String,
        description: String,
        parameters: Map<String, Any?>,
        onConfirm: suspend () -> Unit,
        onReject: () -> Unit
    ) {
        _pendingConfirmation.value = PendingActionConfirmation(
            toolName = toolName,
            description = description,
            parameters = parameters,
            onConfirm = onConfirm,
            onReject = onReject
        )
    }

    suspend fun confirmPendingAction() {
        val action = _pendingConfirmation.value
        _pendingConfirmation.value = null
        action?.onConfirm?.invoke()
    }

    fun rejectPendingAction() {
        val action = _pendingConfirmation.value
        _pendingConfirmation.value = null
        action?.onReject?.invoke()
    }
}
