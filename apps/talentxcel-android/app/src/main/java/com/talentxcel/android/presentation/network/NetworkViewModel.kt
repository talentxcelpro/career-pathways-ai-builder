package com.talentxcel.android.presentation.network

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.talentxcel.android.domain.models.Connection
import com.talentxcel.android.domain.repositories.NetworkRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class NetworkUiState(
    val isLoading: Boolean = false,
    val connections: List<Connection> = emptyList(),
    val suggestions: List<Connection> = emptyList(),
    val errorMessage: String? = null
)

class NetworkViewModel(
    private val networkRepository: NetworkRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(NetworkUiState(isLoading = true))
    val uiState: StateFlow<NetworkUiState> = _uiState.asStateFlow()

    init {
        loadNetwork()
    }

    fun sendConnectRequest(targetUserId: String) {
        viewModelScope.launch {
            networkRepository.sendConnectionRequest(targetUserId)
            _uiState.value = _uiState.value.copy(
                suggestions = _uiState.value.suggestions.map {
                    if (it.userId == targetUserId) it.copy(isPending = true) else it
                }
            )
        }
    }

    fun loadNetwork() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            val connRes = networkRepository.getConnections("current_user")
            val suggRes = networkRepository.getSuggestedConnections("current_user")

            _uiState.value = NetworkUiState(
                isLoading = false,
                connections = connRes.getOrDefault(emptyList()),
                suggestions = suggRes.getOrDefault(emptyList())
            )
        }
    }
}
