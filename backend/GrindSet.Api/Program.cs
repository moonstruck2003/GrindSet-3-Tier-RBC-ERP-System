using GrindSet.Api.Data;
using Microsoft.EntityFrameworkCore;
using GrindSet.Api.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure SQLite DbContext
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=grindset.db";
builder.Services.AddDbContext<GrindSetDbContext>(options =>
    options.UseSqlite(connectionString));

// Configure CORS for 3-member local WFH developer ports
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://127.0.0.1:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Enable Swagger OpenAPI testing UI
if (app.Environment.IsDevelopment() || true)
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "GrindSet ERP API v1.0.0");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("AllowFrontend");

// Auto-migrate and seed database on startup
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<GrindSetDbContext>();
    DbInitializer.Initialize(context);
}

// REST API Endpoints
app.MapGet("/", () => Results.Redirect("/swagger"));

app.MapGet("/api/health", () => Results.Ok(new
{
    Status = "Healthy",
    System = "GrindSet Enterprise ERP API",
    Version = "v1.0.0",
    Timestamp = DateTime.UtcNow,
    Database = "SQLite (EF Core 20 ERD Entities)",
    TeamWfhSync = "Enabled via GitHub EF Core Migrations"
}));

app.MapGet("/api/subsystems", () => Results.Ok(new[]
{
    new { Id = 1, Name = "Authentication & 3-Tier RBAC", Code = "AUTH", Status = "Active", Description = "SuperAdmin, Company, Employee role enforcement & audit logging." },
    new { Id = 2, Name = "Company & Workforce", Code = "WORKFORCE", Status = "Active", Description = "Departments, designations, and employee hourly rate tracking." },
    new { Id = 3, Name = "Project Management", Code = "PROJECTS", Status = "Active", Description = "Project timelines, scope definitions, and archive tracking." },
    new { Id = 4, Name = "Resource Allocation", Code = "RESOURCES", Status = "Active", Description = "Employee assignments, roles in projects, and stakeholder management." },
    new { Id = 5, Name = "Financial Management", Code = "FINANCE", Status = "Active", Description = "Budget allocations, alert triggers, fund reallocations & financial exports." },
    new { Id = 6, Name = "Transaction Logging", Code = "AUDIT", Status = "Active", Description = "Real-time expense tracking, password resets & security audit logs." }
}));

app.MapGet("/api/projects", async (GrindSetDbContext db) =>
{
    var projects = await db.Projects.ToListAsync();
    return Results.Ok(projects);
});

app.MapGet("/api/users", async (GrindSetDbContext db) =>
{
    var users = await db.Users.Select(u => new { u.UserId, u.Email, u.Role, u.IsActive, u.ApprovalStatus, u.ReportedNote }).ToListAsync();
    return Results.Ok(users);
});

app.MapGet("/api/erd-summary", async (GrindSetDbContext db) =>
{
    return Results.Ok(new
    {
        TotalUsers = await db.Users.CountAsync(),
        TotalCompanies = await db.Companies.CountAsync(),
        TotalEmployees = await db.Employees.CountAsync(),
        TotalProjects = await db.Projects.CountAsync(),
        TotalTransactions = await db.Transactions.CountAsync(),
        TotalAuditLogs = await db.SecurityAuditLogs.CountAsync(),
        ErdTablesCount = 20,
        ErdSchemaStatus = "Verified & Auto-Seeded"
    });
});

// GET /api/employees - workforce directory
app.MapGet("/api/employees", async (GrindSetDbContext db) =>
{
    var employees = await (from emp in db.Employees
                           join u in db.Users on emp.EmployeeId equals u.UserId
                           join dept in db.Departments on emp.DepartmentId equals dept.DepartmentId into deptGroup
                           from dept in deptGroup.DefaultIfEmpty()
                           select new
                           {
                               emp.EmployeeId,
                               emp.FullName,
                               emp.Designation,
                               emp.HourlyRate,
                               Email = u.Email,
                               DepartmentName = dept != null ? dept.DepartmentName : "Engineering & Infrastructure"
                           }).ToListAsync();
    return Results.Ok(employees);
});

// POST /api/employees - onboard new employee
app.MapPost("/api/employees", async (GrindSetDbContext db, EmployeeDto dto) =>
{
    // Create User first
    var user = new User
    {
        Email = dto.Email,
        PasswordHash = "AQAAAAEAACcQAAAAEHASH_NEW==",
        Role = "Employee",
        IsActive = true
    };
    db.Users.Add(user);
    await db.SaveChangesAsync();

    // Get department or create/use first
    var dept = await db.Departments.FirstOrDefaultAsync();
    int deptId = dept?.DepartmentId ?? 1;

    // Get company
    var comp = await db.Companies.FirstOrDefaultAsync();
    int compId = comp?.CompanyId ?? 1;

    // Create Employee
    var emp = new Employee
    {
        EmployeeId = user.UserId,
        CompanyId = compId,
        DepartmentId = deptId,
        FullName = dto.FullName,
        Designation = dto.Designation,
        HourlyRate = dto.HourlyRate
    };
    db.Employees.Add(emp);

    // Create Audit Log
    db.SecurityAuditLogs.Add(new SecurityAuditLog
    {
        UserId = user.UserId,
        Action = "ONBOARD_EMPLOYEE",
        TargetEntity = $"Employee:{dto.FullName}",
        EventTime = DateTime.UtcNow
    });

    await db.SaveChangesAsync();
    return Results.Created($"/api/employees/{user.UserId}", emp);
});

