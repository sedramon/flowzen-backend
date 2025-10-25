# 📊 Workflow Dijagrami - Instagram DM Outreach System

**Datum:** 16. oktobar 2025.  
**Vizuelni prikaz sistema**

---

## 🔄 MASTER WORKFLOW

```
┌─────────────────────────────────────────────────────────────┐
│                    INSTAGRAM HASHTAG SEARCH                  │
│           (#shopserbia, #handmadebalkan, etc.)              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    APIFY INSTAGRAM SCRAPER                   │
│          (Extract: username, bio, followers, etc.)          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      FILTERING LOGIC                         │
│   Bio contains: "shop" OR "prodaja" OR "online"             │
│   Followers: 100 - 10,000                                   │
│   Profile: Public (not private)                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              OPENROUTER AI MESSAGE GENERATION                │
│   Model: google/gemma-2-9b-it:free (besplatan)              │
│   Input: username + bio + followers                         │
│   Output: Personalizovana poruka (max 140 chars)            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    AIRTABLE DATABASE                         │
│   Store: username, bio, followers, message, status=New      │
│   Duplicate check: Skip if username exists                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  DM SENDING QUEUE (Status=New)               │
│   Limit: 5 poruka dnevno (anti-spam)                        │
│   Delay: 60 sekundi između poruka                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               APIFY INSTAGRAM DM AUTOMATION                  │
│   Send DM: {generated_message}                              │
│   Via: @SaveYourTime profil (session ID)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   AIRTABLE STATUS UPDATE                     │
│   Update: status → "Sent"                                   │
│   Add: sent_timestamp → NOW()                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    MANUAL REPLY TRACKING                     │
│   Human: Check Instagram inbox                              │
│   If replied → Update Airtable: status="Replied"            │
│   If interested → Manual conversion                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 SCENARIO 1: Scraping Pipeline

**Schedule:** Daily at 10:00 AM

```
┌──────────────┐
│   SCHEDULE   │
│   10:00 AM   │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────┐
│  APIFY RUN INSTAGRAM SCRAPER │
│  ───────────────────────────│
│  Actor: apify/instagram-scraper
│  Input: {                     │
│    searchType: "hashtag",     │
│    search: ["#shopserbia"],   │
│    resultsLimit: 50           │
│  }                            │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  APIFY GET DATASET ITEMS     │
│  ───────────────────────────│
│  Dataset ID: {{runId}}        │
│  Format: JSON                 │
│  Output: Array[50 profiles]   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│         FILTER               │
│  ───────────────────────────│
│  Condition:                   │
│  bio CONTAINS "shop" OR       │
│  bio CONTAINS "prodaja"       │
│  AND                          │
│  followers >= 100             │
│  followers <= 10000           │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│        ITERATOR              │
│  ───────────────────────────│
│  Loop through filtered        │
│  profiles (1 by 1)            │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│    HTTP REQUEST - OPENROUTER AI          │
│  ────────────────────────────────────── │
│  URL: openrouter.ai/api/v1/chat/...      │
│  Model: google/gemma-2-9b-it:free        │
│  Prompt: "Generiši DM poruku za:         │
│           @{{username}}                  │
│           Bio: {{bio}}                   │
│           Max 140 chars, srpski jezik"   │
│  ────────────────────────────────────── │
│  Response: {{generatedMessage}}          │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────┐
│  AIRTABLE SEARCH RECORDS     │
│  ───────────────────────────│
│  Formula:                     │
│  {username} = "{{username}}"  │
│  ────────────────────────────│
│  Check if already exists      │
└──────────────┬───────────────┘
               │
               ▼
        ┌──────┴──────┐
        │   ROUTER    │
        └──────┬──────┘
               │
       ┌───────┴───────┐
       │               │
       ▼               ▼
┌─────────────┐  ┌──────────────────────┐
│   EXISTS    │  │    NEW PROFILE       │
│   (STOP)    │  │                      │
└─────────────┘  │  AIRTABLE CREATE:    │
                 │  - username          │
                 │  - bio               │
                 │  - followers         │
                 │  - generated_message │
                 │  - status: "New"     │
                 └──────────────────────┘
