package com.talentxcel.android.core.ai.model

import android.app.ActivityManager
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager
import android.os.Environment
import android.os.StatFs

enum class DeviceHardwareTier {
    LOW,      // < 4GB RAM
    MEDIUM,   // 4GB - 6GB RAM
    HIGH      // > 6GB RAM
}

data class DeviceAIAudit(
    val tier: DeviceHardwareTier,
    val totalRamBytes: Long,
    val availableRamBytes: Long,
    val freeStorageBytes: Long,
    val batteryPct: Float,
    val isCharging: Boolean,
    val canRunLocalInference: Boolean,
    val recommendedModelId: String
)

/**
 * Monitors hardware capabilities, thermals, storage, and battery state
 * to ensure AI execution never degrades phone performance.
 */
class DeviceAIManager(private val context: Context) {

    fun auditDevice(): DeviceAIAudit {
        val actManager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val memInfo = ActivityManager.MemoryInfo()
        actManager.getMemoryInfo(memInfo)

        val totalRam = memInfo.totalMem
        val availRam = memInfo.availMem

        // Storage check
        val stat = StatFs(Environment.getDataDirectory().path)
        val freeStorage = stat.availableBlocksLong * stat.blockSizeLong

        // Battery check
        val batteryStatus: Intent? = IntentFilter(Intent.ACTION_BATTERY_CHANGED).let { filter ->
            context.registerReceiver(null, filter)
        }
        val level: Int = batteryStatus?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
        val scale: Int = batteryStatus?.getIntExtra(BatteryManager.EXTRA_SCALE, -1) ?: -1
        val batteryPct = if (level >= 0 && scale > 0) level * 100 / scale.toFloat() else 100f
        val status: Int = batteryStatus?.getIntExtra(BatteryManager.EXTRA_STATUS, -1) ?: -1
        val isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING || status == BatteryManager.BATTERY_STATUS_FULL

        val tier = when {
            totalRam >= 6L * 1024 * 1024 * 1024 -> DeviceHardwareTier.HIGH
            totalRam >= 4L * 1024 * 1024 * 1024 -> DeviceHardwareTier.MEDIUM
            else -> DeviceHardwareTier.LOW
        }

        // Gemini Nano 1B is INT8 quantized (minRam 2GB) so even LOW/MEDIUM devices can run local inference!
        val canRun = (freeStorage > 500L * 1024 * 1024) && (batteryPct > 10f || isCharging)

        val recModel = if (tier == DeviceHardwareTier.HIGH) "gemini-nano-3b" else "gemini-nano-1b"

        return DeviceAIAudit(
            tier = tier,
            totalRamBytes = totalRam,
            availableRamBytes = availRam,
            freeStorageBytes = freeStorage,
            batteryPct = batteryPct,
            isCharging = isCharging,
            canRunLocalInference = canRun,
            recommendedModelId = recModel
        )
    }
}
