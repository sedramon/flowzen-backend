# 📱 BexExpress Instagram Shop DM Outreach System

**Datum kreiranja:** 16. oktobar 2025.  
**Status:** Implementation Guide

---

## 🎯 CILJ SISTEMA

Automatski pronaći Instagram shop profile (handmade, prodaja, online) i slati im personalizovane DM poruke za saradnju sa @SaveYourTime.

---

## 🛠️ TECH STACK (KONAČNA VERZIJA)

| Komponenta | Alat | Uloga | Cena |
|------------|------|-------|------|
| **Instagram Scraping** | Apify Instagram Scraper | Pronalaženje profila po hashtagu/lokaciji | Besplatan trial |
| **DM Slanje** | Apify Instagram DMs Automation | Slanje DM poruka | Besplatan trial |
| **AI Generisanje** | OpenRouter API | Generisanje personalizovanih poruka | Besplatni modeli |
| **Baza Podataka** | Airtable | Skladištenje profila i statusa | Besplatan plan |
| **Orkestracija** | Make.com | Workflow automation | Besplatan plan |

---

## 📊 AIRTABLE STRUKTURA BAZE

### Tabela: `Instagram_Shops`

| Kolona | Tip | Opis | Primer |
|--------|-----|------|--------|
| `username` | Single line text | Instagram username | @handmade_serbia |
| `profile_link` | URL | Link ka profilu | https://instagram.com/handmade_serbia |
| `bio` | Long text | Biografija profila | "🎨 Handmade nakit \| Beograd..." |
| `followers` | Number | Broj pratilaca | 1250 |
| `status` | Single select | Status DM-a | New, Sent, Replied, Blocked |
| `generated_message` | Long text | AI generisana poruka | "Cao! Videla sam tvoj divni..." |
| `sent_timestamp` | Date | Vreme slanja | 2025-10-16 14:30 |
| `hashtags_found` | Multiple select | Hashtag gde je pronađen | #shopserbia, #handmade |
| `notes` | Long text | Dodatne beleške | Manual override poruke |

### Status vrednosti:
- **New** - Pronađen, poruka generisana, čeka slanje
- **Sent** - DM poslat uspešno
- **Replied** - Korisnik odgovorio (manual check)
- **Blocked** - Ne slati više poruke

---

## 🔍 MODUL 1: INSTAGRAM SCRAPING

### Apify Instagram Scraper Setup

**Link:** https://apify.com/apify/instagram-scraper

#### Input konfiguracija:

```json
{
  "searchType": "hashtag",
  "search": [
    "#shopserbia",
    "#handmadebalkan", 
    "#onlineprodaja",
    "#prodajasrbija",
    "#handmadesrbija"
  ],
  "resultsLimit": 50,
  "addParentData": true
}
```

#### Filtering logika (u Make.com):

```javascript
// Filter条件:
bio.contains("shop") OR 
bio.contains("prodaja") OR 
bio.contains("online") OR
bio.contains("kupovina") OR
bio.contains("naručivanje")

AND

followers >= 100 AND followers <= 10000
```

---

## 🤖 MODUL 2: AI GENERISANJE PORUKA

### OpenRouter API Integration

**Endpoint:** `https://openrouter.ai/api/v1/chat/completions`

#### Besplatni modeli (2025):
- `meta-llama/llama-3.2-3b-instruct:free`
- `google/gemma-2-9b-it:free`
- `microsoft/phi-3-mini-128k-instruct:free`

#### HTTP Request u Make.com:

