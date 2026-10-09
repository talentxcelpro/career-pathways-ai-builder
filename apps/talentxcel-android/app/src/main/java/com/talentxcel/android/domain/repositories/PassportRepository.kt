package com.talentxcel.android.domain.repositories

import com.talentxcel.android.domain.models.Passport
import kotlinx.coroutines.flow.Flow

interface PassportRepository {
    fun getMyPassport(): Flow<Result<Passport>>
    suspend fun getPassportByUsername(username: String): Result<Passport>
    suspend fun verifyPassportHash(hash: String): Result<Boolean>
}
