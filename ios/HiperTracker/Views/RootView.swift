import SwiftUI

struct RootView: View {
    @EnvironmentObject var session: Session

    var body: some View {
        Group {
            switch session.phase {
            case .loading:
                VStack(spacing: 16) {
                    Image("AppLogo").resizable().scaledToFit().frame(width: 72, height: 72)
                        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                    ProgressView()
                }
            case .needsServer:
                ServerSetupView()
            case .needsAuth:
                ProfileSelectView()
            case .authed:
                MainTabView()
            }
        }
        .animation(.default, value: phaseKey)
        .task { await session.start() }
    }

    private var phaseKey: Int {
        switch session.phase {
        case .loading: return 0
        case .needsServer: return 1
        case .needsAuth: return 2
        case .authed: return 3
        }
    }
}
