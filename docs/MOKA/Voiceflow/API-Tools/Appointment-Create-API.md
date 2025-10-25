# 🗓️ APPOINTMENT CREATE API

> **Tool Name:** Appointment Create API  
> **Type:** Custom API Tool  
> **Method:** POST  
> **Poslednje ažurirano:** 12. oktobar 2025

---

## 📋 OPIS

Kreira jedan ili više novih termina u Airtable tabeli "Appointments" (base ID: `appqzwTXdTkG0qrc0`) koristeći dostavljene podatke.

---

## 🎯 LLM DESCRIPTION

```
Create one or more new appointments in the Airtable "Appointments" table 
(base ID: appqzwTXdTkG0qrc0) using the provided data.

Do not collect or send the phone number - it's stored in the Clients table.
Do not collect or send the price field. The price is automatically set based 
on the selected service in Airtable.
```

**⚠️ Ključna napomena:** 
- **NE prikupljaj** i **NE šalji** broj telefona (phone field) - čuva se u Clients tabeli
- **NE prikupljaj** i **NE šalji** cenu (price field)
- Cena se automatski postavlja u Airtable-u na osnovu izabrane usluge (rollup iz Services tabele)

---

## 🔗 ENDPOINT

**Base URL:** `https://api.airtable.com/v0/`  
**Base ID:** `appqzwTXdTkG0qrc0`  
**Table:** `Appointments`

**Full Endpoint:**
```
POST https://api.airtable.com/v0/appqzwTXdTkG0qrc0/Appointments
```

---

## 📊 REQUEST BODY

### Required Fields:

| Polje | Tip | Opis | Primer |
|-------|-----|------|--------|
| `Datum` | Date | Datum termina (YYYY-MM-DD) | "2025-10-15" |
| `Vreme` | Single Select | Vreme termina | "14:00" |
| `Klijent` | Array[String] | Record ID klijenta iz Clients tabele | ["recXXXXXXXXXXXX"] |
| `Usluga` | Array[String] | Record ID usluge iz Services tabele | ["recYYYYYYYYYYYY"] |

### Optional Fields:

| Polje | Tip | Opis | Primer |
|-------|-----|------|--------|
| `Email` | String | Email klijenta | "marija@gmail.com" |
| `Status` | Single Select | Status termina | "Zakazan" |
| `Napomena` | Long Text | Dodatne napomene | "Klijent preferira..." |

### Fields NOT to send:

| Polje | Razlog |
|-------|--------|
| `Cena` | Automatski rollup iz Services tabele |
| `Plaćeno (rollup)` | Automatski rollup iz Payments tabele |
| `Preostalo za platiti` | Automatska formula |
| `Status plaćanja` | Automatska formula |
| `ID` | Auto number |
| `Kreiran` | Automatski timestamp |
| `Ažuriran` | Automatski timestamp |

---

## 📝 PRIMER REQUEST-A

### JSON Body:
```json
{
  "fields": {
    "Telefon": "+381601234567",
    "Datum": "2025-10-15",
    "Vreme": "14:00",
    "Klijent": ["rec123abc456def"],
    "Usluga": ["rec789ghi012jkl"],
    "Email": "marija@gmail.com",
    "Status": "Zakazan",
    "Napomena": "Klijent preferira prirodnu šminku"
  }
}
```

---

## ✅ PRIMER RESPONSE-A

### Success (200 OK):
```json
{
  "id": "recNewAppointment123",
  "createdTime": "2025-10-12T14:30:00.000Z",
  "fields": {
    "Telefon": "0601234567",
    "Datum": "2025-10-15",
    "Vreme": "14:00",
    "Klijent": ["rec123abc456def"],
    "Usluga": ["rec789ghi012jkl"],
    "Email": "marija@gmail.com",
    "Status": "Zakazan",
    "Napomena": "Klijent preferira prirodnu šminku",
    "Cena": 60,
    "ID": 42,
    "Kreiran": "2025-10-12",
    "Plaćeno (rollup)": 0,
    "Preostalo za platiti": 60,
    "Status plaćanja": "Nije plaćeno"
  }
}
```

---

## ⚠️ ERROR HANDLING

