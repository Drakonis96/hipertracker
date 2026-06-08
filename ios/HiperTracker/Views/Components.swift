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
            StoreLogoView(store: store, size: 22)
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
            SVGView(data: data).frame(width: size, height: size).scaleEffect(0.92)
        } else if let img = platformImage(data) {
            img.resizable().scaledToFit().padding(size * 0.04)
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

/// Emoji con palabras clave bilingües (español + inglés) para el selector y las
/// sugerencias automáticas según el nombre del producto.
struct EmojiKeyword { let emoji: String; let kw: String }

let emojiKeywords: [EmojiKeyword] = [
    // Comida
    .init(emoji: "🥛", kw: "leche lacteo milk"),
    .init(emoji: "🧀", kw: "queso cheese"),
    .init(emoji: "🥚", kw: "huevo huevos egg eggs"),
    .init(emoji: "🧈", kw: "mantequilla butter"),
    .init(emoji: "🍞", kw: "pan bread"),
    .init(emoji: "🥐", kw: "croissant cruasan"),
    .init(emoji: "🥖", kw: "baguette barra pan loaf"),
    .init(emoji: "🥯", kw: "bagel"),
    .init(emoji: "🥨", kw: "pretzel"),
    .init(emoji: "🍝", kw: "pasta espagueti spaghetti noodles"),
    .init(emoji: "🍚", kw: "arroz rice"),
    .init(emoji: "🍜", kw: "ramen fideos noodles"),
    .init(emoji: "🥣", kw: "cereales cereal bol bowl"),
    .init(emoji: "🥫", kw: "conserva lata canned can"),
    .init(emoji: "🍯", kw: "miel honey"),
    .init(emoji: "🧂", kw: "sal salt"),
    .init(emoji: "🫙", kw: "tarro bote mermelada jam jar"),
    .init(emoji: "🍅", kw: "tomate tomato"),
    .init(emoji: "🥦", kw: "brocoli broccoli"),
    .init(emoji: "🥬", kw: "lechuga lettuce"),
    .init(emoji: "🥒", kw: "pepino cucumber"),
    .init(emoji: "🌶️", kw: "pimiento picante chili pepper"),
    .init(emoji: "🌽", kw: "maiz corn"),
    .init(emoji: "🥕", kw: "zanahoria carrot"),
    .init(emoji: "🧅", kw: "cebolla onion"),
    .init(emoji: "🧄", kw: "ajo garlic"),
    .init(emoji: "🥔", kw: "patata patatas potato"),
    .init(emoji: "🥑", kw: "aguacate avocado"),
    .init(emoji: "🍆", kw: "berenjena eggplant aubergine"),
    .init(emoji: "🍎", kw: "manzana apple"),
    .init(emoji: "🍏", kw: "manzana verde apple green"),
    .init(emoji: "🍌", kw: "platano banana"),
    .init(emoji: "🍓", kw: "fresa strawberry"),
    .init(emoji: "🍇", kw: "uva uvas grape grapes"),
    .init(emoji: "🍊", kw: "naranja mandarina orange tangerine"),
    .init(emoji: "🍋", kw: "limon lemon lime"),
    .init(emoji: "🍉", kw: "sandia watermelon"),
    .init(emoji: "🍑", kw: "melocoton peach"),
    .init(emoji: "🍐", kw: "pera pear"),
    .init(emoji: "🍒", kw: "cereza cerezas cherry"),
    .init(emoji: "🍈", kw: "melon"),
    .init(emoji: "🍍", kw: "piña pineapple"),
    .init(emoji: "🥝", kw: "kiwi"),
    .init(emoji: "🥭", kw: "mango"),
    .init(emoji: "🥥", kw: "coco coconut"),
    .init(emoji: "🫐", kw: "arandanos blueberry"),
    .init(emoji: "🥜", kw: "cacahuete peanut nut"),
    .init(emoji: "🥩", kw: "carne filete ternera meat steak beef"),
    .init(emoji: "🍗", kw: "pollo muslo chicken"),
    .init(emoji: "🍖", kw: "carne costilla meat ribs"),
    .init(emoji: "🥓", kw: "bacon panceta"),
    .init(emoji: "🌭", kw: "perrito salchicha hotdog sausage"),
    .init(emoji: "🍔", kw: "hamburguesa burger"),
    .init(emoji: "🍟", kw: "patatas fritas fries"),
    .init(emoji: "🍕", kw: "pizza"),
    .init(emoji: "🥪", kw: "sandwich bocadillo"),
    .init(emoji: "🌮", kw: "taco"),
    .init(emoji: "🌯", kw: "burrito durum kebab"),
    .init(emoji: "🥗", kw: "ensalada salad"),
    .init(emoji: "🍲", kw: "sopa cocido soup stew"),
    .init(emoji: "🍣", kw: "sushi"),
    .init(emoji: "🍤", kw: "gamba langostino marisco shrimp prawn seafood"),
    .init(emoji: "🍿", kw: "palomitas popcorn"),
    .init(emoji: "🍪", kw: "galleta cookie biscuit"),
    .init(emoji: "🍫", kw: "chocolate"),
    .init(emoji: "🍬", kw: "caramelo chuche candy sweet"),
    .init(emoji: "🍭", kw: "piruleta lollipop"),
    .init(emoji: "🍩", kw: "donut doughnut"),
    .init(emoji: "🍰", kw: "tarta pastel cake"),
    .init(emoji: "🧁", kw: "magdalena cupcake muffin"),
    .init(emoji: "🎂", kw: "tarta cumpleaños cake birthday"),
    .init(emoji: "🍦", kw: "helado ice cream icecream"),
    .init(emoji: "🧊", kw: "hielo ice"),
    // Bebida
    .init(emoji: "☕", kw: "cafe coffee te tea"),
    .init(emoji: "🍵", kw: "te verde infusion tea"),
    .init(emoji: "🫖", kw: "tetera teapot tea"),
    .init(emoji: "🧃", kw: "zumo brik juice"),
    .init(emoji: "🥤", kw: "refresco soda"),
    .init(emoji: "🍷", kw: "vino wine"),
    .init(emoji: "🍺", kw: "cerveza beer"),
    .init(emoji: "🍻", kw: "cervezas beers brindis"),
    .init(emoji: "🍾", kw: "champan cava champagne"),
    .init(emoji: "🥃", kw: "whisky whiskey"),
    .init(emoji: "🍶", kw: "sake botella"),
    .init(emoji: "🧋", kw: "batido smoothie bubble tea"),
    .init(emoji: "💧", kw: "agua water"),
    // Hogar
    .init(emoji: "🧻", kw: "papel higienico rollo toilet paper"),
    .init(emoji: "🧼", kw: "jabon soap"),
    .init(emoji: "🧽", kw: "esponja estropajo sponge"),
    .init(emoji: "🧹", kw: "escoba broom"),
    .init(emoji: "🧴", kw: "gel locion champu lotion shampoo"),
    .init(emoji: "🪣", kw: "cubo fregona bucket mop"),
    .init(emoji: "🧺", kw: "cesta colada laundry basket"),
    .init(emoji: "🔋", kw: "pila bateria battery"),
    .init(emoji: "💡", kw: "bombilla luz bulb light"),
    .init(emoji: "🕯️", kw: "vela candle"),
    .init(emoji: "🗑️", kw: "basura papelera trash garbage bin"),
    .init(emoji: "🧯", kw: "extintor fire"),
    .init(emoji: "🔌", kw: "enchufe cargador plug charger"),
    .init(emoji: "🧲", kw: "iman magnet"),
    .init(emoji: "🔑", kw: "llave key"),
    .init(emoji: "🧵", kw: "hilo costura thread sewing"),
    .init(emoji: "🪡", kw: "aguja needle"),
    .init(emoji: "🧶", kw: "lana ovillo wool yarn"),
    .init(emoji: "📦", kw: "caja paquete box package"),
    .init(emoji: "🪴", kw: "planta maceta plant"),
    // Higiene y salud
    .init(emoji: "💊", kw: "pastilla medicina medicamento pill medicine"),
    .init(emoji: "🩹", kw: "tirita venda bandage plaster"),
    .init(emoji: "🌡️", kw: "termometro fiebre thermometer fever"),
    .init(emoji: "🦷", kw: "diente dental tooth"),
    .init(emoji: "🪥", kw: "cepillo dientes toothbrush"),
    .init(emoji: "🪒", kw: "cuchilla afeitar razor shaving"),
    .init(emoji: "😷", kw: "mascarilla mask"),
    .init(emoji: "👓", kw: "gafas glasses"),
    // Ropa
    .init(emoji: "👕", kw: "camiseta ropa tshirt shirt clothes"),
    .init(emoji: "👖", kw: "pantalon vaquero pants jeans trousers"),
    .init(emoji: "🧦", kw: "calcetines socks"),
    .init(emoji: "🧤", kw: "guantes gloves"),
    .init(emoji: "🧥", kw: "abrigo chaqueta coat jacket"),
    .init(emoji: "🧣", kw: "bufanda scarf"),
    .init(emoji: "🧢", kw: "gorra cap"),
    .init(emoji: "👟", kw: "zapatillas zapato sneakers shoe shoes"),
    .init(emoji: "👜", kw: "bolso bag"),
    .init(emoji: "🎒", kw: "mochila backpack"),
    // Otros
    .init(emoji: "🛒", kw: "carrito compra cart shopping"),
    .init(emoji: "🛍️", kw: "bolsas compra shopping bags"),
    .init(emoji: "🎁", kw: "regalo gift present"),
    .init(emoji: "📱", kw: "movil telefono phone mobile"),
    .init(emoji: "💻", kw: "portatil ordenador laptop computer"),
    .init(emoji: "📺", kw: "television tele tv"),
    .init(emoji: "📷", kw: "camara foto camera"),
    .init(emoji: "🎧", kw: "auriculares headphones"),
    .init(emoji: "📖", kw: "libro libros book books"),
    .init(emoji: "📰", kw: "periodico newspaper"),
    .init(emoji: "✏️", kw: "lapiz pencil"),
    .init(emoji: "🖊️", kw: "boligrafo pen"),
    .init(emoji: "✂️", kw: "tijeras scissors"),
    .init(emoji: "🧸", kw: "peluche juguete teddy toy"),
    .init(emoji: "⚽", kw: "balon futbol ball football soccer"),
    .init(emoji: "🚲", kw: "bici bicicleta bike bicycle"),
    .init(emoji: "🌸", kw: "flor flower"),
    .init(emoji: "💐", kw: "ramo flores bouquet flowers"),
    .init(emoji: "🐶", kw: "perro mascota dog pet"),
    .init(emoji: "🐱", kw: "gato cat"),
    .init(emoji: "🐟", kw: "pez fish"),
    .init(emoji: "🦴", kw: "hueso bone perro dog"),
    .init(emoji: "🍼", kw: "biberon bebe baby bottle"),
    .init(emoji: "🚼", kw: "bebe pañal baby diaper"),
]

/// Lista de emojis (única) para la cuadrícula del selector de iconos.
let groceryEmojis: [String] = {
    var seen = Set<String>()
    return emojiKeywords.compactMap { seen.insert($0.emoji).inserted ? $0.emoji : nil }
}()

/// Normaliza: minúsculas y sin acentos (para casar es/en sin importar tildes).
private func normEmoji(_ s: String) -> String {
    s.folding(options: .diacriticInsensitive, locale: Locale(identifier: "es")).lowercased()
}

/// Sugiere emojis a partir del nombre de un producto (escrito en español o inglés).
func suggestEmojis(_ name: String, limit: Int = 8) -> [String] {
    let words = normEmoji(name)
        .split(whereSeparator: { !$0.isLetter && !$0.isNumber })
        .map(String.init)
        .filter { $0.count >= 2 }
    guard !words.isEmpty else { return [] }
    var out: [String] = []
    var seen = Set<String>()
    for w in words {
        for ek in emojiKeywords where !seen.contains(ek.emoji) {
            let kws = normEmoji(ek.kw).split(separator: " ").map(String.init)
            let hit = kws.contains { x in
                x == w || (w.count >= 4 && x.hasPrefix(w)) || (x.count >= 4 && w.hasPrefix(x))
            }
            if hit {
                out.append(ek.emoji); seen.insert(ek.emoji)
                if out.count >= limit { return out }
            }
        }
    }
    return out
}
