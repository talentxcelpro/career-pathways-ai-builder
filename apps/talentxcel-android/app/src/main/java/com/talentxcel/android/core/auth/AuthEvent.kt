package com.talentxcel.android.core.auth

import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow

/**
 * R-2: Application-wide authentication event bus.
 *
 * Repositories emit AuthExpired when they detect a 401/JWT error.
 * The MainActivity / NavHost observes authEvents and routes to login.
 *
 * This prevents the silent fallback-data problem where a user with an
 * expired session believes they're seeing live production data.
 */
sealed class AuthEvent {
    /** JWT has expired or been invalidated — user must re-authenticate. */
    object AuthExpired : AuthEvent()

    /** User explicitly signed out. */
    object SignedOut : AuthEvent()
}

object AuthEventBus {
    private val _authEvents = MutableSharedFlow<AuthEvent>(extraBufferCapacity = 1)
    val authEvents: SharedFlow<AuthEvent> = _authEvents.asSharedFlow()

    /**
     * Emit an auth event. Safe to call from any coroutine context.
     * Uses tryEmit so it never suspends or throws if no subscriber yet.
     */
    fun emit(event: AuthEvent) {
        _authEvents.tryEmit(event)
    }
}
