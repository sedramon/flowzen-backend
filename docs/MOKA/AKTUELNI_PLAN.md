# 💄 MOKA Beauty Studio - AKTUELNI PLAN

> **Ažurirano:** 12. oktobar 2025  
> **Progres:** 55% ✅  
> **Sledeća faza:** Make.com Notifikacije

---

## 📊 TRENUTNI STATUS

```
███████████████████████░░░░░░░░░░░░░░░░░  55% KOMPLETNO

FAZA 1: Airtable+Notion ████████████████████ 100% ✅
FAZA 2: Voiceflow       ████████░░░░░░░░░░░░  40% ⚡
FAZA 3: Make.com        ░░░░░░░░░░░░░░░░░░░░   0% ⏸️
FAZA 4: Telegram        ░░░░░░░░░░░░░░░░░░░░   0% ⏸️
FAZA 5: Dokumentacija   ████████████████████ 100% ✅
```

---

## ✅ FAZA 1: AIRTABLE + NOTION (100% GOTOVO!)

### Urađeno ✅

**Airtable Baza:**
- [x] 6 tabela kreiran: Appointments, Services, Clients, Payments, Reminders, Analytics
- [x] 84+ polja sa validnim formulama
- [x] Rollup/Lookup/Formula polja
- [x] AI polja (10 ukupno)
- [x] Link polja između tabela
- [x] View-ovi (Grid, Calendar, Kanban)
- [x] Valuta унификована (€ EUR)
- [x] Jezik polja унификован (srpski)
- [x] Sistem plaćanja únifikovan (samo Payments tabela)

**Usluge u bazi (ažurirane cene):**
- [x] Šminkanje: 60€ (studio) / 90€ (adresa, min 3)
- [x] Puder obrve: 180€ (avans 60€)
- [x] Lash lift: 2,500 RSD
- [x] Brow lift: 2,500 RSD
- [x] Lash & Brow lift paket: 4,500 RSD
- [x] Kurs NSS: 120€

**Notion Dashboard:**
- [x] Dashboard kreiran
- [x] Airtable view-ovi embed-ovani
- [x] Pregled današnjih/sutrašnjih termina
- [x] Kalendar prikaz
- [x] Finansijski pregled

**API Setup:**
- [x] API token kreiran
- [x] Base ID: appqzwTXdTkG0qrc0
- [x] API testiran

**Izmene od originalnog plana:**
- ⚡ Polje "Avans" uklonjeno (sve preko Payments tabele)
- ⚡ Dodato 10+ dodatnih polja (rollup, lookup, AI)
- ⚡ Realne cene umesto placeholder-a
- ⚡ Valuta € EUR

---

## ⚡ FAZA 2: VOICEFLOW AGENT (40% U TOKU)

### Urađeno ✅

**MAXX Agent Setup:**
- [x] Voiceflow nalog kreiran
- [x] Agent kreiran: "MAXX Agent"
- [x] Knowledge Base popunjena (sve info o salonu)
- [x] Instructions konfigurisane

**API Integracije:**
- [x] Appointment Create API (direktno u Airtable)
- [x] Client Create API (direktno u Airtable)
- [x] List Records Integration (pretraga)

**Funkcionalnosti koje rade:**
- [x] Dodavanje termina (sa prikupljanjem svih podataka)
- [x] Kreiranje novih klijenata (sa provjerom postojanja)
- [x] Pronalaženje usluga
- [x] Povezivanje zapisa (record links)

**Izmene od originalnog plana:**
- ⚡ LLM Conversational Agent umesto Intent-based
- ⚡ Direct Airtable API umesto Make.com proxy
- ⚡ Manje ručnog podešavanja (entities, intents)

---

### Fali ❌

**Voiceflow funkcionalnosti koje treba dodati:**
- [ ] Provera dostupnosti termina (~2-3h)
- [ ] Pregled današnjih termina (~1-2h)
- [ ] Pregled sutrašnjih termina (~1-2h)
- [ ] Otkazivanje termina (~2-3h) + UPDATE API
- [ ] Izmena termina (~2-3h) + UPDATE API
- [ ] Pregled finansija (~2-3h)
- [ ] Unos plaćanja (~2-3h) + Payment CREATE API

**Procena:** 13-19 sati (~2-3 dana)

---

## ⏸️ FAZA 3: MAKE.COM AUTOMATIZACIJA (0% - Replanirana)

**Izmena od plana:**
- Originalno: Make.com kao API proxy za SVE
- Novo: Make.com SAMO za notifikacije i automatizacije

