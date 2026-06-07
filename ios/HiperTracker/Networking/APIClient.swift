import Foundation

struct ServerConfig: Codable, Equatable {
    var baseURL: String              // p. ej. https://midominio.com  o  http://localhost:5794
    var basicUser: String?
    var basicPassword: String?

    var usesBasicAuth: Bool { !(basicUser ?? "").isEmpty }
    var normalizedBase: String {
        var b = baseURL.trimmingCharacters(in: .whitespacesAndNewlines)
        while b.hasSuffix("/") { b.removeLast() }
        return b
    }
}

struct Tokens: Codable, Equatable {
    var access: String
    var refresh: String
}

enum APIError: LocalizedError {
    case notConfigured
    case badURL
    case unauthorized
    case basicAuthRequired
    case server(Int, String)
    case transport(String)
    case decoding

    var errorDescription: String? {
        switch self {
        case .notConfigured: return "No hay servidor configurado"
        case .badURL: return "La dirección del servidor no es válida"
        case .unauthorized: return "Sesión no válida"
        case .basicAuthRequired: return "El servidor requiere usuario y contraseña (Basic Auth)"
        case .server(_, let msg): return msg
        case .transport(let msg): return msg
        case .decoding: return "Respuesta inesperada del servidor"
        }
    }
}

/// Cliente HTTP seguro. El JWT viaja en `X-Auth-Token` para no colisionar con el
/// `Authorization: Basic` de un reverse proxy. Las credenciales se mantienen en
/// memoria desde el Keychain y nunca se registran en logs.
@MainActor
final class APIClient {
    var config: ServerConfig?
    var tokens: Tokens?
    var onTokensChanged: ((Tokens) -> Void)?

    private let session: URLSession = {
        let cfg = URLSessionConfiguration.default
        cfg.timeoutIntervalForRequest = 20
        cfg.waitsForConnectivity = true
        return URLSession(configuration: cfg)
    }()

    private let decoder = JSONDecoder()
    private var assetCache: [String: Data] = [:]

    // MARK: - Assets (logos de tiendas)

    /// Descarga un asset estático (p. ej. `/logos/...`) con las cabeceras de
    /// autenticación (Basic Auth si aplica). Cachea en memoria por ruta.
    func fetchAsset(path: String) async throws -> Data {
        if let cached = assetCache[path] { return cached }
        guard let config else { throw APIError.notConfigured }
        guard let url = URL(string: config.normalizedBase + path) else { throw APIError.badURL }
        var req = URLRequest(url: url)
        if config.usesBasicAuth {
            let raw = "\(config.basicUser ?? ""):\(config.basicPassword ?? "")"
            if let data = raw.data(using: .utf8) {
                req.setValue("Basic \(data.base64EncodedString())", forHTTPHeaderField: "Authorization")
            }
        }
        let (data, response) = try await session.data(for: req)
        guard let http = response as? HTTPURLResponse, (200...299).contains(http.statusCode) else {
            throw APIError.transport("No se pudo cargar el logo")
        }
        assetCache[path] = data
        return data
    }

    // MARK: - Construcción de peticiones

    private func makeRequest(path: String, method: String, body: Any?, authed: Bool, underV1: Bool) throws -> URLRequest {
        guard let config else { throw APIError.notConfigured }
        let full = config.normalizedBase + (underV1 ? "/api/v1" : "/api") + path
        guard let url = URL(string: full) else { throw APIError.badURL }
        var req = URLRequest(url: url)
        req.httpMethod = method

        if config.usesBasicAuth {
            let raw = "\(config.basicUser ?? ""):\(config.basicPassword ?? "")"
            if let data = raw.data(using: .utf8) {
                req.setValue("Basic \(data.base64EncodedString())", forHTTPHeaderField: "Authorization")
            }
        }
        if authed, let token = tokens?.access {
            req.setValue(token, forHTTPHeaderField: "X-Auth-Token")
        }
        if let body {
            req.setValue("application/json", forHTTPHeaderField: "Content-Type")
            req.httpBody = try JSONSerialization.data(withJSONObject: body)
        }
        return req
    }

