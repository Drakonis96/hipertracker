import Foundation
import SwiftUI

@MainActor
final class DataStore: ObservableObject {
    @Published var lists: [ShoppingList] = []
    @Published var items: [Item] = []
    @Published var stores: [Store] = []
    @Published var activeListId: String?
    @Published var loadingItems = false

    private let api: APIClient
    private let kActive = "activeListId"

    init(api: APIClient) {
        self.api = api
        activeListId = UserDefaults.standard.string(forKey: kActive)
    }

    var activeList: ShoppingList? { lists.first { $0.id == activeListId } }
    var storesById: [String: Store] { Dictionary(uniqueKeysWithValues: stores.map { ($0.id, $0) }) }

    func reset() {
        lists = []; items = []; activeListId = nil
        UserDefaults.standard.removeObject(forKey: kActive)
    }

    // MARK: - Tiendas
    func loadStores(force: Bool = false) async {
        if !force && !stores.isEmpty { return }
        stores = (try? await api.get("/stores", authed: false)) ?? stores
    }
    func createStore(name: String, color: String) async throws {
        let _: Store = try await api.post("/stores", body: ["name": name, "color": color])
        await loadStores(force: true)
    }
    func deleteStore(id: String) async throws {
        try await api.delete("/stores/\(id)")
        await loadStores(force: true)
        await loadItems()
    }

    // MARK: - Listas
    func loadLists() async {
        lists = (try? await api.get("/lists")) ?? []
        if activeListId == nil || !lists.contains(where: { $0.id == activeListId }) {
            setActiveLocal(lists.first?.id)
        }
    }
    private func setActiveLocal(_ id: String?) {
        activeListId = id
        if let id { UserDefaults.standard.set(id, forKey: kActive) }
        else { UserDefaults.standard.removeObject(forKey: kActive) }
    }
    func setActiveList(_ id: String) async {
        setActiveLocal(id)
        await loadItems()
    }
    func createList(name: String, type: String) async throws {
        let created: ShoppingList = try await api.post("/lists", body: ["name": name, "type": type])
        await loadLists()
        await setActiveList(created.id)
    }
    func updateList(id: String, name: String, type: String) async throws {
        let _: ShoppingList = try await api.patch("/lists/\(id)", body: ["name": name, "type": type])
        await loadLists()
    }
    func deleteList(id: String) async throws {
        try await api.delete("/lists/\(id)")
        if activeListId == id { setActiveLocal(nil) }
        await loadLists()
        await loadItems()
    }

    // MARK: - Productos
    func loadItems(_ listId: String? = nil) async {
        let lid = listId ?? activeListId
        guard let lid else { items = []; return }
        loadingItems = true
        items = (try? await api.get("/lists/\(lid)/items")) ?? []
        loadingItems = false
    }

    func createItem(listId: String, name: String, icon: String?, iconType: String, notes: String?, stores: [String]) async throws {
        var body: [String: Any] = ["name": name, "iconType": iconType, "stores": stores]
        if let icon { body["icon"] = icon }
        if let notes { body["notes"] = notes }
        let _: Item = try await api.post("/lists/\(listId)/items", body: body)
        await loadItems(listId)
        await loadLists()
    }

    func updateItem(_ item: Item, name: String, icon: String?, iconType: String, notes: String?, stores: [String], targetListId: String) async throws {
        var body: [String: Any] = [
            "name": name, "iconType": iconType, "stores": stores, "listId": targetListId,
        ]
        body["icon"] = icon ?? NSNull()
        body["notes"] = notes ?? NSNull()
        let _: Item = try await api.patch("/lists/\(item.listId)/items/\(item.id)", body: body)
        await loadItems()
        await loadLists()
    }

    func toggleCheck(_ item: Item) async {
        if let idx = items.firstIndex(where: { $0.id == item.id }) {
            items[idx].checked.toggle()
        }
        _ = try? await api.patchVoid("/lists/\(item.listId)/items/\(item.id)/check", body: ["checked": !item.checked])
        await loadItems(item.listId)
        await loadLists()
    }

    func deleteItem(_ item: Item) async throws {
        try await api.delete("/lists/\(item.listId)/items/\(item.id)")
        await loadItems(item.listId)
        await loadLists()
    }

    func duplicateItem(_ item: Item) async throws {
        try await createItem(listId: item.listId, name: item.name, icon: item.icon,
                             iconType: item.iconType, notes: item.notes, stores: item.stores)
    }

    func reorder(pendingIds: [String], doneIds: [String]) async {
        guard let lid = activeListId else { return }
        let ordered = pendingIds + doneIds
        items = (try? await api.patch("/lists/\(lid)/items/reorder", body: ["orderedIds": ordered])) ?? items
    }

    // MARK: - Copia de seguridad
    func exportAll() async throws -> Data { try await api.getData("/data/export") }

    func importAll(_ data: Data) async throws -> ImportSummary {
        guard let obj = try? JSONSerialization.jsonObject(with: data) else { throw APIError.decoding }
        let summary: ImportSummary = try await api.post("/data/import", body: obj)
        await loadStores(force: true)
        await loadLists()
        await loadItems()
        return summary
    }
}
