# 🤖 OpenRouter Setup Guide - Besplatni AI za DM generisanje

**Datum:** 16. oktobar 2025.  
**Verzija:** 1.0

---

## 🎯 CILJ

Koristiti OpenRouter API sa **besplatnim** AI modelima za generisanje personalizovanih Instagram DM poruka.

---

## 🆓 BESPLATNI MODELI (2025)

| Model | Provider | Cena | Context | Kvalitet | Brzina |
|-------|----------|------|---------|----------|--------|
| **meta-llama/llama-3.2-3b-instruct:free** | Meta | $0 | 8K | ⭐⭐⭐⭐ | Brz |
| **google/gemma-2-9b-it:free** | Google | $0 | 8K | ⭐⭐⭐⭐⭐ | Srednji |
| **microsoft/phi-3-mini-128k-instruct:free** | Microsoft | $0 | 128K | ⭐⭐⭐ | Vrlo brz |
| **qwen/qwen-2-7b-instruct:free** | Alibaba | $0 | 32K | ⭐⭐⭐⭐ | Brz |
| **mistralai/mistral-7b-instruct:free** | Mistral | $0 | 8K | ⭐⭐⭐⭐ | Brz |

**Preporuka:** `google/gemma-2-9b-it:free` - najbolji balans kvaliteta i brzine

---

## 📝 ACCOUNT SETUP

### 1. Registracija

1. Idi na https://openrouter.ai
2. Klikni "Sign In" → "Sign up with Google/GitHub"
3. Potvrdi email
4. Dashboard: https://openrouter.ai/dashboard

### 2. API Key

1. U dashboardu → "Keys" tab
2. Klikni "Create Key"
3. **Name:** `Make.com - Instagram DM`
4. **Limit:** Unlimited (free models nemaju cost)
5. **Scope:** Full access
6. Kopiraj API key (počinje sa `sk-or-v1-...`)

**⚠️ ČUVAJ SIGURNO:** 
- Ne deli key ni sa kim
- Ne commit-uj u Git
- Koristi environment variables

### 3. Site Settings (Opciono)

1. "Settings" tab → "Your Site"
2. **Site URL:** `https://saveyourtime.rs`
3. **Site Name:** `BexExpress DM Generator`

Ovo omogućava bolje ranking na OpenRouter leaderboard-u.

---

## 🔌 MAKE.COM INTEGRATION

### HTTP Module Setup

**Module:** HTTP → Make a Request

#### Konfiguracija:

**URL:**
```
https://openrouter.ai/api/v1/chat/completions
```

**Method:** `POST`

**Headers:**
```json
{
  "Authorization": "Bearer {{env.OPENROUTER_API_KEY}}",
  "Content-Type": "application/json",
  "HTTP-Referer": "https://saveyourtime.rs",
  "X-Title": "BexExpress Instagram DM Generator"
}
```

**Body Type:** Raw (JSON)

**Body:**
```json
{
  "model": "google/gemma-2-9b-it:free",
  "messages": [
    {
      "role": "system",
      "content": "Ti si AI asistent koji generiše prirodne, personalizovane Instagram DM poruke na srpskom jeziku. Poruke treba da budu prijateljske, kratke (max 140 karaktera), bez spam-a, i prilagođene profilu primaoca. Cilj je poziv na poslovnu saradnju sa @SaveYourTime platformom."
    },
    {
      "role": "user",
      "content": "Generiši DM poruku za Instagram shop profil:\n\nUsername: @{{username}}\nBio: {{bio}}\nFollowers: {{followers}}\n\nPoruka treba da:\n- Pozove na saradnju sa @SaveYourTime\n- Spomene specifičan detalj iz njihovog profila\n- Bude max 140 karaktera\n- Zvuči prirodno i ljudski (ne kao bot)\n- Ne koristi previše emoji\n\nSamo napiši poruku, bez dodatnih objašnjenja."
    }
  ],
  "max_tokens": 150,
  "temperature": 0.8,
  "top_p": 0.9,
  "frequency_penalty": 0.3,
  "presence_penalty": 0.3
}
```

#### Response Parsing:

**Parse response:** ✅ Yes

**Output:**
```
Generated Message: {{1.choices[0].message.content}}
```

**Error Handling:**
```
If status ≠ 200:
  Fallback to default template
```

---

## 🎨 PROMPT ENGINEERING

### System Prompt (optimizovan za DM-ove):

```
Ti si AI asistent koji generiše personalizovane Instagram DM poruke za poslovnu saradnju.

PRAVILA:
1. Piši na srpskom jeziku (latinica)
2. Max 140 karaktera po poruci
3. Ton: prijateljski ali profesionalan
4. Obavezno pomeni specifičan detalj iz profila (bio/username)
5. Poziv na akciju: ponudi besplatnu demo platforme
6. NE koristi:
   - Generičke fraze ("samo da vas kontaktiram")
   - Spam ključne reči ("super ponuda", "ne propustite")
   - Previše emoji (max 1-2)
   - Formalan jezik ("Poštovani", "s poštovanjem")

STRUKTURA PORUKE:
[Personalizovani uvod] + [Vrednost koju nudimo] + [Poziv na akciju]

PRIMERI DOBRIH PORUKA:
- "Videla sam tvoje divne handmade narukvice! 🎨 @SaveYourTime može da ti pomogne sa online prodajom - besplatna demo?"
- "Super Instagram profil! Tvoj shop bi mogao da ima više kupaca uz našu platformu. Da razgovaramo?"
- "Pratim tvoj rad, sviđa mi se! @SaveYourTime nudi besplatnu prodavnicu - da ti pokažem kako radi?"
```

