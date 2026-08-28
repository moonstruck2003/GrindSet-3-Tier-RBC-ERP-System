# GrindSet ERP — Feature Documentation & Business Advantages

Welcome to the comprehensive feature documentation for **GrindSet ERP**, a modern, production-grade 3-Tier Enterprise Resource Planning system built with **.NET 9 ASP.NET Core API**, **Entity Framework Core with SQLite**, and **React 19 + Vite with Framer Motion**.

This document details every feature implemented across the platform, explaining **what it does**, **how it works**, and the **business & technical advantages** it delivers to enterprise organizations.

---

## 1. 3-Tier Role-Based Access Control (RBAC) & Role-Specific Dashboards

### What It Does
GrindSet ERP enforces strict 3-tier Role-Based Access Control across **System Admin (SuperAdmin)**, **Company Owner (Tenant Admin)**, and **Employee**. Each role accesses a custom-tailored Jira/SAP-grade dashboard:
- 👑 **System Admin Dashboard**: Global tenant governance, pending company signups queue, cross-tenant employee oversight (Block/Unblock, Report to Employer), and system security audit logs.
- 🏢 **Company Owner Dashboard**: Workforce management, pending employee signup queue, project budgets, and CFO financial accounts controller.
- 👨‍💻 **Employee Portal**: Agile Sprint Kanban board (To Do, In Progress, Done), personal project allocations, hourly billing timesheet calculator, and reimbursement claims tracker.

### Enterprise Advantage
- **SOC2 & ISO 27001 Compliance**: Guarantees zero cross-tenant data leakage by restricting data access based on authenticated identity.
- **Maximized Productivity**: Tailors the interface specifically to what each role needs to perform their job efficiently, removing clutter.

---

## 2. Multi-Stage Approval Workflows & Interface Blur Lock Overlay (`ApprovalPendingOverlay`)

### What It Does
Signups follow a multi-stage approval hierarchy:
1. **Company Signups**: Assigned `ApprovalStatus = "PendingAdmin"`.
2. **Employee Signups**: Assigned `ApprovalStatus = "PendingCompany"`.
3. **Glassmorphism Blur Overlay**: Non-approved users are locked behind a non-dismissible Atlassian-styled modal (`backdrop-blur-md opacity-30 pointer-events-none`) stating their pending approval status, featuring a real-time status check button and sign out option.

### Enterprise Advantage
- **Zero Unauthorized Access**: Prevents rogue tenant signups or unverified employees from viewing confidential company data before formal approval.
- **Real-Time Governance**: Empowers Admins and Company Owners to inspect registration credentials before granting system access.

---

## 3. Project-Scoped Task Management & EF Persistence (`TaskItem` Entity)

### What It Does
- Every task created in the platform **MUST** be bound to a target Project selected from a project dropdown.
- Tasks contain complete metadata: `TaskId`, `ProjectId`, `AssigneeId`, `Title`, `Description`, `Priority` (*Highest, High, Medium, Low*), `Status` (*To Do, In Progress, In Review, Done*), `StoryPoints`, and `CreatedAt`.
- Fully backed by Entity Framework Core SQLite database persistence.

### Enterprise Advantage
- **Strict Sprint Discipline**: Eliminates orphaned tasks and ensures 100% of labor and tasks are tied to accountable project budgets.
- **Accurate Velocity Tracking**: Story points and project keys enable accurate Agile burn-down metrics and milestone tracking.

---

## 4. `Ctrl+K` Spotlight Command Palette (`CommandPaletteModal`)

### What It Does
- Inspired by **Linear** and **Stripe**.
- Pressing `Ctrl+K` (or `Cmd+K`) anywhere in the web app opens a spotlight search modal.
- Provides instant search across projects, tasks, employees, navigation routes, and quick actions (e.g. *Create Task*, *Onboard Employee*, *Log Expense*).

### Enterprise Advantage
- **10x Navigation Speed**: Power users can jump to any record or page instantly without navigating multiple menu sub-trees.
- **Keyboard-First Workflow**: Reduces reliance on mouse clicks for heavy daily ERP users.

---

## 5. Global `+ New` Action Launcher (`GlobalCreateModal`)

### What It Does
- Inspired by **Jira** and **Monday.com**.
- A persistent **`+ New`** button in the top navigation header bar opens a tabbed modal to quickly create:
  - 📝 **Task / Issue**: Mandates selecting a target Project from a dropdown list.
  - 📁 **New Project**: Defines project name, total budget, and initial scope.
  - 👤 **Onboard Employee**: Collects full name, email, designation, and hourly rate.
  - 💰 **Log Expense**: Records financial account expenses.

### Enterprise Advantage
- **Standardized Data Input**: Ensures required fields (e.g., target project for tasks) are validated and never omitted.
- **Omnipresent Access**: Users can initiate asset creation from any page in the application.

---

## 6. Slide-Over Item Detail Drawer (`ItemDetailDrawer`)

