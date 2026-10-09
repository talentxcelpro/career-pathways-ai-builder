package com.talentxcel.android.presentation.rewards

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class CareerQuest(
    val id: String,
    val title: String,
    val xpReward: Int,
    val progress: Int,
    val totalRequired: Int,
    val isCompleted: Boolean = false
)

data class MilestoneBadge(
    val id: String,
    val title: String,
    val description: String,
    val iconEmoji: String,
    val isUnlocked: Boolean
)

data class RedeemablePerk(
    val id: String,
    val title: String,
    val description: String,
    val coinCost: Int,
    val isRedeemed: Boolean = false
)

data class RewardsUiState(
    val isLoading: Boolean = false,
    val currentStreakDays: Int = 7,
    val isStreakClaimedToday: Boolean = false,
    val currentLevel: Int = 4,
    val levelTitle: String = "Senior Tech Strategist",
    val currentXp: Int = 1450,
    val targetXp: Int = 2000,
    val totalCoins: Int = 320,
    val quests: List<CareerQuest> = emptyList(),
    val badges: List<MilestoneBadge> = emptyList(),
    val perks: List<RedeemablePerk> = emptyList(),
    val claimSuccessMessage: String? = null
)

class RewardsViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(RewardsUiState(isLoading = true))
    val uiState: StateFlow<RewardsUiState> = _uiState.asStateFlow()

    init {
        loadRewards()
    }

    fun loadRewards() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                isLoading = false,
                currentStreakDays = 7,
                isStreakClaimedToday = false,
                currentLevel = 4,
                levelTitle = "Senior Tech Strategist",
                currentXp = 1450,
                targetXp = 2000,
                totalCoins = 320,
                quests = listOf(
                    CareerQuest("q-1", "Consult Gemini On-Device AI for career coaching", 50, 1, 1, true),
                    CareerQuest("q-2", "Scan resume against 1 target job description", 100, 1, 1, true),
                    CareerQuest("q-3", "Watch and like 3 Career Reels", 75, 2, 3, false),
                    CareerQuest("q-4", "Share your referral link with a colleague", 200, 0, 1, false)
                ),
                badges = listOf(
                    MilestoneBadge("b-1", "AI Pioneer", "Configured INT8 Gemini Nano local weights", "🤖", true),
                    MilestoneBadge("b-2", "Career Passport", "Generated verified cryptographic QR badge", "🪪", true),
                    MilestoneBadge("b-3", "ATS 85+ Match", "Optimized CV to surpass 85% ATS score", "🎯", true),
                    MilestoneBadge("b-4", "Week Warrior", "Maintained 7 consecutive active days", "🔥", true),
                    MilestoneBadge("b-5", "Viral Ambassador", "Invite 5 peers to join TalentXcel", "👑", false)
                ),
                perks = listOf(
                    RedeemablePerk("p-1", "1-Month TalentXcel Pro Upgrade", "Free access to advanced recruiter analytics & AI tools", 1000),
                    RedeemablePerk("p-2", "Featured Spotlight in Recruiter OS", "Pin your profile to top recruiter search results for 14 days", 500),
                    RedeemablePerk("p-3", "Unlimited ATS Exports", "Download ATS-compliant customized PDF resumes anytime", 250)
                )
            )
        }
    }

    fun claimDailyStreak() {
        if (_uiState.value.isStreakClaimedToday) return
        val updatedXp = _uiState.value.currentXp + 50
        val updatedCoins = _uiState.value.totalCoins + 25
        _uiState.value = _uiState.value.copy(
            isStreakClaimedToday = true,
            currentXp = updatedXp,
            totalCoins = updatedCoins,
            claimSuccessMessage = "🔥 +50 XP and +25 Coins claimed! 7-day streak intact!"
        )
    }

    fun redeemPerk(perkId: String) {
        val perk = _uiState.value.perks.find { it.id == perkId } ?: return
        if (_uiState.value.totalCoins >= perk.coinCost) {
            val updatedCoins = _uiState.value.totalCoins - perk.coinCost
            val updatedPerks = _uiState.value.perks.map {
                if (it.id == perkId) it.copy(isRedeemed = true) else it
            }
            _uiState.value = _uiState.value.copy(
                totalCoins = updatedCoins,
                perks = updatedPerks,
                claimSuccessMessage = "🎉 Successfully unlocked: ${perk.title}!"
            )
        } else {
            _uiState.value = _uiState.value.copy(
                claimSuccessMessage = "⚠️ Need ${perk.coinCost - _uiState.value.totalCoins} more coins to unlock this perk."
            )
        }
    }

    fun clearMessage() {
        _uiState.value = _uiState.value.copy(claimSuccessMessage = null)
    }
}
