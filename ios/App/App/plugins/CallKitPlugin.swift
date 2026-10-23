import Foundation
import Capacitor
import CallKit
import AVFoundation

/**
 * TalentXcel CallKit Plugin for iOS.
 * Bridges Apple's CallKit framework into the React/Vite web application.
 * When a VoIP push arrives (via PushKit), this plugin presents the full native iOS incoming call screen
 * (even when device is locked), and opens the WebRTC video room immediately upon answer.
 */
@objc(CallKitPlugin)
public class CallKitPlugin: CAPPlugin, CAPBridgedPlugin, CXProviderDelegate {
    public let identifier = "CallKitPlugin"
    public let jsName = "CallBridge"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "reportReady", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "showIncomingCall", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "dismissIncomingCall", returnType: CAPPluginReturnPromise)
    ]

    private var callProvider: CXProvider?
    private var activeCallUUID: UUID?

    override public func load() {
        super.load()
        configureCallKitProvider()
    }

    private func configureCallKitProvider() {
        let configuration = CXProviderConfiguration(localizedName: "TalentXcel Pro")
        configuration.supportsVideo = true
        configuration.maximumCallGroups = 1
        configuration.maximumCallsPerCallGroup = 1
        configuration.supportedHandleTypes = [.generic]
        if let iconImage = UIImage(named: "AppIcon") {
            configuration.iconTemplateImageData = iconImage.pngData()
        }

        callProvider = CXProvider(configuration: configuration)
        callProvider?.setDelegate(self, queue: nil)
    }

    @objc func reportReady(_ call: CAPPluginCall) {
        call.resolve(["ready": true])
    }

    @objc func showIncomingCall(_ call: CAPPluginCall) {
        guard let callId = call.getString("callId") else {
            call.reject("Missing required callId")
            return
        }

        let callerName = call.getString("callerName") ?? "TalentXcel Recruiter"
        let callType = call.getString("callType") ?? "video"
        let uuid = UUID(uuidString: callId) ?? UUID()
        self.activeCallUUID = uuid

        let update = CXCallUpdate()
        update.remoteHandle = CXHandle(type: .generic, value: callerName)
        update.localizedCallerName = callerName
        update.hasVideo = (callType == "video")
        update.supportsDTMF = false
        update.supportsHolding = false
        update.supportsGrouping = false
        update.supportsUngrouping = false

        callProvider?.reportNewIncomingCall(with: uuid, update: update) { [weak self] error in
            if let error = error {
                call.reject("Failed to display CallKit UI: \(error.localizedDescription)")
            } else {
                call.resolve(["shown": true, "uuid": uuid.uuidString])
            }
        }
    }

    @objc func dismissIncomingCall(_ call: CAPPluginCall) {
        if let uuid = self.activeCallUUID {
            callProvider?.reportCall(with: uuid, endedAt: Date(), reason: .remoteEnded)
            self.activeCallUUID = nil
        }
        call.resolve(["dismissed": true])
    }

    // MARK: - CXProviderDelegate

    public func providerDidReset(_ provider: CXProvider) {
        self.activeCallUUID = nil
    }

    public func provider(_ provider: CXProvider, perform action: CXAnswerCallAction) {
        action.fulfill()

        if let uuid = self.activeCallUUID {
            notifyListeners("callAnswered", data: [
                "callId": uuid.uuidString,
                "callType": "video"
            ])
        }
    }

    public func provider(_ provider: CXProvider, perform action: CXEndCallAction) {
        action.fulfill()

        if let uuid = self.activeCallUUID {
            notifyListeners("callDeclined", data: [
                "callId": uuid.uuidString
            ])
            self.activeCallUUID = nil
        }
    }
}
