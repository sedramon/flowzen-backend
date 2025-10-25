# 🤖 VOICEFLOW KONFIGURACIJA - MOKA BEAUTY STUDIO

> **Poslednje ažurirano:** 12. oktobar 2025  
> **Agent:** MAXX Agent  
> **Status:** ✅ Funkcionalan

---

## 📁 STRUKTURA FOLDERA

```
Voiceflow/
├── README.md                           ← OVAJ FAJL (pregled)
├── Knowledge-Base/                     ← Baza znanja agenta
│   └── salon-info.md
├── MAXX-Agent/                         ← Glavni agent konfiguracija
│   ├── instructions.md
│   └── agent-config.md
└── API-Tools/                          ← API integracije
    ├── Appointment-Create-API.md
    ├── Client-Create-API.md
    └── List-Records-Integration.md
```

---

## 🎯 SVRHA DOKUMENTACIJE

Ovi fajlovi predstavljaju **1:1 kopiju** tvog Voiceflow podešavanja, kako bi:
- Uvek znali šta je trenutno konfigurisano
- Mogli da pratimo promene kroz vreme
- Imali backup ako nešto pođe po zlu
- Lakše unapređivali agenta

---

## 🤖 TRENUTNA FUNKCIONALNOST

### ✅ Šta agent radi:
- Zakazuje termine za vlasnika (lični asistent mod)
- Kreira nove klijente ako ne postoje
- Pronalazi postojeće klijente
- Povezuje klijente i usluge sa terminima
- **Unosi plaćanja (avans, plaćanje, povraćaj)** ← NOVO!
- **Automatski proverava da li usluga zahteva avans** ← NOVO!
- Unosi podatke u Airtable (Appointments, Clients, Payments)

### 📋 Proces zakazivanja (sa avansom):
1. Traži podatke: Ime, Telefon, Email, Usluga, Datum, Vreme
2. Proverava da li klijent postoji (po telefonu/emailu)
3. Ako ne postoji → Kreira novog klijenta
4. Pronalazi record ID usluge
5. **Proverava da li usluga zahteva avans** ← NOVO!
6. Kreira termin sa povezanim poljima
7. **Ako usluga zahteva avans → Pita za avans i unosi Payment** ← NOVO!
8. Potvrđuje vlasnici zakazivanje (+ stanje plaćanja)

---

## 🔗 INTEGRACIJE

### Airtable Base:
- **Base ID:** `appqzwTXdTkG0qrc0`

### Tabele:
- **Appointments** - Termini
- **Clients** - Klijenti
- **Services** - Usluge
- **Payments** - Plaćanja (za buduću upotrebu)
- **Analytics** - Analitika (za buduću upotrebu)

---

## 📝 KAKO AŽURIRATI OVU DOKUMENTACIJU

Kada nešto promeniš u Voiceflow-u:

1. **Promeniš Knowledge Base?**
   → Ažuriraj `Knowledge-Base/salon-info.md`

2. **Promeniš instrukcije agenta?**
   → Ažuriraj `MAXX-Agent/instructions.md`

3. **Dodaš/promeniš API?**
   → Ažuriraj odgovarajući fajl u `API-Tools/`

4. **Napraviš novi funkcionalitet?**
   → Napravi novi folder sa odgovarajućim fajlovima

---

## 🚀 BUDUĆA UNAPREĐENJA (TO-DO)

- [ ] Automatsko slanje podsetnika klijentima
- [ ] Mogućnost klijenata da sami zakažu online
- [ ] Integracija sa Payments tabelom
- [ ] Dashboard za vlasnika (pregled termina)
- [ ] AI predlozi za optimizaciju rasporeda

---

**Verzija:** 1.0  
**Kreirao:** Claude AI + Vlasnik  
**Za:** MOKA Beauty Studio Voiceflow Agent

