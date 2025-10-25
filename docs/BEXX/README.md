# 📱 BexExpress - Instagram Shop DM Outreach System

**Projekat:** Automatski pronalaženje Instagram shop profila i slanje personalizovanih DM poruka  
**Datum kreiranja:** 16. oktobar 2025.  
**Status:** ✅ Ready for Implementation

---

## 🎯 ŠEMA SISTEMA

```
Instagram (hashtag search)
         ↓
    Apify Hashtag Scraper
         ↓
    Apify Profile Scraper (unutar Iterator-a)
         ↓
    AI Message Generation (OpenRouter)
         ↓
    Airtable Database
         ↓
    DM Sending (Apify)
         ↓
    Status Tracking
```

---

## 🛠️ TECH STACK

| Komponenta | Alat | Cena | Uloga |
|------------|------|------|-------|
| **Instagram Scraping** | Apify Instagram Scraper | $5/mesec (free tier) | Pronalaženje profila |
| **DM Automation** | Apify DM Automation | Uključeno | Slanje poruka |
| **AI Generisanje** | OpenRouter (Gemma 2) | **$0 (besplatno)** | Personalizovane poruke |
| **Baza Podataka** | Airtable | $0 (free plan) | Skladištenje profila |
| **Workflow** | Make.com | $0 (free plan) | Orkestracija |

**Ukupno:** ~$5-6/mesec (ili besplatno sa optimizacijama)

---

## 📚 DOKUMENTACIJA

### 🚀 Quick Start
**Za brzo pokretanje sistema (2-3 sata):**
- [**Quick Start Guide**](./Quick-Start-Guide.md) - Korak-po-korak setup sa testiranjem

### 📖 Detaljni Setup Vodići

1. [**Instagram DM Outreach System - Main Doc**](./Instagram-DM-Outreach-System.md)
   - Kompletan pregled sistema
   - Arhitektura i flow
   - Limitacije i best practices

2. [**Airtable Setup Guide**](./Airtable-Setup-Guide.md)
   - Struktura baze podataka
   - Views i automations
   - Formule i tracking

3. [**OpenRouter Setup Guide**](./OpenRouter-Setup-Guide.md)
   - Besplatni AI modeli
   - Prompt engineering
   - Make.com integracija

4. [**Apify Setup Guide**](./Apify-Setup-Guide.md)
   - Instagram scraping
   - DM automation
   - Session management

### 🔧 Make.com Scenario Vodići

5. [**Make Scenario 1 - Scraping**](./Make-Scenario-1-Scraping.md)
   - Instagram hashtag pretraga
   - Profile scraping (unutar Iterator-a)
   - AI generisanje poruka
   - Airtable skladištenje

6. [**Make Scenario 2 - DM Sending**](./Make-Scenario-2-DM-Sending.md)
   - DM slanje (5/dan limit)
   - Status tracking
   - Error handling

---

## ⚡ BRZI PREGLED

### Modul 1: Pronalaženje Profila

**Input:** Hashtag liste (`#shopserbia`, `#handmadebalkan`)  
**Filter:** Bio sadrži "shop", "prodaja", "online"  
**Output:** Instagram profili u Airtable

**Schedule:** Svaki dan u 10:00

### Modul 2: AI Generisanje

**Model:** Google Gemma 2 (besplatan)  
**Input:** Username, Bio, Followers  
**Output:** Personalizovana DM poruka (max 140 karaktera)

### Modul 3: DM Slanje

**Limit:** 5 poruka dnevno (Instagram anti-spam)  
**Schedule:** Svaki dan u 14:00  
**Tracking:** Status update u Airtable

---

## 📊 AIRTABLE STRUKTURA

### Tabela: `Instagram_Shops`

