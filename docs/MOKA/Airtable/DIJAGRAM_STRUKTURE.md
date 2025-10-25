# 🗺️ VIZUELNI DIJAGRAM AIRTABLE BAZE

## 📊 KOMPLETAN ER DIJAGRAM

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MOKA BEAUTY STUDIO                              │
│                         AIRTABLE STRUKTURA                              │
└─────────────────────────────────────────────────────────────────────────┘


        ┌──────────────────────────────┐
        │       📋 CLIENTS             │
        │  (tbl0cr1oFx5wKhTcQ)        │
        ├──────────────────────────────┤
        │ 🔑 Ime (PRIMARY)             │
        │ 🆔 ID (Auto)                 │
        │ 📞 Telefon                   │
        │ 📧 Email                     │
        │ 📝 Napomene                  │
        │ 💰 Dugovanje (Rollup)        │
        │ 📅 Poslednji termin (Rollup) │
        │ 🔢 Broj termina (Rollup)     │
        └────────┬─────────────────────┘
                 │
                 │ Istorija termina
                 │
                 ▼
        ┌─────────────────────────────────────────┐
        │     📅 APPOINTMENTS (CENTRALNA)         │
        │      (tblj7Ux5WP9lvKCE1)                │
        ├─────────────────────────────────────────┤
        │ 🔑 Telefon (PRIMARY)                    │
        │ 🆔 ID (Auto)                            │
        │ 📅 Datum                                │
        │ ⏰ Vreme (Select: 08:00-20:00)          │
        │ 📧 Email                                │
        │ 📝 Napomena                             │
        │ 🏷️ Status (Zakazan/Potvrđen/...)       │
        │ 💵 Cena (Rollup from Services)          │
        │ 💰 Plaćeno (Rollup from Payments)       │
        │ 💳 Preostalo za platiti (Formula)       │
        │ ✅ Status plaćanja (Formula)            │
        │ 📅 Kreiran / Ažuriran                   │
        │ 🤖 Predlog sledeće akcije (AI)          │
        └───┬──────┬──────┬──────┬──────┬─────────┘
            │      │      │      │      │
            │      │      │      │      │
   ┌────────┘      │      │      │      └─────────┐
   │               │      │      │                │
   │ Klijent       │      │      │                │ Analytics
   │               │      │      │                │
   ▼               │      │      │                ▼
(već gore)         │      │      │      ┌──────────────────────┐
                   │      │      │      │  📊 ANALYTICS        │
                   │      │      │      │  (tbl98DbE89WtVBLjq) │
                   │      │      │      ├──────────────────────┤
    ┌──────────────┘      │      │      │ 🔑 Najtraženija usl. │
    │ Usluga              │      │      │ 🆔 ID (Auto)         │
    │                     │      │      │ 📅 Mesec             │
    ▼                     │      │      │ 💰 Ukupan prihod     │
