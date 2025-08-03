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

                var payment = new Payment
                {
                    PaymentId = Guid.NewGuid(),
                    BookingId = request.BookingId,
                    PaymentMethod = request.PaymentMethod,
                    AmountPaid = request.AmountPaid,
                    PaymentType = request.PaymentType,
                    PaymentDate = DateTime.Now
                };

                _context.Payments.Add(payment);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetPayment), new { id = payment.PaymentId }, new
                {
                    payment_id = payment.PaymentId,
                    booking_id = payment.BookingId,
                    payment_method = payment.PaymentMethod,
                    amount_paid = payment.AmountPaid,
                    payment_type = payment.PaymentType,
                    payment_date = payment.PaymentDate
                });
            }

            return BadRequest(ModelState);
        }

        // GET: api/payments/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Payment>> GetPayment(Guid id)
        {
            var payment = await _context.Payments
                .Include(p => p.Booking)
                .FirstOrDefaultAsync(p => p.PaymentId == id);

            if (payment == null)
            {
                return NotFound();
            }

            return payment;
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