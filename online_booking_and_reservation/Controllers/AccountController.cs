using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using online_booking_and_reservation.Data;
using online_booking_and_reservation.Models;

namespace online_booking_and_reservation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AccountController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Account
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Account>>> GetAccounts()
        {
            return await _context.Accounts.ToListAsync();
        }

        // GET: api/Account/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Account>> GetAccount(Guid id)
        {
            var account = await _context.Accounts.FindAsync(id);

            if (account == null)
            {
                return NotFound();
            }

            return account;
        }

        // POST: api/Account
        [HttpPost]
        public async Task<ActionResult<Account>> CreateAccount(Account account)
        {
            if (ModelState.IsValid)
            {
                // Check if email already exists
                if (await _context.Accounts.AnyAsync(a => a.Email == account.Email))
                {
                    return BadRequest("Email already exists");
                }

                account.Id = Guid.NewGuid();
                account.CreatedAt = DateTime.UtcNow;
                account.Status = "Active";

                _context.Accounts.Add(account);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetAccount), new { id = account.Id }, account);
            }

            return BadRequest(ModelState);
        }

        // PUT: api/Account/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAccount(Guid id, Account account)
        {
            if (id != account.Id)
            {
                return BadRequest();
            }

            var existingAccount = await _context.Accounts.FindAsync(id);
            if (existingAccount == null)
            {
                return NotFound();
            }

            // Check if email already exists for another account
            if (await _context.Accounts.AnyAsync(a => a.Email == account.Email && a.Id != id))
            {
                return BadRequest("Email already exists");
            }

            existingAccount.FullName = account.FullName;
            existingAccount.Email = account.Email;
            existingAccount.Role = account.Role;
            existingAccount.Password = account.Password;
            existingAccount.Status = account.Status;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AccountExists(id))
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

        // DELETE: api/Account/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAccount(Guid id)
        {
            var account = await _context.Accounts.FindAsync(id);
            if (account == null)
            {
                return NotFound();
            }

            _context.Accounts.Remove(account);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Account/profile/{id}
        [HttpGet("profile/{id}")]
        public async Task<ActionResult<Account>> GetProfile(Guid id)
        {
            var account = await _context.Accounts.FindAsync(id);

            if (account == null)
            {
                return NotFound();
            }

            return account;
        }

        // POST: api/Account/login
        [HttpPost("login")]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var account = await _context.Accounts
                .FirstOrDefaultAsync(a => a.Email == request.Email && a.Password == request.Password);

            if (account == null)
            {
                return Unauthorized("Invalid email or password");
            }

            if (account.Status != "Active")
            {
                return BadRequest("Account is not active");
            }

            var response = new LoginResponse
            {
                Id = account.Id,
                FullName = account.FullName,
                Email = account.Email,
                Role = account.Role,
                Status = account.Status,
                CreatedAt = account.CreatedAt,
                Message = "Login successful"
            };

            return Ok(response);
        }

        // PUT: api/Account/change-password/{id}
        [HttpPut("change-password/{id}")]
        public async Task<IActionResult> ChangePassword(Guid id, [FromBody] ChangePasswordRequest request)
        {
            var account = await _context.Accounts.FindAsync(id);

            if (account == null)
            {
                return NotFound();
            }

            // In production, verify the current password first
            // if (account.Password != request.CurrentPassword)
            // {
            //     return BadRequest("Current password is incorrect");
            // }

            account.Password = request.NewPassword; // In production, hash this password
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AccountExists(Guid id)
        {
            return _context.Accounts.Any(e => e.Id == id);
        }
    }
} 