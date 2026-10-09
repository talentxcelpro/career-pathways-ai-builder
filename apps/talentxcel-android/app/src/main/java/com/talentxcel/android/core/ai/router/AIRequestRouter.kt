package com.talentxcel.android.core.ai.router

/**
 * Programmatic request router evaluating whether a user query can and should
 * be resolved purely on-device, requires cloud retrieval, or is a hybrid flow.
 */
class AIRequestRouter {

    companion object {
        private val CLOUD_KEYWORDS = listOf(
            "latest jobs", "new jobs", "live jobs", "search jobs",
            "market salary", "who viewed my profile", "application status",
            "recruiters online", "global trends", "recommend new companies"
        )

        private val LOCAL_KEYWORDS = listOf(
            "rewrite", "bullet", "summarize resume", "interview prep",
            "mock questions", "draft message", "my skills", "brainstorm",
            "strengths", "cover letter draft", "explain job requirements"
        )
    }

    fun route(
        prompt: String,
        isLocalModelReady: Boolean,
        isNetworkAvailable: Boolean,
        userPrefersLocal: Boolean = true
    ): RoutingDecision {
        val normalized = prompt.lowercase()

        // 1. If user asks for real-time/global platform data
        val requiresCloud = CLOUD_KEYWORDS.any { normalized.contains(it) }
        if (requiresCloud) {
            return if (isLocalModelReady) {
                RoutingDecision(
                    target = ProcessingTarget.HYBRID,
                    reason = "Requires live cloud job data paired with private local profile reasoning."
                )
            } else {
                RoutingDecision(
                    target = ProcessingTarget.CLOUD_REQUIRED,
                    reason = "Requires live TalentXcel database records and cloud intelligence."
                )
            }
        }

        // 2. If completely offline, force local if model is available
        if (!isNetworkAvailable) {
            return if (isLocalModelReady) {
                RoutingDecision(
                    target = ProcessingTarget.LOCAL_ONLY,
                    reason = "Offline mode active. Running private on-device inference."
                )
            } else {
                RoutingDecision(
                    target = ProcessingTarget.LOCAL_ONLY,
                    reason = "No connection and local model not downloaded.",
                    requiresUserApproval = true
                )
            }
        }

        // 3. User tasks suited for private on-device generation
        val isLocalTask = LOCAL_KEYWORDS.any { normalized.contains(it) }
        return if (isLocalTask && isLocalModelReady) {
            RoutingDecision(
                target = ProcessingTarget.LOCAL_ONLY,
                reason = "Private task resolved entirely on-device without cloud transmission."
            )
        } else if (isLocalModelReady && userPrefersLocal) {
            RoutingDecision(
                target = ProcessingTarget.LOCAL_ONLY,
                reason = "Privacy-first preference: attempting local on-device inference."
            )
        } else {
            RoutingDecision(
                target = ProcessingTarget.CLOUD_REQUIRED,
                reason = "Complex reasoning dispatched to TalentXcel secure edge service."
            )
        }
    }
}