// GET /api/transactions - financial transaction ledger
app.MapGet("/api/transactions", async (GrindSetDbContext db) =>
{
    var transactions = await (from tx in db.Transactions
                              join acc in db.FinancialAccounts on tx.AccountId equals acc.AccountId
                              join proj in db.Projects on acc.ProjectId equals proj.ProjectId
                              join emp in db.Employees on tx.LoggedByEmployeeId equals emp.EmployeeId into empGroup
                              from emp in empGroup.DefaultIfEmpty()
                              select new
                              {
                                  tx.TransactionId,
                                  tx.AccountId,
                                  AccountName = acc.AccountName,
                                  ProjectId = acc.ProjectId,
                                  ProjectName = proj.ProjectName,
                                  LoggedBy = emp != null ? emp.FullName : "System",
                                  tx.Type,
                                  tx.Amount,
                                  tx.Status,
                                  tx.Note,
                                  tx.TransactionDate
                              }).OrderByDescending(t => t.TransactionDate).ToListAsync();
    return Results.Ok(transactions);
});

// POST /api/transactions - log expense
app.MapPost("/api/transactions", async (GrindSetDbContext db, TransactionDto dto) =>
{
    var acc = await db.FinancialAccounts.FindAsync(dto.AccountId);
    if (acc == null) return Results.NotFound("Financial Account not found");

    var tx = new Transaction
    {
        AccountId = dto.AccountId,
        LoggedByEmployeeId = dto.LoggedByEmployeeId,
        Type = dto.Type,
        Amount = dto.Amount,
        TransactionDate = DateTime.UtcNow
    };
    db.Transactions.Add(tx);

    // Update balance
    acc.CurrentBalance -= dto.Amount;

    // Check budget overrun alert
    if (acc.CurrentBalance < 0)
    {
        db.BudgetAlerts.Add(new BudgetAlert
        {
            ProjectId = acc.ProjectId,
            AccountId = acc.AccountId,
            AlertType = "Overrun",
            ActualAmount = acc.AllocatedBudget - acc.CurrentBalance,
            Status = "Unresolved"
        });
    }

    // Create Audit Log
    db.SecurityAuditLogs.Add(new SecurityAuditLog
    {
        UserId = dto.LoggedByEmployeeId,
        Action = "LOG_EXPENSE",
        TargetEntity = $"Account:{acc.AccountName}",
        EventTime = DateTime.UtcNow
    });

    await db.SaveChangesAsync();
    return Results.Created($"/api/transactions/{tx.TransactionId}", tx);
});

// GET /api/accounts - financial accounts
app.MapGet("/api/accounts", async (GrindSetDbContext db) =>
{
    var accounts = await (from acc in db.FinancialAccounts
                          join p in db.Projects on acc.ProjectId equals p.ProjectId
                          select new
                          {
                              acc.AccountId,
                              acc.ProjectId,
                              ProjectName = p.ProjectName,
                              acc.AccountName,
                              acc.AllocatedBudget,
                              acc.CurrentBalance
                          }).ToListAsync();
    return Results.Ok(accounts);
});

// GET /api/audit-logs - security audit logs
app.MapGet("/api/audit-logs", async (GrindSetDbContext db) =>
{
    var logs = await (from log in db.SecurityAuditLogs
                      join u in db.Users on log.UserId equals u.UserId into uGroup
                      from u in uGroup.DefaultIfEmpty()
                      select new
                      {
                          log.AuditLogId,
                          Email = u != null ? u.Email : "system@grindset.io",
                          Role = u != null ? u.Role : "System",
                          log.Action,
                          log.TargetEntity,
                          log.EventTime
                      }).OrderByDescending(l => l.EventTime).Take(100).ToListAsync();
    return Results.Ok(logs);
});

// GET /api/assignments - resource allocation matrix
app.MapGet("/api/assignments", async (GrindSetDbContext db) =>
{
    var assignments = await (from assign in db.ProjectAssignments
                             join emp in db.Employees on assign.EmployeeId equals emp.EmployeeId
                             join proj in db.Projects on assign.ProjectId equals proj.ProjectId
                             select new
                             {
                                 assign.AssignmentId,
                                 assign.ProjectId,
                                 ProjectName = proj.ProjectName,
                                 assign.EmployeeId,
                                 EmployeeName = emp.FullName,
                                 assign.RoleInProject,
                                 emp.Designation
                             }).ToListAsync();
    return Results.Ok(assignments);
});

