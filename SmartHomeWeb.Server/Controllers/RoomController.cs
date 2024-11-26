using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

[Route("api/User/{userId}/homes/{homeId}/rooms")]
[ApiController]
public class RoomController : ControllerBase
{
    private readonly RoomService _roomService;

    public RoomController(RoomService roomService)
    {
        _roomService = roomService;
    }

    [HttpPost]
    public async Task<IActionResult> AddRoom(string userId, string homeId, Room room)
    {
        await _roomService.AddRoomAsync(userId, homeId, room);
        return Ok(room);
    }

    [HttpGet]
    public async Task<IActionResult> GetRooms(string userId, string homeId)
    {
        var rooms = await _roomService.GetRoomsByHomeIdAsync(userId, homeId);
        return Ok(rooms);
    }

    [HttpDelete("{roomId}")]
    public async Task<IActionResult> DeleteRoom(string userId, string homeId, string roomId)
    {
        await _roomService.DeleteRoomAsync(userId, homeId, roomId);
        return NoContent();
    }
}
