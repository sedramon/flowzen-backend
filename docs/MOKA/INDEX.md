# 📑 MASTER INDEX - Sva dokumentacija na jednom mestu

## 🎯 POČNI OVDE

### Ako si u žurbi (60 minuta):
➡️ [QUICK_START.md](./QUICK_START.md)

### Ako imaš vremena za detaljno čitanje:
➡️ [README.md](./README.md)

---

## 📚 SVA DOKUMENTACIJA

### 1️⃣ OPŠTI PREGLEDI

| Dokument | Svrha | Vreme čitanja |
|----------|-------|---------------|
| [README.md](./README.md) | Glavni vodič, start tačka | 10 min |
| [Airtable/AIRTABLE_ANALIZA.md](./Airtable/AIRTABLE_ANALIZA.md) | Kompletan pregled strukture | 15 min |
| [Airtable/DIJAGRAM_STRUKTURE.md](./Airtable/DIJAGRAM_STRUKTURE.md) | Vizuelni dijagrami i mape | 10 min |
| [Airtable/AIRTABLE_CHEAT_SHEET.md](./Airtable/AIRTABLE_CHEAT_SHEET.md) | Brza referenca | Referenca |

---

### 2️⃣ INSTRUKCIJE ZA POPRAVKE (✅ Završeno)

| Dokument | Problem | Status |
|----------|---------|--------|
| [Airtable/QUICK_START.md](./Airtable/QUICK_START.md) | Sve probleme | ✅ Rešeno |
| [Airtable/PLACANJE_SISTEM_MIGRACIJA.md](./Airtable/PLACANJE_SISTEM_MIGRACIJA.md) | Plaćanja | ✅ Rešeno |
| [Airtable/INSTRUKCIJE_POPRAVKA.md](./Airtable/INSTRUKCIJE_POPRAVKA.md) | Formule/Rollup | ✅ Rešeno |
| [Airtable/ZAVRSENO_IMPLEMENTACIJA.md](./Airtable/ZAVRSENO_IMPLEMENTACIJA.md) | Status | ✅ Kompletno |

---

### 3️⃣ TEHNIČKA DOKUMENTACIJA

| Dokument | Sadržaj |
|----------|---------|
| [Airtable/airtable-schema.json](./Airtable/airtable-schema.json) | Raw API schema export |
| [MOKA_Beauty_Studio_Plan.md](./MOKA_Beauty_Studio_Plan.md) | Originalni plan |
| [Voiceflow/](./Voiceflow/) | Voiceflow agent dokumentacija |

---

## 🔥 PRIORITETI - Šta prvo da radiš?

### PRIORITET 1 (KRITIČNO) - Migracija plaćanja
```
Problem: Duplo evidentiranje (Avans polje + Payments tabela)
Rešenje: Prebaci sve na Payments
Dokument: PLACANJE_SISTEM_MIGRACIJA.md
Vreme: 30-45 min
```

### PRIORITET 2 (HITNO) - Nevalidna formula
```
Problem: "Ukupno za platiti" ne radi
Rešenje: Obriši (već imaš "Preostalo za platiti")
Dokument: INSTRUKCIJE_POPRAVKA.md
Vreme: 5 min
```

### PRIORITET 3 (HITNO) - Nevalidni rollup
```
Problem: "Advance Payments (EUR)" nije konfigurisan
Rešenje: Podesi rollup
Dokument: INSTRUKCIJE_POPRAVKA.md
Vreme: 5 min
```

---

## 📖 KAKO KORISTITI DOKUMENTACIJU

### Scenario 1: "Hoću brzo da popravim sve!"
```
1. Otvori: QUICK_START.md
2. Sledi korake 1-3
3. Gotov si za ~60 minuta
```

### Scenario 2: "Hoću da razumem celu strukturu prvo"
```
1. Otvori: README.md (pregled)
2. Otvori: AIRTABLE_ANALIZA.md (detalji)
3. Otvori: DIJAGRAM_STRUKTURE.md (vizualno)
4. Otvori: PLACANJE_SISTEM_MIGRACIJA.md (akcija)
```

### Scenario 3: "Treba mi samo specifična informacija"
```
1. Otvori: AIRTABLE_CHEAT_SHEET.md
2. Ctrl+F → traži
```

### Scenario 4: "Ne znam ni šta mi treba"
```
1. Otvori: README.md
2. Pogledaj sekciju "BRZI START"
3. Izaberi šta ti treba
```

---

## 🔍 PRETRAGA PO TEMI

### Ako tražiš informacije o...

#### TABELAMA:
- Appointments → AIRTABLE_ANALIZA.md → Tabela 1
- Services → AIRTABLE_ANALIZA.md → Tabela 2
- Clients → AIRTABLE_ANALIZA.md → Tabela 3
- Payments → AIRTABLE_ANALIZA.md → Tabela 4
- Analytics → AIRTABLE_ANALIZA.md → Tabela 5
- Reminders → AIRTABLE_ANALIZA.md → Tabela 6

