using GrindSet.Api.Data;
using Microsoft.EntityFrameworkCore;
using GrindSet.Api.Models;
using GrindSet.Api.Services;
using GrindSet.Api.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "GrindSet ERP API", Version = "v1.0.0" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Format: Bearer {token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Configure SQLite DbContext
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=grindset.db";
builder.Services.AddDbContext<GrindSetDbContext>(options =>
    options.UseSqlite(connectionString));

// Configure JWT Authentication
var jwtKey = Encoding.UTF8.GetBytes(JwtTokenService.SecretKey);
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = JwtTokenService.Issuer,
        ValidAudience = JwtTokenService.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(jwtKey)
    };
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});
builder.Services.AddAuthorization();
builder.Services.AddSignalR();

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

builder.Services.AddSingleton<IEmailService, EmailService>();

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
app.UseAuthentication();
app.UseAuthorization();

// Real-Time SignalR WebSockets Hub
app.MapHub<ProjectChatHub>("/hubs/project-chat");

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

app.MapGet("/api/projects", async (GrindSetDbContext db, ClaimsPrincipal principal) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();

    IQueryable<Project> query = db.Projects;
    if (auth.IsCompany || auth.IsEmployee)
    {
        int cid = auth.CompanyId ?? 0;
        query = query.Where(p => p.CompanyId == cid);
    }
    var projectsList = await query.ToListAsync();

    int empId = auth.EmployeeId ?? auth.UserId;
    var userAssignments = auth.IsEmployee
        ? await db.ProjectAssignments.Where(a => a.EmployeeId == empId).Select(a => a.ProjectId).ToListAsync()
        : new List<int>();

    var pmIds = projectsList.Where(p => p.ProjectManagerId.HasValue).Select(p => p.ProjectManagerId!.Value).Distinct().ToList();
    var pmNames = await db.Employees.Where(e => pmIds.Contains(e.EmployeeId)).ToDictionaryAsync(e => e.EmployeeId, e => e.FullName);

    var result = projectsList.Select(p =>
    {
        bool isPM = auth.IsEmployee && p.ProjectManagerId == empId;
        bool isMember = auth.IsCompany || auth.IsAdmin || (auth.IsEmployee && (isPM || userAssignments.Contains(p.ProjectId)));
        string pmName = (p.ProjectManagerId.HasValue && pmNames.TryGetValue(p.ProjectManagerId.Value, out var name)) ? name : "Unassigned";

        return new
        {
            p.ProjectId,
            p.CompanyId,
            p.ProjectName,
            p.Status,
            p.TotalBudget,
            p.ProjectManagerId,
            ProjectManagerName = pmName,
            IsManager = isPM,
            IsMember = isMember,
            AccessLevel = isPM ? "Manager" : isMember ? "Member" : "Basic"
        };
    });

    return Results.Ok(result);
});

app.MapGet("/api/projects/details", async (GrindSetDbContext db, ClaimsPrincipal principal) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();

    IQueryable<Project> projQuery = db.Projects;
    if (auth.IsCompany || auth.IsEmployee)
    {
        int cid = auth.CompanyId ?? 0;
        projQuery = projQuery.Where(p => p.CompanyId == cid);
    }

    var list = await (from p in projQuery
                      join s in db.ProjectScopes on p.ProjectId equals s.ProjectId into sGrp
                      from s in sGrp.DefaultIfEmpty()
                      select new
                      {
                          p.ProjectId,
                          p.CompanyId,
                          p.ProjectManagerId,
                          p.ProjectName,
                          p.Status,
                          p.TotalBudget,
                          ScopeDescription = s != null ? s.ScopeDescription : "Enterprise software development & cloud infrastructure milestone.",
                          Objectives = s != null ? s.Objectives : "On-time delivery, compliance, and zero budget overrun.",
                          AccountCount = db.FinancialAccounts.Count(a => a.ProjectId == p.ProjectId),
                          TaskCount = db.Tasks.Count(t => t.ProjectId == p.ProjectId),
                          CompletedTaskCount = db.Tasks.Count(t => t.ProjectId == p.ProjectId && t.Status == "Done"),
                          MemberCount = db.ProjectAssignments.Count(a => a.ProjectId == p.ProjectId)
                      }).ToListAsync();

    int empId = auth.EmployeeId ?? auth.UserId;
    var userAssignments = auth.IsEmployee
        ? await db.ProjectAssignments.Where(a => a.EmployeeId == empId).Select(a => a.ProjectId).ToListAsync()
        : new List<int>();

    var pmIds = list.Where(p => p.ProjectManagerId.HasValue).Select(p => p.ProjectManagerId!.Value).Distinct().ToList();
    var pmNames = await db.Employees.Where(e => pmIds.Contains(e.EmployeeId)).ToDictionaryAsync(e => e.EmployeeId, e => e.FullName);

    var result = list.Select(p =>
    {
        bool isPM = auth.IsEmployee && p.ProjectManagerId == empId;
        bool isMember = auth.IsCompany || auth.IsAdmin || (auth.IsEmployee && (isPM || userAssignments.Contains(p.ProjectId)));
        string pmName = (p.ProjectManagerId.HasValue && pmNames.TryGetValue(p.ProjectManagerId.Value, out var name)) ? name : "Unassigned";

        return new
        {
            p.ProjectId,
            p.CompanyId,
            p.ProjectManagerId,
            ProjectManagerName = pmName,
            p.ProjectName,
            p.Status,
            p.TotalBudget,
            p.ScopeDescription,
            p.Objectives,
            AccountCount = isMember ? p.AccountCount : 0,
            TaskCount = isMember ? p.TaskCount : 0,
            CompletedTaskCount = isMember ? p.CompletedTaskCount : 0,
            p.MemberCount,
            IsManager = isPM,
            IsMember = isMember,
            AccessLevel = isPM ? "Manager" : isMember ? "Member" : "Basic"
        };
    });

    return Results.Ok(result);
});

app.MapGet("/api/users", async (GrindSetDbContext db, ClaimsPrincipal principal) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();

    IQueryable<User> userQuery = db.Users;
    if (auth.IsCompany)
    {
        int cid = auth.CompanyId ?? 0;
        var empUserIds = db.Employees.Where(e => e.CompanyId == cid).Select(e => e.EmployeeId);
        userQuery = userQuery.Where(u => u.UserId == cid || empUserIds.Contains(u.UserId));
    }
    else if (auth.IsEmployee)
    {
        userQuery = userQuery.Where(u => u.UserId == auth.UserId);
    }

    var users = await userQuery.Select(u => new { u.UserId, u.Email, u.Role, u.IsActive, u.ApprovalStatus, u.ReportedNote }).ToListAsync();
    return Results.Ok(users);
});

app.MapGet("/api/erd-summary", async (GrindSetDbContext db, ClaimsPrincipal principal) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (auth.IsCompany && auth.CompanyId.HasValue)
    {
        int cid = auth.CompanyId.Value;
        var compProjectIds = await db.Projects.Where(p => p.CompanyId == cid).Select(p => p.ProjectId).ToListAsync();
        var compAccountIds = await db.FinancialAccounts.Where(a => compProjectIds.Contains(a.ProjectId)).Select(a => a.AccountId).ToListAsync();

        return Results.Ok(new
        {
            TotalUsers = await db.Employees.CountAsync(e => e.CompanyId == cid) + 1,
            TotalCompanies = 1,
            TotalEmployees = await db.Employees.CountAsync(e => e.CompanyId == cid),
            TotalProjects = compProjectIds.Count,
            TotalTransactions = await db.Transactions.CountAsync(t => compAccountIds.Contains(t.AccountId)),
            TotalAuditLogs = await db.SecurityAuditLogs.CountAsync(l => l.UserId == auth.UserId || db.Employees.Any(e => e.CompanyId == cid && e.EmployeeId == l.UserId)),
            ErdTablesCount = 20,
            ErdSchemaStatus = "Verified & Auto-Seeded"
        });
    }

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
app.MapGet("/api/employees", async (GrindSetDbContext db, ClaimsPrincipal principal) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();

    IQueryable<Employee> empQuery = db.Employees;
    if (auth.IsCompany || auth.IsEmployee)
    {
        int cid = auth.CompanyId ?? 0;
        empQuery = empQuery.Where(e => e.CompanyId == cid);
    }

    var employees = await (from emp in empQuery
                           join u in db.Users on emp.EmployeeId equals u.UserId
                           join dept in db.Departments on emp.DepartmentId equals dept.DepartmentId into deptGroup
                           from dept in deptGroup.DefaultIfEmpty()
                           select new
                           {
                               emp.EmployeeId,
                               emp.CompanyId,
                               emp.FullName,
                               emp.Designation,
                               emp.HourlyRate,
                               Email = u.Email,
                               DepartmentName = dept != null ? dept.DepartmentName : "Engineering & Infrastructure"
                           }).ToListAsync();
    return Results.Ok(employees);
});

// POST /api/employees - onboard new employee
app.MapPost("/api/employees", async (GrindSetDbContext db, ClaimsPrincipal principal, EmployeeDto dto) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();
    if (auth.IsEmployee) return Results.Forbid();

    int compId = auth.IsCompany ? auth.CompanyId!.Value : 1;

    // Check tier limits for company
    var limits = await GetCompanyTierLimitsAsync(db, compId);
    if (limits.MaxEmployees.HasValue)
    {
        var currentEmployees = await (from empItem in db.Employees
                                      join uItem in db.Users on empItem.EmployeeId equals uItem.UserId
                                      where empItem.CompanyId == compId && uItem.ApprovalStatus == "Approved"
                                      select empItem).CountAsync();
        if (currentEmployees >= limits.MaxEmployees.Value)
        {
            return Results.BadRequest(new
            {
                message = $"Your organization has reached the limit of {limits.MaxEmployees.Value} employees on the {limits.Tier} tier. Upgrade to {(limits.Tier == "Free" ? "Professional ($15/mo) or Enterprise ($29/mo)" : "Enterprise ($29/mo)")} in Billing & Plans to onboard more employees.",
                code = "TIER_LIMIT_EXCEEDED",
                tier = limits.Tier,
                current = currentEmployees,
                max = limits.MaxEmployees.Value,
                resource = "Employees"
            });
        }
    }

    // Create User first
    var user = new User
    {
        Email = dto.Email.Trim().ToLower(),
        PasswordHash = HashPassword("employee123"),
        Role = "Employee",
        IsActive = true,
        ApprovalStatus = "Approved"
    };
    db.Users.Add(user);
    await db.SaveChangesAsync();

    // Get department or create/use first for company
    var dept = await db.Departments.FirstOrDefaultAsync(d => d.CompanyId == compId);
    if (dept == null)
    {
        dept = new Department { CompanyId = compId, DepartmentName = "Engineering & Infrastructure" };
        db.Departments.Add(dept);
        await db.SaveChangesAsync();
    }

    // Create Employee
    var emp = new Employee
    {
        EmployeeId = user.UserId,
        CompanyId = compId,
        DepartmentId = dept.DepartmentId,
        FullName = dto.FullName.Trim(),
        Designation = dto.Designation.Trim(),
        HourlyRate = dto.HourlyRate > 0 ? dto.HourlyRate : 75.00m
    };
    db.Employees.Add(emp);

    // Create Audit Log
    db.SecurityAuditLogs.Add(new SecurityAuditLog
    {
        UserId = auth.UserId,
        Action = "ONBOARD_EMPLOYEE",
        TargetEntity = $"Employee:{dto.FullName} (CompanyId:{compId})",
        EventTime = DateTime.UtcNow
    });

    await db.SaveChangesAsync();
    return Results.Created($"/api/employees/{user.UserId}", emp);
});