    private func raw(path: String, method: String, body: Any?, authed: Bool, underV1: Bool = true) async throws -> (Data, HTTPURLResponse) {
        let req = try makeRequest(path: path, method: method, body: body, authed: authed, underV1: underV1)
        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await session.data(for: req)
        } catch {
            throw APIError.transport(error.localizedDescription)
        }
        guard let http = response as? HTTPURLResponse else { throw APIError.transport("Sin respuesta") }
        return (data, http)
    }

    private func perform(path: String, method: String, body: Any?, authed: Bool, underV1: Bool = true, allowRefresh: Bool = true) async throws -> Data {
        var (data, http) = try await raw(path: path, method: method, body: body, authed: authed, underV1: underV1)

        if http.statusCode == 401 && authed && allowRefresh && tokens?.refresh != nil {
            do {
                try await refreshTokens()
                (data, http) = try await raw(path: path, method: method, body: body, authed: authed, underV1: underV1)
            } catch { /* cae al manejo de error de abajo */ }
        }

        guard (200...299).contains(http.statusCode) else {
            if http.statusCode == 401 {
                // Distingue Basic Auth del proxy de la sesión de la API.
                if let header = http.value(forHTTPHeaderField: "WWW-Authenticate"), header.lowercased().contains("basic") {
                    throw APIError.basicAuthRequired
                }
                throw APIError.unauthorized
            }
            let msg = (try? decoder.decode(APIErrorBody.self, from: data))?.error.message
                ?? "Error \(http.statusCode)"
            throw APIError.server(http.statusCode, msg)
        }
        return data
    }

    // MARK: - Helpers tipados

    func get<T: Decodable>(_ path: String, authed: Bool = true) async throws -> T {
        try decode(try await perform(path: path, method: "GET", body: nil, authed: authed))
    }
    func post<T: Decodable>(_ path: String, body: Any?, authed: Bool = true) async throws -> T {
        try decode(try await perform(path: path, method: "POST", body: body, authed: authed))
    }
    func patch<T: Decodable>(_ path: String, body: Any?, authed: Bool = true) async throws -> T {
        try decode(try await perform(path: path, method: "PATCH", body: body, authed: authed))
    }
    @discardableResult
    func patchVoid(_ path: String, body: Any?) async throws -> Data {
        try await perform(path: path, method: "PATCH", body: body, authed: true)
    }
    func delete(_ path: String) async throws {
        _ = try await perform(path: path, method: "DELETE", body: nil, authed: true)
    }
    func getData(_ path: String) async throws -> Data {
        try await perform(path: path, method: "GET", body: nil, authed: true)
    }

    private func decode<T: Decodable>(_ data: Data) throws -> T {
        if T.self == EmptyResponse.self { return EmptyResponse() as! T }
        do { return try decoder.decode(T.self, from: data) }
        catch { throw APIError.decoding }
    }

    // MARK: - Conexión y sesión

    /// Comprueba conectividad y credenciales Basic Auth (no requiere JWT).
    func checkConnection() async throws {
        _ = try await perform(path: "/health", method: "GET", body: nil, authed: false, underV1: false, allowRefresh: false)
    }

    func login(profileId: String, pin: String?) async throws -> LoginResponse {
        var body: [String: Any] = ["profileId": profileId]
        if let pin, !pin.isEmpty { body["pin"] = pin }
        let resp: LoginResponse = try await post("/auth/login", body: body, authed: false)
        tokens = Tokens(access: resp.token, refresh: resp.refreshToken)
        if let tokens { onTokensChanged?(tokens) }
        return resp
    }

    func refreshTokens() async throws {
        guard let refresh = tokens?.refresh else { throw APIError.unauthorized }
        let resp: LoginResponse = try await post("/auth/refresh", body: ["refreshToken": refresh], authed: false)
        tokens = Tokens(access: resp.token, refresh: resp.refreshToken)
        if let tokens { onTokensChanged?(tokens) }
    }
}

struct EmptyResponse: Decodable {}
