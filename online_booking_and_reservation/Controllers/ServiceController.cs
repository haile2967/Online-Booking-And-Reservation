using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using online_booking_and_reservation.Data;
using online_booking_and_reservation.Models;

namespace online_booking_and_reservation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServiceController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ServiceController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Service
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Service>>> GetServices()
        {
            return await _context.Services
                .Include(s => s.Category)
                .Include(s => s.CancellationPolicy)
                .ToListAsync();
        }

        // GET: api/Service/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Service>> GetService(Guid id)
        {
            var service = await _context.Services
                .Include(s => s.Category)
                .Include(s => s.CancellationPolicy)
                .FirstOrDefaultAsync(s => s.ServiceId == id);

            if (service == null)
            {
                return NotFound();
            }

            return service;
        }

        // POST: api/Service
        [HttpPost]
        public async Task<ActionResult<Service>> CreateService(CreateServiceRequest request)
        {
            if (ModelState.IsValid)
            {
                // Validate CategoryId exists
                var category = await _context.Categories.FindAsync(request.CategoryId);
                if (category == null)
                {
                    return BadRequest("Category not found");
                }

                // Validate PolicyId if provided
                if (request.PolicyId.HasValue)
                {
                    var policy = await _context.CancellationPolicies.FindAsync(request.PolicyId.Value);
                    if (policy == null)
                    {
                        return BadRequest("Cancellation policy not found");
                    }
                }

                // Create new service from request
                var service = new Service
                {
                    ServiceId = Guid.NewGuid(),
                    Name = request.Name,
                    CategoryId = request.CategoryId,
                    BasePrice = request.BasePrice,
                    Capacity = request.Capacity,
                    PolicyId = request.PolicyId,
                    Status = "Available"
                };

                _context.Services.Add(service);
                await _context.SaveChangesAsync();

                // Reload with related data
                await _context.Entry(service)
                    .Reference(s => s.Category)
                    .LoadAsync();

                if (service.PolicyId.HasValue)
                {
                    await _context.Entry(service)
                        .Reference(s => s.CancellationPolicy)
                        .LoadAsync();
                }

                return CreatedAtAction(nameof(GetService), new { id = service.ServiceId }, service);
            }

            return BadRequest(ModelState);
        }

        // PUT: api/Service/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateService(Guid id, Service service)
        {
            if (id != service.ServiceId)
            {
                return BadRequest();
            }

            var existingService = await _context.Services.FindAsync(id);
            if (existingService == null)
            {
                return NotFound();
            }

            // Validate CategoryId exists
            var category = await _context.Categories.FindAsync(service.CategoryId);
            if (category == null)
            {
                return BadRequest("Category not found");
            }

            // Validate PolicyId if provided
            if (service.PolicyId.HasValue)
            {
                var policy = await _context.CancellationPolicies.FindAsync(service.PolicyId.Value);
                if (policy == null)
                {
                    return BadRequest("Cancellation policy not found");
                }
            }

            // Validate business rules
            if (service.BasePrice < 0)
            {
                return BadRequest("Base price cannot be negative");
            }

            if (service.Capacity < 1)
            {
                return BadRequest("Capacity must be at least 1");
            }

            existingService.Name = service.Name;
            existingService.CategoryId = service.CategoryId;
            existingService.BasePrice = service.BasePrice;
            existingService.Capacity = service.Capacity;
            existingService.PolicyId = service.PolicyId;
            existingService.Status = service.Status;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ServiceExists(id))
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

        // DELETE: api/Service/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteService(Guid id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null)
            {
                return NotFound();
            }

            _context.Services.Remove(service);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Service/category/{categoryId}
        [HttpGet("category/{categoryId}")]
        public async Task<ActionResult<IEnumerable<Service>>> GetServicesByCategory(Guid categoryId)
        {
            var services = await _context.Services
                .Include(s => s.Category)
                .Include(s => s.CancellationPolicy)
                .Where(s => s.CategoryId == categoryId)
                .ToListAsync();

            return services;
        }

        // GET: api/Service/status/{status}
        [HttpGet("status/{status}")]
        public async Task<ActionResult<IEnumerable<Service>>> GetServicesByStatus(string status)
        {
            var services = await _context.Services
                .Include(s => s.Category)
                .Include(s => s.CancellationPolicy)
                .Where(s => s.Status == status)
                .ToListAsync();

            return services;
        }

        // GET: api/Service/price-range/{minPrice}/{maxPrice}
        [HttpGet("price-range/{minPrice}/{maxPrice}")]
        public async Task<ActionResult<IEnumerable<Service>>> GetServicesByPriceRange(decimal minPrice, decimal maxPrice)
        {
            if (minPrice < 0 || maxPrice < 0 || minPrice > maxPrice)
            {
                return BadRequest("Invalid price range");
            }

            var services = await _context.Services
                .Include(s => s.Category)
                .Include(s => s.CancellationPolicy)
                .Where(s => s.BasePrice >= minPrice && s.BasePrice <= maxPrice)
                .ToListAsync();

            return services;
        }

        // PUT: api/Service/{id}/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateServiceStatus(Guid id, [FromBody] UpdateServiceStatusRequest request)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null)
            {
                return NotFound();
            }

            if (request.Status != "Available" && request.Status != "Under Maintenance")
            {
                return BadRequest("Status must be 'Available' or 'Under Maintenance'");
            }

            service.Status = request.Status;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ServiceExists(Guid id)
        {
            return _context.Services.Any(e => e.ServiceId == id);
        }
    }

    // Request model for updating service status
    public class UpdateServiceStatusRequest
    {
        public string Status { get; set; } = string.Empty;
    }
} 