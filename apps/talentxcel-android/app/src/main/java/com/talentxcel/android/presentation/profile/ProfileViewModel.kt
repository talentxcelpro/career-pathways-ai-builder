package com.talentxcel.android.presentation.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.talentxcel.android.domain.models.Profile
import com.talentxcel.android.domain.repositories.ProfileRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class ProfileUiState(
    val isLoading: Boolean = false,
    val profile: Profile? = null,
    val isSaving: Boolean = false,
    val saveSuccess: Boolean = false,
    val errorMessage: String? = null
)

class ProfileViewModel(
    private val profileRepository: ProfileRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ProfileUiState(isLoading = true))
    val uiState: StateFlow<ProfileUiState> = _uiState.asStateFlow()

    fun loadProfile(userId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            val result = profileRepository.getProfile(userId)
            result.onSuccess {
                _uiState.value = _uiState.value.copy(isLoading = false, profile = it)
            }.onFailure {
                _uiState.value = _uiState.value.copy(isLoading = false, errorMessage = it.localizedMessage)
            }
        }
    }

    fun updateProfile(updated: Profile) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSaving = true, errorMessage = null)
            val result = profileRepository.updateProfile(updated)
            result.onSuccess {
                _uiState.value = _uiState.value.copy(isSaving = false, profile = it, saveSuccess = true)
            }.onFailure {
                _uiState.value = _uiState.value.copy(isSaving = false, errorMessage = it.localizedMessage)
            }
        }
    }
}
