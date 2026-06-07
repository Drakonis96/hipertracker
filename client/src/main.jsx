import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

// Seguridad: si la página se restaura desde la bfcache (botón atrás/adelante),
// se fuerza una recarga. Así, tras cerrar sesión, pulsar "atrás" no muestra una
// instantánea de la app autenticada: se vuelve a pedir el login.
window.addEventListener('pageshow', (e) => {
  if (e.persisted) window.location.reload();
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
