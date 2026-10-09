package com.talentxcel.android.presentation.career

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.talentxcel.android.domain.models.CareerPathway
import com.talentxcel.android.domain.models.PathwayNode
import com.talentxcel.android.domain.repositories.CareerRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class CareerMapUiState(
    val isLoading: Boolean = true,
    val pathway: CareerPathway? = null,
    val selectedNode: PathwayNode? = null,
    val errorMessage: String? = null
)

class CareerMapViewModel(
    private val careerRepository: CareerRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(CareerMapUiState())
    val uiState: StateFlow<CareerMapUiState> = _uiState.asStateFlow()

    init {
        loadPathway()
    }

    fun loadPathway() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            val result = careerRepository.getCareerPathway("current_user")
            result.onSuccess { pathway ->
                val currentNode = pathway.nodes.find { it.status == com.talentxcel.android.domain.models.PathwayNodeStatus.CURRENT }
                    ?: pathway.nodes.firstOrNull()
                _uiState.value = CareerMapUiState(
                    isLoading = false,
                    pathway = pathway,
                    selectedNode = currentNode
                )
            }.onFailure { error ->
                _uiState.value = CareerMapUiState(
                    isLoading = false,
                    errorMessage = error.localizedMessage ?: "Failed to load career pathway"
                )
            }
        }
    }

    fun selectNode(node: PathwayNode) {
        _uiState.value = _uiState.value.copy(selectedNode = node)
    }
}
