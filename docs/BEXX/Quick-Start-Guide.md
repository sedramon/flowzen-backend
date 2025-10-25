# 🚀 Quick Start Guide - Instagram DM Outreach System

**Za:** BexExpress Project  
**Datum:** 16. oktobar 2025.  
**Procenjeno vreme:** 2-3 sata

---

## 📋 PRE-REQUISITES

Potrebni nalozi (svi besplatni):

- [ ] Instagram business profil (@SaveYourTime)
- [ ] Apify nalog (free tier)
- [ ] OpenRouter nalog (free models)
- [ ] Airtable nalog (free plan)
- [ ] Make.com nalog (free plan)

---

## ⚡ QUICK SETUP (30 minuta)

### Korak 1: Airtable (5 min)

1. **Kreiraj Base:**
   - Workspace: `BexExpress`
   - Base: `Instagram DM Outreach`

2. **Kreiraj Tabelu:** `Instagram_Shops`

**Kolone:**
```
- username (Single line text)
- profile_link (URL)
- bio (Long text)
- followers (Number)
- status (Single select: New, Sent, Replied, Failed, Blocked)
- generated_message (Long text)
- sent_timestamp (Date - include time)
- hashtags_found (Multiple select)
- notes (Long text)
```

3. **Generiši API Token:**
   - https://airtable.com/create/tokens
   - Scopes: `data.records:read`, `data.records:write`
   - Kopiraj token → sačuvaj

✅ **Test:** Kreiraj manual test record

---

### Korak 2: OpenRouter (5 min)

1. **Registracija:** https://openrouter.ai
2. **Generiši API Key:**
   - Dashboard → Keys → Create Key
   - Name: `Make.com Integration`
   - Kopiraj key → sačuvaj

3. **Site Settings:**
   - URL: `https://saveyourtime.rs`
   - Name: `BexExpress`

✅ **Test:** cURL request (vidi OpenRouter Setup Guide)

---

### Korak 3: Apify (10 min)

1. **Registracija:** https://apify.com
2. **API Token:**
   - Settings → Integrations → API tokens
   - Create new token
   - Kopiraj → sačuvaj

3. **Dodaj Actore:**
   - `apify/instagram-scraper` → Save
   - `aizen0/instagram-dms-automation` → Save

4. **Instagram Session ID:**
   ```
   1. Logiraj se na instagram.com (@SaveYourTime)
   2. F12 → Application → Cookies
   3. Kopiraj `sessionid` vrednost
   4. Sačuvaj
   ```

✅ **Test:** Run Instagram Scraper sa hashtag `#testsrbija` (limit 3)

---

### Korak 4: Make.com (10 min)

1. **Registracija:** https://make.com
2. **Environment Variables:**
   ```
   Organization Settings → Variables → Create:
   
   - OPENROUTER_API_KEY = sk-or-v1-xxxxx
   - AIRTABLE_TOKEN = patxxxxx
   - APIFY_TOKEN = apify_api_xxxxx
   - INSTAGRAM_SESSION_ID = (session cookie)
   ```

3. **Kreiraj Folder:** `BexExpress`

✅ **Test:** Verify variables saved

---

## 🔨 BUILD SCENARIOS (60 minuta)

### Scenario 1: Instagram Scraping Pipeline (30 min)

**Naziv:** `Instagram Scraping + AI Message Generation`

**Moduli (redom):**

1. **Schedule** (Daily 10:00)
2. **Apify - Run Actor**
   - Actor: `apify/instagram-scraper`
   - Input:
   ```json
   {
     "searchType": "hashtag",
     "search": ["#shopserbia"],
     "resultsLimit": 10
   }
   ```
3. **Apify - Get Dataset Items**
   - Dataset ID: `{{2.defaultDatasetId}}`
4. **Filter**
   - Condition: `{{3.biography}}` contains "shop" OR "prodaja"
5. **Iterator**
   - Array: `{{3.value[]}}`
6. **HTTP - OpenRouter**
   - URL: `https://openrouter.ai/api/v1/chat/completions`
   - Headers:
   ```json
   {
     "Authorization": "Bearer {{env.OPENROUTER_API_KEY}}",
     "Content-Type": "application/json"
   }
   ```
   - Body:
   ```json
   {
     "model": "google/gemma-2-9b-it:free",
     "messages": [
       {
         "role": "system",
         "content": "Generiši kratku Instagram DM poruku (max 140 karaktera) na srpskom za poslovnu saradnju."
       },
       {
         "role": "user",
         "content": "Username: {{5.username}}\nBio: {{5.biography}}\nPoruka za saradnju sa @SaveYourTime:"
       }
     ],
     "max_tokens": 150
   }
   ```
