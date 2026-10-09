package com.talentxcel.android.presentation.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.talentxcel.android.domain.repositories.AuthRepository
import com.talentxcel.android.presentation.components.TXCCard
import com.talentxcel.android.presentation.components.TXCPrimaryButton
import com.talentxcel.android.presentation.components.TXCTextField
import com.talentxcel.android.presentation.theme.AccentEmerald
import com.talentxcel.android.presentation.theme.AccentRose
import com.talentxcel.android.presentation.theme.BgLight
import com.talentxcel.android.presentation.theme.BrandBluePrimary
import com.talentxcel.android.presentation.theme.TextMuted
import com.talentxcel.android.presentation.theme.TalentXcelTypography
import kotlinx.coroutines.launch

@Composable
fun ForgotPasswordScreen(
    authRepository: AuthRepository,
    onNavigateBackToLogin: () -> Unit
) {
    var email by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var statusMessage by remember { mutableStateOf<String?>(null) }
    var isError by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BgLight)
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Reset Password",
                style = TalentXcelTypography.headlineLarge,
                color = BrandBluePrimary
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = "Enter your registered email to receive recovery instructions",
                style = TalentXcelTypography.bodyMedium,
                color = TextMuted
            )

            Spacer(modifier = Modifier.height(28.dp))

            TXCCard(modifier = Modifier.fillMaxWidth()) {
                TXCTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = "Registered Email",
                    placeholder = "name@company.com",
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
                )

                if (statusMessage != null) {
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = statusMessage!!,
                        style = TalentXcelTypography.bodySmall,
                        color = if (isError) AccentRose else AccentEmerald
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))

                TXCPrimaryButton(
                    text = "Send Reset Link",
                    onClick = {
                        scope.launch {
                            isLoading = true
                            val result = authRepository.resetPassword(email.trim())
                            isLoading = false
                            result.onSuccess {
                                statusMessage = "Password reset instructions dispatched."
                                isError = false
                            }.onFailure {
                                statusMessage = it.localizedMessage ?: "Failed to send reset link."
                                isError = true
                            }
                        }
                    },
                    isLoading = isLoading,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(12.dp))

                TextButton(
                    onClick = onNavigateBackToLogin,
                    modifier = Modifier.align(Alignment.CenterHorizontally)
                ) {
                    Text(
                        text = "Back to Sign In",
                        style = TalentXcelTypography.bodyMedium,
                        color = BrandBluePrimary
                    )
                }
            }
        }
    }
}