// GET /api/transactions - financial transaction ledger
app.MapGet("/api/transactions", async (GrindSetDbContext db, ClaimsPrincipal principal) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();

    IQueryable<Transaction> txQuery = db.Transactions;
    if (auth.IsEmployee)
    {
        int empId = auth.EmployeeId ?? auth.UserId;
        var managedProjectIds = db.Projects.Where(p => p.CompanyId == auth.CompanyId && p.ProjectManagerId == empId).Select(p => p.ProjectId);
        var managedAccountIds = db.FinancialAccounts.Where(a => managedProjectIds.Contains(a.ProjectId)).Select(a => a.AccountId);

        // Employee sees their own logged expenses/claims PLUS transactions on accounts of projects they manage as PM
        txQuery = txQuery.Where(tx => tx.LoggedByEmployeeId == empId || managedAccountIds.Contains(tx.AccountId));
    }
    else if (auth.IsCompany)
    {
        int cid = auth.CompanyId ?? 0;
        var pids = db.Projects.Where(p => p.CompanyId == cid).Select(p => p.ProjectId);
        var aids = db.FinancialAccounts.Where(a => pids.Contains(a.ProjectId)).Select(a => a.AccountId);
        txQuery = txQuery.Where(tx => aids.Contains(tx.AccountId));
    }

    var transactions = await (from tx in txQuery
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
                                  LoggedByEmployeeId = tx.LoggedByEmployeeId,
                                  tx.Type,
                                  tx.Amount,
                                  tx.Status,
                                  tx.Note,
                                  tx.TransactionDate
                              }).OrderByDescending(t => t.TransactionDate).ToListAsync();
    return Results.Ok(transactions);
});

// POST /api/transactions - log expense
app.MapPost("/api/transactions", async (GrindSetDbContext db, ClaimsPrincipal principal, TransactionDto dto) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();

    var acc = await db.FinancialAccounts.FindAsync(dto.AccountId);
    if (acc == null) return Results.NotFound("Financial Account not found");

    var proj = await db.Projects.FindAsync(acc.ProjectId);
    if (!auth.IsAdmin && (proj == null || proj.CompanyId != auth.CompanyId))
    {
        return Results.Forbid();
    }

    int loggedBy = auth.IsEmployee ? auth.UserId : (dto.LoggedByEmployeeId > 0 ? dto.LoggedByEmployeeId : auth.UserId);

    var tx = new Transaction
    {
        AccountId = dto.AccountId,
        LoggedByEmployeeId = loggedBy,
        Type = dto.Type,
        Amount = dto.Amount,
        TransactionDate = DateTime.UtcNow,
        Status = "Approved"
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
        UserId = auth.UserId,
        Action = "LOG_EXPENSE",
        TargetEntity = $"Account:{acc.AccountName} (${dto.Amount})",
        EventTime = DateTime.UtcNow
    });

    await db.SaveChangesAsync();
    return Results.Created($"/api/transactions/{tx.TransactionId}", tx);
});