```
┌─────────────────────────────────────────────────────┐
│ username          │ @handmade_serbia               │
│ profile_link      │ https://instagram.com/...      │
│ bio               │ 🎨 Handmade nakit | Beograd    │
│ followers         │ 1250                           │
│ status            │ New → Sent → Replied           │
│ generated_message │ AI generisana poruka           │
│ sent_timestamp    │ 2025-10-16 14:30               │
│ hashtags_found    │ #shopserbia                    │
│ notes             │ Manual notes                   │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 WORKFLOW

### Daily Flow:

**10:00 AM** - Scraping Run
```
1. Apify hashtag scraper pretražuje Instagram (#shopserbia)
2. Iterator prolazi kroz postove
3. Apify profile scraper dohvata detalje profila (bio, followers)
4. Filter: bio contains "shop" + followers 100-10k
5. OpenRouter generiše poruke
6. Airtable: Dodaj novi record (status: New)
```

**2:00 PM** - DM Sending Run
```
1. Airtable: Učitaj 5 profila (status: New)
2. Apify: Pošalji DM sa generisanom porukom
3. Airtable: Update status → Sent + timestamp
4. Čekaj 60s između poruka (anti-spam)
```

**Manual** - Reply Tracking
```
1. Check Instagram inbox
2. Ako odgovorili → Update Airtable (status: Replied)
3. Manual komunikacija
```

---

## 🎯 SETUP KORACI (TL;DR)

### 1. Kreiraj Naloge (15 min)
- ✅ Apify.com (free tier)
- ✅ OpenRouter.ai (free models)
- ✅ Airtable.com (free plan)
- ✅ Make.com (free plan)

### 2. Setup API Keys (10 min)
- ✅ Apify API Token
- ✅ OpenRouter API Key
- ✅ Airtable Personal Access Token
- ✅ Instagram Session ID

### 3. Build Make.com Scenarios (60 min)
- ✅ Scenario 1: Scraping + AI
- ✅ Scenario 2: DM Sending

### 4. Test (30 min)
- ✅ E2E test (tvoj Instagram profil)
- ✅ Error handling test
- ✅ Production readiness check

### 5. Go Live (5 min)
- ✅ Aktiviraj schedule (10:00 & 14:00)
- ✅ Monitor prvi run
- ✅ Track results

---

## 🚨 KRITIČNE NAPOMENE

### Instagram Limitacije:
- ⚠️ **MAX 5 DM-ova dnevno** (anti-spam)
- ⚠️ **Session ID ističe nakon 90 dana** (mora manual update)
- ⚠️ **Koristiti RESIDENTIAL proxy** (Apify)
- ⚠️ **Ne slati noću** (10 PM - 8 AM)

### Bezbednost:
- 🔒 Session ID je **SECRET** - nikad ne deliti
- 🔒 Koristiti **business profil** (@SaveYourTime)
- 🔒 API keys čuvati u environment variables
- 🔒 Backup session ID offline

### Kvalitet:
- ✨ AI poruke treba da budu **personalizovane**
- ✨ Max **140 karaktera** po poruci
- ✨ **Prirodan ton** (ne spam/bot)
- ✨ Uvek **pomeni detalj iz profila**

---

## 📈 SUCCESS METRICS

### Prvi Mesec - Target:

| Metrika | Target | Tracking |
|---------|--------|----------|
| Profili pronađeni | 200+ | Airtable COUNT |
| DM-ovi poslati | 150 (5/dan) | Status = "Sent" |
| Reply rate | >20% | Manual tracking |
| Conversion rate | >5% | Manual tracking |
| Ban incidents | 0 | Instagram status |

---

## 🔧 TROUBLESHOOTING

### Najčešći Problemi:

| Problem | Rešenje |
|---------|---------|
| **Session expired** | Generiši novi session ID |
| **DM ne stiže** | Check Instagram "Message Requests" |
| **Apify error** | Proveri kredit balance |
| **AI poruke loše** | Optimizuj prompt |
| **Instagram ban** | Pause 48h, smanji na 3 DM/dan |

Detaljno: Vidi troubleshooting sekciju u svakom guide-u.

---

## 📱 MOBILE WORKFLOW

**Za manual reply tracking:**

1. Instaliraj Airtable app (iOS/Android)
2. Otvori `Instagram DM Outreach` base
3. **Workflow:**
   - Proveri Instagram inbox
   - Ako odgovorili → Airtable app
   - Update `status` → "Replied"
   - Dodaj notes

---

## 🚀 SCALING PLAN

### Faza 1 (Mesec 1): Validation
- 5 DM/dan
- 1 Instagram profil
- Manual reply handling

### Faza 2 (Mesec 2): Optimization
- A/B test AI prompts
- Optimizuj hashtag liste
- Improve reply rate

### Faza 3 (Mesec 3+): Scale
- 10 DM/dan (ako nema ban-a)
- Multi-account setup (2-3 profila)
- Semi-automated reply detection

---

## 📞 SUPPORT & RESURSI

### Community:
- Make.com Community: https://community.make.com
- Apify Discord: https://discord.gg/apify
- OpenRouter Discord: https://discord.gg/openrouter

### Official Docs:
- Apify Docs: https://docs.apify.com
- OpenRouter Docs: https://openrouter.ai/docs
- Airtable API: https://airtable.com/developers/web/api
- Make.com Academy: https://academy.make.com

---

## 📋 QUICK LINKS

### Tools:
- [Apify Console](https://console.apify.com)
- [OpenRouter Dashboard](https://openrouter.ai/dashboard)
- [Airtable Workspace](https://airtable.com)
- [Make.com Scenarios](https://make.com/scenarios)

### Monitoring:
- Instagram Business Dashboard
- Make.com Run History
- Apify Actor Runs
- Airtable Analytics

---

## 🎉 NEXT STEPS

**Odmah počni:**

1. 📖 Čitaj [**Quick Start Guide**](./Quick-Start-Guide.md)
2. 🛠️ Setup naloge (15 min)
3. 🔨 Build Make.com scenarios (60 min)
4. 🧪 Test system (30 min)
5. 🚀 Go live!

**Za detalje o svakom koraku:**
- Vidi individualne guide-ove gore ⬆️

---

## ✅ PRE-LAUNCH CHECKLIST

- [ ] Svi nalozi kreirani
- [ ] API keys sačuvani (environment variables)
- [ ] Airtable baza konfigurisana
- [ ] Make.com scenarios testirani
- [ ] E2E test uspešan
- [ ] Error handling radi
- [ ] Instagram session ID validan
- [ ] Monitoring setup
- [ ] Team obuče za manual replies
- [ ] Backup plan (session ID, API keys)

---

**Status:** ✅ Ready for Implementation  
**Estimated Time to Launch:** 2-3 sata  
**Monthly Cost:** $5-6 (ili $0 sa optimizacijama)

**🚀 Good luck!**

