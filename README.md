# RMS — Room Management System

Hệ thống quản lý phòng trọ (Room Management System) xây dựng trên ASP.NET Core Web API + React (Vite + TypeScript).

## Tech Stack

### Backend
- **Runtime:** .NET 10 / ASP.NET Core Web API
- **ORM:** Entity Framework Core + SQL Server
- **Architecture:** Clean Architecture (Domain → Application → Infrastructure → API)
- **Auth:** JWT Bearer Authentication
- **Testing:** xUnit + Moq + FluentAssertions

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **State Management:** Zustand
- **HTTP Client:** Axios

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
├── .github/workflows/ci.yml
├── docker-compose.yml
└── README.md
```

## Cách chạy

### Prerequisites
- .NET 10 SDK
- Node.js 20+
- Docker (cho SQL Server)

### 1. Khởi động Database

```bash
cp .env.example .env
# Replace every placeholder in .env, then:
docker compose --env-file .env up -d sqlserver
docker compose ps
```

Đợi container chuyển sang trạng thái `healthy`. File `.env` phục vụ Docker
Compose; export `ConnectionStrings__DefaultConnection` vào process chạy .NET
trước khi dùng script database.

### 2. Apply migration

```powershell
$env:ASPNETCORE_ENVIRONMENT = "Development"
$env:ConnectionStrings__DefaultConnection = "<local-development-connection-string>"
./scripts/database-update.ps1
```

Reset có xác nhận và tùy chọn development seed:

```powershell
./scripts/database-reset.ps1 -Seed
```

Chi tiết cấu hình, migration, rollback và cảnh báo mất dữ liệu:
`docs/database-setup.md`.

### 3. Chạy Backend

```bash
cd backend
dotnet run --project src/RMS.API
```

API sẽ chạy tại: `https://localhost:5001` / `http://localhost:5000`

### 4. Chạy Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

### 5. Chạy Tests

```bash
# Unit tests + EF model tests
dotnet test backend/src/RMS.Tests/RMS.UnitTests/RMS.UnitTests.csproj

# SQL Server 2022 integration tests (requires Docker)
dotnet test backend/src/RMS.Tests/RMS.IntegrationTests/RMS.IntegrationTests.csproj

# Frontend unit/component tests
cd frontend
npm run test
```

## License

Private — Internal use only.
