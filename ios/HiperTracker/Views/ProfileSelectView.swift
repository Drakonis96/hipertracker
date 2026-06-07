import SwiftUI

private let avatarEmojis = ["🦊","🐶","🐱","🐼","🐵","🦁","🐯","🐸","🐧","🐰","🦄","🐢","🐙","🦉","🐝","🦋","🌸","🌟","⚡","🍀","🚀","🎈","🎮","👑","🤖","👻","😎","🐲"]
private let colorPalette = [
    "#10b981","#22c55e","#14b8a6","#06b6d4","#3b82f6","#6366f1","#8b5cf6","#d946ef","#ec4899","#f43f5e","#ef4444","#f97316","#f59e0b","#84cc16","#64748b",
    "#b30333","#9f1239","#7c2d12","#b45309","#a16207","#4d7c0f","#047857","#0e7490","#1d4ed8","#4338ca","#6d28d9","#a21caf","#831843","#334155",
]

struct ProfileSelectView: View {
    @EnvironmentObject var session: Session
    @State private var pinFor: Profile?
    @State private var showCreate = false

    private let columns = [GridItem(.adaptive(minimum: 96), spacing: 20)]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 8) {
                    Image("AppLogo").resizable().scaledToFit().frame(width: 60, height: 60)
                        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                    Text("HiperTracker").font(.title2.bold())
                    Text(session.profiles.isEmpty ? "Crea tu primer perfil" : "Elige tu perfil")
                        .font(.subheadline).foregroundStyle(.secondary)
                }
                .padding(.top, 24).padding(.bottom, 28)

                LazyVGrid(columns: columns, spacing: 22) {
                    ForEach(session.profiles) { p in
                        Button { select(p) } label: {
                            VStack(spacing: 8) {
                                ZStack(alignment: .bottomTrailing) {
                                    AvatarView(profile: p, size: 84)
                                    if p.hasPin {
                                        Image(systemName: "lock.fill").font(.caption2)
                                            .padding(6).background(.thinMaterial, in: Circle())
                                    }
                                }
                                Text(p.name).font(.subheadline).lineLimit(1).foregroundStyle(.primary)
                            }
                        }
                        .buttonStyle(.plain)
                    }

                    Button { showCreate = true } label: {
                        VStack(spacing: 8) {
                            ZStack {
                                Circle().strokeBorder(style: StrokeStyle(lineWidth: 2, dash: [6])).foregroundStyle(.secondary)
                                Image(systemName: "plus").font(.title)
                            }
                            .frame(width: 84, height: 84)
                            Text("Añadir perfil").font(.subheadline)
                        }
                        .foregroundStyle(.secondary)
                    }
                    .buttonStyle(.plain)
                }
                .padding(.horizontal)
            }
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button { session.changeServer() } label: { Label("Servidor", systemImage: "server.rack") }
                }
            }
            .sheet(item: $pinFor) { p in PinEntrySheet(profile: p) }
            .sheet(isPresented: $showCreate) { ProfileEditView(profile: nil) }
        }
    }

    private func select(_ p: Profile) {
        if p.hasPin { pinFor = p }
        else { Task { try? await session.login(profile: p, pin: nil) } }
    }
}

// MARK: - PIN

struct PinEntrySheet: View {
    @EnvironmentObject var session: Session
    @Environment(\.dismiss) private var dismiss
    let profile: Profile
    @State private var pin = ""
    @State private var error: String?

    var body: some View {
        VStack(spacing: 22) {
            AvatarView(profile: profile, size: 64)
            Text("Hola, \(profile.name)").font(.headline)
            Text("Introduce tu PIN").font(.subheadline).foregroundStyle(.secondary)
            PinPadView(pin: $pin, error: error, onSubmit: submit)
            Button("Cancelar") { dismiss() }.foregroundStyle(.secondary)
        }
        .padding(.vertical, 28)
        .presentationDetents([.medium, .large])
    }

    private func submit() {
        Task {
            do {
                try await session.login(profile: profile, pin: pin)
                dismiss()
            } catch let e as APIError {
                error = e.errorDescription; pin = ""
            } catch {
                self.error = "PIN incorrecto, inténtalo de nuevo"; pin = ""
            }
        }
    }
}

struct PinPadView: View {
    @Binding var pin: String
    var minLen = 4
    var maxLen = 6
    var error: String?
    var onSubmit: () -> Void

    private let keys = ["1","2","3","4","5","6","7","8","9"]

