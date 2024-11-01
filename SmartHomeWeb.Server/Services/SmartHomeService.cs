using MongoDB.Driver;
using MongoDB.Bson;
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

    public async Task UpdateUserAsync(string userId, User updatedUser) =>
        await _context.Users.ReplaceOneAsync(u => u.UserId == userId, updatedUser);

    public async Task AddHomeAsync(string userId, Home home)
    {
        var user = await GetUserByIdAsync(userId);
        user.Homes.Add(home);
        await UpdateUserAsync(userId, user);
    }

    public async Task<User> DeleteUserAsync(string id) =>
        await _context.Users.FindOneAndDeleteAsync(user => user.UserId == id);

    public async Task ToggleDeviceStateAsync(string userId, string homeId, string roomId, string deviceId)
    {
        var user = await GetUserByIdAsync(userId);
        var home = user.Homes.Find(h => h.HomeId == homeId);
        var room = home?.Rooms.Find(r => r.RoomId == roomId);
        var device = room?.Devices.Find(d => d.DeviceId == deviceId);
        
        if (device != null)
        {
            device.State = !device.State;
            await UpdateUserAsync(userId, user);
        }
    }
}

