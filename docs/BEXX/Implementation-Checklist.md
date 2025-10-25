# ✅ Implementation Checklist - Instagram DM Outreach System

**Projekat:** BexExpress Instagram Shop Outreach  
**Datum:** 16. oktobar 2025.

---

## 📋 PRE-IMPLEMENTATION (Pre početka)

### Priprema:

- [ ] **Instagram profil pripreman**
  - [ ] @SaveYourTime profil postavljen kao business account
  - [ ] Profil popunjen (bio, profilna slika, 3+ postova)
  - [ ] Business info dodata (email, telefon)
  - [ ] Verifikovan email za profil

- [ ] **Team spremnost**
  - [ ] Određena osoba za manual reply tracking
  - [ ] Dogovoreno vreme za proveru (npr. svaki dan 5 PM)
  - [ ] Plan za konverzaciju sa zainteresovanim

- [ ] **Budget/Resursi**
  - [ ] Kredit kartica spremna (za Apify $5-6/mesec)
  - [ ] Razumevanje troškova i limita

---

## 🔧 SETUP FASE

### FAZA 1: Account Creation (15 min)

- [ ] **Apify**
  - [ ] Nalog kreiran: https://apify.com
  - [ ] Email verifikovan
  - [ ] Free tier aktiviran ($5 kredita)
  - [ ] API Token generisan
  - [ ] Token sačuvan (safe place)

- [ ] **OpenRouter**
  - [ ] Nalog kreiran: https://openrouter.ai
  - [ ] Email verifikovan
  - [ ] API Key generisan
  - [ ] Site settings: URL = https://saveyourtime.rs
  - [ ] Key sačuvan (safe place)

- [ ] **Airtable**
  - [ ] Nalog kreiran: https://airtable.com
  - [ ] Email verifikovan
  - [ ] Workspace kreiran: "BexExpress"
  - [ ] Personal Access Token generisan
  - [ ] Token sačuvan (safe place)

- [ ] **Make.com**
  - [ ] Nalog kreiran: https://make.com
  - [ ] Email verifikovan
  - [ ] Organization setup
  - [ ] Free plan aktiviran

---

### FAZA 2: Airtable Setup (10 min)

- [ ] **Base kreiran**
  - [ ] Ime: "Instagram DM Outreach"
  - [ ] Icon: 📱
  - [ ] Color: Purple gradient

- [ ] **Tabela: Instagram_Shops**
  - [ ] Kolona: `username` (Single line text)
  - [ ] Kolona: `profile_link` (URL)
  - [ ] Kolona: `bio` (Long text)
  - [ ] Kolona: `followers` (Number)
  - [ ] Kolona: `status` (Single select)
    - [ ] Option: New (Blue)
    - [ ] Option: Sent (Green)
    - [ ] Option: Replied (Purple)
    - [ ] Option: Failed (Red)
    - [ ] Option: Blocked (Gray)
    - [ ] Option: Invalid (Yellow)
  - [ ] Kolona: `generated_message` (Long text)
  - [ ] Kolona: `sent_timestamp` (Date + time)
  - [ ] Kolona: `hashtags_found` (Multiple select)
  - [ ] Kolona: `notes` (Long text)
  - [ ] Kolona: `created_time` (Created time - auto)
  - [ ] Kolona: `last_modified` (Last modified - auto)

- [ ] **Views kreirane**
  - [ ] View 1: "All Profiles" (Grid)
  - [ ] View 2: "Pending Queue" (Grid, filter: status=New)
  - [ ] View 3: "Sent Today" (Grid, filter: today)
  - [ ] View 4: "Needs Follow-up" (Kanban)

- [ ] **Test record**
  - [ ] Manual kreiran test profil
  - [ ] Sva polja popunjena
  - [ ] Validacija da sve radi

---

### FAZA 3: Instagram Session Setup (5 min)

- [ ] **Session ID ekstrakcija**
  - [ ] Logiraj se na instagram.com (@SaveYourTime)
  - [ ] Otvori Developer Tools (F12)
  - [ ] Application → Cookies → instagram.com
  - [ ] Kopiraj `sessionid` cookie vrednost
  - [ ] Sačuvaj u safe file (expires after 90 days!)
  - [ ] Dodaj reminder za renewal (80 dana od danas)

