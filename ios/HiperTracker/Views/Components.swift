import SwiftUI
import SVGView
#if canImport(UIKit)
import UIKit
#elseif canImport(AppKit)
import AppKit
#endif

func platformImage(_ data: Data) -> Image? {
    #if canImport(UIKit)
    return UIImage(data: data).map { Image(uiImage: $0) }
    #elseif canImport(AppKit)
    return NSImage(data: data).map { Image(nsImage: $0) }
    #else
    return nil
    #endif
}

extension Color {
    init(hex: String?) {
        let s = (hex ?? "").trimmingCharacters(in: CharacterSet(charactersIn: "# "))
        var int: UInt64 = 0
        Scanner(string: s).scanHexInt64(&int)
        if s.count == 6 {
            self = Color(red: Double((int >> 16) & 0xff) / 255,
                         green: Double((int >> 8) & 0xff) / 255,
                         blue: Double(int & 0xff) / 255)
        } else {
            self = Color(red: 16/255, green: 185/255, blue: 129/255) // emerald por defecto
        }
    }
}

let badgePalette = ["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e", "#10b981",
                    "#14b8a6", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#d946ef",
                    "#ec4899", "#f43f5e", "#64748b"]

func badgeColor(_ text: String) -> Color {
    let s = text.isEmpty ? "?" : text
    var hash: UInt64 = 0
    for ch in s.unicodeScalars { hash = (hash &* 31 &+ UInt64(ch.value)) }
    return Color(hex: badgePalette[Int(hash % UInt64(badgePalette.count))])
}

func initialLetter(_ text: String) -> String {
    let t = text.trimmingCharacters(in: .whitespaces)
    return t.isEmpty ? "?" : String(t.first!).uppercased()
}

/// Avatar de perfil (emoji o inicial sobre color).
struct AvatarView: View {
    let profile: Profile
    var size: CGFloat = 44
    var body: some View {
        ZStack {
            if let avatar = profile.avatar, !avatar.isEmpty {
                Circle().fill(Color(hex: profile.color).opacity(0.18))
                Text(avatar).font(.system(size: size * 0.5))
            } else {
                Circle().fill(Color(hex: profile.color))
                Text(initialLetter(profile.name))
                    .font(.system(size: size * 0.42, weight: .semibold)).foregroundStyle(.white)
            }
        }
        .frame(width: size, height: size)
    }
}

/// Badge de tienda (inicial sobre color de marca). En iOS no se renderizan los
/// SVG/PNG del servidor; se usa un badge consistente con la versión web.
struct StoreBadge: View {
    let store: Store
    var size: CGFloat = 22
    private var fill: Color {
        if let c = store.color, !c.isEmpty { return Color(hex: c) }
        return badgeColor(store.name)
    }
    var body: some View {
        RoundedRectangle(cornerRadius: size * 0.25, style: .continuous)
            .fill(fill)
            .frame(width: size, height: size)
            .overlay(
                Text(initialLetter(store.name))
                    .font(.system(size: size * 0.5, weight: .bold)).foregroundStyle(.white)
            )
    }
}

struct StoreChip: View {
    let store: Store
    var body: some View {
        HStack(spacing: 6) {
            StoreLogoView(store: store, size: 18)
            Text(store.name).font(.caption).fontWeight(.medium)
        }
        .padding(.vertical, 4).padding(.leading, 4).padding(.trailing, 8)
        .background(Capsule().fill(Color.secondary.opacity(0.12)))
    }
}

/// Logo real de la tienda (SVG o PNG) descargado con autenticación.
/// Si la tienda no tiene logo (personalizada), usa el badge con inicial.
struct StoreLogoView: View {
    @EnvironmentObject var session: Session
    let store: Store
    var size: CGFloat = 26

    @State private var data: Data?
    @State private var failed = false

    private var isSVG: Bool { store.logoUrl?.lowercased().hasSuffix(".svg") ?? false }
    private var radius: CGFloat { size * 0.22 }

    var body: some View {
        Group {
            if store.logoUrl == nil || failed {
                StoreBadge(store: store, size: size)
            } else if let data {
                content(data)
                    .frame(width: size, height: size)
                    .background(RoundedRectangle(cornerRadius: radius, style: .continuous).fill(.white))
                    .clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))
                    .overlay(RoundedRectangle(cornerRadius: radius, style: .continuous).strokeBorder(Color.primary.opacity(0.08)))
            } else {
                RoundedRectangle(cornerRadius: radius, style: .continuous)
                    .fill(Color.secondary.opacity(0.12)).frame(width: size, height: size)
            }
        }
        .task(id: store.id) { await load() }
    }

    @ViewBuilder private func content(_ data: Data) -> some View {
        if isSVG {
            SVGView(data: data).frame(width: size, height: size).scaleEffect(0.78)
        } else if let img = platformImage(data) {
            img.resizable().scaledToFit().padding(size * 0.1)
        } else {
            StoreBadge(store: store, size: size)
        }
    }

    private func load() async {
        guard let path = store.logoUrl, data == nil, !failed else { return }
        do { data = try await session.api.fetchAsset(path: path) }
        catch { failed = true }
    }
}

/// Icono de producto: emoji, símbolo (para iconos creados en web) o inicial.
struct ItemIcon: View {
    let item: Item
    var size: CGFloat = 38
    var body: some View {
        Group {
            if item.iconType == "emoji", let icon = item.icon, !icon.isEmpty {
                RoundedRectangle(cornerRadius: 8, style: .continuous).fill(Color.secondary.opacity(0.12))
                    .overlay(Text(icon).font(.system(size: size * 0.55)))
            } else if item.iconType == "icon", item.icon != nil {
                RoundedRectangle(cornerRadius: 8, style: .continuous).fill(Color.accentColor.opacity(0.15))
                    .overlay(Image(systemName: "basket.fill").font(.system(size: size * 0.45)).foregroundStyle(Color.accentColor))
            } else {
                RoundedRectangle(cornerRadius: 8, style: .continuous).fill(badgeColor(item.name))
                    .overlay(Text(initialLetter(item.name)).font(.system(size: size * 0.42, weight: .semibold)).foregroundStyle(.white))
            }
        }
        .frame(width: size, height: size)
    }
}

/// Conjunto compacto de emojis para el selector de producto.
let groceryEmojis: [String] = [
    "🥛","🧀","🥚","🧈","🍞","🥐","🥖","🥯","🍝","🍚","🥣","🥫","🍯","🧂","🫙",
    "🍎","🍌","🍓","🍇","🍊","🍋","🍉","🍑","🍍","🥝","🍅","🥦","🥬","🥕","🌽","🧅","🧄","🥔","🥑",
    "🥩","🍗","🍖","🥓","🐟","🍤","🍕","🍔","🌭","🥪","🥗","🍿","🍪","🍫","🍬","🍩","🍰","🧁","🍦",
    "☕","🍵","🧃","🥤","🍷","🍺","🍶","💧",
    "🧻","🧼","🧽","🧹","🧴","🪥","🪒","🧺","🔋","💡","🗑️","🧯",
    "💊","🩹","🌡️","😷","🧸","🍼","🐶","🐱","🦴","👕","🧦","🛒","🎁","📦"
]