---

### Što treba uraditi:

**Kritično 🔥 (4-7 sati):**
- [ ] **Scenario 1:** Telegram notifikacija vlasniku kad se zakaže termin (1-2h)
- [ ] **Scenario 2:** 24h SMS podsetnik klijentu (2-3h)
- [ ] **Scenario 3:** 2h SMS podsetnik klijentu (1-2h)

**Opcionalno 📊 (2-4 sata):**
- [ ] Email potvrda klijentu nakon zakazivanja (1-2h)
- [ ] Feedback request 24h nakon termina (1-2h)
- [ ] Dnevni backup u Google Sheets (1h)

**Procena:** 4-11 sati (~1-2 dana)

---

## ⏸️ FAZA 4: TELEGRAM BOT (0% - Opcionalno)

**Status:** Nije započeto

**Pitanje:** Da li je potreban Telegram bot pored Voiceflow agenta?

**Ako DA:**
- [ ] Kreiranje bota preko @BotFather (0.5h)
- [ ] Integracija sa Voiceflow (2-3h)
- [ ] Osnovne komande (/add, /today, /tomorrow, /finances) (3-4h)
- [ ] Testiranje (2-3h)

**Procena:** 8-11 sati (~1-2 dana)

**Odluka:** TBD (zavisи od potrebe)

---

## ✅ FAZA 5: DOKUMENTACIJA (100% GOTOVO!)

### Urađeno ✅

**Airtable Dokumentacija (10 fajlova):**
- [x] README.md - Airtable vodič
- [x] INDEX.md - Navigacija
- [x] AIRTABLE_ANALIZA.md - Analiza strukture
- [x] AIRTABLE_CHEAT_SHEET.md - Brza referenca
- [x] DIJAGRAM_STRUKTURE.md - Vizuelni dijagrami
- [x] INSTRUKCIJE_POPRAVKA.md - Opšte popravke
- [x] PLACANJE_SISTEM_MIGRACIJA.md - Migracija plaćanja
- [x] QUICK_START.md - Brzi vodič
- [x] ZAVRSENO_IMPLEMENTACIJA.md - Status
- [x] airtable-schema.json - Raw schema

**Voiceflow Dokumentacija (8 fajlova):**
- [x] README.md - Voiceflow pregled
- [x] VOICEFLOW_SUMMARY.md - Brzi pregled
- [x] INDEX.md - Navigacija
- [x] Knowledge-Base/salon-info.md - Info o salonu
- [x] MAXX-Agent/instructions.md - Agent instrukcije
- [x] MAXX-Agent/agent-config.md - Tehnička konfiguracija
- [x] API-Tools/Appointment-Create-API.md
- [x] API-Tools/Client-Create-API.md
- [x] API-Tools/List-Records-Integration.md

**Root Dokumentacija (4 fajla):**
- [x] README.md - Glavni vodič
- [x] INDEX.md - Master index
- [x] NAVIGACIJA.md - Brza navigacija
- [x] FINALNI_PREGLED.md - Kompletan pregled
- [x] PLAN_VS_REALITY.md - Analiza plana
- [x] AKTUELNI_PLAN.md - Ovaj fajl

**Statistika:**
- ✅ 23 fajla
- ✅ 2,500+ linija dokumentacije
- ✅ Organizovano u foldere
- ✅ Svi linkovi ažurirani

---

## 📅 SLEDEĆI KORACI - PREPORUČENI PLAN

### Nedelja 1: Make.com Notifikacije (Prioritet 🔥)
**Cilj:** Automatske notifikacije za vlasnicu i klijente

**Dan 1: Setup + Telegram vlasniku** (2-3h)
- [ ] Kreiranje Make.com naloga
- [ ] Dodavanje Airtable integracije
- [ ] Kreiranje Scenario 1: Telegram notifikacija vlasniku
  - Trigger: Novi zapis u Appointments (Watch records)
  - Akcija: Telegram Send Message
  - Poruka: "✅ Novi termin: [Klijent] - [Datum] [Vreme] - [Usluga]"

**Dan 2: SMS Podsetnici** (3-4h)
- [ ] Dodavanje SMS providera (Twilio/Vonage)
- [ ] Scenario 2: 24h podsetnik
  - Trigger: Schedule (svaki dan u 10:00)
  - Filter: Datum = sutra, Status = Zakazan/Potvrđen
  - Akcija: SMS klijentu
