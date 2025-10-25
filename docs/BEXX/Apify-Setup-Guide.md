# 🕷️ Apify Setup Guide - Instagram Scraping & DM Automation

**Datum:** 16. oktobar 2025.  
**Verzija:** 1.0

---

## 🎯 CILJ

Koristiti Apify za:
1. **Instagram Scraping** - pronalaženje shop profila
2. **DM Automation** - slanje personalizovanih poruka

---

## 💰 PRICING & FREE TIER

### Free Plan Benefits:

- **$5 besplatnih kredita** mesečno
- Dovoljno za: ~500 scraped profila + 150 DM-ova
- Community support
- Access to all Actors

### Potrošnja:

| Aktivnost | Cena | $5 = |
|-----------|------|------|
| Instagram Scraper (100 profila) | ~$0.10 | 5,000 profila |
| Instagram DM (1 poruka) | ~$0.03 | 166 DM-ova |

**Za naš use case (5 DM/dan):**
- Scraping: 50 profila/dan × $0.05 = $1.50/mesec
- DM slanje: 5 DM/dan × 30 dana × $0.03 = $4.50/mesec
- **UKUPNO: ~$6/mesec** (malo preko free tier-a)

**Rešenje:** Smanji scraping na svaka 2-3 dana ili upgrade na Starter plan ($49/mesec).

---

## 📝 ACCOUNT SETUP

### 1. Registracija

1. Idi na https://apify.com
2. Klikni "Start free" → "Sign up with Google/GitHub"
3. Potvrdi email
4. Dashboard: https://console.apify.com

### 2. API Token

1. Settings → Integrations → API tokens
2. Klikni "Create new token"
3. **Name:** `Make.com Integration`
4. **Scope:** Full access
5. Kopiraj token (počinje sa `apify_api_...`)

---

## 🔍 ACTOR 1: Instagram Scraper

### Setup:

1. U Apify Storeu traži: **"Instagram Scraper"**
2. Odaberi: `apify/instagram-scraper` (official)
3. Klikni "Try for free"

### Input Configuration:

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
  "addParentData": true,
  "proxy": {
    "useApifyProxy": true,
    "apifyProxyGroups": ["RESIDENTIAL"]
  },
  "maxRequestRetries": 3
}
```

### Output Format:

```json
{
  "id": "12345678",
  "username": "handmade_serbia",
  "fullName": "Handmade Serbia Shop",
  "biography": "🎨 Handmade nakit | Beograd | Poručite u DM",
  "followersCount": 1250,
  "followsCount": 450,
  "postsCount": 128,
  "isPrivate": false,
  "isVerified": false,
  "profilePicUrl": "https://...",
  "url": "https://instagram.com/handmade_serbia"
}
```

### Alternative Search Types:

**By Location:**
```json
{
  "searchType": "place",
  "search": ["Belgrade, Serbia"],
  "resultsLimit": 100
}
```

**By Username List:**
```json
{
  "searchType": "profile",
  "search": [
    "shop_1",
    "shop_2"
  ]
}
```

---

## 📤 ACTOR 2: Instagram DMs Automation

### Setup:

1. U Apify Storeu traži: **"Instagram DMs Automation"**
2. Odaberi: `aizen0/instagram-dms-automation`
3. Klikni "Try for free"

### Input Configuration:

```json
{
  "sessionCookie": "YOUR_INSTAGRAM_SESSION_ID",
  "recipients": [
    "handmade_serbia",
    "vintage_fashion_bg"
  ],
  "message": "Pozdrav! Videli smo vaš shop i zainteresovani smo za saradnju. Da pričamo? 🚀",
  "delayBetweenMessages": 60,
  "maxMessagesPerRun": 5,
  "proxy": {
    "useApifyProxy": true,
    "apifyProxyGroups": ["RESIDENTIAL"]
  }
}
```

### Instagram Session ID:

**Kako dobiti:**

1. Otvori Chrome/Firefox
2. Idi na https://instagram.com
3. Logiraj se na **@SaveYourTime** profil
4. F12 (Developer Tools) → Application tab
5. Storage → Cookies → https://instagram.com
6. Pronađi cookie sa imenom: `sessionid`
7. Kopiraj **Value** (ceo string, ~60 karaktera)

**Primer:**
```
sessionid: 12345678%3AaBcDeFgHiJkLmNoP%3A28%3AAYdzJeZMEPjRSo...
```

**⚠️ VAŽNO:**
- Session ID ističe nakon ~90 dana
- Mora se ručno obnoviti
- NE DELITI ni sa kim
- Koristiti samo business profil

### Output Format:

```json
{
  "recipient": "handmade_serbia",
  "status": "sent",
  "messageId": "msg_12345",
  "timestamp": "2025-10-16T14:30:22Z",
  "error": null
}
```

---

## 🔗 MAKE.COM INTEGRATION

### Module 1: Run Instagram Scraper

**Module:** Apify → Run Actor

**Settings:**
- **Actor ID:** `apify/instagram-scraper`
- **Run mode:** Synchronous (wait for finish)
- **Timeout:** 300 seconds
- **Memory:** 1024 MB

**Input (dynamic):**
```json
{
  "searchType": "hashtag",
  "search": ["{{hashtag}}"],
  "resultsLimit": {{limit}},
  "addParentData": true,
  "proxy": {
    "useApifyProxy": true
  }
}
```

**Output:**
- `{{1.id}}` - Run ID
- `{{1.status}}` - SUCCEEDED/FAILED
- `{{1.defaultDatasetId}}` - Dataset ID sa rezultatima

### Module 2: Get Dataset Items

**Module:** Apify → Get Dataset Items

**Settings:**
- **Dataset ID:** `{{1.defaultDatasetId}}`
- **Format:** JSON
- **Limit:** 50
- **Offset:** 0

**Output:** Array of scraped profiles

### Module 3: Run DM Automation

**Module:** Apify → Run Actor

**Settings:**
- **Actor ID:** `aizen0/instagram-dms-automation`
- **Run mode:** Synchronous
- **Timeout:** 180 seconds

**Input:**
```json
{
  "sessionCookie": "{{env.INSTAGRAM_SESSION_ID}}",
  "recipients": ["{{username}}"],
  "message": "{{generated_message}}",
  "delayBetweenMessages": 60,
  "maxMessagesPerRun": 1
}
```

---

## 🧪 TESTIRANJE

### Test 1: Scraper Test

**Manual run u Apify Console:**

1. Otvori `apify/instagram-scraper` actor
2. Input config:
```json
{
  "searchType": "hashtag",
  "search": ["#testsrbija"],
  "resultsLimit": 3
}
```
3. Klikni "Start"
4. Čekaj 30-60s
5. Proveri Output → Dataset
6. **Expected:** 1-3 profila sa kompletnim podacima

### Test 2: DM Test (na tvoj profil!)

**Important:** Prvo testuj na SVOJ Instagram profil!

1. Otvori `aizen0/instagram-dms-automation`
2. Input:
```json
{
  "sessionCookie": "YOUR_SESSION_ID",
  "recipients": ["YOUR_INSTAGRAM_USERNAME"],
  "message": "Test poruka - ignore",
  "delayBetweenMessages": 0,
  "maxMessagesPerRun": 1
}
```
3. Start
4. Proveri svoj Instagram inbox
5. **Expected:** DM stigao u "Message Requests"

### Test 3: Make.com Integration

**End-to-end test:**

1. Kreiraj test scenario u Make.com
2. Hardcode hashtag: `#testsrbija`
3. Run Apify Scraper
4. Parse results
5. Generiši test poruku (OpenRouter)
6. Pošalji DM (Apify DM Actor) - **NA SVOJ PROFIL**
7. Proveri Instagram

