using System.ComponentModel.DataAnnotations;

namespace online_booking_and_reservation.Models
{
    public class CreateResourceRequest
    {
        public Guid? ServiceId { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Type { get; set; } = string.Empty;

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
        public int Quantity { get; set; } = 1;

        [Required]
        [StringLength(50)]
        public string Unit { get; set; } = string.Empty;

        [StringLength(255)]
        public string? Address { get; set; }
    }
} 