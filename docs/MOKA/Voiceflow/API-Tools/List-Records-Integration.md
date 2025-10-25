# 📋 LIST RECORDS INTEGRATION

> **Tool Name:** List Records  
> **Type:** Integration Tool  
> **Method:** GET  
> **Poslednje ažurirano:** 12. oktobar 2025

---

## 📋 OPIS

Prikazuje zapise iz bilo koje Airtable tabele (base ID: `appqzwTXdTkG0qrc0`) na osnovu korisničkog zahteva. Koristi se za pretragu, prikaz i proveru postojećih podataka.

---

## 🎯 LLM DESCRIPTION

```
List records from the specified Airtable table (base ID: appqzwTXdTkG0qrc0) 
based on the user's request.

Use this integration to display available appointments, services, payments, 
analytics, or any other data the user asks for.

When the agent receives a question about available times, services, prices, 
or client information, fetch and present the relevant records from the 
appropriate table in a clear and concise format.
```

**⚠️ Ključna napomena:** 
- Koristi za READ-ONLY operacije
- Nikada ne menja podatke, samo prikazuje

---

## 🔗 ENDPOINT

**Base URL:** `https://api.airtable.com/v0/`  
**Base ID:** `appqzwTXdTkG0qrc0`  
**Table:** Dinamički (zavisi od upita)

**Primeri Endpoint-a:**
```
GET https://api.airtable.com/v0/appqzwTXdTkG0qrc0/Appointments
GET https://api.airtable.com/v0/appqzwTXdTkG0qrc0/Clients
GET https://api.airtable.com/v0/appqzwTXdTkG0qrc0/Services
GET https://api.airtable.com/v0/appqzwTXdTkG0qrc0/Payments
GET https://api.airtable.com/v0/appqzwTXdTkG0qrc0/Analytics
GET https://api.airtable.com/v0/appqzwTXdTkG0qrc0/Reminders
```

---

## 🎯 USE CASES

### 1. Provera da li klijent postoji
**Scenario:** Pre kreiranja novog klijenta  
**Tabela:** Clients  
**Filter:** `Telefon = "0601234567"` ILI `Email = "marija@gmail.com"`

### 2. Pronalaženje usluge po nazivu
**Scenario:** Pre kreiranja termina  
**Tabela:** Services  
**Filter:** `Naziv = "Šminkanje"`

### 3. Prikaz dostupnih usluga
**Scenario:** Vlasnik pita koje usluge postoje  
**Tabela:** Services  
**Filter:** `Aktivan = TRUE`

### 4. Pregled današnjih termina
**Scenario:** Vlasnik pita koji termini su danas  
**Tabela:** Appointments  
**Filter:** `Datum = TODAY()`

### 5. Provera klijentovog dugovanja
**Scenario:** Vlasnik pita koliko klijent duguje  
**Tabela:** Clients  
**Filter:** `Telefon = "0601234567"`  
**Prikaži:** `Dugovanje` polje

---

## 📊 QUERY PARAMETRI

### Osnovni parametri:

| Parametar | Opis | Primer |
|-----------|------|--------|
| `maxRecords` | Max broj zapisa | `?maxRecords=10` |
| `view` | Koji view da koristi | `?view=All+grid` |
| `filterByFormula` | Airtable formula za filter | `?filterByFormula={Telefon}="0601234567"` |
| `sort[0][field]` | Polje za sortiranje | `?sort[0][field]=Datum` |
| `sort[0][direction]` | Smer sortiranja | `?sort[0][direction]=desc` |
| `fields[]` | Koja polja da vrati | `?fields[]=Ime&fields[]=Telefon` |

---

## 📝 PRIMERI REQUEST-A

### Primer 1: Pronađi klijenta po telefonu
```
GET /Clients?filterByFormula={Telefon}="0601234567"
```

### Primer 2: Pronađi uslugu po nazivu
```
GET /Services?filterByFormula={Naziv}="Šminkanje"
```

