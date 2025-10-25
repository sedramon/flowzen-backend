# 👥 CLIENT CREATE API

> **Tool Name:** Client Create API  
> **Type:** Custom API Tool  
> **Method:** POST  
> **Poslednje ažurirano:** 12. oktobar 2025

---

## 📋 OPIS

Kreira novi zapis klijenta u Airtable tabeli "Clients" (base ID: `appqzwTXdTkG0qrc0`) na osnovu podataka prikupljenih od agenta.

---

## 🎯 LLM DESCRIPTION

```
Create a new record in the specified Airtable table (base ID: appqzwTXdTkG0qrc0) 
based on user input collected by the agent. 

Use this to create CLIENT ONLY.
```

**⚠️ Ključna napomena:** 
- Koristi SAMO za kreiranje klijenata u Clients tabeli
- Ne koristi za druge tabele

---

## 🔗 ENDPOINT

**Base URL:** `https://api.airtable.com/v0/`  
**Base ID:** `appqzwTXdTkG0qrc0`  
**Table:** `Clients`

**Full Endpoint:**
```
POST https://api.airtable.com/v0/appqzwTXdTkG0qrc0/Clients
```

---

## 📊 REQUEST BODY

### Required Fields:

| Polje | Tip | Opis | Primer |
|-------|-----|------|--------|
| `Ime` | String | Ime i prezime klijenta (PRIMARY FIELD) | "Marija Jovanović" |
| `Telefon` | String | Broj telefona klijenta u +381 formatu | "+381601234567" |
| `Email` | String | Email klijenta | "marija@gmail.com" |

**⚠️ VAŽNO:** Telefon UVEK u međunarodnom formatu (+381 umesto 06)

### Optional Fields:

| Polje | Tip | Opis | Primer |
|-------|-----|------|--------|
| `Instagram` | URL | Instagram link klijenta | "https://instagram.com/marija_petrovic" |
| `Napomene` | Long Text | Dodatne napomene o klijentu | "Preferira prirodnu šminku" |

### Fields NOT to send:

| Polje | Razlog |
|-------|--------|
| `ID` | Auto number (automatski) |
| `Istorija termina` | Link field (puni se automatski kad se kreira termin) |
| `Dugovanje` | Rollup field (automatski se računa) |
| `Poslednji termin` | Rollup field (automatski se računa) |
| `Broj zakazanih termina` | Rollup field (automatski se računa) |
| `Plaćanja` | Rollup field (automatski se računa) |

---

## 📝 PRIMER REQUEST-A

### JSON Body:
```json
{
  "fields": {
    "Ime": "Marija Jovanović",
    "Telefon": "+381601234567",
    "Email": "marija@gmail.com",
    "Instagram": "https://instagram.com/marija_petrovic",
    "Napomene": "Preferira prirodnu šminku, dolazi redovno"
  }
}
```

---

## ✅ PRIMER RESPONSE-A

### Success (200 OK):
```json
{
  "id": "recNewClient123abc",
  "createdTime": "2025-10-12T14:30:00.000Z",
  "fields": {
    "Ime": "Marija Jovanović",
    "Telefon": "0601234567",
    "Email": "marija@gmail.com",
    "Instagram": "https://instagram.com/marija_petrovic",
    "Napomene": "Preferira prirodnu šminku, dolazi redovno",
    "ID": 15,
    "Dugovanje": 0,
    "Broj zakazanih termina": 0,
    "Poslednji termin": null,
    "Istorija termina": [],
    "Plaćanja": []
  }
}
```

**⚠️ Važno:** Zapamti **`id`** iz response-a (`recNewClient123abc`) - biće ti potreban za kreiranje termina!

---

## ⚠️ ERROR HANDLING

### Greška 1: Missing required field
```json
{
  "error": {
    "type": "INVALID_REQUEST_BODY",
    "message": "Field 'Ime' cannot be empty"
  }
}
```
**Rešenje:** Uvek prikupi ime i prezime klijenta!

### Greška 2: Invalid email format
```json
{
  "error": {
    "type": "INVALID_VALUE_FOR_COLUMN",
    "message": "Invalid email address format"
  }
}
```
**Rešenje:** Proveri format emaila pre slanja.

### Greška 3: Duplicate primary key
```json
{
  "error": {
    "type": "INVALID_REQUEST_DUPLICATE",
    "message": "Record with this 'Ime' already exists"
  }
}
```
**Rešenje:** Proveri prvo da li klijent postoji pre kreiranja novog!

---

## 🔑 AUTHENTICATION

**Method:** Bearer Token

**Header:**
```
Authorization: Bearer YOUR_AIRTABLE_API_KEY
```

**⚠️ Napomena:** API key se čuva sigurno u Voiceflow environment variables.