---

## 🚨 INSTAGRAM ANTI-SPAM

### Limits & Best Practices:

| Aktivnost | Safe Limit | Risky | Ban Risk |
|-----------|------------|-------|----------|
| DM slanje | 5-10/dan | 20/dan | 50+/dan |
| Profil pretraga | 100/dan | 500/dan | 1000+/dan |
| Follow/Unfollow | 20/dan | 50/dan | 100+/dan |

### Red Flags (izbegavati):

- ❌ Slanje DM-ova noću (10 PM - 8 AM)
- ❌ Identičan tekst svim korisnicima
- ❌ Brzo slanje (<30s između poruka)
- ❌ Eksterni linkovi u DM-u
- ❌ Spam ključne reči ("BESPLATNO", "KUPI ODMAH")

### Ako dobiješ "Challenge Required":

**Error:**
```
Challenge required: Please complete the challenge on Instagram
```

**Rešenje:**
1. Logiraj se na Instagram manualno (browser ili app)
2. Reši CAPTCHA ili verifikaciju
3. Generiši novi session ID
4. Pauziraj automation 24-48h

---

## 🔐 PROXY SETUP

### Apify Proxy Types:

| Tip | Cena | Use Case |
|-----|------|----------|
| **DATACENTER** | Jeftino | Low-risk scraping |
| **RESIDENTIAL** | Skupo | Instagram (preporučeno) |
| **GOOGLE_SERP** | Srednje | Google scraping |

**Za Instagram - OBAVEZNO RESIDENTIAL:**

```json
{
  "proxy": {
    "useApifyProxy": true,
    "apifyProxyGroups": ["RESIDENTIAL"],
    "apifyProxyCountry": "RS"  // Serbia IP
  }
}
```

**Zašto?**
- Instagram detektuje datacenter IP-ove
- Residential proxy = pravi korisnički IP
- Niži ban risk

**Cena:**
- Residential proxy: $5-15 za 1GB
- 1 DM ≈ 1MB = $0.005-0.015

---

## 📊 MONITORING

### Apify Dashboard Metrics:

