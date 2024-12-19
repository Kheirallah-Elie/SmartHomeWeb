using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

[Route("api/User/{userId}/homes")]
[ApiController]
public class HomeController : ControllerBase
{
    private readonly HomeService _homeService;

    public HomeController(HomeService homeService)
    {
        _homeService = homeService;
    }

    [HttpPost]
    public async Task<IActionResult> AddHome(string userId, Home home)
    {
        await _homeService.AddHomeAsync(userId, home);
        return Ok(home);
    }

    [HttpGet]
    public async Task<IActionResult> GetHomes(string userId)
    {
        var homes = await _homeService.GetHomesByUserIdAsync(userId);
        return Ok(homes);
    }

    [HttpDelete("{homeId}")]
    public async Task<IActionResult> DeleteHome(string userId, string homeId)
    {
        await _homeService.DeleteHomeAsync(userId, homeId);
        return NoContent();
    }
}
