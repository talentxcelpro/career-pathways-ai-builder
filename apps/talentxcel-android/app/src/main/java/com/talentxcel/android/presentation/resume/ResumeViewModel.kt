package com.talentxcel.android.presentation.resume

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.talentxcel.android.domain.models.AtsAnalysis
import com.talentxcel.android.domain.models.BulletOptimization
import com.talentxcel.android.domain.models.ResumeDocument
import com.talentxcel.android.domain.repositories.ResumeRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class ResumeViewModel(
    private val resumeRepository: ResumeRepository
) : ViewModel() {

    private val _resumes = MutableStateFlow<List<ResumeDocument>>(emptyList())
    val resumes: StateFlow<List<ResumeDocument>> = _resumes.asStateFlow()

    private val _selectedResume = MutableStateFlow<ResumeDocument?>(null)
    val selectedResume: StateFlow<ResumeDocument?> = _selectedResume.asStateFlow()

    private val _isAnalyzing = MutableStateFlow(false)
    val isAnalyzing: StateFlow<Boolean> = _isAnalyzing.asStateFlow()

    // Agent Confirmation Flow for AI Bullet Optimizations
    private val _pendingBulletOptimization = MutableStateFlow<BulletOptimization?>(null)
    val pendingBulletOptimization: StateFlow<BulletOptimization?> = _pendingBulletOptimization.asStateFlow()

    init {
        loadResumes()
    }

    fun loadResumes() {
        viewModelScope.launch {
            resumeRepository.getResumes().collect { list ->
                _resumes.value = list
                if (_selectedResume.value == null && list.isNotEmpty()) {
                    _selectedResume.value = list.first()
                } else if (_selectedResume.value != null) {
                    _selectedResume.value = list.find { it.id == _selectedResume.value?.id } ?: list.firstOrNull()
                }
            }
        }
    }

    fun selectResume(resume: ResumeDocument) {
        _selectedResume.value = resume
    }

    fun uploadResume(fileName: String, uri: String, bytes: ByteArray? = null) {
        viewModelScope.launch {
            _isAnalyzing.value = true
            val result = resumeRepository.uploadResume(fileName, uri, bytes)
            result.fold(
                onSuccess = { created ->
                    _selectedResume.value = created
                },
                onFailure = {}
            )
            _isAnalyzing.value = false
        }
    }

    fun triggerAtsScan(targetJobId: String? = null) {
        val current = _selectedResume.value ?: return
        viewModelScope.launch {
            _isAnalyzing.value = true
            val result = resumeRepository.runAtsScan(current.id, targetJobId)
            result.fold(
                onSuccess = { analysis ->
                    _selectedResume.value = current.copy(atsAnalysis = analysis)
                },
                onFailure = {}
            )
            _isAnalyzing.value = false
        }
    }

    fun requestBulletOptimization(bullet: BulletOptimization) {
        _pendingBulletOptimization.value = bullet
    }

    fun dismissBulletConfirmation() {
        _pendingBulletOptimization.value = null
    }

    fun confirmBulletOptimization() {
        val bullet = _pendingBulletOptimization.value ?: return
        val currentResume = _selectedResume.value ?: return

        viewModelScope.launch {
            resumeRepository.acceptBulletOptimization(currentResume.id, bullet.id)
            _pendingBulletOptimization.value = null
        }
    }
}
