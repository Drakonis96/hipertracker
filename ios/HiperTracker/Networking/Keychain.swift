import Foundation
import Security

/// Almacenamiento seguro en el Keychain del sistema.
/// Se usa para la configuración del servidor (URL + credenciales Basic Auth)
/// y para los tokens JWT, de modo que nunca se guardan en texto plano.
enum Keychain {
    private static let service = "com.hipertracker.app"

    @discardableResult
    static func set(_ data: Data, for key: String) -> Bool {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
        ]
        SecItemDelete(query as CFDictionary)
        var attributes = query
        attributes[kSecValueData as String] = data
        attributes[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlock
        return SecItemAdd(attributes as CFDictionary, nil) == errSecSuccess
    }

    static func get(_ key: String) -> Data? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne,
        ]
        var result: AnyObject?
        guard SecItemCopyMatching(query as CFDictionary, &result) == errSecSuccess else { return nil }
        return result as? Data
    }

    static func remove(_ key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
        ]
        SecItemDelete(query as CFDictionary)
    }

    static func setObject<T: Encodable>(_ object: T, for key: String) {
        if let data = try? JSONEncoder().encode(object) { set(data, for: key) }
    }

    static func getObject<T: Decodable>(_ type: T.Type, for key: String) -> T? {
        guard let data = get(key) else { return nil }
        return try? JSONDecoder().decode(type, from: data)
    }
}
