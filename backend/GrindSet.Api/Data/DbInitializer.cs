using System;
using System.Linq;
using GrindSet.Api.Models;

namespace GrindSet.Api.Data
{
    public static class DbInitializer
    {
        public static void Initialize(GrindSetDbContext context)
        {
            // Ensure Database is created automatically
            context.Database.EnsureCreated();

            // Seed Users if not existing
            if (!context.Users.Any())
            {
                var adminUser = new User { Email = "admin@grindset.io", PasswordHash = "AQAAAAEAACcQAAAAEHASH123==", Role = "Admin", IsActive = true, ApprovalStatus = "Approved" };
                var companyUser = new User { Email = "corp@acmeglobal.com", PasswordHash = "AQAAAAEAACcQAAAAEHASH456==", Role = "Company", IsActive = true, ApprovalStatus = "Approved" };
                var empUser1 = new User { Email = "john.dev@grindset.io", PasswordHash = "AQAAAAEAACcQAAAAEHASH789==", Role = "Employee", IsActive = true, ApprovalStatus = "Approved" };
                var empUser2 = new User { Email = "sarah.pm@grindset.io", PasswordHash = "AQAAAAEAACcQAAAAEHASH999==", Role = "Employee", IsActive = true, ApprovalStatus = "Approved" };

                context.Users.AddRange(adminUser, companyUser, empUser1, empUser2);
                context.SaveChanges();

                // Seed Admin details
                context.Admins.Add(new Admin { AdminId = adminUser.UserId, FullName = "Chief System Administrator", AccessLevel = "SuperAdmin" });

                // Seed Company details
                context.Companies.Add(new Company { CompanyId = companyUser.UserId, CompanyName = "Acme Global Technologies", RegistrationNo = "REG-884920", Industry = "Enterprise Software", LicenseStatus = "Active" });

                context.SaveChanges();

                // Seed Department
                var dept = new Department { CompanyId = companyUser.UserId, DepartmentName = "Engineering & Infrastructure" };
                context.Departments.Add(dept);
                context.SaveChanges();

                // Seed Employees
                var emp1 = new Employee { EmployeeId = empUser1.UserId, CompanyId = companyUser.UserId, DepartmentId = dept.DepartmentId, FullName = "John Doe", Designation = "Senior Full-Stack Engineer", HourlyRate = 95.00m };
                var emp2 = new Employee { EmployeeId = empUser2.UserId, CompanyId = companyUser.UserId, DepartmentId = dept.DepartmentId, FullName = "Sarah Connor", Designation = "Lead Project Manager", HourlyRate = 110.00m };
                context.Employees.AddRange(emp1, emp2);

                // Seed Project
                var proj = new Project { CompanyId = companyUser.UserId, ProjectName = "Core ERP Platform v1.0", Status = "In Progress", TotalBudget = 250000.00m };
                context.Projects.Add(proj);
                context.SaveChanges();

                // Seed Project Scope & Timeline
                context.ProjectScopes.Add(new ProjectScope { ProjectId = proj.ProjectId, ScopeDescription = "Full enterprise project management & financial logging system.", Objectives = "Deliver 3-tier RBAC, EF Core SQLite DB, and React dashboard." });
                context.ProjectTimelines.Add(new ProjectTimeline { ProjectId = proj.ProjectId, PlannedStart = DateTime.UtcNow.AddDays(-30), PlannedEnd = DateTime.UtcNow.AddDays(90), Status = "On Track" });

                // Seed Multiple Financial Accounts
                var finAcc1 = new FinancialAccount { ProjectId = proj.ProjectId, AccountName = "Engineering & Core Infrastructure", AllocatedBudget = 150000.00m, CurrentBalance = 112500.00m };
                var finAcc2 = new FinancialAccount { ProjectId = proj.ProjectId, AccountName = "Cloud DevOps & AWS Services", AllocatedBudget = 60000.00m, CurrentBalance = 42000.00m };
                var finAcc3 = new FinancialAccount { ProjectId = proj.ProjectId, AccountName = "R&D & Security Compliance Audit", AllocatedBudget = 40000.00m, CurrentBalance = 35000.00m };

                context.FinancialAccounts.AddRange(finAcc1, finAcc2, finAcc3);
                context.SaveChanges();

                // Seed Transactions (Approved Expenses & Pending Employee Claims)
                context.Transactions.AddRange(
                    new Transaction { AccountId = finAcc1.AccountId, LoggedByEmployeeId = emp1.EmployeeId, Type = "Server Hardware Purchase", Amount = 12500.00m, Status = "Approved", Note = "Quarterly rack server upgrade", TransactionDate = DateTime.UtcNow.AddDays(-14) },
                    new Transaction { AccountId = finAcc2.AccountId, LoggedByEmployeeId = emp1.EmployeeId, Type = "Cloud AWS Bill", Amount = 4500.00m, Status = "Approved", Note = "Monthly production cluster hosting", TransactionDate = DateTime.UtcNow.AddDays(-5) },
                    new Transaction { AccountId = finAcc1.AccountId, LoggedByEmployeeId = emp2.EmployeeId, Type = "Developer Workstation Equipment", Amount = 2850.00m, Status = "PendingApproval", Note = "MacBook Pro M3 Pro reimbursement claim", TransactionDate = DateTime.UtcNow.AddDays(-1) },
                    new Transaction { AccountId = finAcc3.AccountId, LoggedByEmployeeId = emp2.EmployeeId, Type = "Security Penetration Test Audit", Amount = 5000.00m, Status = "PendingApproval", Note = "SOC2 audit fee claim", TransactionDate = DateTime.UtcNow }
                );

                // Seed Inter-Account Fund Reallocation
                context.FundReallocations.Add(new FundReallocation { ProjectId = proj.ProjectId, AccountId = finAcc1.AccountId, TargetAccountId = finAcc2.AccountId, Amount = 15000.00m, Reason = "Reallocate surplus hardware budget to AWS Cloud expansion", CreatedAt = DateTime.UtcNow.AddDays(-10) });

                // Seed Budget Alert
                context.BudgetAlerts.Add(new BudgetAlert { ProjectId = proj.ProjectId, AccountId = finAcc2.AccountId, AlertType = "80% Threshold Reached", ActualAmount = 18000.00m, Status = "Active" });

                context.SecurityAuditLogs.Add(new SecurityAuditLog { UserId = adminUser.UserId, Action = "INITIALIZE_DATABASE", TargetEntity = "System", EventTime = DateTime.UtcNow });

                // Seed Project-Bound Tasks
                context.Tasks.AddRange(
                    new TaskItem { ProjectId = proj.ProjectId, AssigneeId = empUser1.UserId, Title = "Implement RBAC Workflows & Role Guards", Description = "Enforce 3-tier RBAC protection across all endpoints & pages.", Priority = "High", Status = "In Progress", StoryPoints = 5 },
                    new TaskItem { ProjectId = proj.ProjectId, AssigneeId = empUser1.UserId, Title = "Configure SQLite EF Core Task Entity", Description = "Add TaskItem model with FK to ProjectId.", Priority = "Highest", Status = "Done", StoryPoints = 3 },
                    new TaskItem { ProjectId = proj.ProjectId, AssigneeId = empUser2.UserId, Title = "Design Command Palette Ctrl+K Modal", Description = "Spotlight search modal for instant navigation.", Priority = "High", Status = "To Do", StoryPoints = 3 },
                    new TaskItem { ProjectId = proj.ProjectId, AssigneeId = empUser2.UserId, Title = "Audit Financial Ledger Exports", Description = "PDF and CSV exports for quarterly P&L statement.", Priority = "Medium", Status = "To Do", StoryPoints = 2 }
                );

                context.SaveChanges();
            }
        }
    }
}
