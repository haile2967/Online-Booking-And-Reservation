using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace online_booking_and_reservation.Models
{
    [Table("Payments")]
    public class Payment
    {
        [Key]
        public Guid PaymentId { get; set; } = Guid.NewGuid();

        [Required]
        public Guid BookingId { get; set; }

        [Required]
        [StringLength(50)]
        public string PaymentMethod { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal AmountPaid { get; set; }

        [Required]
        [StringLength(20)]
        public string PaymentType { get; set; } = string.Empty;

        [Required]
        public DateTime PaymentDate { get; set; } = DateTime.Now;

        // Navigation property
        [ForeignKey("BookingId")]
        public virtual Booking? Booking { get; set; }
    }
} 