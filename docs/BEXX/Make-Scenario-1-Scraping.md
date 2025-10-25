# 🔄 Make.com Scenario 1: Instagram Scraping Pipeline

**Naziv:** `Instagram Scraping + AI Message Generation`  
**Trigger:** Scheduled - svaki dan u 10:00  
**Trajanje:** ~5-10 minuta

---

## 📋 MODUL LISTA

1. **Schedule Trigger**
2. **Apify - Run Instagram Hashtag Scraper**
3. **Apify - Get Dataset Items (Hashtag Results)**
4. **Filter - Bio Keywords Check**
5. **Iterator - Loop Through Posts**
6. **Apify - Run Instagram Profile Scraper** (unutar Iterator-a)
7. **Apify - Get Dataset Items (Profile Details)** (unutar Iterator-a)
8. **HTTP - OpenRouter AI Request**
9. **Airtable - Search Record (duplicate check)**
10. **Router - Check if exists**
11. **Airtable - Create New Record**
12. **Error Handler**

---

## 🔧 DETALJNI SETUP

### 1. Schedule Trigger

**Module:** Tools → Schedule

```
Interval: 1 day
Time: 10:00
Timezone: Europe/Belgrade
```

---

### 2. Apify - Run Instagram Hashtag Scraper

**Module:** Apify → Run Actor

**Connection:** Apify account (API Token)

**Settings:**
```json
{
  "actorId": "apify/instagram-hashtag-scraper",
  "input": {
    "searchType": "hashtag",
    "search": [
      "#shopserbia",
      "#handmadebalkan", 
      "#onlineprodaja",
      "#prodajasrbija"
    ],
    "resultsLimit": 50,
    "addParentData": true,
    "proxy": {
      "useApifyProxy": true
    }
  },
  "timeout": 300,
  "memory": 1024,
  "waitForFinish": 180
}
```

**Output mapping:**
- `{{2.id}}` → Actor Run ID
- `{{2.defaultDatasetId}}` → Dataset ID

---

### 3. Apify - Get Dataset Items (Hashtag Results)

**Module:** Apify → Get Dataset Items

**Settings:**
```
Dataset ID: {{3.defaultDatasetId}}
Limit: 50
Offset: 0
Format: json
```

**Output:** Array of posts with ownerUsername

---

### 4. Filter - Bio Keywords Check

**Module:** Flow Control → Filter

**Condition:**
```javascript
{{4.caption}} matches (case insensitive):
  shop|prodaja|online|kupovina|naručivanje|handmade

AND

{{4.ownerUsername}} is not empty
```

**Label:** "Filter Shop Posts"

---

### 5. Iterator - Loop Through Posts

**Module:** Flow Control → Iterator

**Array:** `{{4.value[]}}`

**Output:** Individual post per iteration

---

### 6. Apify - Run Instagram Profile Scraper (unutar Iterator-a)

**Module:** Apify → Run Actor

**Settings:**
```json
{
  "actorId": "apify/instagram-scraper",
  "input": {
    "directUrls": [
      "https://www.instagram.com/{{5.ownerUsername}}/"
    ],
    "resultsType": "details",
    "resultsLimit": 1,
    "addParentData": false
  },
  "timeout": 120,
  "memory": 512,
  "waitForFinish": 60
}
```

**Output mapping:**
- `{{6.id}}` → Profile Actor Run ID
- `{{6.defaultDatasetId}}` → Profile Dataset ID

---

### 7. Apify - Get Dataset Items (Profile Details) (unutar Iterator-a)

**Module:** Apify → Get Dataset Items

**Settings:**
```
Dataset ID: {{7.defaultDatasetId}}
Limit: 1
Offset: 0
Format: json
```

**Output:** Profile details (username, biography, followersCount, isPrivate)

---

### 8. HTTP - OpenRouter AI Request

**Module:** HTTP → Make a Request

**URL:** `https://openrouter.ai/api/v1/chat/completions`

**Method:** POST

**Headers:**
```json
{
  "Authorization": "Bearer {{env.OPENROUTER_API_KEY}}",
  "Content-Type": "application/json",
  "HTTP-Referer": "https://saveyourtime.rs",
  "X-Title": "BexExpress DM Generator"
}
```

