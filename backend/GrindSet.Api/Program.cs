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
    var users = await db.Users.Select(u => new { u.UserId, u.Email, u.Role, u.IsActive }).ToListAsync();
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
                              join emp in db.Employees on tx.LoggedByEmployeeId equals emp.EmployeeId into empGroup
                              from emp in empGroup.DefaultIfEmpty()
                              select new
                              {
                                  tx.TransactionId,
                                  tx.AccountId,
                                  AccountName = acc.AccountName,
                                  LoggedBy = emp != null ? emp.FullName : "System",
                                  tx.Type,
                                  tx.Amount,
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
    var accounts = await db.FinancialAccounts.ToListAsync();
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

app.Run();

// DTO Records
public record EmployeeDto(string Email, string FullName, string Designation, decimal HourlyRate);
public record TransactionDto(int AccountId, int LoggedByEmployeeId, string Type, decimal Amount);

