# RMS — Room Management System

Hệ thống quản lý phòng trọ (Room Management System) xây dựng trên ASP.NET Core Web API + React (Vite + TypeScript).

## Tech Stack

### Backend
- **Runtime:** .NET 8 / ASP.NET Core Web API
- **ORM:** Entity Framework Core + SQL Server
- **Architecture:** Clean Architecture (Domain → Application → Infrastructure → API)
- **Auth:** JWT Bearer Authentication
- **Testing:** xUnit + Moq + FluentAssertions

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **State Management:** Zustand
- **HTTP Client:** Axios
- **E2E Testing:** Playwright

### DevOps
- **CI/CD:** GitHub Actions
- **Database:** SQL Server 2022 (Docker)

## Cấu trúc thư mục

```
RMS/
├── backend/
│   ├── RMS.slnx
│   └── src/
│       ├── RMS.API/              # Web API layer (Controllers, Middleware)
│       ├── RMS.Application/      # Application layer (DTOs, Interfaces, Services)
│       ├── RMS.Domain/           # Domain layer (Entities, Enums, Exceptions)
│       ├── RMS.Infrastructure/   # Infrastructure layer (EF Core, Repositories)
│       └── RMS.Tests/
│           ├── RMS.UnitTests/
│           └── RMS.IntegrationTests/
├── frontend/
│   ├── src/
│   │   ├── api/                  # Axios config + API functions
│   │   ├── components/           # Shared components + Layout
│   │   ├── hooks/                # Custom hooks
│   │   ├── pages/                # Page components
│   │   ├── store/                # Zustand stores
│   │   └── types/                # TypeScript type definitions
│   └── e2e/                      # Playwright tests
├── .github/workflows/ci.yml
├── docker-compose.yml
└── README.md
```

## Cách chạy

### Prerequisites
- .NET 8 SDK
- Node.js 20+
- Docker (cho SQL Server)

### 1. Khởi động Database

```bash
docker-compose up -d
```

### 2. Chạy Backend

```bash
cd backend
dotnet run --project src/RMS.API
```

API sẽ chạy tại: `https://localhost:5001` / `http://localhost:5000`

### 3. Chạy Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

### 4. Chạy Tests

```bash
# Backend unit tests
cd backend
dotnet test

# Frontend e2e tests
cd frontend
npx playwright test
```

## License

Private — Internal use only.
