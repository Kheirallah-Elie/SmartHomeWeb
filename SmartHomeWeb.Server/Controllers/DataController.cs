using Microsoft.AspNetCore.Mvc;
using SmartHomeWeb.Server.Model;
using SmartHomeWeb.Server.Services;
using System.Collections.Generic;
using System.Threading.Tasks;
namespace SmartHomeWeb.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DataController : ControllerBase
    {
        private readonly SmartHomeService _service;

        public DataController(SmartHomeService service)
        {
            _service = service;
        }

        [HttpGet("getAll")]
        public async Task<ActionResult<List<SmartHomeModel>>> GetAll()
        {
            var data = await _service.GetAllAsync();
            return Ok(data);
        }

        [HttpGet("{id:length(24)}")]
        public async Task<ActionResult<SmartHomeModel>> GetById(string id)
        {
            var data = await _service.GetByIdAsync(id);
            return data == null ? NotFound() : Ok(data);
        }

        [HttpPost]
        public async Task<ActionResult> Create(SmartHomeModel data)
        {
            await _service.CreateAsync(data);
            return CreatedAtAction(nameof(GetById), new { id = data.Id }, data);
        }

        [HttpPut("{id:length(24)}")]
        public async Task<IActionResult> Update(string id, SmartHomeModel data)
        {
            var existingData = await _service.GetByIdAsync(id);
            if (existingData == null) return NotFound();

            data.Id = existingData.Id;
            await _service.UpdateAsync(id, data);
            return NoContent();
        }

        [HttpDelete("{id:length(24)}")]
        public async Task<IActionResult> Delete(string id)
        {
            var data = await _service.GetByIdAsync(id);
            if (data == null) return NotFound();

            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}