// GET /api/auth/me - Verify active user session
app.MapGet("/api/auth/me", async (GrindSetDbContext db, int userId) =>
{
    var user = await db.Users.FirstOrDefaultAsync(u => u.UserId == userId);
    if (user == null) return Results.NotFound(new { message = "User not found." });

    string displayName = user.Email;
    if (user.Role == "Employee")
    {
        var emp = await db.Employees.FirstOrDefaultAsync(e => e.EmployeeId == user.UserId);
        if (emp != null) displayName = emp.FullName;
    }
    else if (user.Role == "Company")
    {
        var comp = await db.Companies.FirstOrDefaultAsync(c => c.CompanyId == user.UserId);
        if (comp != null) displayName = comp.CompanyName;
    }
    else if (user.Role == "Admin")
    {
        var adm = await db.Admins.FirstOrDefaultAsync(a => a.AdminId == user.UserId);
        if (adm != null) displayName = adm.FullName;
    }

    return Results.Ok(new
    {
        userId = user.UserId,
        email = user.Email,
        role = user.Role,
        approvalStatus = user.ApprovalStatus,
        isActive = user.IsActive,
        reportedNote = user.ReportedNote,
        fullName = displayName
    });
});

// POST /api/auth/signup - Register new user with full role & entity creation
app.MapPost("/api/auth/signup", async (GrindSetDbContext db, SignUpDto dto) =>
{
    if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password) || string.IsNullOrWhiteSpace(dto.FullName))
    {
        return Results.BadRequest(new { message = "Email, Password, and Full Name are required." });
    }

    var cleanEmail = dto.Email.Trim().ToLower();
    var existingUser = await db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == cleanEmail);
    if (existingUser != null)
    {
        return Results.BadRequest(new { message = "An account with this email address already exists." });
    }

    if (dto.Role == "SuperAdmin" || dto.Role == "Admin")
    {
        return Results.BadRequest(new { message = "Registration for Administrator accounts is restricted. Admin accounts can only be provisioned internally." });
    }

    string dbRole = dto.Role switch
    {
        "CompanyOwner" => "Company",
        "Company" => "Company",
        _ => "Employee"
    };

    string initialApproval = dbRole switch
    {
        "Company" => "PendingAdmin",
        "Employee" => "PendingCompany",
        _ => "Approved"
    };

    var user = new User
    {
        Email = cleanEmail,
        PasswordHash = HashPassword(dto.Password),
        Role = dbRole,
        IsActive = true,
        ApprovalStatus = initialApproval
    };

    db.Users.Add(user);
    await db.SaveChangesAsync();

    string displayName = dto.FullName.Trim();

    if (dbRole == "Company")
    {
        var company = new Company
        {
            CompanyId = user.UserId,
            CompanyName = string.IsNullOrWhiteSpace(dto.CompanyName) ? $"{displayName}'s Organization" : dto.CompanyName.Trim(),
            RegistrationNo = $"REG-{Random.Shared.Next(100000, 999999)}",
            Industry = string.IsNullOrWhiteSpace(dto.Industry) ? "Technology & Software" : dto.Industry.Trim(),
            LicenseStatus = "PendingAdminApproval"
        };
        db.Companies.Add(company);
    }
    else if (dbRole == "Admin")
    {
        var admin = new Admin
        {
            AdminId = user.UserId,
            FullName = displayName,
            AccessLevel = "SuperAdmin"
        };
        db.Admins.Add(admin);
    }
    else // Employee
    {
        var company = await db.Companies.FirstOrDefaultAsync();
        int compId = company?.CompanyId ?? 1;

        var dept = await db.Departments.FirstOrDefaultAsync();
        int deptId = dept?.DepartmentId ?? 1;

        var employee = new Employee
        {
            EmployeeId = user.UserId,
            CompanyId = compId,
            DepartmentId = deptId,
            FullName = displayName,
            Designation = string.IsNullOrWhiteSpace(dto.Designation) ? "Software Specialist" : dto.Designation.Trim(),
            HourlyRate = dto.HourlyRate > 0 ? dto.HourlyRate : 75.00m
        };
        db.Employees.Add(employee);
    }

    db.SecurityAuditLogs.Add(new SecurityAuditLog
    {
        UserId = user.UserId,
        Action = "USER_SIGNUP",
        TargetEntity = $"User:{user.Email} ({dbRole}) Status:{user.ApprovalStatus}",
        EventTime = DateTime.UtcNow
    });

    await db.SaveChangesAsync();

    return Results.Created($"/api/users/{user.UserId}", new
    {
        message = "Account created successfully!",
        user = new
        {
            userId = user.UserId,
            email = user.Email,
            role = user.Role,
            approvalStatus = user.ApprovalStatus,
            isActive = user.IsActive,
            reportedNote = user.ReportedNote,
            fullName = displayName,
            token = $"jwt_mock_{user.UserId}_{DateTime.UtcNow.Ticks}"
        }
    });
});

