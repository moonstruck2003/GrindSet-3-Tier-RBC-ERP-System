using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using GrindSet.Api.Models;
using Microsoft.IdentityModel.Tokens;

namespace GrindSet.Api.Services;

public class JwtTokenService
{
    public const string SecretKey = "GrindSet_Enterprise_ERP_Super_Secret_JWT_Signing_Key_2026_Enterprise_Grade!";
    public const string Issuer = "GrindSetERP";
    public const string Audience = "GrindSetClients";

    public static string GenerateToken(User user, string fullName = "")
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(SecretKey);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("approvalStatus", user.ApprovalStatus ?? "Approved"),
            new Claim("isActive", user.IsActive.ToString())
        };

        if (!string.IsNullOrEmpty(fullName))
        {
            claims.Add(new Claim(ClaimTypes.Name, fullName));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(7),
            Issuer = Issuer,
            Audience = Audience,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature
            )
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
