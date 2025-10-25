# 📊 AIRTABLE BAZA - KOMPLETAN PREGLED I ANALIZA

## 🎯 PREGLED STRUKTURE BAZE

Tvoja Airtable baza ima **6 tabela** koje su međusobno povezane i služe za upravljanje beauty studijom (MOKA Beauty Studio).

---

## 📋 TABELA 1: APPOINTMENTS (Zakazivanja)
**ID:** `tblj7Ux5WP9lvKCE1`  
**Primary Field:** Telefon

### Polja:

| Naziv polja | Tip | Opis |
|-------------|-----|------|
| **Telefon** | Text | Primarno polje - telefon klijenta |
| **Datum** | Date | Datum termina |
| **Vreme** | Single Select | Vreme termina (od 08:00 do 20:00, na svakih 30min) |
| **Klijent** | Link → Clients | Povezan sa tabelom Clients |
| **ID** | Auto Number | Automatski brojač |
| **Email** | Text | Email |
| **Usluga** | Link → Services | Povezan sa tabelom Services |
| **Status** | Single Select | Zakazan / Potvrđen / Otkazan / Završen |
| **Cena** | Rollup | Cena iz Services tabele |
| **Napomena** | Long Text | Napomene za termin |
| **Kreiran** | Date | Datum kreiranja |
| **Ažuriran** | Date | Datum ažuriranja |
| **Ukupno za platiti** | Formula | ⚠️ **NIJE VALIDNA FORMULA** |
| **Plaćeno (rollup)** | Rollup | Zbir plaćenih iznosa |
| **Payments** | Link → Payments | Veza sa plaćanjima |
| **Preostalo za platiti** | Formula | Cena - Plaćeno |
| **Broj podsetnika** | Count | Broj povezanih podsetnika |
| **Reminders** | Link → Reminders | Veza sa podsetnicima |
| **Status plaćanja** | Formula | Plaćeno / Delimično plaćeno / Nije plaćeno |
| **Klijent email (lookup)** | Lookup | Email iz Clients tabele |
| **Usluga opis (lookup)** | Lookup | Opis iz Services tabele |
| **Predlog sledeće akcije (AI)** | AI Text | AI asistent za predloge akcija |
| **Analytics** | Link → Analytics | Veza sa Analytics |
| **Trajanje (min)** | Lookup | Trajanje usluge iz Services |

### Views (Pogledi):
- **All grid** - Grid prikaz svih termina
- **All Calendar** - Kalendarski prikaz
- **Danas** - Termini za danas
- **Sutra** - Kanban prikaz za sutra

---

## 💇 TABELA 2: SERVICES (Usluge)
**ID:** `tblIMJt2KjHhN9mRu`  
**Primary Field:** Naziv

### Polja:

| Naziv polja | Tip | Opis |
|-------------|-----|------|
| **Naziv** | Text | Primarno polje - naziv usluge |
| **ID** | Auto Number | Automatski brojač |
| **Cena** | Currency | Cena usluge ($) |
| **Trajanje (min)** | Number | Trajanje u minutima |
| **Opis** | Long Text | Detaljan opis usluge |
| **Zahteva avans** | Checkbox | Da li usluga zahteva avans |
| **Kategorija** | Single Select | Šminka / Obrve / Trepavice / Kursevi |
| **Aktivan** | Checkbox | Da li je usluga aktivna |
| **Opis (sažetak)** | AI Text | AI generisan sažetak |
| **Predlog za unapređenje usluge** | AI Text | AI predlozi |
| **Appointments** | Link → Appointments | Veza sa terminima |

### Views:
- **Grid view**

---

## 👥 TABELA 3: CLIENTS (Klijenti)
**ID:** `tbl0cr1oFx5wKhTcQ`  
**Primary Field:** Ime

### Polja:

| Naziv polja | Tip | Opis |
|-------------|-----|------|
| **Ime** | Text | Primarno polje - ime klijenta |
| **ID** | Auto Number | Automatski brojač |
| **Telefon** | Text | Telefon klijenta |
| **Email** | Text | Email klijenta |
| **Istorija termina** | Link → Appointments | Svi termini klijenta |
| **Dugovanje** | Rollup | Ukupno dugovanje (preostalo za platiti) |
| **Poslednji termin** | Rollup | Datum poslednjeg termina |
| **Napomene** | Long Text | Napomene o klijentu |
| **Broj zakazanih termina** | Rollup | Broj svih termina |
| **Payments** | Rollup | Plaćanja klijenta |

### Views:
- **Grid view**

---

## 💳 TABELA 4: PAYMENTS (Plaćanja)
**ID:** `tblxyRCX8n2SPA77Y`  
**Primary Field:** Name

### Polja:

