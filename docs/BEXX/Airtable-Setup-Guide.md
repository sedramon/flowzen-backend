# 📊 Airtable Setup Guide - Instagram DM Outreach

**Datum:** 16. oktobar 2025.  
**Verzija:** 1.0

---

## 🎯 CILJ

Kreirati Airtable bazu koja služi kao centralna skladište za Instagram profile, generisane poruke i tracking statusa DM slanja.

---

## 🏗️ WORKSPACE SETUP

### 1. Kreiraj Workspace

1. Idi na https://airtable.com
2. Sign up / Login
3. Klikni "Create workspace"
4. **Ime:** `BexExpress`
5. **Plan:** Free (1,200 records je dovoljno za start)

### 2. Kreiraj Base

1. U workspace-u klikni "+ Create"
2. Odaberi "Start from scratch"
3. **Ime:** `Instagram DM Outreach`
4. **Icon:** 📱 (Instagram)
5. **Color:** Gradient Purple

---

## 📋 TABELA 1: Instagram_Shops

**Glavna tabela za profile i DM tracking**

### Kolone:

| # | Ime Kolone | Tip | Konfiguracija | Primer |
|---|------------|-----|---------------|--------|
| 1 | `username` | Single line text | Required | @handmade_serbia |
| 2 | `profile_link` | URL | Auto-format | https://instagram.com/handmade_serbia |
| 3 | `bio` | Long text | Allow rich text: No | 🎨 Handmade nakit \| Beograd... |
| 4 | `followers` | Number | Integer, No decimals | 1250 |
| 5 | `status` | Single select | See options below | New |
| 6 | `generated_message` | Long text | Allow rich text: No | Cao! Videla sam tvoj... |
| 7 | `sent_timestamp` | Date | Include time: Yes | 2025-10-16 14:30 |
| 8 | `hashtags_found` | Multiple select | Allow adding options | #shopserbia |
| 9 | `reply_status` | Single select | See options below | No reply |
| 10 | `notes` | Long text | Allow rich text: No | Manual override |
| 11 | `created_time` | Created time | Auto-generated | 2025-10-16 10:15 |
| 12 | `last_modified` | Last modified | Auto-generated | 2025-10-16 14:32 |

### Status Options (kolona 5):

| Status | Boja | Opis |
|--------|------|------|
| **New** | 🟦 Blue | Pronađen profil, poruka generisana, čeka slanje |
| **Sent** | 🟩 Green | DM uspešno poslat |
| **Replied** | 🟪 Purple | Korisnik odgovorio (manual update) |
| **Failed** | 🟥 Red | Slanje neuspešno |
| **Blocked** | ⬜ Gray | Ne kontaktirati više |
| **Invalid** | 🟨 Yellow | Nepostojeći profil |

### Reply Status Options (kolona 9):

| Reply Status | Boja | Opis |
|--------------|------|------|
| **No reply** | 🟦 Blue | Default, nema odgovora |
| **Interested** | 🟩 Green | Pozitivan odgovor |
| **Not interested** | 🟥 Red | Negativan odgovor |
| **Follow-up needed** | 🟨 Yellow | Zahteva dodatnu komunikaciju |
| **Converted** | 🟪 Purple | Postao klijent |

---

## 📊 VIEWS (Pogledi)

### View 1: All Profiles (Grid)

**Default view** - Sve profile

**Settings:**
- Show all records
- Sort: Created time (newest first)
- Group by: Status

### View 2: Pending Queue (Grid)

**Za DM slanje**

**Filter:**
```
status = "New"
AND
generated_message is not empty
```

**Sort:** Created time (oldest first)

**Fields:** username, bio, generated_message, created_time

### View 3: Sent Today (Grid)

**Tracking današnjih DM-ova**

**Filter:**
```
sent_timestamp is today
```

**Sort:** sent_timestamp (newest first)

**Fields:** username, generated_message, sent_timestamp, status

### View 4: Needs Follow-up (Kanban)

**Kanban board po reply status-u**

**Group by:** reply_status

**Filter:**
```
status = "Sent" OR "Replied"
```

**Sort:** sent_timestamp (oldest first)

