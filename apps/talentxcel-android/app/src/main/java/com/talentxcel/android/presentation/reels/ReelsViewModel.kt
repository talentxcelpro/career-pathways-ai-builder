package com.talentxcel.android.presentation.reels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class CareerReel(
    val id: String,
    val authorName: String,
    val authorTitle: String,
    val authorAvatarUrl: String? = null,
    val caption: String,
    val tags: List<String>,
    val likesCount: Int,
    val isLiked: Boolean = false,
    val commentsCount: Int,
    val sharesCount: Int,
    val viewsCount: String,
    val duration: String,
    val category: String,
    val isSaved: Boolean = false,
    val videoUrl: String = ""
)

data class ReelsUiState(
    val isLoading: Boolean = false,
    val reels: List<CareerReel> = emptyList(),
    val selectedCategory: String = "All",
    val activeReelIndex: Int = 0,
    val isPlaying: Boolean = true
)

class ReelsViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(ReelsUiState(isLoading = true))
    val uiState: StateFlow<ReelsUiState> = _uiState.asStateFlow()

    private val sampleReels = listOf(
        CareerReel(
            id = "reel-1",
            authorName = "TalentXcel Services",
            authorTitle = "Director Operations • TalentXcel",
            caption = "views what jobs needed — Breaking down 2026 tech hiring criteria across UAE, Singapore & India. Here is what engineering directors look for in system design interviews.",
            tags = listOf("#CareerTips", "#TechHiring", "#Leadership", "#TalentXcel"),
            likesCount = 1420,
            commentsCount = 89,
            sharesCount = 312,
            viewsCount = "18.4K",
            duration = "0:45",
            category = "Interviews",
            videoUrl = "https://dthlgsnakhoftinssokm.supabase.co/storage/v1/object/public/avatars/5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062/1790344079995_ln50nw.mp4"
        ),
        CareerReel(
            id = "reel-2",
            authorName = "Aisha Khan",
            authorTitle = "Staff AI Architect • Ex-DeepMind",
            caption = "Why On-Device Gemini Nano changes mobile engineering: Zero cloud latency, 100% offline data privacy, and sub-100ms inference without GPU server costs.",
            tags = listOf("#GeminiNano", "#OnDeviceAI", "#SystemDesign", "#Android"),
            likesCount = 3890,
            commentsCount = 245,
            sharesCount = 820,
            viewsCount = "45.2K",
            duration = "1:12",
            category = "AI & ML",
            videoUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
        ),
        CareerReel(
            id = "reel-3",
            authorName = "Vikram Sen",
            authorTitle = "Principal Systems Engineer",
            caption = "Designing distributed rate limiters with Redis and Token Bucket algorithms. 3 subtle traps that cause cascading failure in high-throughput microservices.",
            tags = listOf("#SystemDesign", "#DistributedSystems", "#Architecture"),
            likesCount = 2150,
            commentsCount = 132,
            sharesCount = 540,
            viewsCount = "29.7K",
            duration = "0:58",
            category = "System Design",
            videoUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
        ),
        CareerReel(
            id = "reel-4",
            authorName = "David Lee",
            authorTitle = "VP of People & Talent",
            caption = "Salary Negotiation Masterclass: Never give the first number. How to use competing offers and total compensation equity modeling effectively.",
            tags = listOf("#SalaryNegotiation", "#CareerGrowth", "#TechCompensation"),
            likesCount = 4920,
            commentsCount = 412,
            sharesCount = 1205,
            viewsCount = "62.1K",
            duration = "1:05",
            category = "Career Growth",
            videoUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4"
        )
    )

    init {
        loadReels()
    }

    fun loadReels() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                isLoading = false,
                reels = sampleReels
            )
        }
    }

    fun selectCategory(category: String) {
        val filtered = if (category == "All") {
            sampleReels
        } else {
            sampleReels.filter { it.category.equals(category, ignoreCase = true) }
        }
        _uiState.value = _uiState.value.copy(
            selectedCategory = category,
            reels = if (filtered.isEmpty()) sampleReels else filtered
        )
    }

    fun toggleLike(reelId: String) {
        val updated = _uiState.value.reels.map { reel ->
            if (reel.id == reelId) {
                val newLiked = !reel.isLiked
                reel.copy(
                    isLiked = newLiked,
                    likesCount = if (newLiked) reel.likesCount + 1 else reel.likesCount - 1
                )
            } else reel
        }
        _uiState.value = _uiState.value.copy(reels = updated)
    }

    fun toggleSave(reelId: String) {
        val updated = _uiState.value.reels.map { reel ->
            if (reel.id == reelId) reel.copy(isSaved = !reel.isSaved) else reel
        }
        _uiState.value = _uiState.value.copy(reels = updated)
    }

    fun togglePlayPause() {
        _uiState.value = _uiState.value.copy(isPlaying = !_uiState.value.isPlaying)
    }
}