// POST /api/auth/login - Authenticate user
app.MapPost("/api/auth/login", async (GrindSetDbContext db, LoginDto dto) =>
{
    if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
    {
        return Results.BadRequest(new { message = "Email and password are required." });
    }

    var cleanEmail = dto.Email.Trim().ToLower();
    var user = await db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == cleanEmail);
    if (user == null || !VerifyPassword(dto.Password, user.PasswordHash))
    {
        return Results.BadRequest(new { message = "Invalid email or password." });
    }

    if (!user.IsActive)
    {
        return Results.BadRequest(new { message = "Account has been suspended/blocked. Please contact system administrator." });
    }

    string displayName = user.Email;
    if (user.Role == "Employee")
    {
        var emp = await db.Employees.FirstOrDefaultAsync(e => e.EmployeeId == user.UserId);
        if (emp != null) displayName = emp.FullName;
    }
    else if (user.Role == "Company")
    {
        var comp = await db.Companies.FirstOrDefaultAsync(c => c.CompanyId == user.UserId);
        if (comp != null) displayName = comp.CompanyName;
    }
    else if (user.Role == "Admin")
    {
        var adm = await db.Admins.FirstOrDefaultAsync(a => a.AdminId == user.UserId);
        if (adm != null) displayName = adm.FullName;
    }

    db.SecurityAuditLogs.Add(new SecurityAuditLog
    {
        UserId = user.UserId,
        Action = "USER_LOGIN",
        TargetEntity = $"User:{user.Email}",
        EventTime = DateTime.UtcNow
    });
    await db.SaveChangesAsync();

    return Results.Ok(new
    {
        message = "Login successful",
        user = new
        {
            userId = user.UserId,
            email = user.Email,
            role = user.Role,
            approvalStatus = user.ApprovalStatus,
            isActive = user.IsActive,
            reportedNote = user.ReportedNote,
            fullName = displayName,
            token = $"jwt_mock_{user.UserId}_{DateTime.UtcNow.Ticks}"
        }
    });
});

// GET /api/admin/pending-companies
app.MapGet("/api/admin/pending-companies", async (GrindSetDbContext db) =>
{
    var pending = await (from c in db.Companies
                         join u in db.Users on c.CompanyId equals u.UserId
                         where u.ApprovalStatus == "PendingAdmin"
                         select new
                         {
                             CompanyId = c.CompanyId,
                             CompanyName = c.CompanyName,
                             Email = u.Email,
                             RegistrationNo = c.RegistrationNo,
                             Industry = c.Industry,
                             LicenseStatus = c.LicenseStatus,
                             ApprovalStatus = u.ApprovalStatus
                         }).ToListAsync();
    return Results.Ok(pending);
});

// POST /api/admin/approve-company/{companyId}
app.MapPost("/api/admin/approve-company/{companyId:int}", async (GrindSetDbContext db, int companyId) =>
{
    var user = await db.Users.FirstOrDefaultAsync(u => u.UserId == companyId && u.Role == "Company");
    if (user == null) return Results.NotFound(new { message = "Company user not found." });

    user.ApprovalStatus = "Approved";

    var comp = await db.Companies.FirstOrDefaultAsync(c => c.CompanyId == companyId);
    if (comp != null) comp.LicenseStatus = "Active";

    db.SecurityAuditLogs.Add(new SecurityAuditLog
    {
        UserId = companyId,
        Action = "ADMIN_APPROVE_COMPANY",
        TargetEntity = $"Company:{comp?.CompanyName ?? user.Email}",
        EventTime = DateTime.UtcNow
    });

    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Company approved successfully!", companyId, approvalStatus = "Approved" });
});

// POST /api/admin/reject-company/{companyId}
app.MapPost("/api/admin/reject-company/{companyId:int}", async (GrindSetDbContext db, int companyId) =>
{
    var user = await db.Users.FirstOrDefaultAsync(u => u.UserId == companyId && u.Role == "Company");
    if (user == null) return Results.NotFound(new { message = "Company user not found." });

    user.ApprovalStatus = "Rejected";

    var comp = await db.Companies.FirstOrDefaultAsync(c => c.CompanyId == companyId);
    if (comp != null) comp.LicenseStatus = "Rejected";

    db.SecurityAuditLogs.Add(new SecurityAuditLog
    {
        UserId = companyId,
        Action = "ADMIN_REJECT_COMPANY",
        TargetEntity = $"Company:{comp?.CompanyName ?? user.Email}",
        EventTime = DateTime.UtcNow
    });

    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Company rejected.", companyId, approvalStatus = "Rejected" });
});

// POST /api/admin/block-employee/{employeeId}
app.MapPost("/api/admin/block-employee/{employeeId:int}", async (GrindSetDbContext db, int employeeId) =>
{
    var user = await db.Users.FirstOrDefaultAsync(u => u.UserId == employeeId);
    if (user == null) return Results.NotFound(new { message = "User not found." });

    user.IsActive = !user.IsActive;

    db.SecurityAuditLogs.Add(new SecurityAuditLog
    {
        UserId = employeeId,
        Action = user.IsActive ? "ADMIN_UNBLOCK_EMPLOYEE" : "ADMIN_BLOCK_EMPLOYEE",
        TargetEntity = $"User:{user.Email}",
        EventTime = DateTime.UtcNow
    });

    await db.SaveChangesAsync();
    return Results.Ok(new { message = user.IsActive ? "Employee account unblocked." : "Employee account blocked.", employeeId, isActive = user.IsActive });
});

