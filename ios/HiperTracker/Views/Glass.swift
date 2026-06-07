import SwiftUI

// Compatibilidad con Liquid Glass (iOS/iPadOS/macOS 26+). En versiones
// anteriores cae a un fondo translúcido equivalente.
extension View {
    @ViewBuilder
    func glassBackground<S: Shape>(_ shape: S) -> some View {
        if #available(iOS 26.0, macOS 26.0, *) {
            self.glassEffect(.regular, in: shape)
        } else {
            self.background(shape.fill(Color.secondary.opacity(0.14)))
        }
    }

    @ViewBuilder
    func glassInteractiveBackground<S: Shape>(_ shape: S) -> some View {
        if #available(iOS 26.0, macOS 26.0, *) {
            self.glassEffect(.regular.interactive(), in: shape)
        } else {
            self.background(shape.fill(Color.secondary.opacity(0.14)))
        }
    }

    @ViewBuilder
    func prominentGlassButton() -> some View {
        if #available(iOS 26.0, macOS 26.0, *) {
            self.buttonStyle(.glassProminent)
        } else {
            self.buttonStyle(.borderedProminent)
        }
    }
}
