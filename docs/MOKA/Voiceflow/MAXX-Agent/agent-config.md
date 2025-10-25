# ⚙️ MAXX AGENT - KONFIGURACIJA

> **Agent Name:** MAXX Agent  
> **Verzija:** 1.0  
> **Status:** ✅ Production  
> **Poslednje ažurirano:** 12. oktobar 2025

---

## 🤖 OSNOVNE INFORMACIJE

| Parametar | Vrednost |
|-----------|----------|
| **Naziv agenta** | MAXX Agent |
| **Uloga** | Lični asistent vlasnika za zakazivanje termina |
| **Platforma** | Voiceflow |
| **Base ID (Airtable)** | `appqzwTXdTkG0qrc0` |
| **Jezik** | Srpski (latinica) |
| **Model** | GPT-4 (pretpostavljam) |

---

## 🎯 CAPABILITIES (Mogućnosti)

| Funkcionalnost | Status | Opis |
|----------------|--------|------|
| **Zakazivanje termina** | ✅ Aktivno | Kreiranje Appointments zapisa |
| **Kreiranje klijenata** | ✅ Aktivno | Kreiranje Clients zapisa |
| **Unos plaćanja** | ✅ Aktivno | Kreiranje Payments zapisa |
| **Provera avansa** | ✅ Aktivno | Automatski pita za avans ako usluga zahteva |
| **Pretraga klijenata** | ✅ Aktivno | List Records - Clients |
| **Pretraga usluga** | ✅ Aktivno | List Records - Services |
| **Pretraga termina** | ✅ Aktivno | List Records - Appointments |
| **Povezivanje zapisa** | ✅ Aktivno | Record ID linkovi |

---

## 📊 INTEGRISANE TABELE

### 1. Clients (Klijenti)
- **Akcije:** Read, Create
- **Polja:** Ime, Telefon, Email, Napomene
- **Primary Key:** Ime

### 2. Services (Usluge)
- **Akcije:** Read
- **Polja:** Naziv, Cena, Trajanje, Kategorija
- **Primary Key:** Naziv

### 3. Appointments (Termini)
- **Akcije:** Create
- **Polja:** Telefon, Datum, Vreme, Klijent (link), Usluga (link), Email, Status, Napomena
- **Primary Key:** Telefon
- **Linked Fields:** Klijent (→ Clients), Usluga (→ Services)

---

## 🔌 API TOOLS

### 1. Appointment Create API
- **Metod:** POST
- **Endpoint:** Airtable API
- **Funkcija:** Kreiranje novih termina
- **Parametri:** Telefon, Datum, Vreme, Klijent ID, Usluga ID, Email, Status, Napomena
- **⚠️ Važno:** NE šalje cenu (automatski se setuje u Airtable-u)

### 2. Client Create API
- **Metod:** POST
- **Endpoint:** Airtable API
- **Funkcija:** Kreiranje novih klijenata
- **Parametri:** Ime, Telefon, Email, Napomene

### 3. Payment Create API
- **Metod:** POST
- **Endpoint:** Airtable API
- **Funkcija:** Kreiranje plaćanja (avans, plaćanje, povraćaj)
- **Parametri:** Naziv, Iznos, Datum, Tip, Status, Termin ID, Napomena
- **⚠️ Važno:** UVEK povezati sa terminom (Termin polje)

### 4. List Records Integration
- **Metod:** GET
- **Endpoint:** Airtable API
- **Funkcija:** Pretraga i prikaz zapisa iz bilo koje tabele
- **Koristi se za:**
  - Provera da li klijent postoji
  - Pronalaženje usluge po nazivu
  - Pronalaženje termina za unos plaćanja
  - Provera da li usluga zahteva avans
  - Prikaz dostupnih termina (buduća funkcionalnost)

---

## 🔄 WORKFLOW LOGIKA