### User Prompt Template:

```
Generiši DM poruku za:

Username: @{{username}}
Bio: {{bio}}
Followers: {{followers}}
Hashtags: {{hashtags}}

Kontekst: Ovaj profil je Instagram shop. Želimo da ponudimo saradnju sa @SaveYourTime platformom koja pomaže malim biznisima da prodaju online.

Samo napiši poruku (max 140 karaktera), bez dodatnog teksta.
```

### Advanced: Category-based prompts

**Za handmade shops:**
```
Dodatni kontekst: Profil prodaje handmade proizvode. 
Fokus: kreativnost, unikatnost, podrška lokalnim umetnicima.
Ton: topliji, više emoji.
```

**Za fashion shops:**
```
Dodatni kontekst: Fashion/clothing shop.
Fokus: styling, trendovi, moderni brending.
Ton: urbani, modern.
```

**Za food/beverage:**
```
Dodatni kontekst: Prodaja hrane/pića.
Fokus: kvalitet, domaći proizvodi, dostava.
Ton: srdačan, porodičan.
```

---

## 🧪 TESTIRANJE

### Test 1: Simple Request

**cURL test:**
```bash
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -H "HTTP-Referer: https://saveyourtime.rs" \
  -d '{
    "model": "google/gemma-2-9b-it:free",
    "messages": [
      {
        "role": "user",
        "content": "Napiši kratku Instagram DM poruku (max 140 karaktera) za shop koji prodaje handmade nakit. Pozovi ih na saradnju sa @SaveYourTime platformom."
      }
    ],
    "max_tokens": 150
  }'
```

**Expected response:**
```json
{
  "id": "gen-xxxxx",
  "model": "google/gemma-2-9b-it:free",
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "Pozdrav! Tvoj handmade nakit je prelep! 🎨 @SaveYourTime može da ti pomogne da stigneš do više kupaca. Besplatna demo?"
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 45,
    "completion_tokens": 32,
    "total_tokens": 77
  }
}
```

### Test 2: Make.com HTTP Module

**Manual run u Make.com:**

1. Kreiraj test scenario sa samo HTTP modulom
2. Koristi hardcoded vrednosti:
   ```
   username: handmade_jewelry_bg
   bio: 🎨 Handmade nakit | Beograd | Naručivanje u DM
   followers: 850
   ```
3. Run module
4. Proveri output:
   - Da li je poruka na srpskom?
   - Da li je < 140 karaktera?
   - Da li ima smisla?
   - Da li pominje specifičan detalj?

### Test 3: Error Handling

**Test scenariji:**

**Invalid API Key:**
```
Expected: 401 Unauthorized
Action: Fallback to default message
```

**Model not found:**
```
Expected: 404 Not Found  
Action: Switch to backup model (mistralai/mistral-7b-instruct:free)
```

