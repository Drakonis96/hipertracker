import Foundation
import SwiftUI

@MainActor
final class Session: ObservableObject {
    enum Phase { case loading, needsServer, needsAuth, authed }

    @Published var phase: Phase = .loading
    @Published var config: ServerConfig?
    @Published var profiles: [Profile] = []
    @Published var profile: Profile?

    let api = APIClient()

    private let kConfig = "serverConfig"
    private let kTokens = "tokens"
    private let kProfile = "currentProfile"
    private let kGate = "gateToken"

    init() {
        api.onTokensChanged = { [weak self] tokens in
            Keychain.setObject(tokens, for: self?.kTokens ?? "tokens")
        }
        api.onGateChanged = { [weak self] token in
            if let token { Keychain.set(Data(token.utf8), for: self?.kGate ?? "gateToken") }
            else { Keychain.remove(self?.kGate ?? "gateToken") }
        }
    }

    // MARK: - Arranque

    func start() async {
        guard let cfg = Keychain.getObject(ServerConfig.self, for: kConfig) else {
            phase = .needsServer
            return
        }
        config = cfg
        api.config = cfg
        api.tokens = Keychain.getObject(Tokens.self, for: kTokens)
        if let gateData = Keychain.get(kGate) { api.gateToken = String(decoding: gateData, as: UTF8.self) }

        let savedProfile = Keychain.getObject(Profile.self, for: kProfile)
        do {
            try await loadProfiles()
        } catch {
            // El servidor no responde / credenciales Basic incorrectas.
            phase = .needsServer
            return
        }
        if let savedProfile, api.tokens != nil, profiles.contains(where: { $0.id == savedProfile.id }) {
            profile = savedProfile
            phase = .authed
        } else {
            phase = .needsAuth
        }
    }

    // MARK: - Servidor

    func connect(baseURL: String, basicUser: String, basicPassword: String,
                 appUser: String = "", appPassword: String = "") async throws {
        let cfg = ServerConfig(
            baseURL: baseURL,
            basicUser: basicUser.isEmpty ? nil : basicUser,
            basicPassword: basicPassword.isEmpty ? nil : basicPassword,
            appUser: appUser.isEmpty ? nil : appUser,
            appPassword: appPassword.isEmpty ? nil : appPassword
        )
        api.config = cfg
        try await api.checkConnection()

        // Login propio de la app si el servidor lo exige.
        let gateEnabled = (try? await api.gateStatus()) ?? false
        if gateEnabled {
            guard !appUser.isEmpty, !appPassword.isEmpty else { throw APIError.gateRequired }
            try await api.gateLogin(username: appUser, password: appPassword)
        }

        config = cfg
        Keychain.setObject(cfg, for: kConfig)
        UserDefaults.standard.set(cfg.normalizedBase, forKey: "lastBaseURL")
        try await loadProfiles()
        phase = .needsAuth
    }

    func changeServer() {
        Keychain.remove(kTokens)
        Keychain.remove(kProfile)
        Keychain.remove(kGate)
        api.tokens = nil
        api.gateToken = nil
        profile = nil
        profiles = []
        phase = .needsServer
    }

    /// Cierre de sesión completo: olvida tokens, login de la app, perfil y la
    /// configuración del servidor (incluidas las credenciales del login de la
    /// app), de modo que no hay re-login automático. Vuelve a la pantalla de
    /// conexión. Avisa al servidor para invalidar la cookie (best-effort).
    func signOut() {
        Task { try? await api.gateLogout() }
        Keychain.remove(kTokens)
        Keychain.remove(kProfile)
        Keychain.remove(kGate)
        Keychain.remove(kConfig)
        api.tokens = nil
        api.gateToken = nil
        api.config = nil
        config = nil
        profile = nil
        profiles = []
        phase = .needsServer
    }

    // MARK: - Perfiles / auth

    func loadProfiles() async throws {
        profiles = try await api.get("/profiles", authed: false)
    }

    func login(profile p: Profile, pin: String?) async throws {
        let resp = try await api.login(profileId: p.id, pin: pin)
        profile = resp.profile
        Keychain.setObject(resp.profile, for: kProfile)
        if let t = api.tokens { Keychain.setObject(t, for: kTokens) }
        phase = .authed
    }

    func logout() {
        Keychain.remove(kTokens)
        Keychain.remove(kProfile)
        api.tokens = nil
        profile = nil
        phase = .needsAuth
        Task { try? await loadProfiles() }
    }

    @discardableResult
    func createProfile(name: String, avatar: String?, color: String, pin: String?) async throws -> Profile {
        var body: [String: Any] = ["name": name, "color": color]
        if let avatar { body["avatar"] = avatar }
        if let pin, !pin.isEmpty { body["pin"] = pin }
        let created: Profile = try await api.post("/profiles", body: body, authed: profile != nil)
        try await loadProfiles()
        return created
    }

    func updateProfile(id: String, body: [String: Any]) async throws {
        let updated: Profile = try await api.patch("/profiles/\(id)", body: body)
        if profile?.id == id {
            profile = updated
            Keychain.setObject(updated, for: kProfile)
        }
        try await loadProfiles()
    }

    func deleteProfile(id: String) async throws {
        try await api.delete("/profiles/\(id)")
        try await loadProfiles()
    }
}