- [ ] Scenario 3: 2h podsetnik
  - Trigger: Schedule (svaki sat)
  - Filter: Datum = danas, vreme za 2h
  - Akcija: SMS klijentu

**Dan 3: Testiranje** (1h)
- [ ] Test svih scenarija
- [ ] Provera da poruke stižu
- [ ] Fine-tuning

**Ukupno:** 6-8 sati

---

### Nedelja 2: Voiceflow - Proširenje funkcionalnosti (Prioritet ⚡)
**Cilj:** Dodati sve osnovne funkcije agenta

**Dan 4: Provera dostupnosti** (2-3h)
- [ ] Dodaj API tool za UPDATE (UPDATE API)
- [ ] Kreiraj logic za proveru zauzetih termina
- [ ] Implementiraj u agent instructions
- [ ] Test

**Dan 5: Pregled termina** (2-3h)
- [ ] Dodaj funkcionalnost "Današnji termini"
- [ ] Dodaj funkcionalnost "Sutrašnji termini"
- [ ] Formatiraj output
- [ ] Test

**Dan 6-7: Update i Cancel** (4-5h)
- [ ] Implementiraj UPDATE API tool u Voiceflow
- [ ] Dodaj funkcionalnost za otkazivanje
- [ ] Dodaj funkcionalnost za izmenu
- [ ] Test

**Dan 8: Finansije i Plaćanja** (3-4h)
- [ ] Dodaj funkcionalnost pregleda finansija
- [ ] Dodaj Payment CREATE API tool
- [ ] Implementiraj unos plaćanja kroz agenta
- [ ] Test

**Ukupno:** 11-15 sati

---

### Nedelja 3: Telegram Bot (Opcionalno - Ako je potreban)
**Cilj:** Alternativni interface za vlasnicu

**Dan 9-10: Setup i osnovne funkcije** (4-6h)
- [ ] Kreiranje bota (@BotFather)
- [ ] Integracija sa Voiceflow
- [ ] Osnovne komande (/add, /today, /tomorrow)

**Dan 11: Napredne funkcije i test** (4-5h)
- [ ] Dodatne komande (/availability, /finances, /cancel)
- [ ] Inline keyboards
- [ ] Kompletno testiranje

**Ukupno:** 8-11 sati

**Odluka:** ❓ TBD - Da li je potreban?

---

## 📋 DETALJAN TO-DO LISTA

### 🔥 Prioritet 1: Make.com Notifikacije (Sledeće!)

#### Scenario 1: Potvrda termina vlasniku via Telegram
```yaml
Trigger: Airtable Watch Records (Appointments table)
Condition: Novi zapis kreiran
Akcija: 
  - Telegram Bot: Send Message
  - Chat ID: [ID vlasnice]
  - Message: |
      ✅ NOVI TERMIN ZAKAZAN
      
      👤 Klijent: {Klijent}
      📞 Telefon: {Telefon}
      📅 Datum: {Datum}
      ⏰ Vreme: {Vreme}
      💆 Usluga: {Usluga}
      💰 Cena: {Cena}€
      📝 Napomena: {Napomena}
```

#### Scenario 2: 24h SMS Podsetnik klijentu
```yaml
Trigger: Schedule (Every day at 10:00)
Akcija:
  1. Airtable: Search Records
     - Table: Appointments
     - Filter: Datum = TOMORROW(), Status IN [Zakazan, Potvrđen]
  
  2. Iterator: Za svaki zapis
  
  3. SMS Send (Twilio/Vonage)
     - To: {Telefon}
     - Message: |
         Poštovani/a {Klijent},
         
         Podsetnik: Imate termin sutra {Datum} u {Vreme} 
         u MOKA Beauty Studio.
         
         Adresa: Bulevar Zorana Đindića 72, Beograd
         
         Vidimo se! 💄
```

#### Scenario 3: 2h SMS Podsetnik klijentu
```yaml
Trigger: Schedule (Every hour)
Akcija:
  1. Set Variable: current_time_plus_2h
  
  2. Airtable: Search Records
     - Table: Appointments
     - Filter: Datum = TODAY(), Vreme = current_time_plus_2h, 
               Status IN [Zakazan, Potvrđen]
  
  3. Iterator: Za svaki zapis
  
  4. SMS Send
     - To: {Telefon}
     - Message: |
         Podsetnik: Vaš termin u MOKA Beauty Studio je za 2h ({Vreme}).
         Vidimo se! 💄
```

---

### ⚡ Prioritet 2: Voiceflow - Dodatne funkcije

