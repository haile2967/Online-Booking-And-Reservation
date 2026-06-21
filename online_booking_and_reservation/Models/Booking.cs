using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace online_booking_and_reservation.Models
{
    [Table("Bookings")]
    public class Booking
    {
        [Key]
        [Column("booking_id")]
        public Guid BookingId { get; set; } = Guid.NewGuid();

        [Required]
        [Column("user_id")]
        [StringLength(50)]
        public string UserId { get; set; } = string.Empty;

        [Required]
        [Column("service_id")]
        public Guid ServiceId { get; set; }

        [Required]
        [Column("schedule_id")]
        public Guid ScheduleId { get; set; }

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "Pending";

        [Required]
        [Column("total_amount", TypeName = "decimal(10,2)")]
        public decimal TotalAmount { get; set; }

        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }

        [ForeignKey("ServiceId")]
        public virtual Service? Service { get; set; }

        [ForeignKey("ScheduleId")]
        public virtual Schedule? Schedule { get; set; }
    }
} 