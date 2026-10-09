package com.talentxcel.android.data.auth

import com.talentxcel.android.core.auth.AuthState
import com.talentxcel.android.core.auth.SupabaseAuthManager
import com.talentxcel.android.domain.repositories.AuthRepository
import kotlinx.coroutines.flow.StateFlow

class AuthRepositoryImpl(
    private val authManager: SupabaseAuthManager
) : AuthRepository {

    override val authState: StateFlow<AuthState> = authManager.authState

    override suspend fun signIn(email: String, pass: String): Result<String> {
        return authManager.signInWithEmail(email, pass)
    }

    override suspend fun signUp(email: String, pass: String): Result<String> {
        return authManager.signUpWithEmail(email, pass)
    }

    override suspend fun resetPassword(email: String): Result<Unit> {
        return authManager.resetPassword(email)
    }

    override suspend fun signOut() {
        authManager.signOut()
    }
}
