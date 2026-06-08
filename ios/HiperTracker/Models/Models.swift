import Foundation

struct Profile: Codable, Identifiable, Hashable {
    let id: String
    var name: String
    var avatar: String?
    var color: String
    var hasPin: Bool
    var isAdmin: Bool
    var accentColor: String?
    var theme: String?
}

struct ShoppingList: Codable, Identifiable, Hashable {
    let id: String
    var name: String
    var type: String          // "personal" | "shared" | "custom"
    var ownerId: String
    var memberIds: [String]?  // perfiles concretos con acceso (solo "custom")
    var itemCount: Int?
    var checkedCount: Int?

    var isShared: Bool { type == "shared" }

    // Icono/etiqueta según el modo de compartir (personal | shared | custom).
    var shareIcon: String {
        switch type {
        case "shared": return "person.2"
        case "custom": return "person.crop.circle.badge.plus"
        default: return "lock"
        }
    }
    var shareIconFill: String {
        switch type {
        case "shared": return "person.2.fill"
        case "custom": return "person.crop.circle.badge.plus"
        default: return "lock.fill"
        }
    }
    var shareLabel: String {
        switch type {
        case "shared": return "Con todos"
        case "custom": return "Con algunos"
        default: return "Personal"
        }
    }
}

struct Item: Codable, Identifiable, Hashable {
    let id: String
    var name: String
    var icon: String?
    var iconType: String       // "emoji" | "icon" | "none"
    var stores: [String]
    var listId: String
    var checked: Bool
    var order: Int
    var notes: String?
}

struct Store: Codable, Identifiable, Hashable {
    let id: String
    var name: String
    var logoUrl: String?
    var color: String?
    var category: String
    var categoryLabel: String
    var custom: Bool?

    var isCustom: Bool { custom ?? false }
}

struct LoginResponse: Codable {
    let token: String
    let refreshToken: String
    let profile: Profile
}

struct ImportSummary: Codable {
    let lists: Int
    let items: Int
    let customStores: Int
}

struct APIErrorBody: Codable {
    struct Inner: Codable { let code: String?; let message: String? }
    let error: Inner
}
