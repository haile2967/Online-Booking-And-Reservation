using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using online_booking_and_reservation.Data;
using online_booking_and_reservation.Models;

namespace online_booking_and_reservation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BookingController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET /api/bookings
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookingResponse>>> GetBookings(
            [FromQuery] string? status = null,
            [FromQuery] string? userId = null,
            [FromQuery] Guid? serviceId = null,
            [FromQuery] int? limit = null)
        {
            try
            {
                var query = _context.Bookings
                    .Include(b => b.User)
                    .Include(b => b.Service)
                        .ThenInclude(s => s.Category)
                    .Include(b => b.Schedule)
                        .ThenInclude(s => s.Service)
                    .AsQueryable();

                // Apply filters
                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(b => b.Status == status);
                }

                if (!string.IsNullOrEmpty(userId))
                {
                    query = query.Where(b => b.UserId == userId);
                }

                if (serviceId.HasValue)
                {
                    query = query.Where(b => b.ServiceId == serviceId.Value);
                }

                // Apply limit
                if (limit.HasValue)
                {
                    query = query.Take(limit.Value);
                }

                var bookings = await query.ToListAsync();

                var responses = bookings.Select(booking => new BookingResponse
                {
                    BookingId = booking.BookingId,
                    UserId = booking.UserId,
                    ServiceId = booking.ServiceId,
                    ScheduleId = booking.ScheduleId,
                    Status = booking.Status,
                    TotalAmount = booking.TotalAmount,
                    CreatedAt = booking.CreatedAt,
                    User = booking.User != null ? new UserInfo
                    {
                        FullName = booking.User.FullName ?? string.Empty,
                        Email = booking.User.Email ?? string.Empty,
                        Phone = booking.User.Phone ?? string.Empty
                    } : null,
                    Service = booking.Service != null ? new ServiceInfo
                    {
                        Name = booking.Service.Name ?? string.Empty,
                        BasePrice = booking.Service.BasePrice
                    } : null,
                    Schedule = booking.Schedule != null ? new ScheduleInfo
                    {
                        StartDate = booking.Schedule.StartDate,
                        StartTime = booking.Schedule.StartTime,
                        EndTime = booking.Schedule.EndTime,
                        Resource = booking.Schedule.Service != null ? new ResourceInfo
                        {
                            Name = booking.Schedule.Service.Name ?? string.Empty,
                            Address = booking.Schedule.Service.Name ?? string.Empty // Using service name as address for now
                        } : null
                    } : null
                });

                return Ok(responses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET /api/bookings/stats
        [HttpGet("stats")]
        public async Task<ActionResult<object>> GetBookingStats()
        {
            try
            {
                var totalBookings = await _context.Bookings.CountAsync();
                var pendingBookings = await _context.Bookings.CountAsync(b => b.Status == "Pending");
                var confirmedBookings = await _context.Bookings.CountAsync(b => b.Status == "Confirmed");
                var cancelledBookings = await _context.Bookings.CountAsync(b => b.Status == "Cancelled");

                var stats = new
                {
                    total = totalBookings,
                    pending = pendingBookings,
                    confirmed = confirmedBookings,
                    cancelled = cancelledBookings
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST /api/bookings
        [HttpPost]
        public async Task<ActionResult<BookingResponse>> CreateBooking(CreateBookingRequest request)
        {
            try
            {
                // Validate that user exists
                var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == request.UserId);
                if (user == null)
                {
                    return BadRequest("User not found");
                }

                // Validate that service exists
                var service = await _context.Services.FirstOrDefaultAsync(s => s.ServiceId == request.ServiceId);
                if (service == null)
                {
                    return BadRequest("Service not found");
                }

                // Validate that schedule exists and is available
                var schedule = await _context.Schedules.FirstOrDefaultAsync(s => s.ScheduleId == request.ScheduleId);
                if (schedule == null)
                {
                    return BadRequest("Schedule not found");
                }

                if (schedule.Status != "Available")
                {
                    return BadRequest("Schedule is not available");
                }

                // Check if schedule is already booked
                var existingBooking = await _context.Bookings
                    .FirstOrDefaultAsync(b => b.ScheduleId == request.ScheduleId && b.Status != "Cancelled");
                
                if (existingBooking != null)
                {
                    return BadRequest("Schedule is already booked");
                }

                // Create new booking with total amount set to service base price
                var booking = new Booking
                {
                    BookingId = Guid.NewGuid(),
                    UserId = request.UserId,
                    ServiceId = request.ServiceId,
                    ScheduleId = request.ScheduleId,
                    Status = "Pending",
                    TotalAmount = service.BasePrice, // Automatically set to service base price
                    CreatedAt = DateTime.UtcNow
                };

                _context.Bookings.Add(booking);

                // Update schedule status to booked
                schedule.Status = "Booked";
                _context.Schedules.Update(schedule);

                await _context.SaveChangesAsync();

                // Return booking response
                var response = new BookingResponse
                {
                    BookingId = booking.BookingId,
                    UserId = booking.UserId,
                    ServiceId = booking.ServiceId,
                    ScheduleId = booking.ScheduleId,
                    Status = booking.Status,
                    TotalAmount = booking.TotalAmount,
                    CreatedAt = booking.CreatedAt
                };

                return CreatedAtAction(nameof(GetBooking), new { bookingId = booking.BookingId }, response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET /api/bookings/{bookingId}
        [HttpGet("{bookingId}")]
        public async Task<ActionResult<BookingResponse>> GetBooking(Guid bookingId)
        {
            try
            {
                var booking = await _context.Bookings
                    .Include(b => b.User)
                    .Include(b => b.Service)
                        .ThenInclude(s => s.Category)
                    .Include(b => b.Schedule)
                        .ThenInclude(s => s.Service)
                    .FirstOrDefaultAsync(b => b.BookingId == bookingId);

                if (booking == null)
                {
                    return NotFound("Booking not found");
                }

                var response = new BookingResponse
                {
                    BookingId = booking.BookingId,
                    UserId = booking.UserId,
                    ServiceId = booking.ServiceId,
                    ScheduleId = booking.ScheduleId,
                    Status = booking.Status,
                    TotalAmount = booking.TotalAmount,
                    CreatedAt = booking.CreatedAt,
                    User = booking.User != null ? new UserInfo
                    {
                        FullName = booking.User.FullName ?? string.Empty,
                        Email = booking.User.Email ?? string.Empty,
                        Phone = booking.User.Phone ?? string.Empty
                    } : null,
                    Service = booking.Service != null ? new ServiceInfo
                    {
                        Name = booking.Service.Name ?? string.Empty,
                        BasePrice = booking.Service.BasePrice
                    } : null,
                    Schedule = booking.Schedule != null ? new ScheduleInfo
                    {
                        StartDate = booking.Schedule.StartDate,
                        StartTime = booking.Schedule.StartTime,
                        EndTime = booking.Schedule.EndTime,
                        Resource = booking.Schedule.Service != null ? new ResourceInfo
                        {
                            Name = booking.Schedule.Service.Name ?? string.Empty,
                            Address = booking.Schedule.Service.Name ?? string.Empty // Using service name as address for now
                        } : null
                    } : null
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PATCH /api/bookings/{bookingId}/status
        [HttpPatch("{bookingId}/status")]
        public async Task<ActionResult<object>> UpdateBookingStatus(Guid bookingId, [FromBody] UpdateBookingStatusRequest request)
        {
            try
            {
                var booking = await _context.Bookings
                    .Include(b => b.Schedule)
                    .FirstOrDefaultAsync(b => b.BookingId == bookingId);

                if (booking == null)
                {
                    return NotFound("Booking not found");
                }

                // Validate status values
                var validStatuses = new[] { "Pending", "Confirmed", "Cancelled", "Completed" };
                if (!validStatuses.Contains(request.Status))
                {
                    return BadRequest("Status must be 'Pending', 'Confirmed', 'Cancelled', or 'Completed'");
                }

                var oldStatus = booking.Status;
                booking.Status = request.Status;

                // Update schedule status based on booking status
                if (booking.Schedule != null)
                {
                    if (request.Status == "Confirmed" || request.Status == "Completed")
                    {
                        booking.Schedule.Status = "Booked";
                    }
                    else if (request.Status == "Cancelled")
                    {
                        booking.Schedule.Status = "Available";
                    }
                    else if (request.Status == "Pending")
                    {
                        booking.Schedule.Status = "Booked"; // Keep as booked while pending
                    }
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    booking_id = booking.BookingId,
                    old_status = oldStatus,
                    new_status = booking.Status,
                    schedule_status = booking.Schedule?.Status
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }

    // Request model for updating booking status
    public class UpdateBookingStatusRequest
    {
        public string Status { get; set; } = string.Empty;
    }
} 