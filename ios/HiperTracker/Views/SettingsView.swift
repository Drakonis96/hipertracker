import SwiftUI
import UniformTypeIdentifiers

struct JSONBackupDocument: FileDocument {
    static var readableContentTypes: [UTType] { [.json] }
    var data: Data
    init(data: Data) { self.data = data }
    init(configuration: ReadConfiguration) throws { data = configuration.file.regularFileContents ?? Data() }
    func fileWrapper(configuration: WriteConfiguration) throws -> FileWrapper { FileWrapper(regularFileWithContents: data) }
}

private let accentPalette = [
    "#10b981","#22c55e","#14b8a6","#06b6d4","#3b82f6","#6366f1","#8b5cf6","#d946ef","#ec4899","#f43f5e","#ef4444","#f97316","#f59e0b","#84cc16","#64748b",
    // Segunda fila — tonos intensos
    "#b30333","#9f1239","#7c2d12","#b45309","#a16207","#4d7c0f","#047857","#0e7490","#1d4ed8","#4338ca","#6d28d9","#a21caf","#831843","#334155",
]

struct SettingsView: View {
    @EnvironmentObject var session: Session
    @EnvironmentObject var data: DataStore

    @State private var editingProfile: Profile?
    @State private var showNewProfile = false
    @State private var editingList: ShoppingList?
    @State private var showNewList = false
    @State private var confirm: ConfirmAction?

    @State private var exportDoc: JSONBackupDocument?
    @State private var showExporter = false
    @State private var showImporter = false
    @State private var banner: String?

