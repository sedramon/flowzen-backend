# 📑 BexExpress Documentation Index

**Projekat:** Instagram Shop DM Outreach System  
**Status:** ✅ Complete Documentation  
**Datum:** 16. oktobar 2025.

---

## 🚀 START HERE

### Za brzo pokretanje:
1. **[README](./README.md)** - Pregled projekta i tech stack
2. **[Quick Start Guide](./Quick-Start-Guide.md)** - 2-3h setup (POČETAK OVDE!)
3. **[Implementation Checklist](./Implementation-Checklist.md)** - Step-by-step checklist

---

## 📚 CORE DOCUMENTATION

### Glavni Dokumenti:

#### 1. [Instagram DM Outreach System - Main Doc](./Instagram-DM-Outreach-System.md)
**Šta sadrži:**
- Kompletan pregled sistema
- Tech stack (Apify, OpenRouter, Airtable, Make.com)
- Airtable struktura baze
- Modul 1: Instagram Scraping
- Modul 2: AI DM generisanje
- Modul 3: DM slanje
- Limitacije i bezbednost
- Troubleshooting

**Kada čitati:** Pre početka, za razumevanje arhitekture

---

#### 2. [Quick Start Guide](./Quick-Start-Guide.md)
**Šta sadrži:**
- 30 min quick setup
- Build scenarios (60 min)
- Testing (30 min)
- Monitoring setup
- Troubleshooting cheat sheet
- Success metrics

**Kada čitati:** Prvi korak implementacije

---

#### 3. [Implementation Checklist](./Implementation-Checklist.md)
**Šta sadrži:**
- Pre-implementation checklist
- Setup faze (6 faza)
- Testing faze (3 testa)
- Production deployment
- Week 1 monitoring
- Ongoing maintenance
- Incident response

**Kada čitati:** Tokom implementacije (print i follow along)

---

## 🔧 SETUP GUIDES

### Detaljni Setup po Alatu:

#### 4. [Airtable Setup Guide](./Airtable-Setup-Guide.md)
**Šta sadrži:**
- Workspace & Base setup
- Tabela struktura (kolone, tipovi)
- Status options (New, Sent, Replied, Failed)
- Views konfiguracija (5 views)
- Automations (Airtable native)
- Mobile app setup
- Permissions & sharing
- Extensions (Charts, Page Designer)
- Formule (advanced)
- Integration testing

**Kada čitati:** Pre kreiranja Airtable baze

---

#### 5. [OpenRouter Setup Guide](./OpenRouter-Setup-Guide.md)
**Šta sadrži:**
- Besplatni modeli (Gemma 2, LLaMA, Phi-3)
- Account setup
- API Key generisanje
- Make.com HTTP integration
- Prompt engineering (system + user prompts)
- Category-based prompts (handmade, fashion, food)
- Testing (cURL, Make.com)
- Model comparison
- Fallback strategy
- Optimizacije (A/B testing, dynamic temperature)
- Troubleshooting

**Kada čitati:** Pre integracije AI generisanja

---

#### 6. [Apify Setup Guide](./Apify-Setup-Guide.md)
**Šta sadrži:**
- Free tier ($5/mesec)
- Account setup & API token
- Actor 1: Instagram Scraper
  - Input config (hashtags, limits)
  - Output format
  - Alternative search types
- Actor 2: Instagram DM Automation
  - Input config
  - Instagram session ID (kako dobiti)
  - Output format
- Make.com integration (3 modula)
- Testing (scraper, DM, E2E)
- Instagram anti-spam (limits, red flags)
- Proxy setup (residential)
- Monitoring (dashboard, webhooks)
- Troubleshooting
- Optimizacije & scaling

**Kada čitati:** Pre Apify integracije

---

## 🔄 MAKE.COM SCENARIOS

### Scenario Build Guides:

#### 7. [Make Scenario 1 - Scraping](./Make-Scenario-1-Scraping.md)
**Šta sadrži:**
- Modul lista (10 modula)
- Detaljni setup svakog modula:
  1. Schedule Trigger (10:00)
  2. Apify Run Scraper
  3. Get Dataset Items
  4. Filter (bio keywords)
  5. Iterator
  6. HTTP OpenRouter (AI)
  7. Airtable Search (duplicate check)
  8. Router
  9. Airtable Create
  10. Error Handler
- Environment variables
- Success metrics
- Troubleshooting
- Test mode vs Production mode

**Kada čitati:** Tokom build-a Scenario 1

---

