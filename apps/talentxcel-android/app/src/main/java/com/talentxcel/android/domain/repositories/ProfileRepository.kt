package com.talentxcel.android.domain.repositories

import com.talentxcel.android.domain.models.Profile

interface ProfileRepository {
    suspend fun getProfile(userId: String): Result<Profile>
    suspend fun updateProfile(profile: Profile): Result<Profile>
}
