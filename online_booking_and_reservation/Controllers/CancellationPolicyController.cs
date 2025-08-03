using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using online_booking_and_reservation.Data;
using online_booking_and_reservation.Models;

namespace online_booking_and_reservation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CancellationPolicyController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CancellationPolicyController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/CancellationPolicy
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CancellationPolicy>>> GetCancellationPolicies()
        {
            return await _context.CancellationPolicies.ToListAsync();
        }

        // GET: api/CancellationPolicy/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CancellationPolicy>> GetCancellationPolicy(Guid id)
        {
            var policy = await _context.CancellationPolicies.FindAsync(id);

            if (policy == null)
            {
                return NotFound();
            }

            return policy;
        }

        // POST: api/CancellationPolicy
        [HttpPost]
        public async Task<ActionResult<CancellationPolicy>> CreateCancellationPolicy(CancellationPolicy policy)
        {
            if (ModelState.IsValid)
            {
                policy.PolicyId = Guid.NewGuid();

                // Validate refund percentage
                if (policy.RefundPercentage < 0 || policy.RefundPercentage > 100)
                {
                    return BadRequest("Refund percentage must be between 0 and 100");
                }

                // Validate notice hours
                if (policy.NoticeHours < 0)
                {
                    return BadRequest("Notice hours must be non-negative");
                }

                _context.CancellationPolicies.Add(policy);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetCancellationPolicy), new { id = policy.PolicyId }, policy);
            }

            return BadRequest(ModelState);
        }

        // PUT: api/CancellationPolicy/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCancellationPolicy(Guid id, CancellationPolicy policy)
        {
            if (id != policy.PolicyId)
            {
                return BadRequest();
            }

            var existingPolicy = await _context.CancellationPolicies.FindAsync(id);
            if (existingPolicy == null)
            {
                return NotFound();
            }

            // Validate refund percentage
            if (policy.RefundPercentage < 0 || policy.RefundPercentage > 100)
            {
                return BadRequest("Refund percentage must be between 0 and 100");
            }

            // Validate notice hours
            if (policy.NoticeHours < 0)
            {
                return BadRequest("Notice hours must be non-negative");
            }

            existingPolicy.NoticeHours = policy.NoticeHours;
            existingPolicy.RefundPercentage = policy.RefundPercentage;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CancellationPolicyExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/CancellationPolicy/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCancellationPolicy(Guid id)
        {
            var policy = await _context.CancellationPolicies.FindAsync(id);
            if (policy == null)
            {
                return NotFound();
            }

            _context.CancellationPolicies.Remove(policy);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/CancellationPolicy/by-refund/{percentage}
        [HttpGet("by-refund/{percentage}")]
        public async Task<ActionResult<IEnumerable<CancellationPolicy>>> GetPoliciesByRefundPercentage(int percentage)
        {
            if (percentage < 0 || percentage > 100)
            {
                return BadRequest("Refund percentage must be between 0 and 100");
            }

            var policies = await _context.CancellationPolicies
                .Where(p => p.RefundPercentage == percentage)
                .ToListAsync();

            return policies;
        }

        // GET: api/CancellationPolicy/by-notice/{hours}
        [HttpGet("by-notice/{hours}")]
        public async Task<ActionResult<IEnumerable<CancellationPolicy>>> GetPoliciesByNoticeHours(int hours)
        {
            if (hours < 0)
            {
                return BadRequest("Notice hours must be non-negative");
            }

            var policies = await _context.CancellationPolicies
                .Where(p => p.NoticeHours == hours)
                .ToListAsync();

            return policies;
        }

        private bool CancellationPolicyExists(Guid id)
        {
            return _context.CancellationPolicies.Any(e => e.PolicyId == id);
        }
    }
} 