### View 5: Analytics Dashboard (Grid)

**Za izveštaje**

**Group by:** 
1. Status
2. Hashtags found

**Summary fields:**
- Count of records
- Average followers
- Earliest sent_timestamp

---

## 🔗 AUTOMATIONS (Airtable Native)

### Automation 1: Auto-generate Profile Link

**Trigger:** When record created

**Condition:** username is not empty

**Action:** Update record
```
profile_link = "https://instagram.com/" & username
```

### Automation 2: Reply Reminder

**Trigger:** When sent_timestamp is 3 days ago

**Condition:** status = "Sent" AND reply_status = "No reply"

**Action:** Send Slack notification
```
Profil @{username} nije odgovorio nakon 3 dana.
Da li da pošaljemo follow-up?
```

### Automation 3: Weekly Summary

**Trigger:** Every Monday at 9:00

**Action:** Send email
```
To: team@bexexpress.com
Subject: Weekly Instagram DM Report

Poslato prošle nedelje: {count(status="Sent", last week)}
Odgovori: {count(reply_status="Interested", last week)}
Conversion rate: {percentage}
```

---

## 📱 MOBILE APP SETUP

**Za ručno praćenje odgovora:**

1. Instaliraj Airtable app (iOS/Android)
2. Otvori `Instagram DM Outreach` base
3. Dodaj na Home screen
4. Koristi "Needs Follow-up" view

**Workflow:**
1. Proveri Instagram DM inbox
2. Ako neko odgovorio → otvori Airtable app
3. Pronađi profil po username
4. Update `reply_status`
5. Dodaj beleške u `notes`

---

## 🔐 PERMISSIONS & SHARING

### Personal Access Token (za Make.com):

1. Idi na https://airtable.com/create/tokens
2. Klikni "Create new token"
3. **Name:** `Make.com Integration`
4. **Scopes:**
   - ✅ data.records:read
   - ✅ data.records:write
   - ✅ schema.bases:read
5. **Access:** Samo `Instagram DM Outreach` base
6. Kopiraj token (počinje sa `pat...`)
7. Čuvaj u Make.com environment variables

### Team Sharing:

**Free plan:** 5 collaborators

**Roles:**
- **Creator** (ti): Full access
- **Editor** (team): Can edit records
- **Commenter**: Can only comment
- **Read only**: View only

---

## 📈 EXTENSIONS (Opciono)

### Extension 1: Charts

**Instalacija:**
1. Extensions tab → Add extension
2. Odaberi "Charts"

**Charts:**
1. **DMs Sent Over Time** (Line chart)
   - X-axis: sent_timestamp (by day)
   - Y-axis: Count of records

2. **Status Distribution** (Pie chart)
   - Group by: status
   - Value: Count

3. **Top Hashtags** (Bar chart)
   - X-axis: hashtags_found
   - Y-axis: Count

### Extension 2: Page Designer (Reports)

**Template za nedeljni izveštaj:**

```
# Instagram DM Outreach - Nedeljni Izveštaj

## Metrike:
- Profila pronađeno: {count(status="New", this week)}
- DM-ova poslato: {count(status="Sent", this week)}
- Odgovora primljeno: {count(reply_status!="No reply", this week)}

## Top 5 Profila po followers:
{table: sorted by followers DESC, limit 5}

## Potrebne akcije:
{table: reply_status="Follow-up needed"}
```

---

## 🧪 FORMULE (Advanced)

### Days Since Sent (computed field):

```
DATETIME_DIFF(NOW(), {sent_timestamp}, 'days')
```

### Engagement Score:

```
IF(
  {reply_status} = "Interested", 10,
  IF({reply_status} = "Follow-up needed", 5,
  IF({reply_status} = "No reply", 0, -5)
  )
) + ({followers} / 100)
```

### Auto-categorize by followers:

```
IF({followers} < 500, "Micro",
IF({followers} < 2000, "Small",
IF({followers} < 5000, "Medium", "Large")))
```

---

## 📊 TABELA 2: Error_Logs (Opciono)

**Za tracking Make.com grešaka**

### Kolone:

