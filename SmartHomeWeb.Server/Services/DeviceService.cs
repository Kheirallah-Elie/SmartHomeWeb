﻿using Microsoft.AspNetCore.SignalR;
using System.Text;
using System.Text.Json;

public class DeviceService
{
    private readonly UserService _userService;
    private readonly IHubContext<DeviceHub> _deviceHubContext;
    private readonly HttpClient _httpClient;

    public DeviceService(UserService userService, IHubContext<DeviceHub> deviceHubContext, HttpClient httpClient)
    {
        _userService = userService;
        _deviceHubContext = deviceHubContext;
        _httpClient = httpClient;
    }

    public async Task AddDeviceAsync(string userId, string homeId, string roomId, Device device)
    {
        var user = await _userService.GetUserByIdAsync(userId);
        var home = user.Homes.Find(h => h.HomeId == homeId);
        var room = home.Rooms.Find(r => r.RoomId == roomId);
        room.Devices.Add(device);
        await _userService.UpdateUserAsync(userId, user);
    }

    public async Task ToggleDeviceStateAsync(string userId, string homeId, string roomId, string deviceId)
    {
        var user = await _userService.GetUserByIdAsync(userId);
        var device = user.Homes.Find(h => h.HomeId == homeId)
                              ?.Rooms.Find(r => r.RoomId == roomId)
                              ?.Devices.Find(d => d.DeviceId == deviceId);

        if (device != null)
        {
            device.State = !device.State;
            await _userService.UpdateUserAsync(userId, user);

            await _deviceHubContext.Clients.All.SendAsync("DeviceStateChanged", new
            {
                UserId = userId,
                HomeId = homeId,
                RoomId = roomId,
                DeviceId = deviceId,
                NewState = device.State
            });

            var functionUrl = "http://smarthomeapp.azurewebsites.net/api/negotiate";
            var requestData = new { DeviceId = deviceId, NewState = device.State };
            var jsonContent = new StringContent(JsonSerializer.Serialize(requestData), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(functionUrl, jsonContent);

            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine($"Failed to notify Azure function: {response.StatusCode}");
            }
        }
    }

    public async Task DeleteDeviceAsync(string userId, string homeId, string roomId, string deviceId)
    {
        var user = await _userService.GetUserByIdAsync(userId);
        var room = user.Homes.Find(h => h.HomeId == homeId)?.Rooms.Find(r => r.RoomId == roomId);
        room?.Devices.RemoveAll(d => d.DeviceId == deviceId);
        await _userService.UpdateUserAsync(userId, user);
    }
}