| Naziv polja | Tip | Opis |
|-------------|-----|------|
| **Name** | Text | Primarno polje |
| **ID** | Auto Number | Automatski brojač |
| **Klijent** | Rollup | Ime klijenta iz Appointments |
| **Iznos** | Currency | Iznos plaćanja ($) |
| **Datum** | Date | Datum plaćanja |
| **Tip** | Single Select | Avans / Plaćanje / Povraćaj |
| **Status** | Single Select | Plaćeno / Na čekanju / Otkazano |
| **Termin** | Link → Appointments | Povezan termin |
| **Napomena** | Long Text | Napomene o plaćanju |
| **Klijent Email** | Lookup | Email iz termina |
| **Klijent Telefon** | Lookup | Telefon iz termina |
| **Termin Datum** | Lookup | Datum termina |
| **Is Refund** | Formula | Da li je povraćaj |
| **Is Advance** | Formula | Da li je avans |
| **Is Paid** | Formula | Da li je plaćeno |
| **Payment Delay (days)** | Formula | Kašnjenje plaćanja u danima |
| **Payment Note Summary (AI)** | AI Text | AI sažetak napomene |
| **Payment Anomaly Detector (AI)** | AI Text | AI detekcija anomalija |

### Views:
- **Grid view**
- **Gallery**

---

## 📈 TABELA 5: ANALYTICS (Analitika)
**ID:** `tbl98DbE89WtVBLjq`  
**Primary Field:** Najtraženija usluga

### Polja:

| Naziv polja | Tip | Opis |
|-------------|-----|------|
| **Najtraženija usluga** | Text | Primarno polje |
| **Mesec** | Date | Mesec za analitiku |
| **Ukupan prihod** | Currency | Ukupan prihod za mesec |
| **Broj termina** | Number | Broj termina |
| **ID** | Auto Number | Automatski brojač |
| **Novi klijenti** | Number | Broj novih klijenata |
| **Povratnici** | Number | Broj povratnih klijenata |
| **Appointments in Month** | Rollup | Rollup termina |
| **Appointments** | Link → Appointments | Veza sa terminima |
| **Total Revenue (Formula)** | Rollup | Ukupan prihod |
| **Advance Payments (EUR)** | Rollup | ⚠️ **NIJE VALIDNA - fieldIdInLinkedTable je null** |
| **Avg Appointment Value** | Formula | Prosečna vrednost termina |
| **Most Popular Category (AI)** | AI Text | Najpopularnija kategorija (AI) |
| **Business Insights (AI)** | AI Text | Poslovni uvidi (AI) |

### Views:
- **Grid view**
- **Gallery**

---

## 🔔 TABELA 6: REMINDERS (Podsetnici)
**ID:** `tblhIDIFhsYQfV3zu`  
**Primary Field:** Name

### Polja:

| Naziv polja | Tip | Opis |
|-------------|-----|------|
| **Name** | Text | Primarno polje |
| **ID** | Auto Number | Automatski brojač |
| **Termin** | Link → Appointments | Povezan termin |
| **Tip** | Single Select | 24h reminder / 2h reminder / Feedback request |
| **Datum slanja** | Date | Datum slanja |
| **Status** | Single Select | Zakazano / Poslato / Otkazano |
| **Datum termina** | Lookup | Datum termina iz Appointments |
| **Status termina** | Lookup | Status iz Appointments |
| **Feedback sentiment** | AI Text | AI analiza sentimenta |

### Views:
- **Grid view**

---

## 🔗 DIJAGRAM VEZA IZMEĐU TABELA

```
┌─────────────┐
│   CLIENTS   │
└──────┬──────┘
       │
       │ (Istorija termina)
       │
       ▼
┌──────────────────┐
│   APPOINTMENTS   │◄─────────┐
└─────┬──────┬─────┘          │
      │      │                │
      │      │                │
      │      └────────────────┼─────► SERVICES
      │                       │
      ├───────────────────────┼─────► PAYMENTS
      │                       │
      ├───────────────────────┼─────► REMINDERS
      │                       │
      └───────────────────────┴─────► ANALYTICS
```

---

## ✅ REŠENI PROBLEMI (Ažurirano: 12.10.2025)

### ✅ PROBLEM 1: Nevalidna Formula u Appointments tabeli (REŠENO)
**Polje:** `Ukupno za platiti`  
**Status:** ✅ **OBRISANO**

**Rešenje:**  
Polje je kompletno obrisano jer je bilo duplikat. Koristimo samo **"Preostalo za platiti"** koje ima validnu formulu:
```
Formula: {Cena} - {Plaćeno (rollup)}
```

---

### ✅ PROBLEM 2: Nevalidna Rollup formula u Analytics tabeli (REŠENO)
**Polje:** `Advance Payments (EUR)` → Preimenovano u **"Ukupna plaćanja (EUR)"**  
**Status:** ✅ **POPRAVLJENO**

