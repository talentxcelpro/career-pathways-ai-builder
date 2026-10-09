package com.talentxcel.android.presentation.applications

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.talentxcel.android.domain.models.Application
import com.talentxcel.android.domain.models.ApplicationStatus
import com.talentxcel.android.presentation.components.TXCBadge
import com.talentxcel.android.presentation.components.TXCCard
import com.talentxcel.android.presentation.theme.StatusInterviewBg
import com.talentxcel.android.presentation.theme.StatusInterviewText
import com.talentxcel.android.presentation.theme.StatusPendingBg
import com.talentxcel.android.presentation.theme.StatusPendingText
import com.talentxcel.android.presentation.theme.StatusRejectedBg
import com.talentxcel.android.presentation.theme.StatusRejectedText
import com.talentxcel.android.presentation.theme.StatusSuccessBg
import com.talentxcel.android.presentation.theme.StatusSuccessText
import com.talentxcel.android.presentation.theme.TextMuted
import com.talentxcel.android.presentation.theme.TextPrimary
import com.talentxcel.android.presentation.theme.TextSecondary
import com.talentxcel.android.presentation.theme.TalentXcelTypography

@Composable
fun ApplicationCard(
    application: Application,
    modifier: Modifier = Modifier
) {
    val (badgeBg, badgeText) = when (application.status) {
        ApplicationStatus.INTERVIEW -> Pair(StatusInterviewBg, StatusInterviewText)
        ApplicationStatus.SHORTLISTED, ApplicationStatus.SELECTED -> Pair(StatusSuccessBg, StatusSuccessText)
        ApplicationStatus.REJECTED, ApplicationStatus.WITHDRAWN -> Pair(StatusRejectedBg, StatusRejectedText)
        else -> Pair(StatusPendingBg, StatusPendingText)
    }

    TXCCard(modifier = modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.Top
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = application.jobTitle,
                    style = TalentXcelTypography.titleLarge,
                    color = TextPrimary
                )
                Text(
                    text = application.company,
                    style = TalentXcelTypography.bodyMedium,
                    color = TextSecondary
                )
            }
            TXCBadge(
                text = application.status.displayName,
                bgColor = badgeBg,
                textColor = badgeText
            )
        }

        Spacer(modifier = Modifier.height(10.dp))

        Text(
            text = application.lastUpdate,
            style = TalentXcelTypography.bodySmall,
            color = TextSecondary
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = "Applied: ${application.appliedAt}",
            style = TalentXcelTypography.bodySmall,
            color = TextMuted
        )
    }
}
