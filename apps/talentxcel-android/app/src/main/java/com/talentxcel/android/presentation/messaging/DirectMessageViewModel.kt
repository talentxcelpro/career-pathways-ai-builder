package com.talentxcel.android.presentation.messaging

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.talentxcel.android.domain.models.Message
import com.talentxcel.android.domain.models.MessageStatus
import com.talentxcel.android.domain.repositories.MessagingRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class DirectMessageUiState(
    val isLoading: Boolean = true,
    val conversationId: String = "",
    val recipientName: String = "",
    val recipientId: String = "",
    val messages: List<Message> = emptyList(),
    val isSending: Boolean = false,
    val errorMessage: String? = null,
    /** R-1/R-2: Shown as a snackbar — "Queued" or auth error. Cleared after display. */
    val snackbarMessage: String? = null
)

class DirectMessageViewModel(
    private val messagingRepository: MessagingRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(DirectMessageUiState())
    val uiState: StateFlow<DirectMessageUiState> = _uiState.asStateFlow()

    fun initConversation(conversationId: String, recipientName: String, recipientId: String) {
        _uiState.value = _uiState.value.copy(
            conversationId = conversationId,
            recipientName = recipientName,
            recipientId = recipientId,
            isLoading = true
        )
        loadMessages(conversationId)
    }

    private fun loadMessages(conversationId: String) {
        viewModelScope.launch {
            messagingRepository.getMessages(conversationId).collect { result ->
                result.onSuccess { msgList ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        messages = msgList
                    )
                }.onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = error.localizedMessage
                    )
                }
            }
        }
    }

    fun sendMessage(content: String) {
        val trimmed = content.trim()
        if (trimmed.isBlank()) return

        val convId = _uiState.value.conversationId
        val recipId = _uiState.value.recipientId

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSending = true)
            val result = messagingRepository.sendMessage(convId, recipId, trimmed)
            result.onSuccess { newMessage ->
                // R-1: Check if message was queued (offline) and inform the user
                val snackbar = when (newMessage.status) {
                    MessageStatus.QUEUED ->
                        "⏳ Queued — will send when connection returns"
                    MessageStatus.SENT -> null  // No snackbar needed for successful sends
                    MessageStatus.FAILED ->
                        "❌ Message failed to send"
                }
                _uiState.value = _uiState.value.copy(
                    isSending = false,
                    messages = _uiState.value.messages + newMessage,
                    snackbarMessage = snackbar
                )
            }.onFailure { error ->
                // R-2: Auth failure — SecurityException means session expired
                val snackbar = if (error is SecurityException) {
                    "🔒 Session expired — please sign in again"
                } else {
                    "Failed to send message"
                }
                _uiState.value = _uiState.value.copy(
                    isSending = false,
                    snackbarMessage = snackbar
                )
            }
        }
    }

    fun clearSnackbar() {
        _uiState.value = _uiState.value.copy(snackbarMessage = null)
    }
}