### Primer 3: Sve aktivne usluge
```
GET /Services?filterByFormula={Aktivan}=1
```

### Primer 4: Današnji termini
```
GET /Appointments?filterByFormula=IS_SAME({Datum},TODAY(),'day')
```

### Primer 5: Termini određenog klijenta
```
GET /Appointments?filterByFormula=SEARCH("Marija Jovanović",{Klijent})
```

---

## ✅ PRIMER RESPONSE-A

### Success (200 OK):

```json
{
  "records": [
    {
      "id": "rec123abc456def",
      "createdTime": "2025-10-12T14:30:00.000Z",
      "fields": {
        "Ime": "Marija Jovanović",
        "Telefon": "0601234567",
        "Email": "marija@gmail.com",
        "ID": 15,
        "Dugovanje": 0,
        "Broj zakazanih termina": 3
      }
    }
  ],
  "offset": null
}
```

**⚠️ Važno:** 
- Ako ima rezultata → `records` array nije prazan
- Ako nema rezultata → `records` array je prazan `[]`
- Record ID je u `id` polju: `rec123abc456def`

---

## 🔑 AUTHENTICATION

**Method:** Bearer Token

**Header:**
```
Authorization: Bearer YOUR_AIRTABLE_API_KEY
```

---

## 🔄 KAKO AGENT KORISTI INTEGRACIJU

### Use Case 1: Provera postojanja klijenta

```
Agent: Prikupio podatke klijenta (Telefon: 0601234567)

Agent: [Šalje List Records request]
       GET /Clients?filterByFormula={Telefon}="0601234567"

Response: {
  "records": [
    {
      "id": "rec123abc",
      "fields": {
        "Ime": "Marija Jovanović",
        "Telefon": "0601234567",
        ...
      }
    }
  ]
}

Agent: Klijent POSTOJI → record ID: rec123abc
       → Koristi ovaj ID za Appointment Create
```

### Use Case 2: Pronalaženje usluge

```
Agent: Prikupio podatke (Usluga: "Šminkanje")

Agent: [Šalje List Records request]
       GET /Services?filterByFormula={Naziv}="Šminkanje"

Response: {
  "records": [
    {
      "id": "rec456def",
      "fields": {
        "Naziv": "Šminkanje",
        "Cena": 60,
        ...
      }
    }
  ]
}

Agent: Usluga pronađena → record ID: rec456def
       → Koristi ovaj ID za Appointment Create
```

### Use Case 3: Prikaz dostupnih usluga

```
Vlasnik: Koje usluge nude?

Agent: [Šalje List Records request]
       GET /Services?filterByFormula={Aktivan}=1

Response: {
  "records": [
    { "fields": { "Naziv": "Šminkanje", "Cena": 60, ... } },
    { "fields": { "Naziv": "Puder obrve", "Cena": 180, ... } },
    { "fields": { "Naziv": "Lash lift", "Cena": 2500, ... } },
    ...
  ]
}

Agent: Dostupne usluge:
       - Šminkanje (60€)
       - Puder obrve (180€)
       - Lash lift (2,500 RSD)
       - ...
```

---

## ⚠️ ERROR HANDLING

### Greška 1: Invalid formula
```json
{
  "error": {
    "type": "INVALID_FILTER_BY_FORMULA",
    "message": "The formula for filtering is invalid"
  }
}
```
**Rešenje:** Proveri sintaksu Airtable formule.

### Greška 2: Invalid table name
```json
{
  "error": {
    "type": "TABLE_NOT_FOUND",
    "message": "Could not find table Clientss"
  }
}
```
**Rešenje:** Proveri tačan naziv tabele (case-sensitive!).

### Greška 3: Invalid field name
```json
{
  "error": {
    "type": "INVALID_FIELD",
    "message": "Unknown field name: 'Telefonn'"
  }
}
```
**Rešenje:** Proveri tačan naziv polja.

