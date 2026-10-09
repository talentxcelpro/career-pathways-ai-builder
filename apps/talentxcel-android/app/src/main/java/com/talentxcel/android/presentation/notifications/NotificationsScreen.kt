package com.talentxcel.android.presentation.notifications

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Surface
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.talentxcel.android.core.notifications.NotificationManager
import com.talentxcel.android.presentation.components.EmptyState
import com.talentxcel.android.presentation.components.ErrorState
import com.talentxcel.android.presentation.components.LoadingState
import com.talentxcel.android.presentation.theme.BgLight
import com.talentxcel.android.presentation.theme.BrandBlue50
import com.talentxcel.android.presentation.theme.BrandBluePrimary
import com.talentxcel.android.presentation.theme.SurfaceWhite
import com.talentxcel.android.presentation.theme.TextPrimary
import com.talentxcel.android.presentation.theme.TalentXcelTypography

@Composable
fun NotificationsScreen(
    viewModel: NotificationsViewModel,
    onNavigateBack: () -> Unit,
    onNotificationClick: (String) -> Unit
) {
    val state by viewModel.uiState.collectAsState()
    val context = LocalContext.current

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
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onNavigateBack) {
                    Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back")
                }
                Text(
                    text = "Notifications",
                    style = TalentXcelTypography.titleLarge,
                    color = TextPrimary
                )
            }

            Row(verticalAlignment = Alignment.CenterVertically) {
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = BrandBlue50,
                    modifier = Modifier.clickable {
                        val nm = NotificationManager(context)
                        nm.showJobMatchNotification(
                            jobId = "ajo-architect-1",
                            jobTitle = "AJO Architect (₹45L - ₹48L)",
                            company = "Savantis Solutions",
                            matchScore = 94
                        )
                    }
                ) {
                    Text(
                        text = "🔔 Test Alert",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = BrandBluePrimary,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Mark all read",
                    style = TalentXcelTypography.bodySmall,
                    color = BrandBluePrimary,
                    modifier = Modifier
                        .padding(end = 12.dp)
                        .clickable { viewModel.markAllAsRead() }
                )
            }
        }

        when {
            state.isLoading -> {
                LoadingState(message = "Fetching notifications...")
            }
            state.errorMessage != null -> {
                ErrorState(
                    message = state.errorMessage!!,
                    onRetry = { viewModel.loadNotifications() }
                )
            }
            state.notifications.isEmpty() -> {
                EmptyState(
                    title = "All caught up",
                    message = "You have no unread notifications right now."
                )
            }
            else -> {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    item { Spacer(modifier = Modifier.height(4.dp)) }
                    items(state.notifications, key = { it.id }) { notif ->
                        NotificationItem(
                            notification = notif,
                            onClick = {
                                viewModel.markAsRead(notif.id)
                                onNotificationClick(notif.link)
                            }
                        )
                    }
                    item { Spacer(modifier = Modifier.height(24.dp)) }
                }
            }
        }
    }
}
