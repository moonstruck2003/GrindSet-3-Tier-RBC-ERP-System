using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GrindSet.Api.Models
{
    public class User
    {
        [Key]
        public int UserId { get; set; }
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;
        [Required]
        public string PasswordHash { get; set; } = string.Empty;
        [Required]
        public string Role { get; set; } = "Employee"; // Admin, Company, Employee
        public bool IsActive { get; set; } = true;
        public string ApprovalStatus { get; set; } = "Approved"; // Approved, PendingAdmin, PendingCompany, Rejected
        public string? ReportedNote { get; set; }
    }

    public class PasswordReset
    {
        [Key]
        public int ResetId { get; set; }
        public int UserId { get; set; }
        public string ResetToken { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public string Status { get; set; } = "Pending";
    }

    public class SecurityAuditLog
    {
        [Key]
        public int AuditLogId { get; set; }
        public int UserId { get; set; }
        public string Action { get; set; } = string.Empty;
        public string TargetEntity { get; set; } = string.Empty;
        public DateTime EventTime { get; set; } = DateTime.UtcNow;
    }

    public class Admin
    {
        [Key, ForeignKey("User")]
        public int AdminId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string AccessLevel { get; set; } = "SuperAdmin";
    }

    public class Company
    {
        [Key, ForeignKey("User")]
        public int CompanyId { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string RegistrationNo { get; set; } = string.Empty;
        public string Industry { get; set; } = string.Empty;
        public string LicenseStatus { get; set; } = "Active";
    }

    public class Department
    {
        [Key]
        public int DepartmentId { get; set; }
        public int CompanyId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
    }

    public class Project
    {
        [Key]
        public int ProjectId { get; set; }
        public int CompanyId { get; set; }
        public int? ProjectManagerId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public string Status { get; set; } = "In Progress";
        public decimal TotalBudget { get; set; }
    }

    public class Employee
    {
        [Key, ForeignKey("User")]
        public int EmployeeId { get; set; }
        public int CompanyId { get; set; }
        public int DepartmentId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Designation { get; set; } = string.Empty;
        public decimal HourlyRate { get; set; }
    }

    public class Stakeholder
    {
        [Key]
        public int StakeholderId { get; set; }
        public int ProjectId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string StakeholderRole { get; set; } = string.Empty;
    }

    public class ProjectTimeline
    {
        [Key]
        public int TimelineId { get; set; }
        public int ProjectId { get; set; }
        public DateTime PlannedStart { get; set; }
        public DateTime PlannedEnd { get; set; }
        public string Status { get; set; } = "On Track";
    }

    public class ProjectArchive
    {
        [Key]
        public int ArchiveId { get; set; }
        public int ProjectId { get; set; }
        public DateTime ArchivedAt { get; set; } = DateTime.UtcNow;
        public string ArchiveReason { get; set; } = string.Empty;
    }

    public class FinancialAccount
    {
        [Key]
        public int AccountId { get; set; }
        public int ProjectId { get; set; }
        public string AccountName { get; set; } = string.Empty;
        public decimal AllocatedBudget { get; set; }
        public decimal CurrentBalance { get; set; }
    }

    public class BudgetAlert
    {
        [Key]
        public int AlertId { get; set; }
        public int ProjectId { get; set; }
        public int AccountId { get; set; }
        public string AlertType { get; set; } = "Warning";
        public decimal ActualAmount { get; set; }
        public string Status { get; set; } = "Unresolved";
    }

    public class FundReallocation
    {
        [Key]
        public int ReallocationId { get; set; }
        public int ProjectId { get; set; }
        public int AccountId { get; set; }
        public int TargetAccountId { get; set; }
        public decimal Amount { get; set; }
        public string Reason { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class ProjectScope
    {
        [Key]
        public int ScopeId { get; set; }
        public int ProjectId { get; set; }
        public string ScopeDescription { get; set; } = string.Empty;
        public string Objectives { get; set; } = string.Empty;
    }

    public class DeadlineExtension
    {
        [Key]
        public int ExtensionId { get; set; }
        public int ProjectId { get; set; }
        public DateTime OldDeadline { get; set; }
        public DateTime RequestedDeadline { get; set; }
        public string Status { get; set; } = "Pending";
    }

    public class FinancialReport
    {
        [Key]
        public int ReportId { get; set; }
        public int ProjectId { get; set; }
        public int GeneratedBy { get; set; } // EmployeeId
        public string ReportType { get; set; } = "Quarterly";
        public decimal TotalIncome { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal NetProfit { get; set; }
    }

    public class Transaction
    {
        [Key]
        public int TransactionId { get; set; }
        public int AccountId { get; set; }
        public int LoggedByEmployeeId { get; set; }
        public string Type { get; set; } = "Expense";
        public decimal Amount { get; set; }
        public string Status { get; set; } = "Approved"; // Approved, PendingApproval, Rejected
        public string? Note { get; set; }
        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
    }

    public class ProjectAssignment
    {
        [Key]
        public int AssignmentId { get; set; }
        public int ProjectId { get; set; }
        public int EmployeeId { get; set; }
        public string RoleInProject { get; set; } = "Developer";
    }

    public class FinancialExport
    {
        [Key]
        public int ExportId { get; set; }
        public int ReportId { get; set; }
        public int ExportedBy { get; set; } // UserId
        public string FileFormat { get; set; } = "PDF";
        public string FileName { get; set; } = string.Empty;
    }

    public class TaskItem
    {
        [Key]
        public int TaskId { get; set; }
        public int ProjectId { get; set; }
        public int? AssigneeId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Priority { get; set; } = "Medium"; // Highest, High, Medium, Low
        public string Status { get; set; } = "To Do"; // To Do, In Progress, In Review, Done
        public int StoryPoints { get; set; } = 3;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
