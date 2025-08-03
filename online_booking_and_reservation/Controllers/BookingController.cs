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

                // Create new booking
                var booking = new Booking
                {
                    BookingId = Guid.NewGuid(),
                    UserId = request.UserId,
                    ServiceId = request.ServiceId,
                    ScheduleId = request.ScheduleId,
                    Status = "Pending",
                    TotalAmount = request.TotalAmount,
                    CreatedAt = DateTime.Now
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
                    .Include(b => b.Schedule)
                        .ThenInclude(s => s.Resource)
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
                        FullName = booking.User.FullName,
                        Email = booking.User.Email,
                        Phone = booking.User.Phone
                    } : null,
                    Service = booking.Service != null ? new ServiceInfo
                    {
                        Name = booking.Service.Name,
                        BasePrice = booking.Service.BasePrice
                    } : null,
                    Schedule = booking.Schedule != null ? new ScheduleInfo
                    {
                        StartDate = booking.Schedule.StartDate,
                        StartTime = booking.Schedule.StartTime,
                        EndTime = booking.Schedule.EndTime,
                        Resource = booking.Schedule.Resource != null ? new ResourceInfo
                        {
                            Name = booking.Schedule.Resource.Name,
                            Address = booking.Schedule.Resource.Address ?? string.Empty
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
    }
} 