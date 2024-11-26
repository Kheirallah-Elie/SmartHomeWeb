using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

[Route("api/User/{userId}/homes/{homeId}/rooms/{roomId}/devices")]
[ApiController]
public class DeviceController : ControllerBase
{
    private readonly DeviceService _deviceService;
    
    public DeviceController(DeviceService deviceService)
    {
        _deviceService = deviceService;
    }

    [HttpPost]
    public async Task<IActionResult> AddDevice(string userId, string homeId, string roomId, Device device)
    {
        await _deviceService.AddDeviceAsync(userId, homeId, roomId, device);
        return Ok(device);
    }

    // Ajout des paramètres userId, homeId et roomId à la route
    [HttpPut("{deviceId}/toggle")]
    public async Task<IActionResult> ToggleDeviceState(string userId, string homeId, string roomId, string deviceId)
    {
        // Logique pour changer l'état de l'appareil
        await _deviceService.ToggleDeviceStateAsync(userId, homeId, roomId, deviceId);
        return NoContent(); // Indique que l'opération a été effectuée avec succès
    }

    [HttpDelete("{deviceId}")]
    public async Task<IActionResult> DeleteDevice(string userId, string homeId, string roomId, string deviceId)
    {
        await _deviceService.DeleteDeviceAsync(userId, homeId, roomId, deviceId);
        return NoContent(); // Indique que l'appareil a été supprimé avec succès
    }
}
