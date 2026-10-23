import Foundation
import Capacitor
import BackgroundTasks

/**
 * TalentXcel Background Task Plugin for iOS.
 * Utilizes Apple's BGTaskScheduler to execute periodic background syncs
 * and processing tasks while complying with iOS App Store battery and memory guidelines.
 *
 * NOTE: Ensure "in.talentxcel.app.background.sync" is added to:
 * Info.plist -> Permitted background task scheduler identifiers (BGTaskSchedulerPermittedIdentifiers)
 * and "Background Modes" -> "Background fetch" + "Background processing" are checked in Xcode Capabilities.
 */
@objc(BackgroundTaskPlugin)
public class BackgroundTaskPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "BackgroundTaskPlugin"
    public let jsName = "BackgroundService"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "startForegroundService", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopForegroundService", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "scheduleBackgroundTask", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isBackgroundServiceRunning", returnType: CAPPluginReturnPromise)
    ]

    private let taskIdentifier = "in.talentxcel.app.background.sync"

    @objc func startForegroundService(_ call: CAPPluginCall) {
        // iOS does not have Android-style persistent Foreground Services with notifications.
        // On iOS, background execution is handled through BGTaskScheduler or PushKit.
        call.resolve([
            "success": true,
            "platform": "ios",
            "message": "iOS uses BGTaskScheduler / PushKit for background operations"
        ])
    }

    @objc func stopForegroundService(_ call: CAPPluginCall) {
        BGTaskScheduler.shared.cancel(taskRequestWithIdentifier: taskIdentifier)
        call.resolve(["success": true])
    }

    @objc func scheduleBackgroundTask(_ call: CAPPluginCall) {
        if #available(iOS 13.0, *) {
            let request = BGAppRefreshTaskRequest(identifier: taskIdentifier)
            let minIntervalSeconds = (call.getDouble("minIntervalMs") ?? 900000.0) / 1000.0
            request.earliestBeginDate = Date(timeIntervalSinceNow: minIntervalSeconds)

            do {
                try BGTaskScheduler.shared.submit(request)
                call.resolve([
                    "success": true,
                    "scheduledSeconds": minIntervalSeconds,
                    "taskIdentifier": taskIdentifier
                ])
            } catch {
                call.reject("Could not schedule BGTask: \(error.localizedDescription)")
            }
        } else {
            call.resolve(["success": false, "reason": "Requires iOS 13+"])
        }
    }

    @objc func isBackgroundServiceRunning(_ call: CAPPluginCall) {
        call.resolve(["running": true])
    }
}
