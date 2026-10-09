package com.talentxcel.android.core.auth

import com.talentxcel.android.core.network.SupabaseClientProvider
import com.talentxcel.android.core.security.SecureStorage
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.auth.providers.builtin.Email
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Manages Supabase GoTrue authentication lifecycle, session recovery, and token synchronization.
 */
class SupabaseAuthManager {

    private val auth = SupabaseClientProvider.auth

    private val _authState = MutableStateFlow<AuthState>(AuthState.Initializing)
    val authState: StateFlow<AuthState> = _authState.asStateFlow()

    init {
        restoreSession()
    }

    private fun restoreSession() {
        if (SecureStorage.hasValidSession()) {
            val userId = SecureStorage.userId ?: ""
            val email = SecureStorage.userEmail ?: ""
            _authState.value = AuthState.Authenticated(userId, email)
        } else {
            _authState.value = AuthState.Unauthenticated
        }
    }

    suspend fun signInWithEmail(email: String, pass: String): Result<String> {
        return try {
            auth.signInWith(Email) {
                this.email = email
                this.password = pass
            }

            val session = auth.currentSessionOrNull()
            if (session != null) {
                val userId = session.user?.id ?: ""
                val userEmail = session.user?.email ?: email
                val accessToken = session.accessToken
                val refreshToken = session.refreshToken

                SecureStorage.saveSession(userId, userEmail, accessToken, refreshToken)
                _authState.value = AuthState.Authenticated(userId, userEmail)
                Result.success(userId)
            } else {
                Result.failure(Exception("Authentication session could not be established."))
            }
        } catch (e: Exception) {
            _authState.value = AuthState.Error(e.localizedMessage ?: "Sign in failed")
            Result.failure(e)
        }
    }

    suspend fun signUpWithEmail(email: String, pass: String): Result<String> {
        return try {
            auth.signUpWith(Email) {
                this.email = email
                this.password = pass
            }
            Result.success("Verification email dispatched. Please check your inbox.")
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun resetPassword(email: String): Result<Unit> {
        return try {
            auth.resetPasswordForEmail(email)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun signOut() {
        try {
            auth.signOut()
        } catch (_: Exception) {}
        SecureStorage.clearSession()
        _authState.value = AuthState.Unauthenticated
    }
}
