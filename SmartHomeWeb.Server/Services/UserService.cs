using MongoDB.Driver;
using System.Threading.Tasks;
using System.Collections.Generic;

public class UserService
{
    private readonly MongoDBContext _context;

    public UserService(MongoDBContext context)
    {
        _context = context;
    }

    public async Task<List<User>> GetUsersAsync() =>
        await _context.Users.Find(_ => true).ToListAsync();

    public async Task<User> GetUserByIdAsync(string userId) =>
        await _context.Users.Find(user => user.UserId == userId).FirstOrDefaultAsync();

    public async Task CreateUserAsync(User user) =>
        await _context.Users.InsertOneAsync(user);

    public async Task<User> AuthenticateAsync(string email, string password) =>
        await _context.Users.Find(u => u.Email == email && u.Password == password).FirstOrDefaultAsync();

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
        (await GetUserByIdAsync(userId))?.Homes;

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
        (await GetUserByIdAsync(userId))?.Homes.Find(h => h.HomeId == homeId)?.Rooms;

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
