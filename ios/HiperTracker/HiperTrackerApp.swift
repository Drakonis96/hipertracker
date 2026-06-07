import SwiftUI

@main
struct HiperTrackerApp: App {
    @StateObject private var session: Session
    @StateObject private var data: DataStore

    init() {
        let session = Session()
        _session = StateObject(wrappedValue: session)
        _data = StateObject(wrappedValue: DataStore(api: session.api))
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(session)
                .environmentObject(data)
                .tint(Color(hex: session.profile?.accentColor))
                .preferredColorScheme(colorScheme)
        }
        #if os(macOS)
        .defaultSize(width: 480, height: 820)
        #endif
    }

    private var colorScheme: ColorScheme? {
        switch session.profile?.theme {
        case "light": return .light
        case "dark": return .dark
        default: return nil
        }
    }
}
