package com.talentxcel.android.domain.repositories

import com.talentxcel.android.domain.models.Post
import kotlinx.coroutines.flow.Flow

interface PostRepository {
    fun getFeedPosts(page: Int = 0, limit: Int = 20): Flow<Result<List<Post>>>
    suspend fun createPost(content: String, headline: String? = null, mediaUrls: List<String> = emptyList()): Result<Post>
    suspend fun toggleLike(postId: String, currentLiked: Boolean): Result<Boolean>
}