```
┌──────────────────────┐
│ User Input           │
│ (Vlasnik)            │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Prikupljanje podataka│
│ (Ime, Tel, Email,    │
│  Usluga, Datum, Vr.) │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ List Records:        │
│ Proveri Clients      │
│ (po telefonu/emailu) │
└──────────┬───────────┘
           │
     ┌─────┴─────┐
     │           │
  POSTOJI    NE POSTOJI
     │           │
     │           ▼
     │     ┌─────────────┐
     │     │ Client      │
     │     │ Create API  │
     │     └─────┬───────┘
     │           │
     └─────┬─────┘
           │
           ▼
  ┌────────────────────┐
  │ Uzmi Record ID     │
  │ (Clients)          │
  └────────┬───────────┘
           │
           ▼
  ┌────────────────────┐
  │ List Records:      │
  │ Pronađi Services   │
  │ (po nazivu)        │
  └────────┬───────────┘
           │
           ▼
  ┌────────────────────┐
  │ Uzmi Record ID     │
  │ (Services)         │
  └────────┬───────────┘
           │
           ▼
  ┌────────────────────┐
  │ Appointment        │
  │ Create API         │
  │ (sa linked fields) │
  └────────┬───────────┘
           │
           ▼
  ┌────────────────────┐
  │ Potvrda vlasniku   │
  └────────────────────┘
```

---

## 📋 PRIMER PAYLOAD-A

### Client Create Request:
```json
{
  "fields": {
    "Ime": "Marija Jovanović",
    "Telefon": "0601234567",
    "Email": "marija@gmail.com",
    "Napomene": ""
  }
}
```

### Appointment Create Request:
```json
{
  "fields": {
    "Telefon": "0601234567",
    "Datum": "2025-10-15",
    "Vreme": "14:00",
    "Klijent": ["recXXXXXXXXXXXXXX"],     // Record ID iz Clients
    "Usluga": ["recYYYYYYYYYYYYYY"],      // Record ID iz Services
    "Email": "marija@gmail.com",
    "Status": "Zakazan",
    "Napomena": "Klijent preferira prirodnu šminku"
  }
}
```

**⚠️ Napomena:** Polja "Klijent" i "Usluga" su **array-evi** sa record ID-jevima!

---

## 🎛️ SETTINGS

### Conversation Settings:
- **Timeout:** 5 minuta (default)
- **Language:** Serbian (Latin)
- **Tone:** Professional, concise

### Error Handling:
- **API Errors:** Prikaži korisniku da je došlo do greške i pokušaj ponovo
- **Missing Data:** Traži nedostajuće podatke pre nego što nastaviš
- **Invalid Input:** Prijazno traži ispravku

---

## 🔐 SECURITY & PERMISSIONS

- ✅ Pristup samo sa vlasničkim nalogom
- ✅ API keys čuvani sigurno u Voiceflow-u
- ✅ Nema javnog pristupa agentu
- ✅ Base ID hardkodiran za bezbednost

---

## 🧪 TESTIRANJE

### Test Scenario 1: Novi klijent
- ✅ Unos svih podataka
- ✅ Kreiranje klijenta
- ✅ Kreiranje termina
- ✅ Povezivanje polja

### Test Scenario 2: Postojeći klijent
- ✅ Pretraga klijenta
- ✅ Uzimanje record ID-ja
- ✅ Kreiranje termina
- ✅ Povezivanje polja

### Test Scenario 3: Nepostojeća usluga
- ⚠️ Error handling - agent traži ispravku

---

## 📈 METRICS & MONITORING

| Metrika | Praćenje |
|---------|----------|
| **Uspešno kreiraних termina** | Ručno (za sada) |
| **Kreirani novi klijenti** | Ručno (za sada) |
| **API errors** | Voiceflow logs |
| **Response time** | Voiceflow analytics |

---

## 🚀 BUDUĆA UNAPREĐENJA

### Faza 2:
- [ ] Slanje potvrde klijentu (SMS/Email)
- [ ] Slanje podsetnika
- [ ] Provera dostupnosti termina
- [ ] Predlozi slobodnih termina

### Faza 3:
- [ ] Javni agent za klijente (self-service booking)
- [ ] Integracija sa Payments tabelom
- [ ] Dashboard pregled termina
- [ ] AI optimizacija rasporeda

---

## 🔄 VERSION HISTORY

| Verzija | Datum | Promene |
|---------|-------|---------|
| **1.0** | 12.10.2025 | Inicijalna verzija - zakazivanje termina za vlasnika |

---

**Autor:** Vlasnik + Claude AI  
**Platforma:** Voiceflow  
**Status:** Production Ready ✅