┌──────────────────────┐  │      │      │ 🔢 Broj termina      │
│  💆 SERVICES         │  │      │      │ 👥 Novi klijenti     │
│  (tblIMJt2KjHhN9mRu) │  │      │      │ 🔄 Povratnici        │
├──────────────────────┤  │      │      │ 📊 Avg value (Form.) │
│ 🔑 Naziv (PRIMARY)   │  │      │      │ ⚠️ Advance Pay.(ERR) │
│ 🆔 ID (Auto)         │  │      │      │ 🤖 Popular Cat (AI)  │
│ 💰 Cena ($→€)        │  │      │      │ 🤖 Business Ins (AI) │
│ ⏱️ Trajanje (min)    │  │      │      └──────────────────────┘
│ 📝 Opis              │  │      │
│ ☑️ Zahteva avans     │  │      │
│ 🏷️ Kategorija        │  │      │
│   (Select 4 opcije)  │  │      │      ┌──────────────────────┐
│ ✅ Aktivan           │  │      └─────►│  💳 PAYMENTS         │
│ 🤖 Opis sažetak (AI) │  │ Payments    │  (tblxyRCX8n2SPA77Y) │
│ 🤖 Unapređenje (AI)  │  │             ├──────────────────────┤
└──────────────────────┘  │             │ 🔑 Name (PRIMARY)    │
                          │             │ 🆔 ID (Auto)         │
                          │             │ 💰 Iznos ($→€)       │
                          │             │ 📅 Datum             │
                          │ Reminders   │ 🏷️ Tip (Select)      │
                          │             │   Avans/Plaćanje/... │
                          │             │ ✅ Status (Select)   │
                          ▼             │ 📝 Napomena          │
              ┌────────────────────┐    │ 💵 Klijent (Rollup)  │
              │  🔔 REMINDERS      │    │ 📧 Email (Lookup)    │
              │  (tblhIDIFhsYQfV3zu)│   │ 📞 Telefon (Lookup)  │
              ├────────────────────┤    │ 📅 Termin Datum (L.) │
              │ 🔑 Name (PRIMARY)  │    │ ☑️ Is Refund (Form.) │
              │ 🆔 ID (Auto)       │    │ ☑️ Is Advance (Form.)│
              │ 🏷️ Tip (Select)    │    │ ☑️ Is Paid (Form.)   │
              │   24h/2h/Feedback  │    │ ⏱️ Payment Delay (F.)│
              │ 📅 Datum slanja    │    │ 🤖 Note Summary (AI) │
              │ ✅ Status (Select) │    │ 🤖 Anomaly Detect(AI)│
              │   Zakazano/...     │    └──────────────────────┘
              │ 📅 Datum termina   │
              │    (Lookup)        │
              │ 🏷️ Status termina  │
              │    (Lookup)        │
              │ 🤖 Feedback        │
              │    sentiment (AI)  │
              └────────────────────┘
```

---

## 🔗 MAPA VEZA (RELATIONSHIPS)

### APPOINTMENTS je centralna tabela koja povezuje sve:

```
APPOINTMENTS
    ├─→ CLIENTS (Many-to-One)
    │   └─ 1 termin pripada 1 klijentu
    │   └─ 1 klijent može imati više termina
    │
    ├─→ SERVICES (Many-to-One)
    │   └─ 1 termin koristi 1 uslugu
    │   └─ 1 usluga može biti u više termina
    │
    ├─→ PAYMENTS (One-to-Many)
    │   └─ 1 termin može imati više plaćanja
    │   └─ 1 plaćanje pripada 1 terminu
    │
    ├─→ REMINDERS (One-to-Many)
    │   └─ 1 termin može imati više podsetnika
    │   └─ 1 podsetnik pripada 1 terminu
    │
    └─→ ANALYTICS (Many-to-Many)
        └─ Više termina mogu biti u analitici
        └─ 1 analytics record može imati više termina
```

---

## 📊 TOKOVI PODATAKA (DATA FLOW)

### 1. TOK ZAKAZIVANJA TERMINA:
```
┌─────────┐    ┌─────────────┐    ┌──────────┐
│ CLIENTS │───►│ APPOINTMENTS│◄───│ SERVICES │
└─────────┘    └──────┬──────┘    └──────────┘
                      │
                      ▼
               ┌──────────────┐
               │  REMINDERS   │ (Auto-create)
               │  • 24h       │
               │  • 2h        │
               └──────────────┘
```

### 2. TOK PLAĆANJA:
```
┌─────────────┐
│ APPOINTMENTS│
└──────┬──────┘
       │
       ▼
┌──────────────┐
│  PAYMENTS    │
│  • Avans     │──► Rollup ──► Appointments.Plaćeno
│  • Plaćanje  │                    │
│  • Povraćaj  │                    ▼
└──────────────┘            Formula: Preostalo
                                     │
                                     ▼
                            Formula: Status plaćanja
```

### 3. TOK ANALITIKE:
```
┌─────────────┐
│ APPOINTMENTS│
│  (All data) │
└──────┬──────┘
       │
       ▼
