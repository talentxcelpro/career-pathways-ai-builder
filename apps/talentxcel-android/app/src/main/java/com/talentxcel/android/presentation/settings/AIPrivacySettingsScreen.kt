package com.talentxcel.android.presentation.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
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
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.talentxcel.android.core.ai.memory.MemoryManager
import com.talentxcel.android.core.ai.model.ModelManager
import com.talentxcel.android.core.ai.model.ModelRegistry
import com.talentxcel.android.presentation.components.TXCBadge
import com.talentxcel.android.presentation.components.TXCCard
import com.talentxcel.android.presentation.components.TXCOutlinedButton
import com.talentxcel.android.presentation.components.TXCPrimaryButton
import com.talentxcel.android.presentation.theme.AccentRose
import com.talentxcel.android.presentation.theme.BgLight
import com.talentxcel.android.presentation.theme.BorderSubtle
import com.talentxcel.android.presentation.theme.BrandBluePrimary
import com.talentxcel.android.presentation.theme.StatusSuccessBg
import com.talentxcel.android.presentation.theme.StatusSuccessText
import com.talentxcel.android.presentation.theme.SurfaceWhite
import com.talentxcel.android.presentation.theme.TextMuted
import com.talentxcel.android.presentation.theme.TextPrimary
import com.talentxcel.android.presentation.theme.TextSecondary
import com.talentxcel.android.presentation.theme.TalentXcelTypography
import kotlinx.coroutines.launch

@Composable
fun AIPrivacySettingsScreen(
    memoryManager: MemoryManager,
    modelManager: ModelManager,
    onNavigateBack: () -> Unit
) {
    var preferOnDevice by remember { mutableStateOf(true) }
    var askBeforeCloud by remember { mutableStateOf(true) }
    val memories by memoryManager.memories.collectAsState()
    val scope = rememberCoroutineScope()

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
                text = "AI & Privacy Governance",
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
            // 1. Processing Preference Card
            TXCCard(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "AI Processing Governance",
                    style = TalentXcelTypography.titleMedium,
                    color = TextPrimary
                )
                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Prefer On-Device AI",
                            style = TalentXcelTypography.bodyLarge,
                            color = TextPrimary
                        )
                        Text(
                            text = "Execute reasoning privately on this device without network transmission.",
                            style = TalentXcelTypography.bodySmall,
                            color = TextMuted
                        )
                    }
                    Switch(
                        checked = preferOnDevice,
                        onCheckedChange = { preferOnDevice = it },
                        colors = SwitchDefaults.colors(checkedThumbColor = BrandBluePrimary)
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))
                HorizontalDivider(color = BorderSubtle)
                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Ask Before Cloud Processing",
                            style = TalentXcelTypography.bodyLarge,
                            color = TextPrimary
                        )
                        Text(
                            text = "Prompt confirmation before sending minimized queries to TalentXcel Edge servers.",
                            style = TalentXcelTypography.bodySmall,
                            color = TextMuted
                        )
                    }
                    Switch(
                        checked = askBeforeCloud,
                        onCheckedChange = { askBeforeCloud = it },
                        colors = SwitchDefaults.colors(checkedThumbColor = BrandBluePrimary)
                    )
                }
            }

            // 2. On-Device Model Manager Card
            TXCCard(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Local LLM Runtime",
                        style = TalentXcelTypography.titleMedium,
                        color = TextPrimary
                    )
                    TXCBadge(
                        text = if (modelManager.isModelLoaded()) "Active" else "Not Installed",
                        bgColor = StatusSuccessBg,
                        textColor = StatusSuccessText
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                val defaultModel = ModelRegistry.defaultModel
                Text(
                    text = "${defaultModel.name} (v${defaultModel.version})",
                    style = TalentXcelTypography.bodyLarge,
                    color = TextPrimary
                )
                Text(
                    text = defaultModel.description,
                    style = TalentXcelTypography.bodySmall,
                    color = TextSecondary
                )

                Spacer(modifier = Modifier.height(14.dp))

                if (modelManager.isModelLoaded()) {
                    TXCOutlinedButton(
                        text = "Remove Local Model",
                        onClick = { modelManager.deleteModel(defaultModel.id) },
                        modifier = Modifier.fillMaxWidth()
                    )
                } else {
                    TXCPrimaryButton(
                        text = "Download ${defaultModel.name} (~${defaultModel.sizeBytes / (1024 * 1024)} MB)",
                        onClick = {
                            scope.launch {
                                modelManager.downloadModel(defaultModel)
                            }
                        },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }

            // 3. User-Controlled Private AI Memory
            TXCCard(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Private Agent Memory (${memories.size})",
                        style = TalentXcelTypography.titleMedium,
                        color = TextPrimary
                    )
                    if (memories.isNotEmpty()) {
                        Text(
                            text = "Clear All",
                            style = TalentXcelTypography.bodySmall,
                            color = AccentRose,
                            modifier = Modifier.padding(4.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Your Personal AI Agent retains explicit facts to tailor suggestions. All memory is encrypted in Android Keystore.",
                    style = TalentXcelTypography.bodySmall,
                    color = TextMuted
                )

                Spacer(modifier = Modifier.height(12.dp))

                memories.forEach { item ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = item.content,
                                style = TalentXcelTypography.bodyMedium,
                                color = TextPrimary
                            )
                            Text(
                                text = "Category: ${item.category}",
                                style = TalentXcelTypography.bodySmall,
                                color = TextMuted
                            )
                        }
                        IconButton(onClick = { memoryManager.deleteMemory(item.id) }) {
                            Icon(
                                imageVector = Icons.Default.Delete,
                                contentDescription = "Delete",
                                tint = TextMuted
                            )
                        }
                    }
                    HorizontalDivider(color = BorderSubtle)
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}