#### 1. Provera dostupnosti (2-3h)

**API Tool:** Airtable List Records + Logic

**Implementation:**
```
Agent instructions dodaj:

"Kada vlasnik pita za dostupnost:
1. Traži datum
2. Pozovi List Records API za Appointments
3. Filter: Datum = [datum], Status ≠ Otkazan
4. Izvuci sva zauzeta vremena
5. Izračunaj slobodna vremena (08:00-20:00 minus zauzeta)
6. Prikaži vlasniku listu slobodnih termina"
```

---

#### 2. Pregled današnjih/sutrašnjih termina (2-3h)

**API Tool:** Airtable List Records

**Implementation:**
```
Agent instructions dodaj:

"Kada vlasnik kaže 'Koji su termini danas/sutra':
1. Pozovi List Records API
2. Filter: Datum = TODAY() ili TOMORROW()
3. Sort: po Vreme (ascending)
4. Formatiraj output:
   '📅 Današnji termini:
    09:00 - Marija Jovanović - Šminkanje
    14:00 - Ana Petrović - Puder obrve
    18:00 - Jovana Marković - Lash lift'"
```

---

#### 3. Otkazivanje termina (2-3h)

**Novi API Tool:** Airtable UPDATE Record

**Implementation:**
```
1. Kreiraj UPDATE API tool u Voiceflow
2. Agent instructions:
   "Kada vlasnik želi da otkaže termin:
   a. Traži identifikaciju (klijent + datum)
   b. Pozovi List Records da pronađeš termin
   c. Potvrdi sa vlasnikom
   d. Pozovi UPDATE API
   e. Postavi Status = 'Otkazan'
   f. Potvrdi vlasniku"
```

---

#### 4. Izmena termina (2-3h)

