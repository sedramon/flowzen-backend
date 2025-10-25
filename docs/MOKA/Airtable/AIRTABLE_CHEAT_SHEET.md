# 📋 AIRTABLE BRZI PREGLED - CHEAT SHEET

> **Ažurirano:** 12.10.2025 - Sva polja na srpskom, valuta u €

## 🎯 SVE TABELE I POLJA NA JEDNOM MESTU

---

## 1️⃣ APPOINTMENTS (Zakazivanja)
**ID:** `tblj7Ux5WP9lvKCE1` | **Primary:** Telefon

| # | Polje | Tip | Veza/Opcija |
|---|-------|-----|-------------|
| 1 | **Telefon** | Text | PRIMARY |
| 2 | **Datum** | Date | - |
| 3 | **Vreme** | Select | 08:00-20:00 (svakih 30min) |
| 4 | **Klijent** | Link | → Clients |
| 5 | **ID** | Auto# | - |
| 6 | **Email** | Text | - |
| 7 | **Usluga** | Link | → Services |
| 8 | **Status** | Select | Zakazan/Potvrđen/Otkazan/Završen |
| 9 | **Cena** | Rollup | from Services |
| 10 | **Napomena** | Long Text | - |
| 11 | **Kreiran** | Date | - |
| 12 | **Ažuriran** | Date | - |
| 13 | ~~Ukupno za platiti~~ | ~~Formula~~ | ✅ **OBRISANO** |
| 14 | **Plaćeno (rollup)** | Rollup | from Plaćanja |
| 15 | **Plaćanja** | Link | → Payments |
| 16 | **Preostalo za platiti** | Formula | Cena - Plaćeno |
| 17 | **Broj podsetnika** | Count | from Reminders |
| 18 | **Podsetnici** | Link | → Reminders |
| 19 | **Status plaćanja** | Formula | Plaćeno/Delimično/Nije |
| 20 | **Klijent email (lookup)** | Lookup | from Clients |
| 21 | **Usluga opis (lookup)** | Lookup | from Services |
| 22 | **Predlog sledeće akcije (AI)** | AI | - |
| 23 | **Analitika** | Link | → Analytics |
| 24 | **Trajanje (min)** | Lookup | from Services |
| 25 | **Autostatus** | Formula | Auto status sa emoji |

**Views:** All grid, All Calendar, Danas, Sutra (kanban)

---

## 2️⃣ SERVICES (Usluge)
**ID:** `tblIMJt2KjHhN9mRu` | **Primary:** Naziv

| # | Polje | Tip | Opcija |
|---|-------|-----|--------|
| 1 | **Naziv** | Text | PRIMARY |
| 2 | **ID** | Auto# | - |
| 3 | **Cena** | Currency | € EUR ✅ |
| 4 | **Trajanje (min)** | Number | - |
| 5 | **Opis** | Long Text | - |
| 6 | **Zahteva avans** | Checkbox | - |
| 7 | **Kategorija** | Select | Šminka/Obrve/Trepavice/Kursevi |
| 8 | **Aktivan** | Checkbox | - |
| 9 | **Opis (sažetak)** | AI | - |
| 10 | **Predlog za unapređenje usluge** | AI | - |
| 11 | **Termini** | Link | → Appointments |

**Views:** Grid view

---

## 3️⃣ CLIENTS (Klijenti)
**ID:** `tbl0cr1oFx5wKhTcQ` | **Primary:** Ime

| # | Polje | Tip | Veza |
|---|-------|-----|------|
| 1 | **Ime** | Text | PRIMARY |
| 2 | **ID** | Auto# | - |
| 3 | **Telefon** | Text | - |
| 4 | **Email** | Text | - |
| 5 | **Istorija termina** | Link | → Appointments |
| 6 | **Dugovanje** | Rollup | SUM(Preostalo za platiti) |
| 7 | **Poslednji termin** | Rollup | MAX(Datum) |
| 8 | **Napomene** | Long Text | - |
| 9 | **Broj zakazanih termina** | Rollup | COUNT(Appointments) |
| 10 | **Plaćanja** | Rollup | from Appointments |

**Views:** Grid view

---

## 4️⃣ PAYMENTS (Plaćanja)
**ID:** `tblxyRCX8n2SPA77Y` | **Primary:** Name