### What It Does
- Inspired by **Linear** and **Asana**.
- Clicking any task card on the Kanban board or project item smoothly slides open a right-hand detail drawer.
- Allows inline editing of descriptions, changing priority lozenges, toggling status dropdowns, assigning team members, managing subtask checklists, and viewing audit history.

### Enterprise Advantage
- **Context-Preserving UX**: Users can view and edit deep task details without losing their place on the main dashboard or Kanban board.
- **Interactive Micro-Tasking**: Subtask checklists help break complex deliverables into manageable items.

---

## 7. Real-Time Notification Center & Bell (`NotificationsDrawer`)

### What It Does
- Inspired by **Jira** and **GitHub**.
- A top navigation bar bell icon (`🔔 2`) displays live unread counts for:
  - Pending Tenant Signups (Admin view)
  - Pending Employee Applications (Company view)
  - Budget Overrun Alerts (CFO view)
- Clicking the bell slides open a notification drawer with **1-Click Approve** and action buttons.

### Enterprise Advantage
- **Accelerated Approval Cycles**: Managers are instantly alerted to pending requests without having to check sub-menus manually.
- **Proactive Risk Management**: Budget overrun alerts notify financial controllers before accounts run negative.

---

## 8. SAP-Grade Structured Rejection Reason Modal (`RejectionReasonModal`)

### What It Does
- Inspired by **SAP** and **Workday**.
- Replaces raw browser alert popups with a formal Enterprise Rejection Modal.
- Prompts approvers to select a **Rejection Category** (*Compliance Verification Failed*, *Unverified Tax Number*, *Invalid Domain*, *Security Flag*) and enter a mandatory audit explanation saved to SQLite.

### Enterprise Advantage
- **Auditability & Legal Protection**: Creates a clear, legally defensible record of why a company signup, employee application, or expense claim was declined.
- **Structured Compliance**: Categorizes rejections for corporate governance reporting.

---

## 9. Workday-Style RBAC Route Protection Guards (`RoleGuard`)

### What It Does
- Inspired by **Workday** and **SAP**.
- Wraps sensitive frontend routes (e.g. `/audit` and `/workforce`) with role verification logic.
- If an unauthorized role (e.g. an Employee attempting to view `/audit`) tries to open the route, renders a full-page Workday security alert screen explaining the restriction.

### Enterprise Advantage
- **Defense-in-Depth Security**: Complements backend API authorization by preventing unauthorized client-side route access.
- **Clear Security Feedback**: Explains security policies clearly to users rather than crashing or showing blank screens.

---

## 10. End-to-End Multi-Project ERP Finance & General Ledger Subsystem (`FinancePage`)

### What It Does
Provides full-featured enterprise financial management with **Multi-Project Scope Filtering & Budget Isolation**:
- **Multi-Project Scope Selector Bar**: Switch between *All Projects* view or filter financial accounts, transactions, and pending claims for specific projects (*Core ERP Platform*, *AI Predictive Analytics Suite*, *Mobile Workforce App*).
- **CFO / Company Owner Perspective**:
  - **Financial Accounts & Liquidity**: Track operating accounts per project with real-time liquidity progress bars and low-balance warnings (< 20%).
  - **Project-Aware Inter-Account Reallocations (`FundReallocationModal`)**: Reallocate budget between project accounts with mandatory audit reason logging.
  - **Expense Approval Queue**: Approve or reject employee reimbursement claims; approved claims automatically deduct from target account balances.
  - **General Ledger Audit Table**: Filterable multi-project transaction log with Status Lozenges (*Approved*, *Pending*, *Rejected*).
  - **Project-Scoped 1-Click CSV Report Exporter**: Stream general ledger data into downloadable CSV files (supports `?projectId=` parameter filtering).
- **Employee Perspective**:
  - **Hourly Billing & Timesheet Calculator**: Interactive calculator for weekly billable hours @ $85/hr, projecting monthly gross earnings.
  - **Submit Reimbursement Claim (`ExpenseClaimModal`)**: Submit operational expense claims (*Dev Hardware*, *AWS Bill*, *Travel*) tied to specific project accounts.
  - **Personal Claims Tracker**: Real-time status tracking for submitted reimbursement claims.

### Enterprise Advantage
- **Multi-Project Financial Isolation**: Prevents cost commingling across different clients or business units.
- **Real-Time Executive Oversight**: Gives C-suite visibility into aggregate company cash flow as well as granular project-level margins.
- **Audit-Ready Exporting**: Project-specific CSV downloads simplify multi-client billing, tax filings, and external GAAP audits.

---

## 11. Top Navigation Bar Day/Dark Mode Toggle

### What It Does
- Configured **Day Mode (Light)** as the default theme across the application.
- Adds an omnipresent **Day / Dark Theme Toggle Switch** in the top navigation header bar of `AppShell`.

