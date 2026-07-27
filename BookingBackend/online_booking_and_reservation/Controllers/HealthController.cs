using Microsoft.AspNetCore.Mvc;

namespace online_booking_and_reservation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        // GET: api/Health
        // Lightweight endpoint for keep-alive pings and server warm-up
        [HttpGet]
        public IActionResult GetHealth()
        {
            return Ok(new { status = "ok", timestamp = DateTime.UtcNow });
        }
    }
}
