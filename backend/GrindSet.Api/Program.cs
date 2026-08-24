using GrindSet.Api.Data;
using Microsoft.EntityFrameworkCore;

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

app.Run();
