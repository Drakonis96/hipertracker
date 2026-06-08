import SwiftUI

struct StoresView: View {
    @EnvironmentObject var data: DataStore
    @State private var showNew = false
    @State private var deleteTarget: Store?
    @State private var search = ""

    private func categoryRank(_ category: String) -> Int {
        switch category {
        case "supermercados": return 0
        case "otras": return 1
        default: return 2 // personalizada y demás
        }
    }

    private var grouped: [(String, [Store])] {
        let filtered = data.stores.filter { search.isEmpty || $0.name.localizedCaseInsensitiveContains(search) }
        let dict = Dictionary(grouping: filtered, by: { $0.categoryLabel })
        // Primero Supermercados, luego Otras, luego Personalizadas.
        return dict.sorted {
            let r0 = categoryRank($0.value.first?.category ?? ""), r1 = categoryRank($1.value.first?.category ?? "")
            return r0 != r1 ? r0 < r1 : $0.key < $1.key
        }
    }

    var body: some View {
        NavigationStack {
            List {
                ForEach(grouped, id: \.0) { label, stores in
                    Section(label) {
                        ForEach(stores) { s in
                            HStack {
                                StoreLogoView(store: s, size: 30)
                                Text(s.name)
                                Spacer()
                                if s.isCustom {
                                    Image(systemName: "person.crop.circle.badge.checkmark")
                                        .foregroundStyle(.secondary).font(.caption)
                                }
                            }
                            .swipeActions {
                                if s.isCustom {
                                    Button(role: .destructive) { deleteTarget = s } label: { Label("Eliminar", systemImage: "trash") }
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("Tiendas")
            .searchable(text: $search, prompt: "Buscar tienda…")
            .overlay {
                if grouped.isEmpty && !search.isEmpty {
                    ContentUnavailableView.search(text: search)
                }
            }
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button { showNew = true } label: { Label("Añadir", systemImage: "plus") }
                }
            }
            .sheet(isPresented: $showNew) { CustomStoreEditView() }
            .confirmationDialog("¿Eliminar tienda personalizada?",
                                isPresented: Binding(get: { deleteTarget != nil }, set: { if !$0 { deleteTarget = nil } }),
                                titleVisibility: .visible) {
                Button("Eliminar", role: .destructive) {
                    if let t = deleteTarget { Task { try? await data.deleteStore(id: t.id) } }
                }
            } message: { Text("Se quitará de todos los productos.") }
        }
    }
}