    var body: some View {
        VStack(spacing: 18) {
            HStack(spacing: 12) {
                ForEach(0..<maxLen, id: \.self) { i in
                    Circle().fill(i < pin.count ? Color.accentColor : Color.secondary.opacity(0.25))
                        .frame(width: 12, height: 12)
                }
            }
            if let error { Text(error).font(.callout).foregroundStyle(.red) }

            LazyVGrid(columns: Array(repeating: GridItem(.fixed(64), spacing: 14), count: 3), spacing: 14) {
                ForEach(keys, id: \.self) { k in keyButton(k) { append(k) } }
                keyButton(systemImage: "delete.left") { if !pin.isEmpty { pin.removeLast() } }
                keyButton("0") { append("0") }
                keyButton(systemImage: "checkmark", accent: pin.count >= minLen) {
                    if pin.count >= minLen { onSubmit() }
                }
            }
        }
    }

    private func append(_ d: String) { if pin.count < maxLen { pin += d } }

    @ViewBuilder
    private func keyButton(_ label: String? = nil, systemImage: String? = nil, accent: Bool = false, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            let face = Group {
                if let label { Text(label).font(.title2) }
                else if let systemImage { Image(systemName: systemImage).font(.title3).foregroundStyle(accent ? .white : .primary) }
            }
            .frame(width: 64, height: 64)

            if accent {
                face.background(Circle().fill(Color.accentColor))
            } else {
                face.glassInteractiveBackground(Circle())
            }
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Crear / editar perfil

struct ProfileEditView: View {
    @EnvironmentObject var session: Session
    @Environment(\.dismiss) private var dismiss
    let profile: Profile?

    @State private var name = ""
    @State private var avatar: String? = nil
    @State private var color = "#10b981"
    @State private var pin = ""
    @State private var removePin = false
    @State private var saving = false
    @State private var error: String?

    private var editing: Bool { profile != nil }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    HStack {
                        AvatarView(profile: Profile(id: "_", name: name.isEmpty ? "?" : name, avatar: avatar, color: color, hasPin: false, isAdmin: false, accentColor: nil, theme: nil), size: 56)
                        TextField("Nombre", text: $name)
                    }
                }
                Section("Avatar") {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 10) {
                            Button { avatar = nil } label: {
                                Text("Aa").font(.headline).frame(width: 44, height: 44)
                                    .background(avatar == nil ? Color.accentColor.opacity(0.2) : Color.secondary.opacity(0.12), in: Circle())
                            }.buttonStyle(.plain)
                            ForEach(avatarEmojis, id: \.self) { e in
                                Button { avatar = e } label: {
                                    Text(e).font(.title2).frame(width: 44, height: 44)
                                        .background(avatar == e ? Color.accentColor.opacity(0.25) : Color.clear, in: Circle())
                                }.buttonStyle(.plain)
                            }
                        }
                    }
                }
                Section("Color") {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 10) {
                            ForEach(colorPalette, id: \.self) { c in
                                Button { color = c } label: {
                                    Circle().fill(Color(hex: c)).frame(width: 32, height: 32)
                                        .overlay(Circle().strokeBorder(.primary, lineWidth: color == c ? 2 : 0))
                                }.buttonStyle(.plain)
                            }
                        }
                    }
                }
                Section {
                    if editing, profile?.hasPin == true {
                        Toggle("Quitar PIN", isOn: $removePin)
                    }
                    if !removePin {
                        SecureField(editing ? "Nuevo PIN (vacío = sin cambios)" : "PIN (opcional)", text: $pin)
                            #if os(iOS)
                            .keyboardType(.numberPad)
                            #endif
                    }
                } header: { Text("PIN") } footer: { Text("4 a 6 dígitos numéricos.") }

                if let error { Section { Text(error).foregroundStyle(.red) } }
            }
            .navigationTitle(editing ? "Editar perfil" : "Nuevo perfil")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancelar") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button(editing ? "Guardar" : "Crear") { save() }.disabled(saving || name.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
            .onAppear {
                if let p = profile { name = p.name; avatar = p.avatar; color = p.color }
            }
        }
    }

    private func save() {
        saving = true; error = nil
        Task {
            do {
                if let p = profile {
                    var body: [String: Any] = ["name": name, "color": color]
                    body["avatar"] = avatar ?? NSNull()
                    if removePin { body["pin"] = NSNull() }
                    else if !pin.isEmpty { body["pin"] = pin }
                    try await session.updateProfile(id: p.id, body: body)
                } else {
                    _ = try await session.createProfile(name: name, avatar: avatar, color: color, pin: pin.isEmpty ? nil : pin)
                }
                dismiss()
            } catch let e as APIError { error = e.errorDescription }
            catch let err { error = err.localizedDescription }
            saving = false
        }
    }
}
