import SwiftUI

struct StoresView: View {
    @EnvironmentObject var data: DataStore
    @State private var showNew = false
    @State private var deleteTarget: Store?

    private var grouped: [(String, [Store])] {
        Dictionary(grouping: data.stores, by: { $0.categoryLabel }).sorted { $0.key < $1.key }
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