**API Tool:** Airtable UPDATE Record (isti kao #3)

**Implementation:**
```
Agent instructions:
"Kada vlasnik želi da izmeni termin:
1. Pronađi termin (List Records)
2. Pitaj šta se menja (datum/vreme/usluga)
3. Pozovi UPDATE API sa novim vrednostima
4. Potvrdi vlasniku"
```

---

#### 5. Pregled finansija (2-3h)

**API Tool:** Airtable List Records + Aggregation

**Implementation:**
```
Agent instructions:
"Kada vlasnik pita za finansije:
1. Traži period (danas/ova nedelja/ovaj mesec/custom)
2. Pozovi List Records
3. Filter: Datum u periodu, Status = Završen
4. Sumiraj Cena polja
5. Brojši termine
6. Prikaži:
   '💰 Prihod za [period]:
    Ukupno: [suma]€
    Broj termina: [broj]
    Prosek po terminu: [prosek]€'"
```

---

#### 6. Unos plaćanja (2-3h)

**Novi API Tool:** Payment CREATE API

**Implementation:**
```
1. Kreiraj Payment CREATE API tool
2. Agent instructions:
   "Kada vlasnik unosi plaćanje:
   a. Traži: termin (klijent+datum), iznos, tip (Avans/Plaćanje)
   b. Pronađi termin (List Records)
   c. Pozovi Payment CREATE API:
      - Naziv: 'Avans - [Klijent] - [Datum]'
      - Iznos: [iznos]
      - Datum: TODAY()
      - Tip: [Avans/Plaćanje/Povraćaj]
      - Status: 'Plaćeno'
      - Termin: [record_id_termina]
   d. Prikaži vlasniku novo stanje:
      'Plaćeno: [ukupno]€, Preostalo: [preostalo]€'"
```

---

## ⏸️ FAZA 4: TELEGRAM BOT (Opcionalno)

Odluka potrebna: Da li implementirati?

**Prednosti:**
- Brži pristup (Telegram app)
- Push notifikacije
- Inline keyboards za brze akcije

**Mane:**
- Dodatno vreme razvoja (8-11h)
- Još jedan tool za održavanje
- Voiceflow već radi slično

**Preporuka:** Implementirati posle Faze 2 i 3 ako bude potrebno.

---

## 📊 VREMENSKA PROCENA DO KRAJA

### Minimum Viable Product (MVP):
```
Make.com notifikacije:        4-7h
Voiceflow - dostupnost:       2-3h
Voiceflow - pregled termina:  2-3h
----------------------------------
UKUPNO MVP:                   8-13h (~2 dana)
```

**Nakon ovoga:** Sistem je 75% funkcionalan i upotrebljiv!

---

### Production Ready:
```
MVP (gore):                    8-13h
Voiceflow - update/cancel:     4-6h
Voiceflow - finansije:         2-3h
Voiceflow - unos plaćanja:     2-3h
Make.com - dodatne automat.:   2-4h
----------------------------------
UKUPNO PRODUCTION:            18-29h (~3-4 dana)
```

**Nakon ovoga:** Sistem je 95% kompletiran!

---

### Full Package (sa Telegram):
```
Production (gore):            18-29h
Telegram Bot:                  8-11h
----------------------------------
UKUPNO FULL:                  26-40h (~5-6 dana)
```

**Nakon ovoga:** Sistem je 100% kako je planiran!

---

## 🎯 PREPORUČENI PLAN AKCIJE

### FAZA A: Make.com Notifikacije (PRVO!)
**Prioritet:** 🔥🔥🔥 Kritično  
**Vreme:** 4-7 sati (~1 dan)  
**Razlog:** Najvažnije za poslovanje, instant feedback

1. Telegram notifikacija vlasniku
2. 24h SMS podsetnik
3. 2h SMS podsetnik

---

### FAZA B: Voiceflow Osnovno (DRUGO!)
**Prioritet:** 🔥🔥 Vrlo važno  
**Vreme:** 6-9 sati (~1-2 dana)  
**Razlog:** Osnovne funkcije koje će se često koristiti

1. Provera dostupnosti
2. Pregled današnjih termina
3. Pregled sutrašnjih termina

---

### FAZA C: Voiceflow Napred no (TREĆE!)
**Prioritet:** 🔥 Važno  
**Vreme:** 8-12 sati (~2 dana)  
**Razlog:** Kompletna funkcionalnost

1. UPDATE API tool
2. Otkazivanje termina
3. Izmena termina
4. Pregled finansija
5. Unos plaćanja

---

### FAZA D: Telegram Bot (OPCIONO!)
**Prioritet:** 📊 Nizak (nice-to-have)  
**Vreme:** 8-11 sati (~2 dana)  
**Razlog:** Alternativni interface

1. Kreiranje bota
2. Integracija
3. Komande

---

## 📋 TRENUTNO STANJE - Checklist

### Airtable ✅
- [x] Base kreiran i konfigurisan
- [x] Svih 6 tabela sa svim poljima
- [x] Svi problemi rešeni
- [x] Valuta i jezik унификовani
- [x] API pristup konfigurisan

### Notion ✅
- [x] Dashboard kreiran
- [x] View-ovi embed-ovani
- [x] Funkcionalan za vlasnicu

### Voiceflow ⚡
- [x] Agent kreiran (MAXX Agent)
- [x] Knowledge Base
- [x] Instructions
- [x] API integracije (3 tool-a)
- [x] Dodavanje termina - radi
- [x] Kreiranje klijenata - radi
- [ ] Provera dostupnosti - **FALI**
- [ ] Pregled termina - **FALI**
- [ ] Update/Cancel - **FALI**
- [ ] Finansije - **FALI**
- [ ] Unos plaćanja - **FALI**

### Make.com ⏸️
- [ ] Nalog - **FALI**
- [ ] Telegram notifikacije - **FALI**
- [ ] SMS podsetnici - **FALI**
- [ ] Email - **OPCIONALNO**

### Telegram Bot ⏸️
- [ ] Bot kreiran - **FALI**
- [ ] Komande - **FALI**
- [ ] Integracija - **FALI**

### Dokumentacija ✅
- [x] Kompletna i ažurirana!

---

## 📞 ODLUKE POTREBNE

1. **Telegram Bot - Da ili Ne?**
   - Trenutno: Nije potreban za MVP
   - Kasnije: Može se dodati

2. **Koje SMS provider?**
   - Twilio (popularan, dobar API)
   - Vonage (ex-Nexmo)
   - Infobip (popularan u regionu)

3. **Email notifikacije - Da ili Ne?**
   - Opciono - za profesionalniji izgled
   - Može se dodati kasnije

---

## 🎯 PRIORITIZACIJA

**Sledeća 2 dana:**
- 🔥 Make.com notifikacije (MVP funkcionalnost)

**Sledeća 1 nedelja:**
- 🔥 Voiceflow proširenje (kompletna funkcionalnost)

**Sledeće 2 nedelje (opcionalno):**
- 📊 Telegram bot (ako je potreban)

---

**Kreirao:** Claude Sonnet 4.5  
**Poslednje ažuriranje:** 12. oktobar 2025  
**Verzija:** 2.2 (Aktuelni status)

