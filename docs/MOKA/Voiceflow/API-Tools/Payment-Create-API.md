# 💳 PAYMENT CREATE API

> **Tool Name:** Payment Create API  
> **Type:** Custom API Tool  
> **Method:** POST  
> **Poslednje ažurirano:** 12. oktobar 2025

---

## 📋 OPIS

Kreira novo plaćanje u Airtable tabeli "Payments" (base ID: `appqzwTXdTkG0qrc0`). Koristi se za unos avansa, finalnih plaćanja i povraćaja.

---

## 🎯 LLM DESCRIPTION

```
Create a new payment record in the Airtable "Payments" table 
(base ID: appqzwTXdTkG0qrc0).

Use this to record:
- Advance payments (Avans) when client pays deposit
- Final payments (Plaćanje) when client pays remaining amount
- Refunds (Povraćaj) when money is returned to client

Always link the payment to the appointment record using the appointment's record ID.
The payment will automatically update the "Plaćeno (rollup)" field in the linked appointment.
```

---

## 🔗 ENDPOINT

**Base URL:** `https://api.airtable.com/v0/`  
**Base ID:** `appqzwTXdTkG0qrc0`  
**Table:** `Payments`

**Full Endpoint:**
```
POST https://api.airtable.com/v0/appqzwTXdTkG0qrc0/Payments
```

---

## 📊 REQUEST BODY

### Required Fields:

| Polje | Tip | Opis | Primer |
|-------|-----|------|--------|
| `Naziv` | String | Identifikacija plaćanja | "Avans - Marija - 15.10 - Puder obrve" |
| `Iznos` | Number | Iznos u EUR | 60 |
| `Datum` | Date | Datum plaćanja (YYYY-MM-DD) | "2025-10-12" |
| `Tip` | Single Select | Tip plaćanja | "Avans" / "Plaćanje" / "Povraćaj" |
| `Status` | Single Select | Status plaćanja | "Plaćeno" / "Na čekanju" / "Otkazano" |
| `Termin` | Array[String] | Record ID termina iz Appointments | ["recXXXXXXXXXXXX"] |

### Optional Fields:

| Polje | Tip | Opis | Primer |
|-------|-----|------|--------|
| `Napomena` | Long Text | Dodatne informacije | "Avans uplaćen preko računa" |

### Fields NOT to send:

| Polje | Razlog |
|-------|--------|
| `ID` | Auto number (automatski) |
| `Klijent` | Rollup iz Appointments (automatski) |
| `Email klijenta` | Lookup iz Appointments (automatski) |
| `Telefon klijenta` | Lookup iz Appointments (automatski) |
| `Datum termina` | Lookup iz Appointments (automatski) |
| `Da li je povraćaj` | Formula (automatski) |
| `Da li je avans` | Formula (automatski) |
| `Da li je plaćeno` | Formula (automatski) |
| `Kašnjenje plaćanja (dani)` | Formula (automatski) |
| Sva AI polja | Automatski se generišu |

---

## 📝 PRIMERI REQUEST-A

### Primer 1: Avans za Puder obrve

```json
{
  "records": [
    {
      "fields": {
        "Naziv": "Avans - Marija - 20.10 - Puder obrve",
        "Iznos": 60,
        "Datum": "2025-10-12",
        "Tip": "Avans",
        "Status": "Plaćeno",
        "Termin": ["recABC123xyz"],
        "Napomena": "Avans 60€ uplaćen preko računa, preostalo 120€"
      }
    }
  ]
}
```

---

### Primer 2: Finalno plaćanje

```json
{
  "records": [
    {
      "fields": {
        "Naziv": "Plaćanje - Marija - 20.10 - Puder obrve",
        "Iznos": 120,
        "Datum": "2025-10-20",
        "Tip": "Plaćanje",
        "Status": "Plaćeno",
        "Termin": ["recABC123xyz"],
        "Napomena": "Ostatak nakon avansa, plaćeno gotovinom"
      }
    }
  ]
}
```

---

### Primer 3: Puno plaćanje (bez avansa)

