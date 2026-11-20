# Rainbow.design – Frontend (Vue 3)

Frontend für den Rainbow.design-Shop auf Basis von Vue 3, vue-router und Vite.
Das Backend (`rainbow_backend`) muss unter `http://localhost:3000` laufen.

## Starten

```bash
# Backend (im Ordner rainbow_backend)
node server.js

# Frontend (in diesem Ordner)
npm install
npm run dev        # http://localhost:5173
```

## Prüfungen

```bash
npm run lint       # ESLint (inkl. eslint-plugin-vue)
npm run build      # Produktions-Build nach dist/
```

## Struktur

- `src/views/` – Seiten des Shops, `src/views/admin/` – Adminbereich
- `src/components/` – wiederverwendbare Komponenten (Navigation, Formularfelder, Produktkarten …)
- `src/stores/` – Zustand für Anmeldung, Warenkorb, Wunschliste und Statusmeldungen
- `src/utils/` – API-Zugriff, deutsche Bezeichnungen, Suche und Validierung
