using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

[Route("api/User/{userId}/homes")]
[ApiController]
public class HomeController : ControllerBase
{
    private readonly UserService _userService;

    public HomeController(UserService userService)
    {
        _userService = userService;
    }

    [HttpPost]
    public async Task<IActionResult> AddHome(string userId, Home home)
    {
        await _userService.AddHomeAsync(userId, home);
        return Ok(home);
    }

    [HttpGet]
    public async Task<IActionResult> GetHomes(string userId)
    {
        var homes = await _userService.GetHomesByUserIdAsync(userId);
        return Ok(homes);
    }

    [HttpDelete("{homeId}")]
    public async Task<IActionResult> DeleteHome(string userId, string homeId)
    {
        await _userService.DeleteHomeAsync(userId, homeId);
        return NoContent();
    }
}