| # | Polje | Tip | Opcija |
|---|-------|-----|--------|
| 1 | **Naziv** | Text | PRIMARY ✅ |
| 2 | **ID** | Auto# | - |
| 3 | **Klijent** | Rollup | from Appointments |
| 4 | **Iznos** | Currency | € EUR ✅ |
| 5 | **Datum** | Date | - |
| 6 | **Tip** | Select | Avans/Plaćanje/Povraćaj |
| 7 | **Status** | Select | Plaćeno/Na čekanju/Otkazano |
| 8 | **Termin** | Link | → Appointments |
| 9 | **Napomena** | Long Text | - |
| 10 | **Email klijenta** | Lookup | from Appointments |
| 11 | **Telefon klijenta** | Lookup | from Appointments |
| 12 | **Datum termina** | Lookup | from Appointments |
| 13 | **Da li je povraćaj** | Formula | Tip = 'Povraćaj' |
| 14 | **Da li je avans** | Formula | Tip = 'Avans' |
| 15 | **Da li je plaćeno** | Formula | Status = 'Plaćeno' |
| 16 | **Kašnjenje plaćanja (dani)** | Formula | ✅ POPRAVLJENO |
| 17 | **Sažetak napomene (AI)** | AI | - |
| 18 | **Detektor anomalija (AI)** | AI | - |

**Views:** Grid view, Gallery

---

## 5️⃣ ANALYTICS (Analitika)
**ID:** `tbl98DbE89WtVBLjq` | **Primary:** Najtraženija usluga

| # | Polje | Tip | Status |
|---|-------|-----|--------|
| 1 | **Najtraženija usluga** | Text | PRIMARY |
| 2 | **Mesec** | Date | - |
| 3 | **Ukupan prihod** | Currency | € EUR ✅ |
| 4 | **Broj termina** | Number | - |
| 5 | **ID** | Auto# | - |
| 6 | **Novi klijenti** | Number | - |
| 7 | **Povratnici** | Number | - |
| 8 | **Termini u mesecu** | Rollup | COUNT |
| 9 | **Termini** | Link | → Appointments |
| 10 | **Ukupan prihod (formula)** | Rollup | SUM(Cena) |
| 11 | **Ukupna plaćanja (EUR)** | Rollup | ✅ SUM(Plaćeno) |
| 12 | **Prosečna vrednost termina** | Formula | Prihod / Broj termina |
| 13 | **Najpopularnija kategorija (AI)** | AI | - |
| 14 | **Poslovni uvidi (AI)** | AI | - |

**Views:** Grid view, Gallery

---

## 6️⃣ REMINDERS (Podsetnici)
**ID:** `tblhIDIFhsYQfV3zu` | **Primary:** Name

| # | Polje | Tip | Opcija |
|---|-------|-----|--------|
| 1 | **Naziv** | Text | PRIMARY ✅ |
| 2 | **ID** | Auto# | - |
| 3 | **Termin** | Link | → Appointments |
| 4 | **Tip** | Select | 24h/2h reminder/Feedback |
| 5 | **Datum slanja** | Date | - |
| 6 | **Status** | Select | Zakazano/Poslato/Otkazano |
| 7 | **Datum termina** | Lookup | from Appointments |
| 8 | **Status termina** | Lookup | from Appointments |
| 9 | **Sentiment povratne informacije** | AI | Positive/Neutral/Negative |

**Views:** Grid view

---

## 🔗 BRZE VEZE IZMEĐU TABELA

```
CLIENTS ─┬─→ APPOINTMENTS ─┬─→ SERVICES
         │                 ├─→ PAYMENTS
         │                 ├─→ REMINDERS
         │                 └─→ ANALYTICS
         │
         └─→ (preko Appointments)
```

**Kako čitati:**
- **→** = Link polje (direktna veza)
- **Rollup/Lookup** = Izvlači podatke preko link polja

---

## ⚡ BRZE FORMULE

### Formula za "Preostalo za platiti":
```
{Cena} - {Plaćeno (rollup)}
```

