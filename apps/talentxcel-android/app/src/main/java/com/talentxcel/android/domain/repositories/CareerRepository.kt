package com.talentxcel.android.domain.repositories

import com.talentxcel.android.domain.models.CareerPathway
import com.talentxcel.android.domain.models.CareerRecommendation

interface CareerRepository {
    suspend fun getRecommendations(userId: String): Result<List<CareerRecommendation>>
    suspend fun computeTalentScore(userId: String): Result<Int>
    suspend fun getCareerPathway(userId: String): Result<CareerPathway>
}