---

## 📊 AIRTABLE FORMULA SYNTAX

### Osnovne formule za filter:

| Formula | Opis | Primer |
|---------|------|--------|
| `{Polje}="vrednost"` | Tačno podudaranje | `{Telefon}="0601234567"` |
| `{Polje}>10` | Veće od | `{Cena}>50` |
| `{Polje}<=100` | Manje ili jednako | `{Trajanje (min)}<=120` |
| `AND({A}="x",{B}="y")` | Oba uslova | `AND({Status}="Zakazan",{Datum}=TODAY())` |
| `OR({A}="x",{B}="y")` | Jedan od uslova | `OR({Telefon}="060...",{Email}="...@...")` |
| `SEARCH("tekst",{Polje})` | Sadrži tekst | `SEARCH("Marija",{Ime})` |
| `IS_SAME({Datum},TODAY(),'day')` | Isti datum | Današnji termini |

---

## 🧪 TEST CASES

### Test 1: Pronađi postojećeg klijenta
```
GET /Clients?filterByFormula={Telefon}="0601234567"
```
**Očekivano:** ✅ Jedan ili više zapisa

### Test 2: Pronađi nepostojećeg klijenta
```
GET /Clients?filterByFormula={Telefon}="0609999999"
```
**Očekivano:** ✅ Prazan array `[]`

### Test 3: Sve aktivne usluge
```
GET /Services?filterByFormula={Aktivan}=1
```
**Očekivano:** ✅ Lista aktivnih usluga

### Test 4: Današnji termini
```
GET /Appointments?filterByFormula=IS_SAME({Datum},TODAY(),'day')
```
**Očekivano:** ✅ Termini za današnji dan

---

## ✅ CHECKLIST ZA UPOTREBU

### Pre slanja zahteva:
- [ ] Odaberi tačnu tabelu
- [ ] Napiši validnu filter formulu
- [ ] Proveri nazive polja (case-sensitive!)
- [ ] Proveri tip podataka (string, number, date)

### Posle primanja response-a:
- [ ] Proveri da li `records` array nije prazan
- [ ] Izvuci `id` (record ID) ako ti treba
- [ ] Prikaži relevantne informacije vlasniku
- [ ] Zapamti record ID za dalje korišćenje

---

## 📌 VAŽNE NAPOMENE

1. **Read-only operacija**
   - Ne menja podatke
   - Samo prikazuje/pretražuje

2. **Record ID format**
   - Format: `recXXXXXXXXXXXXXX`
   - Uvek u `id` polju response-a
   - Potreban za Create/Update operacije

3. **Prazni rezultati**
   - `records: []` znači nema rezultata
   - NE znači grešku!
   - Koristi za proveru postojanja

4. **Case-sensitive**
   - Nazivi tabela: tačno kako su u Airtable-u
   - Nazivi polja: tačno kako su u Airtable-u
   - Vrijednosti: zavisi od polja

5. **Limit rezultata**
   - Default: 100 zapisa po stranici
   - Koristi `maxRecords` za manje
   - Koristi `offset` za pagination

---

## 🎯 NAJČEŠĆI UPITI U AGENTU

| Scenario | Tabela | Formula |
|----------|--------|---------|
| Provera klijenta po telefonu | Clients | `{Telefon}="..."` |
| Provera klijenta po emailu | Clients | `{Email}="..."` |
| Pronalaženje usluge | Services | `{Naziv}="..."` |
| Današnji termini | Appointments | `IS_SAME({Datum},TODAY(),'day')` |
| Termini određenog klijenta | Appointments | `SEARCH("Ime",{Klijent})` |
| Aktivne usluge | Services | `{Aktivan}=1` |

---

**Verzija:** 1.0  
**Status:** ✅ Production  
**Poslednje testiranje:** 12.10.2025 - Uspešna pretraga klijenata i usluga

