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

                // Seed Projects (3 Distinct Enterprise Projects)
                var proj1 = new Project { CompanyId = companyUser.UserId, ProjectName = "Core ERP Platform v1.0", Status = "In Progress", TotalBudget = 250000.00m };
                var proj2 = new Project { CompanyId = companyUser.UserId, ProjectName = "AI Predictive Analytics Suite", Status = "In Progress", TotalBudget = 180000.00m };
                var proj3 = new Project { CompanyId = companyUser.UserId, ProjectName = "Mobile Workforce iOS & Android", Status = "Planned", TotalBudget = 120000.00m };
                context.Projects.AddRange(proj1, proj2, proj3);
                context.SaveChanges();

                // Seed Project Scopes
                context.ProjectScopes.AddRange(
                    new ProjectScope { ProjectId = proj1.ProjectId, ScopeDescription = "Full enterprise project management & financial logging system.", Objectives = "Deliver 3-tier RBAC, EF Core SQLite DB, and React dashboard." },
                    new ProjectScope { ProjectId = proj2.ProjectId, ScopeDescription = "Machine learning predictive model for workforce allocation.", Objectives = "Train GPU cluster models & deploy REST inference API." },
                    new ProjectScope { ProjectId = proj3.ProjectId, ScopeDescription = "Cross-platform mobile application for field employees.", Objectives = "Implement offline timesheet syncing & push notifications." }
                );

                // Seed Financial Accounts across Projects
                // Project 1 Accounts
                var finAcc1 = new FinancialAccount { ProjectId = proj1.ProjectId, AccountName = "Engineering & Core Infrastructure", AllocatedBudget = 150000.00m, CurrentBalance = 112500.00m };
                var finAcc2 = new FinancialAccount { ProjectId = proj1.ProjectId, AccountName = "Cloud DevOps & AWS Services", AllocatedBudget = 60000.00m, CurrentBalance = 42000.00m };
                var finAcc3 = new FinancialAccount { ProjectId = proj1.ProjectId, AccountName = "R&D & Security Compliance Audit", AllocatedBudget = 40000.00m, CurrentBalance = 35000.00m };

                // Project 2 Accounts
                var finAcc4 = new FinancialAccount { ProjectId = proj2.ProjectId, AccountName = "Machine Learning GPU Training Cluster", AllocatedBudget = 100000.00m, CurrentBalance = 78000.00m };
                var finAcc5 = new FinancialAccount { ProjectId = proj2.ProjectId, AccountName = "Data Pipeline & Analytics Storage", AllocatedBudget = 50000.00m, CurrentBalance = 31500.00m };
                var finAcc6 = new FinancialAccount { ProjectId = proj2.ProjectId, AccountName = "AI Ethics & Model Validation Audit", AllocatedBudget = 30000.00m, CurrentBalance = 28000.00m };

                // Project 3 Accounts
                var finAcc7 = new FinancialAccount { ProjectId = proj3.ProjectId, AccountName = "Mobile UI/UX Design System", AllocatedBudget = 45000.00m, CurrentBalance = 38000.00m };
                var finAcc8 = new FinancialAccount { ProjectId = proj3.ProjectId, AccountName = "App Store & Mobile QA Testing", AllocatedBudget = 40000.00m, CurrentBalance = 29000.00m };

                context.FinancialAccounts.AddRange(finAcc1, finAcc2, finAcc3, finAcc4, finAcc5, finAcc6, finAcc7, finAcc8);
                context.SaveChanges();

                // Seed Transactions across Projects
                context.Transactions.AddRange(
                    // Project 1
                    new Transaction { AccountId = finAcc1.AccountId, LoggedByEmployeeId = emp1.EmployeeId, Type = "Server Hardware Purchase", Amount = 12500.00m, Status = "Approved", Note = "Quarterly rack server upgrade", TransactionDate = DateTime.UtcNow.AddDays(-14) },
                    new Transaction { AccountId = finAcc2.AccountId, LoggedByEmployeeId = emp1.EmployeeId, Type = "Cloud AWS Bill", Amount = 4500.00m, Status = "Approved", Note = "Monthly production cluster hosting", TransactionDate = DateTime.UtcNow.AddDays(-5) },
                    new Transaction { AccountId = finAcc1.AccountId, LoggedByEmployeeId = emp2.EmployeeId, Type = "Developer Workstation Equipment", Amount = 2850.00m, Status = "PendingApproval", Note = "MacBook Pro M3 Pro reimbursement claim", TransactionDate = DateTime.UtcNow.AddDays(-1) },
                    new Transaction { AccountId = finAcc3.AccountId, LoggedByEmployeeId = emp2.EmployeeId, Type = "Security Penetration Test Audit", Amount = 5000.00m, Status = "PendingApproval", Note = "SOC2 audit fee claim", TransactionDate = DateTime.UtcNow },

                    // Project 2
                    new Transaction { AccountId = finAcc4.AccountId, LoggedByEmployeeId = emp1.EmployeeId, Type = "NVIDIA A100 GPU Compute Cluster", Amount = 22000.00m, Status = "Approved", Note = "Deep learning model training run", TransactionDate = DateTime.UtcNow.AddDays(-10) },
                    new Transaction { AccountId = finAcc5.AccountId, LoggedByEmployeeId = emp2.EmployeeId, Type = "Snowflake Data Warehouse License", Amount = 18500.00m, Status = "Approved", Note = "Annual analytics data lake license", TransactionDate = DateTime.UtcNow.AddDays(-3) },
                    new Transaction { AccountId = finAcc4.AccountId, LoggedByEmployeeId = emp1.EmployeeId, Type = "PyTorch Enterprise Support", Amount = 3500.00m, Status = "PendingApproval", Note = "ML framework support subscription claim", TransactionDate = DateTime.UtcNow.AddHours(-4) },

                    // Project 3
                    new Transaction { AccountId = finAcc7.AccountId, LoggedByEmployeeId = emp2.EmployeeId, Type = "Figma Enterprise License", Amount = 7000.00m, Status = "Approved", Note = "Mobile design system assets", TransactionDate = DateTime.UtcNow.AddDays(-8) },
                    new Transaction { AccountId = finAcc8.AccountId, LoggedByEmployeeId = emp1.EmployeeId, Type = "BrowserStack Mobile Device Cloud", Amount = 11000.00m, Status = "PendingApproval", Note = "Automated iOS/Android testing cloud claim", TransactionDate = DateTime.UtcNow.AddDays(-2) }
                );

                // Seed Inter-Account Fund Reallocations
                context.FundReallocations.AddRange(
                    new FundReallocation { ProjectId = proj1.ProjectId, AccountId = finAcc1.AccountId, TargetAccountId = finAcc2.AccountId, Amount = 15000.00m, Reason = "Reallocate surplus hardware budget to AWS Cloud expansion", CreatedAt = DateTime.UtcNow.AddDays(-10) },
                    new FundReallocation { ProjectId = proj2.ProjectId, AccountId = finAcc4.AccountId, TargetAccountId = finAcc5.AccountId, Amount = 8000.00m, Reason = "Transfer compute savings to analytics data storage pool", CreatedAt = DateTime.UtcNow.AddDays(-4) }
                );

                // Seed Budget Alert
                context.BudgetAlerts.Add(new BudgetAlert { ProjectId = proj1.ProjectId, AccountId = finAcc2.AccountId, AlertType = "80% Threshold Reached", ActualAmount = 18000.00m, Status = "Active" });

                context.SecurityAuditLogs.Add(new SecurityAuditLog { UserId = adminUser.UserId, Action = "INITIALIZE_DATABASE", TargetEntity = "System", EventTime = DateTime.UtcNow });

                // Seed Project-Bound Tasks
                context.Tasks.AddRange(
                    new TaskItem { ProjectId = proj1.ProjectId, AssigneeId = empUser1.UserId, Title = "Implement RBAC Workflows & Role Guards", Description = "Enforce 3-tier RBAC protection across all endpoints & pages.", Priority = "High", Status = "In Progress", StoryPoints = 5 },
                    new TaskItem { ProjectId = proj1.ProjectId, AssigneeId = empUser1.UserId, Title = "Configure SQLite EF Core Task Entity", Description = "Add TaskItem model with FK to ProjectId.", Priority = "Highest", Status = "Done", StoryPoints = 3 },
                    new TaskItem { ProjectId = proj2.ProjectId, AssigneeId = empUser2.UserId, Title = "Train AI Workforce Allocation Model", Description = "Fine-tune model on historical project velocity data.", Priority = "High", Status = "In Progress", StoryPoints = 8 },
                    new TaskItem { ProjectId = proj3.ProjectId, AssigneeId = empUser2.UserId, Title = "Design Offline Timesheet Mobile Sync", Description = "Implement local SQLite sync for mobile app.", Priority = "Medium", Status = "To Do", StoryPoints = 5 }
                );

                context.SaveChanges();
            }
        }
    }
}
