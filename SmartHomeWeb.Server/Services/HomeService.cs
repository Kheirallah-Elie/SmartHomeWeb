public class HomeService
{
    private readonly UserService _userService;

    public HomeService(UserService userService)
    {
        _userService = userService;
    }

    public async Task AddHomeAsync(string userId, Home home)
    {
        var user = await _userService.GetUserByIdAsync(userId);
        user.Homes.Add(home);
        await _userService.UpdateUserAsync(userId, user);
    }

    public async Task<List<Home>> GetHomesByUserIdAsync(string userId) =>
        (await _userService.GetUserByIdAsync(userId))?.Homes ?? new List<Home>();

    public async Task DeleteHomeAsync(string userId, string homeId)
    {
        var user = await _userService.GetUserByIdAsync(userId);
        user.Homes.RemoveAll(h => h.HomeId == homeId);
        await _userService.UpdateUserAsync(userId, user);
    }
}
