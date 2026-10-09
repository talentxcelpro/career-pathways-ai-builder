package com.talentxcel.android.presentation.jobs

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.talentxcel.android.domain.models.Job
import com.talentxcel.android.domain.repositories.ApplicationRepository
import com.talentxcel.android.domain.repositories.JobRepository
import com.talentxcel.android.presentation.components.LoadingState
import com.talentxcel.android.presentation.components.TXCBadge
import com.talentxcel.android.presentation.components.TXCCard
import com.talentxcel.android.presentation.components.TXCChip
import com.talentxcel.android.presentation.components.TXCPrimaryButton
import com.talentxcel.android.presentation.theme.BgLight
import com.talentxcel.android.presentation.theme.BorderSubtle
import com.talentxcel.android.presentation.theme.BrandBlue50
import com.talentxcel.android.presentation.theme.BrandBluePrimary
import com.talentxcel.android.presentation.theme.SurfaceWhite
import com.talentxcel.android.presentation.theme.TextMuted
import com.talentxcel.android.presentation.theme.TextPrimary
import com.talentxcel.android.presentation.theme.TextSecondary
import com.talentxcel.android.presentation.theme.TalentXcelTypography
import kotlinx.coroutines.launch

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun JobDetailScreen(
    jobId: String,
    jobRepository: JobRepository,
    applicationRepository: ApplicationRepository,
    onNavigateBack: () -> Unit
) {
    var job by remember { mutableStateOf<Job?>(null) }
    var isLoading by remember { mutableStateOf(true) }
    var showApplyDialog by remember { mutableStateOf(false) }
    var isApplied by remember { mutableStateOf(false) }
    var isApplying by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(jobId) {
        val result = jobRepository.getJobById(jobId)
        job = result.getOrNull()
        isLoading = false
    }

    if (isLoading) {
        LoadingState(message = "Loading job details...")
        return
    }

    val currentJob = job
    if (currentJob == null) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("Job not found", style = TalentXcelTypography.titleLarge)
        }
        return
    }

    if (showApplyDialog) {
        AlertDialog(
            onDismissRequest = { showApplyDialog = false },
            title = { Text("Submit Application", style = TalentXcelTypography.titleLarge) },
            text = {
                Text(
                    "Apply to ${currentJob.title} at ${currentJob.company} using your verified TalentXcel profile and ATS resume?",
                    style = TalentXcelTypography.bodyMedium
                )
            },
            confirmButton = {
                TXCPrimaryButton(
                    text = "Confirm & Apply",
                    isLoading = isApplying,
                    onClick = {
                        scope.launch {
                            isApplying = true
                            applicationRepository.applyToJob("current_user", currentJob.id)
                            isApplying = false
                            showApplyDialog = false
                            isApplied = true
                        }
                    }
                )
            },
            dismissButton = {
                TextButton(onClick = { showApplyDialog = false }) {
                    Text("Cancel", style = TalentXcelTypography.bodyMedium)
                }
            }
        )
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BgLight)
    ) {
        // Top App Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(SurfaceWhite)
                .padding(horizontal = 8.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            IconButton(onClick = onNavigateBack) {
                Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back")
            }
            Text(
                text = "Job Specifications",
                style = TalentXcelTypography.titleMedium,
                color = TextPrimary
            )
            IconButton(onClick = { /* Share link */ }) {
                Icon(imageVector = Icons.Default.Share, contentDescription = "Share")
            }
        }

        Column(
            modifier = Modifier
                .weight(1f)
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            TXCCard(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = currentJob.title,
                    style = TalentXcelTypography.headlineMedium,
                    color = TextPrimary
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "${currentJob.company} • ${currentJob.location}",
                    style = TalentXcelTypography.titleMedium,
                    color = TextSecondary
                )

                Spacer(modifier = Modifier.height(12.dp))

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    TXCBadge(
                        text = currentJob.workMode,
                        bgColor = BrandBlue50,
                        textColor = BrandBluePrimary
                    )
                    TXCBadge(
                        text = currentJob.employmentType,
                        bgColor = BrandBlue50,
                        textColor = BrandBluePrimary
                    )
                    if (currentJob.matchScore != null) {
                        TXCBadge(
                            text = "${currentJob.matchScore}% Match",
                            bgColor = BrandBlue50,
                            textColor = BrandBluePrimary
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Skills Section
            if (currentJob.skills.isNotEmpty()) {
                TXCCard(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "Desired Technical Competencies",
                        style = TalentXcelTypography.titleMedium,
                        color = TextPrimary
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    FlowRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        currentJob.skills.forEach { skill ->
                            TXCChip(text = skill)
                        }
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
            }

            // Description Section
            TXCCard(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "Role Overview",
                    style = TalentXcelTypography.titleMedium,
                    color = TextPrimary
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = currentJob.description,
                    style = TalentXcelTypography.bodyLarge,
                    color = TextSecondary
                )

                if (currentJob.requirements != null) {
                    Spacer(modifier = Modifier.height(16.dp))
                    Divider(color = BorderSubtle)
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Core Requirements",
                        style = TalentXcelTypography.titleMedium,
                        color = TextPrimary
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = currentJob.requirements,
                        style = TalentXcelTypography.bodyLarge,
                        color = TextSecondary
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
        }

        // Bottom CTA Bar
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(SurfaceWhite)
                .padding(16.dp)
        ) {
            TXCPrimaryButton(
                text = if (isApplied) "Application Submitted ✓" else "Apply with TalentXcel Profile",
                enabled = !isApplied,
                onClick = { showApplyDialog = true },
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}
