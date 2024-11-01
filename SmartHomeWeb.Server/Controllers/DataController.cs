using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using MongoDB.Bson;

[Route("api/[controller]")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly UserService _userService;

    public UserController(UserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _userService.GetUsersAsync();
        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(string id)
    {
        var user = await _userService.GetUserByIdAsync(id);
        return user == null ? NotFound() : Ok(user);
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser(User user)
    {
        await _userService.CreateUserAsync(user);
        return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, user);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var user = await _userService.DeleteUserAsync(id);
        return user == null ? NotFound() : NoContent();
    }

    [HttpPost("{userId}/homes")]
    public async Task<IActionResult> AddHome(string userId, Home home)
    {
        await _userService.AddHomeAsync(userId, home);
        return NoContent();
    }

    [HttpPut("{userId}/homes/{homeId}/rooms/{roomId}/devices/{deviceId}/toggle")]
    public async Task<IActionResult> ToggleDeviceState(string userId, string homeId, string roomId, string deviceId)
    {
        await _userService.ToggleDeviceStateAsync(userId, homeId, roomId, deviceId);
        return NoContent();
    }
}
