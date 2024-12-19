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


    [HttpGet("{deviceId}/state")]
    public async Task<IActionResult> GetDeviceState(string userId, string homeId, string roomId, string deviceId)
    {
        var deviceState = await _deviceService.GetDeviceStateAsync(userId, homeId, roomId, deviceId);

        if (deviceState == null)
        {
            return NotFound(new { Message = "Device not found." });
        }

        return Ok(new { DeviceId = deviceId, State = deviceState });
    }



    [HttpDelete("{deviceId}")]
    public async Task<IActionResult> DeleteDevice(string userId, string homeId, string roomId, string deviceId)
    {
        await _deviceService.DeleteDeviceAsync(userId, homeId, roomId, deviceId);
        return NoContent(); // Indique que l'appareil a été supprimé avec succès
    }

    // Update the state of a device
    [HttpPut("{deviceId}/state")]
    public async Task<IActionResult> UpdateDeviceState(string userId, string homeId, string roomId, string deviceId, Boolean isOn)
    {
        // Validate the device and update its state
        var success = await _deviceService.UpdateDeviceStateAsync(userId, homeId, roomId, deviceId, isOn);

        if (success)
        {
            return Ok(new { message = "Device state updated successfully." });
        }
        else
        {
            return NotFound(new { message = "Device not found." });
        }
    }
}