**Actors → Runs → Statistics:**
- Success rate: `95%+` ✅
- Average duration: `30-60s` scraping, `10-20s` DM
- Memory usage: `<500MB`
- Error rate: `<5%`

### Webhook Notifications:

**Setup:**
1. Actor → Webhooks → Create webhook
2. **Event:** On run succeeded/failed
3. **URL:** Make.com webhook URL
4. **Payload:**
```json
{
  "actorId": "{{actorId}}",
  "runId": "{{runId}}",
  "status": "{{status}}",
  "stats": "{{stats}}"
}
```

**Use case:** Real-time alerting u Make.com

---

## 🐛 TROUBLESHOOTING

### Problem: "User not found" error

**Uzrok:** Username ne postoji ili je promenjen

**Rešenje:**
```javascript
// U Make.com dodaj error handler
if (error.message.includes("not found")) {
  updateAirtable({
    status: "Invalid",
    notes: "Username doesn't exist"
  })
}
```

### Problem: "Rate limit exceeded"

**Uzrok:** Previše requesta u kratkom vremenu

**Rešenje:**
1. Smanji `resultsLimit` na 20
2. Dodaj `delayBetweenMessages: 120` (2 min)
3. Run scraper svaka 2 dana umesto dnevno

### Problem: "Proxy error"

**Uzrok:** Residential proxy full ili nedostupan

**Rešenje:**
```json
{
  "proxy": {
    "useApifyProxy": true,
    "apifyProxyGroups": ["RESIDENTIAL"],
    "apifyProxyCountry": "US"  // Fallback na US IP
  }
}
```

### Problem: Session expired

**Error:**
```
Login required: Session cookie is invalid or expired
```

**Rešenje:**
1. Generiši novi session ID (vidi gore)
2. Update u Make.com environment variable
3. Test sa manual run

---

## 💡 OPTIMIZACIJE

### 1. Parallel Scraping (multiple hashtags):

**Scenario:**
```
Trigger → Iterator (hashtags) → Apify Scraper (parallel)
```

**Input:**
```
Hashtags: ["#shop1", "#shop2", "#shop3"]
→ 3 parallel Apify runs
→ Aggregate results
```

### 2. Smart Retry Logic:

```javascript
// U Make.com
if (apifyStatus = "FAILED") {
  if (retryCount < 3) {
    sleep(60)
    retryApify()
    retryCount++
  } else {
    logError()
    sendAlert()
  }
}
```

### 3. Dataset Cleanup:

**Apify Storage → Datasets:**
- Auto-delete datasets older than 7 days
- Saves storage costs

**API call:**
```bash
curl -X DELETE https://api.apify.com/v2/datasets/OLD_DATASET_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📈 SCALING

**Za više od 5 DM/dan:**

### Option 1: Multiple Instagram Accounts

```
Account 1 (@SaveYourTime): 5 DM/day
Account 2 (@SaveYourTime_Shop): 5 DM/day
= 10 DM/day total
```

**Setup:**
- 2 različita session ID-a
- 2 Apify DM Actora
- Router u Make.com (alternira accounte)

### Option 2: Paid Apify Plan

**Starter plan ($49/month):**
- $49 kredita mesečno
- ≈ 1,600 DM-ova
- = 50+ DM/dan

### Option 3: Custom Instagram API

**Za advanced use:**
- Koristi Instagram Graph API (business account)
- Limit: 100 DM/dan
- Zahteva Facebook App approval

---

## 🔒 SECURITY CHECKLIST

- [ ] Session ID čuvan kao environment variable (encrypted)
- [ ] Nikad ne commit-uj session ID u Git
- [ ] Koristi RESIDENTIAL proxy za Instagram
- [ ] Limiti podešeni (5 DM/dan max)
- [ ] Webhook notifikacije aktivne
- [ ] Error handling konfigurisan
- [ ] Backup session ID sačuvan offline

---

## 📚 DODATNI RESURSI

- Apify Instagram Scraper: https://apify.com/apify/instagram-scraper
- Apify DM Automation: https://apify.com/aizen0/instagram-dms-automation
- Apify Docs: https://docs.apify.com
- Apify Community: https://community.apify.com
- Instagram Business API: https://developers.facebook.com/docs/instagram-api

---

## ✅ FINAL CHECKLIST

- [ ] Apify nalog kreiran (free plan)
- [ ] API Token generisan i sačuvan
- [ ] Instagram Scraper actor testiran
- [ ] Instagram session ID ekstraovan
- [ ] DM Automation actor testiran (na svoj profil!)
- [ ] Residential proxy konfigurisan
- [ ] Make.com integracija uspešna
- [ ] Webhook notifikacije postavljene
- [ ] Error handling implementiran
- [ ] Daily limits podešeni (5 DM max)

---

**Prev:** [OpenRouter Setup Guide](./OpenRouter-Setup-Guide.md)  
**Next:** [Complete Workflow Test](./Complete-Workflow-Test.md)

