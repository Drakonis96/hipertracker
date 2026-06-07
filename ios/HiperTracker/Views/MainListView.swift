import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var session: Session
    @EnvironmentObject var data: DataStore

    var body: some View {
        TabView {
            MainListView()
                .tabItem { Label("Lista", systemImage: "checklist") }
            StoresView()
                .tabItem { Label("Tiendas", systemImage: "storefront") }
            SettingsView()
                .tabItem { Label("Ajustes", systemImage: "gearshape") }
        }
        .tint(Color(hex: session.profile?.accentColor))
        .task {
            await data.loadStores()
            await data.loadLists()
            await data.loadItems()
        }
    }
}

enum StatusFilter: String, CaseIterable, Identifiable {
    case all = "Todos", pending = "Pendientes", done = "Completados"
    var id: String { rawValue }
}

struct MainListView: View {
    @EnvironmentObject var session: Session
    @EnvironmentObject var data: DataStore

    @State private var search = ""
    @State private var status: StatusFilter = .all
    @State private var selectedStores: Set<String> = []
    @State private var showCreate = false
    @State private var editingItem: Item?
    @State private var showNewList = false
    @State private var editingList: ShoppingList?
    @State private var deleteTarget: Item?

    private var filtered: [Item] {
        data.items.filter { item in
            if !search.isEmpty && !item.name.localizedCaseInsensitiveContains(search) { return false }
            if !selectedStores.isEmpty {
                let none = selectedStores.contains("__none__") && item.stores.isEmpty
                let any = item.stores.contains { selectedStores.contains($0) }
                if !none && !any { return false }
            }
            if status == .pending && item.checked { return false }
            if status == .done && !item.checked { return false }
            return true
        }
    }
    private var pending: [Item] { filtered.filter { !$0.checked } }
    private var done: [Item] { filtered.filter { $0.checked } }

    private var presentStores: [Store] {
        let ids = Set(data.items.flatMap { $0.stores })
        return data.stores.filter { ids.contains($0.id) }
    }
    private var hasNoneStore: Bool { data.items.contains { $0.stores.isEmpty } }

    var body: some View {
        NavigationStack {
            Group {
                if data.activeList == nil {
                    ContentUnavailableView {
                        Label("No tienes ninguna lista", systemImage: "checklist")
                    } description: {
                        Text("Crea tu primera lista para empezar.")
                    } actions: {
                        Button("Crear lista") { showNewList = true }.prominentGlassButton()
                    }
                } else {
                    listBody
                }
            }
            .navigationTitle(data.activeList?.name ?? "HiperTracker")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar { toolbarContent }
            .searchable(text: $search, prompt: "Buscar producto…")
            .sheet(isPresented: $showCreate) {
                ProductEditView(item: nil, listId: data.activeListId ?? "")
            }
            .sheet(item: $editingItem) { item in
                ProductEditView(item: item, listId: item.listId)
            }
            .sheet(isPresented: $showNewList) { ListEditView(list: nil) }
            .sheet(item: $editingList) { l in ListEditView(list: l) }
            .confirmationDialog("¿Eliminar este producto?", isPresented: Binding(get: { deleteTarget != nil }, set: { if !$0 { deleteTarget = nil } }), titleVisibility: .visible) {
                Button("Eliminar", role: .destructive) {
                    if let t = deleteTarget { Task { try? await data.deleteItem(t) } }
                }
            } message: { Text("Esta acción no se puede deshacer.") }
        }
    }

    @ViewBuilder private var listBody: some View {
        VStack(spacing: 0) {
            progressBar
            if !presentStores.isEmpty || hasNoneStore { storeFilterBar }
            Picker("Estado", selection: $status) {
                ForEach(StatusFilter.allCases) { Text($0.rawValue).tag($0) }
            }
            .pickerStyle(.segmented).padding(.horizontal).padding(.vertical, 8)

            if data.items.isEmpty {
                ContentUnavailableView {
                    Label("Esta lista está vacía", systemImage: "shippingbox")
                } description: { Text("Añade tu primer producto.") } actions: {
                    Button("Añadir producto") { showCreate = true }.prominentGlassButton()
                }
            } else if filtered.isEmpty {
                ContentUnavailableView.search
            } else {
                List {
                    if !pending.isEmpty {
                        Section {
                            ForEach(pending) { item in row(item) }
                                .onMove(perform: move)
                        }
                    }
                    if !done.isEmpty {
                        Section("Completados · \(done.count)") {
                            ForEach(done) { item in row(item) }
                        }
                    }
                }
                .listStyle(.plain)
            }
        }
    }

    private func row(_ item: Item) -> some View {
        HStack(spacing: 12) {
            Button { Task { await data.toggleCheck(item) } } label: {
                Image(systemName: item.checked ? "checkmark.circle.fill" : "circle")
                    .font(.title3).foregroundStyle(item.checked ? Color.accentColor : Color.secondary)
            }.buttonStyle(.plain)

            ItemIcon(item: item, size: 36)

            VStack(alignment: .leading, spacing: 2) {
                Text(item.name).strikethrough(item.checked).foregroundStyle(item.checked ? .secondary : .primary)
                if let notes = item.notes, !notes.isEmpty {
                    Text(notes).font(.caption).foregroundStyle(.secondary).lineLimit(1)
                }
            }
            Spacer()
            HStack(spacing: 3) {
                ForEach(item.stores.prefix(3).compactMap { data.storesById[$0] }) { s in
                    StoreLogoView(store: s, size: 24)
                }
                if item.stores.count > 3 {
                    Text("+\(item.stores.count - 3)").font(.caption2).padding(4)
                        .background(Color.secondary.opacity(0.2), in: Circle())
                }
            }
        }
        .contentShape(Rectangle())
        .onTapGesture { editingItem = item }
        .swipeActions(edge: .trailing) {
            Button(role: .destructive) { deleteTarget = item } label: { Label("Eliminar", systemImage: "trash") }
            Button { editingItem = item } label: { Label("Editar", systemImage: "pencil") }.tint(.blue)
        }
        .swipeActions(edge: .leading) {
            Button { Task { try? await data.duplicateItem(item) } } label: { Label("Duplicar", systemImage: "plus.square.on.square") }.tint(.indigo)
        }
    }