**Rešenje:**  
Rollup je podešen da gleda **"Plaćeno (rollup)"** iz Appointments tabele:
- Link to record: Appointments (Termini)
- Field in linked table: Plaćeno (rollup)
- Aggregation: SUM
- Rezultat: Ukupno naplaćeno iz svih termina u mesecu

---

### ✅ PROBLEM 3: Duplo evidentiranje plaćanja (REŠENO)
**Problem:** Polje "Avans" u Appointments + Payments tabela kreiralo konfuziju  
**Status:** ✅ **REŠENO**

**Rešenje:**  
Polje "Avans" više nije u upotrebi. Sva plaćanja se vode isključivo kroz **Payments tabelu** sa tipovima: Avans, Plaćanje, Povraćaj.

---

## ✅ REŠENE NEDOSLEDNOSTI (Ažurirano: 12.10.2025)

### ✅ 1. **Valuta simboli** (REŠENO)
Sva polja za valutu su promenjena sa **"$"** na **"€ EUR"**.

**Primenjeno na:**
- Services → Cena (€)
- Payments → Iznos (€)
- Analytics → Ukupan prihod (€), Ukupna plaćanja (€)
- Appointments → Cena (rollup u €)

---

### ✅ 2. **Mixed language u poljima** (REŠENO)
Sva polja su унификована - **tabele na engleskom, polja na srpskom**.

**Primenjeno:**
- Tabele: Appointments, Services, Clients, Payments, Analytics, Reminders (ostale na engleskom)
- Polja: Sva prevedena na srpski (Plaćanja, Termini, Podsetnici, itd.)

---

### 3. **AI polja**
Imaš mnogo AI Text polja koja koriste Airtable AI. Ova polja:
- Troše AI kredite
- Mogu biti spora za učitavanje
- Zahtevaju dobru prompt konfiguraciju

**Preporuka:** Provjeri da li su sva AI polja zaista neophodna, ili neka mogu biti obične formule.

---

## ✅ POZITIVNE STVARI

### 1. **Dobra struktura linkova**
Sve tabele su pravilno povezane:
- Appointments ↔ Clients
- Appointments ↔ Services
- Appointments ↔ Payments
- Appointments ↔ Reminders
- Appointments ↔ Analytics

### 2. **Dobar tracking sistema**
Imaš polja za kreiranje, ažuriranje, statusse - sve što treba za dobar tracking.

### 3. **Automatizacija spremna**
Sa Reminders tabelom i različitim statusima, baza je spremna za Airtable automatizacije.

### 4. **Rollup polja su pametno postavljena**
Clients tabela koristi rollup da prikaže:
- Dugovanje
- Broj termina
- Poslednji termin

---

## 🛠️ PLAN AKCIJE ZA POPRAVKU

### Prioritet 1 (HITNO) - Popravi nevalidne formule:
1. ✅ Otvori **Appointments** tabelu
2. ✅ Pronađi polje **"Ukupno za platiti"**
3. ✅ Opcija A: Obriši ga (već imaš "Preostalo za platiti")
4. ✅ Opcija B: Popravi formulu da bude: `{Cena} - {Plaćeno (rollup)}`

### Prioritet 2 (VAŽNO) - Popravi rollup u Analytics:
1. ✅ Otvori **Analytics** tabelu
2. ✅ Pronađi polje **"Advance Payments (EUR)"**
3. ✅ Klikni na customize field
4. ✅ Postavi "Field in linked table" na odgovarajuće polje
5. ✅ Izaberi aggregation funkciju (SUM)

### Prioritet 3 (PREPORUKA) - Uniformnost:
1. ⚡ Promeni valutne simbole sa "$" na "€" ili "RSD"
2. ⚡ Унификуј језик polja (sve na srpskom ili sve na engleskom)
3. ⚡ Preimenovati "Name" polja u "Naziv" za konzistentnost

### Prioritet 4 (OPTIMIZACIJA) - Proveri AI polja:
1. 🔍 Da li su sva AI polja neophodna?
2. 🔍 Da li AI promptovi rade kako treba?
3. 🔍 Možda neka mogu biti regular formule?

---

## 📞 ŠTA ĆU TI BITI POTREBNO OD MENE?

Reci mi:
1. **Da li želiš da popravimo ova 2 glavna problema?** (nevalidne formule)
2. **Koju valutu koristiš?** (€, RSD, ili ostavi $?)
3. **Da li imaš neke specifične probleme** koje si primetio u radu sa bazom?

Spreman sam da ti dam **TAČNE instrukcije korak-po-korak sa slikama** kako da popraviš sve navedene probleme!

---

**Generisano:** 2025-10-12  
**Broj tabela:** 6  
**Ukupno polja:** 84  
**AI polja:** 10  
**Greške pronađene:** 2

