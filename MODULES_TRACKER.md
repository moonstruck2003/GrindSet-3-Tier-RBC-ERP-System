# 📋 GrindSet ERP - Subsystem Modules & Feature Tracker

This document tracks all 5 core subsystems and their constituent use cases based on the official system architecture and ERD diagrams. 

Team members should mark completed items by changing `[ ]` to `[x]`.

---

## 🔐 1. Authentication & Identity Subsystem

- [x] **Monorepo & Database Setup** (ASP.NET Core Web API, EF Core 8 SQLite, 20 ERD Tables)
- [x] **Jira ERP Portal Shell & Role Selector** (SuperAdmin, CompanyOwner, Employee)
- [ ] **Register Tenant (Company)**
  - [ ] Verify Email / Domain (`«include»`)
- [ ] **Login to ERP Portal**
  - [ ] Trigger Multi-Factor Auth (`«extend»`)
  - [ ] Lock Account on Failed Attempts (`«extend»`)
- [ ] **Reset Password Workflow**
- [ ] **Manage Role-Based Access (RBAC)** (Admin)
- [ ] **View Security Audit Logs** (Admin)

---

## 🏢 2. Company & Workforce Subsystem

- [ ] **Manage Tenant Profile** (Company User / Admin)
  - [ ] Verify Business License (`«extend»` Admin)
- [ ] **Onboard New Employee**
  - [ ] Set Hourly Billing Rate (`«include»`)
  - [ ] Assign Department (`«include»`)
- [ ] **Update Employee Details**
  - [ ] Deactivate / Suspend Employee (`«extend»`)
- [ ] **Generate Workforce Roster & Directory**

---

## 📁 3. Project Management Subsystem

- [ ] **Initialize New Project**
  - [ ] Define Scope & Objectives (`«include»`)
  - [ ] Set Project Timeline & Milestones (`«include»`)
- [ ] **Update Project Status**
  - [ ] Request Deadline Extension (`«extend»`)
  - [ ] Notify Stakeholders (`«extend»`)
- [ ] **View Project Dashboard** (Agile Kanban Board & Sprint Progress)
- [ ] **Close Project Lifecycle**
  - [ ] Archive Project Data (`«include»`)

---

## 👥 4. Resource Allocation Subsystem

- [ ] **Assign Employee to Project**
  - [ ] Set Project Role & Capacity (`«include»`)
- [ ] **View Project Team & Allocation Matrix**
- [ ] **Remove / Offboard Employee from Project**

---

## 💰 5. Financial Management Subsystem

- [ ] **Allocate Base Budget** (Admin / Company User)
- [ ] **Initialize Project Ledger**
  - [ ] Monitor Budget Burn Rate (`«include»`)
- [ ] **Reallocate Funds Across Projects**
- [ ] **Flag Budget Overrun Alerts** (`«extend»`)
- [ ] **Generate P&L Report**
  - [ ] Calculate Total Expenses (`«include»`)
  - [ ] Export Financials (PDF / CSV) (`«extend»`)

---

## 🏆 Summary Matrix

| Subsystem | Total Use Cases | Status |
| :--- | :---: | :---: |
| **1. Auth & Identity** | 8 | 🟡 In Progress (Baseline API & UI Ready) |
| **2. Company & Workforce** | 5 | ⚪ Pending |
| **3. Project Management** | 5 | ⚪ Pending |
| **4. Resource Allocation** | 3 | ⚪ Pending |
| **5. Financial Management** | 6 | ⚪ Pending |
