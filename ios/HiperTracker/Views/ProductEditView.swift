import SwiftUI

struct ProductEditView: View {
    @EnvironmentObject var data: DataStore
    @Environment(\.dismiss) private var dismiss
    let item: Item?
    let listId: String

    @State private var name = ""
    @State private var iconType = "none"
    @State private var icon: String? = nil
    @State private var notes = ""
    @State private var selectedStores: Set<String> = []
    @State private var targetList = ""
    @State private var saving = false
    @State private var error: String?

    private var editing: Bool { item != nil }
    private var previewItem: Item {
        Item(id: "_", name: name.isEmpty ? "?" : name, icon: icon, iconType: iconType,
             stores: [], listId: "", checked: false, order: 0, notes: nil)
    }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    HStack(spacing: 14) {
                        ItemIcon(item: previewItem, size: 52)
                        TextField("Nombre del producto", text: $name)
                    }
                }

                Section("Icono") {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 10) {
                            Button { iconType = "none"; icon = nil } label: {
                                Image(systemName: "nosign").frame(width: 40, height: 40)
                                    .background(iconType == "none" ? Color.accentColor.opacity(0.2) : Color.secondary.opacity(0.12), in: RoundedRectangle(cornerRadius: 8))
                            }.buttonStyle(.plain)
                            ForEach(groceryEmojis, id: \.self) { e in
                                Button { iconType = "emoji"; icon = e } label: {
                                    Text(e).font(.title2).frame(width: 40, height: 40)
                                        .background(icon == e && iconType == "emoji" ? Color.accentColor.opacity(0.25) : Color.clear, in: RoundedRectangle(cornerRadius: 8))
                                }.buttonStyle(.plain)
                            }
                        }.padding(.vertical, 2)
                    }
                }

                Section("Tiendas") {
                    NavigationLink {
                        StorePickerView(selected: $selectedStores)
                    } label: {
                        HStack {
                            Text("Tiendas")
                            Spacer()
                            Text(selectedStores.isEmpty ? "Ninguna" : "\(selectedStores.count) seleccionadas")
                                .foregroundStyle(.secondary)
                        }
                    }
                    if !selectedStores.isEmpty {
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 6) {
                                ForEach(selectedStores.compactMap { data.storesById[$0] }) { s in StoreChip(store: s) }
                            }
                        }
                    }
                }

                if data.lists.count > 1 {
                    Section("Lista") {
                        Picker("Lista", selection: $targetList) {
                            ForEach(data.lists) { Text($0.name).tag($0.id) }
                        }
                    }
                }

                Section("Notas") {
                    TextField("Marca, cantidad, observaciones…", text: $notes, axis: .vertical).lineLimit(1...4)
                }

                if let error { Text(error).foregroundStyle(.red) }
            }
            .navigationTitle(editing ? "Editar producto" : "Nuevo producto")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancelar") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button(editing ? "Guardar" : "Añadir") { save() }
                        .disabled(saving || name.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
            .onAppear(perform: load)
        }
    }

    private func load() {
        targetList = item?.listId ?? listId
        if let it = item {
            name = it.name; iconType = it.iconType; icon = it.icon; notes = it.notes ?? ""
            selectedStores = Set(it.stores)
        }
    }

    private func save() {
        saving = true; error = nil
        Task {
            do {
                let trimmedNotes = notes.trimmingCharacters(in: .whitespaces)
                if let it = item {
                    try await data.updateItem(it, name: name, icon: icon, iconType: iconType,
                                              notes: trimmedNotes.isEmpty ? nil : trimmedNotes,
                                              stores: Array(selectedStores), targetListId: targetList)
                } else {
                    try await data.createItem(listId: targetList, name: name, icon: icon, iconType: iconType,
                                              notes: trimmedNotes.isEmpty ? nil : trimmedNotes,
                                              stores: Array(selectedStores))
                }
                dismiss()
            } catch let e as APIError { error = e.errorDescription }
            catch let err { error = err.localizedDescription }
            saving = false
        }
    }
}

// MARK: - Selector de tiendas (multi)

struct StorePickerView: View {
    @EnvironmentObject var data: DataStore
    @Binding var selected: Set<String>
    @State private var search = ""
    @State private var showNew = false

    private var grouped: [(String, [Store])] {
        let filtered = data.stores.filter { search.isEmpty || $0.name.localizedCaseInsensitiveContains(search) }
        let dict = Dictionary(grouping: filtered, by: { $0.categoryLabel })
        return dict.sorted { $0.key < $1.key }
    }

    var body: some View {
        List {
            ForEach(grouped, id: \.0) { label, stores in
                Section(label) {
                    ForEach(stores) { s in
                        Button {
                            if selected.contains(s.id) { selected.remove(s.id) } else { selected.insert(s.id) }
                        } label: {
                            HStack {
                                StoreLogoView(store: s, size: 28)
                                Text(s.name).foregroundStyle(.primary)
                                Spacer()
                                if selected.contains(s.id) {
                                    Image(systemName: "checkmark").foregroundStyle(Color.accentColor)
                                }
                            }
                        }
                    }
                }
            }
        }
        .searchable(text: $search, prompt: "Buscar tienda…")
        .navigationTitle("Tiendas")
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button { showNew = true } label: { Image(systemName: "plus") }
            }
        }
        .sheet(isPresented: $showNew) { CustomStoreEditView() }
    }
}

// MARK: - Crear tienda personalizada

struct CustomStoreEditView: View {
    @EnvironmentObject var data: DataStore
    @Environment(\.dismiss) private var dismiss
    @State private var name = ""
    @State private var color = "#e11d48"
    @State private var saving = false
    @State private var error: String?

    private let palette = [
        "#10b981","#22c55e","#14b8a6","#06b6d4","#3b82f6","#6366f1","#8b5cf6","#d946ef","#ec4899","#f43f5e","#ef4444","#f97316","#f59e0b","#84cc16","#64748b",
        "#b30333","#9f1239","#7c2d12","#b45309","#a16207","#4d7c0f","#047857","#0e7490","#1d4ed8","#4338ca","#6d28d9","#a21caf","#831843","#334155",
    ]

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    HStack(spacing: 14) {
                        RoundedRectangle(cornerRadius: 8).fill(Color(hex: color)).frame(width: 44, height: 44)
                            .overlay(Text(initialLetter(name)).foregroundStyle(.white).font(.headline))
                        TextField("Nombre de la tienda", text: $name)
                    }
                }
                Section("Color") {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 10) {
                            ForEach(palette, id: \.self) { c in
                                Button { color = c } label: {
                                    Circle().fill(Color(hex: c)).frame(width: 32, height: 32)
                                        .overlay(Circle().strokeBorder(.primary, lineWidth: color == c ? 2 : 0))
                                }.buttonStyle(.plain)
                            }
                        }
                    }
                }
                if let error { Text(error).foregroundStyle(.red) }
            }
            .navigationTitle("Nueva tienda")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancelar") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Crear") { save() }.disabled(saving || name.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
        }
    }

    private func save() {
        saving = true; error = nil
        Task {
            do { try await data.createStore(name: name, color: color); dismiss() }
            catch let e as APIError { error = e.errorDescription }
            catch let err { error = err.localizedDescription }
            saving = false
        }
    }
}