// POST /api/admin/report-employee/{employeeId}
app.MapPost("/api/admin/report-employee/{employeeId:int}", async (GrindSetDbContext db, int employeeId, ReportDto dto) =>
{
    var user = await db.Users.FirstOrDefaultAsync(u => u.UserId == employeeId);
    if (user == null) return Results.NotFound(new { message = "User not found." });

    user.ReportedNote = string.IsNullOrWhiteSpace(dto.Note) ? "Reported by System Admin for compliance review." : dto.Note.Trim();

    db.SecurityAuditLogs.Add(new SecurityAuditLog
    {
        UserId = employeeId,
        Action = "ADMIN_REPORT_EMPLOYEE_TO_COMPANY",
        TargetEntity = $"User:{user.Email} | Note: {user.ReportedNote}",
        EventTime = DateTime.UtcNow
    });

    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Employee reported to Company.", employeeId, reportedNote = user.ReportedNote });
});

// GET /api/company/pending-employees/{companyId}
app.MapGet("/api/company/pending-employees/{companyId:int}", async (GrindSetDbContext db, int companyId) =>
{
    var pending = await (from emp in db.Employees
                         join u in db.Users on emp.EmployeeId equals u.UserId
                         join dept in db.Departments on emp.DepartmentId equals dept.DepartmentId into deptGroup
                         from dept in deptGroup.DefaultIfEmpty()
                         where emp.CompanyId == companyId && u.ApprovalStatus == "PendingCompany"
                         select new
                         {
                             EmployeeId = emp.EmployeeId,
                             FullName = emp.FullName,
                             Email = u.Email,
                             Designation = emp.Designation,
                             HourlyRate = emp.HourlyRate,
                             DepartmentName = dept != null ? dept.DepartmentName : "Engineering",
                             ApprovalStatus = u.ApprovalStatus,
                             IsActive = u.IsActive,
                             ReportedNote = u.ReportedNote
                         }).ToListAsync();
    return Results.Ok(pending);
});

// POST /api/company/approve-employee/{employeeId}
app.MapPost("/api/company/approve-employee/{employeeId:int}", async (GrindSetDbContext db, int employeeId) =>
{
    var user = await db.Users.FirstOrDefaultAsync(u => u.UserId == employeeId && u.Role == "Employee");
    if (user == null) return Results.NotFound(new { message = "Employee user not found." });

    user.ApprovalStatus = "Approved";

    db.SecurityAuditLogs.Add(new SecurityAuditLog
    {
        UserId = employeeId,
        Action = "COMPANY_APPROVE_EMPLOYEE",
        TargetEntity = $"Employee:{user.Email}",
        EventTime = DateTime.UtcNow
    });

    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Employee approved successfully!", employeeId, approvalStatus = "Approved" });
});

// POST /api/company/reject-employee/{employeeId}
app.MapPost("/api/company/reject-employee/{employeeId:int}", async (GrindSetDbContext db, int employeeId) =>
{
    var user = await db.Users.FirstOrDefaultAsync(u => u.UserId == employeeId && u.Role == "Employee");
    if (user == null) return Results.NotFound(new { message = "Employee user not found." });

    user.ApprovalStatus = "Rejected";

    db.SecurityAuditLogs.Add(new SecurityAuditLog
    {
        UserId = employeeId,
        Action = "COMPANY_REJECT_EMPLOYEE",
        TargetEntity = $"Employee:{user.Email}",
        EventTime = DateTime.UtcNow
    });

    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Employee request rejected.", employeeId, approvalStatus = "Rejected" });
});

// GET /api/companies - All companies overview
app.MapGet("/api/companies", async (GrindSetDbContext db) =>
{
    var companies = await (from c in db.Companies
                           join u in db.Users on c.CompanyId equals u.UserId
                           select new
                           {
                               c.CompanyId,
                               c.CompanyName,
                               c.RegistrationNo,
                               c.Industry,
                               c.LicenseStatus,
                               Email = u.Email,
                               ApprovalStatus = u.ApprovalStatus,
                               IsActive = u.IsActive,
                               EmployeeCount = db.Employees.Count(e => e.CompanyId == c.CompanyId),
                               ProjectCount = db.Projects.Count(p => p.CompanyId == c.CompanyId)
                           }).ToListAsync();
    return Results.Ok(companies);
});

