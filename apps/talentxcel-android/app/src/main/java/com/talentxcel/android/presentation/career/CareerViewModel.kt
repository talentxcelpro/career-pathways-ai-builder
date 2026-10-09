package com.talentxcel.android.presentation.career

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.talentxcel.android.core.ai.agent.AgentState
import com.talentxcel.android.core.ai.agent.PersonalAIAgent
import com.talentxcel.android.domain.models.CareerRecommendation
import com.talentxcel.android.domain.repositories.CareerRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

enum class AIAssistantMode {
    ON_DEVICE,
    HYBRID,
    CLOUD
}

data class CareerUiState(
    val isLoading: Boolean = false,
    val talentScore: Int = 88,
    val recommendations: List<CareerRecommendation> = emptyList(),
    val agentState: AgentState = AgentState.Idle,
    val chatHistory: List<Pair<String, Boolean>> = emptyList(), // Pair<MessageText, IsUser>
    val assistantMode: AIAssistantMode = AIAssistantMode.ON_DEVICE,
    val isVoiceListening: Boolean = false,
    val isVoiceSpeaking: Boolean = false
)

class CareerViewModel(
    private val careerRepository: CareerRepository,
    val personalAgent: PersonalAIAgent
) : ViewModel() {

    private val _uiState = MutableStateFlow(CareerUiState(isLoading = true))
    val uiState: StateFlow<CareerUiState> = _uiState.asStateFlow()

    init {
        loadCareerData()
        observeAgentState()
    }

    private fun observeAgentState() {
        viewModelScope.launch {
            personalAgent.agentState.collect { state ->
                _uiState.value = _uiState.value.copy(agentState = state)
                if (state is AgentState.Responding) {
                    _uiState.value = _uiState.value.copy(
                        chatHistory = _uiState.value.chatHistory + Pair(state.text, false)
                    )
                }
            }
        }
    }

    fun sendAgentPrompt(prompt: String) {
        if (prompt.isBlank()) return

        _uiState.value = _uiState.value.copy(
            chatHistory = _uiState.value.chatHistory + Pair(prompt, true)
        )

        viewModelScope.launch {
            personalAgent.processUserIntent(prompt)
        }
    }

    fun setAssistantMode(mode: AIAssistantMode) {
        _uiState.value = _uiState.value.copy(assistantMode = mode)
        val prefersLocal = mode == AIAssistantMode.ON_DEVICE || mode == AIAssistantMode.HYBRID
        personalAgent.setLocalPreference(prefersLocal)
    }

    fun setVoiceListening(listening: Boolean) {
        _uiState.value = _uiState.value.copy(isVoiceListening = listening)
    }

    fun setVoiceSpeaking(speaking: Boolean) {
        _uiState.value = _uiState.value.copy(isVoiceSpeaking = speaking)
    }

    fun loadCareerData() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            val scoreRes = careerRepository.computeTalentScore(personalAgent.userId)
            val recsRes = careerRepository.getRecommendations(personalAgent.userId)

            _uiState.value = _uiState.value.copy(
                isLoading = false,
                talentScore = scoreRes.getOrDefault(88),
                recommendations = recsRes.getOrDefault(emptyList())
            )
        }
    }
}
