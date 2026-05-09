````markdown name=README.md
# ✈️ Cerca Viaggi - Web App

Una web app moderna e completa per pianificare, salvare e gestire i tuoi viaggi con **Firebase**, **mappe interattive**, **foto**, **filtri avanzati** e tanto altro!

## 🚀 Funzionalità

### ✨ Core Features
- **Aggiungi Viaggi** - Salva destinazioni, prezzi, date e note
- **✏️ Modifica Viaggi** - Aggiorna i dettagli di un viaggio già salvato
- **🗑️ Elimina Viaggi** - Rimuovi un viaggio dalla lista
- **🔍 Ricerca in Tempo Reale** - Filtra per destinazione istantaneamente

### 💰 Gestione Budget
- **Calcolo Automatico Budget** - Somma automatica di prezzo volo + hotel
- **💳 Budget Totale Visualizzato** - Vedi il costo totale su ogni card
- **🔀 Ordinamento per Prezzo** - Ordina i viaggi dal più economico al più caro

### 🎨 Filtri Avanzati
- Ricerca per **destinazione**
- Filtra per **prezzo minimo/massimo**
- Filtra per **periodo (data da/a)**
- **Ordinamento** per:
  - Data (più recente/vecchio)
  - Destinazione (A-Z / Z-A)
  - Prezzo (crescente/decrescente)
- Bottone **"Ripristina filtri"**

### 📸 Galleria Foto
- Upload fino a **5 foto** per viaggio
- **Compressione automatica** (600x600px)
- Visualizzazione **thumbnail** nelle card
- **Modal carousel** per scorrere le foto
- Salvataggio in **Base64** su Firestore

### 🗺️ Geolocalizzazione
- **Mappe interattive** con Leaflet.js + OpenStreetMap
- **Geocodifica automatica** della destinazione
- Modal con **mappa zoomabile**
- Usa API **Nominatim gratuita** (no API key)

### 📥 Esportazione Dati
- **Esporta in CSV** con un click
- Formato compatibile con Excel e Google Sheets
- Includi: destinazione, date, prezzi, budget totale, note

### 🌙 Dark/Light Mode
- **Toggle tema** nell'header (sole/luna)
- Tema **scuro** (default)
- Tema **chiaro** per chi preferisce
- Preferenza **salvata** in localStorage
- Transizioni smooth

### 📱 Offline Support (PWA)
- **Service Worker** per funzionare offline
- **Installabile** su smartphone e desktop
- Cache intelligente dei file
- Funziona anche **senza internet** (dati già caricati)
- Manifest PWA completo

### ✔️ Validazione Avanzata
- Validazione **destinazione** (minimo 2 caratteri)
- Validazione **prezzi** (solo numeri validi)
- **Messaggi di errore** specifici sotto i campi
- Controllo **foto troppo grandi**
- Validazione al submit del form

### 🔔 Notifiche Toast
- Toast per **salvataggio viaggio** ✅
- Toast per **modifica viaggio** ✏️
- Toast per **eliminazione viaggio** 🗑️
- Toast per **errori** ❌
- Toast per **avvisi** ⚠️
- Auto-dismiss dopo **3 secondi**
- Colori diversi (success, error, warning)

## 📋 Stack Tecnologico

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Backend**: Firebase Firestore (Real-time Database)
- **Autenticazione**: Firebase SDK
- **Mappe**: Leaflet.js + OpenStreetMap
- **PWA**: Service Worker, Web Manifest
- **UI/UX**: Design responsivo, Dark/Light mode, Animazioni smooth

## 🔧 Setup & Installazione

### 1. Clone il Repository
```bash
git clone https://github.com/Matty1926/Web_app_CercaViaggi.git
cd Web_app_CercaViaggi