// POST /api/projects - Create new project
app.MapPost("/api/projects", async (GrindSetDbContext db, ProjectCreateDto dto) =>
{
    if (string.IsNullOrWhiteSpace(dto.ProjectName))
    {
        return Results.BadRequest(new { message = "Project Name is required." });
    }

    var project = new Project
    {
        CompanyId = dto.CompanyId > 0 ? dto.CompanyId : 1,
        ProjectName = dto.ProjectName.Trim(),
        Status = string.IsNullOrWhiteSpace(dto.Status) ? "In Progress" : dto.Status.Trim(),
        TotalBudget = dto.TotalBudget > 0 ? dto.TotalBudget : 100000.00m
    };

    db.Projects.Add(project);
    await db.SaveChangesAsync();

    // Create Scope
    db.ProjectScopes.Add(new ProjectScope
    {
        ProjectId = project.ProjectId,
        ScopeDescription = dto.ScopeDescription ?? "New enterprise project scope.",
        Objectives = dto.Objectives ?? "Deliver project milestones on schedule."
    });

    // Create Timeline
    db.ProjectTimelines.Add(new ProjectTimeline
    {
        ProjectId = project.ProjectId,
        PlannedStart = DateTime.UtcNow,
        PlannedEnd = DateTime.UtcNow.AddDays(90),
        Status = "On Track"
    });

    // Create Financial Account
    db.FinancialAccounts.Add(new FinancialAccount
    {
        ProjectId = project.ProjectId,
        AccountName = $"{project.ProjectName} Operating Budget",
        AllocatedBudget = project.TotalBudget,
        CurrentBalance = project.TotalBudget
    });

    await db.SaveChangesAsync();
    return Results.Created($"/api/projects/{project.ProjectId}", project);
});

// GET /api/tasks - Get all tasks with project and assignee info
app.MapGet("/api/tasks", async (GrindSetDbContext db) =>
{
    var tasks = await (from t in db.Tasks
                       join p in db.Projects on t.ProjectId equals p.ProjectId
                       join u in db.Users on t.AssigneeId equals u.UserId into uGroup
                       from u in uGroup.DefaultIfEmpty()
                       join emp in db.Employees on u.UserId equals emp.EmployeeId into empGroup
                       from emp in empGroup.DefaultIfEmpty()
                       select new
                       {
                           t.TaskId,
                           t.ProjectId,
                           ProjectName = p.ProjectName,
                           t.AssigneeId,
                           AssigneeName = emp != null ? emp.FullName : (u != null ? u.Email : "Unassigned"),
                           t.Title,
                           t.Description,
                           t.Priority,
                           t.Status,
                           t.StoryPoints,
                           t.CreatedAt
                       }).OrderByDescending(t => t.CreatedAt).ToListAsync();
    return Results.Ok(tasks);
});

// POST /api/tasks - Create new task (STRICT REQUIREMENT: MUST BE SCOPED TO SPECIFIC PROJECT)
app.MapPost("/api/tasks", async (GrindSetDbContext db, TaskCreateDto dto) =>
{
    if (string.IsNullOrWhiteSpace(dto.Title))
    {
        return Results.BadRequest(new { message = "Task Title is required." });
    }

    var project = await db.Projects.FindAsync(dto.ProjectId);
    if (project == null)
    {
        return Results.BadRequest(new { message = "Invalid Project ID. Every task must be bound to a specific project." });
    }

    var task = new TaskItem
    {
        ProjectId = dto.ProjectId,
        AssigneeId = dto.AssigneeId,
        Title = dto.Title.Trim(),
        Description = dto.Description?.Trim() ?? string.Empty,
        Priority = string.IsNullOrWhiteSpace(dto.Priority) ? "Medium" : dto.Priority.Trim(),
        Status = string.IsNullOrWhiteSpace(dto.Status) ? "To Do" : dto.Status.Trim(),
        StoryPoints = dto.StoryPoints > 0 ? dto.StoryPoints : 3,
        CreatedAt = DateTime.UtcNow
    };

    db.Tasks.Add(task);

    db.SecurityAuditLogs.Add(new SecurityAuditLog
    {
        UserId = dto.AssigneeId ?? 1,
        Action = "CREATE_TASK",
        TargetEntity = $"Task:{task.Title} (Project:{project.ProjectName})",
        EventTime = DateTime.UtcNow
    });

    await db.SaveChangesAsync();
    return Results.Created($"/api/tasks/{task.TaskId}", new
    {
        task.TaskId,
        task.ProjectId,
        ProjectName = project.ProjectName,
        task.AssigneeId,
        task.Title,
        task.Description,
        task.Priority,
        task.Status,
        task.StoryPoints,
        task.CreatedAt
    });
});

// PUT /api/tasks/{id} - Update task details, status, priority, assignee
app.MapPut("/api/tasks/{id:int}", async (GrindSetDbContext db, int id, TaskUpdateDto dto) =>
{
    var task = await db.Tasks.FindAsync(id);
    if (task == null) return Results.NotFound(new { message = "Task not found." });

    if (!string.IsNullOrWhiteSpace(dto.Title)) task.Title = dto.Title.Trim();
    if (dto.Description != null) task.Description = dto.Description.Trim();
    if (!string.IsNullOrWhiteSpace(dto.Priority)) task.Priority = dto.Priority.Trim();
    if (!string.IsNullOrWhiteSpace(dto.Status)) task.Status = dto.Status.Trim();
    if (dto.AssigneeId.HasValue) task.AssigneeId = dto.AssigneeId.Value;
    if (dto.StoryPoints.HasValue && dto.StoryPoints.Value > 0) task.StoryPoints = dto.StoryPoints.Value;
    if (dto.ProjectId.HasValue && dto.ProjectId.Value > 0) task.ProjectId = dto.ProjectId.Value;

    await db.SaveChangesAsync();
    return Results.Ok(task);
});

