<div align="center">

# 💰 LEDGER

**Personal Finance Manager — Budget, Transaktionen & KI-Beratung**

[![Built with](https://img.shields.io/badge/built%20with-FastAPI-009688?logo=fastapi)]()
[![React](https://img.shields.io/badge/frontend-React-61dafb?logo=react)]()
[![PostgreSQL](https://img.shields.io/badge/db-PostgreSQL-4169E1?logo=postgresql)]()
[![Status](https://img.shields.io/badge/status-production-brightgreen)]()
[![Open App](https://img.shields.io/badge/▶_Open_App-e5a00d?style=for-the-badge)](https://<your-host>:8456/)

</div>

---

## 💰 What is LEDGER?

LEDGER ist ein **Finanzguru-Klon** für die Tony Claw Platform — persönliches Finanzmanagement mit Budget-Tracking, Transaktionsverwaltung und KI-gestützter Beratung durch OpenClaw.

**Ziel:** Volle Kontrolle über Einnahmen, Ausgaben und Sparziele — mit intelligenter Analyse und proaktiven Empfehlungen.

## ✨ Features

### 📊 Dashboard
- **Einnahmen vs. Ausgaben** — Donut-Chart mit Echtzeit-Daten
- **Budget-Auslastung** — Fortschrittsbalken pro Kategorie
- **Puffer-Anzeige** — Verbleibendes Budget prominent sichtbar
- **Stat-Cards** — Glassmorphism-Design mit Animationen

### 💼 Budget-Verwaltung
- **7 Kategorien** — Wohnen, Auto, Versicherungen, Lifestyle, Ernährung, Abos, Rücklagen
- **Fixkosten vs. Variable** — Klare Trennung mit Badges
- **Klappbare Sektionen** — Übersichtlich nach Kategorie gruppiert
- **Inline-Editing** — Beträge direkt anpassen
- **Farbcodierte Fortschrittsbalken** — Grün/Amber/Rot nach Auslastung

### 📝 Transaktionen
- **Erfassen & Kategorisieren** — Schnelle Eingabe mit Kategorie-Zuweisung
- **Filtern** — Nach Kategorie, Zeitraum, Typ
- **Floating Action Button** — Quick-Add auf Mobile
- **Monatsübersicht** — Summen und Trends

### 💵 Einkommen
- **Gehalt & Nebeneinkünfte** — Mehrere Quellen verwalten
- **Frequenz** — Monatlich, wöchentlich, jährlich
- **Aktiv/Inaktiv Toggle** — Flexible Verwaltung

### 📈 Berichte
- **Monatsvergleich** — Letzte 6 Monate Balkendiagramm
- **Kategorie-Trends** — Ausgabenentwicklung über Zeit
- **Sparquote** — Automatisch berechnet

### 🤖 KI-Advisory (Roadmap)
- **"Frag Tony"** — Ad-hoc Finanzberatung via OpenClaw
- **Monatliche Analyse** — Automatische Zusammenfassung via Telegram
- **Spar-Empfehlungen** — Basierend auf Ausgabenmustern
- **Budget-Warnungen** — Proaktive Alerts bei Überschreitung

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | FastAPI, SQLAlchemy |
| **Frontend** | React 18, Vite, recharts |
| **Database** | PostgreSQL 16 |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Design** | COMMAND Design System |

## 📁 Project Structure

```
ledger/
├── backend/
│   └── app/
│       └── main.py          # FastAPI app, models, routes
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── Budget.jsx
│       │   ├── Transactions.jsx
│       │   ├── Income.jsx
│       │   └── Reports.jsx
│       ├── components/
│       ├── hooks/
│       ├── utils/
│       └── styles.css
├── core/tc_auth/             # OAuth library
├── Dockerfile
└── README.md
```

## 🚀 Deployment

```bash
# Database
docker exec tc-postgres psql -U identity -c "CREATE DATABASE ledger;"

# Build & Run
cd frontend && pnpm install && pnpm build && cd ..
docker compose build ledger
docker compose up -d ledger

# Tailscale
sudo tailscale serve --bg --https 8456 http://127.0.0.1:9400
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST` | `/api/income` | Einkommen CRUD |
| `GET/POST` | `/api/categories` | Kategorien CRUD |
| `GET/POST` | `/api/budget` | Budget-Posten CRUD |
| `GET/POST` | `/api/transactions` | Transaktionen CRUD |
| `GET` | `/api/dashboard` | Dashboard-Aggregation |
| `GET` | `/api/reports` | Monatsberichte |
| `GET` | `/api/health` | Health Check |

## 📊 Vorkonfigurierte Kategorien

| Kategorie | Posten | Typ |
|-----------|--------|-----|
| 🏠 Wohnen | Miete | Fix |
| 🚗 Auto | Steuer, Versicherung | Fix |
| 🛡 Versicherungen | Hausrat, Gewerbe | Fix |
| ✨ Lifestyle | IQOS, Kosmetik, Friseur, Ausgehen | Variabel |
| 🍽 Ernährung | Essen & Trinken | Variabel |
| 📱 Abos | Adobe, Amazon, Handy | Fix |
| ❤️ Spenden | Save the Children | Fix |
| 💰 Rücklagen | Sparen, Urlaub, Notfälle, Haushalt | Variabel |

## 🔮 Roadmap

- [ ] OAuth Login via IDENTITY
- [ ] KI-Advisory — "Frag Tony" Finanzberatung
- [ ] Telegram-Alerts — Budget-Warnungen
- [ ] Automatische Kategorisierung
- [ ] Vertragsübersicht & Abo-Management
- [ ] PDF-Export — Monatsabrechnung
- [ ] Multi-User Support

---

<div align="center">

Part of the **Tony Claw Platform** · Built with 🤖 by Tony Claw

</div>
