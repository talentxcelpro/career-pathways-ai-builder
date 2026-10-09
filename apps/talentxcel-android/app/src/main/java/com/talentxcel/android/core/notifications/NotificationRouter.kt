package com.talentxcel.android.core.notifications

enum class NotificationCategory {
    NEW_JOB_MATCH,
    APPLICATION_UPDATE,
    CONNECTION_REQUEST,
    NEW_CONNECTION,
    PROFILE_VIEW,
    NEW_MESSAGE,
    CAREER_RECOMMENDATION,
    RESUME_UPDATE,
    SYSTEM_UPDATE
}

data class ResolvedNotificationRoute(
    val category: NotificationCategory,
    val deepLinkUri: String
)

/**
 * Resolves FCM push notification categories and payloads into exact deep-link navigation routes.
 */
object NotificationRouter {

    fun resolveRoute(type: String?, payload: Map<String, String>): ResolvedNotificationRoute {
        return when (type) {
            "NEW_JOB_MATCH" -> {
                val jobId = payload["job_id"] ?: ""
                ResolvedNotificationRoute(
                    category = NotificationCategory.NEW_JOB_MATCH,
                    deepLinkUri = "https://talentxcel.in/jobs/$jobId"
                )
            }
            "APPLICATION_UPDATE" -> {
                val appId = payload["application_id"] ?: ""
                ResolvedNotificationRoute(
                    category = NotificationCategory.APPLICATION_UPDATE,
                    deepLinkUri = "https://talentxcel.in/applications"
                )
            }
            "CONNECTION_REQUEST", "NEW_CONNECTION" -> {
                ResolvedNotificationRoute(
                    category = NotificationCategory.CONNECTION_REQUEST,
                    deepLinkUri = "https://talentxcel.in/network"
                )
            }
            "CAREER_RECOMMENDATION" -> {
                ResolvedNotificationRoute(
                    category = NotificationCategory.CAREER_RECOMMENDATION,
                    deepLinkUri = "talentxcel://career"
                )
            }
            else -> {
                ResolvedNotificationRoute(
                    category = NotificationCategory.SYSTEM_UPDATE,
                    deepLinkUri = "talentxcel://notifications"
                )
            }
        }
    }
}