| Kolona | Tip | Opis |
|--------|-----|------|
| error_timestamp | Date | Vreme greške |
| module_name | Single select | Apify / OpenRouter / Airtable |
| error_message | Long text | Error stack trace |
| affected_username | Link to table | Link ka Instagram_Shops |
| resolved | Checkbox | Da li je rešeno |

**Automation:**
- When error logged → Slack alert
- When resolved = true → Archive record

---

## 📊 TABELA 3: Message_Templates (Opciono)

**Za A/B testing poruka**

### Kolone:

| Kolona | Tip | Opis |
|--------|-----|------|
| template_name | Single line text | "Friendly", "Professional", "Casual" |
| message_template | Long text | Template sa {username} placeholder |
| times_used | Number | Koliko puta korišćen |
| reply_rate | Percent | Success rate |
| is_active | Checkbox | Da li je trenutno aktivan |

**Integration sa Make.com:**
- Random select template with is_active = true
- Track usage i reply rate
- Auto-disable templates sa reply_rate < 20%

---

## ✅ VALIDATION RULES

**Pre prvog production run-a:**

- ✅ Sve kolone kreirane
- ✅ Status options podešeni
- ✅ Views konfigurisani
- ✅ Personal Access Token generisan
- ✅ Automations aktivirani
- ✅ Test record kreiran i testiran
- ✅ Mobile app instaliran

---

## 🧪 TEST DATA

**Kreiraj 3 test recorda:**

```
Record 1:
- username: test_shop_1
- bio: Handmade jewelry shop | Beograd
- followers: 450
- status: New
- generated_message: Test poruka 1

Record 2:
- username: test_shop_2  
- bio: Online prodaja domaćih proizvoda
- followers: 1200
- status: New
- generated_message: Test poruka 2

Record 3:
- username: test_shop_3
- bio: 🛍️ Shop online | Srbija
- followers: 800
- status: Sent
- sent_timestamp: (3 days ago)
- reply_status: No reply
```

**Test scenarios:**
1. Make.com treba da pročita ova 3 recorda
2. Filter treba da prođe svi 3 (status = New or Sent)
3. Limit treba da uzme samo prva 2
4. Update treba da promeni status u "Sent"

---

## 🔗 INTEGRATION TESTING

### Make.com → Airtable:

**Test Create:**
```bash
curl -X POST https://api.airtable.com/v0/BASE_ID/Instagram_Shops \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "records": [{
      "fields": {
        "username": "api_test_user",
        "bio": "Test bio",
        "followers": 100,
        "status": "New",
        "generated_message": "API test message"
      }
    }]
  }'
```

**Expected response:** 200 OK + record ID

**Test Search:**
```bash
curl "https://api.airtable.com/v0/BASE_ID/Instagram_Shops?filterByFormula={status}='New'" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected response:** Array of New records

---

## 📱 DASHBOARD EMBED (Opciono)

**Za real-time monitoring:**

1. Create Interface (Airtable Interface Designer)
2. Add Dashboard elements:
   - Summary numbers (Total sent, Reply rate)
   - Timeline chart (DMs over time)
   - Status breakdown (Pie chart)
   - Pending queue (Table)
3. Share publicly or embed in Notion/Website

**Embed code:**
```html
<iframe 
  src="https://airtable.com/embed/shrXXXXX?backgroundColor=purple"
  width="100%" 
  height="800px" 
  style="border: none;">
</iframe>
```

---

## 🚀 GOING LIVE CHECKLIST

- [ ] Base kreiran sa svim kolonama
- [ ] Status options podešeni (colors i imena)
- [ ] Minimum 5 views kreirano
- [ ] Personal Access Token generisan i sačuvan
- [ ] Test record kreiran i validiran
- [ ] Make.com uspešno konektovan
- [ ] Mobile app instaliran
- [ ] Team members dodati (ako ima)
- [ ] Backup automation podešena (export CSV svake nedelje)

---

**Prev:** [Make Scenario 2 - DM Sending](./Make-Scenario-2-DM-Sending.md)  
**Next:** [OpenRouter Setup Guide](./OpenRouter-Setup-Guide.md)

