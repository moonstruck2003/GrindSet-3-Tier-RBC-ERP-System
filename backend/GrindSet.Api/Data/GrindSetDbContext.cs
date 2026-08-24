using Microsoft.EntityFrameworkCore;
using GrindSet.Api.Models;

namespace GrindSet.Api.Data
{
    public class GrindSetDbContext : DbContext
    {
        public GrindSetDbContext(DbContextOptions<GrindSetDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<PasswordReset> PasswordResets { get; set; } = null!;
        public DbSet<SecurityAuditLog> SecurityAuditLogs { get; set; } = null!;
        public DbSet<Admin> Admins { get; set; } = null!;
        public DbSet<Company> Companies { get; set; } = null!;
        public DbSet<Department> Departments { get; set; } = null!;
        public DbSet<Project> Projects { get; set; } = null!;
        public DbSet<Employee> Employees { get; set; } = null!;
        public DbSet<Stakeholder> Stakeholders { get; set; } = null!;
        public DbSet<ProjectTimeline> ProjectTimelines { get; set; } = null!;
        public DbSet<ProjectArchive> ProjectArchives { get; set; } = null!;
        public DbSet<FinancialAccount> FinancialAccounts { get; set; } = null!;
        public DbSet<BudgetAlert> BudgetAlerts { get; set; } = null!;
        public DbSet<FundReallocation> FundReallocations { get; set; } = null!;
        public DbSet<ProjectScope> ProjectScopes { get; set; } = null!;
        public DbSet<DeadlineExtension> DeadlineExtensions { get; set; } = null!;
        public DbSet<FinancialReport> FinancialReports { get; set; } = null!;
        public DbSet<Transaction> Transactions { get; set; } = null!;
        public DbSet<ProjectAssignment> ProjectAssignments { get; set; } = null!;
        public DbSet<FinancialExport> FinancialExports { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure entity keys and foreign key relationships if needed
            modelBuilder.Entity<User>().HasKey(u => u.UserId);
            modelBuilder.Entity<Company>().HasKey(c => c.CompanyId);
            modelBuilder.Entity<Admin>().HasKey(a => a.AdminId);
            modelBuilder.Entity<Employee>().HasKey(e => e.EmployeeId);
            modelBuilder.Entity<Department>().HasKey(d => d.DepartmentId);
            modelBuilder.Entity<Project>().HasKey(p => p.ProjectId);
        }
    }
}
