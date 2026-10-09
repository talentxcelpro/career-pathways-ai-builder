package com.talentxcel.android.presentation.post

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.talentxcel.android.domain.models.Post
import com.talentxcel.android.domain.repositories.PostRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class CreatePostUiState(
    val content: String = "",
    val headline: String = "",
    val selectedTags: Set<String> = emptySet(),
    val isPublishing: Boolean = false,
    val isSuccess: Boolean = false,
    val errorMessage: String? = null
)

class CreatePostViewModel(
    private val postRepository: PostRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(CreatePostUiState())
    val uiState: StateFlow<CreatePostUiState> = _uiState.asStateFlow()

    fun updateContent(newContent: String) {
        _uiState.value = _uiState.value.copy(content = newContent)
    }

    fun updateHeadline(newHeadline: String) {
        _uiState.value = _uiState.value.copy(headline = newHeadline)
    }

    fun toggleTag(tag: String) {
        val current = _uiState.value.selectedTags.toMutableSet()
        if (current.contains(tag)) {
            current.remove(tag)
        } else {
            current.add(tag)
        }
        _uiState.value = _uiState.value.copy(selectedTags = current)
    }

    fun publishPost() {
        val content = _uiState.value.content.trim()
        if (content.isBlank()) return

        val tagsSuffix = if (_uiState.value.selectedTags.isNotEmpty()) {
            "\n\n" + _uiState.value.selectedTags.joinToString(" ") { "#$it" }
        } else ""

        val finalContent = content + tagsSuffix

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isPublishing = true, errorMessage = null)
            val result = postRepository.createPost(
                content = finalContent,
                headline = _uiState.value.headline.takeIf { it.isNotBlank() }
            )
            result.onSuccess {
                _uiState.value = _uiState.value.copy(isPublishing = false, isSuccess = true)
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(
                    isPublishing = false,
                    errorMessage = error.localizedMessage ?: "Failed to publish post"
                )
            }
        }
    }
}
