package com.talentxcel.android.presentation.settings

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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.DeleteForever
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Security
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.material3.OutlinedButton
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.talentxcel.android.presentation.components.TXCCard
import com.talentxcel.android.presentation.theme.AccentRose
import com.talentxcel.android.presentation.theme.BgLight
import com.talentxcel.android.presentation.theme.BorderSubtle
import com.talentxcel.android.presentation.theme.BrandBluePrimary
import com.talentxcel.android.presentation.theme.SurfaceWhite
import com.talentxcel.android.presentation.theme.TextMuted
import com.talentxcel.android.presentation.theme.TextPrimary
import com.talentxcel.android.presentation.theme.TextSecondary
import com.talentxcel.android.presentation.theme.TalentXcelTypography

@Composable
fun SettingsScreen(
    onNavigateBack: () -> Unit,
    onNavigateToAIPrivacy: () -> Unit
) {
    val uriHandler = LocalUriHandler.current
    var showDeleteAccountDialog by remember { mutableStateOf(false) }

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
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onNavigateBack) {
                Icon(imageVector = Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
            }
            Text(
                text = "Settings",
                style = TalentXcelTypography.titleLarge,
                color = TextPrimary
            )
        }

        Column(
            modifier = Modifier
                .weight(1f)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            TXCCard(modifier = Modifier.fillMaxWidth()) {
                // AI & Privacy
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onNavigateToAIPrivacy() }
                        .padding(vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.AutoAwesome,
                            contentDescription = "AI",
                            tint = BrandBluePrimary
                        )
                        Spacer(modifier = Modifier.padding(start = 12.dp))
                        Column {
                            Text("AI & Privacy Governance", style = TalentXcelTypography.bodyLarge, color = TextPrimary)
                            Text("Manage private on-device model and memory", style = TalentXcelTypography.bodySmall, color = TextMuted)
                        }
                    }
                    Icon(imageVector = Icons.Default.ChevronRight, contentDescription = "Go", tint = TextMuted)
                }

                HorizontalDivider(color = BorderSubtle)

                // Notifications
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { /* Toggle notifications */ }
                        .padding(vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Notifications,
                            contentDescription = "Notifications",
                            tint = BrandBluePrimary
                        )
                        Spacer(modifier = Modifier.padding(start = 12.dp))
                        Column {
                            Text("Push Notification Preferences", style = TalentXcelTypography.bodyLarge, color = TextPrimary)
                            Text("Job match alerts, application updates", style = TalentXcelTypography.bodySmall, color = TextMuted)
                        }
                    }
                    Icon(imageVector = Icons.Default.ChevronRight, contentDescription = "Go", tint = TextMuted)
                }

                HorizontalDivider(color = BorderSubtle)

                // Delete Account & Data (Google Play Policy Compliance)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { showDeleteAccountDialog = true }
                        .padding(vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.DeleteForever,
                            contentDescription = "Delete Account",
                            tint = AccentRose
                        )
                        Spacer(modifier = Modifier.padding(start = 12.dp))
                        Column {
                            Text("Delete Account & Data", style = TalentXcelTypography.bodyLarge, color = AccentRose)
                            Text("Permanently erase profile, applications, and AI memory", style = TalentXcelTypography.bodySmall, color = TextMuted)
                        }
                    }
                    Icon(imageVector = Icons.Default.ChevronRight, contentDescription = "Go", tint = TextMuted)
                }
            }

            TXCCard(modifier = Modifier.fillMaxWidth()) {
                val context = LocalContext.current
                val notifManager = remember { com.talentxcel.android.core.notifications.NotificationManager(context) }

                Text("Enterprise Push Notification Channels", style = TalentXcelTypography.titleMedium, color = TextPrimary)
                Spacer(modifier = Modifier.height(4.dp))
                Text("Dispatch live system notifications across 5 distinct Android channels", style = TalentXcelTypography.bodySmall, color = TextMuted)
                Spacer(modifier = Modifier.height(12.dp))

                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(
                        onClick = {
                            notifManager.showJobMatchNotification("job-101", "Staff AI Architect", "Google Cloud", 94)
                        },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text("🎯 Test Job Alert Notification (94% Match)", fontSize = 12.sp)
                    }

                    OutlinedButton(
                        onClick = {
                            notifManager.showDirectMessageNotification("Priya Sharma", "Hi Arshid! Loved your profile. Are you open to discussing tech lead roles?", "conv-1", "user-priya")
                        },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text("💬 Test 1:1 Recruiter Message Alert", fontSize = 12.sp)
                    }

                    OutlinedButton(
                        onClick = {
                            notifManager.showGeminiDigestNotification("Resume Optimization", "Your ATS score for Senior Mobile Systems Engineer reached 94%! Ready to apply.")
                        },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text("✨ Test Gemini AI Career Digest Alert", fontSize = 12.sp)
                    }

                    OutlinedButton(
                        onClick = {
                            notifManager.showStreakReminderNotification(7, 50)
                        },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text("🔥 Test 7-Day Streak Reminder Alert", fontSize = 12.sp)
                    }

                    OutlinedButton(
                        onClick = {
                            notifManager.showReferralRewardNotification("David Lee", 100)
                        },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text("🎉 Test Referral Bonus Unlocked (+100 Coins)", fontSize = 12.sp)
                    }
                }
            }

            TXCCard(modifier = Modifier.fillMaxWidth()) {
                Text("TalentXcel Pro for Android", style = TalentXcelTypography.titleMedium, color = TextPrimary)
                Spacer(modifier = Modifier.height(4.dp))
                Text("Version 1.0.0 (Build 10001)", style = TalentXcelTypography.bodySmall, color = TextMuted)
                Spacer(modifier = Modifier.height(12.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    Text(
                        text = "Privacy Policy",
                        style = TalentXcelTypography.bodySmall,
                        color = BrandBluePrimary,
                        modifier = Modifier.clickable {
                            uriHandler.openUri("https://talentxcel.in/privacy")
                        }
                    )
                    Text("•", style = TalentXcelTypography.bodySmall, color = TextMuted)
                    Text(
                        text = "Terms of Service",
                        style = TalentXcelTypography.bodySmall,
                        color = BrandBluePrimary,
                        modifier = Modifier.clickable {
                            uriHandler.openUri("https://talentxcel.in/terms")
                        }
                    )
                }
            }
        }
    }

    if (showDeleteAccountDialog) {
        AlertDialog(
            onDismissRequest = { showDeleteAccountDialog = false },
            title = {
                Text("Delete Account & All Data?", style = TalentXcelTypography.titleMedium, color = AccentRose)
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = "This action is permanent and cannot be reversed. Deleting your account will immediately erase your profile, applications, saved jobs, and all private on-device AI memory.",
                        style = TalentXcelTypography.bodyMedium,
                        color = TextSecondary
                    )
                    Text(
                        text = "You can also submit an account deletion request via web at https://talentxcel.in/account/delete",
                        style = TalentXcelTypography.bodySmall,
                        color = TextMuted
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        showDeleteAccountDialog = false
                        uriHandler.openUri("https://talentxcel.in/account/delete")
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = AccentRose)
                ) {
                    Text("Request Deletion", color = SurfaceWhite)
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteAccountDialog = false }) {
                    Text("Cancel", color = TextSecondary)
                }
            }
        )
    }
}