// GET /api/accounts - financial accounts
app.MapGet("/api/accounts", async (GrindSetDbContext db, ClaimsPrincipal principal) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();

    IQueryable<FinancialAccount> accQuery = db.FinancialAccounts;
    if (auth.IsCompany)
    {
        int cid = auth.CompanyId ?? 0;
        var pids = db.Projects.Where(p => p.CompanyId == cid).Select(p => p.ProjectId);
        accQuery = accQuery.Where(a => pids.Contains(a.ProjectId));
    }
    else if (auth.IsEmployee)
    {
        int cid = auth.CompanyId ?? 0;
        int empId = auth.EmployeeId ?? auth.UserId;
        var pids = db.Projects.Where(p => p.CompanyId == cid &&
            (p.ProjectManagerId == empId || db.ProjectAssignments.Any(a => a.ProjectId == p.ProjectId && a.EmployeeId == empId)))
            .Select(p => p.ProjectId);
        accQuery = accQuery.Where(a => pids.Contains(a.ProjectId));
    }

    var accounts = await (from acc in accQuery
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
app.MapGet("/api/audit-logs", async (GrindSetDbContext db, ClaimsPrincipal principal) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();

    IQueryable<SecurityAuditLog> logQuery = db.SecurityAuditLogs;
    if (auth.IsEmployee)
    {
        logQuery = logQuery.Where(l => l.UserId == auth.UserId);
    }
    else if (auth.IsCompany)
    {
        int cid = auth.CompanyId ?? 0;
        var empUserIds = db.Employees.Where(e => e.CompanyId == cid).Select(e => e.EmployeeId);
        logQuery = logQuery.Where(l => l.UserId == auth.UserId || empUserIds.Contains(l.UserId));
    }

    var logs = await (from log in logQuery
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
app.MapGet("/api/assignments", async (GrindSetDbContext db, ClaimsPrincipal principal) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();

    IQueryable<ProjectAssignment> assignQuery = db.ProjectAssignments;
    if (auth.IsCompany || auth.IsEmployee)
    {
        int cid = auth.CompanyId ?? 0;
        var pids = db.Projects.Where(p => p.CompanyId == cid).Select(p => p.ProjectId);
        assignQuery = assignQuery.Where(a => pids.Contains(a.ProjectId));
    }

    var assignments = await (from assign in assignQuery
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
app.MapGet("/api/auth/me", async (GrindSetDbContext db, ClaimsPrincipal principal, int? userId) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    int targetId = userId ?? (auth.IsAuthenticated ? auth.UserId : 0);
    var user = await db.Users.FirstOrDefaultAsync(u => u.UserId == targetId);
    if (user == null) return Results.NotFound(new { message = "User not found." });

    string displayName = user.Email;
    int? compId = null;
    if (user.Role == "Employee")
    {
        var emp = await db.Employees.FirstOrDefaultAsync(e => e.EmployeeId == user.UserId);
        if (emp != null)
        {
            displayName = emp.FullName;
            compId = emp.CompanyId;
        }
    }
    else if (user.Role == "Company")
    {
        compId = user.CompanyId ?? user.UserId;
        var comp = await db.Companies.FirstOrDefaultAsync(c => c.CompanyId == compId);
        if (comp != null)
        {
            displayName = comp.CompanyName;
        }
    }
    else if (user.Role == "Admin")
    {
        var adm = await db.Admins.FirstOrDefaultAsync(a => a.AdminId == user.UserId);
        if (adm != null) displayName = adm.FullName;
    }

    return Results.Ok(new
    {
        userId = user.UserId,
        companyId = compId,
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

    // Password strength validation: at least 8 characters, capital & small letters mixed, special characters or numbers
    if (dto.Password.Length < 8)
    {
        return Results.BadRequest(new { message = "Password must be at least 8 characters long." });
    }

    bool hasUpper = dto.Password.Any(char.IsUpper);
    bool hasLower = dto.Password.Any(char.IsLower);
    if (!hasUpper || !hasLower)
    {
        return Results.BadRequest(new { message = "Password must contain a mix of uppercase and lowercase letters." });
    }

    bool hasDigit = dto.Password.Any(char.IsDigit);
    bool hasSpecial = dto.Password.Any(ch => !char.IsLetterOrDigit(ch));
    if (!hasDigit && !hasSpecial)
    {
        return Results.BadRequest(new { message = "Password must contain at least one number or special character." });
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

    bool isExistingCompanyClaim = false;
    if (dbRole == "Company" && dto.CompanyId.HasValue)
    {
        if (await db.Companies.AnyAsync(c => c.CompanyId == dto.CompanyId.Value))
        {
            isExistingCompanyClaim = true;
        }
    }

    string initialApproval = dbRole switch
    {
        "Company" => isExistingCompanyClaim ? "PendingAdmin" : "Approved",
        "Employee" => "PendingCompany",
        _ => "Approved"
    };

    var user = new User
    {
        Email = cleanEmail,
        PasswordHash = HashPassword(dto.Password),
        Role = dbRole,
        CompanyId = isExistingCompanyClaim ? dto.CompanyId.Value : null,
        IsActive = true,
        ApprovalStatus = initialApproval,
        ReportedNote = dto.FullName.Trim()
    };

    db.Users.Add(user);
    await db.SaveChangesAsync();

    string displayName = dto.FullName.Trim();
    int? compId = null;

    if (dbRole == "Company")
    {
        // Check if claiming/joining an existing company tenancy
        if (isExistingCompanyClaim)
        {
            compId = dto.CompanyId!.Value;
            user.CompanyId = compId;
            db.SecurityAuditLogs.Add(new SecurityAuditLog
            {
                UserId = user.UserId,
                Action = "COMPANY_OWNER_CLAIM_PENDING_ADMIN",
                TargetEntity = $"User:{user.Email} requested ownership of existing Company ID:{compId}",
                EventTime = DateTime.UtcNow
            });
        }
        else
        {
            compId = user.UserId;
            user.CompanyId = user.UserId;
            var companyName = string.IsNullOrWhiteSpace(dto.CompanyName) ? $"{displayName}'s Organization" : dto.CompanyName.Trim();
            var company = new Company
            {
                CompanyId = user.UserId,
                CompanyName = companyName,
                RegistrationNo = $"REG-{Random.Shared.Next(100000, 999999)}",
                Industry = string.IsNullOrWhiteSpace(dto.Industry) ? "Technology & Software" : dto.Industry.Trim(),
                LicenseStatus = "Active"
            };
            db.Companies.Add(company);

            // Default executive department
            db.Departments.Add(new Department
            {
                CompanyId = user.UserId,
                DepartmentName = "Executive & Operations"
            });

            // Default Community Free subscription
            db.Subscriptions.Add(new CompanySubscription
            {
                CompanyId = user.UserId,
                PlanTier = "Free",
                BillingCycle = "Monthly",
                Price = 0.00m,
                Status = "Active",
                PaymentMethod = "Default Free Tier",
                CurrentPeriodStart = DateTime.UtcNow,
                CurrentPeriodEnd = DateTime.UtcNow.AddYears(1),
                CreatedAt = DateTime.UtcNow
            });
        }
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
        int targetCompanyId = 1;
        if (dto.CompanyId.HasValue && await db.Companies.AnyAsync(c => c.CompanyId == dto.CompanyId.Value))
        {
            targetCompanyId = dto.CompanyId.Value;
        }
        else
        {
            var company = await db.Companies.FirstOrDefaultAsync(c => c.LicenseStatus == "Active") ?? await db.Companies.FirstOrDefaultAsync();
            targetCompanyId = company?.CompanyId ?? 1;
        }
        compId = targetCompanyId;

        var dept = await db.Departments.FirstOrDefaultAsync(d => d.CompanyId == targetCompanyId);
        if (dept == null)
        {
            dept = new Department { CompanyId = targetCompanyId, DepartmentName = "Engineering & Infrastructure" };
            db.Departments.Add(dept);
            await db.SaveChangesAsync();
        }

        var employee = new Employee
        {
            EmployeeId = user.UserId,
            CompanyId = targetCompanyId,
            DepartmentId = dept.DepartmentId,
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

    var token = JwtTokenService.GenerateToken(user, displayName, compId);

    return Results.Created($"/api/users/{user.UserId}", new
    {
        message = "Account created successfully!",
        user = new
        {
            userId = user.UserId,
            companyId = compId,
            email = user.Email,
            role = user.Role,
            approvalStatus = user.ApprovalStatus,
            isActive = user.IsActive,
            reportedNote = user.ReportedNote,
            fullName = displayName,
            token = token
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
    int? compId = null;
    if (user.Role == "Employee")
    {
        var emp = await db.Employees.FirstOrDefaultAsync(e => e.EmployeeId == user.UserId);
        if (emp != null)
        {
            displayName = emp.FullName;
            compId = emp.CompanyId;
        }
    }
    else if (user.Role == "Company")
    {
        compId = user.CompanyId ?? user.UserId;
        var comp = await db.Companies.FirstOrDefaultAsync(c => c.CompanyId == compId);
        if (comp != null)
        {
            displayName = comp.CompanyName;
        }
    }
    else if (user.Role == "Admin")
    {
        var adm = await db.Admins.FirstOrDefaultAsync(a => a.AdminId == user.UserId);
        if (adm != null) displayName = adm.FullName;
    }

    var token = JwtTokenService.GenerateToken(user, displayName, compId);

    db.SecurityAuditLogs.Add(new SecurityAuditLog
    {
        UserId = user.UserId,
        Action = "JWT_USER_LOGIN",
        TargetEntity = $"User:{user.Email}",
        EventTime = DateTime.UtcNow
    });
    await db.SaveChangesAsync();

    return Results.Ok(new
    {
        message = "Login successful",
        token,
        tokenType = "Bearer",
        expiresInSeconds = 604800,
        user = new
        {
            userId = user.UserId,
            companyId = compId,
            email = user.Email,
            role = user.Role,
            approvalStatus = user.ApprovalStatus,
            isActive = user.IsActive,
            reportedNote = user.ReportedNote,
            fullName = displayName,
        }
    });
});

// POST /api/auth/forgot-password - Request password reset link
app.MapPost("/api/auth/forgot-password", async (GrindSetDbContext db, IEmailService emailService, ForgotPasswordDto dto) =>
{
    if (string.IsNullOrWhiteSpace(dto.Email))
    {
        return Results.BadRequest(new { message = "Email is required." });
    }

    var cleanEmail = dto.Email.Trim().ToLower();
    var user = await db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == cleanEmail);
    if (user == null)
    {
        // Safe message to prevent email enumeration
        return Results.Ok(new 
        { 
            message = "If an account exists with this email address, a password reset link has been dispatched.",
            sent = true
        });
    }

    // Invalidate any existing pending reset tokens for this user
    var oldResets = await db.PasswordResets
        .Where(r => r.UserId == user.UserId && r.Status == "Pending")
        .ToListAsync();
    foreach (var old in oldResets)
    {
        old.Status = "Superseded";
    }

    // Generate cryptographically secure 32-byte hex token
    var tokenBytes = RandomNumberGenerator.GetBytes(32);
    var token = Convert.ToHexString(tokenBytes).ToLower();

    var resetRecord = new PasswordReset
    {
        UserId = user.UserId,
        ResetToken = token,
        ExpiresAt = DateTime.UtcNow.AddHours(1),
        Status = "Pending"
    };
    db.PasswordResets.Add(resetRecord);

    // Resolve user display name
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

    // Send email via Brevo / SMTP
    var emailResult = await emailService.SendPasswordResetEmailAsync(user.Email, displayName, token);

    // Audit log
    db.SecurityAuditLogs.Add(new SecurityAuditLog
    {
        UserId = user.UserId,
        Action = "PASSWORD_RESET_REQUESTED",
        TargetEntity = $"User:{user.Email} (Token Expiry: 1hr)",
        EventTime = DateTime.UtcNow
    });

    await db.SaveChangesAsync();

    return Results.Ok(new
    {
        message = "A password reset link has been dispatched to your email address.",
        sent = true,
        devResetToken = token,
        devResetUrl = emailResult.ResetUrl,
        providerMessage = emailResult.Message
    });
});

// GET /api/auth/verify-reset-token - Validate token before showing reset form
app.MapGet("/api/auth/verify-reset-token", async (GrindSetDbContext db, string token) =>
{
    if (string.IsNullOrWhiteSpace(token))
    {
        return Results.BadRequest(new { valid = false, message = "Reset token is required." });
    }

    var cleanToken = token.Trim().ToLower();
    var reset = await db.PasswordResets.FirstOrDefaultAsync(r => r.ResetToken == cleanToken);
    if (reset == null || reset.Status != "Pending")
    {
        return Results.BadRequest(new { valid = false, message = "This password reset link is invalid or has already been used." });
    }

    if (reset.ExpiresAt < DateTime.UtcNow)
    {
        reset.Status = "Expired";
        await db.SaveChangesAsync();
        return Results.BadRequest(new { valid = false, message = "This password reset link has expired. Please request a new one." });
    }

    var user = await db.Users.FirstOrDefaultAsync(u => u.UserId == reset.UserId);
    if (user == null)
    {
        return Results.BadRequest(new { valid = false, message = "Account associated with this reset link was not found." });
    }

    return Results.Ok(new
    {
        valid = true,
        email = user.Email,
        role = user.Role,
        expiresAt = reset.ExpiresAt
    });
});

// POST /api/auth/reset-password - Execute password change with token
app.MapPost("/api/auth/reset-password", async (GrindSetDbContext db, ResetPasswordDto dto) =>
{
    if (string.IsNullOrWhiteSpace(dto.Token) || string.IsNullOrWhiteSpace(dto.NewPassword))
    {
        return Results.BadRequest(new { message = "Token and new password are required." });
    }

    var cleanToken = dto.Token.Trim().ToLower();
    var reset = await db.PasswordResets.FirstOrDefaultAsync(r => r.ResetToken == cleanToken && r.Status == "Pending");
    if (reset == null)
    {
        return Results.BadRequest(new { message = "Reset token is invalid or has already been used." });
    }

    if (reset.ExpiresAt < DateTime.UtcNow)
    {
        reset.Status = "Expired";
        await db.SaveChangesAsync();
        return Results.BadRequest(new { message = "Reset link has expired. Please request a new one." });
    }

    var newPass = dto.NewPassword;
    bool hasMinLength = newPass.Length >= 8;
    bool hasUpper = System.Text.RegularExpressions.Regex.IsMatch(newPass, "[A-Z]");
    bool hasLower = System.Text.RegularExpressions.Regex.IsMatch(newPass, "[a-z]");
    bool hasMixed = hasUpper && hasLower;
    bool hasNumOrSpecial = System.Text.RegularExpressions.Regex.IsMatch(newPass, "[0-9]") || System.Text.RegularExpressions.Regex.IsMatch(newPass, "[^A-Za-z0-9]");

    if (!hasMinLength || !hasMixed || !hasNumOrSpecial)
    {
        return Results.BadRequest(new { message = "Password does not meet security requirements (min 8 chars, uppercase, lowercase, and a number or special character)." });
    }

    var user = await db.Users.FirstOrDefaultAsync(u => u.UserId == reset.UserId);
    if (user == null)
    {
        return Results.NotFound(new { message = "User not found." });
    }

    user.PasswordHash = HashPassword(newPass);
    reset.Status = "Completed";

    db.SecurityAuditLogs.Add(new SecurityAuditLog
    {
        UserId = user.UserId,
        Action = "PASSWORD_RESET_COMPLETED",
        TargetEntity = $"User:{user.Email}",
        EventTime = DateTime.UtcNow
    });

    await db.SaveChangesAsync();

    return Results.Ok(new
    {
        message = "Password updated successfully! You can now sign in with your new password."
    });
});

// GET /api/admin/pending-companies
app.MapGet("/api/admin/pending-companies", async (GrindSetDbContext db, ClaimsPrincipal principal) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();
    if (!auth.IsAdmin) return Results.Forbid();

    var pendingUsers = await db.Users
        .Where(u => u.Role == "Company" && u.ApprovalStatus == "PendingAdmin")
        .ToListAsync();

    var pendingList = new List<object>();
    foreach (var u in pendingUsers)
    {
        int targetCompId = u.CompanyId ?? u.UserId;
        var comp = await db.Companies.FirstOrDefaultAsync(c => c.CompanyId == targetCompId);

        pendingList.Add(new
        {
            companyId = u.UserId, // Unique identifier used by approve/reject buttons
            targetCompanyId = targetCompId,
            companyName = comp?.CompanyName ?? (string.IsNullOrWhiteSpace(u.ReportedNote) ? "Registered Workspace" : u.ReportedNote),
            email = u.Email,
            fullName = u.ReportedNote ?? u.Email,
            registrationNo = comp?.RegistrationNo ?? "REG-PENDING",
            industry = comp?.Industry ?? "Enterprise Technology",
            licenseStatus = comp?.LicenseStatus ?? "PendingAdminApproval",
            approvalStatus = u.ApprovalStatus,
            isExistingCompanyClaim = comp != null && comp.CompanyId != u.UserId
        });
    }

    return Results.Ok(pendingList);
});

// POST /api/admin/approve-company/{companyId}
app.MapPost("/api/admin/approve-company/{companyId:int}", async (GrindSetDbContext db, ClaimsPrincipal principal, int companyId) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();
    if (!auth.IsAdmin) return Results.Forbid();

    var user = await db.Users.FirstOrDefaultAsync(u => u.UserId == companyId && u.Role == "Company")
               ?? await db.Users.FirstOrDefaultAsync(u => u.CompanyId == companyId && u.Role == "Company" && u.ApprovalStatus == "PendingAdmin");

    if (user == null) return Results.NotFound(new { message = "Company registration applicant not found." });

    user.ApprovalStatus = "Approved";

    int targetCompId = user.CompanyId ?? user.UserId;
    var comp = await db.Companies.FirstOrDefaultAsync(c => c.CompanyId == targetCompId);
    if (comp != null)
    {
        comp.LicenseStatus = "Active";
    }

    db.SecurityAuditLogs.Add(new SecurityAuditLog
    {
        UserId = auth.UserId,
        Action = "ADMIN_APPROVE_COMPANY_OWNER",
        TargetEntity = $"Owner:{user.Email} approved for Company:{comp?.CompanyName ?? targetCompId.ToString()}",
        EventTime = DateTime.UtcNow
    });

    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Company owner approved successfully!", companyId = user.UserId, approvalStatus = "Approved" });
});

// POST /api/admin/reject-company/{companyId}
app.MapPost("/api/admin/reject-company/{companyId:int}", async (GrindSetDbContext db, ClaimsPrincipal principal, int companyId) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();
    if (!auth.IsAdmin) return Results.Forbid();

    var user = await db.Users.FirstOrDefaultAsync(u => u.UserId == companyId && u.Role == "Company")
               ?? await db.Users.FirstOrDefaultAsync(u => u.CompanyId == companyId && u.Role == "Company" && u.ApprovalStatus == "PendingAdmin");

    if (user == null) return Results.NotFound(new { message = "Company registration applicant not found." });

    user.ApprovalStatus = "Rejected";

    db.SecurityAuditLogs.Add(new SecurityAuditLog
    {
        UserId = auth.UserId,
        Action = "ADMIN_REJECT_COMPANY_OWNER",
        TargetEntity = $"Owner application rejected for User:{user.Email}",
        EventTime = DateTime.UtcNow
    });

    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Company registration rejected.", companyId = user.UserId, approvalStatus = "Rejected" });
});

// POST /api/admin/block-employee/{employeeId}
app.MapPost("/api/admin/block-employee/{employeeId:int}", async (GrindSetDbContext db, ClaimsPrincipal principal, int employeeId) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();
    if (!auth.IsAdmin) return Results.Forbid();

    var user = await db.Users.FirstOrDefaultAsync(u => u.UserId == employeeId);
    if (user == null) return Results.NotFound(new { message = "User not found." });

    user.IsActive = !user.IsActive;

    db.SecurityAuditLogs.Add(new SecurityAuditLog
    {
        UserId = auth.UserId,
        Action = user.IsActive ? "ADMIN_UNBLOCK_EMPLOYEE" : "ADMIN_BLOCK_EMPLOYEE",
        TargetEntity = $"User:{user.Email}",
        EventTime = DateTime.UtcNow
    });

    await db.SaveChangesAsync();
    return Results.Ok(new { message = user.IsActive ? "Employee account unblocked." : "Employee account blocked.", employeeId, isActive = user.IsActive });
});

// POST /api/admin/report-employee/{employeeId}
app.MapPost("/api/admin/report-employee/{employeeId:int}", async (GrindSetDbContext db, ClaimsPrincipal principal, int employeeId, ReportDto dto) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();
    if (!auth.IsAdmin) return Results.Forbid();

    var user = await db.Users.FirstOrDefaultAsync(u => u.UserId == employeeId);
    if (user == null) return Results.NotFound(new { message = "User not found." });

    user.ReportedNote = string.IsNullOrWhiteSpace(dto.Note) ? "Reported by System Admin for compliance review." : dto.Note.Trim();

    db.SecurityAuditLogs.Add(new SecurityAuditLog
    {
        UserId = auth.UserId,
        Action = "ADMIN_REPORT_EMPLOYEE_TO_COMPANY",
        TargetEntity = $"User:{user.Email} | Note: {user.ReportedNote}",
        EventTime = DateTime.UtcNow
    });

    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Employee reported to Company.", employeeId, reportedNote = user.ReportedNote });
});

// GET /api/company/pending-employees/{companyId}
app.MapGet("/api/company/pending-employees/{companyId:int}", async (GrindSetDbContext db, ClaimsPrincipal principal, int companyId) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();
    if (auth.IsCompany && auth.CompanyId != companyId) return Results.Forbid();

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
app.MapPost("/api/company/approve-employee/{employeeId:int}", async (GrindSetDbContext db, ClaimsPrincipal principal, int employeeId) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();
    if (auth.IsEmployee) return Results.Forbid();

    var emp = await db.Employees.FirstOrDefaultAsync(e => e.EmployeeId == employeeId);
    if (emp == null) return Results.NotFound(new { message = "Employee not found." });
    if (!auth.IsAdmin && emp.CompanyId != auth.CompanyId) return Results.Forbid();

    int targetCompanyId = emp.CompanyId;
    var limits = await GetCompanyTierLimitsAsync(db, targetCompanyId);
    if (limits.MaxEmployees.HasValue)
    {
        var approvedCount = await (from empItem in db.Employees
                                   join uItem in db.Users on empItem.EmployeeId equals uItem.UserId
                                   where empItem.CompanyId == targetCompanyId && uItem.ApprovalStatus == "Approved"
                                   select empItem).CountAsync();
        if (approvedCount >= limits.MaxEmployees.Value)
        {
            return Results.BadRequest(new
            {
                message = $"Cannot approve employee: your organization has reached the limit of {limits.MaxEmployees.Value} employees on the {limits.Tier} tier. Upgrade to {(limits.Tier == "Free" ? "Professional ($15/mo) or Enterprise ($29/mo)" : "Enterprise ($29/mo)")} in Billing & Plans to expand your workforce capacity.",
                code = "TIER_LIMIT_EXCEEDED",
                tier = limits.Tier,
                current = approvedCount,
                max = limits.MaxEmployees.Value,
                resource = "Employees"
            });
        }
    }

    var user = await db.Users.FirstOrDefaultAsync(u => u.UserId == employeeId && u.Role == "Employee");
    if (user == null) return Results.NotFound(new { message = "Employee user not found." });

    user.ApprovalStatus = "Approved";

    db.SecurityAuditLogs.Add(new SecurityAuditLog
    {
        UserId = auth.UserId,
        Action = "COMPANY_APPROVE_EMPLOYEE",
        TargetEntity = $"Employee:{user.Email}",
        EventTime = DateTime.UtcNow
    });

    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Employee approved successfully!", employeeId, approvalStatus = "Approved" });
});

// POST /api/company/reject-employee/{employeeId}
app.MapPost("/api/company/reject-employee/{employeeId:int}", async (GrindSetDbContext db, ClaimsPrincipal principal, int employeeId) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();
    if (auth.IsEmployee) return Results.Forbid();

    var emp = await db.Employees.FirstOrDefaultAsync(e => e.EmployeeId == employeeId);
    if (emp == null) return Results.NotFound(new { message = "Employee not found." });
    if (!auth.IsAdmin && emp.CompanyId != auth.CompanyId) return Results.Forbid();

    var user = await db.Users.FirstOrDefaultAsync(u => u.UserId == employeeId && u.Role == "Employee");
    if (user == null) return Results.NotFound(new { message = "Employee user not found." });

    user.ApprovalStatus = "Rejected";

    db.SecurityAuditLogs.Add(new SecurityAuditLog
    {
        UserId = auth.UserId,
        Action = "COMPANY_REJECT_EMPLOYEE",
        TargetEntity = $"Employee:{user.Email}",
        EventTime = DateTime.UtcNow
    });

    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Employee request rejected.", employeeId, approvalStatus = "Rejected" });
});

// GET /api/companies/public-list - Public list of approved companies for signup dropdown
app.MapGet("/api/companies/public-list", async (GrindSetDbContext db) =>
{
    var list = await (from c in db.Companies
                      join u in db.Users on c.CompanyId equals u.UserId
                      where u.ApprovalStatus == "Approved" && u.IsActive
                      select new
                      {
                          c.CompanyId,
                          c.CompanyName,
                          c.Industry
                      }).ToListAsync();
    return Results.Ok(list);
});

// GET /api/companies - All companies overview (Admin gets all, Company gets own)
app.MapGet("/api/companies", async (GrindSetDbContext db, ClaimsPrincipal principal) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();

    IQueryable<Company> compQuery = db.Companies;
    if (auth.IsCompany || auth.IsEmployee)
    {
        int cid = auth.CompanyId ?? 0;
        compQuery = compQuery.Where(c => c.CompanyId == cid);
    }

    var companies = await (from c in compQuery
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
app.MapPost("/api/projects", async (GrindSetDbContext db, ClaimsPrincipal principal, ProjectCreateDto dto) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();
    if (auth.IsEmployee) return Results.Forbid();

    if (string.IsNullOrWhiteSpace(dto.ProjectName))
    {
        return Results.BadRequest(new { message = "Project Name is required." });
    }

    int companyId = auth.IsCompany ? auth.CompanyId!.Value : (dto.CompanyId > 0 ? dto.CompanyId : 1);

    // Check tier limits for company
    var limits = await GetCompanyTierLimitsAsync(db, companyId);
    if (limits.MaxProjects.HasValue)
    {
        var existingProjectsCount = await db.Projects.CountAsync(p => p.CompanyId == companyId);
        if (existingProjectsCount >= limits.MaxProjects.Value)
        {
            return Results.BadRequest(new
            {
                message = $"Your organization has reached the limit of {limits.MaxProjects.Value} {(limits.MaxProjects.Value == 1 ? "project" : "projects")} on the {limits.Tier} tier. Upgrade to {(limits.Tier == "Free" ? "Professional ($15/mo) or Enterprise ($29/mo)" : "Enterprise ($29/mo)")} in Billing & Plans to create more projects.",
                code = "TIER_LIMIT_EXCEEDED",
                tier = limits.Tier,
                current = existingProjectsCount,
                max = limits.MaxProjects.Value,
                resource = "Projects"
            });
        }
    }

    var project = new Project
    {
        CompanyId = companyId,
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

    // Assign Project Manager if specified
    if (dto.ProjectManagerId.HasValue && dto.ProjectManagerId.Value > 0)
    {
        var pm = await db.Employees.FirstOrDefaultAsync(e => e.EmployeeId == dto.ProjectManagerId.Value && e.CompanyId == companyId);
        if (pm != null)
        {
            project.ProjectManagerId = pm.EmployeeId;
            db.ProjectAssignments.Add(new ProjectAssignment
            {
                ProjectId = project.ProjectId,
                EmployeeId = pm.EmployeeId,
                RoleInProject = "Project Manager"
            });
        }
    }

    db.SecurityAuditLogs.Add(new SecurityAuditLog
    {
        UserId = auth.UserId,
        Action = "CREATE_PROJECT",
        TargetEntity = $"Project:{project.ProjectName} (CompanyId:{companyId})",
        EventTime = DateTime.UtcNow
    });

    await db.SaveChangesAsync();
    return Results.Created($"/api/projects/{project.ProjectId}", project);
});

// POST /api/projects/{id}/assign-manager - Company Owner designates or reassigns Project Manager
app.MapPost("/api/projects/{id:int}/assign-manager", async (GrindSetDbContext db, ClaimsPrincipal principal, int id, AssignManagerDto dto) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();
    if (auth.IsEmployee) return Results.Forbid(); // Only Company Owner or Admin can assign PM

    var project = await db.Projects.FindAsync(id);
    if (project == null) return Results.NotFound(new { message = "Project not found." });

    if (!auth.IsAdmin && project.CompanyId != auth.CompanyId)
    {
        return Results.Forbid();
    }

    var emp = await db.Employees.FirstOrDefaultAsync(e => e.EmployeeId == dto.ProjectManagerId && e.CompanyId == project.CompanyId);
    if (emp == null)
    {
        return Results.BadRequest(new { message = "Selected employee not found in company workforce." });
    }

    project.ProjectManagerId = emp.EmployeeId;

    var existingAssign = await db.ProjectAssignments.FirstOrDefaultAsync(a => a.ProjectId == project.ProjectId && a.EmployeeId == emp.EmployeeId);
    if (existingAssign != null)
    {
        existingAssign.RoleInProject = "Project Manager";
    }
    else
    {
        db.ProjectAssignments.Add(new ProjectAssignment
        {
            ProjectId = project.ProjectId,
            EmployeeId = emp.EmployeeId,
            RoleInProject = "Project Manager"
        });
    }

    db.SecurityAuditLogs.Add(new SecurityAuditLog
    {
        UserId = auth.UserId,
        Action = "ASSIGN_PROJECT_MANAGER",
        TargetEntity = $"Project:{project.ProjectName} -> PM:{emp.FullName}",
        EventTime = DateTime.UtcNow
    });

    await db.SaveChangesAsync();
    return Results.Ok(new
    {
        message = $"Successfully assigned {emp.FullName} as Project Manager.",
        projectId = project.ProjectId,
        projectManagerId = emp.EmployeeId,
        projectManagerName = emp.FullName
    });
});

// GET /api/projects/{id}/members - Retrieve team roster for a project
app.MapGet("/api/projects/{id:int}/members", async (GrindSetDbContext db, ClaimsPrincipal principal, int id) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();

    var project = await db.Projects.FindAsync(id);
    if (project == null) return Results.NotFound(new { message = "Project not found." });

    if (!auth.IsAdmin && project.CompanyId != auth.CompanyId)
    {
        return Results.Forbid();
    }

    var assignments = await (from a in db.ProjectAssignments
                             where a.ProjectId == id
                             join e in db.Employees on a.EmployeeId equals e.EmployeeId
                             join u in db.Users on e.EmployeeId equals u.UserId
                             select new
                             {
                                 a.AssignmentId,
                                 a.ProjectId,
                                 a.EmployeeId,
                                 e.FullName,
                                 e.Designation,
                                 u.Email,
                                 a.RoleInProject,
                                 IsProjectManager = project.ProjectManagerId == e.EmployeeId
                             }).ToListAsync();

    return Results.Ok(assignments);
});

// POST /api/projects/{id}/members - PM or Company Owner recruits member from workforce
app.MapPost("/api/projects/{id:int}/members", async (GrindSetDbContext db, ClaimsPrincipal principal, int id, ProjectMemberDto dto) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();

    var project = await db.Projects.FindAsync(id);
    if (project == null) return Results.NotFound(new { message = "Project not found." });

    if (!auth.IsAdmin && project.CompanyId != auth.CompanyId)
    {
        return Results.Forbid();
    }

    // Must be Company Owner OR the designated Project Manager
    if (auth.IsEmployee)
    {
        int empId = auth.EmployeeId ?? auth.UserId;
        if (project.ProjectManagerId != empId)
        {
            return Results.Json(new { message = "Forbidden. Only the designated Project Manager or Company Owner can recruit members to this project." }, statusCode: 403);
        }
    }

    var emp = await db.Employees.FirstOrDefaultAsync(e => e.EmployeeId == dto.EmployeeId && e.CompanyId == project.CompanyId);
    if (emp == null)
    {
        return Results.BadRequest(new { message = "Employee not found in company workforce." });
    }

    var existing = await db.ProjectAssignments.FirstOrDefaultAsync(a => a.ProjectId == id && a.EmployeeId == dto.EmployeeId);
    if (existing != null)
    {
        existing.RoleInProject = string.IsNullOrWhiteSpace(dto.RoleInProject) ? existing.RoleInProject : dto.RoleInProject.Trim();
    }
    else
    {
        existing = new ProjectAssignment
        {
            ProjectId = id,
            EmployeeId = dto.EmployeeId,
            RoleInProject = string.IsNullOrWhiteSpace(dto.RoleInProject) ? "Team Member" : dto.RoleInProject.Trim()
        };
        db.ProjectAssignments.Add(existing);
    }

    db.SecurityAuditLogs.Add(new SecurityAuditLog
    {
        UserId = auth.UserId,
        Action = "ADD_PROJECT_MEMBER",
        TargetEntity = $"Project:{project.ProjectName} -> Member:{emp.FullName}",
        EventTime = DateTime.UtcNow
    });

    await db.SaveChangesAsync();
    return Results.Ok(new
    {
        message = $"Successfully added {emp.FullName} to project roster.",
        member = new
        {
            existing.AssignmentId,
            existing.ProjectId,
            existing.EmployeeId,
            emp.FullName,
            emp.Designation,
            existing.RoleInProject,
            IsProjectManager = project.ProjectManagerId == emp.EmployeeId
        }
    });
});

// DELETE /api/projects/{id}/members/{employeeId} - PM or Company Owner removes member from roster
app.MapDelete("/api/projects/{id:int}/members/{employeeId:int}", async (GrindSetDbContext db, ClaimsPrincipal principal, int id, int employeeId) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();

    var project = await db.Projects.FindAsync(id);
    if (project == null) return Results.NotFound(new { message = "Project not found." });

    if (!auth.IsAdmin && project.CompanyId != auth.CompanyId)
    {
        return Results.Forbid();
    }

    if (auth.IsEmployee)
    {
        int empId = auth.EmployeeId ?? auth.UserId;
        if (project.ProjectManagerId != empId)
        {
            return Results.Json(new { message = "Forbidden. Only the designated Project Manager or Company Owner can remove members from this project." }, statusCode: 403);
        }
    }

    if (project.ProjectManagerId == employeeId)
    {
        return Results.BadRequest(new { message = "Cannot remove the Project Manager from the roster. Reassign the Project Manager first." });
    }

    var assign = await db.ProjectAssignments.FirstOrDefaultAsync(a => a.ProjectId == id && a.EmployeeId == employeeId);
    if (assign != null)
    {
        db.ProjectAssignments.Remove(assign);
        await db.SaveChangesAsync();
    }

    return Results.Ok(new { message = "Member removed from project roster successfully." });
});

// GET /api/projects/{id}/chat/messages - Retrieve message history and chat metadata
app.MapGet("/api/projects/{id:int}/chat/messages", async (GrindSetDbContext db, ClaimsPrincipal principal, int id) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();

    var project = await db.Projects.FindAsync(id);
    if (project == null) return Results.NotFound(new { message = "Project not found." });

    bool isAuthorized = false;
    if (auth.IsAdmin) isAuthorized = true;
    else if (auth.IsCompany && auth.CompanyId == project.CompanyId) isAuthorized = true;
    else if (auth.IsEmployee)
    {
        int empId = auth.EmployeeId ?? auth.UserId;
        if (project.ProjectManagerId == empId) isAuthorized = true;
        else
        {
            bool isAssigned = await db.ProjectAssignments.AnyAsync(a => a.ProjectId == id && a.EmployeeId == empId);
            if (isAssigned) isAuthorized = true;
        }
    }

    if (!isAuthorized)
    {
        return Results.Json(new { message = "Access Denied. You must be the Project Manager or an assigned team member on this project to view discussions." }, statusCode: 403);
    }

    string pmName = "Unassigned PM";
    string pmEmail = "";
    string pmDesignation = "";
    if (project.ProjectManagerId.HasValue)
    {
        var pmEmp = await db.Employees.FindAsync(project.ProjectManagerId.Value);
        if (pmEmp != null)
        {
            pmName = pmEmp.FullName;
            pmDesignation = pmEmp.Designation;
            var pmUser = await db.Users.FindAsync(pmEmp.EmployeeId);
            pmEmail = pmUser?.Email ?? "";
        }
    }

    var members = await (from a in db.ProjectAssignments
                         where a.ProjectId == id
                         join e in db.Employees on a.EmployeeId equals e.EmployeeId
                         join u in db.Users on e.EmployeeId equals u.UserId
                         select new
                         {
                             e.EmployeeId,
                             e.FullName,
                             e.Designation,
                             u.Email,
                             a.RoleInProject,
                             IsProjectManager = project.ProjectManagerId == e.EmployeeId
                         }).ToListAsync();

    var messages = await db.ProjectChatMessages
        .Where(m => m.ProjectId == id)
        .OrderBy(m => m.SentAt)
        .Take(200)
        .ToListAsync();

    return Results.Ok(new
    {
        projectId = id,
        projectName = project.ProjectName,
        projectManagerId = project.ProjectManagerId,
        projectManagerName = pmName,
        projectManagerEmail = pmEmail,
        projectManagerDesignation = pmDesignation,
        currentUserId = auth.UserId,
        currentUserRole = auth.Role,
        isProjectManager = auth.IsEmployee && project.ProjectManagerId == (auth.EmployeeId ?? auth.UserId),
        members = members,
        messages = messages
    });
});

// POST /api/projects/{id}/chat/messages - Send chat message (broadcasts real-time via SignalR)
app.MapPost("/api/projects/{id:int}/chat/messages", async (GrindSetDbContext db, IHubContext<ProjectChatHub> hubContext, ClaimsPrincipal principal, int id, SendChatMessageDto dto) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();

    if (string.IsNullOrWhiteSpace(dto.MessageText))
    {
        return Results.BadRequest(new { message = "Message content cannot be empty." });
    }

    if (dto.MessageText.Trim().Length > 2000)
    {
        return Results.BadRequest(new { message = "Message exceeds maximum length of 2000 characters." });
    }

    var project = await db.Projects.FindAsync(id);
    if (project == null) return Results.NotFound(new { message = "Project not found." });

    string senderName = "User";
    string senderRole = "Member";
    bool isAuthorized = false;

    if (auth.IsAdmin)
    {
        isAuthorized = true;
        senderName = "System Administrator";
        senderRole = "SuperAdmin";
    }
    else if (auth.IsCompany && auth.CompanyId == project.CompanyId)
    {
        isAuthorized = true;
        var comp = await db.Companies.FindAsync(project.CompanyId);
        senderName = comp?.CompanyName ?? "Company Owner";
        senderRole = "Company Owner";
    }
    else if (auth.IsEmployee)
    {
        int empId = auth.EmployeeId ?? auth.UserId;
        var emp = await db.Employees.FindAsync(empId);
        if (emp != null && emp.CompanyId == project.CompanyId)
        {
            bool isPm = project.ProjectManagerId == empId;
            bool isAssigned = isPm || await db.ProjectAssignments.AnyAsync(a => a.ProjectId == id && a.EmployeeId == empId);

            if (isAssigned)
            {
                isAuthorized = true;
                senderName = emp.FullName;
                senderRole = isPm ? "Project Manager" : (emp.Designation ?? "Team Member");
            }
        }
    }

    if (!isAuthorized)
    {
        return Results.Json(new { message = "Access Denied. Only the Project Manager and assigned team members can chat on this project." }, statusCode: 403);
    }

    var user = await db.Users.FindAsync(auth.UserId);
    var chatMsg = new ProjectChatMessage
    {
        ProjectId = id,
        SenderUserId = auth.UserId,
        SenderName = senderName,
        SenderEmail = user?.Email ?? "",
        SenderRole = senderRole,
        MessageText = dto.MessageText.Trim(),
        SentAt = DateTime.UtcNow
    };

    db.ProjectChatMessages.Add(chatMsg);
    await db.SaveChangesAsync();

    // Broadcast via SignalR to group
    await hubContext.Clients.Group($"project_{id}").SendAsync("ReceiveChatMessage", new
    {
        messageId = chatMsg.MessageId,
        projectId = chatMsg.ProjectId,
        senderUserId = chatMsg.SenderUserId,
        senderName = chatMsg.SenderName,
        senderEmail = chatMsg.SenderEmail,
        senderRole = chatMsg.SenderRole,
        messageText = chatMsg.MessageText,
        sentAt = chatMsg.SentAt
    });

    return Results.Created($"/api/projects/{id}/chat/messages/{chatMsg.MessageId}", chatMsg);
});

// GET /api/tasks - Get tasks scoped by tenant/role
app.MapGet("/api/tasks", async (GrindSetDbContext db, ClaimsPrincipal principal, bool? myTasksOnly) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();

    IQueryable<TaskItem> taskQuery = db.Tasks;
    if (auth.IsCompany)
    {
        int cid = auth.CompanyId ?? 0;
        var projectIds = db.Projects.Where(p => p.CompanyId == cid).Select(p => p.ProjectId);
        taskQuery = taskQuery.Where(t => projectIds.Contains(t.ProjectId));
    }
    else if (auth.IsEmployee)
    {
        int cid = auth.CompanyId ?? 0;
        var projectIds = db.Projects.Where(p => p.CompanyId == cid).Select(p => p.ProjectId);
        taskQuery = taskQuery.Where(t => projectIds.Contains(t.ProjectId));

        if (myTasksOnly == true)
        {
            taskQuery = taskQuery.Where(t => t.AssigneeId == auth.UserId);
        }
    }

    var tasks = await (from t in taskQuery
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

// POST /api/tasks - Create new task (Scoped to project)
app.MapPost("/api/tasks", async (GrindSetDbContext db, ClaimsPrincipal principal, TaskCreateDto dto) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();

    if (string.IsNullOrWhiteSpace(dto.Title))
    {
        return Results.BadRequest(new { message = "Task Title is required." });
    }

    var project = await db.Projects.FindAsync(dto.ProjectId);
    if (project == null)
    {
        return Results.BadRequest(new { message = "Invalid Project ID. Every task must be bound to a specific project." });
    }

    if (!auth.IsAdmin && (project.CompanyId != auth.CompanyId))
    {
        return Results.Forbid();
    }

    int? assignee = dto.AssigneeId;
    if (auth.IsEmployee)
    {
        int empId = auth.EmployeeId ?? auth.UserId;
        bool isPM = project.ProjectManagerId == empId;
        bool isMember = isPM || await db.ProjectAssignments.AnyAsync(a => a.ProjectId == project.ProjectId && a.EmployeeId == empId);

        if (!isMember)
        {
            return Results.Json(new { message = "Forbidden. You are not a member of this project." }, statusCode: 403);
        }

        if (assignee.HasValue && assignee.Value > 0 && assignee.Value != empId)
        {
            if (!isPM)
            {
                return Results.Json(new { message = "Forbidden. Only the designated Project Manager (or Company Owner) can assign tasks to other employees." }, statusCode: 403);
            }

            bool assigneeInProject = project.ProjectManagerId == assignee.Value || await db.ProjectAssignments.AnyAsync(a => a.ProjectId == project.ProjectId && a.EmployeeId == assignee.Value);
            if (!assigneeInProject)
            {
                return Results.BadRequest(new { message = "Assignee must be an active member of this project." });
            }
        }
        else if (!assignee.HasValue || assignee.Value == 0)
        {
            assignee = empId;
        }
    }
    else if (auth.IsCompany)
    {
        if (assignee.HasValue && assignee.Value > 0)
        {
            bool inCompany = await db.Employees.AnyAsync(e => e.CompanyId == auth.CompanyId && e.EmployeeId == assignee.Value);
            if (!inCompany)
            {
                return Results.BadRequest(new { message = "Assignee is not an employee of your company." });
            }
        }
    }

    var task = new TaskItem
    {
        ProjectId = dto.ProjectId,
        AssigneeId = assignee,
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
        UserId = auth.UserId,
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
app.MapPut("/api/tasks/{id:int}", async (GrindSetDbContext db, ClaimsPrincipal principal, int id, TaskUpdateDto dto) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();

    var task = await db.Tasks.FindAsync(id);
    if (task == null) return Results.NotFound(new { message = "Task not found." });

    var project = await db.Projects.FindAsync(task.ProjectId);
    if (!auth.IsAdmin && (project == null || project.CompanyId != auth.CompanyId))
    {
        return Results.Forbid();
    }

    if (auth.IsEmployee)
    {
        int empId = auth.EmployeeId ?? auth.UserId;
        bool isPM = project.ProjectManagerId == empId;
        bool isMember = isPM || await db.ProjectAssignments.AnyAsync(a => a.ProjectId == project.ProjectId && a.EmployeeId == empId);

        if (!isMember)
        {
            return Results.Json(new { message = "Forbidden. You are not a member of this project." }, statusCode: 403);
        }

        // If not PM, member can only update task status
        if (!isPM)
        {
            if (dto.AssigneeId.HasValue && dto.AssigneeId.Value != task.AssigneeId)
            {
                return Results.Json(new { message = "Forbidden. Only the Project Manager or Company Owner can reassign tasks." }, statusCode: 403);
            }
            if (!string.IsNullOrWhiteSpace(dto.Title) && dto.Title != task.Title)
            {
                return Results.Json(new { message = "Forbidden. Only the Project Manager or Company Owner can edit task metadata." }, statusCode: 403);
            }
        }
        else
        {
            if (dto.AssigneeId.HasValue && dto.AssigneeId.Value != task.AssigneeId)
            {
                bool inRoster = project.ProjectManagerId == dto.AssigneeId.Value || await db.ProjectAssignments.AnyAsync(a => a.ProjectId == project.ProjectId && a.EmployeeId == dto.AssigneeId.Value);
                if (!inRoster)
                {
                    return Results.BadRequest(new { message = "Assignee must be an active member of this project." });
                }
            }
        }
    }

    if (!string.IsNullOrWhiteSpace(dto.Title)) task.Title = dto.Title.Trim();
    if (dto.Description != null) task.Description = dto.Description.Trim();
    if (!string.IsNullOrWhiteSpace(dto.Priority)) task.Priority = dto.Priority.Trim();
    if (!string.IsNullOrWhiteSpace(dto.Status)) task.Status = dto.Status.Trim();
    if (dto.AssigneeId.HasValue) task.AssigneeId = dto.AssigneeId.Value;
    if (dto.StoryPoints.HasValue && dto.StoryPoints.Value > 0) task.StoryPoints = dto.StoryPoints.Value;
    if (dto.ProjectId.HasValue && dto.ProjectId.Value > 0)
    {
        var newProj = await db.Projects.FindAsync(dto.ProjectId.Value);
        if (newProj != null && (auth.IsAdmin || newProj.CompanyId == auth.CompanyId))
        {
            task.ProjectId = dto.ProjectId.Value;
        }
    }

    await db.SaveChangesAsync();
    return Results.Ok(task);
});

// DELETE /api/tasks/{id} - Delete task
app.MapDelete("/api/tasks/{id:int}", async (GrindSetDbContext db, ClaimsPrincipal principal, int id) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();

    var task = await db.Tasks.FindAsync(id);
    if (task == null) return Results.NotFound(new { message = "Task not found." });

    var project = await db.Projects.FindAsync(task.ProjectId);
    if (!auth.IsAdmin && (project == null || project.CompanyId != auth.CompanyId))
    {
        return Results.Forbid();
    }

    db.Tasks.Remove(task);
    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Task deleted successfully.", taskId = id });
});

// POST /api/finance/accounts - Create Financial Account
app.MapPost("/api/finance/accounts", async (GrindSetDbContext db, ClaimsPrincipal principal, AccountCreateDto dto) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();

    if (string.IsNullOrWhiteSpace(dto.AccountName))
    {
        return Results.BadRequest(new { message = "Account Name is required." });
    }

    var project = await db.Projects.FindAsync(dto.ProjectId);
    if (project == null) return Results.BadRequest(new { message = "Project not found." });
    if (!auth.IsAdmin && project.CompanyId != auth.CompanyId) return Results.Forbid();

    if (auth.IsEmployee)
    {
        int empId = auth.EmployeeId ?? auth.UserId;
        if (project.ProjectManagerId != empId)
        {
            return Results.Json(new { message = "Forbidden. Only the designated Project Manager or Company Owner can create financial accounts." }, statusCode: 403);
        }
    }

    var account = new FinancialAccount
    {
        ProjectId = dto.ProjectId,
        AccountName = dto.AccountName.Trim(),
        AllocatedBudget = dto.AllocatedBudget > 0 ? dto.AllocatedBudget : 50000.00m,
        CurrentBalance = dto.AllocatedBudget > 0 ? dto.AllocatedBudget : 50000.00m
    };

    db.FinancialAccounts.Add(account);
    await db.SaveChangesAsync();

    db.SecurityAuditLogs.Add(new SecurityAuditLog
    {
        UserId = auth.UserId,
        Action = "CREATE_FINANCIAL_ACCOUNT",
        TargetEntity = $"Account:{account.AccountName} (${account.AllocatedBudget})",
        EventTime = DateTime.UtcNow
    });
    await db.SaveChangesAsync();

    return Results.Created($"/api/finance/accounts/{account.AccountId}", account);
});

// POST /api/finance/reallocate - Inter-Account Budget Transfer
app.MapPost("/api/finance/reallocate", async (GrindSetDbContext db, ClaimsPrincipal principal, FundReallocateDto dto) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();

    if (dto.Amount <= 0) return Results.BadRequest(new { message = "Reallocation amount must be greater than zero." });
    if (string.IsNullOrWhiteSpace(dto.Reason)) return Results.BadRequest(new { message = "Reason is required for audit reallocation." });

    var source = await db.FinancialAccounts.FindAsync(dto.SourceAccountId);
    var target = await db.FinancialAccounts.FindAsync(dto.TargetAccountId);

    if (source == null || target == null)
    {
        return Results.BadRequest(new { message = "Source or target financial account not found." });
    }

    var srcProj = await db.Projects.FindAsync(source.ProjectId);
    var tgtProj = await db.Projects.FindAsync(target.ProjectId);

    if (!auth.IsAdmin && (srcProj == null || srcProj.CompanyId != auth.CompanyId || tgtProj == null || tgtProj.CompanyId != auth.CompanyId))
    {
        return Results.Forbid();
    }

    if (auth.IsEmployee)
    {
        int empId = auth.EmployeeId ?? auth.UserId;
        if (srcProj.ProjectManagerId != empId || tgtProj.ProjectManagerId != empId)
        {
            return Results.Json(new { message = "Forbidden. Only the designated Project Manager of these accounts (or Company Owner) can reallocate funds." }, statusCode: 403);
        }
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
        UserId = auth.UserId,
        Action = "REALLOCATE_FUNDS",
        TargetEntity = $"From {source.AccountName} To {target.AccountName} (${dto.Amount})",
        EventTime = DateTime.UtcNow
    });

    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Funds reallocated successfully!", record });
});

// POST /api/finance/expense-claim - Employee Reimbursement Claim Submission
app.MapPost("/api/finance/expense-claim", async (GrindSetDbContext db, ClaimsPrincipal principal, ExpenseClaimDto dto) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();

    if (dto.Amount <= 0) return Results.BadRequest(new { message = "Claim amount must be greater than zero." });
    if (string.IsNullOrWhiteSpace(dto.Type)) return Results.BadRequest(new { message = "Expense type is required." });

    var account = await db.FinancialAccounts.FindAsync(dto.AccountId);
    if (account == null) return Results.BadRequest(new { message = "Financial account not found." });

    var proj = await db.Projects.FindAsync(account.ProjectId);
    if (!auth.IsAdmin && (proj == null || proj.CompanyId != auth.CompanyId))
    {
        return Results.Forbid();
    }

    int empId = auth.IsEmployee ? auth.UserId : (dto.EmployeeId > 0 ? dto.EmployeeId : auth.UserId);

    if (auth.IsEmployee)
    {
        bool isMember = proj.ProjectManagerId == empId || await db.ProjectAssignments.AnyAsync(a => a.ProjectId == proj.ProjectId && a.EmployeeId == empId);
        if (!isMember)
        {
            return Results.Json(new { message = "Forbidden. You must be an assigned member or Project Manager of this project to submit expense claims." }, statusCode: 403);
        }
    }

    var tx = new Transaction
    {
        AccountId = dto.AccountId,
        LoggedByEmployeeId = empId,
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

// POST /api/finance/approve-expense/{id} - Project Manager or Company Owner Approval
app.MapPost("/api/finance/approve-expense/{id:int}", async (GrindSetDbContext db, ClaimsPrincipal principal, int id) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();

    var tx = await db.Transactions.FindAsync(id);
    if (tx == null) return Results.NotFound(new { message = "Transaction not found." });

    var account = await db.FinancialAccounts.FindAsync(tx.AccountId);
    var proj = account != null ? await db.Projects.FindAsync(account.ProjectId) : null;

    if (!auth.IsAdmin && (proj == null || proj.CompanyId != auth.CompanyId))
    {
        return Results.Forbid();
    }

    if (auth.IsEmployee)
    {
        int empId = auth.EmployeeId ?? auth.UserId;
        if (proj.ProjectManagerId != empId)
        {
            return Results.Json(new { message = "Forbidden. Only the designated Project Manager for this project (or Company Owner) can approve expenses." }, statusCode: 403);
        }
    }

    if (tx.Status == "Approved") return Results.Ok(new { message = "Expense is already approved." });

    tx.Status = "Approved";
    if (account != null)
    {
        account.CurrentBalance -= tx.Amount;
    }

    db.SecurityAuditLogs.Add(new SecurityAuditLog
    {
        UserId = auth.UserId,
        Action = "APPROVE_EXPENSE_CLAIM",
        TargetEntity = $"Expense #{tx.TransactionId} (${tx.Amount})",
        EventTime = DateTime.UtcNow
    });

    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Expense claim approved successfully!", transaction = tx });
});

// POST /api/finance/reject-expense/{id} - Project Manager or Company Owner Rejection
app.MapPost("/api/finance/reject-expense/{id:int}", async (GrindSetDbContext db, ClaimsPrincipal principal, int id) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();

    var tx = await db.Transactions.FindAsync(id);
    if (tx == null) return Results.NotFound(new { message = "Transaction not found." });

    var account = await db.FinancialAccounts.FindAsync(tx.AccountId);
    var proj = account != null ? await db.Projects.FindAsync(account.ProjectId) : null;

    if (!auth.IsAdmin && (proj == null || proj.CompanyId != auth.CompanyId))
    {
        return Results.Forbid();
    }

    if (auth.IsEmployee)
    {
        int empId = auth.EmployeeId ?? auth.UserId;
        if (proj.ProjectManagerId != empId)
        {
            return Results.Json(new { message = "Forbidden. Only the designated Project Manager for this project (or Company Owner) can reject expenses." }, statusCode: 403);
        }
    }

    tx.Status = "Rejected";

    db.SecurityAuditLogs.Add(new SecurityAuditLog
    {
        UserId = auth.UserId,
        Action = "REJECT_EXPENSE_CLAIM",
        TargetEntity = $"Expense #{tx.TransactionId} (${tx.Amount})",
        EventTime = DateTime.UtcNow
    });

    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Expense claim rejected.", transaction = tx });
});

// GET /api/finance/export/csv - Download General Ledger CSV Report
app.MapGet("/api/finance/export/csv", async (GrindSetDbContext db, ClaimsPrincipal principal) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();

    IQueryable<Transaction> txQuery = db.Transactions;
    if (auth.IsEmployee)
    {
        txQuery = txQuery.Where(tx => tx.LoggedByEmployeeId == auth.UserId);
    }
    else if (auth.IsCompany)
    {
        int cid = auth.CompanyId ?? 0;
        var pids = db.Projects.Where(p => p.CompanyId == cid).Select(p => p.ProjectId);
        var aids = db.FinancialAccounts.Where(a => pids.Contains(a.ProjectId)).Select(a => a.AccountId);
        txQuery = txQuery.Where(tx => aids.Contains(tx.AccountId));
    }

    var txs = await (from t in txQuery
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

// ==========================================
// 💳 SUBSCRIPTION & STRIPE BILLING ENDPOINTS
// ==========================================

// GET /api/subscription/plans
app.MapGet("/api/subscription/plans", () =>
{
    var plans = new[]
    {
        new
        {
            Id = "Free",
            Name = "Community Edition",
            Tagline = "Essential ERP tools for small squads (1 project & up to 10 employees)",
            MonthlyPrice = 0m,
            YearlyPrice = 0m,
            Features = new[]
            {
                "Limit: 1 Active Project",
                "Limit: Up to 10 Employees",
                "Full 3-Tier RBC Enterprise Access",
                "Standard Kanban Sprint Boards",
                "Expense Claim Submission & Tracking",
                "Cross-Department Budget Allocation",
                "Standard Audit Log Access"
            },
            Highlight = false,
            Badge = "Current Free Tier"
        },
        new
        {
            Id = "Pro",
            Name = "Professional Tier",
            Tagline = "Accelerate workforce scale: up to 5 projects & 30 team seats",
            MonthlyPrice = 15m,
            YearlyPrice = 150m,
            Features = new[]
            {
                "Limit: Up to 5 Active Projects",
                "Limit: Up to 30 Employees",
                "Everything in Community Free",
                "Priority Financial CSV & Ledger Exports",
                "Extended 1-Year Audit Log Retention",
                "Sprint Velocity & Analytics Insights",
                "Verified Pro Organization Badge"
            },
            Highlight = true,
            Badge = "Most Popular"
        },
        new
        {
            Id = "Enterprise",
            Name = "Enterprise Suite",
            Tagline = "Advanced governance, unlimited scale & global financial operations",
            MonthlyPrice = 29m,
            YearlyPrice = 290m,
            Features = new[]
            {
                "Unlimited Projects (No Limits)",
                "Unlimited Employees (No Limits)",
                "Everything in Professional Tier",
                "Unlimited Multi-Department Allocations",
                "Dedicated System Security SLA",
                "Custom Automated Webhook Integrations",
                "Elite Enterprise Tenant Status"
            },
            Highlight = false,
            Badge = "Full Power"
        }
    };
    return Results.Ok(plans);
});

// GET /api/subscription/current
app.MapGet("/api/subscription/current", async (GrindSetDbContext db, ClaimsPrincipal principal) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();
    if (!auth.IsCompany) return Results.Json(new { message = "Subscriptions are managed exclusively by Company Owners." }, statusCode: 403);

    int compId = auth.CompanyId ?? auth.UserId;

    var sub = await db.Subscriptions.FirstOrDefaultAsync(s => s.CompanyId == compId);
    if (sub == null)
    {
        sub = new CompanySubscription
        {
            CompanyId = compId,
            PlanTier = "Free",
            BillingCycle = "Monthly",
            Price = 0.00m,
            Status = "Active",
            PaymentMethod = "Community Free Plan",
            CurrentPeriodStart = DateTime.UtcNow,
            CurrentPeriodEnd = DateTime.UtcNow.AddYears(1),
            CreatedAt = DateTime.UtcNow
        };
        db.Subscriptions.Add(sub);
        await db.SaveChangesAsync();
    }

    var company = await db.Companies.FirstOrDefaultAsync(c => c.CompanyId == compId);
    var invoices = await db.SubscriptionInvoices
        .Where(i => i.CompanyId == compId)
        .OrderByDescending(i => i.IssuedAt)
        .Take(10)
        .ToListAsync();

    var limits = await GetCompanyTierLimitsAsync(db, compId);
    var projectsCount = await db.Projects.CountAsync(p => p.CompanyId == compId);
    var employeesCount = await (from empItem in db.Employees
                                join uItem in db.Users on empItem.EmployeeId equals uItem.UserId
                                where empItem.CompanyId == compId && uItem.ApprovalStatus == "Approved"
                                select empItem).CountAsync();

    return Results.Ok(new
    {
        subscription = sub,
        companyName = company?.CompanyName ?? "Organization",
        invoices = invoices,
        usage = new
        {
            tier = limits.Tier,
            projectsCount = projectsCount,
            maxProjects = limits.MaxProjects,
            employeesCount = employeesCount,
            maxEmployees = limits.MaxEmployees
        }
    });
});

// POST /api/subscription/checkout
app.MapPost("/api/subscription/checkout", async (GrindSetDbContext db, ClaimsPrincipal principal, SubscriptionCheckoutDto dto) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();
    if (!auth.IsCompany) return Results.Json(new { message = "Only Company Owners can subscribe or upgrade tiers." }, statusCode: 403);

    int compId = auth.CompanyId ?? auth.UserId;
    var company = await db.Companies.FirstOrDefaultAsync(c => c.CompanyId == compId);

    var targetTier = dto.PlanTier switch
    {
        "Pro" => "Pro",
        "Enterprise" => "Enterprise",
        _ => "Free"
    };

    var targetCycle = dto.BillingCycle switch
    {
        "Yearly" => "Yearly",
        _ => "Monthly"
    };

    decimal price = targetTier switch
    {
        "Pro" => targetCycle == "Yearly" ? 150.00m : 15.00m,
        "Enterprise" => targetCycle == "Yearly" ? 290.00m : 29.00m,
        _ => 0.00m
    };

    var sub = await db.Subscriptions.FirstOrDefaultAsync(s => s.CompanyId == compId);
    if (sub == null)
    {
        sub = new CompanySubscription
        {
            CompanyId = compId
        };
        db.Subscriptions.Add(sub);
    }

    sub.PlanTier = targetTier;
    sub.BillingCycle = targetCycle;
    sub.Price = price;
    sub.Status = "Active";
    sub.CurrentPeriodStart = DateTime.UtcNow;
    sub.CurrentPeriodEnd = targetCycle == "Yearly" ? DateTime.UtcNow.AddYears(1) : DateTime.UtcNow.AddMonths(1);

    string last4 = string.IsNullOrWhiteSpace(dto.CardLast4) ? "4242" : dto.CardLast4.Trim();
    sub.PaymentMethod = targetTier == "Free" ? "Community Free Plan" : $"Stripe (Visa •••• {last4})";

    // Generate Subscription Invoice if paid tier
    SubscriptionInvoice? invoice = null;
    if (price > 0)
    {
        invoice = new SubscriptionInvoice
        {
            CompanyId = compId,
            InvoiceNumber = $"INV-{DateTime.UtcNow:yyyyMM}-{Random.Shared.Next(1000, 9999)}",
            Amount = price,
            Currency = "USD",
            PlanName = $"{targetTier} Tier ({targetCycle})",
            Status = "Paid",
            PaymentMethod = sub.PaymentMethod,
            IssuedAt = DateTime.UtcNow,
            ReceiptUrl = $"#receipt-{Guid.NewGuid():N}"
        };
        db.SubscriptionInvoices.Add(invoice);
    }

    // Audit Log
    db.SecurityAuditLogs.Add(new SecurityAuditLog
    {
        UserId = auth.UserId,
        Action = "COMPANY_SUBSCRIBE",
        TargetEntity = $"Subscription:{targetTier} ({targetCycle}) for {company?.CompanyName ?? "Company"}",
        EventTime = DateTime.UtcNow
    });

    await db.SaveChangesAsync();

    return Results.Ok(new
    {
        message = $"Successfully subscribed to {targetTier} Plan!",
        subscription = sub,
        invoice = invoice
    });
});

// POST /api/subscription/cancel
app.MapPost("/api/subscription/cancel", async (GrindSetDbContext db, ClaimsPrincipal principal) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();
    if (!auth.IsCompany) return Results.Json(new { message = "Only Company Owners can manage subscription cancellations." }, statusCode: 403);

    int compId = auth.CompanyId ?? auth.UserId;
    var sub = await db.Subscriptions.FirstOrDefaultAsync(s => s.CompanyId == compId);
    if (sub == null) return Results.NotFound(new { message = "No active subscription found." });

    sub.Status = "Cancelled";

    db.SecurityAuditLogs.Add(new SecurityAuditLog
    {
        UserId = auth.UserId,
        Action = "COMPANY_CANCEL_SUBSCRIPTION",
        TargetEntity = $"Subscription:Cancelled {sub.PlanTier} renewal for Company #{compId}",
        EventTime = DateTime.UtcNow
    });

    await db.SaveChangesAsync();

    return Results.Ok(new
    {
        message = "Subscription renewal cancelled. You will retain current tier access through the end of the billing period.",
        subscription = sub
    });
});

