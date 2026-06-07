import SwiftUI

struct ServerSetupView: View {
    @EnvironmentObject var session: Session

    @State private var url = "http://localhost:5794"
    @State private var useBasic = false
    @State private var user = ""
    @State private var password = ""
    @State private var loading = false
    @State private var error: String?

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    VStack(spacing: 10) {
                        Image("AppLogo").resizable().scaledToFit().frame(width: 64, height: 64)
                            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                        Text("HiperTracker").font(.title2.bold())
                        Text("Conéctate a tu servidor").font(.subheadline).foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity).padding(.vertical, 8)
                }
                .listRowBackground(Color.clear)

                Section("Dirección del servidor") {
                    TextField("https://midominio.com", text: $url)
                        .textContentType(.URL)
                        .autocorrectionDisabled()
                        #if os(iOS)
                        .keyboardType(.URL)
                        .textInputAutocapitalization(.never)
                        #endif
                }

                Section {
                    Toggle("Requiere usuario y contraseña", isOn: $useBasic.animation())
                } footer: {
                    Text("Actívalo si tu servidor está detrás de un proxy con autenticación básica (Basic Auth).")
                }

                if useBasic {
                    Section("Credenciales (Basic Auth)") {
                        TextField("Usuario", text: $user)
                            .autocorrectionDisabled()
                            #if os(iOS)
                            .textInputAutocapitalization(.never)
                            #endif
                        SecureField("Contraseña", text: $password)
                    }
                }

                if let error {
                    Section { Text(error).foregroundStyle(.red).font(.callout) }
                }

                Section {
                    Button(action: connect) {
                        HStack {
                            if loading { ProgressView().controlSize(.small) }
                            Text("Conectar").frame(maxWidth: .infinity)
                        }
                    }
                    .disabled(loading || url.trimmingCharacters(in: .whitespaces).isEmpty)
                } footer: {
                    Text("Las credenciales y los tokens se guardan cifrados en el Keychain del dispositivo. Usa HTTPS para que viajen seguros.")
                }
            }
            .navigationTitle("Conectar")
        }
    }

    private func connect() {
        error = nil
        loading = true
        Task {
            do {
                try await session.connect(baseURL: url, basicUser: useBasic ? user : "", basicPassword: useBasic ? password : "")
            } catch let e as APIError {
                error = e.errorDescription
            } catch let err {
                error = err.localizedDescription
            }
            loading = false
        }
    }
}
