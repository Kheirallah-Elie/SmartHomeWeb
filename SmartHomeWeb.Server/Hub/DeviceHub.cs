using Microsoft.AspNetCore.SignalR;

public class DeviceHub : Hub
{
    public async Task SendMessage(string message)
    {
        Console.WriteLine($"message: {message}");
    }
}
