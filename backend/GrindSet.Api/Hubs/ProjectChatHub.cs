using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace GrindSet.Api.Hubs
{
    public class ProjectChatHub : Hub
    {
        public async Task JoinProjectChat(int projectId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"project_{projectId}");
        }

        public async Task LeaveProjectChat(int projectId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"project_{projectId}");
        }

        public async Task SendMessage(int projectId, object message)
        {
            await Clients.Group($"project_{projectId}").SendAsync("ReceiveProjectMessage", message);
        }
    }
}
