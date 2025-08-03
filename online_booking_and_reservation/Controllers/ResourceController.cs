using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using online_booking_and_reservation.Data;
using online_booking_and_reservation.Models;

namespace online_booking_and_reservation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ResourceController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ResourceController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Resource
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Resource>>> GetResources()
        {
            return await _context.Resources
                .Include(r => r.Service)
                .ToListAsync();
        }

        // GET: api/Resource/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Resource>> GetResource(Guid id)
        {
            var resource = await _context.Resources
                .Include(r => r.Service)
                .FirstOrDefaultAsync(r => r.ResourceId == id);

            if (resource == null)
            {
                return NotFound();
            }

            return resource;
        }

        // POST: api/Resource
        [HttpPost]
        public async Task<ActionResult<Resource>> CreateResource(CreateResourceRequest request)
        {
            if (ModelState.IsValid)
            {
                // Validate ServiceId if provided
                if (request.ServiceId.HasValue)
                {
                    var service = await _context.Services.FindAsync(request.ServiceId.Value);
                    if (service == null)
                    {
                        return BadRequest("Service not found");
                    }
                }

                // Validate business rules
                if (request.Quantity < 1)
                {
                    return BadRequest("Quantity must be at least 1");
                }

                var resource = new Resource
                {
                    ResourceId = Guid.NewGuid(),
                    ServiceId = request.ServiceId,
                    Name = request.Name,
                    Type = request.Type,
                    Quantity = request.Quantity,
                    Unit = request.Unit,
                    Address = request.Address
                };

                _context.Resources.Add(resource);
                await _context.SaveChangesAsync();

                // Reload with related data
                if (resource.ServiceId.HasValue)
                {
                    await _context.Entry(resource)
                        .Reference(r => r.Service)
                        .LoadAsync();
                }

                return CreatedAtAction(nameof(GetResource), new { id = resource.ResourceId }, resource);
            }

            return BadRequest(ModelState);
        }

        // PUT: api/Resource/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateResource(Guid id, CreateResourceRequest request)
        {
            var existingResource = await _context.Resources.FindAsync(id);
            if (existingResource == null)
            {
                return NotFound();
            }

            // Validate ServiceId if provided
            if (request.ServiceId.HasValue)
            {
                var service = await _context.Services.FindAsync(request.ServiceId.Value);
                if (service == null)
                {
                    return BadRequest("Service not found");
                }
            }

            // Validate business rules
            if (request.Quantity < 1)
            {
                return BadRequest("Quantity must be at least 1");
            }

            existingResource.ServiceId = request.ServiceId;
            existingResource.Name = request.Name;
            existingResource.Type = request.Type;
            existingResource.Quantity = request.Quantity;
            existingResource.Unit = request.Unit;
            existingResource.Address = request.Address;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ResourceExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Resource/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteResource(Guid id)
        {
            var resource = await _context.Resources.FindAsync(id);
            if (resource == null)
            {
                return NotFound();
            }

            _context.Resources.Remove(resource);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Resource/service/{serviceId}
        [HttpGet("service/{serviceId}")]
        public async Task<ActionResult<IEnumerable<Resource>>> GetResourcesByService(Guid serviceId)
        {
            var resources = await _context.Resources
                .Include(r => r.Service)
                .Where(r => r.ServiceId == serviceId)
                .ToListAsync();

            return resources;
        }

        // GET: api/Resource/type/{type}
        [HttpGet("type/{type}")]
        public async Task<ActionResult<IEnumerable<Resource>>> GetResourcesByType(string type)
        {
            var resources = await _context.Resources
                .Include(r => r.Service)
                .Where(r => r.Type == type)
                .ToListAsync();

            return resources;
        }

        // GET: api/Resource/available
        [HttpGet("available")]
        public async Task<ActionResult<IEnumerable<Resource>>> GetAvailableResources()
        {
            var resources = await _context.Resources
                .Include(r => r.Service)
                .Where(r => r.ServiceId == null) // Resources not assigned to any service
                .ToListAsync();

            return resources;
        }

        private bool ResourceExists(Guid id)
        {
            return _context.Resources.Any(e => e.ResourceId == id);
        }
    }
} 