**Body (JSON):**
```json
{
  "model": "meta-llama/llama-3.2-3b-instruct:free",
  "messages": [
    {
      "role": "system",
      "content": "Ti si AI asistent koji generiše personalizovane, prirodne Instagram DM poruke za poslovnu saradnju. Poruke treba da budu prijateljske, kratke (max 140 karaktera) i specifične za profil. Uvek koristi prijateljski ton i srpski jezik."
    },
    {
      "role": "user",
      "content": "Generiši DM poruku za Instagram profil:\n\nUsername: @{{8.username}}\nBio: {{8.biography}}\nFollowers: {{8.followersCount}}\n\nPoruka treba da:\n- Pozove na saradnju sa @SaveYourTime platformom\n- Bude specifična za njihov shop\n- Bude max 140 karaktera\n- Ne koristi emoji previše\n- Zvuči prirodno i ljudski\n\nSamo napiši poruku, bez dodatnih objašnjenja."
    }
  ],
  "max_tokens": 150,
  "temperature": 0.8,
  "top_p": 0.9
}
```

**Parse Response:** Yes

**Output mapping:**
```
Generated Message: {{9.choices[].message.content}}
```

---

### 9. Airtable - Search Record (Duplicate Check)

**Module:** Airtable → Search Records

**Connection:** Airtable account (Personal Access Token)

**Base:** BexExpress  
**Table:** Instagram_Shops

**Formula:**
```
{username} = "{{8.username}}"
```

**Max Records:** 1

**Output:** Existing record or empty

---

### 10. Router - Check if Exists

**Module:** Flow Control → Router

**Route 1:** "Profile Already Exists"
- Filter: `{{9.id}}` exists
- Action: Stop execution (no duplicate)

**Route 2:** "New Profile"
- Filter: `{{9.id}}` does not exist
- Action: Continue to Airtable create

---

### 11. Airtable - Create New Record

**Module:** Airtable → Create a Record

**Base:** BexExpress  
**Table:** Instagram_Shops

**Fields:**
```json
{
  "username": "{{8.username}}",
  "profile_link": "https://instagram.com/{{8.username}}",
  "bio": "{{8.biography}}",
  "followers": {{8.followersCount}},
  "status": "New",
  "generated_message": "{{9.choices[].message.content}}",
  "hashtags_found": "#{{join(5.hashtags[]; ', #')}}",
  "notes": "Auto-generated on {{formatDate(now; 'YYYY-MM-DD HH:mm')}}"
}
```

---

### 12. Error Handler

**Module:** Tools → Error Handler

**For Module:** #8 (HTTP OpenRouter)

**Fallback:**
```
If OpenRouter fails:
1. Use fallback message template
2. Log error to separate Airtable table
3. Continue with default message
```

**Default Message Template:**
```
Pozdrav! 👋 Videli smo Vaš Instagram profil i zainteresovani smo za saradnju. @SaveYourTime platforma Vam može pomoći da olakšate online prodaju. Da li biste želeli da čujete više? 🚀
```

---

## 🎯 ENVIRONMENT VARIABLES

U Make.com → Organization Settings → Variables:

```
OPENROUTER_API_KEY = sk-or-v1-xxxxx
AIRTABLE_TOKEN = patxxxxx
APIFY_TOKEN = apify_api_xxxxx
```

---

## 📊 SUCCESS METRICS

**After run completion:**

- Total profiles scraped: `{{totalCount}}`
- Profiles passed filter: `{{filterCount}}`
- New records created: `{{createCount}}`
- Duplicates skipped: `{{duplicateCount}}`
- AI generation success rate: `{{aiSuccessRate}}%`

---

## 🐛 TROUBLESHOOTING

### Problem: Apify actor timeout

**Rešenje:**
- Povećaj `waitForFinish` na 300s za hashtag scraper
- Smanji `resultsLimit` na 30
- Za profile scraper koristi `waitForFinish: 60s`

### Problem: OpenRouter rate limit

**Rešenje:**
- Dodaj `Sleep` modul (2s) pre HTTP requesta
- Koristi `Iterator` sa batch processingom

### Problem: Duplicate records created

**Rešenje:**
- Proveri Airtable filter formulu
- Dodaj dodatni Router branch

### Problem: Profile scraper ne vraća biography/followersCount

**Rešenje:**
- Proveri da li je `resultsType: "details"`
- Dodaj `addParentData: false`
- Proveri da li je profil javan

---

## ✅ TESTIRANJE

**Test Mode:**

1. Postavi `resultsLimit: 3` u hashtag scraper
2. Koristi test hashtag: `#testsrbija`
3. Run scenario manually
4. Proveri da li profile scraper radi unutar Iterator-a
5. Proveri Airtable - treba 1-3 nova recorda sa biography i followersCount
6. Proveri AI poruke - da li su smislene?
7. Proveri hashtags_found format - treba da ima # ispred svakog

**Production Mode:**

1. Postavi `resultsLimit: 50` za hashtag scraper
2. Koristi prave hashtagove
3. Schedule za 10:00 svaki dan
4. Monitor za 7 dana
5. Proveri da li se profile scraper izvršava za svaki unique username

---

**Next:** [Make Scenario 2 - DM Sending](./Make-Scenario-2-DM-Sending.md)

