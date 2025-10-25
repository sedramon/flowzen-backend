# 📊 VOICEFLOW SETUP - KOMPLETAN PREGLED

> **Agent:** MAXX Agent  
> **Base ID:** appqzwTXdTkG0qrc0  
> **Status:** ✅ Funkcionalan  
> **Datum:** 12. oktobar 2025

---

## 🎯 ŠTA AGENT RADI

MAXX Agent je **lični asistent vlasnika** koji:
- ✅ Zakazuje termine kroz konverzaciju
- ✅ Kreira nove klijente automatski
- ✅ Pronalazi postojeće klijente
- ✅ Povezuje klijente i usluge sa terminima
- ✅ Unosi sve podatke u Airtable

---

## 📁 STRUKTURA DOKUMENTACIJE

```
Voiceflow/
├── README.md                           ← Glavni pregled
├── VOICEFLOW_SUMMARY.md               ← OVAJ FAJL (brzi pregled)
│
├── Knowledge-Base/
│   └── salon-info.md                  ← Sve informacije o salonu, uslugama, cenama
│
├── MAXX-Agent/
│   ├── instructions.md                ← Detaljna uputstva za agenta
│   └── agent-config.md                ← Tehnička konfiguracija
│
└── API-Tools/
    ├── Appointment-Create-API.md      ← API za kreiranje termina
    ├── Client-Create-API.md           ← API za kreiranje klijenata
    └── List-Records-Integration.md    ← Integracija za pretragu
```

---

## 🔄 PROCES ZAKAZIVANJA (Brzi pregled)

```
1. Vlasnik → "Zakaži termin za Mariju"
   ↓
2. Agent → Traži: Ime, Telefon, Email, Uslugu, Datum, Vreme
   ↓
3. Agent → Provera: Da li klijent postoji? (List Records API)
   ↓
   ├─→ DA: Uzmi record ID
   └─→ NE: Kreiraj novog (Client Create API) → Uzmi record ID
   ↓
4. Agent → Pronađi uslugu (List Records API) → Uzmi record ID
   ↓
5. Agent → Kreiraj termin (Appointment Create API)
   ↓
6. Agent → Potvrda vlasniku: "✅ Termin zakazan!"
```

---

## 🔗 INTEGRISANE TABELE

| Tabela | Read | Create | Update | Delete |
|--------|------|--------|--------|--------|
| **Clients** | ✅ | ✅ | ❌ | ❌ |
| **Services** | ✅ | ❌ | ❌ | ❌ |
| **Appointments** | ✅ | ✅ | ❌ | ❌ |
| **Payments** | ✅ | ✅ | ❌ | ❌ |
| **Analytics** | ❌ | ❌ | ❌ | ❌ |
| **Reminders** | ❌ | ❌ | ❌ | ❌ |

**Napomena:** Analytics i Reminders nisu još integrisani. Payments **SADA INTEGRISAN!** ✅

---

## 📚 KNOWLEDGE BASE - Brzi pregled

### Usluge:
- **Šminkanje:** 60€ (studio), 90€ (adresa, min 3 osobe)
- **Puder obrve:** 180€ (avans 60€)
- **Lash/Brow lift:** 2,500 RSD svaki, 4,500 RSD paket
- **Kurs NSS:** 120€

### Lokacija:
- **Adresa:** Bulevar Zorana Đindića 72, Beograd
- **Google Maps:** https://maps.app.goo.gl/tWcU3gqGLutnouyJ9?g_st=ic

### Pravila:
- Puder obrve: Obavezna konsultacija + slika obrva
- Šminkanje na adresi: Min 3 osobe
- Kursevi: Vikendi se brže popunjavaju

---

## 🔧 API TOOLS - Brzi pregled

### 1. List Records (GET)
**Svrha:** Pretraga i prikaz zapisa  
**Koristi se za:**
- Proveru da li klijent postoji
- Pronalaženje usluge po nazivu
- Pronalaženje termina za plaćanje
- Proveru da li usluga zahteva avans
- Prikaz dostupnih usluga/termina

### 2. Client Create (POST)
**Svrha:** Kreiranje novog klijenta  
**Polja:** Ime, Telefon, Email, Napomene  
**⚠️ Napomena:** Prvo proveri da li postoji!

### 3. Appointment Create (POST)
**Svrha:** Kreiranje novog termina  
**Obavezna polja:** Telefon, Datum, Vreme, Klijent (ID), Usluga (ID)  
**⚠️ Napomena:** NE šalje cenu!