---

## 🔄 KAKO AGENT KORISTI API

### Flow:
```
1. Agent prikupi podatke:
   - Ime i prezime
   - Telefon
   - Email
   - (Opciono) Napomene

2. Agent prvo PROVERI da li klijent postoji:
   → Koristi List Records API
   → Traži po telefonu ili emailu

3. Ako NE POSTOJI:
   → Pripremi request body:
   {
     "fields": {
       "Ime": "...",
       "Telefon": "...",
       "Email": "...",
       "Napomene": "..."
     }
   }
   → Pošalji POST request
   → Primi response sa record ID
   → ZAPAMTI record ID za kreiranje termina!

4. Ako POSTOJI:
   → NE šalje Client Create API
   → Koristi postojeći record ID
```

---

## ✅ CHECKLIST PRE SLANJA

- [ ] Ime i prezime popunjeno
- [ ] Telefon popunjen
- [ ] Email popunjen
- [ ] Email validan format (xxx@xxx.xxx)
- [ ] Provereno da klijent NE POSTOJI u bazi
- [ ] NE šalju se automatska polja (ID, Dugovanje, itd.)

---

## 🔍 PROVERA DA LI KLIJENT POSTOJI

**PRE nego što pozoveš Client Create API, UVEK proveri:**

```
1. Koristi List Records API
2. Filteri:
   - Telefon = "{input_telefon}"
   ILI
   - Email = "{input_email}"
3. Ako ima rezultata → Klijent POSTOJI
4. Ako nema rezultata → Kreiraj NOVOG
```

---

## 🧪 TEST CASES

### Test 1: Minimalan zahtev
```json
{
  "fields": {
    "Ime": "Test Klijent",
    "Telefon": "0601111111",
    "Email": "test@test.com"
  }
}
```
**Očekivano:** ✅ Success

### Test 2: Potpun zahtev
```json
{
  "fields": {
    "Ime": "Marija Jovanović",
    "Telefon": "0601234567",
    "Email": "marija@gmail.com",
    "Napomene": "VIP klijent, uvek dolazi na vreme"
  }
}
```
**Očekivano:** ✅ Success

### Test 3: Greška - bez Ime polja
```json
{
  "fields": {
    "Telefon": "0601234567",
    "Email": "marija@gmail.com"
  }
}
```
**Očekivano:** ❌ Error - Missing Ime field

### Test 4: Greška - invalid email
```json
{
  "fields": {
    "Ime": "Test Klijent",
    "Telefon": "0601234567",
    "Email": "invalid-email"
  }
}
```
**Očekivano:** ❌ Error - Invalid email format

---

## 📊 TIPIČNI WORKFLOW SA AGENTOM

### Scenario: Novi klijent

```
Agent: Molim podatke o klijentu:
       - Ime i prezime
       - Telefon
       - Email

Vlasnik: Marija Jovanović, 0601234567, marija@gmail.com

Agent: [Koristi List Records - provera]
       → Rezultat: Nema klijenta sa tim telefonom/emailom

Agent: [Koristi Client Create API]
       → POST request
       → Response: { "id": "rec123abc", ... }
       → ZAPAMTI: rec123abc

Agent: Klijent uspešno kreiran (Marija Jovanović).
       Nastavljam sa zakazivanjem termina...

Agent: [Koristi rec123abc za Appointment Create API]
```

### Scenario: Postojeći klijent

```
Agent: Molim podatke o klijentu:
       - Ime i prezime
       - Telefon
       - Email

Vlasnik: Ana Petrović, 0629876543, ana@gmail.com

Agent: [Koristi List Records - provera]
       → Rezultat: Klijent postoji! 
       → Record ID: rec456def

Agent: Klijent Ana Petrović već postoji u bazi.
       Nastavljam sa zakazivanjem termina...

Agent: [Koristi rec456def za Appointment Create API]
       → NE poziva Client Create API!
```

---

## 📌 VAŽNE NAPOMENE

1. **Uvek proveri prvo da li klijent postoji!**
   - Provera po telefonu ILI emailu
   - Ako postoji → Koristi postojeći record ID
   - Ako ne postoji → Kreiraj novog

2. **Zapamti record ID iz response-a**
   - Biće ti potreban za Appointment Create API
   - Format: `recXXXXXXXXXXXXXX`

3. **Ne kreiraj duplikate**
   - Jedan klijent = jedan zapis
   - Provera pre kreiranja je OBAVEZNA

4. **Email mora biti validan**
   - Format: xxx@xxx.xxx
   - Proveri format pre slanja

---

**Verzija:** 1.0  
**Status:** ✅ Production  
**Poslednje testiranje:** 12.10.2025 - Uspešno kreiran klijent