### Enterprise Advantage
- **User Accessibility & Ergonomics**: Allows users in bright office environments or dark workstations to customize contrast for optimal visual comfort.
- **Modern Atlassian Aesthetics**: Delivers a polished, premium aesthetic matching Jira and Linear design standards.

---

## 12. End-to-End Role-Aware Event Notification Subsystem (`NotificationsDrawer`)

### What It Does
Provides an omnipresent, role-specific notification drawer and top navigation unread bell counter (`🔔 Badge`) with real-time event aggregation:
- **Employee Perspective**:
  - **Task Assignments**: Real-time notifications when assigned to project tasks (*Title*, *Project*, *Priority*, *Story Points*).
  - **Reimbursement Status Updates**: Immediate notifications when an expense claim is *APPROVED*, *DECLINED*, or *PENDING* by CFO.
  - **Identity Verification**: Active confirmation of employee workspace clearance.
- **Company Owner Perspective**:
  - **Pending Employee Access Applications**: Actionable notifications when a new employee signs up, complete with 1-click **Approve Access** button.
  - **CFO Expense Claim Queue**: Notifications for employee reimbursement claims awaiting CFO approval with 1-click **Approve Now** button.
  - **Low Liquidity Alerts**: Red alert notifications when operating account balances drop below 20% of allocated budget.
- **System Admin Perspective**:
  - **Pending Tenant Registrations**: Actionable notifications for pending company signups with 1-click **Approve License** button.
  - **System Overrun Alerts**: Real-time flags for accounts with negative balances.

### Enterprise Advantage
- **Role-Tailored Context**: Employees only see their own tasks and claims, while CFOs get financial approval queues and low liquidity warnings.
- **1-Click In-Drawer Actions**: Managers can approve employee access or expense claims directly inside the drawer without leaving their active page.
- **Zero Polling Lag**: Unread badge count automatically recalculates based on active workspace state.

---

## 13. Cryptographic JWT Bearer Token Authentication (`JwtTokenService`)

### What It Does
Implements industry-standard cryptographic JSON Web Token (JWT) authentication across the ASP.NET Core API and React frontend:
- **`JwtTokenService` Token Issuer**: Generates HMAC SHA-256 signed JWT tokens containing identity claims (`nameid`, `email`, `role`, `approvalStatus`, `isActive`).
- **`POST /api/auth/login`**: Validates credentials and returns a 7-day signed JWT Bearer Token along with identity context.
- **Frontend Interceptor (`apiFetch`)**: Automatically injects `Authorization: Bearer <jwt_token>` header into all outgoing HTTP requests across the application.
- **ASP.NET Core Middleware (`JwtBearerDefaults`)**: Configured with `TokenValidationParameters` to validate issuer, audience, key signature, and token lifetime on incoming requests.

### Enterprise Advantage
- **Stateless Enterprise Security**: Eliminates server-side session state, enabling horizontal scalability across microservices and cloud instances.
- **Cryptographic Tamper-Proof Claims**: Ensures user identity, tenant boundaries, and RBAC roles cannot be spoofed on the client.
- **Standardized API Security**: Follows OAuth2 / OIDC Bearer token standards for easy third-party mobile or external integration.

---

## 🛠️ Summary Architecture Matrix

| Component / Module | Inspired By | Core Purpose | Enterprise Advantage |
| :--- | :--- | :--- | :--- |
| **JWT Bearer Auth** | OAuth2 / OIDC | Cryptographic token signing & Bearer headers | Stateless, tamper-proof enterprise security |
| **3-Tier RBAC & Dashboards** | Jira / SAP | Role isolation (Admin, Company, Employee) | Zero cross-tenant data leakage |
| **Pending Blur Overlay** | Atlassian | Locks unapproved signups behind modal | Prevents unauthorized tenant access |
| **Project-Scoped Tasks** | Jira / Agile | Tasks bound to specific Projects | 100% budget & sprint accountability |
| **Command Palette (`Ctrl+K`)** | Linear / Stripe | Spotlight search across all records | 10x user navigation speed |
| **Global `+ New` Launcher** | Jira / Monday.com | Header action launcher for assets | Standardized asset creation |
| **Slide-Over Detail Drawer** | Linear / Asana | Right-side drawer for task inspection | Context-preserving inline editing |
| **Notification Center (`🔔`)** | Jira / GitHub | Header unread bell for approvals & alerts | Accelerated approval cycles |
| **Structured Rejection Modal**| SAP / Workday | Mandatory category & note on rejection | Full auditability & legal trail |
| **RBAC Route Protection** | Workday / SAP | Client-side route access guards | Defense-in-depth UI protection |
| **End-to-End ERP Finance** | SAP / QuickBooks | CFO liquidity & Employee reimbursement claims | Real-time liquidity & CSV audit exports |
| **Top Bar Theme Toggle** | Modern Web | Day Mode default + Dark Mode switch | Visual accessibility & comfort |
| **Role-Aware Notifications** | Atlassian / GitHub | Real-time event notifications & 1-click actions | 100% notification coverage across all roles |
