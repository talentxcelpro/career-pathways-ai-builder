package com.talentxcel.android.presentation.applications

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.talentxcel.android.domain.models.ApplicationStatus
import com.talentxcel.android.presentation.components.EmptyState
import com.talentxcel.android.presentation.components.ErrorState
import com.talentxcel.android.presentation.components.LoadingState
import com.talentxcel.android.presentation.components.TXCChip
import com.talentxcel.android.presentation.theme.BgLight
import com.talentxcel.android.presentation.theme.SurfaceWhite
import com.talentxcel.android.presentation.theme.TextPrimary
import com.talentxcel.android.presentation.theme.TalentXcelTypography

@Composable
fun ApplicationsScreen(
    viewModel: ApplicationsViewModel,
    onNavigateToJobs: () -> Unit
) {
    val state by viewModel.uiState.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BgLight)
    ) {
        // Header
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(SurfaceWhite)
                .padding(horizontal = 16.dp, vertical = 14.dp)
        ) {
            Text(
                text = "My Applications",
                style = TalentXcelTypography.headlineMedium,
                color = TextPrimary
            )
            Spacer(modifier = Modifier.height(10.dp))

            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                item {
                    TXCChip(
                        text = "All",
                        isSelected = state.selectedFilter == null,
                        onClick = { viewModel.onFilterSelect(null) }
                    )
                }
                items(ApplicationStatus.values()) { status ->
                    TXCChip(
                        text = status.displayName,
                        isSelected = state.selectedFilter == status,
                        onClick = { viewModel.onFilterSelect(status) }
                    )
                }
            }
        }

        when {
            state.isLoading -> {
                LoadingState(message = "Synchronizing application statuses...")
            }
            state.errorMessage != null -> {
                ErrorState(
                    message = state.errorMessage!!,
                    onRetry = { viewModel.loadApplications() }
                )
            }
            state.applications.isEmpty() -> {
                EmptyState(
                    title = "No applications yet",
                    message = "Discover verified roles tailored to your experience and apply with one tap.",
                    actionButtonText = "Find Jobs",
                    onActionClick = onNavigateToJobs
                )
            }
            else -> {
                val filtered = if (state.selectedFilter == null) {
                    state.applications
                } else {
                    state.applications.filter { it.status == state.selectedFilter }
                }

                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    item { Spacer(modifier = Modifier.height(4.dp)) }
                    items(filtered, key = { it.id }) { app ->
                        ApplicationCard(application = app)
                    }
                    item { Spacer(modifier = Modifier.height(24.dp)) }
                }
            }
        }
    }
}
