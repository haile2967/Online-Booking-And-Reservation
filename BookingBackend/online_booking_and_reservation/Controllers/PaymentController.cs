using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using online_booking_and_reservation.Data;
using online_booking_and_reservation.Models;
using System.ComponentModel.DataAnnotations;

namespace online_booking_and_reservation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PaymentController(ApplicationDbContext context)
        {
            _context = context;
        }

        // POST: api/payments
        [HttpPost]
        public async Task<ActionResult<object>> CreatePayment(CreatePaymentRequest request)
        {
            if (ModelState.IsValid)
            {
                // Validate BookingId exists
                var booking = await _context.Bookings.FindAsync(request.BookingId);
                if (booking == null)
                {
                    return BadRequest("Booking not found");
                }

                // Validate payment type
                if (request.PaymentType != "full" && request.PaymentType != "deposit")
                {
                    return BadRequest("Payment type must be 'full' or 'deposit'");
                }

                // Calculate existing payments for this booking
                var existingPayments = await _context.Payments
                    .Where(p => p.BookingId == request.BookingId)
                    .SumAsync(p => p.AmountPaid);

                // Calculate remaining amount
                var remainingAmount = booking.TotalAmount - existingPayments;

                // Validate payment amount
                if (request.AmountPaid <= 0)
                {
                    return BadRequest("Payment amount must be greater than 0");
                }

                if (request.AmountPaid > remainingAmount)
                {
                    return BadRequest($"Payment amount ({request.AmountPaid}) cannot exceed remaining amount ({remainingAmount})");
                }

                var payment = new Payment
                {
                    PaymentId = Guid.NewGuid(),
                    BookingId = request.BookingId,
                    PaymentMethod = request.PaymentMethod,
                    AmountPaid = request.AmountPaid,
                    PaymentType = request.PaymentType,
                    PaymentDate = DateTime.UtcNow
                };

                _context.Payments.Add(payment);

                // Calculate total payments after this payment
                var totalPayments = existingPayments + request.AmountPaid;

                // Check if full payment is completed
                if (totalPayments >= booking.TotalAmount)
                {
                    // Update booking status to Confirmed
                    booking.Status = "Confirmed";
                    _context.Bookings.Update(booking);
                    
                    // Update schedule status to Booked
                    var schedule = await _context.Schedules.FindAsync(booking.ScheduleId);
                    if (schedule != null)
                    {
                        schedule.Status = "Booked";
                        _context.Schedules.Update(schedule);
                    }
                }

                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetPayment), new { id = payment.PaymentId }, new
                {
                    payment_id = payment.PaymentId,
                    booking_id = payment.BookingId,
                    payment_method = payment.PaymentMethod,
                    amount_paid = payment.AmountPaid,
                    payment_type = payment.PaymentType,
                    payment_date = payment.PaymentDate,
                    booking_status_updated = booking.Status,
                    total_paid = totalPayments,
                    total_amount = booking.TotalAmount,
                    remaining_amount = booking.TotalAmount - totalPayments,
                    is_fully_paid = totalPayments >= booking.TotalAmount
                });
            }

            return BadRequest(ModelState);
        }

        // GET: api/payments/booking/{bookingId}/summary
        [HttpGet("booking/{bookingId}/summary")]
        public async Task<ActionResult<object>> GetPaymentSummary(Guid bookingId)
        {
            try
            {
                var booking = await _context.Bookings.FindAsync(bookingId);
                if (booking == null)
                {
                    return NotFound("Booking not found");
                }

                var payments = await _context.Payments
                    .Where(p => p.BookingId == bookingId)
                    .ToListAsync();

                var totalPaid = payments.Sum(p => p.AmountPaid);
                var isFullyPaid = totalPaid >= booking.TotalAmount;

                var summary = new
                {
                    booking_id = bookingId,
                    booking_status = booking.Status,
                    total_amount = booking.TotalAmount,
                    total_paid = totalPaid,
                    remaining_amount = booking.TotalAmount - totalPaid,
                    is_fully_paid = isFullyPaid,
                    payment_count = payments.Count,
                    payments = payments.Select(p => new
                    {
                        payment_id = p.PaymentId,
                        amount_paid = p.AmountPaid,
                        payment_method = p.PaymentMethod,
                        payment_type = p.PaymentType,
                        payment_date = p.PaymentDate
                    })
                };

                return Ok(summary);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // POST: api/payments/update-booking-statuses
        [HttpPost("update-booking-statuses")]
        public async Task<ActionResult<object>> UpdateBookingStatuses()
        {
            try
            {
                var updatedBookings = new List<object>();

                // Get all bookings with payments
                var bookingsWithPayments = await _context.Bookings
                    .Include(b => b.Schedule)
                    .Where(b => b.Status == "Pending")
                    .ToListAsync();

                foreach (var booking in bookingsWithPayments)
                {
                    // Calculate total payments for this booking
                    var totalPayments = await _context.Payments
                        .Where(p => p.BookingId == booking.BookingId)
                        .SumAsync(p => p.AmountPaid);

                    // Check if full payment is completed
                    if (totalPayments >= booking.TotalAmount)
                    {
                        // Update booking status to Confirmed
                        booking.Status = "Confirmed";
                        _context.Bookings.Update(booking);

                        // Update schedule status to Booked
                        if (booking.Schedule != null)
                        {
                            booking.Schedule.Status = "Booked";
                            _context.Schedules.Update(booking.Schedule);
                        }

                        updatedBookings.Add(new
                        {
                            booking_id = booking.BookingId,
                            old_status = "Pending",
                            new_status = "Confirmed",
                            total_paid = totalPayments,
                            total_amount = booking.TotalAmount
                        });
                    }
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = $"Updated {updatedBookings.Count} booking statuses",
                    updated_bookings = updatedBookings
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // POST: api/payments/verify
        [HttpPost("verify")]
        public async Task<ActionResult<object>> VerifyPayments()
        {
            try
            {
                Console.WriteLine("=== Verifying Payments ===");
                
                var updatedBookings = new List<object>();
                var updatedSchedules = new List<object>();

                // Get all pending bookings with payments
                var pendingBookings = await _context.Bookings
                    .Include(b => b.Schedule)
                    .Where(b => b.Status == "Pending")
                    .ToListAsync();

                Console.WriteLine($"Found {pendingBookings.Count} pending bookings");

                foreach (var booking in pendingBookings)
                {
                    // Calculate total payments for this booking
                    var totalPayments = await _context.Payments
                        .Where(p => p.BookingId == booking.BookingId)
                        .SumAsync(p => p.AmountPaid);

                    Console.WriteLine($"Booking {booking.BookingId}: Total paid = {totalPayments}, Required = {booking.TotalAmount}");

                    // Check if payment is complete
                    if (totalPayments >= booking.TotalAmount)
                    {
                        // Update booking status to Confirmed
                        booking.Status = "Confirmed";
                        
                        // Update schedule status to Booked
                        if (booking.Schedule != null)
                        {
                            booking.Schedule.Status = "Booked";
                            updatedSchedules.Add(new
                            {
                                schedule_id = booking.Schedule.ScheduleId,
                                status = "Booked",
                                booking_id = booking.BookingId
                            });
                        }

                        updatedBookings.Add(new
                        {
                            booking_id = booking.BookingId,
                            status = "Confirmed",
                            total_paid = totalPayments,
                            total_required = booking.TotalAmount
                        });

                        Console.WriteLine($"Updated booking {booking.BookingId} to Confirmed");
                    }
                }

                await _context.SaveChangesAsync();

                var result = new
                {
                    message = "Payment verification completed",
                    updated_bookings = updatedBookings,
                    updated_schedules = updatedSchedules,
                    total_processed = pendingBookings.Count,
                    total_updated = updatedBookings.Count
                };

                Console.WriteLine($"Verification complete: {updatedBookings.Count} bookings updated");
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in VerifyPayments: {ex.Message}");
                return StatusCode(500, new { error = "Failed to verify payments", details = ex.Message });
            }
        }

        // GET: api/payments/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetPayment(Guid id)
        {
            var payment = await _context.Payments
                .Include(p => p.Booking)
                    .ThenInclude(b => b.User)
                .Include(p => p.Booking)
                    .ThenInclude(b => b.Service)
                .FirstOrDefaultAsync(p => p.PaymentId == id);

            if (payment == null)
            {
                return NotFound();
            }

            // Transform to match frontend expectations
            var response = new
            {
                payment_id = payment.PaymentId,
                booking_id = payment.BookingId,
                payment_method = payment.PaymentMethod,
                amount_paid = payment.AmountPaid,
                payment_type = payment.PaymentType,
                payment_date = payment.PaymentDate,
                booking = payment.Booking != null ? new
                {
                    booking_id = payment.Booking.BookingId,
                    user = payment.Booking.User != null ? new
                    {
                        full_name = payment.Booking.User.FullName ?? string.Empty,
                        email = payment.Booking.User.Email ?? string.Empty,
                        phone = payment.Booking.User.Phone ?? string.Empty
                    } : null,
                    service = payment.Booking.Service != null ? new
                    {
                        name = payment.Booking.Service.Name ?? string.Empty,
                        base_price = payment.Booking.Service.BasePrice
                    } : null
                } : null
            };

            return Ok(response);
        }

        // GET: api/payments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetPayments(
            [FromQuery] int? limit = null,
            [FromQuery] string? sort = null)
        {
            var query = _context.Payments
                .Include(p => p.Booking)
                    .ThenInclude(b => b.User)
                .Include(p => p.Booking)
                    .ThenInclude(b => b.Service)
                .AsQueryable();

            // Apply sorting
            if (!string.IsNullOrEmpty(sort))
            {
                if (sort.ToLower().Contains("payment_date desc"))
                {
                    query = query.OrderByDescending(p => p.PaymentDate);
                }
                else if (sort.ToLower().Contains("payment_date asc"))
                {
                    query = query.OrderBy(p => p.PaymentDate);
                }
                else if (sort.ToLower().Contains("amount_paid desc"))
                {
                    query = query.OrderByDescending(p => p.AmountPaid);
                }
                else if (sort.ToLower().Contains("amount_paid asc"))
                {
                    query = query.OrderBy(p => p.AmountPaid);
                }
            }
            else
            {
                // Default sorting by payment date descending
                query = query.OrderByDescending(p => p.PaymentDate);
            }

            // Apply limit
            if (limit.HasValue)
            {
                query = query.Take(limit.Value);
            }

            var payments = await query.ToListAsync();

            // Transform to match frontend expectations
            var response = payments.Select(payment => new
            {
                payment_id = payment.PaymentId,
                booking_id = payment.BookingId,
                payment_method = payment.PaymentMethod,
                amount_paid = payment.AmountPaid,
                payment_type = payment.PaymentType,
                payment_date = payment.PaymentDate,
                booking = payment.Booking != null ? new
                {
                    booking_id = payment.Booking.BookingId,
                    user = payment.Booking.User != null ? new
                    {
                        full_name = payment.Booking.User.FullName ?? string.Empty,
                        email = payment.Booking.User.Email ?? string.Empty,
                        phone = payment.Booking.User.Phone ?? string.Empty
                    } : null,
                    service = payment.Booking.Service != null ? new
                    {
                        name = payment.Booking.Service.Name ?? string.Empty,
                        base_price = payment.Booking.Service.BasePrice
                    } : null
                } : null
            });

            return Ok(response);
        }

        private bool PaymentExists(Guid id)
        {
            return _context.Payments.Any(e => e.PaymentId == id);
        }
    }

    public class CreatePaymentRequest
    {
        [Required]
        public Guid BookingId { get; set; }

        [Required]
        [StringLength(50)]
        public string PaymentMethod { get; set; } = string.Empty;

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal AmountPaid { get; set; }

        [Required]
        [StringLength(20)]
        public string PaymentType { get; set; } = string.Empty;
    }
} 