┌──────────────┐
│  ANALYTICS   │
│  • Mesečni   │
│  • KPI-evi   │──► AI ──► Business Insights
│  • Trendovi  │
└──────────────┘
```

---

## 🔄 ROLLUP I LOOKUP MAPA

### CLIENTS ← APPOINTMENTS:
```
Clients.Dugovanje           ← SUM(Appointments.Preostalo)
Clients.Poslednji termin    ← MAX(Appointments.Datum)
Clients.Broj termina        ← COUNT(Appointments.ID)
```

### APPOINTMENTS ← SERVICES:
```
Appointments.Cena           ← Lookup(Services.Cena)
Appointments.Trajanje       ← Lookup(Services.Trajanje)
Appointments.Usluga opis    ← Lookup(Services.Opis)
```

### APPOINTMENTS ← CLIENTS:
```
Appointments.Klijent email  ← Lookup(Clients.Email)
```

### APPOINTMENTS ← PAYMENTS:
```
Appointments.Plaćeno        ← SUM(Payments.Iznos)
```

### PAYMENTS ← APPOINTMENTS:
```
Payments.Klijent            ← Rollup(Appointments.Klijent)
Payments.Klijent Email      ← Lookup(Appointments → Clients.Email)
Payments.Klijent Telefon    ← Lookup(Appointments.Telefon)
Payments.Termin Datum       ← Lookup(Appointments.Datum)
```

### REMINDERS ← APPOINTMENTS:
```
Reminders.Datum termina     ← Lookup(Appointments.Datum)
Reminders.Status termina    ← Lookup(Appointments.Status)
```

### ANALYTICS ← APPOINTMENTS:
```
Analytics.Appointments      ← Link(Multiple)
Analytics.Total Revenue     ← SUM(Appointments.Cena)
Analytics.Appointments Count← COUNT(Appointments.ID)
```

---

## 🎯 KLJUČNA POLJA PO TIPU

### 🔑 PRIMARY FIELDS (Za identifikaciju zapisa):
```
Clients       → Ime
Appointments  → Telefon
Services      → Naziv
Payments      → Name
Analytics     → Najtraženija usluga
Reminders     → Name
```

### 🆔 AUTO NUMBER (Jedinstveni ID-evi):
```
Svaka tabela ima "ID" auto number polje
```

### 📅 DATE FIELDS (Datumi):
```
Appointments  → Datum, Kreiran, Ažuriran
Clients       → Poslednji termin (Rollup)
Payments      → Datum
Analytics     → Mesec
Reminders     → Datum slanja, Datum termina (Lookup)
```

### 💰 CURRENCY FIELDS (Valuте):
```
Services      → Cena
Appointments  → Cena (Rollup)
Payments      → Iznos
Analytics     → Ukupan prihod
```

### 🤖 AI FIELDS (10 ukupno):
```
Appointments  → 1x (Predlog akcije)
Services      → 2x (Sažetak, Unapređenje)
Payments      → 2x (Note Summary, Anomaly Detector)
Analytics     → 2x (Popular Category, Business Insights)
Reminders     → 1x (Feedback sentiment)
```

---

## 🎨 STATUS WORKFLOW DIJAGRAMI

### APPOINTMENTS STATUS FLOW:
```
    ┌─────────┐
    │ Zakazan │ (Initial)
    └────┬────┘
         │
    ┌────▼────┐
    │Potvrđen │
    └────┬────┘
         │
    ┌────▼────┐
    │Završen  │ (Final - Success)
    └─────────┘

         OR
         │
    ┌────▼────┐
    │Otkazan  │ (Final - Cancelled)
    └─────────┘
```

### PAYMENTS STATUS FLOW:
```
    ┌───────────┐
    │Na čekanju │ (Initial)
    └─────┬─────┘
          │
     ┌────▼────┐
     │Plaćeno  │ (Final - Success)
     └─────────┘

          OR
          │
     ┌────▼────┐
     │Otkazano │ (Final - Cancelled)
     └─────────┘
