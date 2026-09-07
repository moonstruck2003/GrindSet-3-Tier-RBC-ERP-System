using System.Net;
using System.Net.Mail;

namespace GrindSet.Api.Services;

public interface IEmailService
{
    Task<(bool Success, string Message, string ResetUrl)> SendPasswordResetEmailAsync(
        string toEmail,
        string recipientName,
        string resetToken,
        string? customResetUrl = null);
}

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task<(bool Success, string Message, string ResetUrl)> SendPasswordResetEmailAsync(
        string toEmail,
        string recipientName,
        string resetToken,
        string? customResetUrl = null)
    {
        var smtpSection = _config.GetSection("SmtpSettings");
        var host = smtpSection.GetValue<string>("Host") ?? "smtp-relay.brevo.com";
        var port = smtpSection.GetValue<int?>("Port") ?? 587;
        var senderName = smtpSection.GetValue<string>("SenderName") ?? "GrindSet Security";
        var senderEmail = smtpSection.GetValue<string>("SenderEmail") ?? "security@grindset.io";
        var username = smtpSection.GetValue<string>("Username") ?? Environment.GetEnvironmentVariable("BREVO_SMTP_USER") ?? "";
        var password = smtpSection.GetValue<string>("Password") ?? Environment.GetEnvironmentVariable("BREVO_SMTP_KEY") ?? "";
        var enableSsl = smtpSection.GetValue<bool?>("EnableSsl") ?? true;
        var frontendBaseUrl = smtpSection.GetValue<string>("FrontendBaseUrl") ?? "http://localhost:5173";

        var resetUrl = !string.IsNullOrWhiteSpace(customResetUrl)
            ? customResetUrl
            : $"{frontendBaseUrl.TrimEnd('/')}/reset-password?token={Uri.EscapeDataString(resetToken)}";

        var safeName = string.IsNullOrWhiteSpace(recipientName) ? "GrindSet User" : recipientName;

        var htmlBody = $@"<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1.0'>
  <title>Reset Your GrindSet Password</title>
</head>
<body style='margin:0;padding:0;background-color:#070C18;font-family:-apple-system,BlinkMacSystemFont,""Segoe UI"",Roboto,Oxygen,Ubuntu,Cantarell,sans-serif;color:#F4F5F7;'>
  <table width='100%' border='0' cellspacing='0' cellpadding='0' style='background-color:#070C18;padding:40px 20px;'>
    <tr>
      <td align='center'>
        <table width='100%' max-width='560' border='0' cellspacing='0' cellpadding='0' style='max-width:560px;background-color:#0B1B3D;border:1px solid rgba(255,255,255,0.12);border-radius:20px;overflow:hidden;box-shadow:0 25px 50px -12px rgba(0,0,0,0.7);'>
          <!-- Header Banner -->
          <tr>
            <td style='padding:36px 36px 24px;text-align:center;background:linear-gradient(135deg, #0052CC 0%, #172B4D 100%);'>
              <div style='display:inline-block;width:52px;height:52px;border-radius:14px;background:#0052CC;line-height:52px;font-size:26px;box-shadow:0 10px 20px rgba(0,82,204,0.4);'>
                🛡️
              </div>
              <h1 style='margin:16px 0 4px;font-size:24px;font-weight:800;letter-spacing:-0.5px;color:#FFFFFF;'>GrindSet Security</h1>
              <p style='margin:0;font-size:13px;color:#DEEBFF;letter-spacing:0.5px;text-transform:uppercase;'>3-Tier RBC ERP Authentication</p>
            </td>
          </tr>
          
          <!-- Content Body -->
          <tr>
            <td style='padding:32px 36px;'>
              <h2 style='margin:0 0 16px;font-size:18px;font-weight:700;color:#F4F5F7;'>Password Reset Request</h2>
              <p style='margin:0 0 20px;font-size:14px;line-height:1.6;color:#A5B4CB;'>
                Hello <strong style='color:#FFFFFF;'>{WebUtility.HtmlEncode(safeName)}</strong>,
              </p>
              <p style='margin:0 0 24px;font-size:14px;line-height:1.6;color:#A5B4CB;'>
                We received a request to reset the password for your GrindSet ERP account (<strong style='color:#4C9AFF;'>{WebUtility.HtmlEncode(toEmail)}</strong>). Click the button below to establish a new secure password:
              </p>

              <!-- CTA Button -->
              <div style='text-align:center;margin:32px 0;'>
                <a href='{resetUrl}' target='_blank' style='display:inline-block;padding:14px 32px;background:linear-gradient(135deg, #0052CC, #4C9AFF);color:#FFFFFF;text-decoration:none;font-weight:700;font-size:15px;border-radius:12px;box-shadow:0 10px 25px -5px rgba(0,82,204,0.5);letter-spacing:0.3px;'>
                  Reset My Password &rarr;
                </a>
              </div>

              <!-- Expiry Alert -->
              <div style='padding:14px 18px;border-radius:12px;background:rgba(255,171,0,0.1);border:1px solid rgba(255,171,0,0.3);margin-bottom:24px;'>
                <p style='margin:0;font-size:12px;line-height:1.5;color:#FFE380;'>
                  ⏱️ <strong>Security Notice:</strong> This reset link is single-use and will expire in <strong>60 minutes</strong>. If you did not make this request, you can safely disregard this email.
                </p>
              </div>

              <!-- Fallback Link -->
              <p style='margin:0 0 8px;font-size:12px;color:#8993A4;'>
                If the button above does not work, copy and paste this URL into your browser:
              </p>
              <p style='margin:0;font-size:11px;word-break:break-all;color:#4C9AFF;background:rgba(255,255,255,0.04);padding:10px 14px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);'>
                {resetUrl}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style='padding:20px 36px;background-color:#07122A;border-top:1px solid rgba(255,255,255,0.06);text-align:center;'>
              <p style='margin:0 0 6px;font-size:11px;color:#6B778C;'>
                GrindSet 3-Tier RBC Enterprise Resource Planning System
              </p>
              <p style='margin:0;font-size:10px;color:#505F79;'>
                Automated security notification &bull; Please do not reply directly to this email
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>";

        // Check if SMTP credentials are provided
        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
        {
            _logger.LogInformation(
                "[EmailService Dev Sandbox Mode] SMTP credentials not set in appsettings.json. Reset link generated for {Email}: {ResetUrl}",
                toEmail, resetUrl);

            return (true, "SMTP sandbox test mode active. Password reset link generated successfully.", resetUrl);
        }

        try
        {
            using var client = new SmtpClient(host, port)
            {
                EnableSsl = enableSsl,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(username, password),
                Timeout = 15000
            };

            using var message = new MailMessage
            {
                From = new MailAddress(senderEmail, senderName),
                Subject = "GrindSet ERP - Password Reset Request",
                Body = htmlBody,
                IsBodyHtml = true
            };
            message.To.Add(new MailAddress(toEmail, safeName));

            await client.SendMailAsync(message);
            _logger.LogInformation("[EmailService] Password reset email successfully dispatched via SMTP to {Email}", toEmail);

            return (true, "Password reset email dispatched successfully via SMTP.", resetUrl);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[EmailService] Failed to send SMTP password reset email to {Email}. Reset URL is still valid: {ResetUrl}", toEmail, resetUrl);
            return (false, $"SMTP send error: {ex.Message}", resetUrl);
        }
    }
}
