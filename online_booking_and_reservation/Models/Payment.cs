using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace online_booking_and_reservation.Models
{
    [Table("Payments")]
    public class Payment
    {
        [Key]
        [Column("payment_id")]
        public Guid PaymentId { get; set; } = Guid.NewGuid();

        [Required]
        [Column("booking_id")]
        public Guid BookingId { get; set; }

        [Required]
        [Column("payment_method")]
        [StringLength(50)]
        public string PaymentMethod { get; set; } = string.Empty;

        [Required]
        [Column("amount_paid", TypeName = "decimal(10,2)")]
        public decimal AmountPaid { get; set; }

        [Required]
        [Column("payment_type")]
        [StringLength(20)]
        public string PaymentType { get; set; } = string.Empty;

        [Required]
        [Column("payment_date")]
        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

        // Navigation property
        [ForeignKey("BookingId")]
        public virtual Booking? Booking { get; set; }
    }
} 