```

**Output:** 5-20 novih profila u Airtable (status=New)

---

## 📤 SCENARIO 2: DM Sending Pipeline

**Schedule:** Daily at 2:00 PM

```
┌──────────────┐
│   SCHEDULE   │
│   2:00 PM    │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────┐
│  AIRTABLE SEARCH RECORDS     │
│  ───────────────────────────│
│  Formula: {status} = "New"    │
│  Max records: 10              │
│  Sort: Created time (ASC)     │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│         FILTER               │
│  ───────────────────────────│
│  Check if records > 0         │
│  (Ako nema, STOP)             │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│    ARRAY AGGREGATOR          │
│  ───────────────────────────│
│  Source: Airtable records     │
│  Limit: 5 items               │
│  (Instagram anti-spam limit)  │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│        ITERATOR              │
│  ───────────────────────────│
│  Loop: Max 5 profiles         │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│         SLEEP                │
│  ───────────────────────────│
│  Delay: 60 seconds            │
│  (Anti-spam protection)       │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│    APIFY RUN DM AUTOMATION               │
│  ────────────────────────────────────── │
│  Actor: aizen0/instagram-dms-automation  │
│  Input: {                                │
│    sessionCookie: "{{SESSION_ID}}",      │
│    recipients: ["{{username}}"],         │
│    message: "{{generated_message}}",     │
│    delayBetweenMessages: 60              │
│  }                                       │
│  ────────────────────────────────────── │
│  Output: {{dmStatus}}                    │
└──────────────┬───────────────────────────┘
               │
               ▼
        ┌──────┴──────┐
        │ ERROR CHECK │
        └──────┬──────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
┌─────────────┐  ┌──────────────────────┐
│   SUCCESS   │  │      ERROR           │
│             │  │  ────────────────────│
│  AIRTABLE   │  │  AIRTABLE UPDATE:    │
│  UPDATE:    │  │  - status: "Failed"  │
│  - status:  │  │  - notes: error msg  │
│    "Sent"   │  └──────────────────────┘
│  - sent_    │
│    timestamp│
└─────────────┘

               │
               ▼
┌──────────────────────────────┐
│    SLACK NOTIFICATION        │
│  ───────────────────────────│
│  Message:                     │
│  "📊 Daily Report:            │
│   ✅ Sent: {{totalSent}}      │
│   ❌ Failed: {{totalFailed}}" │
└──────────────────────────────┘
```

**Output:** Max 5 DM-ova poslato, Airtable status updated

---

## 🔄 DATA FLOW

### Profile Data Journey:

```
Instagram Profile
    ↓
{
  username: "handmade_serbia",
  bio: "🎨 Handmade nakit | Beograd | Poručite u DM",
  followers: 1250,
  isPrivate: false
}
    ↓
FILTER (bio contains "handmade", followers 100-10k)
    ↓
✅ PASS
    ↓
OpenRouter AI Request
    ↓
Prompt: "Generiši DM za @handmade_serbia, bio: 🎨 Handmade nakit..."
    ↓
AI Response: "Pozdrav! Tvoje handmade narukvice su predivne! 🎨 
             @SaveYourTime bi ti pomogao da stigneš do više kupaca. 
             Da pričamo?"
    ↓
Airtable Record
    ↓
{
  id: "rec123456",
  username: "handmade_serbia",
  profile_link: "https://instagram.com/handmade_serbia",
  bio: "🎨 Handmade nakit | Beograd...",
  followers: 1250,
  status: "New",
  generated_message: "Pozdrav! Tvoje handmade narukvice...",
  hashtags_found: "#shopserbia",
  created_time: "2025-10-16 10:15:00"
}
    ↓
[ČEKA U QUEUE]
    ↓
DM Sending (2:00 PM)
    ↓
Instagram DM sent to @handmade_serbia
    ↓
Airtable Update
    ↓
{
  status: "Sent",
  sent_timestamp: "2025-10-16 14:30:22"
}
    ↓
[ČEKA REPLY]
    ↓
Manual check → Ako replied:
    ↓
{
  status: "Replied",
  notes: "Zainteresovani za saradnju!"
}
```

---

## 🧩 MODULE CONNECTIONS

### Make.com Scenario 1 Connections:

```
[1] Schedule
     ↓ (trigger)
[2] Apify Run Actor (Scraper)
     ↓ (output: runId, datasetId)
[3] Apify Get Dataset
     ↓ (output: profiles array)
[4] Filter
     ↓ (output: filtered profiles)
[5] Iterator
     ↓ (output: single profile per iteration)
[6] HTTP OpenRouter
     ↓ (output: AI message)
[7] Airtable Search
     ↓ (output: existing record or null)
[8] Router
     ├─ Route 1: If exists → [STOP]
     └─ Route 2: If new → [9]
[9] Airtable Create
     ↓ (output: new record)
[END]
```

### Make.com Scenario 2 Connections:

```
[1] Schedule
     ↓ (trigger)
[2] Airtable Search (status=New)
     ↓ (output: pending records)
[3] Filter (check if > 0)
     ↓ (output: boolean)
