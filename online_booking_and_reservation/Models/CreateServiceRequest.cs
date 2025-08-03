using System.ComponentModel.DataAnnotations;

namespace online_booking_and_reservation.Models
{
    public class CreateServiceRequest
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public Guid CategoryId { get; set; }

        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "Base price cannot be negative")]
        public decimal BasePrice { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Capacity must be at least 1")]
        public int Capacity { get; set; } = 1;

        public Guid? PolicyId { get; set; }
    }
} 