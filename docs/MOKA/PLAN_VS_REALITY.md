# 📊 PLAN VS REALNOST - Status Implementacije

> **Originalni plan:** 25 dana, 5 faza  
> **Trenutni status:** 12. oktobar 2025  
> **Ažurirano:** Danas  

---

## 🎯 BRZI PREGLED

| Faza | Status | Napomena |
|------|--------|----------|
| **FAZA 1:** Airtable + Notion Setup | ✅ 100% | Kompletno urađeno! |
| **FAZA 2:** Voiceflow Agent | ⚡ 40% | Osnovne funkcije rade |
| **FAZA 3:** Make.com | ⏸️ 0% | Planirano samo za notifikacije |
| **FAZA 4:** Telegram Bot | ❌ 0% | Nije započeto |
| **FAZA 5:** Dokumentacija | ✅ 100% | Kompletno urađeno! |

**Ukupan progres:** ~55% implementacije

---

## ✅ FAZA 1: AIRTABLE SETUP (90% - Sa izmenama)

### Urađeno ✅

#### DAN 1: Airtable Setup
- ✅ Nalog kreiran
- ✅ Base kreiran
- ✅ Appointments tabela kreirana
- ⚡ **IZMENA:** Struktura promenjena:
  - Telefon je PRIMARY field (umesto ID)
  - Polje "Avans" je **UKLONJENO** (duplo evidentiranje problema)
  - Dodato 10+ dodatnih polja (rollup, lookup, AI)

#### DAN 2: Ostale tabele
- ✅ Clients tabela kreirana
- ✅ Payments tabela kreirana (sa povezivanjem!)
- ✅ Reminders tabela kreirana
- ✅ Analytics tabela kreirana
- ✅ Services tabela kreirana

#### DAN 3: API Setup
- ✅ API token kreiran
- ✅ Base ID dobijen (`appqzwTXdTkG0qrc0`)
- ✅ API testiran (preko Voiceflow-a)

#### DAN 4-5: Notion
- ✅ **URAĐENO**
- ✅ Notion dashboard kreiran
- ✅ Embed Airtable view-ova za organizaciju
- **Svrha:** Lakši pregled za vlasnika bez ulaska u Airtable app

### Izmene od plana:

| Plan | Realnost | Razlog |
|------|----------|--------|
| Polje "Avans" u Appointments | ❌ Uklonjeno | Duplo evidentiranje - sve preko Payments |
| Currency sa EUR | € EUR simbolom | Implementirano kako treba |
| Notion dashboard | ✅ Implementiran | Za lakši pregled vlasnika |
| AI polja | ✅ 10 AI polja dodato | Airtable AI features |

### Dodatno urađeno (nije bilo u planu):
- ✅ Rollup polja za automatske kalkulacije
- ✅ Lookup polja za cross-table reference
- ✅ Formula polja (Status plaćanja, Kašnjenje, itd.)
- ✅ AI polja (10 ukupno)
- ✅ View-ovi (Calendar, Kanban, Grid)
- ✅ Унификација jezika (sve na srpskom)

**Status FAZE 1:** ✅ **100% GOTOVO!**

---

## ⚡ FAZA 2: VOICEFLOW AGENT (40% - Sa velikim izmenama)

### Urađeno ✅

#### DAN 6: Setup
- ✅ Voiceflow nalog kreiran
- ✅ Agent kreiran: "MAXX Agent"
- ✅ Osnovni canvas

#### DAN 7-12: Agent Development
- ⚡ **VELIKA IZMENA:** Umesto Intent-based, koristi se **LLM Agent** (konverzacioni)
- ✅ Knowledge Base napravljena
- ✅ Instructions konfigurisane
- ✅ Custom API tools integrisani

### Izmene od plana:

| Plan | Realnost | Razlog |
|------|----------|--------|
| Intent-based agent | ✅ LLM Conversational Agent | Moderna praksa, prirodniji flow |
| Manual intents i entities | ❌ Nije potrebno | LLM automatski razume |
| Make.com webhook za API | ✅ Direct Airtable API | Brže, jednostavnije |
| Canvas sa flow blocks | ✅ Agent sa tools | Moćniji pristup |

### Urađeno umesto plana:

| Funkcionalnost | Status | Napomena |
|----------------|--------|----------|
| **Add Appointment** | ✅ Radi | Direct API, ne preko Make.com |
| **Create Client** | ✅ Radi | Direct API |
| **List Records** | ✅ Radi | Pretraga klijenata/usluga |
| Check Availability | ❌ Nije | **FALI** |
| Get Today Appointments | ❌ Nije | **FALI** |
| Get Finances | ❌ Nije | **FALI** |
| Update Appointment | ❌ Nije | **FALI** |
| Cancel Appointment | ❌ Nije | **FALI** |
| Get Client Info | ⚡ Djelimično | Može kroz List Records |

**Status FAZE 2:** ⚡ **40% GOTOVO**

---

## ⏸️ FAZA 3: MAKE.COM AUTOMATIZACIJA (0% - Replaniranje)

### Originalni plan:
- Svi API pozivi kroz Make.com webhook
- 5+ scenarija za različite funkcije
- Povezivanje Voiceflow → Make.com → Airtable

### Nova realnost:
- ✅ Voiceflow direktno poziva Airtable API (brže, jednostavnije)
- ⚡ Make.com **POTREBAN SAMO ZA**:
  - Automatske notifikacije (SMS/Email)
  - Podsetnici (24h, 2h)
  - Backup automatizacije

### Šta treba uraditi:

| Scenario | Prioritet | Status |
|----------|-----------|--------|
| **Dnevni podsetnici** | 🔥 Visok | ❌ Nije |
| **SMS/Email notifikacije** | 🔥 Visok | ❌ Nije |
| **Feedback request** | ⚡ Srednji | ❌ Nije |
| **Backup automatizacija** | 📊 Nizak | ❌ Nije |
| ~~API proxy~~ | - | ❌ Nije potrebno |

**Status FAZE 3:** ⏸️ **0% GOTOVO** (ali plan je promenjen)

---

## ❌ FAZA 4: TELEGRAM BOT (0% - Nije započeto)

### Originalni plan:
- Telegram bot kao interfejs za vlasnika
- Komande za sve operacije
- Povezivanje sa Voiceflow

### Trenutni status:
- ❌ Bot nije kreiran
- ❌ Komande nisu konfigurisane
- ❌ Integracija sa Voiceflow nije

### Da li je potrebno?

**Opcija A:** Koristiti Telegram kao glavni interface  
**Opcija B:** Koristiti Voiceflow direktno (web/app)  
**Opcija C:** Oboje (Telegram + Web)

**Odluka:** TBD (treba da odlučiš)

**Status FAZE 4:** ❌ **0% GOTOVO**

---

## ✅ FAZA 5: DOKUMENTACIJA (100% - Gotova!)

### Urađeno ✅

- ✅ Tehnička dokumentacija (17+ fajlova!)
- ✅ Airtable dokumentacija kompletna
- ✅ Voiceflow dokumentacija kompletna
- ✅ API dokumentacija
- ✅ Troubleshooting vodiči
- ✅ Korak-po-korak instrukcije
- ✅ Dijagrami i visualizacije
- ✅ Cheat sheets i quick reference

### Dodatno urađeno:
- ✅ Reorganizacija u foldere (Airtable/, Voiceflow/)
- ✅ INDEX fajlovi za navigaciju
- ✅ FINALNI_PREGLED sa statistikom
- ✅ Changelog sa svim verzijama

**Status FAZE 5:** ✅ **100% GOTOVO!**

---

## 📊 UKUPAN PROGRES

```
███████████████████████░░░░░░░░░░░░░░░░░  55% UKUPNO

FAZA 1: Airtable+Notion████████████████████ 100%
FAZA 2: Voiceflow      ████████░░░░░░░░░░░░  40%
FAZA 3: Make.com       ░░░░░░░░░░░░░░░░░░░░   0%
FAZA 4: Telegram       ░░░░░░░░░░░░░░░░░░░░   0%
FAZA 5: Dokumentacija  ████████████████████ 100%
```

---

## 🎯 ŠTA JE URAĐENO (Detaljna lista)

### Airtable Baza:
- ✅ 6 tabela kreiran i konfigurisanih
- ✅ 84+ polja sa validnim formulama
- ✅ Rollup polja za automatske kalkulacije
- ✅ Link polja između tabela
- ✅ AI polja (10 ukupno)
- ✅ View-ovi (Grid, Calendar, Kanban)
- ✅ Valuta унификована (€ EUR)
- ✅ Jezik polja унификован (srpski)
- ✅ Sistem plaćanja únificiran (samo Payments)
- ✅ API token i Base ID konfigurisani