[4] Array Aggregator (limit 5)
     ↓ (output: max 5 records)
[5] Iterator
     ↓ (output: single record per iteration)
[6] Sleep (60s)
     ↓ (output: delay complete)
[7] Apify DM Actor
     ↓ (output: dm status)
[8] Error Handler
     ├─ Success → [9a]
     └─ Error → [9b]
[9a] Airtable Update (status=Sent)
[9b] Airtable Update (status=Failed)
     ↓
[10] Slack Notification
     ↓
[END]
```

---

## 📊 AIRTABLE VIEWS STRUCTURE

```
Instagram_Shops Table
│
├─ 📋 View 1: All Profiles (Grid)
│  └─ Shows: All records
│     Group by: status
│     Sort: Created time DESC
│
├─ 📋 View 2: Pending Queue (Grid)
│  └─ Filter: {status} = "New"
│     Sort: Created time ASC
│     Purpose: See next profiles to send DM
│
├─ 📋 View 3: Sent Today (Grid)
│  └─ Filter: {sent_timestamp} = TODAY()
│     Sort: sent_timestamp DESC
│     Purpose: Track today's DMs
│
├─ 📋 View 4: Needs Follow-up (Kanban)
│  └─ Filter: {status} = "Sent" (3+ days ago)
│     Group by: reply_status
│     Purpose: Manual reply tracking
│
└─ 📋 View 5: Analytics (Grid)
   └─ Group by: hashtags_found, status
      Aggregate: COUNT, AVG(followers)
      Purpose: Performance insights
```

---

## 🔁 ERROR HANDLING FLOW

### Scenario 1 Error Handling:

```
HTTP OpenRouter Request
    │
    ├─ SUCCESS (200) ────────→ Use AI message
    │
    ├─ ERROR (401) ──────────→ Invalid API key
    │   └─ Fallback: Default template message
    │
    ├─ ERROR (404) ──────────→ Model not found
    │   └─ Retry with backup model (llama-3.2)
    │
    ├─ ERROR (429) ──────────→ Rate limit
    │   └─ Sleep 60s → Retry
    │
    └─ ERROR (500+) ─────────→ Server error
        └─ Log error → Use default template
```

### Scenario 2 Error Handling:

```
Apify DM Automation
    │
    ├─ SUCCESS ──────────────→ Update status="Sent"
    │
    ├─ ERROR: "user not found" ─→ Update status="Invalid"
    │
    ├─ ERROR: "session expired" ─→ STOP execution
    │   └─ Alert: Regenerate session ID
    │
    ├─ ERROR: "challenge required" → STOP execution
    │   └─ Alert: Solve CAPTCHA on Instagram
    │
    └─ ERROR: Other ─────────→ Update status="Failed"
        └─ Increment retry_count
```

---

## 🎨 AI PROMPT FLOW

```
User Input:
┌────────────────────────────────────┐
│ username: "vintage_fashion_bg"     │
│ bio: "Vintage odeća | Retro stil"  │
│ followers: 1200                    │
└────────────────────────────────────┘
            ↓
System Prompt:
┌────────────────────────────────────────────────────┐
│ "Ti si AI koji generiše Instagram DM poruke.       │
│  Pravila:                                          │
│  - Max 140 karaktera                               │
│  - Srpski jezik                                    │
│  - Personalizovano                                 │
│  - Poziv na saradnju sa @SaveYourTime"             │
└────────────────────────────────────────────────────┘
            ↓
Combined Prompt:
┌────────────────────────────────────────────────────┐
│ "Generiši DM poruku za:                            │
│  Username: @vintage_fashion_bg                     │
│  Bio: Vintage odeća | Retro stil                   │
│  Followers: 1200                                   │
│                                                    │
│  Poruka treba da:                                  │
│  - Pozove na saradnju sa @SaveYourTime             │
│  - Spomene specifičan detalj (vintage/retro)       │
│  - Bude max 140 karaktera                          │
│  - Zvuči prirodno                                  │
│                                                    │
│  Samo napiši poruku:"                              │
└────────────────────────────────────────────────────┘
            ↓
OpenRouter API (google/gemma-2-9b-it:free)
            ↓
AI Response:
┌────────────────────────────────────────────────────┐
│ "Vintage kolekcija ti je 🔥! @SaveYourTime bi ti   │
│  pomogao da stigneš do više ljubitelja retro       │
│  stila. Da pričamo?"                               │
│                                                    │
│  [Karakter count: 127/140] ✅                      │
└────────────────────────────────────────────────────┘
            ↓
