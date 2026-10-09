package com.talentxcel.android.core.navigation

import android.net.Uri

sealed class NavigationTarget {
    data class JobDetail(val jobId: String) : NavigationTarget()
    object Applications : NavigationTarget()
    object Network : NavigationTarget()
    data class Profile(val slugOrId: String) : NavigationTarget()
    data class Passport(val username: String) : NavigationTarget()
    object Conversations : NavigationTarget()
    object CareerMap : NavigationTarget()
    object Notifications : NavigationTarget()
    object Career : NavigationTarget()
    object Reels : NavigationTarget()
    object Rewards : NavigationTarget()
    object Refer : NavigationTarget()
    object None : NavigationTarget()
}

/**
 * Parses incoming Android App Links (talentxcel.in) and custom URI schemes into app targets.
 */
object DeepLinkHandler {

    fun parse(uri: Uri?): NavigationTarget {
        if (uri == null) return NavigationTarget.None
        return parseComponents(uri.scheme, uri.host, uri.path)
    }

    fun parseUrl(urlString: String?): NavigationTarget {
        if (urlString.isNullOrBlank()) return NavigationTarget.None
        return try {
            val uri = java.net.URI.create(urlString)
            parseComponents(uri.scheme, uri.host, uri.path)
        } catch (e: Exception) {
            NavigationTarget.None
        }
    }

    fun parseComponents(scheme: String?, host: String?, path: String?): NavigationTarget {
        val safePath = path ?: ""

        // Handle https://talentxcel.in/*
        if (host == "talentxcel.in" || host == "www.talentxcel.in") {
            return when {
                safePath.startsWith("/jobs/") -> {
                    val jobId = safePath.removePrefix("/jobs/").trim()
                    if (jobId.isNotEmpty()) NavigationTarget.JobDetail(jobId) else NavigationTarget.None
                }
                safePath.startsWith("/passport/") -> {
                    val username = safePath.removePrefix("/passport/").trim()
                    if (username.isNotEmpty()) NavigationTarget.Passport(username) else NavigationTarget.None
                }
                safePath == "/passport" -> NavigationTarget.Passport("")
                safePath == "/applications" -> NavigationTarget.Applications
                safePath == "/network" -> NavigationTarget.Network
                safePath == "/messages" || safePath == "/conversations" -> NavigationTarget.Conversations
                safePath == "/career/map" -> NavigationTarget.CareerMap
                safePath.startsWith("/profile/") -> {
                    val slug = safePath.removePrefix("/profile/").trim()
                    NavigationTarget.Profile(slug)
                }
                safePath == "/notifications" -> NavigationTarget.Notifications
                safePath == "/career" -> NavigationTarget.Career
                safePath == "/reels" || safePath.startsWith("/mobile/reels") -> NavigationTarget.Reels
                safePath == "/rewards" || safePath == "/gamification" -> NavigationTarget.Rewards
                safePath == "/refer" || safePath == "/refer-and-earn" -> NavigationTarget.Refer
                else -> NavigationTarget.None
            }
        }

        // Handle custom scheme talentxcel://*
        if (scheme == "talentxcel") {
            return when {
                host == "notifications" -> NavigationTarget.Notifications
                host == "career" && safePath == "/map" -> NavigationTarget.CareerMap
                host == "career" -> NavigationTarget.Career
                host == "reels" -> NavigationTarget.Reels
                host == "rewards" || host == "gamification" -> NavigationTarget.Rewards
                host == "refer" || host == "refer-and-earn" -> NavigationTarget.Refer
                host == "applications" -> NavigationTarget.Applications
                host == "messages" || host == "conversations" -> NavigationTarget.Conversations
                host == "passport" -> {
                    val username = safePath.removePrefix("/").trim()
                    NavigationTarget.Passport(username)
                }
                host == "jobs" -> {
                    val jobId = safePath.removePrefix("/").trim()
                    if (jobId.isNotEmpty()) NavigationTarget.JobDetail(jobId) else NavigationTarget.None
                }
                else -> NavigationTarget.None
            }
        }

        return NavigationTarget.None
    }
}
