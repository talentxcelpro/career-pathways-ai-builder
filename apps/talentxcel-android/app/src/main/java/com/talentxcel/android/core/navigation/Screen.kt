package com.talentxcel.android.core.navigation

sealed class Screen(val route: String) {
    // Auth Routes
    object Splash : Screen("splash")
    object Login : Screen("login")
    object Register : Screen("register")
    object ForgotPassword : Screen("forgot_password")

    // Main App Bottom Bar Routes
    object Home : Screen("home")
    object Jobs : Screen("jobs")
    object Network : Screen("network")
    object Career : Screen("career")
    object Profile : Screen("profile")

    // Sub-screens & Details
    object JobDetail : Screen("jobs/{jobId}") {
        fun createRoute(jobId: String) = "jobs/$jobId"
    }
    object Applications : Screen("applications")
    object EditProfile : Screen("profile/edit")
    object Notifications : Screen("notifications")
    object Settings : Screen("settings")
    object AIPrivacySettings : Screen("settings/ai_privacy")

    // Phase 1A: Career Passport
    object Passport : Screen("passport")
    object ScanPassport : Screen("passport/scan")

    // Phase 1B: Resume & ATS Hub
    object ResumeHub : Screen("resume")
    object AtsScanner : Screen("resume/ats/{resumeId}") {
        fun createRoute(resumeId: String) = "resume/ats/$resumeId"
    }

    // Phase 2A: Career Pathways Map
    object CareerMap : Screen("career/map")

    // Phase 2B: Direct 1:1 Messaging
    object Conversations : Screen("conversations")
    object DirectMessage : Screen("conversations/{conversationId}?recipientName={recipientName}&recipientId={recipientId}") {
        fun createRoute(conversationId: String, recipientName: String, recipientId: String) =
            "conversations/$conversationId?recipientName=$recipientName&recipientId=$recipientId"
    }

    // Phase 2C: Native Post Composer
    object CreatePost : Screen("post/create")

    // Phase 3 & Growth Ecosystem
    object Reels : Screen("reels")
    object Rewards : Screen("rewards")
    object Refer : Screen("refer")
}
