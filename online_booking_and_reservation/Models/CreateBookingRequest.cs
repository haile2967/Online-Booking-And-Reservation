using System.ComponentModel.DataAnnotations;

namespace online_booking_and_reservation.Models
{
    public class CreateBookingRequest
    {
        [Required]
        public string UserId { get; set; } = string.Empty;
        
        [Required]
        public Guid ServiceId { get; set; }
        
        [Required]
        public Guid ScheduleId { get; set; }
        
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Total amount must be greater than 0")]
        public decimal TotalAmount { get; set; }
    }
} 