---

### FAZA 4: Make.com Environment Variables (5 min)

- [ ] **Variables postavljene**
  - [ ] Organization Settings → Variables
  - [ ] Kreiran: `OPENROUTER_API_KEY` (secret)
  - [ ] Kreiran: `AIRTABLE_TOKEN` (secret)
  - [ ] Kreiran: `APIFY_TOKEN` (secret)
  - [ ] Kreiran: `INSTAGRAM_SESSION_ID` (secret)
  - [ ] Sve provereno (test access)

---

### FAZA 5: Apify Actors Setup (10 min)

- [ ] **Instagram Scraper Actor**
  - [ ] Pronađen: `apify/instagram-scraper`
  - [ ] "Try for free" kliknut
  - [ ] Test run izvršen (hashtag: #testsrbija, limit: 3)
  - [ ] Output validiran (3 profila pronađeno)

- [ ] **Instagram DM Actor**
  - [ ] Pronađen: `aizen0/instagram-dms-automation`
  - [ ] "Try for free" kliknut
  - [ ] Test run NA SVOJ PROFIL!
  - [ ] DM primljen u inbox
  - [ ] Validacija uspešna

---

### FAZA 6: Scenario 1 - Scraping (30 min)

- [ ] **Scenario kreiran**
  - [ ] Folder: "BexExpress"
  - [ ] Ime: "Instagram Scraping + AI Message Generation"

- [ ] **Moduli dodati (redom):**
  - [ ] 1. Schedule (Daily 10:00)
  - [ ] 2. Apify Run Actor (instagram-scraper)
  - [ ] 3. Apify Get Dataset Items
  - [ ] 4. Filter (bio keywords)
  - [ ] 5. Iterator
  - [ ] 6. HTTP Request (OpenRouter)
  - [ ] 7. Airtable Search Records (duplicate check)
  - [ ] 8. Router (2 routes)
  - [ ] 9. Airtable Create Record

- [ ] **Konfiguracija validirana**
  - [ ] Apify input: hashtag = "#shopserbia", limit = 10
  - [ ] Filter condition: bio contains "shop" OR "prodaja"
  - [ ] OpenRouter: model = "google/gemma-2-9b-it:free"
  - [ ] OpenRouter: max_tokens = 150
  - [ ] Airtable: sva polja mapirana
  - [ ] Environment variables koriste se ({{env.XXX}})

- [ ] **Error handling**
  - [ ] Error handler na HTTP modul (OpenRouter)
  - [ ] Fallback poruka definisana

- [ ] **Test run**
  - [ ] Manual run izvršen
  - [ ] Provera: 1-5 novih profila u Airtable
  - [ ] Provera: AI poruke kvalitetne i <140 chars
  - [ ] Provera: No duplicates (router radi)

---

### FAZA 7: Scenario 2 - DM Sending (30 min)

- [ ] **Scenario kreiran**
  - [ ] Folder: "BexExpress"
  - [ ] Ime: "Instagram DM Automation (5 per day)"

- [ ] **Moduli dodati (redom):**
  - [ ] 1. Schedule (Daily 14:00)
  - [ ] 2. Airtable Search Records (status=New)
  - [ ] 3. Filter (check > 0)
  - [ ] 4. Array Aggregator (limit 5)
  - [ ] 5. Iterator
  - [ ] 6. Sleep (60s)
  - [ ] 7. Apify Run Actor (DM automation)
  - [ ] 8. Airtable Update Record
  - [ ] 9. Slack/Email notification (opciono)

- [ ] **Konfiguracija validirana**
  - [ ] Airtable filter: {status} = "New"
  - [ ] Aggregator limit: 5 items
  - [ ] Sleep duration: 60 seconds
  - [ ] Apify: session ID = {{env.INSTAGRAM_SESSION_ID}}
  - [ ] Apify: recipients = ["{{username}}"]
  - [ ] Apify: message = "{{generated_message}}"
  - [ ] Airtable update: status = "Sent", timestamp = {{now}}

- [ ] **Error handling**
  - [ ] Error handler na Apify DM modul
  - [ ] On error: status = "Failed"
  - [ ] Alert notification podešena

- [ ] **Test run (NA SVOJ PROFIL!)**
  - [ ] Kreiran test record u Airtable (tvoj username)
  - [ ] Manual run scenario 2
  - [ ] Provera: DM stigao u Instagram inbox
  - [ ] Provera: Airtable status updated → "Sent"
  - [ ] Provera: sent_timestamp popunjen

---

## 🧪 TESTING FASE

### Test 1: End-to-End (E2E)

- [ ] **Priprema**
  - [ ] Test Instagram profil kreiran (ili koristi svoj)
  - [ ] Bio sadrži "shop" + hashtag #testsrbija
  - [ ] Profil public (not private)

- [ ] **Execution**
  - [ ] Run Scenario 1 (scraping)
  - [ ] Čekaj 5 minuta
  - [ ] Proveri Airtable: profil dodat (status=New)
  - [ ] Run Scenario 2 (DM sending)
  - [ ] Čekaj 2 minuta
  - [ ] Proveri Instagram inbox: DM stigao
  - [ ] Proveri Airtable: status=Sent

- [ ] **Validacija**
  - [ ] AI poruka kvalitetna
  - [ ] DM successful delivery
  - [ ] Status tracking radi
  - [ ] No errors u Make.com history

---

### Test 2: Error Scenarios

- [ ] **Nepostojeći username**
  - [ ] Dodaj fake username u Airtable
  - [ ] Run Scenario 2
  - [ ] Očekivano: status = "Failed" ili "Invalid"

- [ ] **Invalid API key**
  - [ ] Privremeno promeni OpenRouter key
  - [ ] Run Scenario 1
  - [ ] Očekivano: Fallback poruka korišćena

- [ ] **Duplicate profil**
  - [ ] Dodaj isti profil 2x (run scenario 1 twice)
  - [ ] Očekivano: Drugi put ne kreira novi record

---

### Test 3: Load Test

- [ ] **Simulacija 1 nedelje**
  - [ ] Dan 1: Run Scenario 1 → 10+ profila
  - [ ] Dan 2: Run Scenario 2 → 5 DM-ova
  - [ ] Dan 3-7: Repeat
  - [ ] Validacija: No Instagram ban
  - [ ] Validacija: Success rate >90%

---

## 🚀 PRODUCTION DEPLOYMENT

### Pre-Launch:

- [ ] **Final checks**
  - [ ] Svi testovi passed
  - [ ] Error handling radi
  - [ ] Notifications setup (Slack/Email)
  - [ ] Team trained za manual replies
  - [ ] Backup plan dokumentovan

- [ ] **Schedule aktivacija**
  - [ ] Scenario 1: Aktiviran (10:00 daily)
  - [ ] Scenario 2: Aktiviran (14:00 daily)
  - [ ] Provera: Next run time prikazan

- [ ] **Monitoring setup**
  - [ ] Make.com email notifications ON
  - [ ] Airtable mobile app instaliran
  - [ ] Weekly review planiran (svaki petak)

---

### Launch Day:

- [ ] **Morning (9:00)**
  - [ ] Final check svih API keys (validan?)
  - [ ] Instagram session ID fresh (<7 dana stara)
  - [ ] Airtable prazan (očisti test data)

- [ ] **First Run (10:00)**
  - [ ] Monitor Scenario 1 execution
  - [ ] Check Make.com history (success?)
  - [ ] Check Airtable (profili dodati?)
  - [ ] Review AI poruke (kvalitet OK?)

- [ ] **Second Run (14:00)**
  - [ ] Monitor Scenario 2 execution
  - [ ] Check Instagram (DM-ovi poslati?)
  - [ ] Check Airtable (status updated?)
  - [ ] Count: Max 5 DM-ova poslato

- [ ] **Evening (18:00)**
  - [ ] Check Instagram inbox (replies?)
  - [ ] Update Airtable manual (status=Replied)
  - [ ] Respond to interested leads

---

## 📊 WEEK 1 MONITORING

### Daily Checks:

- [ ] **Dan 1**
  - [ ] Runs uspešni (10:00 & 14:00)
  - [ ] No errors u Make.com
  - [ ] Profiles scraped: ___
  - [ ] DMs sent: ___
  - [ ] Instagram status: ✅ No ban

- [ ] **Dan 2**
  - [ ] Runs uspešni
  - [ ] Profiles scraped: ___
  - [ ] DMs sent: ___
  - [ ] Replies: ___
  - [ ] Instagram status: ✅

- [ ] **Dan 3**
  - [ ] Runs uspešni
  - [ ] Profiles: ___
  - [ ] DMs: ___
  - [ ] Replies: ___
  - [ ] Status: ✅

- [ ] **Dan 4**
  - [ ] [Repeat]

- [ ] **Dan 5**
  - [ ] [Repeat]

- [ ] **Dan 6**
  - [ ] [Repeat]

- [ ] **Dan 7 - Weekly Review**
  - [ ] Total profiles scraped: ___
  - [ ] Total DMs sent: ___ (target: 35)
  - [ ] Total replies: ___ (target: >7)
  - [ ] Success rate: ___% (target: >90%)
  - [ ] Instagram ban: NO ✅
  - [ ] Issues encountered: ___
  - [ ] Action items: ___

---

## 🔄 ONGOING MAINTENANCE

### Weekly:

- [ ] **Check session ID** (expiry reminder)
- [ ] **Review AI prompts** (optimize if needed)
- [ ] **Analyze reply rate** (adjust strategy)
- [ ] **Check Apify credits** (balance OK?)
- [ ] **Backup Airtable** (export CSV)

### Monthly:

- [ ] **Regenerate session ID** (if close to 90 days)
- [ ] **Review hashtag performance** (which best?)
- [ ] **Optimize filtering** (followers range OK?)
- [ ] **A/B test messages** (new prompts?)
- [ ] **Scale decision** (increase DM limit?)

### Quarterly:

- [ ] **Full system audit**
- [ ] **Cost review** (optimize spending?)
- [ ] **ROI analysis** (conversions vs cost)
- [ ] **Team feedback** (improvements?)
- [ ] **Documentation update**

---

## 🚨 INCIDENT RESPONSE

### Instagram Ban:

- [ ] **Immediate**
  - [ ] Pause oba scenarija (schedule OFF)
  - [ ] Ne pokušavaj slati DM-ove 48h
  - [ ] Check Instagram: Soft ban ili hard ban?

- [ ] **Recovery**
  - [ ] Solve any challenges/CAPTCHAs
  - [ ] Regenerate session ID
  - [ ] Wait 48-72h
  - [ ] Resume sa 3 DM/day (ne 5)
  - [ ] Monitor 1 nedelju pre povećanja

### Session Expired:

- [ ] **Fix**
  - [ ] Logiraj se na Instagram
  - [ ] Generiši novi session ID
  - [ ] Update Make.com environment variable
  - [ ] Test sa manual run
  - [ ] Resume schedule

### Apify Credits Depleted:

- [ ] **Immediate**
  - [ ] Dodaj kredite (purchase)
  - [ ] Ili pause oba scenarija
  - [ ] Calculate burn rate

- [ ] **Optimize**
  - [ ] Smanji scraping frequency (every 2 days)
  - [ ] Reduce results limit (30 umesto 50)
  - [ ] Koristi datacenter proxy (jeftiniji)

---

## 📈 SUCCESS CRITERIA

### Mesec 1:

- [ ] **System stability**
  - [ ] Uptime: >95%
  - [ ] Error rate: <5%
  - [ ] No Instagram ban

- [ ] **Volume**
  - [ ] Profiles scraped: >200
  - [ ] DMs sent: >150 (5/dan × 30)

- [ ] **Engagement**
  - [ ] Reply rate: >20% (30+ replies)
  - [ ] Interest rate: >10% (15+ interested)
  - [ ] Conversion: >5% (7+ clients)

---

## ✅ FINAL SIGN-OFF

### Pre-Production:

- [ ] All setup phases completed
- [ ] All tests passed
- [ ] Team trained
- [ ] Documentation reviewed
- [ ] Backup plan in place

### Production:

- [ ] Scenarios scheduled
- [ ] First runs successful
- [ ] Monitoring active
- [ ] Team responsive

### Go/No-Go Decision:

**Decision:** ✅ GO / ❌ NO-GO  
**Date:** _______________  
**Signed:** _______________

---

**Napomena:** Ovo je living document. Update-uj ga kako sistem evolvira!

