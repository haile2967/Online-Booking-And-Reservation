using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace online_booking_and_reservation.Models
{
    [Table("Resources")]
    public class Resource
    {
        [Key]
        public Guid ResourceId { get; set; } = Guid.NewGuid();

        public Guid? ServiceId { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Type { get; set; } = string.Empty;

        [Required]
        public int Quantity { get; set; } = 1;

        [Required]
        [StringLength(50)]
        public string Unit { get; set; } = string.Empty;

        [StringLength(255)]
        public string? Address { get; set; }

        // Navigation property
        [ForeignKey("ServiceId")]
        public virtual Service? Service { get; set; }
    }
} 