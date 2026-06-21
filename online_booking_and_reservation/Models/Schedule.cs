using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace online_booking_and_reservation.Models
{
    [Table("Schedules")]
    public class Schedule
    {
        [Key]
        public Guid ScheduleId { get; set; } = Guid.NewGuid();

        [Required]
        public Guid ServiceId { get; set; }

        [Required]
        [Column(TypeName = "date")]
        public DateTime StartDate { get; set; }

        [Required]
        [Column(TypeName = "time")]
        public TimeSpan StartTime { get; set; }

        [Required]
        [Column(TypeName = "time")]
        public TimeSpan EndTime { get; set; }

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "Available";

        // Navigation property
        [ForeignKey("ServiceId")]
        public virtual Service? Service { get; set; }
    }
} 