```json
{
  "records": [
    {
      "fields": {
        "Naziv": "Plaćanje - Jovana - 15.10 - Šminkanje",
        "Iznos": 60,
        "Datum": "2025-10-15",
        "Tip": "Plaćanje",
        "Status": "Plaćeno",
        "Termin": ["recDEF456uvw"],
        "Napomena": "Plaćeno gotovinom na dan tretmana"
      }
    }
  ]
}
```

---

### Primer 4: Povraćaj

```json
{
  "records": [
    {
      "fields": {
        "Naziv": "Povraćaj - Ana - 18.10 - Šminkanje",
        "Iznos": 60,
        "Datum": "2025-10-18",
        "Tip": "Povraćaj",
        "Status": "Plaćeno",
        "Termin": ["recGHI789rst"],
        "Napomena": "Termin otkazan, vraćen avans"
      }
    }
  ]
}
```

---

## ✅ VALIDNE OPCIJE

### Za "Tip":
- `Avans`
- `Plaćanje`
- `Povraćaj`

### Za "Status":
- `Plaćeno`
- `Na čekanju`
- `Otkazano`

---

## 🔑 AUTHENTICATION

**Method:** Bearer Token

**Header:**
```
Authorization: Bearer YOUR_AIRTABLE_API_KEY
```

---

## 🔄 KAKO AGENT KORISTI PAYMENT API

### USE CASE 1: Avans prilikom zakazivanja

```
Scenario:
Vlasnica zakazuje termin za Puder obrve

Agent: [Kreira termin - Appointment Create API]
       ✅ Termin kreiran, record ID: recABC123

Agent: "Da li je klijent uplatio avans?"

Vlasnica: "Da, upravo je uplatila 60€"

Agent: [Koristi Payment Create API]
       Naziv: "Avans - Marija - 20.10 - Puder obrve"
       Iznos: 60
       Datum: TODAY()
       Tip: "Avans"
       Status: "Plaćeno"
       Termin: ["recABC123"]
       
       ✅ Payment kreiran!

Agent: "Avans 60€ evidentiran. Preostalo za platiti: 120€"
```

---

### USE CASE 2: Unos plaćanja za postojeći termin

```
Vlasnica: "Unesi plaćanje za Mariju"

Agent: "Za koji termin?"

Vlasnica: "20. oktobar"

Agent: [List Records → traži termine Marije]
       [Pronađe termin, record ID: recABC123]
       
       "Marija - Puder obrve - 20.10
        Cena: 180€
        Plaćeno: 60€ (avans)
        Preostalo: 120€
        
        Koliki iznos unosiš?"

Vlasnica: "120"

Agent: [Payment Create API]
       Naziv: "Plaćanje - Marija - 20.10 - Puder obrve"
       Iznos: 120
       Datum: TODAY()
       Tip: "Plaćanje"
       Status: "Plaćeno"
       Termin: ["recABC123"]
       
       ✅ "Plaćanje 120€ uneseno! Sve naplaćeno, nema dugovanja."
```

---

### USE CASE 3: Plaćanje bez avansa

```
Scenario:
Klijent dolazi na Šminkanje (60€), nema avansa

Agent: [Nakon što je termin završen]

Vlasnica: "Unesi plaćanje za Jovanu"

Agent: "Za koji termin?"

Vlasnica: "15. oktobar - šminkanje"

Agent: [Pronađe termin recDEF456]
       
       "Jovana - Šminkanje - 15.10
        Cena: 60€
        Plaćeno: 0€
        Preostalo: 60€
        
        Iznos?"

Vlasnica: "60"

Agent: [Payment Create API]
       Naziv: "Plaćanje - Jovana - 15.10 - Šminkanje"
       Iznos: 60
       Datum: TODAY()
       Tip: "Plaćanje"
       Status: "Plaćeno"
       Termin: ["recDEF456"]
       
       ✅ "Plaćanje 60€ uneseno! Sve naplaćeno."
```

---

## 📋 PROCES KREIRANJA TERMINA SA AVANSOM

### Korak-po-korak:

```
1. Agent prikuplja podatke za termin:
   - Ime, Telefon, Email, Usluga, Datum, Vreme

2. Agent PROVERAVA da li usluga zahteva avans:
   → Poziva List Records API za Services
   → Proverava polje "Zahteva avans"

3a. AKO usluga NE zahteva avans:
    → Kreira termin
    → Potvrđuje vlasnicu
    → Gotovo!

3b. AKO usluga ZAHTEVA avans (Puder obrve):
    → Kreira termin
    → PITA: "Da li je klijent uplatio avans?"
    
    Ako DA:
      → Payment Create API (Avans, 60€)
      → Potvrđuje: "Termin zakazan, avans evidentiran"
    
    Ako NE:
      → Potvrđuje: "Termin zakazan, podsetnik da klijent uplati avans"
```

---

## 📝 INPUT VARIJABLE (Za Voiceflow)

Kada kreiraš API tool u Voiceflow-u, trebaće ti:

| Varijabla | Tip | Opcije | Default |
|-----------|-----|--------|---------|
| `naziv` | String | - | "" |
| `iznos` | Number | - | - |
| `datum` | Date | Format: YYYY-MM-DD | TODAY() |
| `tip` | Select | Avans, Plaćanje, Povraćaj | "Plaćanje" |
| `status` | Select | Plaćeno, Na čekanju, Otkazano | "Plaćeno" |
| `termin_id` | String | Record ID | - |
| `napomena` | String | Optional | "" |

---

## 🧪 TEST SCENARIO

### Test 1: Avans za Puder obrve

**Input:**
```
naziv: "Avans - Test Klijent - 15.10 - Puder obrve"
iznos: 60
datum: "2025-10-15"
tip: "Avans"
status: "Plaćeno"
termin_id: ["recTEST123"]
napomena: "Test avans"
```

**Očekivano:**
- ✅ Payment kreiran
- ✅ U Appointments: Plaćeno = 60€, Preostalo = 120€

---

### Test 2: Finalno plaćanje

**Input:**
```
naziv: "Plaćanje - Test Klijent - 15.10 - Puder obrve"
iznos: 120
datum: "2025-10-15"
tip: "Plaćanje"
status: "Plaćeno"
termin_id: ["recTEST123"]
napomena: "Ostatak nakon avansa"
```

**Očekivano:**
- ✅ Payment kreiran
- ✅ U Appointments: Plaćeno = 180€, Preostalo = 0€, Status = "Plaćeno"

---

## ⚠️ ERROR HANDLING

### Greška 1: Nevažeći Tip
```json
{
  "error": {
    "type": "INVALID_VALUE_FOR_COLUMN",
    "message": "'Uplata' is not a valid choice for 'Tip'"
  }
}
```
**Rešenje:** Koristi samo: Avans, Plaćanje, Povraćaj

### Greška 2: Nevažeći Termin ID
```json
{
  "error": {
    "type": "INVALID_VALUE_FOR_COLUMN",
    "message": "Invalid record id: recXXX"
  }
}
```
**Rešenje:** Proveri da termin postoji prvo (List Records)

### Greška 3: Missing Termin field
```json
{
  "error": {
    "type": "INVALID_REQUEST_BODY",
    "message": "Field 'Termin' cannot be empty"
  }
}
```
**Rešenje:** UVEK poveži plaćanje sa terminom!

---

## 📊 KAKO ĆE AGENT KORISTITI

### Scenario A: Kreiranje termina sa avansom

```javascript
// 1. Agent kreira termin
Appointment Create API → response: { id: "recABC123" }

// 2. Agent proverava uslugu
List Records (Services) → usluga.fields["Zahteva avans"] = true

// 3. Agent pita vlasnicu
Agent: "Da li je klijent uplatio avans od 60€?"

// 4a. Ako DA:
Payment Create API {
  "Naziv": "Avans - [Klijent] - [Datum] - Puder obrve",
  "Iznos": 60,
  "Datum": TODAY(),
  "Tip": "Avans",
  "Status": "Plaćeno",
  "Termin": ["recABC123"]
}

Agent: "✅ Termin zakazan i avans evidentiran (60€). Preostalo: 120€"

// 4b. Ako NE:
Agent: "✅ Termin zakazan. Napomena: Klijent treba da uplati avans 60€"
```

---

### Scenario B: Unos plaćanja naknadno