#### PROBLEMIMA:
- Plaćanja → PLACANJE_SISTEM_MIGRACIJA.md
- Formule → INSTRUKCIJE_POPRAVKA.md
- Rollup → INSTRUKCIJE_POPRAVKA.md

#### STRUKTURI:
- Veze → DIJAGRAM_STRUKTURE.md → Mapa veza
- ER Dijagram → DIJAGRAM_STRUKTURE.md
- Tokovi podataka → DIJAGRAM_STRUKTURE.md

#### POLJIMA:
- Lista svih polja → AIRTABLE_CHEAT_SHEET.md
- Formule → AIRTABLE_CHEAT_SHEET.md → Brze formule

---

## 📊 STATISTIKA DOKUMENTACIJE

| Metrika | Vrednost |
|---------|----------|
| **Ukupno dokumenata** | 9 |
| **Instrukcije za popravke** | 3 |
| **Opšti pregledi** | 4 |
| **Tehnička dokumentacija** | 2 |
| **Ukupno strana** | ~100+ |
| **Vreme kompletnog čitanja** | ~2 sata |
| **Vreme popravke** | ~1 sat |

---

## ✅ CHECKLIST - Što pročitati

Štikliraj dok čitaš:

### Osnove (OBAVEZNO):
- [ ] README.md
- [ ] QUICK_START.md

### Popravke (OBAVEZNO):
- [ ] PLACANJE_SISTEM_MIGRACIJA.md
- [ ] INSTRUKCIJE_POPRAVKA.md

### Razumevanje (PREPORUKA):
- [ ] AIRTABLE_ANALIZA.md
- [ ] DIJAGRAM_STRUKTURE.md

### Referenca (PO POTREBI):
- [ ] AIRTABLE_CHEAT_SHEET.md

---

## 🎓 NIVOI ZNANJA

### 📗 BEGINNER - Tek počinjem sa Airtable
```
Čitaj po ovom redosledu:
1. README.md
2. AIRTABLE_ANALIZA.md (samo pregled tabela)
3. QUICK_START.md
4. Akcija!
```

### 📘 INTERMEDIATE - Znam osnove Airtable
```
Čitaj:
1. README.md (brzo)
2. PLACANJE_SISTEM_MIGRACIJA.md
3. Akcija!
4. DIJAGRAM_STRUKTURE.md (za bolje razumevanje)
```

### 📕 ADVANCED - Expert sam u Airtable
```
Čitaj:
1. airtable-schema.json (direktno)
2. PLACANJE_SISTEM_MIGRACIJA.md (samo specifike)
3. Akcija!
```

---

## 🆘 BRZA POMOĆ

### "Gde je instrukcija za X?"

| Traži | Pogledaj |
|-------|----------|
| Plaćanja | PLACANJE_SISTEM_MIGRACIJA.md |
| Formule | INSTRUKCIJE_POPRAVKA.md ili CHEAT_SHEET.md |
| Rollup | INSTRUKCIJE_POPRAVKA.md |
| Specifično polje | CHEAT_SHEET.md + Ctrl+F |
| Veze između tabela | DIJAGRAM_STRUKTURE.md |
| Workflow | DIJAGRAM_STRUKTURE.md → Status flows |
| Test slučajevi | PLACANJE_SISTEM_MIGRACIJA.md → Testiranje |

---

## 📁 MAPA FAJLOVA

```
MOKA/
│
├── 🏠 INDEX.md (OVDE SI!)
│   └─ Mapa svih dokumenata
│
├── 📖 README.md
│   └─ Glavni vodič, start tačka
│
├── ⚡ QUICK_START.md
│   └─ Brzi vodič (60 min)
│
├── 🔥 PLACANJE_SISTEM_MIGRACIJA.md
│   └─ Migracija plaćanja (30-45 min)
│
├── 🔧 INSTRUKCIJE_POPRAVKA.md
│   └─ Druge popravke (15 min)
│
├── 📊 AIRTABLE_ANALIZA.md
│   └─ Kompletan pregled strukture
│
├── 🗺️ DIJAGRAM_STRUKTURE.md
│   └─ Vizuelni dijagrami
│
├── 📋 AIRTABLE_CHEAT_SHEET.md
│   └─ Brza referenca
│
├── 📦 airtable-schema.json
│   └─ Raw API export
│
└── 📝 MOKA_Beauty_Studio_Plan.md
    └─ Originalni plan
```

---

## 🎯 CILJ DOKUMENTACIJE

Ova dokumentacija ima jedan cilj:

> **Omogući ti da potpuno razumeš, popraviš i optimizuješ svoju Airtable bazu za MOKA Beauty Studio, bez potrebe za spoljnom pomoći.**

---

## 📞 KONTAKT & PODRŠKA

Ako imaš pitanja:
1. 🔍 Pretraži dokumentaciju (Ctrl+F)
2. 💬 Pitaj Claude AI (ja!)
3. 🌐 Airtable Community Forum

---

**Kreirao:** Claude AI (Anthropic)  
**Za:** MOKA Beauty Studio  
**Datum:** 12. oktobar 2025.  
**Verzija:** 1.1

---

**🚀 Hajde da popravimo tu bazu!**

