# 📤 Make.com Scenario 2: DM Sending Pipeline

**Naziv:** `Instagram DM Automation (5 per day)`  
**Trigger:** Scheduled - svaki dan u 14:00  
**Trajanje:** ~3-5 minuta

---

## 📋 MODUL LISTA

1. **Schedule Trigger**
2. **Airtable - Search Records (status: New)**
3. **Filter - Check if has messages**
4. **Array Aggregator - Limit to 5**
5. **Iterator - Loop Through Messages**
6. **Sleep - 60s delay**
7. **Apify - Send Instagram DM**
8. **Airtable - Update Record Status**
9. **Error Handler - Failed DMs**
10. **Slack/Email - Daily Report**

---

## 🔧 DETALJNI SETUP

### 1. Schedule Trigger

**Module:** Tools → Schedule

```
Interval: 1 day
Time: 14:00
Timezone: Europe/Belgrade
Days: Monday to Friday (skip weekends)
```

**Napomena:** Ne slati DM-ove vikendom - niža stopa odgovora

---

### 2. Airtable - Search Records

**Module:** Airtable → Search Records

**Connection:** Airtable account

**Base:** BexExpress  
**Table:** Instagram_Shops

**Filter Formula:**
```
AND(
  {status} = "New",
  {generated_message} != ""
)
```

**Sort:**
```
Field: Created Time
Direction: Ascending (oldest first)
```

**Max Records:** 10  
(uzmi 10, ali ćemo limitirati na 5)

---

### 3. Filter - Check if has messages

**Module:** Flow Control → Filter

**Condition:**
```
{{length(2.value[])}} > 0
```

**Label:** "Has Pending Messages"

**If false:** Stop execution (nema poruka za slanje)

---

### 4. Array Aggregator - Limit to 5

**Module:** Tools → Array Aggregator

**Source Module:** #2 (Airtable Search)

**Aggregated Fields:**
```
- id: {{2.value[].id}}
- username: {{2.value[].username}}
- message: {{2.value[].generated_message}}
```

**Stop processing after:** 5 items

**Output:** Array of max 5 records

---

### 5. Iterator - Loop Through Messages

**Module:** Flow Control → Iterator

**Array:** `{{4.array[]}}`

**Output:** Individual message per iteration

**Settings:**
- Max iterations: 5
- On error: Continue

---

### 6. Sleep - Anti-Spam Delay

**Module:** Tools → Sleep

**Delay:** 60 seconds

**Reason:** Instagram anti-spam protection  
(ne više od 1 DM per minut)

---

### 7. Apify - Send Instagram DM

**Module:** Apify → Run Actor

**Actor ID:** `apify/instagram-dm-sender`

**Input:**
```json
{
  "sessionCookie": "{{env.INSTAGRAM_SESSION_ID}}",
  "recipients": [
    "{{5.username}}"
  ],
  "message": "{{5.message}}",
  "delayBetweenMessages": 60,
  "maxRetries": 2,
  "proxy": {
    "useApifyProxy": true,
    "apifyProxyGroups": ["RESIDENTIAL"]
  }
}
```

**Alternative Actor:** `aizen0/instagram-dms-automation` (ako apify/instagram-dm-sender ne postoji)

**Wait for finish:** 120 seconds

**Output:**
- `{{7.status}}` → success/failed
- `{{7.defaultDatasetId}}` → results

---

### 8. Airtable - Update Record Status

**Module:** Airtable → Update a Record

**Record ID:** `{{5.id}}`

**Fields:**
```json
{
  "status": "{{if(7.status = 'SUCCEEDED'; 'Sent'; 'Failed')}}",
  "sent_timestamp": "{{if(7.status = 'SUCCEEDED'; now; empty)}}",
  "notes": "{{if(7.status = 'SUCCEEDED'; 'DM sent successfully'; 7.error.message)}}"
}
```

---

### 9. Error Handler - Failed DMs

**Module:** Tools → Error Handler

**Attach to:** #7 (Apify DM Sending)

**On Error:**

**Route 1:** Session Expired
- Condition: Error contains "session"
- Action: Send alert + stop execution