#### 8. [Make Scenario 2 - DM Sending](./Make-Scenario-2-DM-Sending.md)
**Šta sadrži:**
- Modul lista (10 modula)
- Detaljni setup:
  1. Schedule (14:00)
  2. Airtable Search (status=New)
  3. Filter
  4. Array Aggregator (limit 5)
  5. Iterator
  6. Sleep (60s anti-spam)
  7. Apify DM Automation
  8. Airtable Update
  9. Error Handler
  10. Slack/Email Report
- Instagram session management
- Rate limits (safe vs risky)
- Ban response strategy
- Monitoring & analytics
- Retry logic
- Troubleshooting
- Optimizacije (A/B testing, smart scheduling)
- Scaling (multi-account)

**Kada čitati:** Tokom build-a Scenario 2

---

## 📊 VISUAL DOCUMENTATION

#### 9. [Workflow Diagrams](./Workflow-Diagrams.md)
**Šta sadrži:**
- Master workflow (ASCII art)
- Scenario 1 diagram (detailed)
- Scenario 2 diagram (detailed)
- Data flow (profile journey)
- Module connections
- Airtable views structure
- Error handling flow
- AI prompt flow
- Scaling architecture
- State machine (profile lifecycle)
- Timeline example (Day 1-7)
- Visual summary

**Kada čitati:** Za vizuelno razumevanje sistema

---

## 📋 QUICK REFERENCE

### Cheat Sheets:

#### Tech Stack Summary:
```
Instagram → Apify → OpenRouter AI → Airtable → Apify DM → Tracking
```

#### Daily Schedule:
```
10:00 AM - Scraping Run (Scenario 1)
2:00 PM  - DM Sending Run (Scenario 2)
6:00 PM  - Manual Reply Check
```

#### Key Limits:
```
- Instagram DMs: 5/day (strict!)
- Apify Credits: $5/month free
- OpenRouter: $0 (free models)
- Airtable: 1,200 records free
```

#### API Keys Needed:
```
1. APIFY_TOKEN
2. OPENROUTER_API_KEY
3. AIRTABLE_TOKEN
4. INSTAGRAM_SESSION_ID
```

---

## 🎯 WORKFLOW BY ROLE

### For Developer/Implementer:

**Day 1 (Setup):**
1. Read: [README](./README.md)
2. Follow: [Quick Start Guide](./Quick-Start-Guide.md)
3. Use: [Implementation Checklist](./Implementation-Checklist.md)

**Day 2 (Build):**
1. Setup: [Airtable](./Airtable-Setup-Guide.md)
2. Setup: [OpenRouter](./OpenRouter-Setup-Guide.md)
3. Setup: [Apify](./Apify-Setup-Guide.md)

**Day 3 (Scenarios):**
1. Build: [Scenario 1](./Make-Scenario-1-Scraping.md)
2. Build: [Scenario 2](./Make-Scenario-2-DM-Sending.md)
3. Test: E2E workflow

**Day 4 (Launch):**
1. Final checks: [Checklist](./Implementation-Checklist.md)
2. Go live!

---

### For Project Manager:

**Pre-Launch:**
- Review: [README](./README.md) - understand scope
- Check: [Implementation Checklist](./Implementation-Checklist.md) - track progress

**Week 1:**
- Monitor: Daily checks in checklist
- Review: Weekly summary

**Monthly:**
- Analyze: Success metrics
- Plan: Scaling strategy

---

### For Business Owner:

**Understanding:**
- Read: [README](./README.md) - what system does
- Read: [Workflow Diagrams](./Workflow-Diagrams.md) - visual overview

**Costs:**
- $5-6/month (Apify)
- $0 (all other tools - free tier)

**ROI:**
- Target: 5% conversion (7+ clients/month)
- If client value > $100 → ROI positive!

---

## 📈 TROUBLESHOOTING INDEX

### Common Issues & Solutions:

| Issue | Document | Section |
|-------|----------|---------|
| Instagram ban | [Apify Guide](./Apify-Setup-Guide.md) | Instagram Anti-Spam |
| Session expired | [Scenario 2](./Make-Scenario-2-DM-Sending.md) | Session Management |
| DM not delivered | [Apify Guide](./Apify-Setup-Guide.md) | Troubleshooting |
| AI messages poor quality | [OpenRouter Guide](./OpenRouter-Setup-Guide.md) | Prompt Engineering |
| Duplicate records | [Scenario 1](./Make-Scenario-1-Scraping.md) | Router Logic |
| Apify credits depleted | [Checklist](./Implementation-Checklist.md) | Incident Response |

