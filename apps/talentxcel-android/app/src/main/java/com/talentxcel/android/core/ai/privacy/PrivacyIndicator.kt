package com.talentxcel.android.core.ai.privacy

/**
 * Transparent visual indicators displayed to the user regarding how and where
 * their AI query was processed.
 */
sealed class PrivacyIndicator(
    val title: String,
    val description: String,
    val icon: String
) {
    object OnDevice : PrivacyIndicator(
        title = "On-Device AI",
        description = "Processed privately on this phone. No data left your device.",
        icon = "🔒"
    )

    object Cloud : PrivacyIndicator(
        title = "TalentXcel Cloud AI",
        description = "Processed securely via TalentXcel private edge intelligence.",
        icon = "☁"
    )

    object Hybrid : PrivacyIndicator(
        title = "Hybrid Intelligence",
        description = "Reasoned locally on-device with live cloud opportunity updates.",
        icon = "⚡"
    )
}
