# Flowzen Backend API

Flowzen je kompletan sistem za upravljanje salonima i klinikama, koji uključuje POS (Point of Sale) funkcionalnosti, upravljanje terminima, klijentima, zaposlenima i uslugama.

## 🚀 Funkcionalnosti

- **Autentifikacija i autorizacija** - JWT-based auth sa role-based access control
- **Upravljanje korisnicima** - Registracija, prijava, upravljanje profilima
- **POS sistem** - Kompletna kasa sa artiklima, uslugama i transakcijama
- **Upravljanje terminima** - Zakazivanje i upravljanje terminima
- **Upravljanje klijentima** - CRM funkcionalnosti
- **Upravljanje zaposlenima** - HR funkcionalnosti
- **Upravljanje uslugama** - Katalog usluga i artikala
- **Raspored rada** - Upravljanje smenama i radnim vremenom
- **Multi-tenant arhitektura** - Podrška za više lokacija
- **REST API** - Kompletna API dokumentacija sa Swagger

## 🛠️ Tehnologije

- **Backend**: NestJS, TypeScript, Node.js
- **Baza podataka**: PostgreSQL + MongoDB
- **Autentifikacija**: JWT, Passport
- **Validacija**: class-validator, class-transformer
- **Dokumentacija**: Swagger/OpenAPI
- **Logging**: Pino
- **Docker**: Containerization

## 📋 Preduslovi

- Node.js (v18 ili noviji)
- Yarn ili npm
- PostgreSQL
- MongoDB
- Docker (opciono)

## 🚀 Pokretanje aplikacije

### 1. Kloniranje repozitorijuma

```bash
git clone <repository-url>
cd flowzen-backend
```

### 2. Instalacija dependencija

```bash
yarn install
# ili
npm install
```

### 3. Konfiguracija environment varijabli

Kopirajte `env.example` fajl i konfigurišite potrebne varijable:

```bash
cp env.example .env
```

Uredite `.env` fajl sa vašim podacima:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/flowzen?retryWrites=true&w=majority&appName=Flowzen
POSTGRES_URI=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-here
PORT=3000
FRONTEND_URL=http://localhost:4200
```

### 4. Pokretanje baza podataka

#### Opcija A: Docker Compose (preporučeno)

```bash
docker-compose up -d postgres mongodb
```

#### Opcija B: Lokalno

- Instalirajte PostgreSQL i MongoDB
- Kreirajte baze podataka
- Konfigurišite connection string-ove u `.env` fajlu

### 5. Pokretanje aplikacije

```bash
# Development mode
yarn start:dev

# Production mode
yarn build
yarn start:prod
```

### 6. API dokumentacija

Nakon pokretanja, API dokumentacija je dostupna na:
- http://localhost:3000/docs

## 🐳 Docker

### Pokretanje sa Docker Compose

```bash
# Pokretanje svih servisa
docker-compose up -d

# Samo baze podataka
docker-compose up -d postgres mongodb

# Logovi
docker-compose logs -f backend
```

### Build Docker image

```bash
docker build -t flowzen-backend .
docker run -p 3000:3000 flowzen-backend
```

## 🧪 Testiranje

```bash
# Unit testovi
yarn test

# E2E testovi
yarn test:e2e

# Test coverage
yarn test:cov
```

## 📁 Struktura projekta

```
src/
├── modules/           # Business logic moduli
│   ├── auth/         # Autentifikacija
│   ├── users/        # Upravljanje korisnicima
│   ├── appointments/ # Termini
│   ├── clients/      # Klijenti
│   ├── employees/    # Zaposleni
│   ├── pos/          # POS sistem
│   └── ...
├── config/           # Konfiguracija
├── database/         # Database konfiguracija
└── main.ts          # Entry point
```

## 🔧 Development

### Code formatting

```bash
yarn format
```

### Linting

```bash
yarn lint
```

## 📝 API Endpoints

Glavni API endpoints:

- `POST /auth/login` - Prijava
- `POST /auth/register` - Registracija
- `GET /users` - Lista korisnika
- `GET /appointments` - Lista termina
- `POST /pos/sales` - Kreiranje prodaje
- `GET /docs` - Swagger dokumentacija

## 🤝 Doprinos

1. Fork repozitorijum
2. Kreirajte feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit promene (`git commit -m 'Add some AmazingFeature'`)
4. Push na branch (`git push origin feature/AmazingFeature`)
5. Otvorite Pull Request

## 📄 Licenca

Ovaj projekat je licenciran pod MIT licencom.