### Notion Dashboard:
- ✅ Dashboard kreiran
- ✅ Airtable view-ovi embed-ovani
- ✅ Organizacija i lakši pregled za vlasnika
- ✅ Pregled termina (Danas, Sutra, Kalendar)
- ✅ Finansijski pregled

### Voiceflow Agent (MAXX):
- ✅ Agent kreiran i konfigurisan
- ✅ Knowledge Base popunjena
- ✅ Instructions napisane
- ✅ API integracije:
  - ✅ Appointment Create API
  - ✅ Client Create API
  - ✅ List Records Integration
- ✅ Testiran i funkcionalan za:
  - ✅ Dodavanje termina
  - ✅ Kreiranje klijenata
  - ✅ Pretraga zapisa

### Dokumentacija:
- ✅ 21 markdown fajl
- ✅ 2,500+ linija dokumentacije
- ✅ Reorganizovano u foldere
- ✅ Kompletni vodiči i reference

---

## ❌ ŠTA FALI (To-Do Lista)

### Voiceflow Agent - Dodatne funkcionalnosti:

| Funkcionalnost | Prioritet | Status |
|----------------|-----------|--------|
| **Provera dostupnosti** | 🔥 Visok | ❌ Fali |
| **Pregled današnjih termina** | 🔥 Visok | ❌ Fali |
| **Pregled sutrašnjih termina** | 🔥 Visok | ❌ Fali |
| **Izmena termina** | ⚡ Srednji | ❌ Fali |
| **Otkazivanje termina** | ⚡ Srednji | ❌ Fali |
| **Pregled finansija** | ⚡ Srednji | ❌ Fali |
| **Info o klijentu** | 📊 Nizak | ⚡ Djelimično (List Records) |
| **Unos plaćanja** | ⚡ Srednji | ❌ Fali |

---

### Make.com Automatizacije:

| Automatizacija | Prioritet | Status |
|----------------|-----------|--------|
| **24h podsetnik klijentima** | 🔥 Visok | ❌ Fali |
| **2h podsetnik klijentima** | 🔥 Visok | ❌ Fali |
| **Potvrda termina (SMS/Email)** | 🔥 Visok | ❌ Fali |
| **Feedback request** | ⚡ Srednji | ❌ Fali |
| **Dnevni backup** | 📊 Nizak | ❌ Fali |
| **Izvještaji vlasniku** | 📊 Nizak | ❌ Fali |

---

### Telegram Bot:

| Funkcionalnost | Prioritet | Status |
|----------------|-----------|--------|
| **Bot kreiran** | ⚡ Srednji | ❌ Fali |
| **Komande setup** | ⚡ Srednji | ❌ Fali |
| **Integracija sa Voiceflow** | ⚡ Srednji | ❌ Fali |
| **Notifikacije** | 🔥 Visok | ❌ Fali |

---

## 🔄 GLAVNE IZMENE OD PLANA

### 1. **Notion - IMPLEMENTIRANO**
**Originalni plan:** Notion dashboard za vizuelni pregled  
**Realnost:** ✅ Implementirano  
**Svrha:** Organizacija i lakši pregled za vlasnika bez ulaska u Airtable aplikaciju

**Funkcionalnost:**
- ✅ Dashboard sa embed Airtable view-ovima
- ✅ Brzi pregled današnjih/sutrašnjih termina
- ✅ Finansijski pregled
- ✅ Kalendar prikaz

---

### 2. **Make.com uloga - PROMENJENA**
**Originalni plan:** Make.com kao proxy između Voiceflow i Airtable za SVE API pozive  
**Realnost:** Direct API pozivi iz Voiceflow-a  
**Razlog:** Brže, jednostavnije, manje failure points

**Nova uloga:** 
- ✅ Samo za notifikacije (SMS/Email)
- ✅ Samo za scheduled taskove (podsetnici)
- ✅ Samo za automatizacije koje ne mogu biti u Voiceflow-u

---

### 3. **Voiceflow arhitektura - PROMENJENA**
**Originalni plan:** Intent-based agent sa manual intents i entities  
**Realnost:** LLM Conversational Agent  
**Razlog:** Moderna praksa, prirodniji razgovor, manje maintenance