```

### REMINDERS STATUS FLOW:
```
    ┌─────────┐
    │Zakazano │ (Initial)
    └────┬────┘
         │
    ┌────▼────┐
    │Poslato  │ (Final - Success)
    └─────────┘

         OR
         │
    ┌────▼────┐
    │Otkazano │ (Final - Cancelled)
    └─────────┘
```

---

## 📈 KAKO RASTE BAZA (Lifecycle)

### DAN 1: Novi klijent zove
```
1. CLIENTS      → Kreiran novi zapis (Ime, Telefon, Email)
2. APPOINTMENTS → Kreiran termin (linkovan sa Client i Service)
3. REMINDERS    → Auto kreiran 24h reminder (opcionalno)
```

### DAN 2: 24h pre termina
```
1. REMINDERS    → Status: "Zakazano" → "Poslato"
                → SMS/Email sent to client
```

### DAN 3: 2h pre termina
```
1. REMINDERS    → Kreiran 2h reminder
                → Status: "Poslato"
```

### DAN 3: Klijent dolazi
```
1. APPOINTMENTS → Status: "Zakazan" → "Potvrđen"
```

### DAN 3: Klijent plaća avans
```
1. PAYMENTS     → Kreiran zapis (Tip: "Avans")
2. APPOINTMENTS → Plaćeno (rollup) se ažurira
                → Preostalo za platiti (formula) se računa
                → Status plaćanja: "Delimično plaćeno"
```

### DAN 3: Usluga završena
```
1. APPOINTMENTS → Status: "Završen"
```

### DAN 3: Klijent plaća ostatak
```
1. PAYMENTS     → Kreiran drugi zapis (Tip: "Plaćanje")
2. APPOINTMENTS → Plaćeno = puna suma
                → Preostalo = 0
                → Status plaćanja: "Plaćeno"
```

### DAN 4: Feedback request
```
1. REMINDERS    → Kreiran feedback reminder
                → Poslat email sa pitanjima
                → Feedback sentiment (AI) analizira odgovor
```

### Kraj meseca: Analitika
```
1. ANALYTICS    → Mesečni zapis kreiran
                → Link sa svim Appointments tog meseca
                → Rollup izračunava:
                  • Ukupan prihod
                  • Broj termina
                  • Novi vs povratni klijenti
                → AI generiše:
                  • Most Popular Category
                  • Business Insights
```

---

## 🔍 BRZA NAVIGACIJA

### Da vidiš sve termine jednog klijenta:
```
CLIENTS → Klikni na klijenta → Vidi "Istorija termina" field
```

### Da vidiš sva plaćanja jednog termina:
```
APPOINTMENTS → Klikni na termin → Vidi "Payments" field
```

### Da vidiš koja usluga je najpopularnija:
```
ANALYTICS → Vidi mesečne zapise → "Najtraženija usluga"
```

### Da vidiš klijente koji duguju:
```
CLIENTS → Grid view → Sort by "Dugovanje" (descending)
```

---

## ⚠️ KRITIČNE TAČKE

### ❌ Šta može da pođe po zlu:

1. **Obrisano polje koje koristi formula**
   - Rezultat: Formula postaje invalid
   - Primer: "Ukupno za platiti" u Appointments

2. **Rollup koji ne zna koje polje da sumira**
   - Rezultat: Rollup je invalid
   - Primer: "Advance Payments" u Analytics

3. **Cirkularne reference**
   - Trenutno: Nema problema ✅
   - Pazi: Ne pravi lookup koji referenciše sam sebe

4. **Previše AI polja**
   - Troši kredite
   - Sporo učitavanje
   - Trenutno: 10 AI polja (možda optimizovati)

---

**Kreirao:** Claude AI  
**Za:** MOKA Beauty Studio  
**Datum:** 2025-10-12

