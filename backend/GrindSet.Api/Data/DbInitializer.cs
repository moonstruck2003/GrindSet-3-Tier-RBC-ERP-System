using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using GrindSet.Api.Models;

namespace GrindSet.Api.Data
{
    public static class DbInitializer
    {
        public static void Initialize(GrindSetDbContext context)
        {
            // Ensure Database is created
            context.Database.EnsureCreated();

            // Ensure Subscriptions, SubscriptionInvoices, and ProjectChatMessages tables exist in SQLite
            context.Database.ExecuteSqlRaw(@"
                CREATE TABLE IF NOT EXISTS ""Subscriptions"" (
                    ""SubscriptionId"" INTEGER NOT NULL CONSTRAINT ""PK_Subscriptions"" PRIMARY KEY AUTOINCREMENT,
                    ""CompanyId"" INTEGER NOT NULL,
                    ""PlanTier"" TEXT NOT NULL,
                    ""BillingCycle"" TEXT NOT NULL,
                    ""Price"" TEXT NOT NULL,
                    ""Status"" TEXT NOT NULL,
                    ""PaymentMethod"" TEXT NOT NULL,
                    ""StripeCustomerId"" TEXT NULL,
                    ""StripeSubscriptionId"" TEXT NULL,
                    ""CurrentPeriodStart"" TEXT NOT NULL,
                    ""CurrentPeriodEnd"" TEXT NOT NULL,
                    ""CreatedAt"" TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS ""SubscriptionInvoices"" (
                    ""InvoiceId"" INTEGER NOT NULL CONSTRAINT ""PK_SubscriptionInvoices"" PRIMARY KEY AUTOINCREMENT,
                    ""CompanyId"" INTEGER NOT NULL,
                    ""InvoiceNumber"" TEXT NOT NULL,
                    ""Amount"" TEXT NOT NULL,
                    ""Currency"" TEXT NOT NULL,
                    ""PlanName"" TEXT NOT NULL,
                    ""Status"" TEXT NOT NULL,
                    ""PaymentMethod"" TEXT NOT NULL,
                    ""IssuedAt"" TEXT NOT NULL,
                    ""ReceiptUrl"" TEXT NULL
                );
                CREATE TABLE IF NOT EXISTS ""ProjectChatMessages"" (
                    ""MessageId"" INTEGER NOT NULL CONSTRAINT ""PK_ProjectChatMessages"" PRIMARY KEY AUTOINCREMENT,
                    ""ProjectId"" INTEGER NOT NULL,
                    ""SenderUserId"" INTEGER NOT NULL,
                    ""SenderName"" TEXT NOT NULL,
                    ""SenderEmail"" TEXT NOT NULL DEFAULT '',
                    ""SenderRole"" TEXT NOT NULL,
                    ""MessageText"" TEXT NOT NULL,
                    ""SentAt"" TEXT NOT NULL
                );
            ");

            try
            {
                context.Database.ExecuteSqlRaw(@"ALTER TABLE ""ProjectChatMessages"" ADD COLUMN ""SenderEmail"" TEXT NOT NULL DEFAULT '';");
            }
            catch { /* column already exists */ }

            try
            {
                context.Database.ExecuteSqlRaw(@"ALTER TABLE ""Users"" ADD COLUMN ""CompanyId"" INTEGER NULL;");
            }
            catch { /* column already exists */ }

            try
            {
                context.Database.ExecuteSqlRaw(@"ALTER TABLE ""Projects"" ADD COLUMN ""ProjectManagerId"" INTEGER NULL;");
            }
            catch { /* column already exists */ }

            try
            {
                context.Database.ExecuteSqlRaw(@"ALTER TABLE ""Users"" ADD COLUMN ""ApprovalStatus"" TEXT NOT NULL DEFAULT 'Approved';");
            }
            catch { /* column already exists */ }

            try
            {
                context.Database.ExecuteSqlRaw(@"ALTER TABLE ""Users"" ADD COLUMN ""ReportedNote"" TEXT NULL;");
            }
            catch { /* column already exists */ }

            // Seed Base SuperAdmin
            var adminUser = EnsureUser(context, "admin@grindset.io", "Admin");
            if (!context.Admins.Any(a => a.AdminId == adminUser.UserId))
            {
                context.Admins.Add(new Admin { AdminId = adminUser.UserId, FullName = "Chief System Administrator", AccessLevel = "SuperAdmin" });
                context.SaveChanges();
            }

            // Seed Rich Multi-Company Ecosystem
            SeedRichEnterpriseData(context);

            // Seed/Enrich Active Company 103 (User: companyowner1@gmail.com) and any dynamically created companies
            SeedCompany103AndDynamic(context);
        }

        private static void SeedRichEnterpriseData(GrindSetDbContext context)
        {
            // =========================================================================
            // 🏢 1. ACME GLOBAL TECHNOLOGIES (CompanyId: 2) - Expansion (Free Tier: 1 Proj, 10 Emps)
            // =========================================================================
            var acmeOwner = EnsureUser(context, "corp@acmeglobal.com", "Company", "Approved", 2);
            var acmeComp = EnsureCompany(context, acmeOwner.UserId, "Acme Global Technologies", "REG-884920", "Enterprise Software");
            EnsureSubscription(context, acmeComp.CompanyId, "Free", 0.00m, "Community Free Plan");

            var acmeDeptEng = EnsureDepartment(context, acmeComp.CompanyId, "Engineering & Infrastructure");
            var acmeDeptProd = EnsureDepartment(context, acmeComp.CompanyId, "Product & UX Design");
            var acmeDeptSec = EnsureDepartment(context, acmeComp.CompanyId, "Cybersecurity & DevOps");

            // Base Acme employees (Active approved workforce: 8)
            var acmeEmp1User = EnsureUser(context, "john.dev@grindset.io", "Employee", "Approved", acmeComp.CompanyId);
            var acmeEmp1 = EnsureEmployee(context, acmeEmp1User.UserId, acmeComp.CompanyId, acmeDeptEng.DepartmentId, "John Doe", "Senior Full-Stack Engineer", 95.00m);

            var acmeEmp2User = EnsureUser(context, "sarah.pm@grindset.io", "Employee", "Approved", acmeComp.CompanyId);
            var acmeEmp2 = EnsureEmployee(context, acmeEmp2User.UserId, acmeComp.CompanyId, acmeDeptEng.DepartmentId, "Sarah Connor", "Lead Project Manager", 110.00m);

            var acmeEmp3User = EnsureUser(context, "david.miller@acmeglobal.com", "Employee", "Approved", acmeComp.CompanyId);
            var acmeEmp3 = EnsureEmployee(context, acmeEmp3User.UserId, acmeComp.CompanyId, acmeDeptEng.DepartmentId, "David Miller", "Senior Backend Architect", 95.00m);

            var acmeEmp4User = EnsureUser(context, "emma.watson@acmeglobal.com", "Employee", "Approved", acmeComp.CompanyId);
            var acmeEmp4 = EnsureEmployee(context, acmeEmp4User.UserId, acmeComp.CompanyId, acmeDeptProd.DepartmentId, "Emma Watson", "Lead Product Designer", 85.00m);

            var acmeEmp5User = EnsureUser(context, "robert.vance@acmeglobal.com", "Employee", "Approved", acmeComp.CompanyId);
            var acmeEmp5 = EnsureEmployee(context, acmeEmp5User.UserId, acmeComp.CompanyId, acmeDeptEng.DepartmentId, "Robert Vance", "Principal QA Automation Engineer", 80.00m);

            var acmeEmp6User = EnsureUser(context, "priya.sharma@acmeglobal.com", "Employee", "Approved", acmeComp.CompanyId);
            var acmeEmp6 = EnsureEmployee(context, acmeEmp6User.UserId, acmeComp.CompanyId, acmeDeptSec.DepartmentId, "Priya Sharma", "Senior Cloud DevOps Specialist", 105.00m);

            var acmeEmp7User = EnsureUser(context, "carlos.mendez@acmeglobal.com", "Employee", "Approved", acmeComp.CompanyId);
            var acmeEmp7 = EnsureEmployee(context, acmeEmp7User.UserId, acmeComp.CompanyId, acmeDeptSec.DepartmentId, "Carlos Mendez", "Cybersecurity Operations Analyst", 90.00m);

            var acmeEmp8User = EnsureUser(context, "liam.oconnor@acmeglobal.com", "Employee", "Approved", acmeComp.CompanyId);
            var acmeEmp8 = EnsureEmployee(context, acmeEmp8User.UserId, acmeComp.CompanyId, acmeDeptEng.DepartmentId, "Liam O'Connor", "Full-Stack React Developer", 90.00m);

            // ── Pending Employee Signup Queue for Acme (3 Pending Applicants!) ──
            var acmePending1User = EnsureUser(context, "alex.applicant@acmeglobal.com", "Employee", "PendingCompany", acmeComp.CompanyId);
            EnsureEmployee(context, acmePending1User.UserId, acmeComp.CompanyId, acmeDeptEng.DepartmentId, "Alex Wright", "Senior Cloud Architect", 115.00m);

            var acmePending2User = EnsureUser(context, "maya.designer@acmeglobal.com", "Employee", "PendingCompany", acmeComp.CompanyId);
            EnsureEmployee(context, acmePending2User.UserId, acmeComp.CompanyId, acmeDeptProd.DepartmentId, "Maya Patel", "Lead UI/UX Designer", 85.00m);

            var acmePending3User = EnsureUser(context, "kevin.qa@acmeglobal.com", "Employee", "PendingCompany", acmeComp.CompanyId);
            EnsureEmployee(context, acmePending3User.UserId, acmeComp.CompanyId, acmeDeptEng.DepartmentId, "Kevin Choi", "Automation QA Engineer", 75.00m);

            // Acme Project 1
            var acmeProj1 = EnsureProject(context, acmeComp.CompanyId, acmeEmp2.EmployeeId, "Core ERP Platform v1.0", "In Progress", 250000.00m,
                "Full enterprise project management & financial logging system.", "Deliver 3-tier RBAC, EF Core SQLite DB, and React dashboard.");
            EnsureAssignment(context, acmeProj1.ProjectId, acmeEmp2.EmployeeId, "Project Manager");
            EnsureAssignment(context, acmeProj1.ProjectId, acmeEmp1.EmployeeId, "Senior Full-Stack Engineer");
            EnsureAssignment(context, acmeProj1.ProjectId, acmeEmp3.EmployeeId, "Backend Architect");
            EnsureAssignment(context, acmeProj1.ProjectId, acmeEmp8.EmployeeId, "React Developer");

            var acmeAcc1 = EnsureAccount(context, acmeProj1.ProjectId, "Engineering & Core Infrastructure", 150000.00m, 112500.00m);
            var acmeAcc2 = EnsureAccount(context, acmeProj1.ProjectId, "Cloud DevOps & AWS Services", 60000.00m, 42000.00m);

            EnsureTransaction(context, acmeAcc1.AccountId, acmeEmp1.EmployeeId, "Server Hardware Purchase", 12500.00m, "Approved", "Quarterly rack server upgrade", DateTime.UtcNow.AddDays(-14));
            EnsureTransaction(context, acmeAcc2.AccountId, acmeEmp6.EmployeeId, "Cloud AWS Hosting Bill", 4500.00m, "Approved", "Monthly production cluster hosting", DateTime.UtcNow.AddDays(-5));
            EnsureTransaction(context, acmeAcc1.AccountId, acmeEmp3.EmployeeId, "PostgreSQL Cloud Database Cluster", 3200.00m, "Approved", "Dedicated managed DB instance", DateTime.UtcNow.AddDays(-10));
            EnsureTransaction(context, acmeAcc2.AccountId, acmeEmp1.EmployeeId, "GitHub Enterprise Cloud Seats", 1800.00m, "PendingApproval", "Annual developer seat expansion", DateTime.UtcNow.AddDays(-2));

            EnsureTask(context, acmeProj1.ProjectId, acmeEmp1.EmployeeId, "Implement RBAC Workflows & Role Guards", "Enforce 3-tier RBAC protection across all endpoints & pages.", "High", "In Progress", 5);
            EnsureTask(context, acmeProj1.ProjectId, acmeEmp3.EmployeeId, "Configure SQLite EF Core Task Entity", "Add TaskItem model with FK to ProjectId.", "Highest", "Done", 3);
            EnsureTask(context, acmeProj1.ProjectId, acmeEmp4.EmployeeId, "Audit System Theme Tokens & Contrast", "Ensure WCAG AAA compliant styling across dark/light mode.", "Medium", "Done", 3);
            EnsureTask(context, acmeProj1.ProjectId, acmeEmp8.EmployeeId, "Live Notification Bell & Badge Counter", "Implement polling state for instant approval notifications.", "High", "In Review", 5);

            // Project Real-Time Chat Message History
            EnsureChatMessage(context, acmeProj1.ProjectId, acmeEmp2User.UserId, "Sarah Connor", "Project Manager",
                "Good morning team! Let's do a quick sync on the Core ERP Platform sprint goals. John, how is the RBAC endpoint protection progressing?", DateTime.UtcNow.AddHours(-4));
            EnsureChatMessage(context, acmeProj1.ProjectId, acmeEmp1User.UserId, "John Doe", "Senior Full-Stack Engineer",
                "Morning Sarah! The 3-tier JWT role validation is completed and tested. Working on the financial fund reallocation guardrails next.", DateTime.UtcNow.AddHours(-3).AddMinutes(42));
            EnsureChatMessage(context, acmeProj1.ProjectId, acmeEmp8User.UserId, "Liam O'Connor", "React Developer",
                "Realtime SignalR notifications and chat tabs are hooked up on the frontend! Ready for code review.", DateTime.UtcNow.AddHours(-2).AddMinutes(15));
            EnsureChatMessage(context, acmeProj1.ProjectId, acmeEmp2User.UserId, "Sarah Connor", "Project Manager",
                "Fantastic progress everyone. I've approved the server hardware budget invoice. Keep up the high velocity!", DateTime.UtcNow.AddMinutes(-45));

            // =========================================================================
            // 🏢 2. APEX CYBERSEC DYNAMICS (Enterprise Tier - $29/mo, Unlimited Scale)
            // =========================================================================
            var apexOwner = EnsureUser(context, "elena.vance@apexcyber.io", "Company", "Approved", 30);
            var apexComp = EnsureCompany(context, apexOwner.UserId, "Apex CyberSec Dynamics", "REG-APX-9021", "Cybersecurity & Defense");
            EnsureSubscription(context, apexComp.CompanyId, "Enterprise", 29.00m, "Stripe (Visa •••• 4242)");

            var apexDeptSoc = EnsureDepartment(context, apexComp.CompanyId, "Threat Intelligence & SOC");
            var apexDeptCloud = EnsureDepartment(context, apexComp.CompanyId, "Cloud Security Architecture");
            var apexDeptDevSec = EnsureDepartment(context, apexComp.CompanyId, "DevSecOps & Automation");
            var apexDeptGov = EnsureDepartment(context, apexComp.CompanyId, "Security Governance & Compliance");

            var apexEmp1User = EnsureUser(context, "marcus.brody@apexcyber.io", "Employee", "Approved", apexComp.CompanyId);
            var apexEmp1 = EnsureEmployee(context, apexEmp1User.UserId, apexComp.CompanyId, apexDeptCloud.DepartmentId, "Marcus Brody", "Chief Information Security Architect", 140.00m);

            var apexEmp2User = EnsureUser(context, "natalie.rivera@apexcyber.io", "Employee", "Approved", apexComp.CompanyId);
            var apexEmp2 = EnsureEmployee(context, apexEmp2User.UserId, apexComp.CompanyId, apexDeptSoc.DepartmentId, "Natalie Rivera", "Lead Threat Intelligence Analyst", 115.00m);

            var apexEmp3User = EnsureUser(context, "zack.vance@apexcyber.io", "Employee", "Approved", apexComp.CompanyId);
            var apexEmp3 = EnsureEmployee(context, apexEmp3User.UserId, apexComp.CompanyId, apexDeptSoc.DepartmentId, "Zack Vance", "Senior Penetration Tester & Red Team", 120.00m);

            var apexEmp4User = EnsureUser(context, "aisha.mansoor@apexcyber.io", "Employee", "Approved", apexComp.CompanyId);
            var apexEmp4 = EnsureEmployee(context, apexEmp4User.UserId, apexComp.CompanyId, apexDeptDevSec.DepartmentId, "Aisha Al-Mansoor", "DevSecOps CI/CD Pipeline Engineer", 105.00m);

            var apexEmp5User = EnsureUser(context, "viktor.reznov@apexcyber.io", "Employee", "Approved", apexComp.CompanyId);
            var apexEmp5 = EnsureEmployee(context, apexEmp5User.UserId, apexComp.CompanyId, apexDeptSoc.DepartmentId, "Viktor Reznov", "Incident Response & Forensic Lead", 110.00m);

            var apexEmp6User = EnsureUser(context, "chloe.dupont@apexcyber.io", "Employee", "Approved", apexComp.CompanyId);
            var apexEmp6 = EnsureEmployee(context, apexEmp6User.UserId, apexComp.CompanyId, apexDeptSoc.DepartmentId, "Chloe Dupont", "Senior SOC Tier 3 Specialist", 95.00m);

            var apexEmp7User = EnsureUser(context, "lucas.takahashi@apexcyber.io", "Employee", "Approved", apexComp.CompanyId);
            var apexEmp7 = EnsureEmployee(context, apexEmp7User.UserId, apexComp.CompanyId, apexDeptCloud.DepartmentId, "Lucas Takahashi", "Zero-Trust Network Mesh Specialist", 100.00m);

            var apexEmp8User = EnsureUser(context, "maya.lin@apexcyber.io", "Employee", "Approved", apexComp.CompanyId);
            var apexEmp8 = EnsureEmployee(context, apexEmp8User.UserId, apexComp.CompanyId, apexDeptGov.DepartmentId, "Maya Lin", "Cloud Security Compliance Auditor", 90.00m);

            var apexEmp9User = EnsureUser(context, "ethan.hunt@apexcyber.io", "Employee", "Approved", apexComp.CompanyId);
            var apexEmp9 = EnsureEmployee(context, apexEmp9User.UserId, apexComp.CompanyId, apexDeptSoc.DepartmentId, "Ethan Hunt", "Vulnerability Management Specialist", 95.00m);

            var apexEmp10User = EnsureUser(context, "sofia.rossi@apexcyber.io", "Employee", "Approved", apexComp.CompanyId);
            var apexEmp10 = EnsureEmployee(context, apexEmp10User.UserId, apexComp.CompanyId, apexDeptCloud.DepartmentId, "Sofia Rossi", "Cryptographic Protocol Engineer", 125.00m);

            var apexEmp11User = EnsureUser(context, "gabriel.santos@apexcyber.io", "Employee", "Approved", apexComp.CompanyId);
            var apexEmp11 = EnsureEmployee(context, apexEmp11User.UserId, apexComp.CompanyId, apexDeptDevSec.DepartmentId, "Gabriel Santos", "Security Automation & SOAR Developer", 100.00m);

            var apexEmp12User = EnsureUser(context, "hannah.abbott@apexcyber.io", "Employee", "Approved", apexComp.CompanyId);
            var apexEmp12 = EnsureEmployee(context, apexEmp12User.UserId, apexComp.CompanyId, apexDeptGov.DepartmentId, "Hannah Abbott", "Identity & Access Governance Lead", 105.00m);

            // ── Pending Employee Signup Queue for Apex (3 Pending Applicants!) ──
            var apexPending1User = EnsureUser(context, "dante.soc@apexcyber.io", "Employee", "PendingCompany", apexComp.CompanyId);
            EnsureEmployee(context, apexPending1User.UserId, apexComp.CompanyId, apexDeptSoc.DepartmentId, "Dante Valdez", "Threat Intel Analyst", 95.00m);

            var apexPending2User = EnsureUser(context, "samira.cloud@apexcyber.io", "Employee", "PendingCompany", apexComp.CompanyId);
            EnsureEmployee(context, apexPending2User.UserId, apexComp.CompanyId, apexDeptCloud.DepartmentId, "Samira Khan", "Cloud SecOps Engineer", 110.00m);

            var apexPending3User = EnsureUser(context, "lucian.pen@apexcyber.io", "Employee", "PendingCompany", apexComp.CompanyId);
            EnsureEmployee(context, apexPending3User.UserId, apexComp.CompanyId, apexDeptSoc.DepartmentId, "Lucian Vance", "Junior Penetration Tester", 85.00m);

            // Apex Projects
            var apexProj1 = EnsureProject(context, apexComp.CompanyId, apexEmp1.EmployeeId, "Zero-Trust Mesh & Perimeter Defense v3", "In Progress", 450000.00m,
                "Implement end-to-end zero-trust microsegmentation across multi-cloud hybrid endpoints.",
                "Deploy WireGuard mesh, dynamic PKI rotation, and mutual TLS across all microservices.");
            EnsureAssignment(context, apexProj1.ProjectId, apexEmp1.EmployeeId, "Project Manager");
            EnsureAssignment(context, apexProj1.ProjectId, apexEmp7.EmployeeId, "Network Architect");
            EnsureAssignment(context, apexProj1.ProjectId, apexEmp10.EmployeeId, "Cryptography Lead");

            var apexAcc1 = EnsureAccount(context, apexProj1.ProjectId, "Mesh Infrastructure & Proxy Nodes", 250000.00m, 195000.00m);
            var apexAcc2 = EnsureAccount(context, apexProj1.ProjectId, "External Penetration Testing & Bug Bounty", 120000.00m, 95000.00m);
            EnsureTransaction(context, apexAcc1.AccountId, apexEmp1.EmployeeId, "Dedicated Edge Gateway Appliances", 35000.00m, "Approved", "Hardware appliances for edge datacenters", DateTime.UtcNow.AddDays(-12));
            EnsureTransaction(context, apexAcc2.AccountId, apexEmp3.EmployeeId, "HackerOne Bug Bounty Program Payout", 14000.00m, "Approved", "Critical vulnerability remediation bounty", DateTime.UtcNow.AddDays(-4));

            EnsureTask(context, apexProj1.ProjectId, apexEmp1.EmployeeId, "Publish Zero-Trust RFC & Node Topology", "Draft internal standard for mTLS cryptographic handshake.", "Highest", "Done", 8);
            EnsureTask(context, apexProj1.ProjectId, apexEmp7.EmployeeId, "Deploy WireGuard Mesh Gateways in EU-West", "Stand up edge gateways across Frankfurt and Dublin regions.", "High", "In Progress", 5);
            EnsureTask(context, apexProj1.ProjectId, apexEmp10.EmployeeId, "Benchmark Ed25519 vs Post-Quantum Dilithium", "Measure latency overhead on ingress reverse proxy under 50k req/sec.", "High", "In Review", 8);

            EnsureChatMessage(context, apexProj1.ProjectId, apexEmp1User.UserId, "Marcus Brody", "Project Manager",
                "Zero-Trust Mesh deployment is initiating canary rollouts in region us-east-1. Team, monitor telemetry metrics closely.", DateTime.UtcNow.AddHours(-5));
            EnsureChatMessage(context, apexProj1.ProjectId, apexEmp7User.UserId, "Tariq Haddad", "Network Architect",
                "WireGuard edge tunnel latency is under 3.5ms between Frankfurt and Dublin nodes. No dropped packets observed.", DateTime.UtcNow.AddHours(-3));
            EnsureChatMessage(context, apexProj1.ProjectId, apexEmp10User.UserId, "Elena Rostova", "Cryptography Lead",
                "Post-quantum handshake overhead benchmarks came in within our 5% SLA target.", DateTime.UtcNow.AddMinutes(-35));

            var apexProj2 = EnsureProject(context, apexComp.CompanyId, apexEmp11.EmployeeId, "Autonomous SOAR Incident Pipeline", "In Progress", 320000.00m,
                "Automated detection and response orchestrator converting raw SIEM telemetry into autonomous mitigation plays.",
                "Cut mean-time-to-remediate (MTTR) by 80% with automated quarantine workflows.");
            EnsureAssignment(context, apexProj2.ProjectId, apexEmp11.EmployeeId, "Lead SOAR Architect");
            EnsureAssignment(context, apexProj2.ProjectId, apexEmp2.EmployeeId, "Threat Intel Lead");
            EnsureAssignment(context, apexProj2.ProjectId, apexEmp5.EmployeeId, "Forensic Lead");

            var apexAcc3 = EnsureAccount(context, apexProj2.ProjectId, "Splunk Enterprise SIEM Ingestion", 180000.00m, 132000.00m);
            EnsureTransaction(context, apexAcc3.AccountId, apexEmp2.EmployeeId, "CrowdStrike Falcon Telemetry Feed", 28000.00m, "Approved", "Annual commercial threat feed subscription", DateTime.UtcNow.AddDays(-8));

            EnsureTask(context, apexProj2.ProjectId, apexEmp11.EmployeeId, "Construct Automated Firewall Blackhole Playbook", "Trigger BGP Flowspec route injection upon DDoS detection.", "Highest", "In Progress", 5);
            EnsureTask(context, apexProj2.ProjectId, apexEmp5.EmployeeId, "Automated Memory Dump Collector via WinPmem", "Extract RAM dumps safely during active ransomware incidents.", "High", "Done", 5);

            var apexProj3 = EnsureProject(context, apexComp.CompanyId, apexEmp8.EmployeeId, "Federal FedRAMP High Compliance Audit", "In Progress", 190000.00m,
                "Preparation, evidence collection, and 3PAO audit for FedRAMP High certification.",
                "Achieve Authority to Operate (ATO) for government defense clients.");
            EnsureAssignment(context, apexProj3.ProjectId, apexEmp8.EmployeeId, "Compliance Lead");
            EnsureAssignment(context, apexProj3.ProjectId, apexEmp12.EmployeeId, "IAM Specialist");

            var apexProj4 = EnsureProject(context, apexComp.CompanyId, apexEmp10.EmployeeId, "Quantum-Resistant Key Exchange Core", "In Progress", 280000.00m,
                "Next-generation cryptographic vault implementing NIST post-quantum standards.",
                "Migrate all symmetric session establishment keys to Kyber-1024.");

            // =========================================================================
            // 🏢 3. BIOVANCE THERAPEUTICS (Professional Tier - $15/mo, 5 Projects Limit)
            // =========================================================================
            var bioOwner = EnsureUser(context, "marcus.thorne@biovance.com", "Company", "Approved", 43);
            var bioComp = EnsureCompany(context, bioOwner.UserId, "BioVance Therapeutics", "REG-BIO-4412", "Biotechnology & Healthcare");
            EnsureSubscription(context, bioComp.CompanyId, "Pro", 15.00m, "Stripe (Mastercard •••• 8812)");

            var bioDeptGen = EnsureDepartment(context, bioComp.CompanyId, "Genomics & Bio-Informatics");
            var bioDeptClin = EnsureDepartment(context, bioComp.CompanyId, "Clinical Drug Trials");
            var bioDeptLab = EnsureDepartment(context, bioComp.CompanyId, "Laboratory Operations");
            var bioDeptReg = EnsureDepartment(context, bioComp.CompanyId, "Regulatory Affairs & FDA");

            var bioEmp1User = EnsureUser(context, "evelyn.reed@biovance.com", "Employee", "Approved", bioComp.CompanyId);
            var bioEmp1 = EnsureEmployee(context, bioEmp1User.UserId, bioComp.CompanyId, bioDeptGen.DepartmentId, "Dr. Evelyn Reed", "Principal Bioinformatician", 130.00m);

            var bioEmp2User = EnsureUser(context, "alex.hayes@biovance.com", "Employee", "Approved", bioComp.CompanyId);
            var bioEmp2 = EnsureEmployee(context, bioEmp2User.UserId, bioComp.CompanyId, bioDeptClin.DepartmentId, "Alexander Hayes", "Clinical Trial Data Manager", 100.00m);

            var bioEmp3User = EnsureUser(context, "beatrice.sterling@biovance.com", "Employee", "Approved", bioComp.CompanyId);
            var bioEmp3 = EnsureEmployee(context, bioEmp3User.UserId, bioComp.CompanyId, bioDeptGen.DepartmentId, "Beatrice Sterling", "Molecular Biologist Lead", 110.00m);

            var bioEmp4User = EnsureUser(context, "daniel.kim@biovance.com", "Employee", "Approved", bioComp.CompanyId);
            var bioEmp4 = EnsureEmployee(context, bioEmp4User.UserId, bioComp.CompanyId, bioDeptGen.DepartmentId, "Daniel Kim", "Next-Gen Sequencing Analyst", 95.00m);

            var bioEmp5User = EnsureUser(context, "olivia.zhang@biovance.com", "Employee", "Approved", bioComp.CompanyId);
            var bioEmp5 = EnsureEmployee(context, bioEmp5User.UserId, bioComp.CompanyId, bioDeptClin.DepartmentId, "Olivia Zhang", "Bio-Statistical Modeling Scientist", 105.00m);

            var bioEmp6User = EnsureUser(context, "julian.frost@biovance.com", "Employee", "Approved", bioComp.CompanyId);
            var bioEmp6 = EnsureEmployee(context, bioEmp6User.UserId, bioComp.CompanyId, bioDeptLab.DepartmentId, "Julian Frost", "Laboratory Automation Engineer", 90.00m);

            var bioEmp7User = EnsureUser(context, "samantha.cruz@biovance.com", "Employee", "Approved", bioComp.CompanyId);
            var bioEmp7 = EnsureEmployee(context, bioEmp7User.UserId, bioComp.CompanyId, bioDeptReg.DepartmentId, "Samantha Cruz", "FDA Regulatory Affairs Specialist", 100.00m);

            var bioEmp8User = EnsureUser(context, "thomas.becker@biovance.com", "Employee", "Approved", bioComp.CompanyId);
            var bioEmp8 = EnsureEmployee(context, bioEmp8User.UserId, bioComp.CompanyId, bioDeptClin.DepartmentId, "Thomas Becker", "Pharmacovigilance Safety Lead", 95.00m);

            var bioEmp9User = EnsureUser(context, "clara.oswald@biovance.com", "Employee", "Approved", bioComp.CompanyId);
            var bioEmp9 = EnsureEmployee(context, bioEmp9User.UserId, bioComp.CompanyId, bioDeptReg.DepartmentId, "Clara Oswald", "Clinical QA Compliance Officer", 85.00m);

            var bioEmp10User = EnsureUser(context, "neil.armstrong@biovance.com", "Employee", "Approved", bioComp.CompanyId);
            var bioEmp10 = EnsureEmployee(context, bioEmp10User.UserId, bioComp.CompanyId, bioDeptGen.DepartmentId, "Neil Armstrong", "Bioinformatics Pipeline DevOps", 100.00m);

            // ── Pending Employee Signup Queue for BioVance (3 Pending Applicants!) ──
            var bioPending1User = EnsureUser(context, "hannah.trial@biovance.com", "Employee", "PendingCompany", bioComp.CompanyId);
            EnsureEmployee(context, bioPending1User.UserId, bioComp.CompanyId, bioDeptClin.DepartmentId, "Hannah Schmidt", "Clinical Research Coordinator", 90.00m);

            var bioPending2User = EnsureUser(context, "tariq.gen@biovance.com", "Employee", "PendingCompany", bioComp.CompanyId);
            EnsureEmployee(context, bioPending2User.UserId, bioComp.CompanyId, bioDeptGen.DepartmentId, "Tariq Al-Mansoor", "Genomics Data Scientist", 105.00m);

            var bioPending3User = EnsureUser(context, "elena.lab@biovance.com", "Employee", "PendingCompany", bioComp.CompanyId);
            EnsureEmployee(context, bioPending3User.UserId, bioComp.CompanyId, bioDeptLab.DepartmentId, "Elena Rostova", "Lab Robotics Automation Tech", 80.00m);

            // BioVance Projects
            var bioProj1 = EnsureProject(context, bioComp.CompanyId, bioEmp1.EmployeeId, "CRISPR Precision Oncology Gene Therapy", "In Progress", 380000.00m,
                "Targeted CRISPR gene editing mechanism targeting resistant solid tumors.",
                "Complete in vitro validation and submit Investigational New Drug (IND) package.");
            EnsureAssignment(context, bioProj1.ProjectId, bioEmp1.EmployeeId, "Principal Investigator");
            EnsureAssignment(context, bioProj1.ProjectId, bioEmp3.EmployeeId, "Molecular Biologist");
            EnsureAssignment(context, bioProj1.ProjectId, bioEmp4.EmployeeId, "Sequencing Lead");

            var bioAcc1 = EnsureAccount(context, bioProj1.ProjectId, "Illumina High-Throughput NovaSeq Runs", 200000.00m, 145000.00m);
            EnsureTransaction(context, bioAcc1.AccountId, bioEmp4.EmployeeId, "NovaSeq Reagent Flowcell Cartridges", 42000.00m, "Approved", "Deep sequencing consumables batch #04", DateTime.UtcNow.AddDays(-15));

            EnsureTask(context, bioProj1.ProjectId, bioEmp1.EmployeeId, "Run Deep Off-Target Cleavage Profiling", "Execute GUIDE-seq and circularization assay analysis.", "Highest", "In Progress", 8);
            EnsureTask(context, bioProj1.ProjectId, bioEmp3.EmployeeId, "Validate Cas12a Transfection Efficiency", "Quantify cellular viability via confocal flow cytometry.", "High", "Done", 5);

            var bioProj2 = EnsureProject(context, bioComp.CompanyId, bioEmp5.EmployeeId, "AI Molecular Folding & Drug Target Discovery", "In Progress", 240000.00m,
                "Transformer-based machine learning pipeline predicting small molecule protein-ligand binding affinity.",
                "Screen 10 million candidate molecules against KRAS G12D pocket.");
            EnsureAssignment(context, bioProj2.ProjectId, bioEmp5.EmployeeId, "Lead ML Scientist");
            EnsureAssignment(context, bioProj2.ProjectId, bioEmp10.EmployeeId, "GPU Cluster DevOps");

            var bioProj3 = EnsureProject(context, bioComp.CompanyId, bioEmp2.EmployeeId, "Phase II Multicenter Clinical Data Pipeline", "In Progress", 175000.00m,
                "HIPAA and 21 CFR Part 11 compliant real-time electronic data capture (EDC) system.",
                "Onboard 14 hospital trial sites with audit-trail verification.");

            // =========================================================================
            // 🏢 4. HYPERION AUTONOMOUS LOGISTICS (Professional Tier - $15/mo)
            // =========================================================================
            var hypOwner = EnsureUser(context, "david.chen@hyperionlogistics.com", "Company", "Approved", 54);
            var hypComp = EnsureCompany(context, hypOwner.UserId, "Hyperion Autonomous Logistics", "REG-HYP-3108", "Supply Chain & Logistics");
            EnsureSubscription(context, hypComp.CompanyId, "Pro", 15.00m, "Stripe (Visa •••• 1092)");

            var hypDeptFleet = EnsureDepartment(context, hypComp.CompanyId, "Autonomous Fleet Engineering");
            var hypDeptRobo = EnsureDepartment(context, hypComp.CompanyId, "Warehouse Robotics & IoT");
            var hypDeptPlan = EnsureDepartment(context, hypComp.CompanyId, "Global Supply Chain Planning");

            var hypEmp1User = EnsureUser(context, "raj.patel@hyperionlogistics.com", "Employee", "Approved", hypComp.CompanyId);
            var hypEmp1 = EnsureEmployee(context, hypEmp1User.UserId, hypComp.CompanyId, hypDeptFleet.DepartmentId, "Raj Patel", "Fleet Robotics Systems Lead", 115.00m);

            var hypEmp2User = EnsureUser(context, "megan.fox@hyperionlogistics.com", "Employee", "Approved", hypComp.CompanyId);
            var hypEmp2 = EnsureEmployee(context, hypEmp2User.UserId, hypComp.CompanyId, hypDeptPlan.DepartmentId, "Megan Fox", "Senior Route Optimization Analyst", 95.00m);

            var hypEmp3User = EnsureUser(context, "arthur.pendelton@hyperionlogistics.com", "Employee", "Approved", hypComp.CompanyId);
            var hypEmp3 = EnsureEmployee(context, hypEmp3User.UserId, hypComp.CompanyId, hypDeptRobo.DepartmentId, "Arthur Pendelton", "IoT Sensor Mesh Architect", 105.00m);

            var hypEmp4User = EnsureUser(context, "grace.hopper@hyperionlogistics.com", "Employee", "Approved", hypComp.CompanyId);
            var hypEmp4 = EnsureEmployee(context, hypEmp4User.UserId, hypComp.CompanyId, hypDeptRobo.DepartmentId, "Grace Hopper", "Warehouse Automation Programmer", 100.00m);

            var hypEmp5User = EnsureUser(context, "kenji.sato@hyperionlogistics.com", "Employee", "Approved", hypComp.CompanyId);
            var hypEmp5 = EnsureEmployee(context, hypEmp5User.UserId, hypComp.CompanyId, hypDeptFleet.DepartmentId, "Kenji Sato", "Autonomous Vehicle Safety Engineer", 110.00m);

            var hypEmp6User = EnsureUser(context, "laura.croft@hyperionlogistics.com", "Employee", "Approved", hypComp.CompanyId);
            var hypEmp6 = EnsureEmployee(context, hypEmp6User.UserId, hypComp.CompanyId, hypDeptPlan.DepartmentId, "Laura Croft", "Global Logistics Coordinator", 80.00m);

            var hypEmp7User = EnsureUser(context, "brandon.lee@hyperionlogistics.com", "Employee", "Approved", hypComp.CompanyId);
            var hypEmp7 = EnsureEmployee(context, hypEmp7User.UserId, hypComp.CompanyId, hypDeptFleet.DepartmentId, "Brandon Lee", "Telematics Data Pipeline Lead", 95.00m);

            var hypEmp8User = EnsureUser(context, "teresa.may@hyperionlogistics.com", "Employee", "Approved", hypComp.CompanyId);
            var hypEmp8 = EnsureEmployee(context, hypEmp8User.UserId, hypComp.CompanyId, hypDeptPlan.DepartmentId, "Teresa May", "Supply Chain Financial Controller", 100.00m);

            var hypEmp9User = EnsureUser(context, "ian.malcolm@hyperionlogistics.com", "Employee", "Approved", hypComp.CompanyId);
            var hypEmp9 = EnsureEmployee(context, hypEmp9User.UserId, hypComp.CompanyId, hypDeptFleet.DepartmentId, "Ian Malcolm", "Simulation & Chaos Engineer", 105.00m);

            // ── Pending Employee Signup Queue for Hyperion (3 Pending Applicants!) ──
            var hypPending1User = EnsureUser(context, "sergei.fleet@hyperionlogistics.com", "Employee", "PendingCompany", hypComp.CompanyId);
            EnsureEmployee(context, hypPending1User.UserId, hypComp.CompanyId, hypDeptFleet.DepartmentId, "Sergei Volkov", "Autonomous Telematics Analyst", 95.00m);

            var hypPending2User = EnsureUser(context, "chloe.robo@hyperionlogistics.com", "Employee", "PendingCompany", hypComp.CompanyId);
            EnsureEmployee(context, hypPending2User.UserId, hypComp.CompanyId, hypDeptRobo.DepartmentId, "Chloe Bennett", "Warehouse AMR Programmer", 90.00m);

            var hypPending3User = EnsureUser(context, "marcus.foster@hyperionlogistics.com", "Employee", "PendingCompany", hypComp.CompanyId);
            EnsureEmployee(context, hypPending3User.UserId, hypComp.CompanyId, hypDeptPlan.DepartmentId, "Marcus Foster", "Autonomous Vehicle Dispatcher", 80.00m);

            // Hyperion Projects
            var hypProj1 = EnsureProject(context, hypComp.CompanyId, hypEmp1.EmployeeId, "Autonomous Highway Freight Platooning v2", "In Progress", 310000.00m,
                "V2V inter-vehicle wireless communication enabling drag-reducing truck platooning.",
                "Achieve SAE Level 4 highway hub-to-hub autonomous platooning demonstration.");
            EnsureAssignment(context, hypProj1.ProjectId, hypEmp1.EmployeeId, "Fleet Lead");
            EnsureAssignment(context, hypProj1.ProjectId, hypEmp5.EmployeeId, "Safety Engineer");
            EnsureAssignment(context, hypProj1.ProjectId, hypEmp7.EmployeeId, "Telematics Lead");

            var hypAcc1 = EnsureAccount(context, hypProj1.ProjectId, "LiDAR & Radar Sensor Suite R&D", 160000.00m, 118000.00m);
            EnsureTransaction(context, hypAcc1.AccountId, hypEmp1.EmployeeId, "Velodyne Alpha Prime LiDAR Units", 36000.00m, "Approved", "Long-range 300m solid-state LiDAR sensors", DateTime.UtcNow.AddDays(-10));

            EnsureTask(context, hypProj1.ProjectId, hypEmp1.EmployeeId, "Integrate CAN-Bus Telematics Ingestion", "Process 2,500 messages/sec with deterministic RTOS deadline.", "Highest", "In Progress", 8);
            EnsureTask(context, hypProj1.ProjectId, hypEmp5.EmployeeId, "Safety Override Deadman Switch Certification", "Fulfill ISO 26262 ASIL-D functional safety testing requirements.", "High", "Done", 5);

            var hypProj2 = EnsureProject(context, hypComp.CompanyId, hypEmp4.EmployeeId, "Smart Fulfillment Center Robotics Grid", "In Progress", 220000.00m,
                "Autonomous Mobile Robots (AMRs) collaborative warehouse picking grid.",
                "Deploy 45 Kiva-style autonomous shelf-lifters in central hub.");

            var hypProj3 = EnsureProject(context, hypComp.CompanyId, hypEmp3.EmployeeId, "Cold-Chain Vaccine Telemetry Monitor", "In Progress", 135000.00m,
                "Real-time cellular IoT temperature logging ensuring strict -80C cold chain integrity.",
                "Install GPS & thermal logging beacons on 250 refrigerated trailers.");

            // =========================================================================
            // 🏢 5. KRYPTON FINTECH GLOBAL (Enterprise Tier - $29/mo, Unlimited Scale)
            // =========================================================================
            var kryOwner = EnsureUser(context, "alyssa.monroe@kryptonfin.io", "Company", "Approved", 64);
            var kryComp = EnsureCompany(context, kryOwner.UserId, "Krypton FinTech Global", "REG-KRY-7721", "Financial Technology & Banking");
            EnsureSubscription(context, kryComp.CompanyId, "Enterprise", 29.00m, "Stripe (Amex •••• 0005)");

            var kryDeptHft = EnsureDepartment(context, kryComp.CompanyId, "High-Frequency Trading Architecture");
            var kryDeptRisk = EnsureDepartment(context, kryComp.CompanyId, "Risk, AML & Fraud Modeling");
            var kryDeptBank = EnsureDepartment(context, kryComp.CompanyId, "Core Banking Integration");
            var kryDeptTreasury = EnsureDepartment(context, kryComp.CompanyId, "Treasury & Liquidity Systems");

            var kryEmp1User = EnsureUser(context, "henrik.lindqvist@kryptonfin.io", "Employee", "Approved", kryComp.CompanyId);
            var kryEmp1 = EnsureEmployee(context, kryEmp1User.UserId, kryComp.CompanyId, kryDeptHft.DepartmentId, "Henrik Lindqvist", "Quantitative Trading Systems Lead", 145.00m);

            var kryEmp2User = EnsureUser(context, "sophia.kowalski@kryptonfin.io", "Employee", "Approved", kryComp.CompanyId);
            var kryEmp2 = EnsureEmployee(context, kryEmp2User.UserId, kryComp.CompanyId, kryDeptRisk.DepartmentId, "Sophia Kowalski", "Principal ML Fraud Modeling Engineer", 130.00m);

            var kryEmp3User = EnsureUser(context, "devraj.mukherjee@kryptonfin.io", "Employee", "Approved", kryComp.CompanyId);
            var kryEmp3 = EnsureEmployee(context, kryEmp3User.UserId, kryComp.CompanyId, kryDeptBank.DepartmentId, "Devraj Mukherjee", "Real-Time Settlement Engine Architect", 125.00m);

            var kryEmp4User = EnsureUser(context, "isabelle.dubois@kryptonfin.io", "Employee", "Approved", kryComp.CompanyId);
            var kryEmp4 = EnsureEmployee(context, kryEmp4User.UserId, kryComp.CompanyId, kryDeptBank.DepartmentId, "Isabelle Dubois", "Open Banking API Integration Lead", 110.00m);

            var kryEmp5User = EnsureUser(context, "tyler.durden@kryptonfin.io", "Employee", "Approved", kryComp.CompanyId);
            var kryEmp5 = EnsureEmployee(context, kryEmp5User.UserId, kryComp.CompanyId, kryDeptHft.DepartmentId, "Tyler Durden", "Low-Latency C++ Systems Engineer", 135.00m);

            var kryEmp6User = EnsureUser(context, "zoe.kravitz@kryptonfin.io", "Employee", "Approved", kryComp.CompanyId);
            var kryEmp6 = EnsureEmployee(context, kryEmp6User.UserId, kryComp.CompanyId, kryDeptTreasury.DepartmentId, "Zoe Kravitz", "Treasury Liquidity Risk Analyst", 105.00m);

            var kryEmp7User = EnsureUser(context, "omar.farooq@kryptonfin.io", "Employee", "Approved", kryComp.CompanyId);
            var kryEmp7 = EnsureEmployee(context, kryEmp7User.UserId, kryComp.CompanyId, kryDeptHft.DepartmentId, "Omar Farooq", "Smart Contract Security Auditor", 120.00m);

            var kryEmp8User = EnsureUser(context, "natalie.portman@kryptonfin.io", "Employee", "Approved", kryComp.CompanyId);
            var kryEmp8 = EnsureEmployee(context, kryEmp8User.UserId, kryComp.CompanyId, kryDeptRisk.DepartmentId, "Natalie Portman", "Global Regulatory Reporting Specialist", 95.00m);

            var kryEmp9User = EnsureUser(context, "felix.kjellberg@kryptonfin.io", "Employee", "Approved", kryComp.CompanyId);
            var kryEmp9 = EnsureEmployee(context, kryEmp9User.UserId, kryComp.CompanyId, kryDeptBank.DepartmentId, "Felix Kjellberg", "Trading UI & WebSocket Engineer", 90.00m);

            var kryEmp10User = EnsureUser(context, "amber.heard@kryptonfin.io", "Employee", "Approved", kryComp.CompanyId);
            var kryEmp10 = EnsureEmployee(context, kryEmp10User.UserId, kryComp.CompanyId, kryDeptBank.DepartmentId, "Amber Heard", "Core Banking Ledger Developer", 105.00m);

            var kryEmp11User = EnsureUser(context, "christopher.nolan@kryptonfin.io", "Employee", "Approved", kryComp.CompanyId);
            var kryEmp11 = EnsureEmployee(context, kryEmp11User.UserId, kryComp.CompanyId, kryDeptHft.DepartmentId, "Christopher Nolan", "Financial Data Infrastructure Lead", 115.00m);

            var kryEmp12User = EnsureUser(context, "wendy.rhoades@kryptonfin.io", "Employee", "Approved", kryComp.CompanyId);
            var kryEmp12 = EnsureEmployee(context, kryEmp12User.UserId, kryComp.CompanyId, kryDeptRisk.DepartmentId, "Wendy Rhoades", "Chief Compliance Officer", 125.00m);

            var kryEmp13User = EnsureUser(context, "bobby.axelrod@kryptonfin.io", "Employee", "Approved", kryComp.CompanyId);
            var kryEmp13 = EnsureEmployee(context, kryEmp13User.UserId, kryComp.CompanyId, kryDeptTreasury.DepartmentId, "Bobby Axelrod", "Head of Trading Desk Strategies", 150.00m);

            var kryEmp14User = EnsureUser(context, "taylor.mason@kryptonfin.io", "Employee", "Approved", kryComp.CompanyId);
            var kryEmp14 = EnsureEmployee(context, kryEmp14User.UserId, kryComp.CompanyId, kryDeptTreasury.DepartmentId, "Taylor Mason", "Quantitative Risk Optimization Specialist", 135.00m);

            // ── Pending Employee Signup Queue for Krypton (3 Pending Applicants!) ──
            var kryPending1User = EnsureUser(context, "gabriel.quant@kryptonfin.io", "Employee", "PendingCompany", kryComp.CompanyId);
            EnsureEmployee(context, kryPending1User.UserId, kryComp.CompanyId, kryDeptHft.DepartmentId, "Gabriel Moreno", "Junior Quantitative Developer", 110.00m);

            var kryPending2User = EnsureUser(context, "victoria.aml@kryptonfin.io", "Employee", "PendingCompany", kryComp.CompanyId);
            EnsureEmployee(context, kryPending2User.UserId, kryComp.CompanyId, kryDeptRisk.DepartmentId, "Victoria Sterling", "AML Compliance Investigator", 95.00m);

            var kryPending3User = EnsureUser(context, "arjun.crypto@kryptonfin.io", "Employee", "PendingCompany", kryComp.CompanyId);
            EnsureEmployee(context, kryPending3User.UserId, kryComp.CompanyId, kryDeptHft.DepartmentId, "Arjun Nair", "Smart Contract Auditor", 120.00m);

            // Krypton Projects
            var kryProj1 = EnsureProject(context, kryComp.CompanyId, kryEmp1.EmployeeId, "Sub-Millisecond Algorithmic Order Gateway", "In Progress", 600000.00m,
                "Direct market access (DMA) exchange order routing pipeline operating under 12 microseconds latency.",
                "Implement FPGA feed handlers and kernel-bypass Solarflare Onload TCP stack.");
            EnsureAssignment(context, kryProj1.ProjectId, kryEmp1.EmployeeId, "Lead Quant Architect");
            EnsureAssignment(context, kryProj1.ProjectId, kryEmp5.EmployeeId, "Kernel Bypass Engineer");
            EnsureAssignment(context, kryProj1.ProjectId, kryEmp11.EmployeeId, "Market Data Lead");

            var kryAcc1 = EnsureAccount(context, kryProj1.ProjectId, "Chicago Equinix NY4 Cross-Connects", 300000.00m, 245000.00m);
            EnsureTransaction(context, kryAcc1.AccountId, kryEmp1.EmployeeId, "Solarflare XtremeScale 100Gb NICs", 48000.00m, "Approved", "Hardware purchase for low-latency co-location rack", DateTime.UtcNow.AddDays(-18));

            EnsureTask(context, kryProj1.ProjectId, kryEmp5.EmployeeId, "Kernel Bypass Zero-Copy Ring Buffer", "Eliminate context-switching for inbound NASDAQ ITCH packets.", "Highest", "In Progress", 13);
            EnsureTask(context, kryProj1.ProjectId, kryEmp1.EmployeeId, "Backtest Statistical Arbitrage Mean Reversion", "Simulate 5 years of tick data on CME E-mini futures.", "High", "Done", 8);

            var kryProj2 = EnsureProject(context, kryComp.CompanyId, kryEmp2.EmployeeId, "Real-Time AI Anti-Money Laundering Sentry", "In Progress", 420000.00m,
                "Graph neural network scanning global ledger transactions for layering, smurfing, and sanctions evasion.",
                "Achieve sub-50ms transaction verdict with 99.4% precision.");

            var kryProj3 = EnsureProject(context, kryComp.CompanyId, kryEmp3.EmployeeId, "Cross-Border Instant Settlement Network", "In Progress", 350000.00m,
                "Distributed ledger atomic swap clearinghouse reducing FX settlement times from T+2 to real-time.",
                "Connect liquidity pools across USD, EUR, GBP, and JPY.");

            var kryProj4 = EnsureProject(context, kryComp.CompanyId, kryEmp4.EmployeeId, "PSD3 Open Banking Financial Mesh", "In Progress", 260000.00m,
                "Secure REST API mesh allowing third-party fintechs OAuth2 consented account access.",
                "Enforce FAPI 1.0 Advanced security profile with mutual TLS.");

            var kryProj5 = EnsureProject(context, kryComp.CompanyId, kryEmp7.EmployeeId, "Institutional Multi-Sig Custody Vault", "In Progress", 310000.00m,
                "Threshold cryptographic multi-party computation (MPC) cold storage vault for digital assets.",
                "Enforce m-of-n quorum signing rules with hardware security modules (HSM).");

            // =========================================================================
            // 🏢 6. NORDIC CLEANENERGY LABS (Community Free Tier - $0/mo, Limit 1 Project, 10 Emps)
            // =========================================================================
            var norOwner = EnsureUser(context, "astrid.lind@nordicclean.energy", "Company", "Approved", 79);
            var norComp = EnsureCompany(context, norOwner.UserId, "Nordic CleanEnergy Labs", "REG-NOR-1194", "Renewable Energy & CleanTech");
            EnsureSubscription(context, norComp.CompanyId, "Free", 0.00m, "Community Free Plan");

            var norDeptGrid = EnsureDepartment(context, norComp.CompanyId, "Smart Grid Systems");
            var norDeptWind = EnsureDepartment(context, norComp.CompanyId, "Wind Turbine Analytics");

            var norEmp1User = EnsureUser(context, "soren.kirkegaard@nordicclean.energy", "Employee", "Approved", norComp.CompanyId);
            var norEmp1 = EnsureEmployee(context, norEmp1User.UserId, norComp.CompanyId, norDeptGrid.DepartmentId, "Soren Kirkegaard", "Power Systems Grid Engineer", 90.00m);

            var norEmp2User = EnsureUser(context, "freja.nygard@nordicclean.energy", "Employee", "Approved", norComp.CompanyId);
            var norEmp2 = EnsureEmployee(context, norEmp2User.UserId, norComp.CompanyId, norDeptWind.DepartmentId, "Freja Nygard", "Wind Turbine SCADA Specialist", 85.00m);

            var norEmp3User = EnsureUser(context, "lars.ulrich@nordicclean.energy", "Employee", "Approved", norComp.CompanyId);
            var norEmp3 = EnsureEmployee(context, norEmp3User.UserId, norComp.CompanyId, norDeptGrid.DepartmentId, "Lars Ulrich", "Energy Storage & Battery Tech", 80.00m);

            var norEmp4User = EnsureUser(context, "greta.thunberg@nordicclean.energy", "Employee", "Approved", norComp.CompanyId);
            var norEmp4 = EnsureEmployee(context, norEmp4User.UserId, norComp.CompanyId, norDeptGrid.DepartmentId, "Greta Thunberg", "Climate Impact & Carbon Auditor", 75.00m);

            var norEmp5User = EnsureUser(context, "erik.thorvald@nordicclean.energy", "Employee", "Approved", norComp.CompanyId);
            var norEmp5 = EnsureEmployee(context, norEmp5User.UserId, norComp.CompanyId, norDeptWind.DepartmentId, "Erik Thorvald", "Solar Array Telemetry Engineer", 85.00m);

            // ── Pending Employee Signup Queue for Nordic (2 Pending Applicants!) ──
            var norPending1User = EnsureUser(context, "magnus.wind@nordicclean.energy", "Employee", "PendingCompany", norComp.CompanyId);
            EnsureEmployee(context, norPending1User.UserId, norComp.CompanyId, norDeptWind.DepartmentId, "Magnus Olsen", "Wind Farm Field Engineer", 80.00m);

            var norPending2User = EnsureUser(context, "astrid.solar@nordicclean.energy", "Employee", "PendingCompany", norComp.CompanyId);
            EnsureEmployee(context, norPending2User.UserId, norComp.CompanyId, norDeptGrid.DepartmentId, "Astrid Lindqvist", "Solar Microgrid Analyst", 85.00m);

            // Nordic Project
            var norProj1 = EnsureProject(context, norComp.CompanyId, norEmp1.EmployeeId, "Baltic Offshore Wind Farm SCADA Telemetry", "In Progress", 95000.00m,
                "Real-time sensor telemetry and yaw angle optimization for 60 offshore Siemens Gamesa turbines.",
                "Maximize wind capture efficiency by 7% during low-wind turbulence windows.");
            EnsureAssignment(context, norProj1.ProjectId, norEmp1.EmployeeId, "Project Manager");
            EnsureAssignment(context, norProj1.ProjectId, norEmp2.EmployeeId, "SCADA Specialist");

            var norAcc1 = EnsureAccount(context, norProj1.ProjectId, "Subsea Fiber Sensor Telemetry", 50000.00m, 38500.00m);
            EnsureTransaction(context, norAcc1.AccountId, norEmp2.EmployeeId, "MODBUS Gateway Hardware", 6500.00m, "Approved", "Industrial edge telemetry gateways", DateTime.UtcNow.AddDays(-7));

            EnsureTask(context, norProj1.ProjectId, norEmp1.EmployeeId, "Calibrate Pitch Control PID Loop", "Tune rotational speed dampener under gale conditions.", "High", "In Progress", 5);
            EnsureTask(context, norProj1.ProjectId, norEmp2.EmployeeId, "Implement IEC 61850 Substation Protocol", "Stream raw sensor samples to central dispatch center.", "Medium", "Done", 3);

            // =========================================================================
            // 🏢 7. NEXUS MEDIA & INTERACTIVE (Community Free Tier - $0/mo, Limit 1 Project, 10 Emps)
            // =========================================================================
            var nexOwner = EnsureUser(context, "kai.sterling@nexusmedia.studio", "Company", "Approved", 85);
            var nexComp = EnsureCompany(context, nexOwner.UserId, "Nexus Media & Interactive", "REG-NEX-6832", "Digital Media & Entertainment");
            EnsureSubscription(context, nexComp.CompanyId, "Free", 0.00m, "Community Free Plan");

            var nexDeptEngine = EnsureDepartment(context, nexComp.CompanyId, "Real-Time 3D Engine R&D");
            var nexDeptAudio = EnsureDepartment(context, nexComp.CompanyId, "Interactive Audio & Spatial Sound");

            var nexEmp1User = EnsureUser(context, "maya.hawke@nexusmedia.studio", "Employee", "Approved", nexComp.CompanyId);
            var nexEmp1 = EnsureEmployee(context, nexEmp1User.UserId, nexComp.CompanyId, nexDeptEngine.DepartmentId, "Maya Hawke", "Lead 3D Shader & VFX Artist", 85.00m);

            var nexEmp2User = EnsureUser(context, "sean.murray@nexusmedia.studio", "Employee", "Approved", nexComp.CompanyId);
            var nexEmp2 = EnsureEmployee(context, nexEmp2User.UserId, nexComp.CompanyId, nexDeptEngine.DepartmentId, "Sean Murray", "Procedural World Generation Programmer", 95.00m);

            var nexEmp3User = EnsureUser(context, "billie.eilish@nexusmedia.studio", "Employee", "Approved", nexComp.CompanyId);
            var nexEmp3 = EnsureEmployee(context, nexEmp3User.UserId, nexComp.CompanyId, nexDeptAudio.DepartmentId, "Billie Eilish", "Spatial Audio Sound Designer", 80.00m);

            var nexEmp4User = EnsureUser(context, "hideo.kojima@nexusmedia.studio", "Employee", "Approved", nexComp.CompanyId);
            var nexEmp4 = EnsureEmployee(context, nexEmp4User.UserId, nexComp.CompanyId, nexDeptEngine.DepartmentId, "Hideo Kojima", "Narrative Gameplay Architect", 100.00m);

            // ── Pending Employee Signup Queue for Nexus (2 Pending Applicants!) ──
            var nexPending1User = EnsureUser(context, "leo.vfx@nexusmedia.studio", "Employee", "PendingCompany", nexComp.CompanyId);
            EnsureEmployee(context, nexPending1User.UserId, nexComp.CompanyId, nexDeptEngine.DepartmentId, "Leo Castillo", "Houdini FX Simulation Artist", 90.00m);

            var nexPending2User = EnsureUser(context, "harper.sound@nexusmedia.studio", "Employee", "PendingCompany", nexComp.CompanyId);
            EnsureEmployee(context, nexPending2User.UserId, nexComp.CompanyId, nexDeptAudio.DepartmentId, "Harper Reed", "Spatial Audio Engineer", 85.00m);

            // Nexus Project
            var nexProj1 = EnsureProject(context, nexComp.CompanyId, nexEmp2.EmployeeId, "Next-Gen Unreal 5 Raytracing Pipeline", "In Progress", 85000.00m,
                "Custom Lumen and Nanite HLSL compute shader pipeline for real-time virtual production.",
                "Achieve stable 60 FPS 4K rendering on dual RTX 4090 virtual production stage.");
            EnsureAssignment(context, nexProj1.ProjectId, nexEmp2.EmployeeId, "Graphics Lead");
            EnsureAssignment(context, nexProj1.ProjectId, nexEmp1.EmployeeId, "VFX Artist");

            var nexAcc1 = EnsureAccount(context, nexProj1.ProjectId, "Virtual Stage GPU Compute Budget", 45000.00m, 32000.00m);
            EnsureTransaction(context, nexAcc1.AccountId, nexEmp1.EmployeeId, "Quixel Megascans Production License", 4500.00m, "Approved", "Photogrammetry 3D asset library", DateTime.UtcNow.AddDays(-6));

            EnsureTask(context, nexProj1.ProjectId, nexEmp1.EmployeeId, "Optimize Subsurface Scattering Shaders", "Reduce specular noise on virtual actors in high-contrast lighting.", "High", "In Progress", 5);
            EnsureTask(context, nexProj1.ProjectId, nexEmp3.EmployeeId, "Implement Ambisonic Binaural Spatializer", "Render 3D Doppler acoustics with head-tracking integration.", "Medium", "Done", 3);

            // =========================================================================
            // 🏢 8. VANGUARD ROBOTICS & AUTOMATION (Enterprise Tier - $29/mo, Unlimited Scale)
            // =========================================================================
            var vngOwner = EnsureUser(context, "vikram.patel@vanguardrobotics.com", "Company", "Approved", 90);
            var vngComp = EnsureCompany(context, vngOwner.UserId, "Vanguard Robotics & Automation", "REG-VNG-5520", "Robotics & Industrial Automation");
            EnsureSubscription(context, vngComp.CompanyId, "Enterprise", 29.00m, "Stripe (Visa •••• 7744)");

            var vngDeptArm = EnsureDepartment(context, vngComp.CompanyId, "Robotic Arm Kinematics");
            var vngDeptRtos = EnsureDepartment(context, vngComp.CompanyId, "Embedded C++ & Real-Time OS");
            var vngDeptVision = EnsureDepartment(context, vngComp.CompanyId, "Computer Vision & Edge SLAM");
            var vngDeptCobot = EnsureDepartment(context, vngComp.CompanyId, "Safety Systems & Cobot Standards");

            var vngEmp1User = EnsureUser(context, "hiroshi.sato@vanguardrobotics.com", "Employee", "Approved", vngComp.CompanyId);
            var vngEmp1 = EnsureEmployee(context, vngEmp1User.UserId, vngComp.CompanyId, vngDeptArm.DepartmentId, "Dr. Hiroshi Sato", "Chief Robotics Scientist", 140.00m);

            var vngEmp2User = EnsureUser(context, "emily.blunt@vanguardrobotics.com", "Employee", "Approved", vngComp.CompanyId);
            var vngEmp2 = EnsureEmployee(context, vngEmp2User.UserId, vngComp.CompanyId, vngDeptVision.DepartmentId, "Emily Blunt", "Edge Computer Vision Specialist", 110.00m);

            var vngEmp3User = EnsureUser(context, "tony.stark@vanguardrobotics.com", "Employee", "Approved", vngComp.CompanyId);
            var vngEmp3 = EnsureEmployee(context, vngEmp3User.UserId, vngComp.CompanyId, vngDeptArm.DepartmentId, "Tony Stark", "Actuator & Exoskeleton Lead", 150.00m);

            var vngEmp4User = EnsureUser(context, "bruce.banner@vanguardrobotics.com", "Employee", "Approved", vngComp.CompanyId);
            var vngEmp4 = EnsureEmployee(context, vngEmp4User.UserId, vngComp.CompanyId, vngDeptCobot.DepartmentId, "Bruce Banner", "Materials & Stress Analysis Engineer", 120.00m);

            var vngEmp5User = EnsureUser(context, "natasha.romanoff@vanguardrobotics.com", "Employee", "Approved", vngComp.CompanyId);
            var vngEmp5 = EnsureEmployee(context, vngEmp5User.UserId, vngComp.CompanyId, vngDeptRtos.DepartmentId, "Natasha Romanoff", "Embedded RTOS Firmware Engineer", 105.00m);

            var vngEmp6User = EnsureUser(context, "peter.parker@vanguardrobotics.com", "Employee", "Approved", vngComp.CompanyId);
            var vngEmp6 = EnsureEmployee(context, vngEmp6User.UserId, vngComp.CompanyId, vngDeptVision.DepartmentId, "Peter Parker", "Micro-Sensor & Cobot Integrator", 90.00m);

            var vngEmp7User = EnsureUser(context, "wanda.maximoff@vanguardrobotics.com", "Employee", "Approved", vngComp.CompanyId);
            var vngEmp7 = EnsureEmployee(context, vngEmp7User.UserId, vngComp.CompanyId, vngDeptArm.DepartmentId, "Wanda Maximoff", "Industrial Teleoperation UI Lead", 95.00m);

            var vngEmp8User = EnsureUser(context, "vision@vanguardrobotics.com", "Employee", "Approved", vngComp.CompanyId);
            var vngEmp8 = EnsureEmployee(context, vngEmp8User.UserId, vngComp.CompanyId, vngDeptVision.DepartmentId, "Vision Synthezoid", "Neural Edge Processing Architect", 130.00m);

            var vngEmp9User = EnsureUser(context, "sam.wilson@vanguardrobotics.com", "Employee", "Approved", vngComp.CompanyId);
            var vngEmp9 = EnsureEmployee(context, vngEmp9User.UserId, vngComp.CompanyId, vngDeptRtos.DepartmentId, "Sam Wilson", "Aerial Drone Dynamics Engineer", 100.00m);

            var vngEmp10User = EnsureUser(context, "bucky.barnes@vanguardrobotics.com", "Employee", "Approved", vngComp.CompanyId);
            var vngEmp10 = EnsureEmployee(context, vngEmp10User.UserId, vngComp.CompanyId, vngDeptArm.DepartmentId, "Bucky Barnes", "Industrial Testing & Field Deployment", 85.00m);

            var vngEmp11User = EnsureUser(context, "james.rhodes@vanguardrobotics.com", "Employee", "Approved", vngComp.CompanyId);
            var vngEmp11 = EnsureEmployee(context, vngEmp11User.UserId, vngComp.CompanyId, vngDeptCobot.DepartmentId, "James Rhodes", "Robotic Hardware Safety Director", 115.00m);

            // ── Pending Employee Signup Queue for Vanguard (3 Pending Applicants!) ──
            var vngPending1User = EnsureUser(context, "kenji.cobot@vanguardrobotics.com", "Employee", "PendingCompany", vngComp.CompanyId);
            EnsureEmployee(context, vngPending1User.UserId, vngComp.CompanyId, vngDeptCobot.DepartmentId, "Kenji Matsumoto", "Industrial Cobot Specialist", 100.00m);

            var vngPending2User = EnsureUser(context, "sarah.sim@vanguardrobotics.com", "Employee", "PendingCompany", vngComp.CompanyId);
            EnsureEmployee(context, vngPending2User.UserId, vngComp.CompanyId, vngDeptVision.DepartmentId, "Sarah Jenkins", "Digital Twin Simulation Dev", 95.00m);

            var vngPending3User = EnsureUser(context, "dmitri.actuator@vanguardrobotics.com", "Employee", "PendingCompany", vngComp.CompanyId);
            EnsureEmployee(context, vngPending3User.UserId, vngComp.CompanyId, vngDeptArm.DepartmentId, "Dmitri Ivanov", "Precision Actuator Assembly Tech", 85.00m);

            // Vanguard Projects
            var vngProj1 = EnsureProject(context, vngComp.CompanyId, vngEmp1.EmployeeId, "Heavy Industrial 6-Axis Robotic Arm Controller", "In Progress", 480000.00m,
                "Sub-millimeter repeatability high-torque industrial robotic arm inverse kinematics controller.",
                "Achieve 0.02mm positional accuracy under 250kg dynamic payload.");
            EnsureAssignment(context, vngProj1.ProjectId, vngEmp1.EmployeeId, "Chief Scientist");
            EnsureAssignment(context, vngProj1.ProjectId, vngEmp3.EmployeeId, "Mechanical Actuator Lead");
            EnsureAssignment(context, vngProj1.ProjectId, vngEmp5.EmployeeId, "Firmware Lead");

            var vngAcc1 = EnsureAccount(context, vngProj1.ProjectId, "Harmonic Drive Gearbox & Servos", 220000.00m, 175000.00m);
            EnsureTransaction(context, vngAcc1.AccountId, vngEmp3.EmployeeId, "Harmonic Drive Zero-Backlash Actuators", 45000.00m, "Approved", "High-precision servo actuators batch #02", DateTime.UtcNow.AddDays(-11));

            EnsureTask(context, vngProj1.ProjectId, vngEmp1.EmployeeId, "Compute Denavit-Hartenberg Kinematics Matrix", "Derive closed-form analytical Jacobian for 6-DoF arm.", "Highest", "In Progress", 8);
            EnsureTask(context, vngProj1.ProjectId, vngEmp5.EmployeeId, "Configure FreeRTOS 1kHz Motion Control Task", "Guarantee jitter under 15 microseconds on STM32H7 dual-core.", "High", "Done", 8);

            var vngProj2 = EnsureProject(context, vngComp.CompanyId, vngEmp2.EmployeeId, "Real-Time 3D Spatial SLAM Edge Module", "In Progress", 340000.00m,
                "Low-power visual-inertial odometry SLAM module running on Jetson Orin Nano.",
                "Enable autonomous factory navigation without external beacons or GPS.");

            var vngProj3 = EnsureProject(context, vngComp.CompanyId, vngEmp6.EmployeeId, "Collaborative Warehouse Cobot Fleet", "In Progress", 290000.00m,
                "Force-torque sensing collaborative cobots working alongside human workers on assembly line.",
                "Implement ISO 10218-1 speed and separation monitoring.");

            var vngProj4 = EnsureProject(context, vngComp.CompanyId, vngEmp9.EmployeeId, "Autonomous Aerial Inspection Quadcopter", "In Progress", 210000.00m,
                "High-voltage transmission line automated fault inspection drone with thermal imaging.",
                "Achieve autonomous perching and wireless induction recharging.");
        }

        // =========================================================================
        // 🏢 9. COMPANY 103 (User: companyowner1@gmail.com) & DYNAMIC ENRICHMENT
        // =========================================================================
        private static void SeedCompany103AndDynamic(GrindSetDbContext context)
        {
            // Ensure companyowner1 user exists
            var comp103Owner = EnsureUser(context, "companyowner1@gmail.com", "Company", "Approved", 103);
            var comp103 = EnsureCompany(context, comp103Owner.UserId, "Acme Global Technologies (Enterprise Software)", "REG-585065", "Enterprise Technology");
            EnsureSubscription(context, comp103.CompanyId, "Pro", 15.00m, "Stripe (Visa •••• 4242)");

            var deptEng103 = EnsureDepartment(context, comp103.CompanyId, "Engineering & Infrastructure");
            var deptProd103 = EnsureDepartment(context, comp103.CompanyId, "Product & UI/UX Design");
            var deptCloud103 = EnsureDepartment(context, comp103.CompanyId, "Cloud DevOps & Security");
            var deptQA103 = EnsureDepartment(context, comp103.CompanyId, "Quality Assurance & Systems");

            // Active Employees for Company 103
            var empSarahUser = EnsureUser(context, "sarah.jenkins@acmeglobal.com", "Employee", "Approved", comp103.CompanyId);
            var empSarah = EnsureEmployee(context, empSarahUser.UserId, comp103.CompanyId, deptEng103.DepartmentId, "Sarah Jenkins", "Lead Project Manager", 115.00m);

            var empAlexUser = EnsureUser(context, "alex.rivers@acmeglobal.com", "Employee", "Approved", comp103.CompanyId);
            var empAlex = EnsureEmployee(context, empAlexUser.UserId, comp103.CompanyId, deptCloud103.DepartmentId, "Alex Rivers", "Senior Cloud Architect", 125.00m);

            var empElenaUser = EnsureUser(context, "elena.rostova.103@acmeglobal.com", "Employee", "Approved", comp103.CompanyId);
            var empElena = EnsureEmployee(context, empElenaUser.UserId, comp103.CompanyId, deptProd103.DepartmentId, "Elena Rostova", "Staff UX/UI Designer", 95.00m);

            var empMarcusUser = EnsureUser(context, "marcus.vance.103@acmeglobal.com", "Employee", "Approved", comp103.CompanyId);
            var empMarcus = EnsureEmployee(context, empMarcusUser.UserId, comp103.CompanyId, deptCloud103.DepartmentId, "Marcus Vance", "Principal DevOps Specialist", 110.00m);

            var empPriyaUser = EnsureUser(context, "priya.patel.103@acmeglobal.com", "Employee", "Approved", comp103.CompanyId);
            var empPriya = EnsureEmployee(context, empPriyaUser.UserId, comp103.CompanyId, deptQA103.DepartmentId, "Priya Patel", "Senior QA Automation Engineer", 85.00m);

            var empDavidUser = EnsureUser(context, "david.kim.103@acmeglobal.com", "Employee", "Approved", comp103.CompanyId);
            var empDavid = EnsureEmployee(context, empDavidUser.UserId, comp103.CompanyId, deptEng103.DepartmentId, "David Kim", "Lead Data & ML Engineer", 120.00m);

            var empChloeUser = EnsureUser(context, "chloe.bennett.103@acmeglobal.com", "Employee", "Approved", comp103.CompanyId);
            var empChloe = EnsureEmployee(context, empChloeUser.UserId, comp103.CompanyId, deptCloud103.DepartmentId, "Chloe Bennett", "Security & Compliance Analyst", 90.00m);

            var empLiamUser = EnsureUser(context, "liam.front.103@acmeglobal.com", "Employee", "Approved", comp103.CompanyId);
            var empLiam = EnsureEmployee(context, empLiamUser.UserId, comp103.CompanyId, deptEng103.DepartmentId, "Liam O'Connor", "React Frontend Engineer", 90.00m);

            // Existing Den and Josh (if present in DB)
            var denEmp = context.Employees.FirstOrDefault(e => e.FullName == "Den" && e.CompanyId == comp103.CompanyId);
            var joshEmp = context.Employees.FirstOrDefault(e => e.FullName == "Josh" && e.CompanyId == comp103.CompanyId);

            // ── Pending Employee Signup Queue for Company 103 (4 Pending Applications!) ──
            var pend103_1 = EnsureUser(context, "felix.applicant@grindset.io", "Employee", "PendingCompany", comp103.CompanyId);
            EnsureEmployee(context, pend103_1.UserId, comp103.CompanyId, deptEng103.DepartmentId, "Felix Kjellberg", "Lead Frontend Developer", 95.00m);

            var pend103_2 = EnsureUser(context, "amara.designer@grindset.io", "Employee", "PendingCompany", comp103.CompanyId);
            EnsureEmployee(context, pend103_2.UserId, comp103.CompanyId, deptProd103.DepartmentId, "Amara Okafor", "Product & UX Specialist", 85.00m);

            var pend103_3 = EnsureUser(context, "lucas.devops@grindset.io", "Employee", "PendingCompany", comp103.CompanyId);
            EnsureEmployee(context, pend103_3.UserId, comp103.CompanyId, deptCloud103.DepartmentId, "Lucas Silva", "Cloud Infrastructure Engineer", 105.00m);

            var pend103_4 = EnsureUser(context, "sophia.qa@grindset.io", "Employee", "PendingCompany", comp103.CompanyId);
            EnsureEmployee(context, pend103_4.UserId, comp103.CompanyId, deptQA103.DepartmentId, "Sophia Chen", "QA Automation Tester", 80.00m);

            // ── Projects for Company 103 (4 Active Projects, Pro Limit: 5) ──

            // Project 1: First Project
            var proj1 = EnsureProject(context, comp103.CompanyId, empSarah.EmployeeId, "First Project", "In Progress", 250000.00m,
                "Enterprise platform core architecture, RBAC guardrails, and distributed data sync.",
                "Deploy 3-tier enterprise architecture with sub-50ms API response time.");
            EnsureAssignment(context, proj1.ProjectId, empSarah.EmployeeId, "Lead Project Manager");
            EnsureAssignment(context, proj1.ProjectId, empAlex.EmployeeId, "Senior Cloud Architect");
            if (denEmp != null) EnsureAssignment(context, proj1.ProjectId, denEmp.EmployeeId, "Senior Engineer");
            if (joshEmp != null) EnsureAssignment(context, proj1.ProjectId, joshEmp.EmployeeId, "Engineer");

            var acc103_1 = EnsureAccount(context, proj1.ProjectId, "Core Infrastructure & Cloud Gateways", 150000.00m, 112500.00m);
            var acc103_2 = EnsureAccount(context, proj1.ProjectId, "Security Audits & External Penetration", 100000.00m, 82000.00m);

            EnsureTransaction(context, acc103_1.AccountId, empAlex.EmployeeId, "Dell PowerEdge R750 Rack Servers", 16500.00m, "Approved", "Hardware cluster expansion for staging environment", DateTime.UtcNow.AddDays(-14));
            EnsureTransaction(context, acc103_1.AccountId, empSarah.EmployeeId, "AWS Production Ingress & CloudFront Bandwidth", 4200.00m, "Approved", "Monthly edge network distribution", DateTime.UtcNow.AddDays(-6));
            EnsureTransaction(context, acc103_2.AccountId, empChloe.EmployeeId, "Synopsys Black Duck Security License", 9800.00m, "Approved", "Automated open-source dependency vulnerability scanning", DateTime.UtcNow.AddDays(-3));
            EnsureTransaction(context, acc103_1.AccountId, empSarah.EmployeeId, "Datadog APM Enterprise Monitoring Suite", 3500.00m, "PendingApproval", "Application performance telemetry instrumentation", DateTime.UtcNow.AddDays(-1));

            EnsureTask(context, proj1.ProjectId, empAlex.EmployeeId, "Enforce 3-Tier JWT RBAC Token Validation", "Audit role and companyId claims across all backend endpoints.", "Highest", "In Progress", 5);
            EnsureTask(context, proj1.ProjectId, empSarah.EmployeeId, "Configure Redis Distributed Cache for Tenant Routing", "Cache multi-tenant db resolution lookups.", "High", "Done", 3);
            EnsureTask(context, proj1.ProjectId, empLiam.EmployeeId, "Implement Real-time SignalR WebSockets Project Chat", "Bidirectional SignalR chat hub between PM and members.", "High", "Done", 5);
            EnsureTask(context, proj1.ProjectId, empPriya.EmployeeId, "Automated Postman & Playwright E2E Test Suite", "Run full regression test matrix against all endpoints.", "Medium", "In Review", 3);

            EnsureChatMessage(context, proj1.ProjectId, empSarahUser.UserId, "Sarah Jenkins", "Lead Project Manager",
                "Good morning team! We are kicking off sprint 14. The core cloud infrastructure and RBAC endpoints are live.", DateTime.UtcNow.AddHours(-4));
            EnsureChatMessage(context, proj1.ProjectId, empAlexUser.UserId, "Alex Rivers", "Senior Cloud Architect",
                "Morning Sarah! The multi-region Kubernetes cluster is healthy and ingress latency is under 12ms.", DateTime.UtcNow.AddHours(-3).AddMinutes(20));
            EnsureChatMessage(context, proj1.ProjectId, empLiamUser.UserId, "Liam O'Connor", "React Frontend Engineer",
                "SignalR live project chat and websocket notification channels are verified! Ready for live testing.", DateTime.UtcNow.AddHours(-2).AddMinutes(10));
            EnsureChatMessage(context, proj1.ProjectId, empSarahUser.UserId, "Sarah Jenkins", "Lead Project Manager",
                "Outstanding work everyone! I have approved the server hardware purchase order. Let's maintain this momentum!", DateTime.UtcNow.AddMinutes(-30));

            // Project 2: Next project
            int pmId2 = denEmp != null ? denEmp.EmployeeId : empElena.EmployeeId;
            var proj2 = EnsureProject(context, comp103.CompanyId, pmId2, "Next project", "In Progress", 180000.00m,
                "Mobile responsive portal, offline-first client cache, and interactive analytics dashboard.",
                "Ship mobile web app supporting offline drafting and instant cloud reconciliation.");
            EnsureAssignment(context, proj2.ProjectId, pmId2, "Project Lead");
            EnsureAssignment(context, proj2.ProjectId, empElena.EmployeeId, "UX/UI Designer");
            EnsureAssignment(context, proj2.ProjectId, empLiam.EmployeeId, "Frontend Developer");

            var acc103_3 = EnsureAccount(context, proj2.ProjectId, "Mobile UI/UX Design & Tooling", 100000.00m, 86500.00m);
            var acc103_4 = EnsureAccount(context, proj2.ProjectId, "Push Notification & Telemetry Infrastructure", 80000.00m, 69000.00m);

            EnsureTransaction(context, acc103_3.AccountId, empElena.EmployeeId, "Apple Developer Enterprise Account", 1500.00m, "Approved", "Annual iOS deployment credentials", DateTime.UtcNow.AddDays(-12));
            EnsureTransaction(context, acc103_3.AccountId, empElena.EmployeeId, "Figma Enterprise Design System Subscription", 2400.00m, "Approved", "Collaborative workspace for UI/UX tokens", DateTime.UtcNow.AddDays(-8));
            EnsureTransaction(context, acc103_4.AccountId, empLiam.EmployeeId, "Firebase Cloud Messaging Dedicated Ingestion Tier", 3200.00m, "Approved", "High-throughput mobile notification pipeline", DateTime.UtcNow.AddDays(-4));

            EnsureTask(context, proj2.ProjectId, empElena.EmployeeId, "Design Responsive Mobile Kanban Drawer", "Figma prototype for touch-optimized task drag-and-drop.", "High", "Done", 5);
            EnsureTask(context, proj2.ProjectId, empLiam.EmployeeId, "Benchmark Offline IndexedDB Cache Synchronization", "Ensure snappy offline search and conflict resolution.", "High", "In Progress", 8);
            EnsureTask(context, proj2.ProjectId, empElena.EmployeeId, "Implement Biometric FaceID / Fingerprint Fast Unlock", "Native WebAuthn credentials for fast login.", "Medium", "To Do", 5);

            EnsureChatMessage(context, proj2.ProjectId, empElenaUser.UserId, "Elena Rostova", "Staff UX/UI Designer",
                "Dark mode tokens and glassmorphism styling tokens have been synced from Figma. The dashboard layout is looking slick!", DateTime.UtcNow.AddHours(-3));
            EnsureChatMessage(context, proj2.ProjectId, empLiamUser.UserId, "Liam O'Connor", "React Frontend Engineer",
                "Responsive grid adapts smoothly across 4K displays down to iPhone 13 viewports. Performance score is 98 on Lighthouse.", DateTime.UtcNow.AddHours(-1).AddMinutes(15));

            // Project 3: AI Automation & Predictive Analytics Suite
            var proj3 = EnsureProject(context, comp103.CompanyId, empDavid.EmployeeId, "AI Automation & Predictive Analytics Suite", "In Progress", 320000.00m,
                "Transformer-driven financial anomaly detection, expense forecasting, and automated budget allocation alerts.",
                "Train time-series neural network and deliver real-time spend variance predictions.");
            EnsureAssignment(context, proj3.ProjectId, empDavid.EmployeeId, "Lead AI Scientist");
            EnsureAssignment(context, proj3.ProjectId, empAlex.EmployeeId, "Cloud ML Architect");
            EnsureAssignment(context, proj3.ProjectId, empMarcus.EmployeeId, "DevOps Pipeline Lead");

            var acc103_5 = EnsureAccount(context, proj3.ProjectId, "GPU Compute Cluster & Training Workloads", 200000.00m, 152000.00m);
            var acc103_6 = EnsureAccount(context, proj3.ProjectId, "Data Lake Pipeline & Kafka Streaming", 120000.00m, 98000.00m);

            EnsureTransaction(context, acc103_5.AccountId, empDavid.EmployeeId, "NVIDIA H100 Tensor Core GPU Compute Run", 28000.00m, "Approved", "Fine-tuning LLM on enterprise financial transaction dataset", DateTime.UtcNow.AddDays(-9));
            EnsureTransaction(context, acc103_6.AccountId, empMarcus.EmployeeId, "Confluent Kafka Managed Dedicated Cluster", 8500.00m, "Approved", "Real-time streaming ledger event bus", DateTime.UtcNow.AddDays(-5));
            EnsureTransaction(context, acc103_5.AccountId, empDavid.EmployeeId, "Weights & Biases Enterprise Experiment Tracker", 4200.00m, "Approved", "Model hyperparameter tracking license", DateTime.UtcNow.AddDays(-2));

            EnsureTask(context, proj3.ProjectId, empDavid.EmployeeId, "Train Time-Series Anomaly Detector on Ledger Stream", "Train LSTM-Autoencoder on historical ledger transactions.", "Highest", "In Progress", 8);
            EnsureTask(context, proj3.ProjectId, empAlex.EmployeeId, "Deploy ONNX Model Inference Microservice via Docker", "Containerize inference engine with TensorRT acceleration.", "High", "Done", 5);
            EnsureTask(context, proj3.ProjectId, empMarcus.EmployeeId, "Hook Up SignalR Notification on Budget Anomaly Breach", "Alert company owners immediately when spending deviates by 20%.", "High", "In Review", 3);

            EnsureChatMessage(context, proj3.ProjectId, empDavidUser.UserId, "David Kim", "Lead Data & ML Engineer",
                "The financial anomaly detection model converged with 99.4% precision on the validation set! Preparing the inference container now.", DateTime.UtcNow.AddHours(-4));
            EnsureChatMessage(context, proj3.ProjectId, empAlexUser.UserId, "Alex Rivers", "Senior Cloud Architect",
                "The GPU cluster node has been allocated. TensorRT execution latency is under 4 milliseconds per batch.", DateTime.UtcNow.AddHours(-2));

            // Project 4: Global Supply Chain & Asset Tracking Portal
            var proj4 = EnsureProject(context, comp103.CompanyId, empAlex.EmployeeId, "Global Supply Chain & Asset Tracking Portal", "In Progress", 210000.00m,
                "End-to-end cellular IoT sensor telemetry tracking enterprise inventory and hardware shipments.",
                "Connect 500+ cellular IoT edge beacons with automated carrier roaming and geofencing.");
            EnsureAssignment(context, proj4.ProjectId, empAlex.EmployeeId, "IoT Architecture Lead");
            EnsureAssignment(context, proj4.ProjectId, empPriya.EmployeeId, "Firmware QA Engineer");
            EnsureAssignment(context, proj4.ProjectId, empChloe.EmployeeId, "Security Auditor");

            var acc103_7 = EnsureAccount(context, proj4.ProjectId, "Edge IoT Hardware & Gateway Deployment", 120000.00m, 96000.00m);
            EnsureTransaction(context, acc103_7.AccountId, empAlex.EmployeeId, "Nordic Semiconductor nRF9160 Cellular Modules", 14000.00m, "Approved", "Asset tracking sensor nodes batch #01", DateTime.UtcNow.AddDays(-11));
            EnsureTransaction(context, acc103_7.AccountId, empAlex.EmployeeId, "Twilio IoT Global Cellular SIM Connectivity", 3500.00m, "Approved", "Data connectivity across 45 countries", DateTime.UtcNow.AddDays(-7));

            EnsureTask(context, proj4.ProjectId, empAlex.EmployeeId, "Flash Zephyr RTOS onto nRF9160 Sensor Trackers", "Compile low-power BLE + LTE-M firmware.", "High", "Done", 5);
            EnsureTask(context, proj4.ProjectId, empPriya.EmployeeId, "Establish MQTT TLS Bridge to Core Backend", "Stream GPS coordinates and accelerometer data securely.", "Highest", "In Progress", 5);

            EnsureChatMessage(context, proj4.ProjectId, empAlexUser.UserId, "Alex Rivers", "Senior Cloud Architect",
                "Hardware prototypes have arrived. We are flashing the Zephyr RTOS firmware onto the first 50 sensor nodes today.", DateTime.UtcNow.AddHours(-5));
            EnsureChatMessage(context, proj4.ProjectId, empPriyaUser.UserId, "Priya Patel", "Senior QA Automation Engineer",
                "MQTT TLS mutual authentication is verified. Telemetry samples are populating the dashboard map.", DateTime.UtcNow.AddHours(-1));

            // ── Security Audit Logs for Company 103 ──
            EnsureAuditLog(context, comp103Owner.UserId, "Company Login Succeeded", "AuthService", DateTime.UtcNow.AddHours(-5));
            EnsureAuditLog(context, comp103Owner.UserId, "Project Created: AI Automation Suite", "ProjectService", DateTime.UtcNow.AddDays(-9));
            EnsureAuditLog(context, comp103Owner.UserId, "Budget Allocation Updated", "FinanceService", DateTime.UtcNow.AddDays(-8));
            EnsureAuditLog(context, empSarahUser.UserId, "Hardware Purchase Approved: Dell R750", "TransactionService", DateTime.UtcNow.AddDays(-6));
            EnsureAuditLog(context, empDavidUser.UserId, "GPU Cluster Training Run Initiated", "ComputeService", DateTime.UtcNow.AddDays(-4));
            EnsureAuditLog(context, comp103Owner.UserId, "Employee Access Reviewed", "WorkforceService", DateTime.UtcNow.AddDays(-2));
            EnsureAuditLog(context, empAlexUser.UserId, "IoT Security Certificate Rotated", "SecurityService", DateTime.UtcNow.AddDays(-1));
            EnsureAuditLog(context, comp103Owner.UserId, "Company Dashboard Loaded", "PortalService", DateTime.UtcNow.AddMinutes(-10));

            // -------------------------------------------------------------
            // 🌐 Dynamic Fallback for Any Other Company in the Database
            // -------------------------------------------------------------
            EnrichOtherSparseCompanies(context);
        }

        private static void EnrichOtherSparseCompanies(GrindSetDbContext context)
        {
            var companies = context.Companies.ToList();
            foreach (var comp in companies)
            {
                // Ensure at least 1 department
                var dept = context.Departments.FirstOrDefault(d => d.CompanyId == comp.CompanyId);
                if (dept == null)
                {
                    dept = EnsureDepartment(context, comp.CompanyId, "Engineering & Technology");
                }

                // Check pending employee signups
                int pendingCount = (from emp in context.Employees
                                    join u in context.Users on emp.EmployeeId equals u.UserId
                                    where emp.CompanyId == comp.CompanyId && u.ApprovalStatus == "PendingCompany"
                                    select emp).Count();

                if (pendingCount == 0)
                {
                    string slug = comp.CompanyName.ToLower().Replace(" ", "").Replace(".", "").Replace(",", "");
                    if (slug.Length > 8) slug = slug.Substring(0, 8);

                    var p1User = EnsureUser(context, $"applicant1.{slug}@grindset.io", "Employee", "PendingCompany", comp.CompanyId);
                    EnsureEmployee(context, p1User.UserId, comp.CompanyId, dept.DepartmentId, "Jordan Vance", "Full-Stack Software Engineer", 85.00m);

                    var p2User = EnsureUser(context, $"applicant2.{slug}@grindset.io", "Employee", "PendingCompany", comp.CompanyId);
                    EnsureEmployee(context, p2User.UserId, comp.CompanyId, dept.DepartmentId, "Casey Taylor", "Product QA Specialist", 75.00m);

                    var p3User = EnsureUser(context, $"applicant3.{slug}@grindset.io", "Employee", "PendingCompany", comp.CompanyId);
                    EnsureEmployee(context, p3User.UserId, comp.CompanyId, dept.DepartmentId, "Morgan Lee", "Cloud Infrastructure Dev", 95.00m);
                }

                // Check projects & transactions
                var projects = context.Projects.Where(p => p.CompanyId == comp.CompanyId).ToList();
                if (projects.Count == 0)
                {
                    var firstEmp = context.Employees.FirstOrDefault(e => e.CompanyId == comp.CompanyId);
                    int? pmId = firstEmp?.EmployeeId;
                    var proj = EnsureProject(context, comp.CompanyId, pmId, $"{comp.CompanyName} Enterprise Initiative", "In Progress", 150000.00m,
                        "Core business automation and enterprise workflow synchronization.",
                        "Deliver key platform milestones and streamline operational accounting.");

                    var acc = EnsureAccount(context, proj.ProjectId, "Operational & Cloud Infrastructure", 100000.00m, 82000.00m);
                    if (firstEmp != null)
                    {
                        EnsureAssignment(context, proj.ProjectId, firstEmp.EmployeeId, "Project Lead");
                        EnsureTransaction(context, acc.AccountId, firstEmp.EmployeeId, "Cloud Server Hosting", 4500.00m, "Approved", "Monthly staging cloud cluster hosting", DateTime.UtcNow.AddDays(-5));
                        EnsureTransaction(context, acc.AccountId, firstEmp.EmployeeId, "Software Tooling License", 1200.00m, "Approved", "Developer tooling subscriptions", DateTime.UtcNow.AddDays(-2));
                        EnsureTask(context, proj.ProjectId, firstEmp.EmployeeId, "Setup Initial Sprint Roadmap", "Define deliverables and assign team resources.", "High", "In Progress", 5);
                        EnsureTask(context, proj.ProjectId, firstEmp.EmployeeId, "Configure Deployment Pipeline", "Automate CI/CD test passes.", "Medium", "Done", 3);
                    }
                }
                else
                {
                    foreach (var p in projects)
                    {
                        var accs = context.FinancialAccounts.Where(a => a.ProjectId == p.ProjectId).ToList();
                        if (accs.Count == 0)
                        {
                            var acc = EnsureAccount(context, p.ProjectId, $"{p.ProjectName} Operating Budget", p.TotalBudget > 0 ? p.TotalBudget : 100000.00m, p.TotalBudget > 0 ? p.TotalBudget * 0.8m : 80000.00m);
                            var emp = context.Employees.FirstOrDefault(e => e.CompanyId == comp.CompanyId);
                            if (emp != null)
                            {
                                EnsureTransaction(context, acc.AccountId, emp.EmployeeId, "Operations & Hosting Allocation", 3500.00m, "Approved", "Monthly operating budget allocation", DateTime.UtcNow.AddDays(-7));
                            }
                        }
                    }
                }
            }
        }

        // =========================================================================
        // 🛠️ IDEMPOTENT ENTITY HELPERS
        // =========================================================================

        private static User EnsureUser(GrindSetDbContext context, string email, string role, string approvalStatus = "Approved", int? companyId = null)
        {
            var existing = context.Users.FirstOrDefault(u => u.Email.ToLower() == email.ToLower());
            if (existing != null)
            {
                bool changed = false;
                if (companyId.HasValue && !existing.CompanyId.HasValue)
                {
                    existing.CompanyId = companyId.Value;
                    changed = true;
                }
                if (!string.IsNullOrEmpty(approvalStatus) && existing.ApprovalStatus != approvalStatus && approvalStatus != "Approved")
                {
                    existing.ApprovalStatus = approvalStatus;
                    changed = true;
                }
                if (changed) context.SaveChanges();
                return existing;
            }

            var user = new User
            {
                Email = email.ToLower(),
                PasswordHash = "AQAAAAEAACcQAAAAEHASH_SEED123==", // Validates for any password in VerifyPassword
                Role = role,
                CompanyId = companyId,
                IsActive = true,
                ApprovalStatus = approvalStatus
            };
            context.Users.Add(user);
            context.SaveChanges();
            return user;
        }

        private static Company EnsureCompany(GrindSetDbContext context, int userId, string name, string regNo, string industry)
        {
            var existing = context.Companies.FirstOrDefault(c => c.CompanyId == userId || c.CompanyName == name);
            if (existing != null) return existing;

            var comp = new Company
            {
                CompanyId = userId,
                CompanyName = name,
                RegistrationNo = regNo,
                Industry = industry,
                LicenseStatus = "Active"
            };
            context.Companies.Add(comp);
            context.SaveChanges();
            return comp;
        }

        private static void EnsureSubscription(GrindSetDbContext context, int companyId, string tier, decimal price, string paymentMethod)
        {
            var existing = context.Subscriptions.FirstOrDefault(s => s.CompanyId == companyId);
            if (existing != null) return;

            var sub = new CompanySubscription
            {
                CompanyId = companyId,
                PlanTier = tier,
                BillingCycle = "Monthly",
                Price = price,
                Status = "Active",
                PaymentMethod = paymentMethod,
                CurrentPeriodStart = DateTime.UtcNow,
                CurrentPeriodEnd = DateTime.UtcNow.AddMonths(1),
                CreatedAt = DateTime.UtcNow
            };
            context.Subscriptions.Add(sub);
            context.SaveChanges();
        }

        private static Department EnsureDepartment(GrindSetDbContext context, int companyId, string name)
        {
            var existing = context.Departments.FirstOrDefault(d => d.CompanyId == companyId && d.DepartmentName == name);
            if (existing != null) return existing;

            var dept = new Department
            {
                CompanyId = companyId,
                DepartmentName = name
            };
            context.Departments.Add(dept);
            context.SaveChanges();
            return dept;
        }

        private static Employee EnsureEmployee(GrindSetDbContext context, int userId, int companyId, int deptId, string fullName, string designation, decimal hourlyRate)
        {
            var existing = context.Employees.FirstOrDefault(e => e.EmployeeId == userId);
            if (existing != null)
            {
                if (existing.CompanyId != companyId || existing.DepartmentId != deptId)
                {
                    existing.CompanyId = companyId;
                    existing.DepartmentId = deptId;
                    context.SaveChanges();
                }
                return existing;
            }

            var emp = new Employee
            {
                EmployeeId = userId,
                CompanyId = companyId,
                DepartmentId = deptId,
                FullName = fullName,
                Designation = designation,
                HourlyRate = hourlyRate
            };
            context.Employees.Add(emp);
            context.SaveChanges();
            return emp;
        }

        private static Project EnsureProject(GrindSetDbContext context, int companyId, int? pmId, string name, string status, decimal budget, string scopeDesc, string objectives)
        {
            var proj = context.Projects.FirstOrDefault(p => p.CompanyId == companyId && p.ProjectName == name);
            if (proj == null)
            {
                proj = new Project
                {
                    CompanyId = companyId,
                    ProjectManagerId = pmId,
                    ProjectName = name,
                    Status = status,
                    TotalBudget = budget
                };
                context.Projects.Add(proj);
                context.SaveChanges();
            }
            else
            {
                bool changed = false;
                if (pmId.HasValue && !proj.ProjectManagerId.HasValue)
                {
                    proj.ProjectManagerId = pmId.Value;
                    changed = true;
                }
                if (budget > 0 && proj.TotalBudget == 0)
                {
                    proj.TotalBudget = budget;
                    changed = true;
                }
                if (changed) context.SaveChanges();
            }

            if (!context.ProjectScopes.Any(s => s.ProjectId == proj.ProjectId))
            {
                context.ProjectScopes.Add(new ProjectScope
                {
                    ProjectId = proj.ProjectId,
                    ScopeDescription = scopeDesc,
                    Objectives = objectives
                });
                context.SaveChanges();
            }

            if (!context.ProjectTimelines.Any(t => t.ProjectId == proj.ProjectId))
            {
                context.ProjectTimelines.Add(new ProjectTimeline
                {
                    ProjectId = proj.ProjectId,
                    PlannedStart = DateTime.UtcNow.AddDays(-30),
                    PlannedEnd = DateTime.UtcNow.AddDays(90),
                    Status = status == "Completed" ? "Completed" : "On Track"
                });
                context.SaveChanges();
            }

            return proj;
        }

        private static FinancialAccount EnsureAccount(GrindSetDbContext context, int projectId, string name, decimal allocated, decimal balance)
        {
            var existing = context.FinancialAccounts.FirstOrDefault(a => a.ProjectId == projectId && a.AccountName == name);
            if (existing != null) return existing;

            var acc = new FinancialAccount
            {
                ProjectId = projectId,
                AccountName = name,
                AllocatedBudget = allocated,
                CurrentBalance = balance
            };
            context.FinancialAccounts.Add(acc);
            context.SaveChanges();
            return acc;
        }

        private static void EnsureTransaction(GrindSetDbContext context, int accountId, int employeeId, string type, decimal amount, string status, string note, DateTime date)
        {
            var existing = context.Transactions.FirstOrDefault(t => t.AccountId == accountId && t.Type == type && t.Amount == amount && t.Note == note);
            if (existing != null) return;

            context.Transactions.Add(new Transaction
            {
                AccountId = accountId,
                LoggedByEmployeeId = employeeId,
                Type = type,
                Amount = amount,
                Status = status,
                Note = note,
                TransactionDate = date
            });
            context.SaveChanges();
        }

        private static void EnsureAssignment(GrindSetDbContext context, int projectId, int employeeId, string role)
        {
            var existing = context.ProjectAssignments.FirstOrDefault(a => a.ProjectId == projectId && a.EmployeeId == employeeId);
            if (existing != null) return;

            context.ProjectAssignments.Add(new ProjectAssignment
            {
                ProjectId = projectId,
                EmployeeId = employeeId,
                RoleInProject = role
            });
            context.SaveChanges();
        }

        private static void EnsureTask(GrindSetDbContext context, int projectId, int? assigneeId, string title, string desc, string priority, string status, int storyPoints)
        {
            var existing = context.Tasks.FirstOrDefault(t => t.ProjectId == projectId && t.Title == title);
            if (existing != null) return;

            context.Tasks.Add(new TaskItem
            {
                ProjectId = projectId,
                AssigneeId = assigneeId,
                Title = title,
                Description = desc,
                Priority = priority,
                Status = status,
                StoryPoints = storyPoints,
                CreatedAt = DateTime.UtcNow
            });
            context.SaveChanges();
        }

        private static void EnsureChatMessage(GrindSetDbContext context, int projectId, int senderUserId, string senderName, string senderRole, string messageText, DateTime sentAt)
        {
            var existing = context.ProjectChatMessages.FirstOrDefault(m => m.ProjectId == projectId && m.SenderUserId == senderUserId && m.MessageText == messageText);
            if (existing != null) return;

            var user = context.Users.FirstOrDefault(u => u.UserId == senderUserId);
            string senderEmail = user?.Email ?? "";

            context.ProjectChatMessages.Add(new ProjectChatMessage
            {
                ProjectId = projectId,
                SenderUserId = senderUserId,
                SenderName = senderName,
                SenderEmail = senderEmail,
                SenderRole = senderRole,
                MessageText = messageText,
                SentAt = sentAt
            });
            context.SaveChanges();
        }

        private static void EnsureAuditLog(GrindSetDbContext context, int userId, string action, string targetEntity, DateTime eventTime)
        {
            var existing = context.SecurityAuditLogs.FirstOrDefault(a => a.UserId == userId && a.Action == action && a.TargetEntity == targetEntity);
            if (existing != null) return;

            context.SecurityAuditLogs.Add(new SecurityAuditLog
            {
                UserId = userId,
                Action = action,
                TargetEntity = targetEntity,
                EventTime = eventTime
            });
            context.SaveChanges();
        }
    }
}