// GET /api/subscription/invoices
app.MapGet("/api/subscription/invoices", async (GrindSetDbContext db, ClaimsPrincipal principal) =>
{
    var auth = await GetAuthContextAsync(principal, db);
    if (!auth.IsAuthenticated) return Results.Unauthorized();
    if (!auth.IsCompany) return Results.Json(new { message = "Only Company Owners can view subscription invoices." }, statusCode: 403);

    int compId = auth.CompanyId ?? auth.UserId;
    var invoices = await db.SubscriptionInvoices
        .Where(i => i.CompanyId == compId)
        .OrderByDescending(i => i.IssuedAt)
        .ToListAsync();

    return Results.Ok(invoices);
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

static async Task<AuthUserContext> GetAuthContextAsync(ClaimsPrincipal? principal, GrindSetDbContext db)
{
    if (principal == null || principal.Identity?.IsAuthenticated != true)
    {
        return new AuthUserContext(false, 0, "", null, null);
    }

    var idStr = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (!int.TryParse(idStr, out int userId))
    {
        return new AuthUserContext(false, 0, "", null, null);
    }

    var role = principal.FindFirst(ClaimTypes.Role)?.Value ?? "";
    int? companyId = null;
    int? employeeId = null;

    var compClaim = principal.FindFirst("companyId")?.Value;
    if (int.TryParse(compClaim, out int cid))
    {
        companyId = cid;
    }

    if (role == "Company")
    {
        if (!companyId.HasValue)
        {
            var userEntity = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.UserId == userId);
            companyId = userEntity?.CompanyId ?? userId;
        }
    }
    else if (role == "Employee")
    {
        employeeId = userId;
        if (!companyId.HasValue)
        {
            var emp = await db.Employees.AsNoTracking().FirstOrDefaultAsync(e => e.EmployeeId == userId);
            companyId = emp?.CompanyId;
        }
    }

    return new AuthUserContext(true, userId, role, companyId, employeeId);
}

static async Task<TierLimits> GetCompanyTierLimitsAsync(GrindSetDbContext db, int companyId)
{
    var sub = await db.Subscriptions.FirstOrDefaultAsync(s => s.CompanyId == companyId);
    string tier = (sub != null && sub.Status == "Active") ? sub.PlanTier : "Free";

    return tier switch
    {
        "Pro" => new TierLimits("Pro", 5, 30),
        "Enterprise" => new TierLimits("Enterprise", null, null),
        _ => new TierLimits("Free", 1, 10)
    };
}

// DTO Records
public record EmployeeDto(string Email, string FullName, string Designation, decimal HourlyRate);
public record TransactionDto(int AccountId, int LoggedByEmployeeId, string Type, decimal Amount);
public record SignUpDto(string Email, string Password, string FullName, string Role, string? Designation, decimal HourlyRate, string? CompanyName, string? Industry, int? CompanyId);
public record LoginDto(string Email, string Password);
public record LoginRequestDto(string Email, string Password);
public record ReportDto(string Note);
public record ProjectCreateDto(int CompanyId, string ProjectName, decimal TotalBudget, string? Status, string? ScopeDescription, string? Objectives, int? ProjectManagerId = null);
public record AssignManagerDto(int ProjectManagerId);
public record ProjectMemberDto(int EmployeeId, string? RoleInProject);
public record TaskCreateDto(int ProjectId, int? AssigneeId, string Title, string? Description, string? Priority, string? Status, int StoryPoints);
public record TaskUpdateDto(int? ProjectId, int? AssigneeId, string? Title, string? Description, string? Priority, string? Status, int? StoryPoints);
public record AccountCreateDto(int ProjectId, string AccountName, decimal AllocatedBudget);
public record FundReallocateDto(int ProjectId, int SourceAccountId, int TargetAccountId, decimal Amount, string Reason);
public record ExpenseClaimDto(int AccountId, int EmployeeId, string Type, decimal Amount, string? Note);
public record SubscriptionCheckoutDto(string PlanTier, string BillingCycle, string? CardholderName, string? CardLast4, string? PaymentMethodToken);
public record ForgotPasswordDto(string Email);
public record ResetPasswordDto(string Token, string NewPassword);
public record TierLimits(string Tier, int? MaxProjects, int? MaxEmployees);
public record SendChatMessageDto(string MessageText);

// Auth Context
public record AuthUserContext(bool IsAuthenticated, int UserId, string Role, int? CompanyId, int? EmployeeId)
{
    public bool IsAdmin => Role == "Admin";
    public bool IsCompany => Role == "Company";
    public bool IsEmployee => Role == "Employee";
}