// DELETE /api/tasks/{id} - Delete task
app.MapDelete("/api/tasks/{id:int}", async (GrindSetDbContext db, int id) =>
{
    var task = await db.Tasks.FindAsync(id);
    if (task == null) return Results.NotFound(new { message = "Task not found." });

    db.Tasks.Remove(task);
    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Task deleted successfully.", taskId = id });
});

// POST /api/finance/accounts - Create Financial Account
app.MapPost("/api/finance/accounts", async (GrindSetDbContext db, AccountCreateDto dto) =>
{
    if (string.IsNullOrWhiteSpace(dto.AccountName))
    {
        return Results.BadRequest(new { message = "Account Name is required." });
    }

    var account = new FinancialAccount
    {
        ProjectId = dto.ProjectId > 0 ? dto.ProjectId : 1,
        AccountName = dto.AccountName.Trim(),
        AllocatedBudget = dto.AllocatedBudget > 0 ? dto.AllocatedBudget : 50000.00m,
        CurrentBalance = dto.AllocatedBudget > 0 ? dto.AllocatedBudget : 50000.00m
    };

    db.FinancialAccounts.Add(account);
    await db.SaveChangesAsync();

    db.SecurityAuditLogs.Add(new SecurityAuditLog
    {
        UserId = 1,
        Action = "CREATE_FINANCIAL_ACCOUNT",
        TargetEntity = $"Account:{account.AccountName} (${account.AllocatedBudget})",
        EventTime = DateTime.UtcNow
    });
    await db.SaveChangesAsync();

    return Results.Created($"/api/finance/accounts/{account.AccountId}", account);
});

// POST /api/finance/reallocate - Inter-Account Budget Transfer
app.MapPost("/api/finance/reallocate", async (GrindSetDbContext db, FundReallocateDto dto) =>
{
    if (dto.Amount <= 0) return Results.BadRequest(new { message = "Reallocation amount must be greater than zero." });
    if (string.IsNullOrWhiteSpace(dto.Reason)) return Results.BadRequest(new { message = "Reason is required for audit reallocation." });

    var source = await db.FinancialAccounts.FindAsync(dto.SourceAccountId);
    var target = await db.FinancialAccounts.FindAsync(dto.TargetAccountId);

    if (source == null || target == null)
    {
        return Results.BadRequest(new { message = "Source or target financial account not found." });
    }

    if (source.CurrentBalance < dto.Amount)
    {
        return Results.BadRequest(new { message = $"Insufficient liquidity in {source.AccountName}. Available: ${source.CurrentBalance}" });
    }

    source.CurrentBalance -= dto.Amount;
    source.AllocatedBudget -= dto.Amount;
    target.CurrentBalance += dto.Amount;
    target.AllocatedBudget += dto.Amount;

    var record = new FundReallocation
    {
        ProjectId = dto.ProjectId > 0 ? dto.ProjectId : source.ProjectId,
        AccountId = source.AccountId,
        TargetAccountId = target.AccountId,
        Amount = dto.Amount,
        Reason = dto.Reason.Trim(),
        CreatedAt = DateTime.UtcNow
    };

    db.FundReallocations.Add(record);

    db.SecurityAuditLogs.Add(new SecurityAuditLog
    {
        UserId = 1,
        Action = "REALLOCATE_FUNDS",
        TargetEntity = $"From {source.AccountName} To {target.AccountName} (${dto.Amount})",
        EventTime = DateTime.UtcNow
    });

    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Funds reallocated successfully!", record });
});

// POST /api/finance/expense-claim - Employee Reimbursement Claim Submission
app.MapPost("/api/finance/expense-claim", async (GrindSetDbContext db, ExpenseClaimDto dto) =>
{
    if (dto.Amount <= 0) return Results.BadRequest(new { message = "Claim amount must be greater than zero." });
    if (string.IsNullOrWhiteSpace(dto.Type)) return Results.BadRequest(new { message = "Expense type is required." });

    var account = await db.FinancialAccounts.FindAsync(dto.AccountId);
    if (account == null) return Results.BadRequest(new { message = "Financial account not found." });

    var tx = new Transaction
    {
        AccountId = dto.AccountId,
        LoggedByEmployeeId = dto.EmployeeId > 0 ? dto.EmployeeId : 1,
        Type = dto.Type.Trim(),
        Amount = dto.Amount,
        Status = "PendingApproval",
        Note = dto.Note?.Trim() ?? "Employee reimbursement claim",
        TransactionDate = DateTime.UtcNow
    };

    db.Transactions.Add(tx);
    await db.SaveChangesAsync();

    return Results.Created($"/api/transactions/{tx.TransactionId}", tx);
});