    var body: some View {
        NavigationStack {
            Form {
                // Apariencia
                Section("Apariencia") {
                    Picker("Tema", selection: themeBinding) {
                        Text("Claro").tag("light")
                        Text("Oscuro").tag("dark")
                        Text("Automático").tag("system")
                    }
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Color de acento").font(.subheadline)
                        LazyVGrid(columns: [GridItem(.adaptive(minimum: 38), spacing: 12)], spacing: 12) {
                            ForEach(accentPalette, id: \.self) { c in
                                Button { setAccent(c) } label: {
                                    Circle().fill(Color(hex: c)).frame(width: 30, height: 30)
                                        .overlay(Circle().strokeBorder(.primary, lineWidth: session.profile?.accentColor?.lowercased() == c ? 2.5 : 0))
                                }.buttonStyle(.plain)
                            }
                        }
                    }
                    .padding(.vertical, 4)
                }

                // Perfiles
                Section {
                    ForEach(session.profiles) { p in
                        HStack {
                            AvatarView(profile: p, size: 36)
                            VStack(alignment: .leading) {
                                Text(p.name) + Text(p.id == session.profile?.id ? "  (tú)" : "").foregroundColor(.secondary)
                                HStack(spacing: 8) {
                                    if p.isAdmin { Label("Admin", systemImage: "checkmark.shield").labelStyle(.titleAndIcon).font(.caption2).foregroundStyle(.secondary) }
                                    if p.hasPin { Label("PIN", systemImage: "lock").font(.caption2).foregroundStyle(.secondary) }
                                }
                            }
                            Spacer()
                            Button { editingProfile = p } label: { Image(systemName: "pencil") }.buttonStyle(.plain).foregroundStyle(.secondary)
                        }
                        .swipeActions {
                            if session.profile?.isAdmin == true && !p.isAdmin {
                                Button(role: .destructive) {
                                    confirm = ConfirmAction(title: "Eliminar perfil", message: "¿Eliminar “\(p.name)”?") {
                                        try await session.deleteProfile(id: p.id)
                                    }
                                } label: { Label("Eliminar", systemImage: "trash") }
                            }
                        }
                    }
                } header: {
                    HStack { Text("Perfiles"); Spacer(); Button("Nuevo") { showNewProfile = true }.font(.caption) }
                }

                // Listas
                Section {
                    ForEach(data.lists) { l in
                        HStack {
                            Image(systemName: l.isShared ? "person.2" : "lock").foregroundStyle(.secondary)
                            VStack(alignment: .leading) {
                                Text(l.name)
                                Text("\(l.isShared ? "Compartida" : "Personal") · \(l.checkedCount ?? 0)/\(l.itemCount ?? 0)").font(.caption).foregroundStyle(.secondary)
                            }
                            Spacer()
                            Button { editingList = l } label: { Image(systemName: "pencil") }.buttonStyle(.plain).foregroundStyle(.secondary)
                        }
                        .swipeActions {
                            Button(role: .destructive) {
                                confirm = ConfirmAction(title: "Eliminar lista", message: "¿Eliminar “\(l.name)” y sus productos?") {
                                    try await data.deleteList(id: l.id)
                                }
                            } label: { Label("Eliminar", systemImage: "trash") }
                        }
                    }
                } header: {
                    HStack { Text("Listas"); Spacer(); Button("Nueva") { showNewList = true }.font(.caption) }
                }

                // Datos
                Section("Copia de seguridad") {
                    Button { exportBackup() } label: { Label("Exportar copia completa", systemImage: "square.and.arrow.up") }
                    Button { showImporter = true } label: { Label("Importar copia", systemImage: "square.and.arrow.down") }
                    if let banner { Text(banner).font(.caption).foregroundStyle(.secondary) }
                }

                // Servidor
                Section("Servidor") {
                    LabeledContent("Dirección", value: session.config?.normalizedBase ?? "—")
                    if session.config?.usesBasicAuth == true {
                        LabeledContent("Basic Auth", value: session.config?.basicUser ?? "—")
                    }
                    if session.config?.usesAppAuth == true {
                        LabeledContent("Login de la app", value: session.config?.appUser ?? "—")
                    }
                    Button("Cambiar servidor") { session.changeServer() }
                    Button("Cerrar sesión", role: .destructive) { session.signOut() }
                }

                // Acerca de
                Section("Acerca de") {
                    LabeledContent("Versión", value: "v0.1.9")
                    if let base = session.config?.normalizedBase, let url = URL(string: base + "/api/docs") {
                        Link("Documentación de la API", destination: url)
                    }
                    Button("Cambiar de perfil") { session.logout() }
                }
            }
            .navigationTitle("Ajustes")
            .sheet(item: $editingProfile) { p in ProfileEditView(profile: p) }
            .sheet(isPresented: $showNewProfile) { ProfileEditView(profile: nil) }
            .sheet(item: $editingList) { l in ListEditView(list: l) }
            .sheet(isPresented: $showNewList) { ListEditView(list: nil) }
            .fileExporter(isPresented: $showExporter, document: exportDoc, contentType: .json, defaultFilename: "hipertracker-backup") { _ in }
            .fileImporter(isPresented: $showImporter, allowedContentTypes: [.json]) { result in importBackup(result) }
            .confirmationDialog(confirm?.title ?? "", isPresented: Binding(get: { confirm != nil }, set: { if !$0 { confirm = nil } }), titleVisibility: .visible) {
                Button("Eliminar", role: .destructive) {
                    if let c = confirm { Task { try? await c.run() } }
                }
            } message: { Text(confirm?.message ?? "") }
        }
    }

    private var themeBinding: Binding<String> {
        Binding(get: { session.profile?.theme ?? "system" },
                set: { v in Task { try? await session.updateProfile(id: session.profile?.id ?? "", body: ["theme": v]) } })
    }

    private func setAccent(_ hex: String) {
        Task { try? await session.updateProfile(id: session.profile?.id ?? "", body: ["accentColor": hex]) }
    }

    private func exportBackup() {
        Task {
            do {
                let data = try await data.exportAll()
                exportDoc = JSONBackupDocument(data: data)
                showExporter = true
            } catch { banner = "No se pudo exportar" }
        }
    }

    private func importBackup(_ result: Result<URL, Error>) {
        switch result {
        case .success(let url):
            Task {
                let needsScope = url.startAccessingSecurityScopedResource()
                defer { if needsScope { url.stopAccessingSecurityScopedResource() } }
                do {
                    let fileData = try Data(contentsOf: url)
                    let summary = try await data.importAll(fileData)
                    banner = "Importadas \(summary.lists) listas y \(summary.items) productos"
                } catch { banner = "No se pudo importar la copia" }
            }
        case .failure:
            banner = "No se seleccionó ningún archivo"
        }
    }
}

struct ConfirmAction: Identifiable {
    let id = UUID()
    let title: String
    let message: String
    let run: () async throws -> Void
}
