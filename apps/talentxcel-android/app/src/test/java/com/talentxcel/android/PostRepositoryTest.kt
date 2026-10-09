package com.talentxcel.android

import com.talentxcel.android.data.posts.PostRepositoryImpl
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class PostRepositoryTest {

    private lateinit var postRepository: PostRepositoryImpl

    @Before
    fun setup() {
        postRepository = PostRepositoryImpl(customPostgrest = null, prefs = null)
    }

    @Test
    fun getFeedPosts_returnsValidPostsList() = runBlocking {
        val result = postRepository.getFeedPosts(0, 10).first()
        assertTrue(result.isSuccess)
        val posts = result.getOrNull()
        assertNotNull(posts)
        assertTrue(posts!!.isNotEmpty())
    }

    /**
     * C-2 Security gate: createPost() must fail with SecurityException when the
     * user is not authenticated. In the test environment, SupabaseClientProvider is
     * not initialized, so auth.currentUserOrNull() returns null → SecurityException.
     * This assertion is RC-critical — it proves the auth guard exists and fires.
     */
    @Test
    fun createPost_requiresAuthentication_failsWhenUnauthenticated() = runBlocking {
        val content = "Architecting private on-device LLMs for enterprise mobile apps."
        val headline = "On-Device AI Milestone"
        val result = postRepository.createPost(content, headline)
        // Must fail — unauthenticated post creation is a security violation
        assertTrue(
            "C-2: createPost must return failure when user is not authenticated",
            result.isFailure
        )
        val exception = result.exceptionOrNull()
        assertNotNull("Must throw an exception", exception)
        assertTrue(
            "Must be a SecurityException: ${exception?.javaClass?.simpleName}",
            exception is SecurityException
        )
    }

    @Test
    fun toggleLike_togglesStateCorrectly() = runBlocking {
        val initialLiked = false
        val result1 = postRepository.toggleLike("post-1", initialLiked)
        assertTrue(result1.isSuccess)
        assertTrue(result1.getOrNull() == true)

        val result2 = postRepository.toggleLike("post-1", true)
        assertTrue(result2.isSuccess)
        assertTrue(result2.getOrNull() == false)
    }
}