```javascript
// 1. Vlasnica kaže "Unesi plaćanje za Mariju"
Agent: "Za koji termin?"

// 2. Vlasnica: "20. oktobar"
Agent: [List Records → traži termine Marije za 20.10]

// 3. Agent pronalazi termin
recABC123 → Marija - Puder obrve - 20.10
  Cena: 180€
  Plaćeno: 60€
  Preostalo: 120€

Agent: "Marija - Puder obrve - 20.10.
       Cena: 180€, Plaćeno: 60€, Preostalo: 120€.
       Koliki iznos unosiš?"

// 4. Vlasnica: "120"
Payment Create API {
  "Naziv": "Plaćanje - Marija - 20.10 - Puder obrve",
  "Iznos": 120,
  "Datum": TODAY(),
  "Tip": "Plaćanje",
  "Status": "Plaćeno",
  "Termin": ["recABC123"]
}

Agent: "✅ Plaćanje 120€ uneseno! Sve naplaćeno, nema dugovanja."
```

---

## 💡 PREPORUKE ZA NAZIV

### Format:
```
[TIP] - [KLIJENT] - [DATUM] - [USLUGA]
```

### Primeri:
```
Avans - Marija - 20.10 - Puder obrve
Plaćanje - Jovana - 15.10 - Šminkanje
Povraćaj - Ana - 18.10 - Kurs NSS
```

### Kraći format (ako preferiš):
```
Avans - Marija - 20.10
Plaćanje - Jovana - 15.10
```

**Zašto?** Naziv je samo za identifikaciju u tabeli - ne vide ga klijenti!

---

## 🔢 KALKULACIJA IZNOSA

### Puder obrve (180€):
```
Avans:    60€  (obavezan)
Ostatak: 120€  (na dan tretmana)
-------------------
Ukupno:  180€
```

### Ostale usluge:
```
Plaćanje na dan tretmana (pun iznos)
```

---

## ✅ CHECKLIST PRE SLANJA

- [ ] Naziv popunjen (identifikacija)
- [ ] Iznos popunjen (broj u EUR)
- [ ] Datum u formatu YYYY-MM-DD
- [ ] Tip izabran (Avans/Plaćanje/Povraćaj)
- [ ] Status izabran (obično "Plaćeno")
- [ ] Termin record ID dobijen (iz Appointments)
- [ ] Termin kao array: ["recXXX"]
- [ ] NE šalju se automatska polja

---

## 🎯 INTEGRACIJA SA APPOINTMENTS

**Kada se kreira Payment:**
1. ✅ Automatski se linkuje sa Appointments (preko Termin polja)
2. ✅ Appointments.Plaćeno (rollup) se ažurira (sumira sve Payments.Iznos)
3. ✅ Appointments.Preostalo za platiti (formula) se preračunava (Cena - Plaćeno)
4. ✅ Appointments.Status plaćanja (formula) se ažurira ("Plaćeno"/"Delimično"/"Nije")

**Sve je AUTOMATSKI!** 🎉

---

## 📊 PRIMER KOMPLETNOG TOKA

### Puder obrve sa avansom:

```
DAN 1 (12.10) - Zakazivanje:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Kreira se Appointment
   Marija - Puder obrve - 20.10 - 10:00
   Cena: 180€
   Plaćeno: 0€
   Preostalo: 180€
   Status plaćanja: "Nije plaćeno"

2. Klijent uplaćuje avans odmah
   Payment Create API:
   - Naziv: "Avans - Marija - 20.10 - Puder obrve"
   - Iznos: 60€
   - Tip: Avans
   
3. Stanje posle avansa:
   Plaćeno: 60€
   Preostalo: 120€
   Status plaćanja: "Delimično plaćeno" ⚡

DAN 2 (20.10) - Tretman:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. Klijent dolazi i plaća ostatak
   Payment Create API:
   - Naziv: "Plaćanje - Marija - 20.10 - Puder obrve"
   - Iznos: 120€
   - Tip: Plaćanje
   
5. Stanje posle plaćanja:
   Plaćeno: 180€ (60 + 120)
   Preostalo: 0€
   Status plaćanja: "Plaćeno" ✅
```

---

**Verzija:** 1.0  
**Status:** ✅ Spremno za implementaciju  
**Kreirao:** Claude Sonnet 4.5  
**Datum:** 12. oktobar 2025

