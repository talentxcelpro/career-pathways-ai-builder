package com.talentxcel.android.core.ai.privacy

import java.util.regex.Pattern

/**
 * Enforces privacy-first principles and strict data minimization before any data
 * is dispatched to remote or hybrid AI providers.
 */
object AIPrivacyGuard {

    private val PHONE_PATTERN = Pattern.compile("\\b(\\+?[0-9]{1,3}[- ]?)?([0-9]{10}|[0-9]{3}[- ][0-9]{3}[- ][0-9]{4})\\b")
    private val EMAIL_PATTERN = Pattern.compile("[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+")
    private val TOKEN_PATTERN = Pattern.compile("eyJ[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}")

    /**
     * Sanitizes user input before passing to cloud models when cloud processing is required.
     * Replaces direct contact PII and authentication tokens with anonymized placeholders.
     */
    fun minimizeForCloud(rawPrompt: String): String {
        var sanitized = rawPrompt
        sanitized = TOKEN_PATTERN.matcher(sanitized).replaceAll("[AUTH_TOKEN_REDACTED]")
        sanitized = EMAIL_PATTERN.matcher(sanitized).replaceAll("[EMAIL_REDACTED]")
        sanitized = PHONE_PATTERN.matcher(sanitized).replaceAll("[PHONE_REDACTED]")
        return sanitized
    }

    /**
     * Validates that only required context fields are included for a specific task.
     */
    fun extractMinimalContext(
        skills: List<String>?,
        targetRole: String?,
        experienceYears: Int?
    ): Map<String, Any?> {
        val minimalContext = mutableMapOf<String, Any?>()
        skills?.let { minimalContext["skills"] = it.take(15) }
        targetRole?.let { minimalContext["targetRole"] = it }
        experienceYears?.let { minimalContext["experienceYears"] = it }
        return minimalContext
    }
}
