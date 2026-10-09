package com.talentxcel.android

import com.talentxcel.android.core.ai.router.AIRequestRouter
import com.talentxcel.android.core.ai.router.ProcessingTarget
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test

class AIRequestRouterTest {

    private lateinit var router: AIRequestRouter

    @Before
    fun setUp() {
        router = AIRequestRouter()
    }

    @Test
    fun `when user asks to rewrite resume bullets, routes to LOCAL_ONLY if model is ready`() {
        val decision = router.route(
            prompt = "Rewrite this resume bullet point to make it more impactful",
            isLocalModelReady = true,
            isNetworkAvailable = true,
            userPrefersLocal = true
        )
        assertEquals(ProcessingTarget.LOCAL_ONLY, decision.target)
    }

    @Test
    fun `when user asks for latest live jobs, routes to HYBRID if local model ready`() {
        val decision = router.route(
            prompt = "Find me latest jobs matching my experience in Bengaluru",
            isLocalModelReady = true,
            isNetworkAvailable = true,
            userPrefersLocal = true
        )
        assertEquals(ProcessingTarget.HYBRID, decision.target)
    }

    @Test
    fun `when completely offline and local model is loaded, forces LOCAL_ONLY`() {
        val decision = router.route(
            prompt = "Prepare 3 interview questions for system architecture",
            isLocalModelReady = true,
            isNetworkAvailable = false,
            userPrefersLocal = true
        )
        assertEquals(ProcessingTarget.LOCAL_ONLY, decision.target)
    }

    @Test
    fun `when local model is not ready, routes to CLOUD_REQUIRED if online`() {
        val decision = router.route(
            prompt = "Analyze my career trajectory",
            isLocalModelReady = false,
            isNetworkAvailable = true,
            userPrefersLocal = true
        )
        assertEquals(ProcessingTarget.CLOUD_REQUIRED, decision.target)
    }
}