**Route 2:** User Not Found
- Condition: Error contains "user not found"
- Action: Update status to "Invalid"

**Route 3:** Rate Limited
- Condition: Error contains "rate limit"
- Action: Wait 1 hour + retry

**Fallback:**
- Log error to separate Airtable table
- Update record status to "Failed"
- Continue with next message

---

### 10. Slack/Email - Daily Report

**Module:** Slack → Send Message (or Email)

**Trigger:** After all iterations complete

**Channel:** #bexexpress-notifications

**Message:**
```
📊 *Instagram DM Report - {{formatDate(now; 'DD.MM.YYYY')}}*

✅ DMs poslato: {{totalSent}}
❌ Neuspelo: {{totalFailed}}
📋 Na čekanju: {{totalPending}}

Detalji: https://airtable.com/xxxxx
```

**Advanced:**
```javascript
totalSent = count(status = 'Sent')
totalFailed = count(status = 'Failed')  
totalPending = count(status = 'New')
```

---

## 🔒 BEZBEDNOST - SESSION MANAGEMENT

### Instagram Session ID Setup

**Dobijanje Session ID:**

1. Otvori Chrome/Firefox
2. Idi na instagram.com
3. Logiraj se na **@SaveYourTime** profil
4. F12 → Application → Cookies → instagram.com
5. Nađi `sessionid` cookie
6. Kopiraj vrednost (60+ karaktera)

**Primer:**
```
sessionid: 12345678%3AaBcDeFgHiJkLmNoP%3A28%3AAYd...
```

### Čuvanje u Make.com:

```
Organization Settings → Variables → Create Variable

Name: INSTAGRAM_SESSION_ID
Value: [paste session ID]
Type: Secret (encrypted)
```

**⚠️ VAŽNO:**
- Session ID ističe nakon 90 dana
- Mora se ručno obnoviti
- NE DELITI sa nikim
- Koristiti samo business profil

---

## 🚨 INSTAGRAM RATE LIMITS

### Sigurni Limiti (2025):

| Aktivnost | Dnevni Limit | Delay između |
|-----------|--------------|--------------|
| DM slanje | **5 poruka** | 60 sekundi |
| Profil pretraga | 100 | 2 sekunde |
| Follow/Unfollow | 20 | 30 sekundi |

### Rizični Paterni (IZBEGAVATI):

- ❌ Slanje 10+ DM-ova u sat
- ❌ Identičan tekst svim korisnicima
- ❌ Slanje noću (10 PM - 8 AM)
- ❌ Slanje istom korisniku 2x
- ❌ DM sa ekstenim linkovima

### Ako dobiješ ban:

1. **Soft ban (24h):**
   - Pauziraj DM slanje
   - Čekaj 24-48h
   - Nastavi sa 3 DM/dan

2. **Hard ban (7-30 dana):**
   - Promeni session (drugi telefon)
   - Smanji na 2 DM/dan
   - Koristi više variation u tekstu

3. **Account ban:**
   - Apeliraj na Instagram Support
   - Koristi novi business profil

---

## 📊 MONITORING & ANALYTICS

### Make.com History Tracking:

**Dashboard metrike:**
```
- Total runs today: {{todayRuns}}
- Success rate: {{successRate}}%
- Average execution time: {{avgTime}}s
- Errors last 24h: {{errors24h}}
```

### Airtable Views:

**View 1: Sent Today**
```
Filter: {sent_timestamp} = TODAY()
Sort: sent_timestamp DESC
```

**View 2: Pending Queue**
```
Filter: {status} = "New"
Sort: Created Time ASC
```

**View 3: Failed Messages**
```
Filter: {status} = "Failed"
Sort: sent_timestamp DESC
```

### Weekly Report:

```
📈 Nedeljni izveštaj ({{weekStart}} - {{weekEnd}})

Profili pronađeni: {{weeklyScraped}}
DM-ovi poslati: {{weeklySent}}
Odgovori primljeni: {{weeklyReplies}}
Conversion rate: {{conversionRate}}%

Top hashtag: {{topHashtag}}
Best performing time: {{bestTime}}
```

---