Validation:
✅ < 140 chars
✅ Srpski jezik
✅ Personalizovano (mentions "vintage", "retro")
✅ Call-to-action ("Da pričamo?")
✅ Natural tone
            ↓
Save to Airtable
```

---

## 📈 SCALING ARCHITECTURE

### Multi-Account Setup:

```
┌─────────────────────────────────────────────────────┐
│              MAKE.COM MASTER SCENARIO                │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
              ┌──────────┴──────────┐
              │      ROUTER         │
              │  (Distribute load)  │
              └──────────┬──────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  ACCOUNT 1  │  │  ACCOUNT 2  │  │  ACCOUNT 3  │
│ @SaveYourTime│ │@SaveYourTime │ │@SaveYourTime │
│   _Shop      │ │   _Fashion   │ │    _Art      │
├─────────────┤  ├─────────────┤  ├─────────────┤
│ Hashtags:   │  │ Hashtags:   │  │ Hashtags:   │
│ #handmade   │  │ #fashion    │  │ #art        │
│ #craft      │  │ #clothes    │  │ #creative   │
├─────────────┤  ├─────────────┤  ├─────────────┤
│ 5 DM/day    │  │ 5 DM/day    │  │ 5 DM/day    │
└─────────────┘  └─────────────┘  └─────────────┘
         │               │               │
         └───────────────┼───────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │ CENTRAL AIRTABLE │
              │   (All records)  │
              └──────────────────┘

Total: 15 DM/day across 3 accounts
```

---

## 🚦 STATE MACHINE

### Profile Lifecycle:

```
┌─────────┐
│ SCRAPED │ (Initial state from Instagram)
└────┬────┘
     │
     ▼
┌─────────┐
│ FILTERED│ (Passes bio/follower filter)
└────┬────┘
     │
     ▼
┌─────────┐
│   NEW   │ (AI message generated, ready to send)
└────┬────┘
     │
     ▼
┌─────────┐
│  SENT   │ (DM successfully sent)
└────┬────┘
     │
     ├────────────┐
     │            │
     ▼            ▼
┌─────────┐  ┌─────────┐
│ REPLIED │  │NO REPLY │ (3+ days, no response)
└────┬────┘  └────┬────┘
     │            │
     ▼            ▼
┌─────────┐  ┌─────────┐
│INTERESTED│ │ BLOCKED │ (Don't contact again)
└────┬────┘  └─────────┘
     │
     ▼
┌─────────┐
│CONVERTED│ (Became client!)
└─────────┘

Side states:
┌─────────┐
│ FAILED  │ (DM sending error - can retry)
└─────────┘
┌─────────┐
│ INVALID │ (Username doesn't exist)
└─────────┘
```

---

## 📅 TIMELINE EXAMPLE

### Day 1-7 Schedule:

```
MONDAY
10:00 ─→ Scraping Run → 15 profiles found
14:00 ─→ DM Sending → 5 DMs sent (profiles 1-5)

TUESDAY  
10:00 ─→ Scraping Run → 12 profiles found
14:00 ─→ DM Sending → 5 DMs sent (profiles 6-10)

WEDNESDAY
10:00 ─→ Scraping Run → 20 profiles found
14:00 ─→ DM Sending → 5 DMs sent (profiles 11-15)

... (continues)

WEEK SUMMARY:
- Profiles scraped: 100+
- DMs sent: 35 (5/day × 7 days)
- Replies received: ~7 (20% reply rate)
- Interested: ~3-4 (10% conversion)
```

---

## 🎯 VISUAL SUMMARY

```
 INPUTS                PROCESSING              OUTPUTS
┌─────────┐           ┌──────────┐          ┌─────────┐
│Instagram│─────────→ │  Apify   │────────→ │Filtered │
│Hashtags │           │ Scraper  │          │Profiles │
└─────────┘           └──────────┘          └────┬────┘
                                                  │
                                                  ▼
                      ┌──────────┐          ┌─────────┐
                      │OpenRouter│────────→ │   AI    │
                      │   API    │          │Messages │
                      └──────────┘          └────┬────┘
                                                  │
                                                  ▼
                      ┌──────────┐          ┌─────────┐
                      │ Airtable │◀────────│  Store  │
                      │ Database │────────→│& Track  │
                      └──────────┘          └────┬────┘
                                                  │
                                                  ▼
                      ┌──────────┐          ┌─────────┐
                      │  Apify   │────────→ │Instagram│
                      │    DM    │          │   DM    │
                      └──────────┘          └─────────┘
```

---

**Nazad:** [README](./README.md)  
**Za implementaciju:** [Quick Start Guide](./Quick-Start-Guide.md)

