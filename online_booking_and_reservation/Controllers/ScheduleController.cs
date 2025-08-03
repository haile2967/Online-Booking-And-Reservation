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
        public async Task<ActionResult<IEnumerable<Schedule>>> GetSchedules(
            [FromQuery] Guid? serviceId = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] string status = "Available")
        {
            var query = _context.Schedules
                .Include(s => s.Resource)
                .AsQueryable();

            // Filter by service (via resources)
            if (serviceId.HasValue)
            {
                query = query.Where(s => s.Resource.ServiceId == serviceId.Value);
            }

            // Filter by start date
            if (startDate.HasValue)
            {
                query = query.Where(s => s.StartDate >= startDate.Value);
            }

            // Filter by status
            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(s => s.Status == status);
            }

            return await query.ToListAsync();
        }

        // GET: api/schedules/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Schedule>> GetSchedule(Guid id)
        {
            var schedule = await _context.Schedules
                .Include(s => s.Resource)
                .FirstOrDefaultAsync(s => s.ScheduleId == id);

            if (schedule == null)
            {
                return NotFound();
            }

            return schedule;
        }

        // POST: api/schedules
        [HttpPost]
        public async Task<ActionResult<Schedule>> CreateSchedule(Schedule schedule)
        {
            if (ModelState.IsValid)
            {
                // Validate ResourceId exists
                var resource = await _context.Resources.FindAsync(schedule.ResourceId);
                if (resource == null)
                {
                    return BadRequest("Resource not found");
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
                    .Reference(s => s.Resource)
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

            // Validate ResourceId exists
            var resource = await _context.Resources.FindAsync(schedule.ResourceId);
            if (resource == null)
            {
                return BadRequest("Resource not found");
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

            existingSchedule.ResourceId = schedule.ResourceId;
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

        // GET: api/schedules/resource/{resourceId}
        [HttpGet("resource/{resourceId}")]
        public async Task<ActionResult<IEnumerable<Schedule>>> GetSchedulesByResource(Guid resourceId)
        {
            var schedules = await _context.Schedules
                .Include(s => s.Resource)
                .Where(s => s.ResourceId == resourceId)
                .ToListAsync();

            return schedules;
        }

        // GET: api/schedules/available/{resourceId}
        [HttpGet("available/{resourceId}")]
        public async Task<ActionResult<IEnumerable<Schedule>>> GetAvailableSchedules(Guid resourceId, 
            [FromQuery] DateTime? startDate = null)
        {
            var query = _context.Schedules
                .Include(s => s.Resource)
                .Where(s => s.ResourceId == resourceId && s.Status == "Available");

            if (startDate.HasValue)
            {
                query = query.Where(s => s.StartDate >= startDate.Value);
            }

            return await query.ToListAsync();
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
} 