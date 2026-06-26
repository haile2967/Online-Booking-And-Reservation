using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace online_booking_and_reservation.Models
{
    [Table("Services")]
    public class Service
    {
        [Key]
        public Guid ServiceId { get; set; } = Guid.NewGuid();

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public Guid CategoryId { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal BasePrice { get; set; }

        [Required]
        public int Capacity { get; set; } = 1;

        public Guid? PolicyId { get; set; }

        [Required]
        [StringLength(30)]
        public string Status { get; set; } = "Available";

        // Navigation properties
        [ForeignKey("CategoryId")]
        public virtual Category? Category { get; set; }

        [ForeignKey("PolicyId")]
        public virtual CancellationPolicy? CancellationPolicy { get; set; }
    }
} 