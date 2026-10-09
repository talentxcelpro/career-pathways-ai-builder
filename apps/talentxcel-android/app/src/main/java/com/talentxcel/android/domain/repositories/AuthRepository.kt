package com.talentxcel.android.domain.repositories

import com.talentxcel.android.core.auth.AuthState
import kotlinx.coroutines.flow.StateFlow

interface AuthRepository {
    val authState: StateFlow<AuthState>
    suspend fun signIn(email: String, pass: String): Result<String>
    suspend fun signUp(email: String, pass: String): Result<String>
    suspend fun resetPassword(email: String): Result<Unit>
    suspend fun signOut()
}