**Prednosti:**
- Ne treba ručno dodavati intents
- Agent razume prirodni jezik
- Lakše za ažuriranje

---

### 4. **API integracije - PROMENJENA**
**Originalni plan:** Voiceflow → Make.com → Airtable  
**Realnost:** Voiceflow → Airtable (direktno)

**Implementirano:**
- ✅ Custom API tools u Voiceflow-u
- ✅ Direct Airtable API pozivi
- ✅ Brži response time
- ✅ Manje failure points

---

### 5. **Sistem plaćanja - POBOLJŠAN**
**Originalni plan:** Polje "Avans" u Appointments + Payments tabela  
**Realnost:** Samo Payments tabela

**Rezultat:**
- ✅ Nema duplikata
- ✅ Transparentan sistem
- ✅ Automatski izračunavanja
- ✅ Jasno praćenje svih plaćanja

---

## 🚀 ŠTA TREBA DA SE URADI (Prioritizovano)

### 🔥 PRIORITET 1: Make.com Notifikacije (HITNO)

#### Scenario 1: Potvrda termina vlasniku (TELEGRAM)
```
Trigger: Novi zapis u Appointments (Voiceflow kreira)
Akcija: Pošalji Telegram poruku vlasniku
Poruka: "✅ Termin zakazan: [Klijent] - [Datum] [Vreme] - [Usluga] ([Cena]€)"
```
**Vreme:** 1-2 sata

#### Scenario 2: 24h podsetnik klijentu (SMS/Email)
```
Trigger: Schedule (svaki dan u 10:00)
Akcija: 
  1. Traži termine za sutra sa statusom "Zakazan/Potvrđen"
  2. Pošalji SMS/Email svakom klijentu
Poruka: "Podsetnik: Imate termin sutra [Datum] u [Vreme] u MOKA Beauty Studio. Hvala!"
```
**Vreme:** 2-3 sata

#### Scenario 3: 2h podsetnik klijentu (SMS)
```
Trigger: Schedule (svaki sat)
Akcija:
  1. Traži termine za danas za sledeća 2 sata
  2. Pošalji SMS klijentu
Poruka: "Podsetnik: Vaš termin je za 2h ([Vreme]) u MOKA Beauty Studio!"
```
**Vreme:** 1-2 sata

**Ukupno vreme:** 4-7 sati

---

### ⚡ PRIORITET 2: Voiceflow - Dodatne funkcionalnosti (VAŽNO)

#### 1. Provera dostupnosti
```
Agent: "Za koji datum proveravate dostupnost?"
Vlasnik: "15. oktobar"
Agent: [List Records → Appointments za taj datum]
       [Izračuna koja vremena su slobodna]
       "Slobodni termini: 09:00, 10:30, 14:00, 16:30, 18:00"
```
**Vreme:** 2-3 sata

#### 2. Pregled današnjih/sutrašnjih termina
```
Agent: "Današnji termini:"
       [List Records → filtrira danas]
       "1. 09:00 - Marija - Šminkanje
        2. 14:00 - Ana - Puder obrve
        3. 18:00 - Jovana - Lash lift"
```
**Vreme:** 1-2 sata

#### 3. Otkazivanje termina
```
Agent: "Koji termin otkazujemo?"
Vlasnik: "Ana, 15. oktobar"
Agent: [Pronađe termin]
       [UPDATE API → Status = "Otkazan"]
       "Termin otkazan."
```
**Vreme:** 2-3 sata  
**Napomena:** Potreban UPDATE API tool

#### 4. Izmena termina
```
Agent: "Koji termin menjamo?"
Vlasnik: "Marija, 15. oktobar"
Agent: "Šta menjamo? (datum/vreme/uslugu)"
       [UPDATE API]
       "Termin ažuriran."
```
**Vreme:** 2-3 sata  
**Napomena:** Potreban UPDATE API tool

#### 5. Pregled finansija
```
Agent: "Za koji period? (danas/ovaj mesec/prošli mesec)"
Vlasnik: "Ovaj mesec"
Agent: [List Records → filtrira po datumu i statusu "Završen"]
       [Sumira cene]
       "Ukupan prihod za ovaj mesec: 3,450€ (45 termina)"
```
**Vreme:** 2-3 sata

