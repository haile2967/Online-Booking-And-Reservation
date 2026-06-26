using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace online_booking_and_reservation.Models
{
    [Table("cancellation_policies")]
    public class CancellationPolicy
    {
        [Key]
        [Column("policy_id")]
        public Guid PolicyId { get; set; } = Guid.NewGuid();

        [Required]
        [Column("notice_hours")]
        public int NoticeHours { get; set; }

        [Required]
        [Column("refund_percentage")]
        public int RefundPercentage { get; set; } = 0;
    }
} 