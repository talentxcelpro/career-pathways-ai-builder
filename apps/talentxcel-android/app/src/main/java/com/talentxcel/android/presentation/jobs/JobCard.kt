package com.talentxcel.android.presentation.jobs

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.outlined.BookmarkBorder
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.talentxcel.android.domain.models.Job
import com.talentxcel.android.presentation.components.TXCBadge
import com.talentxcel.android.presentation.components.TXCCard
import com.talentxcel.android.presentation.theme.BrandBlue50
import com.talentxcel.android.presentation.theme.BrandBluePrimary
import com.talentxcel.android.presentation.theme.TextMuted
import com.talentxcel.android.presentation.theme.TextPrimary
import com.talentxcel.android.presentation.theme.TextSecondary
import com.talentxcel.android.presentation.theme.TalentXcelTypography

@Composable
fun JobCard(
    job: Job,
    onClick: () -> Unit,
    onToggleSave: () -> Unit,
    modifier: Modifier = Modifier
) {
    TXCCard(
        modifier = modifier
            .fillMaxWidth()
            .clickable { onClick() }
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.Top
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = job.title,
                    style = TalentXcelTypography.titleLarge,
                    color = TextPrimary
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = "${job.company} • ${job.location}",
                    style = TalentXcelTypography.bodyMedium,
                    color = TextSecondary
                )
            }

            IconButton(onClick = onToggleSave) {
                Icon(
                    imageVector = if (job.isSaved) Icons.Default.Bookmark else Icons.Outlined.BookmarkBorder,
                    contentDescription = "Save job",
                    tint = if (job.isSaved) BrandBluePrimary else TextMuted
                )
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        Row(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            TXCBadge(
                text = job.workMode,
                bgColor = BrandBlue50,
                textColor = BrandBluePrimary
            )
            TXCBadge(
                text = job.employmentType,
                bgColor = BrandBlue50,
                textColor = BrandBluePrimary
            )
            if (job.matchScore != null) {
                TXCBadge(
                    text = "${job.matchScore}% Match",
                    bgColor = BrandBlue50,
                    textColor = BrandBluePrimary
                )
            }
        }

        if (job.salaryMin != null && job.salaryMax != null) {
            Spacer(modifier = Modifier.height(8.dp))
            val minLakh = job.salaryMin / 100000.0
            val maxLakh = job.salaryMax / 100000.0
            Text(
                text = "₹%.1fL - ₹%.1fL PA".format(minLakh, maxLakh),
                style = TalentXcelTypography.labelLarge,
                color = TextPrimary
            )
        }
    }
}
