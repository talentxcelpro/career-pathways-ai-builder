package com.talentxcel.android.presentation.profile

import androidx.compose.foundation.background
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
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.talentxcel.android.presentation.components.TXCCard
import com.talentxcel.android.presentation.components.TXCPrimaryButton
import com.talentxcel.android.presentation.components.TXCTextField
import com.talentxcel.android.presentation.theme.BgLight
import com.talentxcel.android.presentation.theme.SurfaceWhite
import com.talentxcel.android.presentation.theme.TextPrimary
import com.talentxcel.android.presentation.theme.TalentXcelTypography

@Composable
fun EditProfileScreen(
    viewModel: ProfileViewModel,
    onNavigateBack: () -> Unit
) {
    val state by viewModel.uiState.collectAsState()
    val profile = state.profile ?: return

    var fullName by remember { mutableStateOf(profile.fullName) }
    var headline by remember { mutableStateOf(profile.headline) }
    var location by remember { mutableStateOf(profile.location) }
    var about by remember { mutableStateOf(profile.about ?: "") }

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
                Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back")
            }
            Text(
                text = "Edit Profile",
                style = TalentXcelTypography.titleMedium,
                color = TextPrimary
            )
        }

        Column(
            modifier = Modifier
                .weight(1f)
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            TXCCard(modifier = Modifier.fillMaxWidth()) {
                TXCTextField(
                    value = fullName,
                    onValueChange = { fullName = it },
                    label = "Full Name"
                )

                Spacer(modifier = Modifier.height(16.dp))

                TXCTextField(
                    value = headline,
                    onValueChange = { headline = it },
                    label = "Professional Headline"
                )

                Spacer(modifier = Modifier.height(16.dp))

                TXCTextField(
                    value = location,
                    onValueChange = { location = it },
                    label = "Location"
                )

                Spacer(modifier = Modifier.height(16.dp))

                TXCTextField(
                    value = about,
                    onValueChange = { about = it },
                    label = "Professional Summary / About"
                )
            }

            Spacer(modifier = Modifier.height(24.dp))
        }

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(SurfaceWhite)
                .padding(16.dp)
        ) {
            TXCPrimaryButton(
                text = "Save Changes",
                isLoading = state.isSaving,
                onClick = {
                    val updated = profile.copy(
                        fullName = fullName,
                        headline = headline,
                        location = location,
                        about = about
                    )
                    viewModel.updateProfile(updated)
                    onNavigateBack()
                },
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}
