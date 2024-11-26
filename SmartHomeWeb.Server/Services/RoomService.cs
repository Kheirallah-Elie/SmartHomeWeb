public class RoomService
{
    private readonly HomeService _homeService;
    private readonly UserService _userService;

    public RoomService(UserService userService, HomeService homeService)
    {
        _userService = userService;
        _homeService = homeService;
    }

    public async Task AddRoomAsync(string userId, string homeId, Room room)
    {
        var user = await _userService.GetUserByIdAsync(userId);
        var home = user.Homes.Find(h => h.HomeId == homeId);
        home.Rooms.Add(room);
        await _userService.UpdateUserAsync(userId, user);
    }

    public async Task<List<Room>> GetRoomsByHomeIdAsync(string userId, string homeId) =>
        (await _userService.GetUserByIdAsync(userId))?.Homes.Find(h => h.HomeId == homeId)?.Rooms ?? new List<Room>();

    public async Task DeleteRoomAsync(string userId, string homeId, string roomId)
    {
        var user = await _userService.GetUserByIdAsync(userId);
        var home = user.Homes.Find(h => h.HomeId == homeId);
        home.Rooms.RemoveAll(r => r.RoomId == roomId);
        await _userService.UpdateUserAsync(userId, user);
    }
}
