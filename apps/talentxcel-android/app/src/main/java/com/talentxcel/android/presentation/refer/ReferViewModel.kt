package com.talentxcel.android.presentation.refer

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class ReferralTier(
    val requiredReferrals: Int,
    val title: String,
    val description: String,
    val isUnlocked: Boolean = false
)

data class ReferralRecord(
    val id: String,
    val peerName: String,
    val peerRole: String,
    val dateText: String,
    val status: String, // "Completed" | "Pending"
    val rewardCoins: Int
)

data class ReferUiState(
    val isLoading: Boolean = false,
    val referralCode: String = "TXC-ARSHID-2026",
    val referralUrl: String = "https://talentxcel.in/join?ref=TXC-ARSHID-2026",
    val totalReferralsCount: Int = 3,
    val totalCoinsEarned: Int = 300,
    val tiers: List<ReferralTier> = emptyList(),
    val referralHistory: List<ReferralRecord> = emptyList(),
    val copiedToClipboard: Boolean = false
)

class ReferViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(ReferUiState(isLoading = true))
    val uiState: StateFlow<ReferUiState> = _uiState.asStateFlow()

    init {
        loadReferralData()
    }

    fun loadReferralData() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                isLoading = false,
                referralCode = "TXC-ARSHID-2026",
                referralUrl = "https://talentxcel.in/join?ref=TXC-ARSHID-2026",
                totalReferralsCount = 3,
                totalCoinsEarned = 300,
                tiers = listOf(
                    ReferralTier(5, "Early Access to Paid AI Tools", "Get priority access to next-gen AI career tools", false),
                    ReferralTier(25, "1-Month Pro Upgrade", "Full TalentXcel Pro membership for 1 month", false),
                    ReferralTier(100, "2-Month Pro Membership", "Extended Pro access and recruiter spotlight for 2 months", false),
                    ReferralTier(300, "3-Month Pro Membership", "Full VIP membership with unlimited AI resume tailoring", false),
                    ReferralTier(400, "4-Month Pro + Exclusive AI Engine", "Direct access to high-tier Gemini model reasoning", false)
                ),
                referralHistory = listOf(
                    ReferralRecord("r-1", "Priya Sharma", "Product Manager", "2 days ago", "Completed", 100),
                    ReferralRecord("r-2", "David Lee", "Tech Recruiter", "4 days ago", "Completed", 100),
                    ReferralRecord("r-3", "Aisha Khan", "Staff Software Engineer", "1 week ago", "Completed", 100),
                    ReferralRecord("r-4", "Vikram Sen", "AI Architect", "Sent yesterday", "Pending", 0)
                )
            )
        }
    }

    fun setCopiedState(copied: Boolean) {
        _uiState.value = _uiState.value.copy(copiedToClipboard = copied)
    }
}