### Greška 1: Missing linked fields
```json
{
  "error": {
    "type": "INVALID_REQUEST_BODY",
    "message": "Field 'Klijent' cannot be empty"
  }
}
```
**Rešenje:** Uvek prosledi record ID za Klijent i Usluga polja!

### Greška 2: Invalid record ID
```json
{
  "error": {
    "type": "INVALID_VALUE_FOR_COLUMN",
    "message": "Invalid record id: recXXXXX"
  }
}
```
**Rešenje:** Proveri da li record ID postoji u linked tabeli.

### Greška 3: Invalid date format
```json
{
  "error": {
    "type": "INVALID_VALUE_FOR_COLUMN",
    "message": "Field 'Datum' expected date format YYYY-MM-DD"
  }
}
```
**Rešenje:** Koristi YYYY-MM-DD format (npr. "2025-10-15").

### Greška 4: Invalid select option
```json
{
  "error": {
    "type": "INVALID_VALUE_FOR_COLUMN",
    "message": "'15:00' is not a valid choice for 'Vreme'"
  }
}
```
**Rešenje:** Koristi samo validne opcije za Vreme (08:00, 08:30, 09:00, ..., 20:00).

---

## 🔑 AUTHENTICATION

**Method:** Bearer Token

**Header:**
```
Authorization: Bearer YOUR_AIRTABLE_API_KEY
```

**⚠️ Napomena:** API key se čuva sigurno u Voiceflow environment variables.

---

## 📊 VALIDNE OPCIJE ZA "VREME"

```
08:00, 08:30, 09:00, 09:30, 10:00, 10:30, 11:00, 11:30,
12:00, 12:30, 13:00, 13:30, 14:00, 14:30, 15:00, 15:30,
16:00, 16:30, 17:00, 17:30, 18:00, 18:30, 19:00, 19:30, 20:00
```

---

## 📊 VALIDNE OPCIJE ZA "STATUS"

```
- Zakazan
- Potvrđen
- Otkazan
- Završen
```

**Default:** "Zakazan"

---

## 🔄 KAKO AGENT KORISTI API

### Flow:
```
1. Prikupi podatke od vlasnika
2. Proveri/kreiraj klijenta → Uzmi record ID
3. Pronađi uslugu → Uzmi record ID
4. Pripremi request body:
   {
     "fields": {
       "Telefon": "...",
       "Datum": "...",
       "Vreme": "...",
       "Klijent": [record_id_klijenta],
       "Usluga": [record_id_usluge],
       "Email": "...",
       "Status": "Zakazan",
       "Napomena": "..."
     }
   }
5. Pošalji POST request
6. Primi response sa kreiranim terminom
7. Potvrdi vlasniku
```

---

## ✅ CHECKLIST PRE SLANJA

- [ ] Telefon popunjen
- [ ] Datum u formatu YYYY-MM-DD
- [ ] Vreme validna opcija (30min intervali)
- [ ] Klijent record ID dobijen
- [ ] Usluga record ID dobijen
- [ ] Klijent i Usluga kao array-evi
- [ ] NE šalje se Cena
- [ ] Email popunjen (ako postoji)
- [ ] Status postavljen (default: Zakazan)

---

## 🧪 TEST CASES

### Test 1: Minimalan zahtev
```json
{
  "fields": {
    "Telefon": "0601234567",
    "Datum": "2025-10-15",
    "Vreme": "14:00",
    "Klijent": ["rec123"],
    "Usluga": ["rec456"]
  }
}
```
**Očekivano:** ✅ Success

### Test 2: Potpun zahtev
```json
{
  "fields": {
    "Telefon": "0601234567",
    "Datum": "2025-10-15",
    "Vreme": "14:00",
    "Klijent": ["rec123"],
    "Usluga": ["rec456"],
    "Email": "test@email.com",
    "Status": "Potvrđen",
    "Napomena": "Test napomena"
  }
}
```
**Očekivano:** ✅ Success

### Test 3: Greška - bez Klijent polja
```json
{
  "fields": {
    "Telefon": "0601234567",
    "Datum": "2025-10-15",
    "Vreme": "14:00",
    "Usluga": ["rec456"]
  }
}
```
**Očekivano:** ❌ Error - Missing Klijent field

---

**Verzija:** 1.0  
**Status:** ✅ Production  
**Poslednje testiranje:** 12.10.2025 - Uspešno kreiran termin

