using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using online_booking_and_reservation.Data;
using online_booking_and_reservation.Models;
using System.ComponentModel.DataAnnotations;

namespace online_booking_and_reservation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        // GET: api/users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(string id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            return user;
        }

        // POST: api/users
        [HttpPost]
        public async Task<ActionResult<User>> CreateOrUpdateUser(CreateUserRequest request)
        {
            if (ModelState.IsValid)
            {
                // Check if user exists by email
                var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

                if (existingUser != null)
                {
                    // Update existing user
                    existingUser.FullName = request.FullName;
                    existingUser.Phone = request.Phone;

                    try
                    {
                        await _context.SaveChangesAsync();
                    }
                    catch (DbUpdateConcurrencyException)
                    {
                        if (!UserExists(existingUser.UserId))
                        {
                            return NotFound();
                        }
                        else
                        {
                            throw;
                        }
                    }

                    return Ok(new
                    {
                        user_id = existingUser.UserId,
                        full_name = existingUser.FullName,
                        email = existingUser.Email,
                        phone = existingUser.Phone,
                        created_at = existingUser.CreatedAt
                    });
                }
                else
                {
                    // Create new user
                    var user = new User
                    {
                        UserId = Guid.NewGuid().ToString(),
                        FullName = request.FullName,
                        Email = request.Email,
                        Phone = request.Phone,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.Users.Add(user);
                    await _context.SaveChangesAsync();

                    return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, new
                    {
                        userId = user.UserId,
                        fullName = user.FullName,
                        email = user.Email,
                        phone = user.Phone,
                        createdAt = user.CreatedAt
                    });
                }
            }

            return BadRequest(ModelState);
        }

        // PUT: api/users/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(string id, CreateUserRequest request)
        {
            var existingUser = await _context.Users.FindAsync(id);
            if (existingUser == null)
            {
                return NotFound();
            }

            // Check if email is being changed and if it already exists
            if (request.Email != existingUser.Email)
            {
                var emailExists = await _context.Users.AnyAsync(u => u.Email == request.Email);
                if (emailExists)
                {
                    return BadRequest("Email already exists");
                }
            }

            existingUser.FullName = request.FullName;
            existingUser.Email = request.Email;
            existingUser.Phone = request.Phone;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
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

        // DELETE: api/users/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/users/email/{email}
        [HttpGet("email/{email}")]
        public async Task<ActionResult<User>> GetUserByEmail(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                return NotFound();
            }

            return user;
        }

        private bool UserExists(string id)
        {
            return _context.Users.Any(e => e.UserId == id);
        }
    }

    // Request model for creating/updating user
    public class CreateUserRequest
    {
        [Required]
        [StringLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(15)]
        [RegularExpression(@"^\+251\d{9}$", ErrorMessage = "Phone number must start with +251 followed by 9 digits")]
        public string Phone { get; set; } = string.Empty;
    }
} 