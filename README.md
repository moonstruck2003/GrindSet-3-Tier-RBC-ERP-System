# 🚀 GrindSet - Enterprise Project Management & ERP System

**GrindSet** is a high-performance Enterprise Project Management & ERP platform built with a **.NET 8 ASP.NET Core Web API** backend (featuring Entity Framework Core, SQLite, and Swagger) and a **React + Tailwind CSS + Framer Motion** frontend scaffolded via Vite.

The repository is structured as a clean full-stack monorepo designed for a **3-member engineering team working remotely from home over separate networks using GitHub**.

---

## 🛠️ System Tech Stack & UI Design Ecosystem

| Layer | Technology | Purpose & Usage Guidelines |
| :--- | :--- | :--- |
| **Backend** | .NET 8 ASP.NET Core Minimal Web API | REST APIs, Swagger / OpenAPI docs, CORS middleware |
| **ORM & DB** | Entity Framework Core 8 + SQLite | 20-Table ERD schema, Code-First migrations, Auto-seeder |
| **Frontend** | React 18 (scaffolded via Vite) | Component architecture, fast HMR dev server |
| **Animations** | **motion.dev** (Framer Motion) | Smooth hover effects (`whileHover`), drag interactions (`drag="x"`), and layout transitions |
| **Analytics Visuals** | **BKlit.ui** Data Visuals | Animated velocity charts, budget allocation bars, and telemetry gauges |
| **Component Suite** | **Kokonut.ui** Readymade Components | Bento grid cards, command palette search bars (`⌘K`), and badge indicators |
| **Styling** | Tailwind CSS v4 + PostCSS | Dark navy Jira theme (`#07132B`) & gold accent buttons (`#FFC400`) |
| **Icons** | Lucide React | Modern enterprise vector icons |

---

## 🎨 UI Component Design Patterns (for Team Development)

When extending the frontend with new features or dashboard views, utilize these established patterns:

### 1. motion.dev Interactive Micro-Interactions
```jsx
// Hover & Tap Spring Physics
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="btn-jira-gold px-6 py-3 rounded font-bold"
>
  Get Started
</motion.button>

// Horizontal Drag Task Card
<motion.div
  drag="x"
  dragConstraints={{ left: -20, right: 20 }}
  whileHover={{ scale: 1.02 }}
  className="p-3 rounded bg-[#172B4D] cursor-grab active:cursor-grabbing"
>
  Task Item
</motion.div>
```

### 2. BKlit.ui Data Visuals & Charts
- Place animated bar charts and metric gauges inside `.jira-dark-card` containers.
- Use `#00C7E6` (Mint Cyan) for sprint velocity and `#0052CC` (Atlassian Blue) for budget ledgers.

### 3. Kokonut.ui Bento Cards & Command Palette
- Layout subsystem feature cards using Kokonut.ui 3-column bento grids (`grid md:grid-cols-3 gap-6`).
- Include `⌘K` command palette shortcuts in header navigation bars.

---

## 📋 Prerequisites

Before running the project, ensure your development machine has the following installed:

1. **.NET 8 SDK** (or .NET 9 SDK): `dotnet --version`
2. **Node.js (v18+) & npm**: `node -v` and `npm -v`
3. **EF Core Global CLI Tool**:
   ```bash
   dotnet tool install --global dotnet-ef
   ```

---

## 🚀 How to Run the Project (Step-by-Step for Team Members)

### Step 1: Start the ASP.NET Core Backend API
Open a terminal window:

```bash
# Navigate to backend directory:
cd GrindSet-ERP/backend/GrindSet.Api

# Run the API server (automatically applies EF Core migrations & seeds 20 ERD tables)
dotnet run
```

- **Swagger API Documentation**: Open **`http://localhost:5000/swagger`** or **`https://localhost:7xxx/swagger`** in your browser.
- **REST Endpoints Available**:
  - `GET /api/health` — Backend system status
  - `GET /api/subsystems` — List of 6 GrindSet ERP subsystems
  - `GET /api/projects` — Enterprise projects list
  - `GET /api/users` — User accounts & roles
  - `GET /api/erd-summary` — 20-table ERD entity counts

---

### Step 2: Start the React Frontend Application
Open a **second terminal window**:

```bash
# Navigate to frontend directory:
cd GrindSet-ERP/frontend

# Install dependencies (only needed first time)
npm install

# Start Vite live development server
npm run dev
```

- **Jira Website Replica UI**: Open **`http://localhost:5173`** in your browser.

---

## 🌐 Remote Team (3 WFH Networks) GitHub Database Sync Workflow

All 3 team members work on separate home networks. Database schema changes are synchronized seamlessly via **GitHub and EF Core Migrations**:

### Scenario A: Developer A creates a new Database Model / Field
```bash
# 1. Edit C# Entity class in backend/GrindSet.Api/Models/Entities.cs
# 2. Add an EF Core Migration C# file:
cd GrindSet-ERP/backend/GrindSet.Api
dotnet ef migrations add AddNewFeatureField

# 3. Commit and push the migration code to GitHub:
git add .
git commit -m "Add new feature model migration"
git push origin main
```

### Scenario B: Developers B & C pull the update
```bash
# 1. Pull the latest code from GitHub:
git pull origin main

# 2. Start the backend:
cd GrindSet-ERP/backend/GrindSet.Api
dotnet run

# EF Core automatically runs `context.Database.EnsureCreated()` / `Migrate()` on startup!
# Your local `grindset.db` updates instantly to match the remote schema.
```

---

## 📁 Repository Structure Overview

```text
GrindSet-ERP/
├── .gitignore                      # Git ignore rules for .NET, Node, and SQLite locks
├── README.md                       # Developer onboarding & UI design guide
├── backend/
│   └── GrindSet.Api/
│       ├── GrindSet.Api.csproj     # .NET 8 Web API project & EF Core packages
│       ├── Program.cs              # Minimal API, Swagger, CORS, and DbInitializer call
│       ├── appsettings.json        # SQLite connection string: Data Source=grindset.db
│       ├── Data/
│       │   ├── GrindSetDbContext.cs # EF Core DbContext mapping all 20 ERD tables
│       │   └── DbInitializer.cs    # Auto-migration & startup seeder for sample data
│       ├── Migrations/             # EF Core Migration C# files (Tracked in Git)
│       └── Models/
│           └── Entities.cs         # 20 C# entity classes matching the ERD diagram
└── frontend/
    ├── package.json                # React 18, Vite, motion.dev, Tailwind CSS, Lucide
    ├── tailwind.config.js          # Tailwind CSS theme configuration
    ├── postcss.config.js           # PostCSS configuration with @tailwindcss/postcss
    └── src/
        ├── main.jsx                # React app mounting point
        ├── App.jsx                 # Jira landing page clone with motion.dev & BKlit visuals
        ├── index.css               # Jira dark navy theme & gold button styling
        └── config/
            └── api.js              # REST API endpoint helper for ASP.NET backend
```

---

## 📜 License & Credits

Developed by the **GrindSet 3-Person Engineering Team**.  
Powered by .NET 8, ASP.NET Core Minimal APIs, EF Core SQLite, React 18, motion.dev, BKlit.ui, and Kokonut.ui design patterns.
