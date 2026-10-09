package com.talentxcel.android.presentation.jobs

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.talentxcel.android.domain.models.Job
import com.talentxcel.android.domain.repositories.JobRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class JobsUiState(
    val isLoading: Boolean = false,
    val jobs: List<Job> = emptyList(),
    val searchQuery: String = "",
    val selectedWorkMode: String? = null,
    val errorMessage: String? = null
)

class JobsViewModel(
    private val jobRepository: JobRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(JobsUiState(isLoading = true))
    val uiState: StateFlow<JobsUiState> = _uiState.asStateFlow()

    init {
        loadJobs()
    }

    fun onSearchQueryChange(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
        loadJobs(query = query, workMode = _uiState.value.selectedWorkMode)
    }

    fun onWorkModeSelect(workMode: String?) {
        val selected = if (_uiState.value.selectedWorkMode == workMode) null else workMode
        _uiState.value = _uiState.value.copy(selectedWorkMode = selected)
        loadJobs(query = _uiState.value.searchQuery, workMode = selected)
    }

    fun toggleSaveJob(jobId: String, currentSaved: Boolean) {
        viewModelScope.launch {
            val result = jobRepository.toggleSaveJob(jobId, currentSaved)
            result.onSuccess { newSavedState ->
                _uiState.value = _uiState.value.copy(
                    jobs = _uiState.value.jobs.map {
                        if (it.id == jobId) it.copy(isSaved = newSavedState) else it
                    }
                )
            }
        }
    }

    fun loadJobs(query: String? = null, workMode: String? = null) {
        viewModelScope.launch {
            if (_uiState.value.jobs.isEmpty()) {
                _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            }
            val result = jobRepository.getJobs(page = 0, limit = 20, query = query, workMode = workMode)
            result.onSuccess { list ->
                val filtered = list.filter { job ->
                    val matchesQuery = query.isNullOrBlank() ||
                            job.title.contains(query, ignoreCase = true) ||
                            job.company.contains(query, ignoreCase = true) ||
                            job.location.contains(query, ignoreCase = true)
                    val matchesMode = workMode == null || job.workMode.equals(workMode, ignoreCase = true)
                    matchesQuery && matchesMode
                }
                _uiState.value = _uiState.value.copy(isLoading = false, jobs = filtered)
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(isLoading = false, errorMessage = err.localizedMessage)
            }
        }
    }
}