## 🔄 RETRY LOGIC

### Failed DM Retry Strategy:

**Scenario 3 (Optional):** Retry Failed Messages

**Trigger:** Daily at 16:00

**Logic:**
```
1. Search Airtable: status = "Failed"
2. Filter: retry_count < 3
3. Wait 2 hours from first attempt
4. Retry sending
5. Update retry_count++
6. If retry_count = 3 → status = "Permanently Failed"
```

---

## ✅ TESTIRANJE

### Test Mode Setup:

**Pre-production test:**

1. **Kreiraj test Airtable record:**
```json
{
  "username": "YOUR_OWN_INSTAGRAM",
  "status": "New",
  "generated_message": "Test poruka - ignore"
}
```

2. **Run scenario manually**

3. **Proveri:**
   - Da li je DM stigao u inbox?
   - Da li je status updated na "Sent"?
   - Da li je timestamp tačan?

4. **Test error handling:**
   - Koristi nepostojeći username
   - Proveri da li error handler radi

### Production Checklist:

- ✅ Session ID validan i ažuran
- ✅ Airtable ima minimum 5 "New" records
- ✅ Slack/Email notifikacije rade
- ✅ Schedule postavljen na 14:00
- ✅ Limiti podešeni na 5 DM/dan
- ✅ Error handler testiran

---

## 🐛 TROUBLESHOOTING

### Problem: "Challenge Required" error

**Uzrok:** Instagram sumnja na bot aktivnost

**Rešenje:**
1. Logiraj se na Instagram manualno
2. Reši CAPTCHA/challenge
3. Generiši novi session ID
4. Pauziraj 48h pre nastavka

---

### Problem: Session ID ne radi

**Rešenje:**
1. Proveri da li je kopirano cele vrednost
2. Proveri da li ima `%3A` u stringu (enkodovani `:`)
3. Generiši novi iz privatnog browsera
4. Proveri da li je profil business account

---

### Problem: DM-ovi ne stižu

**Rešenje:**
1. Proveri Instagram "Message Requests"
2. Recipient mora da prati @SaveYourTime ili da prihvati request
3. Proveri da li je recipient profil public
4. Test sa poznatim nalogom koji te prati

---

### Problem: Apify actor fails

**Rešenje:**
1. Proveri Apify kredit balance
2. Proveri actor logs u Apify dashboard
3. Testir sa `maxRetries: 3`
4. Koristi RESIDENTIAL proxy (skuplje ali pouzdanije)

---

## 🚀 OPTIMIZACIJE

### A/B Testing Poruka:

**Scenario 4 (Advanced):** Message Variant Testing

```
1. Create 3 message variants in OpenRouter
2. Randomly assign variant to each profile
3. Track reply rate per variant
4. Auto-optimize to best performing variant
```

### Smart Scheduling:

```javascript
// Najbolje vreme za slanje DM-ova:
if (dayOfWeek = Tuesday OR Thursday) {
  sendTime = 14:00 // highest engagement
} else if (dayOfWeek = Friday) {
  sendTime = 12:00 // pre vikenda
} else {
  sendTime = 15:00 // default
}
```

### Personalization Level 2:

```
// Dodaj u AI prompt:
- Poslednji post content
- Broj postova u poslednjih 7 dana
- Tip proizvoda (jewelry, clothes, art)
- Targeting message po kategoriji
```

---

## 📈 SCALING

**Kada dostigneš 70%+ reply rate:**

1. Povećaj na **10 DM/dan** (pažljivo!)
2. Dodaj drugi Instagram profil
3. Koristi više hashtag kategorija
4. Implement lead scoring (prioritize high-value shops)

**Multi-account setup:**

```
Profile 1 (@SaveYourTime): Handmade shops
Profile 2 (@SaveYourTime_Fashion): Fashion shops  
Profile 3 (@SaveYourTime_Art): Art & crafts

= 5 DM × 3 accounts = 15 DM/day total
```

---

**Prev:** [Make Scenario 1 - Scraping](./Make-Scenario-1-Scraping.md)  
**Next:** [Airtable Setup Guide](./Airtable-Setup-Guide.md)

