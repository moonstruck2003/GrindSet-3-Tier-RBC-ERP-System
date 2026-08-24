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
                var adminUser = new User { Email = "admin@grindset.io", PasswordHash = "AQAAAAEAACcQAAAAEHASH123==", Role = "Admin", IsActive = true };
                var companyUser = new User { Email = "corp@acmeglobal.com", PasswordHash = "AQAAAAEAACcQAAAAEHASH456==", Role = "Company", IsActive = true };
                var empUser1 = new User { Email = "john.dev@grindset.io", PasswordHash = "AQAAAAEAACcQAAAAEHASH789==", Role = "Employee", IsActive = true };
                var empUser2 = new User { Email = "sarah.pm@grindset.io", PasswordHash = "AQAAAAEAACcQAAAAEHASH999==", Role = "Employee", IsActive = true };

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

                // Seed Financial Account & Transaction
                var finAcc = new FinancialAccount { ProjectId = proj.ProjectId, AccountName = "Engineering Operations", AllocatedBudget = 150000.00m, CurrentBalance = 112500.00m };
                context.FinancialAccounts.Add(finAcc);
                context.SaveChanges();

                context.Transactions.Add(new Transaction { AccountId = finAcc.AccountId, LoggedByEmployeeId = emp1.EmployeeId, Type = "Infrastructure Cloud Expense", Amount = 4500.00m, TransactionDate = DateTime.UtcNow });
                context.SecurityAuditLogs.Add(new SecurityAuditLog { UserId = adminUser.UserId, Action = "INITIALIZE_DATABASE", TargetEntity = "System", EventTime = DateTime.UtcNow });

                context.SaveChanges();
            }
        }
    }
}
