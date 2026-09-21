using System.Threading.Tasks;
using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;

namespace GrindSet.Api.Hubs
{
    public class ProjectChatHub : Hub
    {
        public async Task JoinProjectChat(int projectId)
        {
            var role = Context.User?.FindFirst(ClaimTypes.Role)?.Value;
            if (role == "Admin")
            {
                // System Admin is restricted from internal project communications
                return;
            }
            await Groups.AddToGroupAsync(Context.ConnectionId, $"project_{projectId}");
        }

        public async Task LeaveProjectChat(int projectId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"project_{projectId}");
        }

        public async Task SendMessage(int projectId, object message)
        {
            var role = Context.User?.FindFirst(ClaimTypes.Role)?.Value;
            if (role == "Admin")
            {
                return;
            }
            await Clients.Group($"project_{projectId}").SendAsync("ReceiveProjectMessage", message);
        }
    }
}
