using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using online_booking_and_reservation.Data;
using online_booking_and_reservation.Models;

namespace online_booking_and_reservation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ScheduleController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ScheduleController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/schedules
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetSchedules(
            [FromQuery] Guid? serviceId = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] string? status = null)
        {
            // Add comprehensive logging for debugging
            Console.WriteLine("=== GetSchedules API Call ===");
            Console.WriteLine($"Parameters received: serviceId={serviceId}, startDate={startDate}, status={status}");
            
            var query = _context.Schedules
                .Include(s => s.Service)
                    .ThenInclude(service => service.Category)
                .AsQueryable();

            Console.WriteLine($"Initial query created");

            // Filter by service
            if (serviceId.HasValue)
            {
                query = query.Where(s => s.ServiceId == serviceId.Value);
                Console.WriteLine($"Applied service filter: {serviceId.Value}");
            }

            // Filter by start date
            if (startDate.HasValue)
            {
                query = query.Where(s => s.StartDate >= startDate.Value);
                Console.WriteLine($"Applied start date filter: {startDate.Value}");
            }

            // Filter by status - only if status is provided
            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(s => s.Status == status);
                Console.WriteLine($"Applied status filter: {status}");
            }

            Console.WriteLine("Executing query...");
            var schedules = await query.ToListAsync();
            
            Console.WriteLine($"Query executed. Found {schedules.Count} schedules in database");
            
            if (schedules.Count > 0)
            {
                Console.WriteLine("Sample schedule data:");
                foreach (var schedule in schedules.Take(3))
                {
                    Console.WriteLine($"  Schedule ID: {schedule.ScheduleId}");
                    Console.WriteLine($"  Status: {schedule.Status}");
                    Console.WriteLine($"  Start Date: {schedule.StartDate}");
                    Console.WriteLine($"  Service: {schedule.Service?.Name ?? "No Service"}");
                    Console.WriteLine($"  Category: {schedule.Service?.Category?.Name ?? "No Category"}");
                    Console.WriteLine("  ---");
                }
            }

            // Get resources for each service
            var serviceIds = schedules.Select(s => s.ServiceId).Distinct().ToList();
            var resourcesByService = await _context.Resources
                .Where(r => r.ServiceId.HasValue && serviceIds.Contains(r.ServiceId.Value))
                .GroupBy(r => r.ServiceId!.Value)
                .ToDictionaryAsync(g => g.Key, g => g.ToList());

            // Transform to match frontend expectations
            var response = schedules.Select(schedule => new
            {
                schedule_id = schedule.ScheduleId,
                service_id = schedule.ServiceId,
                start_date = schedule.StartDate,
                start_time = schedule.StartTime,
                end_time = schedule.EndTime,
                status = schedule.Status,
                service = schedule.Service != null ? new
                {
                    service_id = schedule.Service.ServiceId,
                    name = schedule.Service.Name ?? string.Empty,
                    base_price = schedule.Service.BasePrice,
                    capacity = schedule.Service.Capacity,
                    status = schedule.Service.Status ?? string.Empty,
                    category = schedule.Service.Category != null ? new
                    {
                        category_id = schedule.Service.Category.CategoryId,
                        name = schedule.Service.Category.Name ?? string.Empty
                    } : null,
                    resources = resourcesByService.ContainsKey(schedule.ServiceId) 
                        ? resourcesByService[schedule.ServiceId].Select(r => new
                        {
                            resource_id = r.ResourceId,
                            name = r.Name ?? string.Empty,
                            type = r.Type ?? string.Empty,
                            quantity = r.Quantity,
                            unit = r.Unit ?? string.Empty,
                            address = r.Address ?? string.Empty
                        }).Cast<object>().ToList()
                        : new List<object>()
                } : null
            });

            Console.WriteLine($"Response created with {response.Count()} items");
            Console.WriteLine("=== End GetSchedules ===");

            return Ok(response);
        }

        // GET: api/schedules/stats
        [HttpGet("stats")]
        public async Task<ActionResult<object>> GetScheduleStats()
        {
            try
            {
                var totalSchedules = await _context.Schedules.CountAsync();
                var availableSchedules = await _context.Schedules.CountAsync(s => s.Status == "Available");
                var bookedSchedules = await _context.Schedules.CountAsync(s => s.Status == "Booked");
                var cancelledSchedules = await _context.Schedules.CountAsync(s => s.Status == "Cancelled");

                var stats = new
                {
                    total = totalSchedules,
                    available = availableSchedules,
                    booked = bookedSchedules,
                    cancelled = cancelledSchedules
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/schedules/simple-test
        [HttpGet("simple-test")]
        public async Task<ActionResult<object>> SimpleTest()
        {
            try
            {
                Console.WriteLine("=== Simple Test Endpoint ===");
                
                // Test basic database connection
                var totalCount = await _context.Schedules.CountAsync();
                Console.WriteLine($"Total schedules in database: {totalCount}");
                
                // Get first few schedules without any includes
                var simpleSchedules = await _context.Schedules.Take(5).ToListAsync();
                Console.WriteLine($"Retrieved {simpleSchedules.Count} simple schedules");
                
                var result = new
                {
                    total_count = totalCount,
                    sample_schedules = simpleSchedules.Select(s => new
                    {
                        schedule_id = s.ScheduleId,
                        status = s.Status,
                        start_date = s.StartDate,
                        service_id = s.ServiceId
                    })
                };
                
                Console.WriteLine("=== End Simple Test ===");
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in simple test: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // GET: api/schedules/debug
        [HttpGet("debug")]
        public async Task<ActionResult<object>> DebugSchedules()
        {
            var allSchedules = await _context.Schedules
                .Include(s => s.Service)
                    .ThenInclude(service => service.Category)
                .ToListAsync();
            
            var result = new
            {
                total_count = allSchedules.Count,
                schedules = allSchedules.Select(s => new
                {
                    schedule_id = s.ScheduleId,
                    status = s.Status,
                    start_date = s.StartDate,
                    start_time = s.StartTime,
                    end_time = s.EndTime,
                    service_id = s.ServiceId,
                    service_name = s.Service?.Name ?? "No Service",
                    category_name = s.Service?.Category?.Name ?? "No Category"
                })
            };
            
            return Ok(result);
        }

        // GET: api/schedules/test
        [HttpGet("test")]
        public async Task<ActionResult<object>> TestSchedules()
        {
            var totalSchedules = await _context.Schedules.CountAsync();
            var schedulesWithServices = await _context.Schedules
                .Include(s => s.Service)
                .ToListAsync();
            
            var result = new
            {
                total_schedules = totalSchedules,
                schedules = schedulesWithServices.Select(s => new
                {
                    schedule_id = s.ScheduleId,
                    status = s.Status,
                    start_date = s.StartDate,
                    service_name = s.Service?.Name ?? "No Service"
                })
            };
            
            return Ok(result);
        }

        // GET: api/schedules/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetSchedule(Guid id)
        {
            var schedule = await _context.Schedules
                .Include(s => s.Service)
                    .ThenInclude(service => service.Category)
                .FirstOrDefaultAsync(s => s.ScheduleId == id);

            if (schedule == null)
            {
                return NotFound();
            }

            // Get resources for this service
            var resources = await _context.Resources
                .Where(r => r.ServiceId == schedule.ServiceId)
                .ToListAsync();

            // Transform to match frontend expectations
            var response = new
            {
                schedule_id = schedule.ScheduleId,
                service_id = schedule.ServiceId,
                start_date = schedule.StartDate,
                start_time = schedule.StartTime,
                end_time = schedule.EndTime,
                status = schedule.Status,
                service = schedule.Service != null ? new
                {
                    service_id = schedule.Service.ServiceId,
                    name = schedule.Service.Name ?? string.Empty,
                    base_price = schedule.Service.BasePrice,
                    capacity = schedule.Service.Capacity,
                    status = schedule.Service.Status ?? string.Empty,
                    category = schedule.Service.Category != null ? new
                    {
                        category_id = schedule.Service.Category.CategoryId,
                        name = schedule.Service.Category.Name ?? string.Empty
                    } : null,
                    resources = resources.Select(r => new
                    {
                        resource_id = r.ResourceId,
                        name = r.Name ?? string.Empty,
                        type = r.Type ?? string.Empty,
                        quantity = r.Quantity,
                        unit = r.Unit ?? string.Empty,
                        address = r.Address ?? string.Empty
                    }).Cast<object>().ToList()
                } : null
            };

            return Ok(response);
        }

        // POST: api/schedules
        [HttpPost]
        public async Task<ActionResult<Schedule>> CreateSchedule(Schedule schedule)
        {
            if (ModelState.IsValid)
            {
                // Validate ServiceId exists
                var service = await _context.Services.FindAsync(schedule.ServiceId);
                if (service == null)
                {
                    return BadRequest("Service not found");
                }

                // Validate business rules
                if (schedule.StartTime >= schedule.EndTime)
                {
                    return BadRequest("Start time must be before end time");
                }

                if (schedule.StartDate < DateTime.Today)
                {
                    return BadRequest("Start date cannot be in the past");
                }

                schedule.ScheduleId = Guid.NewGuid();
                schedule.Status = "Available";

                _context.Schedules.Add(schedule);
                await _context.SaveChangesAsync();

                // Reload with related data
                await _context.Entry(schedule)
                    .Reference(s => s.Service)
                    .LoadAsync();

                return CreatedAtAction(nameof(GetSchedule), new { id = schedule.ScheduleId }, schedule);
            }

            return BadRequest(ModelState);
        }

        // PUT: api/schedules/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSchedule(Guid id, Schedule schedule)
        {
            if (id != schedule.ScheduleId)
            {
                return BadRequest();
            }

            var existingSchedule = await _context.Schedules.FindAsync(id);
            if (existingSchedule == null)
            {
                return NotFound();
            }

            // Validate ServiceId exists
            var service = await _context.Services.FindAsync(schedule.ServiceId);
            if (service == null)
            {
                return BadRequest("Service not found");
            }

            // Validate business rules
            if (schedule.StartTime >= schedule.EndTime)
            {
                return BadRequest("Start time must be before end time");
            }

            if (schedule.StartDate < DateTime.Today)
            {
                return BadRequest("Start date cannot be in the past");
            }

            existingSchedule.ServiceId = schedule.ServiceId;
            existingSchedule.StartDate = schedule.StartDate;
            existingSchedule.StartTime = schedule.StartTime;
            existingSchedule.EndTime = schedule.EndTime;
            existingSchedule.Status = schedule.Status;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ScheduleExists(id))
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

        // PATCH: api/schedules/5
        [HttpPatch("{id}")]
        public async Task<ActionResult<object>> UpdateScheduleStatus(Guid id, [FromBody] UpdateScheduleStatusRequest request)
        {
            var existingSchedule = await _context.Schedules.FindAsync(id);
            if (existingSchedule == null)
            {
                return NotFound();
            }

            // Validate status values
            if (request.Status != "Available" && request.Status != "Booked" && request.Status != "Cancelled")
            {
                return BadRequest("Status must be 'Available', 'Booked', or 'Cancelled'");
            }

            existingSchedule.Status = request.Status;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ScheduleExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(new { schedule_id = existingSchedule.ScheduleId, status = existingSchedule.Status });
        }

        // DELETE: api/schedules/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSchedule(Guid id)
        {
            var schedule = await _context.Schedules.FindAsync(id);
            if (schedule == null)
            {
                return NotFound();
            }

            _context.Schedules.Remove(schedule);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/schedules/service/{serviceId}
        [HttpGet("service/{serviceId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetSchedulesByService(Guid serviceId)
        {
            var schedules = await _context.Schedules
                .Include(s => s.Service)
                    .ThenInclude(service => service.Category)
                .Where(s => s.ServiceId == serviceId)
                .ToListAsync();

            // Get resources for this service
            var resources = await _context.Resources
                .Where(r => r.ServiceId == serviceId)
                .ToListAsync();

            // Transform to match frontend expectations
            var response = schedules.Select(schedule => new
            {
                schedule_id = schedule.ScheduleId,
                service_id = schedule.ServiceId,
                start_date = schedule.StartDate,
                start_time = schedule.StartTime,
                end_time = schedule.EndTime,
                status = schedule.Status,
                service = schedule.Service != null ? new
                {
                    service_id = schedule.Service.ServiceId,
                    name = schedule.Service.Name ?? string.Empty,
                    base_price = schedule.Service.BasePrice,
                    capacity = schedule.Service.Capacity,
                    status = schedule.Service.Status ?? string.Empty,
                    category = schedule.Service.Category != null ? new
                    {
                        category_id = schedule.Service.Category.CategoryId,
                        name = schedule.Service.Category.Name ?? string.Empty
                    } : null,
                    resources = resources.Select(r => new
                    {
                        resource_id = r.ResourceId,
                        name = r.Name ?? string.Empty,
                        type = r.Type ?? string.Empty,
                        quantity = r.Quantity,
                        unit = r.Unit ?? string.Empty,
                        address = r.Address ?? string.Empty
                    }).Cast<object>().ToList()
                } : null
            });

            return Ok(response);
        }

        // GET: api/schedules/available/{serviceId}
        [HttpGet("available/{serviceId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetAvailableSchedules(Guid serviceId, 
            [FromQuery] DateTime? startDate = null)
        {
            var query = _context.Schedules
                .Include(s => s.Service)
                    .ThenInclude(service => service.Category)
                .Where(s => s.ServiceId == serviceId && s.Status == "Available");

            if (startDate.HasValue)
            {
                query = query.Where(s => s.StartDate >= startDate.Value);
            }

            var schedules = await query.ToListAsync();

            // Get resources for this service
            var resources = await _context.Resources
                .Where(r => r.ServiceId == serviceId)
                .ToListAsync();

            // Transform to match frontend expectations
            var response = schedules.Select(schedule => new
            {
                schedule_id = schedule.ScheduleId,
                service_id = schedule.ServiceId,
                start_date = schedule.StartDate,
                start_time = schedule.StartTime,
                end_time = schedule.EndTime,
                status = schedule.Status,
                service = schedule.Service != null ? new
                {
                    service_id = schedule.Service.ServiceId,
                    name = schedule.Service.Name ?? string.Empty,
                    base_price = schedule.Service.BasePrice,
                    capacity = schedule.Service.Capacity,
                    status = schedule.Service.Status ?? string.Empty,
                    category = schedule.Service.Category != null ? new
                    {
                        category_id = schedule.Service.Category.CategoryId,
                        name = schedule.Service.Category.Name ?? string.Empty
                    } : null,
                    resources = resources.Select(r => new
                    {
                        resource_id = r.ResourceId,
                        name = r.Name ?? string.Empty,
                        type = r.Type ?? string.Empty,
                        quantity = r.Quantity,
                        unit = r.Unit ?? string.Empty,
                        address = r.Address ?? string.Empty
                    }).Cast<object>().ToList()
                } : null
            });

            return Ok(response);
        }

        // POST: api/schedules/create-test-schedules
        [HttpPost("create-test-schedules")]
        public async Task<ActionResult<object>> CreateTestSchedules([FromBody] CreateTestSchedulesRequest request)
        {
            try
            {
                // Validate ServiceId exists
                var service = await _context.Services.FindAsync(request.ServiceId);
                if (service == null)
                {
                    return BadRequest("Service not found");
                }

                var createdSchedules = new List<object>();
                var startDate = DateTime.Today.AddDays(1); // Start from tomorrow

                // Create schedules for the next 30 days
                for (int i = 0; i < 30; i++)
                {
                    var scheduleDate = startDate.AddDays(i);
                    
                    var schedule = new Schedule
                    {
                        ScheduleId = Guid.NewGuid(),
                        ServiceId = request.ServiceId,
                        StartDate = scheduleDate,
                        StartTime = TimeSpan.FromHours(8), // 8:00 AM
                        EndTime = TimeSpan.FromHours(18), // 6:00 PM
                        Status = "Available"
                    };

                    _context.Schedules.Add(schedule);
                    createdSchedules.Add(new
                    {
                        scheduleId = schedule.ScheduleId,
                        startDate = schedule.StartDate.ToString("yyyy-MM-dd"),
                        startTime = schedule.StartTime.ToString(@"hh\:mm"),
                        endTime = schedule.EndTime.ToString(@"hh\:mm"),
                        status = schedule.Status
                    });
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = $"Created {createdSchedules.Count} test schedules",
                    serviceId = request.ServiceId,
                    schedules = createdSchedules
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        private bool ScheduleExists(Guid id)
        {
            return _context.Schedules.Any(e => e.ScheduleId == id);
        }
    }

    // Request model for updating schedule status
    public class UpdateScheduleStatusRequest
    {
        public string Status { get; set; } = string.Empty;
    }

    // Request model for creating test schedules
    public class CreateTestSchedulesRequest
    {
        public Guid ServiceId { get; set; }
    }
} 