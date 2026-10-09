package com.talentxcel.android.presentation.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.talentxcel.android.domain.models.Application
import com.talentxcel.android.domain.models.Job
import com.talentxcel.android.domain.models.Post
import com.talentxcel.android.domain.models.Profile
import com.talentxcel.android.domain.repositories.ApplicationRepository
import com.talentxcel.android.domain.repositories.JobRepository
import com.talentxcel.android.domain.repositories.PostRepository
import com.talentxcel.android.domain.repositories.ProfileRepository
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class HomeUiState(
    val isLoading: Boolean = true,
    val profile: Profile? = null,
    val posts: List<Post> = emptyList(),
    val recommendedJobs: List<Job> = emptyList(),
    val recentApplications: List<Application> = emptyList(),
    val unreadNotificationsCount: Int = 2,
    val unreadMessagesCount: Int = 1,
    val errorMessage: String? = null
)

class HomeViewModel(
    private val profileRepository: ProfileRepository,
    private val jobRepository: JobRepository,
    private val applicationRepository: ApplicationRepository,
    private val postRepository: PostRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    fun loadDashboard(userId: String) {
        viewModelScope.launch {
            if (_uiState.value.posts.isEmpty()) {
                _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            }

            val profileDeferred = async { profileRepository.getProfile(userId) }
            val jobsDeferred = async { jobRepository.getRecommendedJobs(userId) }
            val appsDeferred = async { applicationRepository.getMyApplications(userId) }

            launch {
                postRepository.getFeedPosts().collect { postsResult ->
                    val posts = postsResult.getOrDefault(emptyList())
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        posts = posts
                    )
                }
            }

            val profile = profileDeferred.await().getOrNull()
            val jobs = jobsDeferred.await().getOrDefault(emptyList())
            val apps = appsDeferred.await().getOrDefault(emptyList())

            _uiState.value = _uiState.value.copy(
                isLoading = false,
                profile = profile,
                recommendedJobs = jobs,
                recentApplications = apps,
                unreadNotificationsCount = 2,
                unreadMessagesCount = 1
            )
        }
    }

    fun toggleLike(postId: String) {
        val currentPosts = _uiState.value.posts.toMutableList()
        val index = currentPosts.indexOfFirst { it.id == postId }
        if (index != -1) {
            val post = currentPosts[index]
            val newLiked = !post.isLikedByMe
            val newCount = post.likesCount + (if (newLiked) 1 else -1)
            currentPosts[index] = post.copy(
                isLikedByMe = newLiked,
                likesCount = newCount.coerceAtLeast(0)
            )
            _uiState.value = _uiState.value.copy(posts = currentPosts)

            viewModelScope.launch {
                postRepository.toggleLike(postId, post.isLikedByMe)
            }
        }
    }
}
