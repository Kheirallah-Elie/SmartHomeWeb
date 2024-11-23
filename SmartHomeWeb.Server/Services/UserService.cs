using MongoDB.Driver;
using Microsoft.AspNetCore.SignalR;
using System.Text;
using System.Text.Json;
using BCrypt.Net; // Import the BCrypt.Net library for password hashing

public class UserService
{
    private readonly MongoDBContext _context;
    private readonly IHubContext<DeviceHub> _deviceHubContext;
    private readonly HttpClient _httpClient; // Add an HttpClient instance

    // Constructor injection of HttpClient
    public UserService(MongoDBContext context, IHubContext<DeviceHub> deviceHubContext, HttpClient httpClient)
    {
        _context = context;
        _deviceHubContext = deviceHubContext;
        _httpClient = httpClient;
    }

    public async Task<List<User>> GetUsersAsync() =>
        await _context.Users.Find(_ => true).ToListAsync();

    public async Task<User> GetUserByIdAsync(string userId) =>
        await _context.Users.Find(user => user.UserId == userId).FirstOrDefaultAsync();

    public async Task<string> CreateUserAsync(User user)
    {
        try
        {
            // Check if the email already exists
            var existingUser = await _context.Users.Find(u => u.Email == user.Email).FirstOrDefaultAsync();
            if (existingUser != null)
            {
                return "Email already in use. Please choose another one.";
            }

            // Hash the password before saving it to the database
            Console.WriteLine($"Registered User: {user.Email}, Password Hash: {user.Password}");
            user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);

            // Insert the user into the MongoDB collection
            await _context.Users.InsertOneAsync(user);
            return "User registered successfully.";
        }
        catch (Exception ex)
        {
            // Log the error for debugging
            Console.WriteLine($"Error occurred while creating user: {ex.Message}");
            throw; // Optionally rethrow the exception or handle it
        }
    }

    public async Task<User> AuthenticateAsync(string email, string password)
    {
        // Find the user in the Db. If the user exists and the provided password matches the hashed password
        User user = await _context.Users.Find(u => u.Email == email).FirstOrDefaultAsync();
        /*if (user != null && BCrypt.Net.BCrypt.Verify(password, user.Password))
        {
            return user; //if authentication is successful
        }
        Console.WriteLine(user + "not found!");
        return null; //if authentication fails*/
        Console.WriteLine(user + "found");
        return user;
    }

    public async Task<bool> UpdateUserAsync(string userId, User updatedUser)
    {
        var result = await _context.Users.ReplaceOneAsync(u => u.UserId == userId, updatedUser);
        return result.IsAcknowledged && result.ModifiedCount > 0;
    }

    public async Task<User> DeleteUserAsync(string id) =>
        await _context.Users.FindOneAndDeleteAsync(user => user.UserId == id);

    public async Task AddHomeAsync(string userId, Home home)
    {
        var user = await GetUserByIdAsync(userId);
        user.Homes.Add(home);
        await UpdateUserAsync(userId, user);
    }

    public async Task<List<Home>> GetHomesByUserIdAsync(string userId) =>
    (await GetUserByIdAsync(userId))?.Homes ?? new List<Home>();
    public async Task DeleteHomeAsync(string userId, string homeId)
    {
        var user = await GetUserByIdAsync(userId);
        user.Homes.RemoveAll(h => h.HomeId == homeId);
        await UpdateUserAsync(userId, user);
    }

    public async Task AddRoomAsync(string userId, string homeId, Room room)
    {
        var user = await GetUserByIdAsync(userId);
        var home = user.Homes.Find(h => h.HomeId == homeId);
        home.Rooms.Add(room);
        await UpdateUserAsync(userId, user);
    }

    public async Task<List<Room>> GetRoomsByHomeIdAsync(string userId, string homeId) =>
        (await GetUserByIdAsync(userId))?.Homes.Find(h => h.HomeId == homeId)?.Rooms ?? new List<Room>();

    public async Task DeleteRoomAsync(string userId, string homeId, string roomId)
    {
        var user = await GetUserByIdAsync(userId);
        var home = user.Homes.Find(h => h.HomeId == homeId);
        home.Rooms.RemoveAll(r => r.RoomId == roomId);
        await UpdateUserAsync(userId, user);
    }

    public async Task AddDeviceAsync(string userId, string homeId, string roomId, Device device)
    {
        var user = await GetUserByIdAsync(userId);
        var home = user.Homes.Find(h => h.HomeId == homeId);
        var room = home.Rooms.Find(r => r.RoomId == roomId);
        room.Devices.Add(device);
        await UpdateUserAsync(userId, user);
    }



    public async Task ToggleDeviceStateAsync(string userId, string homeId, string roomId, string deviceId)
    {
        var user = await GetUserByIdAsync(userId);
        var device = user.Homes.Find(h => h.HomeId == homeId)
                              ?.Rooms.Find(r => r.RoomId == roomId)
                              ?.Devices.Find(d => d.DeviceId == deviceId);

        if (device != null)
        {
            device.State = !device.State;
            await UpdateUserAsync(userId, user);

            // Notify connected clients about the state change
            // SignalR Code from Web App Server to Web App Client starts
            await _deviceHubContext.Clients.All.SendAsync("DeviceStateChanged", new
            {
                UserId = userId,
                HomeId = homeId,
                RoomId = roomId,
                DeviceId = deviceId,
                NewState = device.State
            });
            // SignalR Code from Web App Server to Web App Client ends

            
            // SignalR Code to Web App Server to Azure Function starts
            var functionUrl = "http://smarthomeapp.azurewebsites.net/api/negotiate"; 

            // Prepare to send a request to the Azure function
            var requestData = new
            {
                DeviceId = deviceId,
                NewState = device.State
            };

            var jsonContent = new StringContent(JsonSerializer.Serialize(requestData), Encoding.UTF8, "application/json");

            // Send the HTTP request to the Azure function for testing / Not working yet
            var response = await _httpClient.PostAsync(functionUrl, jsonContent);
            if (response.IsSuccessStatusCode)
            {
                Console.WriteLine("Device toggle event successfully sent to Azure function.");
            }
            else
            {
                Console.WriteLine($"Failed to notify Azure function: {response.StatusCode}");
            }
            // SignalR Code to Web App Server to Azure Function ends
            
        }
    }

    public async Task DeleteDeviceAsync(string userId, string homeId, string roomId, string deviceId)
    {
        var user = await GetUserByIdAsync(userId);
        var room = user.Homes.Find(h => h.HomeId == homeId)?.Rooms.Find(r => r.RoomId == roomId);
        room?.Devices.RemoveAll(d => d.DeviceId == deviceId);
        await UpdateUserAsync(userId, user);
    }
}
