package com.talentxcel.android.domain.models

data class Post(
    val id: String,
    val authorId: String,
    val authorName: String,
    val authorUsername: String,
    val authorHeadline: String,
    val authorAvatarUrl: String? = null,
    val content: String,
    val headline: String? = null,
    val mediaUrls: List<String> = emptyList(),
    val likesCount: Int = 0,
    val commentsCount: Int = 0,
    val isLikedByMe: Boolean = false,
    val createdAt: String = "Just now"
)