#### 6. Unos plaćanja
```
Agent: "Za koji termin unosimo plaćanje?"
Vlasnik: "Ana, 15. oktobar"
Agent: "Iznos?"
Vlasnik: "60€"
Agent: "Tip? (Avans/Plaćanje/Povraćaj)"
Vlasnik: "Avans"
Agent: [CREATE Payment zapis]
       "Plaćanje uneseno. Preostalo za platiti: 120€"
```
**Vreme:** 2-3 sata  
**Napomena:** Potreban Payment Create API tool

**Ukupno vreme:** 11-17 sati

---

### 📊 PRIORITET 3: Telegram Bot (OPCIONALNO)

Telegram može da bude **alternativni interface** za vlasnika.

#### Osnovne funkcije:
- `/add` - Dodaj termin (poziva Voiceflow agent)
- `/today` - Današnji termini
- `/tomorrow` - Sutrašnji termini
- `/availability` - Proveri dostupnost
- `/finances` - Pregled finansija

**Vreme:** 8-12 sati

**Pitanje za tebe:** Da li želiš Telegram interface ili ti je Voiceflow dovoljan?

---

## 📋 REVIDIRANI PLAN (Šta još treba)

### FAZA 2B: Voiceflow - Proširenje (Preporučeno)
**Vreme:** 11-17 sati  
**Prioritet:** 🔥 Visok

1. [ ] Provera dostupnosti (2-3h)
2. [ ] Pregled današnjih termina (1-2h)
3. [ ] Pregled sutrašnjih termina (1-2h)
4. [ ] Otkazivanje termina + UPDATE API (2-3h)
5. [ ] Izmena termina + UPDATE API (2-3h)
6. [ ] Pregled finansija (2-3h)
7. [ ] Unos plaćanja + Payment CREATE API (2-3h)

---

### FAZA 3B: Make.com Notifikacije (Kritično)
**Vreme:** 4-7 sati  
**Prioritet:** 🔥 Visok

1. [ ] Telegram notifikacija vlasniku (1-2h)
2. [ ] 24h SMS podsetnik klijentu (2-3h)
3. [ ] 2h SMS podsetnik klijentu (1-2h)
4. [ ] Email potvrda klijentu (opcionalno)

---

### FAZA 4B: Telegram Bot (Opcionalno)
**Vreme:** 8-12 sati  
**Prioritet:** 📊 Nizak (opciono)

1. [ ] Kreiranje bota (1h)
2. [ ] Integracija sa Voiceflow (2-3h)
3. [ ] Osnovne komande (3-4h)
4. [ ] Testiranje (2-3h)

---

## 📊 VREMENSKA PROCENA

### Minimum (samo najvažnije):
```
FAZA 2B (osnove):      6-10 sati
FAZA 3B (notifikacije): 4-7 sati
------------------------
UKUPNO MINIMUM:        10-17 sati (~2 radna dana)
```

### Optimalno (sve preporučeno):
```
FAZA 2B (sve funkcije):   11-17 sati
FAZA 3B (notifikacije):   4-7 sati
------------------------
UKUPNO OPTIMALNO:        15-24 sata (~3 radna dana)
```

### Kompletno (sa Telegram):
```
FAZA 2B (sve funkcije):   11-17 sati
FAZA 3B (notifikacije):   4-7 sati
FAZA 4B (Telegram):       8-12 sati
------------------------
UKUPNO KOMPLETNO:        23-36 sati (~4-5 radnih dana)
```

---

## 🎯 PREPORUČENI PLAN AKCIJE

### Nedelja 1: Make.com Notifikacije
**Dan 1-2:** 
- [ ] Setup Make.com naloga
- [ ] Telegram notifikacija vlasniku
- [ ] 24h SMS podsetnik

**Dan 3:**
- [ ] 2h SMS podsetnik
- [ ] Testiranje

---

### Nedelja 2: Voiceflow Proširenje
**Dan 4-5:**
- [ ] Provera dostupnosti
- [ ] Pregled današnjih/sutrašnjih termina

**Dan 6-7:**
- [ ] Update API tool
- [ ] Otkazivanje i izmena termina

**Dan 8:**
- [ ] Pregled finansija
- [ ] Testiranje

---

### Nedelja 3 (Opcionalno): Telegram Bot
**Dan 9-10:**
- [ ] Kreiranje i konfiguracija bota
- [ ] Osnovne komande