7. **Airtable - Search Records**
   - Formula: `{username} = "{{5.username}}"`
8. **Router**
   - Route 1: If `{{7.id}}` exists → STOP
   - Route 2: If `{{7.id}}` empty → Continue
9. **Airtable - Create Record**
   ```json
   {
     "username": "{{5.username}}",
     "profile_link": "https://instagram.com/{{5.username}}",
     "bio": "{{5.biography}}",
     "followers": {{5.followersCount}},
     "status": "New",
     "generated_message": "{{6.choices[0].message.content}}",
     "hashtags_found": "#shopserbia"
   }
   ```

**Save & Test:**
- Run once manually
- Check Airtable → should have 1-5 new records

---

### Scenario 2: DM Sending Pipeline (30 min)

**Naziv:** `Instagram DM Automation (5 per day)`

**Moduli (redom):**

1. **Schedule** (Daily 14:00)
2. **Airtable - Search Records**
   - Formula: `{status} = "New"`
   - Max records: 10
   - Sort: Created time ASC
3. **Filter**
   - Condition: `{{length(2.value[])}}` > 0
4. **Array Aggregator**
   - Source: Module 2
   - Max items: 5
5. **Iterator**
   - Array: `{{4.array[]}}`
6. **Sleep** (60 seconds)
7. **Apify - Run Actor**
   - Actor: `aizen0/instagram-dms-automation`
   - Input:
   ```json
   {
     "sessionCookie": "{{env.INSTAGRAM_SESSION_ID}}",
     "recipients": ["{{5.username}}"],
     "message": "{{5.message}}",
     "delayBetweenMessages": 60,
     "maxMessagesPerRun": 1
   }
   ```
8. **Airtable - Update Record**
   - Record ID: `{{5.id}}`
   - Fields:
   ```json
   {
     "status": "Sent",
     "sent_timestamp": "{{now}}"
   }
   ```
9. **Error Handler** (attach to Module 7)
   - On error: Update status to "Failed"

**Save & Test:**
- Prvo dodaj test record u Airtable (tvoj Instagram username!)
- Run scenario
- Check Instagram - treba da stigao DM

---

## 🧪 TESTING (30 minuti)

### Test 1: End-to-End (E2E) Test

**Setup:**
1. Kreiraj test Instagram profil ili koristi svoj
2. Dodaj hashtag `#testsrbija` u bio
3. Post sliku sa `#testsrbija`

**Execution:**
1. Run Scenario 1 (Scraping)
   - ✅ Treba da pronađe tvoj profil
   - ✅ Generiše poruku
   - ✅ Dodaje u Airtable
2. Run Scenario 2 (DM Sending)
   - ✅ Treba da pročita Airtable
   - ✅ Pošalje DM na tvoj profil
   - ✅ Update status na "Sent"
3. Check Instagram inbox
   - ✅ DM stigao u Message Requests

**Expected Results:**
- Airtable ima 1 novi record
- Status = "Sent"
- Instagram inbox ima novu poruku
- sent_timestamp popunjen

---

### Test 2: Error Handling

**Test scenariji:**

**A) Nepostojeći username:**
1. U Airtable dodaj record: `username: "nonexistentuser123456"`
2. Run Scenario 2
3. ✅ Status treba da bude "Failed"

**B) Invalid session ID:**
1. U Make.com promeni `INSTAGRAM_SESSION_ID` na random string
2. Run Scenario 2
3. ✅ Error handler treba da uhvati grešku

**C) OpenRouter API limit:**
1. Privremeno promeni API key na invalid
2. Run Scenario 1
3. ✅ Treba da koristi fallback poruku

---

### Test 3: Performance Test

**Simuliraj 1 sedmicu:**

1. **Dan 1-3:** Run Scenario 1 svaki dan (scraping)
   - Expected: 15-30 novih profila u Airtable
2. **Dan 4-7:** Run Scenario 2 svaki dan (DM slanje)
   - Expected: 5 DM-ova poslato dnevno = 20 total