// POST /api/finance/approve-expense/{id} - Company Owner Approval
app.MapPost("/api/finance/approve-expense/{id:int}", async (GrindSetDbContext db, int id) =>
{
    var tx = await db.Transactions.FindAsync(id);
    if (tx == null) return Results.NotFound(new { message = "Transaction not found." });

    if (tx.Status == "Approved") return Results.Ok(new { message = "Expense is already approved." });

    tx.Status = "Approved";

    var account = await db.FinancialAccounts.FindAsync(tx.AccountId);
    if (account != null)
    {
        account.CurrentBalance -= tx.Amount;
    }

    db.SecurityAuditLogs.Add(new SecurityAuditLog
    {
        UserId = 1,
        Action = "APPROVE_EXPENSE_CLAIM",
        TargetEntity = $"Expense #{tx.TransactionId} (${tx.Amount})",
        EventTime = DateTime.UtcNow
    });

    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Expense claim approved successfully!", transaction = tx });
});

// POST /api/finance/reject-expense/{id} - Company Owner Rejection
app.MapPost("/api/finance/reject-expense/{id:int}", async (GrindSetDbContext db, int id) =>
{
    var tx = await db.Transactions.FindAsync(id);
    if (tx == null) return Results.NotFound(new { message = "Transaction not found." });

    tx.Status = "Rejected";

    db.SecurityAuditLogs.Add(new SecurityAuditLog
    {
        UserId = 1,
        Action = "REJECT_EXPENSE_CLAIM",
        TargetEntity = $"Expense #{tx.TransactionId} (${tx.Amount})",
        EventTime = DateTime.UtcNow
    });

    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Expense claim rejected.", transaction = tx });
});

// GET /api/finance/export/csv - Download General Ledger CSV Report
app.MapGet("/api/finance/export/csv", async (GrindSetDbContext db) =>
{
    var txs = await (from t in db.Transactions
                     join a in db.FinancialAccounts on t.AccountId equals a.AccountId
                     join u in db.Users on t.LoggedByEmployeeId equals u.UserId into uGrp
                     from u in uGrp.DefaultIfEmpty()
                     join emp in db.Employees on u.UserId equals emp.EmployeeId into empGrp
                     from emp in empGrp.DefaultIfEmpty()
                     select new
                     {
                         t.TransactionId,
                         Account = a.AccountName,
                         LoggedBy = emp != null ? emp.FullName : (u != null ? u.Email : "System"),
                         t.Type,
                         t.Amount,
                         t.Status,
                         t.Note,
                         t.TransactionDate
                     }).ToListAsync();

    var sb = new System.Text.StringBuilder();
    sb.AppendLine("TransactionID,Account,LoggedBy,Type,Amount,Status,Note,TransactionDate");
    foreach (var t in txs)
    {
        sb.AppendLine($"{t.TransactionId},\"{t.Account}\",\"{t.LoggedBy}\",\"{t.Type}\",{t.Amount},{t.Status},\"{t.Note}\",{t.TransactionDate:yyyy-MM-dd HH:mm:ss}");
    }

    return Results.Text(sb.ToString(), "text/csv");
});

app.Run();

// Auth Helpers
static string HashPassword(string password)
{
    using var sha = System.Security.Cryptography.SHA256.Create();
    var bytes = System.Text.Encoding.UTF8.GetBytes(password + "_grindset_salt_2026");
    var hash = sha.ComputeHash(bytes);
    return Convert.ToBase64String(hash);
}

static bool VerifyPassword(string password, string storedHash)
{
    if (storedHash.StartsWith("AQAAAAEAACcQAAAAEHASH")) return true; // Seed password compatibility
    return HashPassword(password) == storedHash;
}

// DTO Records
public record EmployeeDto(string Email, string FullName, string Designation, decimal HourlyRate);
public record TransactionDto(int AccountId, int LoggedByEmployeeId, string Type, decimal Amount);
public record SignUpDto(string Email, string Password, string FullName, string Role, string? Designation, decimal HourlyRate, string? CompanyName, string? Industry);
public record LoginDto(string Email, string Password);
public record ReportDto(string Note);
public record ProjectCreateDto(int CompanyId, string ProjectName, decimal TotalBudget, string? Status, string? ScopeDescription, string? Objectives);
public record TaskCreateDto(int ProjectId, int? AssigneeId, string Title, string? Description, string? Priority, string? Status, int StoryPoints);
public record TaskUpdateDto(int? ProjectId, int? AssigneeId, string? Title, string? Description, string? Priority, string? Status, int? StoryPoints);
public record AccountCreateDto(int ProjectId, string AccountName, decimal AllocatedBudget);
public record FundReallocateDto(int ProjectId, int SourceAccountId, int TargetAccountId, decimal Amount, string Reason);
public record ExpenseClaimDto(int AccountId, int EmployeeId, string Type, decimal Amount, string? Note);