**Rate limit (shouldn't happen sa free models):**
```
Expected: 429 Too Many Requests
Action: Wait 60s and retry
```

---

## 📊 MODEL COMPARISON

**Test sa istim promptom:**

### Test Prompt:
```
Username: @vintage_fashion_bg
Bio: Vintage odeća | Retro stil | Beograd
Followers: 1200

Generiši DM poruku (max 140 karaktera).
```

### Rezultati:

**google/gemma-2-9b-it:free** (NAJBOLJI):
```
"Vintage kolekcija ti je 🔥! @SaveYourTime bi ti pomogao da stigneš do više ljubitelja retro stila. Da pričamo?"
```
✅ Prirodno, specifično, poziv na akciju

**meta-llama/llama-3.2-3b-instruct:free**:
```
"Pozdrav! Vidim da imaš super vintage shop. Da li bi želela saradnju sa platformom za online prodaju? 😊"
```
⚠️ Dobro, ali malo generično

**microsoft/phi-3-mini-128k-instruct:free**:
```
"Cao! Tvoj vintage stil je odličan. Nudimo platformu za lakšu prodaju - besplatno! Zainteresovana?"
```
⚠️ OK, ali manje personalizovano

**Konačna preporuka:** `google/gemma-2-9b-it:free`

---

## 🔄 FALLBACK STRATEGY

### Primary → Backup chain:

```
1. google/gemma-2-9b-it:free (primary)
   ↓ (if fails)
2. meta-llama/llama-3.2-3b-instruct:free (backup 1)
   ↓ (if fails)
3. Default template (last resort)
```

### Make.com Error Handler:

**Module:** Error Handler (na HTTP modulu)

**Fallback logic:**
```javascript
if (error.status = 404 OR error.status = 503) {
  // Model unavailable, use backup
  model = "meta-llama/llama-3.2-3b-instruct:free"
  retry()
} else if (error.status = 401) {
  // API key issue, use default template
  message = generateDefaultMessage(username, bio)
} else {
  // Unknown error, log and use default
  logError(error)
  message = "Pozdrav! Videli smo vaš Instagram shop i zainteresovani smo za saradnju sa @SaveYourTime platformom. Da li biste želeli besplatnu demo? 🚀"
}
```

---

## 💡 OPTIMIZACIJE

### A/B Testing Prompts:

**Variant A (Friendly):**
```
Ton: casual, prijateljski
Emoji: 1-2
Fokus: zajednica, podrška
```

**Variant B (Professional):**
```
Ton: profesionalan ali topao
Emoji: max 1
Fokus: rast biznisa, rezultati
```

**Variant C (Direct):**
```
Ton: direktan, value-focused
Emoji: 0
Fokus: konkretna ponuda
```

**Tracking:**
- Dodaj `variant` field u Airtable
- Track reply rate per variant
- Auto-optimize to best performer

### Dynamic Temperature:

```javascript
// Za veće shopove - profesionalniji ton
if (followers > 2000) {
  temperature = 0.6  // Less creative, more professional
} else {
  temperature = 0.8  // More creative, friendly
}
```

### Personalization Levels:

**Level 1 (Basic):**
```
Username + Bio + Generic offer
```

**Level 2 (Advanced):**
```
Username + Bio + Followers + Category detection + Tailored message
```

**Level 3 (Premium):**
```
Username + Bio + Latest posts + Product type + Competitor analysis + Hyper-personalized
```

---

## 📈 MONITORING

### OpenRouter Dashboard:

**Metrics to track:**
1. **Total requests** - koliko AI poziva dnevno
2. **Average latency** - brzina odgovora
3. **Error rate** - procenat neuspelih poziva
4. **Model performance** - koji model daje najbolje rezultate

### Make.com Logging:

**Log structure:**
```json
{
  "timestamp": "2025-10-16 14:30:22",
  "username": "@handmade_serbia",
  "model_used": "google/gemma-2-9b-it:free",
  "prompt_tokens": 85,
  "completion_tokens": 42,
  "latency_ms": 1250,
  "generated_message": "...",
  "success": true
}
```

---

## 🚨 TROUBLESHOOTING

### Problem: Poruke su preduguačke (>140 karaktera)

**Rešenje:**
```javascript
// U Make.com, dodaj Text Parser module posle HTTP
if (length(message) > 140) {
  message = truncate(message, 137) + "..."
}
```

**Bolji pristup - u promptu:**
```
KRITIČNO: Poruka MORA biti max 140 karaktera. Nemoj prekoračiti!
```

### Problem: Poruke zvuče previše AI/bot-like

**Rešenje - poboljšaj prompt:**
```
Dodatna pravila:
- Ne koristi fraze: "želeli bismo", "obratite nam se", "kontaktirajte nas"
- Koristi naturalne izraze: "da pričamo?", "zainteresovana?", "da ti pokažem?"
- Piši kao da šalješ poruku prijatelju
```

### Problem: Poruke nisu na srpskom (latinica)

**Rešenje:**
```
System prompt dodaj:
"OBAVEZNO piši na srpskom jeziku koristeći latinicu (ne ćirilicu). Primeri: 'ć' ne 'ћ', 'š' ne 'ш'."
```

### Problem: Model vraća praznu poruku

**Rešenje:**
```javascript
// Validation u Make.com
if (isEmpty(message) OR message.length < 10) {
  message = getDefaultTemplate(username)
}
```

---

## 🔑 ENVIRONMENT VARIABLES

### Make.com Organization Settings:

```
Variable name: OPENROUTER_API_KEY
Value: sk-or-v1-xxxxxxxxxxxxxxxxxx
Type: Secret (encrypted)
Description: OpenRouter API key for free AI models
```

**Access u modulima:**
```
{{env.OPENROUTER_API_KEY}}
```

---

## 📚 DODATNI RESURSI

- OpenRouter Docs: https://openrouter.ai/docs
- Model Comparison: https://openrouter.ai/rankings
- Free Models List: https://openrouter.ai/models?order=newest&pricing=free
- Discord Community: https://discord.gg/openrouter

---

## ✅ FINAL CHECKLIST

- [ ] OpenRouter nalog kreiran
- [ ] API Key generisan i sačuvan
- [ ] Site settings konfigurisani
- [ ] Test HTTP request uspešan (cURL)
- [ ] Make.com modul konfigurisan
- [ ] System prompt optimizovan
- [ ] Error handling podešen
- [ ] Fallback strategija implementirana
- [ ] A/B testing variants pripremirani
- [ ] Environment variable sačuvan u Make.com

---

**Prev:** [Airtable Setup Guide](./Airtable-Setup-Guide.md)  
**Next:** [Apify Setup Guide](./Apify-Setup-Guide.md)

