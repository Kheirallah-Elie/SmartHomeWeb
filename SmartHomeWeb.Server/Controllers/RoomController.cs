using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

[Route("api/User/{userId}/homes/{homeId}/rooms")]
[ApiController]
public class RoomController : ControllerBase
{
    private readonly UserService _userService;

    public RoomController(UserService userService)
    {
        _userService = userService;
    }

    [HttpPost]
    public async Task<IActionResult> AddRoom(string userId, string homeId, Room room)
    {
        await _userService.AddRoomAsync(userId, homeId, room);
        return Ok(room);
    }

    [HttpGet]
    public async Task<IActionResult> GetRooms(string userId, string homeId)
    {
        var rooms = await _userService.GetRoomsByHomeIdAsync(userId, homeId);
        return Ok(rooms);
    }

    [HttpDelete("{roomId}")]
    public async Task<IActionResult> DeleteRoom(string userId, string homeId, string roomId)
    {
        await _userService.DeleteRoomAsync(userId, homeId, roomId);
        return NoContent();
    }
}