**Dan 11:**
- [ ] Integracija sa Voiceflow
- [ ] Testiranje

---

## 💡 PREPORUKE

### Šta uraditi prvo:

**1. Make.com notifikacije** (4-7 sati) 🔥
- Najkritičnije za poslovanje
- Vlasnik dobija instant feedback
- Klijenti dobijaju podsjetnike
- Smanjuje no-show rate

**2. Voiceflow - Provera dostupnosti** (2-3 sata) 🔥
- Pomaže pri zakazivanju
- Sprečava double-booking
- Brže zakazivanje

**3. Voiceflow - Pregled termina** (2-4 sata) 🔥
- Vlasnik brzo vidi šta ima danas/sutra
- Lakše planiranje dana

**4. Voiceflow - Update/Cancel** (4-6 sati) ⚡
- Fleksibilnost
- Manje grešaka

**5. Voiceflow - Finansije i Payments** (4-6 sati) ⚡
- Bolji uvid u poslovanje
- Praćenje plaćanja

**6. Telegram Bot** (8-12 sati) 📊
- Nice-to-have
- Alternativni interface
- Nije kritično

---

## 📊 TABELA ODLUKA

| Funkcionalnost | Potrebno? | Prioritet | Vreme |
|----------------|-----------|-----------|-------|
| Make.com notifikacije | ✅ DA | 🔥 Visok | 4-7h |
| Provera dostupnosti | ✅ DA | 🔥 Visok | 2-3h |
| Pregled termina | ✅ DA | 🔥 Visok | 2-4h |
| Update termina | ✅ DA | ⚡ Srednji | 2-3h |
| Cancel termina | ✅ DA | ⚡ Srednji | 2-3h |
| Pregled finansija | ✅ DA | ⚡ Srednji | 2-3h |
| Unos plaćanja | ✅ DA | ⚡ Srednji | 2-3h |
| Telegram Bot | ❓ TBD | 📊 Nizak | 8-12h |
| Notion Dashboard | ❌ NE | - | - |
| Backup automatizacija | ⚡ Možda | 📊 Nizak | 1-2h |

---

## 🎯 FINALNA PREPORUKA

### MINIMUM VIABLE PRODUCT (MVP):
```
✅ Airtable baza (GOTOVO!)
✅ Voiceflow - dodavanje termina (GOTOVO!)
+ Make.com notifikacije (4-7h)
+ Voiceflow - provera dostupnosti (2-3h)
+ Voiceflow - pregled termina (2-4h)
------------------------
UKUPNO: 8-14 sati (~2 dana)
```

**Posle ovoga sistem je 80% funkcionalan i potpuno upotrebljiv!**

---

### PRODUCTION READY:
```
MVP (gore)
+ Voiceflow - update/cancel (4-6h)
+ Voiceflow - finansije (2-3h)
+ Voiceflow - unos plaćanja (2-3h)
------------------------
UKUPNO: 16-26 sati (~3-4 dana)
```

**Posle ovoga sistem je 100% funkcionalan!**

---

## 💬 PITANJA ZA TEBE:

1. **Da li želiš Telegram bot?**
   - ✅ DA → Dodaj 8-12 sati
   - ❌ NE → Koristi samo Voiceflow

2. **Koje notifikacije su prioritet?**
   - 🔥 Telegram vlasniku?
   - 🔥 SMS klijentima?
   - 📧 Email klijentima?

3. **Koje Voiceflow funkcije prvo?**
   - Provera dostupnosti?
   - Pregled termina?
   - Otkazivanje?
   - Sve odjednom?

4. **Notion dashboard**
   - ✅ **URAĐENO** - Dashboard funkcioniše!

---

## 📅 SLEDEĆI KORACI

**Javi mi:**
1. Koje funkcionalnosti želiš prioritizovati?
2. Da li želiš Telegram bot?
3. Koliko vremena imaš za sledeću fazu?

**Onda ću ti napraviti:**
- ✅ Detaljni plan za sledeću fazu
- ✅ Korak-po-korak instrukcije
- ✅ Make.com scenario template-e
- ✅ Voiceflow API tool dokumentaciju

---

**Kreirao:** Claude Sonnet 4.5  
**Datum:** 12. oktobar 2025  
**Za:** MOKA Beauty Studio