**Method:** POST  
**URL:** https://openrouter.ai/api/v1/chat/completions

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_OPENROUTER_API_KEY",
  "Content-Type": "application/json",
  "HTTP-Referer": "https://saveyourtime.rs"
}
```

**Body:**
```json
{
  "model": "meta-llama/llama-3.2-3b-instruct:free",
  "messages": [
    {
      "role": "system",
      "content": "Ti si AI asistent koji generiše personalizovane, prirodne Instagram DM poruke za poslovnu saradnju. Poruke treba da budu prijateljske, kratke (max 150 karaktera) i specifične za profil."
    },
    {
      "role": "user",
      "content": "Generiši DM poruku za:\nUsername: {{username}}\nBio: {{bio}}\nFollowers: {{followers}}\n\nPoruka treba da pozove na saradnju sa @SaveYourTime platformom za online prodaju."
    }
  ],
  "max_tokens": 150,
  "temperature": 0.7
}
```

**Response mapping:**
```
{{choices[0].message.content}}
```

---

## 📤 MODUL 3: DM SLANJE

### Apify Instagram DMs Automation

**Link:** https://apify.com/aizen0/instagram-dms-automation

#### Input konfiguracija:

```json
{
  "sessionCookie": "YOUR_INSTAGRAM_SESSION_ID",
  "recipients": [
    "{{airtable.username}}"
  ],
  "message": "{{openrouter.generated_message}}",
  "delayBetweenMessages": 60,
  "maxMessagesPerRun": 5
}
```

#### Dobijanje Session Cookie:

1. Otvori Instagram u browseru
2. Logiraj se na @SaveYourTime profil
3. Otvori Developer Tools (F12)
4. Application → Cookies → instagram.com
5. Kopiraj vrednost `sessionid` cookie-ja

⚠️ **VAŽNO:** Session ID ističe svakih 90 dana - mora se ručno update-ovati!

---

## 🔄 MAKE.COM WORKFLOW

### Scenario 1: Scraping + AI + Airtable

**Trigger:** Scheduled (svaki dan u 10:00)

```
┌─────────────────┐
│  Apify Scraper  │
│  (Instagram)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Filter Module  │
│  (bio keywords) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Iterator       │
│  (svaki profil) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  HTTP Request   │
│  (OpenRouter)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Airtable       │
│  Create Record  │
│  (status: New)  │
└─────────────────┘
```

### Scenario 2: DM Sending

**Trigger:** Scheduled (svaki dan u 14:00)

```
┌─────────────────┐
│  Airtable       │
│  Search Records │
│  (status: New)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Limit Module   │
│  (max 5 items)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Apify DM       │
│  Automation     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Airtable       │
│  Update Record  │
│  (status: Sent) │
└─────────────────┘
```

---

## 🚀 SETUP KORACI

### 1. Apify Account Setup

1. ✅ Registruj se na https://apify.com
2. ✅ Besplatan trial daje $5 kredita
3. ✅ Podesi dva Actor-a:
   - Instagram Scraper
   - Instagram DMs Automation
4. ✅ Kopiraj API Token (Settings → Integrations)

### 2. OpenRouter Account Setup

1. ✅ Registruj se na https://openrouter.ai
2. ✅ Besplatni modeli ne zahtevaju kredit
3. ✅ Generiši API Key
4. ✅ Dodaj site URL: https://saveyourtime.rs

### 3. Airtable Setup

1. ✅ Kreiraj Workspace: "BexExpress"
2. ✅ Kreiraj Base: "Instagram DM Outreach"
3. ✅ Kreiraj tabelu `Instagram_Shops` sa kolonama (vidi gore)
4. ✅ Generiši Personal Access Token

### 4. Make.com Setup

1. ✅ Registruj se na https://make.com
2. ✅ Kreiraj Folder: "BexExpress"
3. ✅ Kreiraj 2 Scenarija:
   - "Instagram Scraping Pipeline"
   - "DM Sending Pipeline"
4. ✅ Povezati sve module (vidi dijagrame gore)

### 5. Instagram Session Setup

1. ✅ Logiraj se na @SaveYourTime profil
2. ✅ Ekstrahovati `sessionid` cookie
3. ✅ Dodati u Apify DM Automation input
4. ✅ Testirati slanje na test profil

---

## ⚠️ LIMITACIJE I BEZBEDNOST

### Instagram Limitacije:

- ❌ **Max 5 DM-ova dnevno** (anti-spam)
- ❌ **Ne slati noću** (10 PM - 8 AM)
- ❌ **Čekati 60s između poruka**
- ❌ **Ne slati isti profil 2x**

### Session Security:

- 🔒 Session ID čuvati kao ENV variable u Make.com
- 🔒 Rotirati session svakih 30 dana
- 🔒 Koristiti business profil (@SaveYourTime)
- 🔒 Nikad ne deliti session ID

### Airtable Rate Limits:

- Free plan: 1,200 records
- API calls: 5 requests/second

---

## 📈 METRIKE I PRAĆENJE

### Dashboard u Airtable:

1. **Total Profiles Found** - COUNT(all records)
2. **DMs Sent** - COUNT(status = "Sent")
3. **Response Rate** - COUNT(status = "Replied") / COUNT(status = "Sent")
4. **Conversion Rate** - Manual tracking

### Make.com Monitoring:

- Scenario runs: History tab
- Errors: Error handler module
- Notifications: Email/Slack integration

---

## 🔧 TROUBLESHOOTING

### Problem: Apify ne pronalazi profile

**Rešenje:**
- Proveri da li su hashtagovi validni
- Smanji `resultsLimit` na 20
- Koristi različite hashtagove

### Problem: OpenRouter vraća grešku 401

**Rešenje:**
- Regeneriši API Key
- Proveri HTTP-Referer header
- Probaj drugi besplatni model

### Problem: Instagram session expired

**Rešenje:**
- Generiši novi sessionid
- Update u Apify DM Automation
- Proveri da li je profil blokiran

### Problem: DM-ovi ne stižu

**Rešenje:**
- Proveri Instagram inbox (Requests tab)
- Smanji frequency na 3 DM-a dnevno
- Povećaj delay između poruka na 120s

---

## 📝 NEXT STEPS

1. ✅ Kreirati Airtable bazu
2. ✅ Setup svih account-ova (Apify, OpenRouter, Make.com)
3. ✅ Testirati svaki modul pojedinačno
4. ✅ Povezati u Make.com workflow
5. ✅ Pokrenuti prvi test run (3 profila)
6. ✅ Skalirati na 5 DM-ova dnevno
7. ✅ Pratiti rezultate 7 dana
8. ✅ Optimizovati AI prompt za bolje poruke

---

## 🔗 KORISNI LINKOVI

- Apify Instagram Scraper: https://apify.com/apify/instagram-scraper
- Apify DM Automation: https://apify.com/aizen0/instagram-dms-automation
- OpenRouter Docs: https://openrouter.ai/docs
- Make.com Templates: https://make.com/en/templates
- Airtable API: https://airtable.com/developers/web/api

---

**Autor:** AI Assistant  
**Za:** BexExpress Project  
**Verzija:** 1.0

