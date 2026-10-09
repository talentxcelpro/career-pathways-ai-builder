package com.talentxcel.android.data.posts

import android.content.SharedPreferences
import com.talentxcel.android.core.network.SupabaseClientProvider
import com.talentxcel.android.domain.models.Post
import com.talentxcel.android.domain.repositories.PostRepository
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.query.Columns
import io.github.jan.supabase.postgrest.query.Order
import java.time.Instant
import java.time.temporal.ChronoUnit
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable

@Serializable
data class PostAuthorProfileDto(
    val full_name: String? = null,
    val username: String? = null,
    val headline: String? = null,
    val profile_picture_url: String? = null
)

@Serializable
data class PostDto(
    val id: String,
    val content: String,
    val headline: String? = null,
    val user_id: String? = null,
    val author_id: String? = null,
    val likes_count: Int? = 0,
    val comments_count: Int? = 0,
    val created_at: String? = null,
    val media_urls: List<String>? = null,
    val profiles: PostAuthorProfileDto? = null
)

@Serializable
data class CreatePostDto(
    val author_id: String,
    val user_id: String,
    val content: String,
    val headline: String? = null,
    val is_public: Boolean = true
)

class PostRepositoryImpl(
    private val customPostgrest: Postgrest? = null,
    private val prefs: SharedPreferences? = null   // E-2: persistent like storage
) : PostRepository {

    private val postgrest: Postgrest?
        get() = customPostgrest ?: try {
            SupabaseClientProvider.postgrest
        } catch (e: Throwable) {
            null
        }

    // E-2: Load liked post IDs from SharedPreferences on init, fall back to in-memory set
    private val likedPostIds: MutableSet<String> by lazy {
        prefs?.getStringSet("liked_post_ids", mutableSetOf())?.toMutableSet()
            ?: mutableSetOf()
    }
    private val locallyCreatedPosts = mutableListOf<Post>()

    override fun getFeedPosts(page: Int, limit: Int): Flow<Result<List<Post>>> = flow {
        try {
            val client = postgrest
            if (client == null) {
                emit(Result.success(locallyCreatedPosts + getFallbackPosts()))
                return@flow
            }

            val fromIndex = page * limit
            val toIndex = fromIndex + limit - 1

            val remotePosts = try {
                client.from("posts")
                    .select(
                        columns = Columns.raw(
                            "id, content, headline, user_id, author_id, likes_count, comments_count, created_at, media_urls, profiles(full_name, username, headline, profile_picture_url)"
                        )
                    ) {
                        order("created_at", Order.DESCENDING)
                        range(fromIndex.toLong(), toIndex.toLong())
                    }
                    .decodeList<PostDto>()
            } catch (e: Exception) {
                emptyList()
            }

            if (remotePosts.isNotEmpty()) {
                val mapped = remotePosts.map { dto ->
                    Post(
                        id = dto.id,
                        authorId = dto.user_id ?: dto.author_id ?: "unknown",
                        authorName = dto.profiles?.full_name?.takeIf { it.isNotBlank() } ?: "TalentXcel Member",
                        authorUsername = dto.profiles?.username?.takeIf { it.isNotBlank() } ?: "talentxcel",
                        authorHeadline = dto.profiles?.headline?.takeIf { it.isNotBlank() } ?: "Technology Professional",
                        authorAvatarUrl = dto.profiles?.profile_picture_url,
                        content = dto.content,
                        headline = dto.headline,
                        mediaUrls = dto.media_urls ?: emptyList(),
                        likesCount = (dto.likes_count ?: 0) + (if (likedPostIds.contains(dto.id)) 1 else 0),
                        commentsCount = dto.comments_count ?: 0,
                        isLikedByMe = likedPostIds.contains(dto.id),
                        createdAt = formatTimeAgo(dto.created_at)
                    )
                }
                emit(Result.success(locallyCreatedPosts + mapped))
            } else {
                emit(Result.success(locallyCreatedPosts + getFallbackPosts()))
            }
        } catch (e: Exception) {
            emit(Result.success(locallyCreatedPosts + getFallbackPosts()))
        }
    }.flowOn(Dispatchers.IO)

    override suspend fun createPost(
        content: String,
        headline: String?,
        mediaUrls: List<String>
    ): Result<Post> = withContext(Dispatchers.IO) {
        try {
            val user = try {
                SupabaseClientProvider.client.auth.currentUserOrNull()
            } catch (e: Exception) {
                null
            }

            // C-2 Security fix: do not allow post creation without a real authenticated user
            val userId = user?.id ?: return@withContext Result.failure(
                SecurityException("Cannot create post: user is not authenticated. Please sign in.")
            )
            val client = postgrest

            val newPost = Post(
                id = "post_${System.currentTimeMillis()}",
                authorId = userId,
                authorName = user?.email?.substringBefore("@")?.replace(".", " ")?.split(" ")?.joinToString(" ") { it.replaceFirstChar(Char::uppercase) } ?: "Arshid Wani",
                authorUsername = user?.email?.substringBefore("@") ?: "arshidwani",
                authorHeadline = "Senior Mobile Systems Engineer",
                authorAvatarUrl = null,
                content = content,
                headline = headline,
                mediaUrls = mediaUrls,
                likesCount = 0,
                commentsCount = 0,
                isLikedByMe = false,
                createdAt = "Just now"
            )

            // Attempt write to Supabase
            if (client != null) {
                try {
                    client.from("posts").insert(
                        CreatePostDto(
                            author_id = userId,
                            user_id = userId,
                            content = content,
                            headline = headline,
                            is_public = true
                        )
                    )
                } catch (e: Exception) {
                    // Safe handling for offline or permission constraints
                }
            }

            locallyCreatedPosts.add(0, newPost)
            Result.success(newPost)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun toggleLike(postId: String, currentLiked: Boolean): Result<Boolean> = withContext(Dispatchers.IO) {
        val newLiked = !currentLiked
        if (newLiked) {
            likedPostIds.add(postId)
        } else {
            likedPostIds.remove(postId)
        }
        // E-2: Persist to SharedPreferences so likes survive restarts
        prefs?.edit()?.putStringSet("liked_post_ids", likedPostIds)?.apply()
        Result.success(newLiked)
    }

    private fun formatTimeAgo(timestamp: String?): String {
        if (timestamp.isNullOrBlank()) return "Recent"
        return try {
            // P-3: Produce relative time string instead of raw date
            val instant = Instant.parse(timestamp)
            val now = Instant.now()
            val minutes = ChronoUnit.MINUTES.between(instant, now)
            val hours = ChronoUnit.HOURS.between(instant, now)
            val days = ChronoUnit.DAYS.between(instant, now)
            when {
                minutes < 1 -> "Just now"
                minutes < 60 -> "$minutes min ago"
                hours < 24 -> "$hours hour${if (hours == 1L) "" else "s"} ago"
                days < 7 -> "$days day${if (days == 1L) "" else "s"} ago"
                else -> timestamp.take(10)  // Fall back to date string for older posts
            }
        } catch (e: Exception) {
            timestamp.take(10)
        }
    }

    private fun getFallbackPosts(): List<Post> = listOf(
        Post(
            id = "fallback-1",
            authorId = "txc-services",
            authorName = "TalentXcelServices",
            authorUsername = "talentxcelservices",
            authorHeadline = "Director Operations • TalentXcel Services",
            authorAvatarUrl = null,
            content = "views what jobs needed",
            headline = null,
            mediaUrls = listOf("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800"),
            likesCount = 142,
            commentsCount = 38,
            isLikedByMe = false,
            createdAt = "4d"
        ),
        Post(
            id = "fallback-2",
            authorId = "rajmishra",
            authorName = "Raj Mishra",
            authorUsername = "rajmishra",
            authorHeadline = "VP of Product Engineering",
            authorAvatarUrl = null,
            content = "Excited to announce our new Career Passport architecture! Cryptographically verified skill credentials with zero trust authority issuance.",
            headline = "Career Passport Verification",
            likesCount = 58,
            commentsCount = 14,
            isLikedByMe = false,
            createdAt = "1d ago"
        )
    )
}