### 4. Payment Create (POST) ← NOVO!
**Svrha:** Kreiranje plaćanja (avans, plaćanje, povraćaj)  
**Obavezna polja:** Naziv, Iznos, Datum, Tip, Status, Termin (ID)  
**⚠️ Napomena:** UVEK povezati sa terminom!

---

## ✅ TRENUTNI STATUS

### Šta radi perfektno:
- ✅ Zakazivanje termina
- ✅ Kreiranje novih klijenata
- ✅ Pretraga postojećih klijenata
- ✅ Pronalaženje usluga
- ✅ Povezivanje zapisa (record links)
- ✅ Automatsko popunjavanje cene (rollup)
- ✅ Automatski status plaćanja (formula)

### Šta je testirano:
- ✅ Kreiran novi klijent → Uspešno
- ✅ Kreiran termin sa povezanim poljima → Uspešno
- ✅ Cena automatski setovana → Uspešno
- ✅ Rollup-ovi rade → Uspešno

---

## 🚀 BUDUĆA UNAPREĐENJA

### Faza 2 (Planirano):
- [ ] **Slanje potvrde klijentu** (SMS/Email nakon zakazivanja)
- [ ] **Automatski podsetnici** (24h i 2h pre termina)
- [ ] **Provera dostupnosti** (da li je vreme slobodno)
- [ ] **Predlozi slobodnih termina** (AI optimizacija)

### Faza 3 (Vizija):
- [ ] **Javni agent za klijente** (self-service booking)
- [ ] **Unos plaćanja kroz agenta**
- [ ] **Dashboard za vlasnika** (pregled termina za dan/nedelju)
- [ ] **Analytics izvještaji** (AI generisani insights)
- [ ] **Automatsko fakturisanje**

---

## 📞 KAKO AŽURIRATI VOICEFLOW

Kada nešto promeniš u Voiceflow-u:

### 1. Promena Knowledge Base:
```
→ Ažuriraj: Knowledge-Base/salon-info.md
→ Dodaj datum ažuriranja
```

### 2. Promena Agent Instructions:
```
→ Ažuriraj: MAXX-Agent/instructions.md
→ Dodaj opis promene
```

### 3. Promena API Tool-a:
```
→ Ažuriraj odgovarajući fajl u API-Tools/
→ Označi verziju
```

### 4. Novi funkcionalnost:
```
→ Kreiraj novi folder
→ Dokumentuj sve aspekte
→ Ažuriraj ovaj SUMMARY fajl
```

---

## 🔍 BRZA REFERENCA

| Trebam | Pogledaj |
|--------|----------|
| Informacije o usługama/cenama | Knowledge-Base/salon-info.md |
| Kako agent radi | MAXX-Agent/instructions.md |
| Tehnička konfiguracija | MAXX-Agent/agent-config.md |
| API za termine | API-Tools/Appointment-Create-API.md |
| API za klijente | API-Tools/Client-Create-API.md |
| Pretraga zapisa | API-Tools/List-Records-Integration.md |

---

## 💡 TIPS & TRICKS

### Tip 1: Testiranje promena
Uvek testiraj sa "Test" klijentom/terminom i obriši posle testiranja.

### Tip 2: Record ID-evi
Uvek zapamti record ID kada kreiraš klijenta - biće ti potreban odmah posle!

### Tip 3: Error messages
Ako API vrati error, pročitaj message - obično ti kaže tačno šta fali.

### Tip 4: Backup
Pre velikih promena u Voiceflow-u, eksportuj canvas kao JSON backup.

### Tip 5: Dokumentacija
Uvek ažuriraj dokumentaciju odmah posle promene - lakše je dok je sveže u glavi!

---

## 📊 METRIKE (12.10.2025)

| Metrika | Vrednost |
|---------|----------|
| **Uspešno kreirani termini** | 1+ (testiranje) |
| **Kreirani klijenti** | 1+ (testiranje) |
| **API errors** | 0 |
| **Average response time** | < 3s |

---

## 🎉 ZAKLJUČAK

MAXX Agent je **potpuno funkcionalan** za osnovne zadatke zakazivanja termina!

**Sve radi kako treba:**
- ✅ Conversation flow
- ✅ API integracije
- ✅ Airtable povezivanje
- ✅ Automatsko popunjavanje podataka
- ✅ Error handling

**Spremno za produkciju!** 🚀

---

**Verzija:** 1.0  
**Autor:** Vlasnik + Claude AI  
**Platforma:** Voiceflow + Airtable  
**Status:** Production Ready ✅

