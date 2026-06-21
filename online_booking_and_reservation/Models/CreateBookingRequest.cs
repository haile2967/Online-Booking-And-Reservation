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
        
        // TotalAmount will be automatically set to the service's base price
        // No need to include it in the request
    }
} 