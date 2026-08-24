# 🚀 GrindSet - 3 Tier RBC ERP System

**GrindSet** is an Enterprise Project Management & ERP platform built with a **.NET 8 ASP.NET Core Web API** backend (featuring Entity Framework Core, SQLite, 20 ERD tables, and Swagger OpenAPI) and a **React + Tailwind CSS** frontend scaffolded via Vite.

The repository is structured as a full-stack monorepo designed for a **3-person engineering team working remotely over GitHub**.

---

## 📋 System Prerequisites

Before running the project, ensure your development machine has:

1. **.NET 8 SDK** (or .NET 9 SDK): Check version via `dotnet --version`
2. **Node.js (v18+) & npm**: Check versions via `node -v` and `npm -v`
3. **EF Core Global CLI Tool**:
   ```bash
   dotnet tool install --global dotnet-ef
   ```

---

## ⚡ How to Run the Project (Step-by-Step)

Follow these simple steps to start both backend and frontend services:

### Step 1: Start the ASP.NET Core Backend API & Database
Open your first terminal window:

```bash
# 1. Navigate to backend project directory:
cd backend/GrindSet.Api

# 2. Run the ASP.NET Core Web API server:
dotnet run
```

- **Database Initialization**: On startup, EF Core automatically creates the SQLite database (`grindset.db`), executes pending migrations, and seeds baseline enterprise data across all 20 ERD tables.
- **Swagger Interactive API Documentation**: Open **`http://localhost:5000/swagger`** in your browser.
- **REST Endpoints Available**:
  - `GET /api/health` — System & database connection status
  - `GET /api/subsystems` — 6 GrindSet ERP Subsystems list
  - `GET /api/projects` — Enterprise projects list
  - `GET /api/users` — User accounts & roles
  - `GET /api/erd-summary` — 20-table ERD summary counts

---

### Step 2: Start the React Frontend Application
Open a **second terminal window**:

```bash
# 1. Navigate to frontend directory:
cd frontend

# 2. Install dependencies (only required the first time):
npm install

# 3. Start the Vite development server:
npm run dev
```

- **Jira Landing Page & ERP Portal UI**: Open **`http://localhost:5173/`** in your browser.
- **Day / Dark Theme Toggle**: The application launches in **Day Mode by default** with a Sun/Moon toggle switch in the top header.

---

## 🌐 Remote Team (3 WFH Networks) GitHub Database Sync Guide

Since team members work on separate home networks, database schema updates are synchronized seamlessly via **GitHub and EF Core Migrations**:

### 1. Developer updating the Database Schema:
```bash
# Edit C# entity models in backend/GrindSet.Api/Models/Entities.cs
cd backend/GrindSet.Api
dotnet ef migrations add AddNewSchemaField

# Commit and push migration C# files to GitHub:
git add .
git commit -m "Add new migration for database schema"
git push origin main
```

### 2. Other Team Members pulling updates:
```bash
# Pull the latest changes from GitHub:
git pull origin main

# Start the backend API:
cd backend/GrindSet.Api
dotnet run

# EF Core automatically runs migrations on startup and updates local SQLite database!
```

---

## 📁 Repository Directory Structure

```text
GrindSet-ERP/
├── .gitignore                      # Git ignore rules for .NET, Node, and SQLite locks
├── README.md                       # Developer onboarding & execution guide
├── backend/
│   └── GrindSet.Api/
│       ├── GrindSet.Api.csproj     # ASP.NET Core project & EF Core packages
│       ├── Program.cs              # Minimal API, Swagger UI, CORS, and DbInitializer
│       ├── appsettings.json        # SQLite database connection string
│       ├── Data/
│       │   ├── GrindSetDbContext.cs # EF Core DbContext mapping all 20 ERD tables
│       │   └── DbInitializer.cs    # Auto-migration & seeder for sample data
│       ├── Migrations/             # EF Core Migration C# files (Tracked in Git)
│       └── Models/
│           └── Entities.cs         # 20 C# entity classes matching ERD schema
└── frontend/
    ├── package.json                # React 18, Vite, Framer Motion, Tailwind CSS, Lucide
    ├── postcss.config.js           # PostCSS configuration
    └── src/
        ├── App.jsx                 # Jira ERP landing page UI with Day theme default
        ├── index.css               # Atlassian design system tokens
        ├── main.jsx                # React app entry point
        └── config/
            └── api.js              # REST API endpoint helper for ASP.NET backend
```

---

## 📜 License & Credits

Developed for **GrindSet - 3 Tier RBC ERP System**.  
Powered by .NET 8, ASP.NET Core Minimal Web API, Entity Framework Core, SQLite, and React 18.
