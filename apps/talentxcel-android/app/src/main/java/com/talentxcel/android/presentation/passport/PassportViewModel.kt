package com.talentxcel.android.presentation.passport

import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.talentxcel.android.core.utilities.QRUtils
import com.talentxcel.android.domain.models.Passport
import com.talentxcel.android.domain.repositories.PassportRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class PassportUiState {
    object Loading : PassportUiState()
    data class Success(
        val passport: Passport,
        val qrBitmap: Bitmap? = null,
        val isColleagueView: Boolean = false
    ) : PassportUiState()
    object Empty : PassportUiState()
    data class Error(val message: String) : PassportUiState()
}

class PassportViewModel(
    private val passportRepository: PassportRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<PassportUiState>(PassportUiState.Loading)
    val uiState: StateFlow<PassportUiState> = _uiState.asStateFlow()

    private val _scannedUsername = MutableStateFlow<String?>(null)
    val scannedUsername: StateFlow<String?> = _scannedUsername.asStateFlow()

    init {
        loadMyPassport()
    }

    fun loadMyPassport() {
        viewModelScope.launch {
            _uiState.value = PassportUiState.Loading
            passportRepository.getMyPassport().collect { result ->
                result.fold(
                    onSuccess = { passport ->
                        val qrBitmap = try {
                            QRUtils.generateQrCodeBitmap(passport.publicPassportUrl, 512)
                        } catch (e: Exception) {
                            null
                        }
                        _uiState.value = PassportUiState.Success(
                            passport = passport,
                            qrBitmap = qrBitmap,
                            isColleagueView = false
                        )
                    },
                    onFailure = { error ->
                        _uiState.value = PassportUiState.Error(error.localizedMessage ?: "Failed to load passport")
                    }
                )
            }
        }
    }

    fun loadColleaguePassport(username: String) {
        viewModelScope.launch {
            _uiState.value = PassportUiState.Loading
            val result = passportRepository.getPassportByUsername(username)
            result.fold(
                onSuccess = { passport ->
                    val qrBitmap = try {
                        QRUtils.generateQrCodeBitmap(passport.publicPassportUrl, 512)
                    } catch (e: Exception) {
                        null
                    }
                    _uiState.value = PassportUiState.Success(
                        passport = passport,
                        qrBitmap = qrBitmap,
                        isColleagueView = true
                    )
                },
                onFailure = { error ->
                    _uiState.value = PassportUiState.Error(error.localizedMessage ?: "Colleague not found")
                }
            )
        }
    }

    fun processScannedQr(rawText: String) {
        // Parse URL or raw username e.g. https://talentxcel.in/passport/john.doe
        val username = if (rawText.contains("/passport/")) {
            rawText.substringAfter("/passport/").trim()
        } else {
            rawText.trim()
        }
        _scannedUsername.value = username
        loadColleaguePassport(username)
    }

    fun sharePassport(context: Context, passport: Passport) {
        val shareIntent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_SUBJECT, "TalentXcel Verified Career Passport - ${passport.fullName}")
            putExtra(
                Intent.EXTRA_TEXT,
                "View my verified TalentXcel Career Passport: ${passport.publicPassportUrl}\n\nSecurity Hash: ${passport.securityHash}"
            )
        }
        context.startActivity(Intent.createChooser(shareIntent, "Share Career Passport"))
    }

    fun clearScannedColleague() {
        _scannedUsername.value = null
        loadMyPassport()
    }
}
