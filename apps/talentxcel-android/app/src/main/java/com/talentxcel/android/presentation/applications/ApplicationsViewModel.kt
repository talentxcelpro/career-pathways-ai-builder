package com.talentxcel.android.presentation.applications

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.talentxcel.android.domain.models.Application
import com.talentxcel.android.domain.models.ApplicationStatus
import com.talentxcel.android.domain.repositories.ApplicationRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class ApplicationsUiState(
    val isLoading: Boolean = false,
    val applications: List<Application> = emptyList(),
    val selectedFilter: ApplicationStatus? = null,
    val errorMessage: String? = null
)

class ApplicationsViewModel(
    private val applicationRepository: ApplicationRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ApplicationsUiState(isLoading = true))
    val uiState: StateFlow<ApplicationsUiState> = _uiState.asStateFlow()

    init {
        loadApplications()
    }

    fun onFilterSelect(status: ApplicationStatus?) {
        val selected = if (_uiState.value.selectedFilter == status) null else status
        _uiState.value = _uiState.value.copy(selectedFilter = selected)
    }

    fun loadApplications() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            val result = applicationRepository.getMyApplications("current_user")
            result.onSuccess { list ->
                _uiState.value = _uiState.value.copy(isLoading = false, applications = list)
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(isLoading = false, errorMessage = err.localizedMessage)
            }
        }
    }
}