3. **Check metrics:**
   - Success rate: >90%
   - AI message quality: manual review
   - Instagram ban: none (ako nije - smanji na 3 DM/dan)

---

## 📊 MONITORING SETUP (15 minuta)

### 1. Make.com Dashboard

**Scenario History:**
- Proveri runs za poslednjih 7 dana
- Success rate treba biti >95%
- Average execution time: <5 min

### 2. Airtable Views

**Kreiraj Views:**

**View: "Pending Queue"**
- Filter: `{status} = "New"`
- Sort: Created time (oldest first)

**View: "Sent Today"**
- Filter: `{sent_timestamp} = TODAY()`
- Sort: sent_timestamp DESC

**View: "Needs Follow-up"**
- Filter: `{status} = "Sent"` AND `{sent_timestamp} < 3 days ago`
- Manual: Check Instagram for replies

### 3. Notifikacije (Opciono)

**Slack Integration:**
1. Make.com → Add Slack module na kraju Scenario 2
2. Message:
```
📊 Daily DM Report:
✅ Sent: {{totalSent}}
❌ Failed: {{totalFailed}}
```

---

## 🚨 TROUBLESHOOTING CHEAT SHEET

| Problem | Mogući Uzrok | Rešenje |
|---------|--------------|---------|
| Scenario ne radi | Triggering nije podešen | Check Schedule settings |
| Apify error | API token invalid | Regenerate token |
| DM ne stiže | Session ID expired | Get new session ID |
| Duplicate records | Router ne radi | Check Airtable search formula |
| AI poruke loše | Prompt nije dobar | Optimize system prompt |
| Instagram ban | Previše DM-ova | Pause 48h, smanji na 3/dan |

---

## 📈 NEXT STEPS

### Nedelja 1: Monitoring
- Run svaki dan manually
- Track success rate
- Fix errors

### Nedelja 2: Optimization
- A/B test AI prompts
- Optimize hashtag liste
- Fine-tune filtering

### Nedelja 3: Scaling
- Increase DM limit na 10/dan (ako nema ban-a)
- Add više hashtag kategorija
- Implement reply tracking

### Mesec 2: Automation
- Full automation (no manual runs)
- Advanced reply detection
- Multi-account setup

---

## ✅ FINAL CHECKLIST

**Pre Production:**

- [ ] Svi nalozi kreirani i verifikovani
- [ ] Environment variables sačuvane
- [ ] Scenario 1 testiran (scraping)
- [ ] Scenario 2 testiran (DM sending)
- [ ] E2E test uspešan
- [ ] Error handling radi
- [ ] Airtable views konfigurisane
- [ ] Monitoring setup
- [ ] Instagram ban rizik minimiziran (5 DM/dan max)
- [ ] Backup plan (session ID, API keys)

**Production Ready:**

- [ ] Schedule aktiviran (10:00 & 14:00)
- [ ] Notifikacije aktivne
- [ ] Weekly check-in planiran
- [ ] Team obuče kako ručno reply-ovati

---

## 🎯 SUCCESS METRICS

**Target za prvi mesec:**

- **Profili pronađeni:** 200+
- **DM-ovi poslati:** 150 (5/dan × 30 dana)
- **Reply rate:** >20% (30+ odgovora)
- **Conversion rate:** >5% (7+ novih klijenata)
- **Ban rate:** 0% (no Instagram restrictions)

---

## 📚 DODATNA DOKUMENTACIJA

Za detalje vidi:

1. [Instagram DM Outreach System - Main Doc](./Instagram-DM-Outreach-System.md)
2. [Make Scenario 1 - Scraping](./Make-Scenario-1-Scraping.md)
3. [Make Scenario 2 - DM Sending](./Make-Scenario-2-DM-Sending.md)
4. [Airtable Setup Guide](./Airtable-Setup-Guide.md)
5. [OpenRouter Setup Guide](./OpenRouter-Setup-Guide.md)
6. [Apify Setup Guide](./Apify-Setup-Guide.md)

---

## 🆘 SUPPORT

**Pitanja?**
- Make.com Community: https://community.make.com
- Apify Discord: https://discord.gg/apify
- OpenRouter Discord: https://discord.gg/openrouter

**Emergency Contact:**
- Instagram ban: https://help.instagram.com
- Apify support: support@apify.com
- Make.com support: support@make.com

---

**🚀 Spreman za launch! Good luck!**