### Formula za "Status plaćanja":
```
IF(
  {Plaćeno (rollup)} >= {Cena}, 
  "Plaćeno", 
  IF(
    {Plaćeno (rollup)} > 0, 
    "Delimično plaćeno", 
    "Nije plaćeno"
  )
)
```

### Formula za "Avg Appointment Value":
```
IF(
  {Broj termina} > 0,
  {Ukupan prihod} / {Broj termina},
  0
)
```

### Formula za "Payment Delay":
```
DATETIME_DIFF({Datum}, {Termin Datum}, 'days')
```

### Formula za "Autostatus" (Appointments):
```
IF(
  {Status} = "Otkazan",
  "❌ Otkazan",
  IF(
    {Status} = "Završen",
    IF(
      {Status plaćanja} = "Plaćeno",
      "✅ Završen i plaćen",
      "💰 Završen - čeka plaćanje"
    ),
    IF(
      {Datum} < TODAY(),
      "⚠️ Prošao termin",
      IF(
        {Status} = "Potvrđen",
        "✔️ Potvrđen",
        "📅 Zakazan"
      )
    )
  )
)
```

**Kako radi:**
1. Prvo proverava da li je **Otkazan** → "❌ Otkazan"
2. Zatim proverava da li je **Završen**:
   - Ako JE plaćen → "✅ Završen i plaćen"
   - Ako NIJE plaćen → "💰 Završen - čeka plaćanje"
3. Zatim proverava da li je **prošao datum** → "⚠️ Prošao termin"
4. Zatim proverava da li je **Potvrđen** → "✔️ Potvrđen"
5. Inače → "📅 Zakazan"

---

## 🎨 SELECT OPCIJE

### Appointments - Status:
- 🔵 Zakazan (blueLight2)
- 🔷 Potvrđen (cyanLight2)
- 🟢 Otkazan (tealLight2)
- 🟩 Završen (greenLight2)

### Appointments - Vreme:
08:00, 08:30, 09:00, ..., 19:30, 20:00 (svakih 30min)

### Services - Kategorija:
- Šminka
- Obrve
- Trepavice
- Kursevi

### Payments - Tip:
- Avans
- Plaćanje
- Povraćaj

### Payments - Status:
- Plaćeno
- Na čekanju
- Otkazano

### Reminders - Tip:
- 24h reminder
- 2h reminder
- Feedback request

### Reminders - Status:
- Zakazano
- Poslato
- Otkazano

---

## 🤖 AI POLJA (10 ukupno)

### Appointments (1):
- Predlog sledeće akcije (AI)

### Services (2):
- Opis (sažetak)
- Predlog za unapređenje usluge

### Payments (2):
- Payment Note Summary (AI)
- Payment Anomaly Detector (AI)

### Analytics (2):
- Most Popular Category (AI)
- Business Insights (AI)

### Reminders (1):
- Feedback sentiment

---

## ✅ REŠENA PROBLEMATIČNA POLJA

| Tabela | Polje | Problem | Status |
|--------|-------|---------|--------|
| Appointments | ~~Ukupno za platiti~~ | Formula nevalidna | ✅ OBRISANO |
| Analytics | Ukupna plaćanja (EUR) | Rollup nije bio konfigurisan | ✅ POPRAVLJENO |

---

## 🔢 STATISTIKA

- **Ukupno tabela:** 6
- **Ukupno polja:** 85
- **Link polja:** 15
- **Rollup polja:** 13
- **Formula polja:** 9
- **AI polja:** 10
- **Auto Number:** 6
- **Lookup polja:** 7
- **Select polja:** 8
- **Currency polja:** 5 (sve u € EUR ✅)
- **⚠️ Problematična polja:** 0 (svi problemi rešeni!)

---

## 📞 BRZI SAVETI

### Kako brzo naći polje?
1. Ctrl+F (browser search)
2. Kucaj naziv polja
3. View → Hide/Show fields

### Kako exportovati podatke?
1. Otvori tabelu
2. View → Download CSV

### Kako napraviti automatizaciju?
1. Automations (gore desno)
2. Create automation
3. When/Do setup

### Kako dodati novo polje?
1. Klikni "+" kraj poslednje kolone
2. Izaberi tip
3. Konfiguriši

---

**Kreirao:** Claude AI  
**Datum:** 2025-10-12  
**Za:** MOKA Beauty Studio

