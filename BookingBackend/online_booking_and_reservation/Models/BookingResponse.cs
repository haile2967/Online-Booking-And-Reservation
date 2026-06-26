namespace online_booking_and_reservation.Models
{
    public class BookingResponse
    {
        public Guid BookingId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public Guid ServiceId { get; set; }
        public Guid ScheduleId { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public DateTime CreatedAt { get; set; }
        public UserInfo? User { get; set; }
        public ServiceInfo? Service { get; set; }
        public ScheduleInfo? Schedule { get; set; }
    }

    public class UserInfo
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
    }

    public class ServiceInfo
    {
        public string Name { get; set; } = string.Empty;
        public decimal BasePrice { get; set; }
    }

    public class ScheduleInfo
    {
        public DateTime StartDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public ResourceInfo? Resource { get; set; }
    }

    public class ResourceInfo
    {
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
    }
} 