---

## 🔗 EXTERNAL RESOURCES

### Official Docs:
- [Apify Docs](https://docs.apify.com)
- [OpenRouter Docs](https://openrouter.ai/docs)
- [Airtable API](https://airtable.com/developers/web/api)
- [Make.com Academy](https://academy.make.com)

### Community:
- [Make.com Community](https://community.make.com)
- [Apify Discord](https://discord.gg/apify)
- [OpenRouter Discord](https://discord.gg/openrouter)

### Tools:
- [Apify Console](https://console.apify.com)
- [OpenRouter Dashboard](https://openrouter.ai/dashboard)
- [Airtable](https://airtable.com)
- [Make.com Scenarios](https://make.com/scenarios)

---

## 📂 FILE STRUCTURE

```
docs/BEXX/
│
├── README.md                          # Main overview
├── INDEX.md                           # This file (navigation)
├── Quick-Start-Guide.md               # Fast setup (2-3h)
├── Implementation-Checklist.md        # Step-by-step checklist
│
├── Instagram-DM-Outreach-System.md    # Complete system doc
├── Workflow-Diagrams.md               # Visual diagrams
│
├── Airtable-Setup-Guide.md            # Airtable setup
├── OpenRouter-Setup-Guide.md          # AI setup
├── Apify-Setup-Guide.md               # Instagram scraping/DM
│
├── Make-Scenario-1-Scraping.md        # Scenario build guide
└── Make-Scenario-2-DM-Sending.md      # Scenario build guide
```

---

## ✅ COMPLETION STATUS

### Documentation Status:

- [x] README (Overview)
- [x] Quick Start Guide
- [x] Implementation Checklist
- [x] Main System Doc
- [x] Airtable Setup Guide
- [x] OpenRouter Setup Guide
- [x] Apify Setup Guide
- [x] Make Scenario 1 Guide
- [x] Make Scenario 2 Guide
- [x] Workflow Diagrams
- [x] INDEX (this file)

**Total:** 11 documents  
**Status:** ✅ Complete

---

## 🎯 RECOMMENDED READING ORDER

### First-Time Setup:

1. **[README](./README.md)** ← Start here!
2. **[Quick Start Guide](./Quick-Start-Guide.md)**
3. **[Implementation Checklist](./Implementation-Checklist.md)**
4. **[Airtable Setup Guide](./Airtable-Setup-Guide.md)**
5. **[OpenRouter Setup Guide](./OpenRouter-Setup-Guide.md)**
6. **[Apify Setup Guide](./Apify-Setup-Guide.md)**
7. **[Make Scenario 1 - Scraping](./Make-Scenario-1-Scraping.md)**
8. **[Make Scenario 2 - DM Sending](./Make-Scenario-2-DM-Sending.md)**

### For Reference:

- **[Workflow Diagrams](./Workflow-Diagrams.md)** - Visual understanding
- **[Main System Doc](./Instagram-DM-Outreach-System.md)** - Deep dive

### During Operation:

- **[Implementation Checklist](./Implementation-Checklist.md)** - Daily/weekly checks
- **Troubleshooting sections** - As needed

---

## 📞 SUPPORT

### Need Help?

1. **Search this index** for relevant document
2. **Check troubleshooting sections** in each guide
3. **Community forums** (links above)
4. **Official support** (links above)

### Contribute:

Found issue or improvement?
- Update relevant document
- Keep index in sync
- Document new learnings

---

**Last Updated:** 16. oktobar 2025.  
**Version:** 1.0  
**Maintainer:** BexExpress Team

---

## 🚀 QUICK ACTIONS

**Want to start RIGHT NOW?**

→ Go to: **[Quick Start Guide](./Quick-Start-Guide.md)**

**Need visual overview?**

→ Go to: **[Workflow Diagrams](./Workflow-Diagrams.md)**

**Setting up specific tool?**

→ Choose:
- [Airtable](./Airtable-Setup-Guide.md)
- [OpenRouter](./OpenRouter-Setup-Guide.md)
- [Apify](./Apify-Setup-Guide.md)

**Building Make.com scenario?**

→ Go to:
- [Scenario 1](./Make-Scenario-1-Scraping.md)
- [Scenario 2](./Make-Scenario-2-DM-Sending.md)

**Troubleshooting?**

→ Search "Troubleshooting" in relevant guide

---

**Happy Building! 🎉**