    private var progressBar: some View {
        let total = data.items.count
        let checked = data.items.filter { $0.checked }.count
        let pct = total == 0 ? 0.0 : Double(checked) / Double(total)
        return VStack(spacing: 4) {
            HStack {
                Label(data.activeList?.isShared == true ? "Compartida" : "Personal",
                      systemImage: data.activeList?.isShared == true ? "person.2.fill" : "lock.fill")
                    .font(.caption).foregroundStyle(.secondary)
                Spacer()
                Text("\(checked)/\(total) · \(Int(pct * 100))%").font(.caption).monospacedDigit().foregroundStyle(.secondary)
            }
            ProgressView(value: pct).tint(Color(hex: session.profile?.accentColor))
        }
        .padding(.horizontal).padding(.top, 8)
    }

    private var storeFilterBar: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(presentStores) { s in
                    chip(s.name, badge: s, on: selectedStores.contains(s.id)) { toggle(s.id) }
                }
                if hasNoneStore {
                    chip("Sin tienda", badge: nil, on: selectedStores.contains("__none__")) { toggle("__none__") }
                }
            }.padding(.horizontal)
        }.padding(.top, 4)
    }

    @ViewBuilder
    private func chip(_ text: String, badge: Store?, on: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            let content = HStack(spacing: 6) {
                if let badge { StoreLogoView(store: badge, size: 16) }
                Text(text).font(.caption).fontWeight(.medium)
            }
            .padding(.vertical, 5).padding(.leading, badge == nil ? 10 : 4).padding(.trailing, 10)
            .foregroundStyle(on ? Color.accentColor : Color.primary)

            if on {
                content.background(Capsule().fill(Color.accentColor.opacity(0.22)))
            } else {
                content.glassInteractiveBackground(Capsule())
            }
        }.buttonStyle(.plain)
    }

    @ToolbarContentBuilder private var toolbarContent: some ToolbarContent {
        ToolbarItem(placement: .principal) {
            Menu {
                ForEach(data.lists) { l in
                    Button {
                        Task { await data.setActiveList(l.id) }
                    } label: {
                        Label(l.name, systemImage: l.id == data.activeListId ? "checkmark" : (l.isShared ? "person.2" : "lock"))
                    }
                }
                Divider()
                Button { showNewList = true } label: { Label("Nueva lista", systemImage: "plus") }
                if data.activeList != nil {
                    Button { editingList = data.activeList } label: { Label("Editar lista", systemImage: "pencil") }
                }
            } label: {
                HStack(spacing: 4) {
                    Text(data.activeList?.name ?? "Listas").fontWeight(.semibold)
                    Image(systemName: "chevron.down").font(.caption2)
                }
            }
        }
        ToolbarItem(placement: .primaryAction) {
            Button { showCreate = true } label: { Image(systemName: "plus") }
                .disabled(data.activeList == nil)
        }
    }

    private func toggle(_ id: String) {
        if selectedStores.contains(id) { selectedStores.remove(id) } else { selectedStores.insert(id) }
    }

    private func move(from offsets: IndexSet, to dest: Int) {
        var p = pending
        p.move(fromOffsets: offsets, toOffset: dest)
        Task { await data.reorder(pendingIds: p.map { $0.id }, doneIds: done.map { $0.id }) }
    }
}

// MARK: - Crear / editar lista

struct ListEditView: View {
    @EnvironmentObject var data: DataStore
    @Environment(\.dismiss) private var dismiss
    let list: ShoppingList?

    @State private var name = ""
    @State private var type = "personal"
    @State private var saving = false
    @State private var error: String?

    var body: some View {
        NavigationStack {
            Form {
                Section("Nombre") { TextField("Ej. Compra semanal", text: $name) }
                Section("Tipo") {
                    Picker("Tipo", selection: $type) {
                        Label("Personal", systemImage: "lock").tag("personal")
                        Label("Compartida", systemImage: "person.2").tag("shared")
                    }.pickerStyle(.inline).labelsHidden()
                }
                if let error { Text(error).foregroundStyle(.red) }
            }
            .navigationTitle(list == nil ? "Nueva lista" : "Editar lista")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancelar") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button(list == nil ? "Crear" : "Guardar") { save() }
                        .disabled(saving || name.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
            .onAppear { if let l = list { name = l.name; type = l.type } }
        }
    }

    private func save() {
        saving = true; error = nil
        Task {
            do {
                if let l = list { try await data.updateList(id: l.id, name: name, type: type) }
                else { try await data.createList(name: name, type: type) }
                dismiss()
            } catch let e as APIError { error = e.errorDescription }
            catch let err { error = err.localizedDescription }
            saving = false
        }
    }
}
