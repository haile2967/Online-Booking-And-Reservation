using Microsoft.EntityFrameworkCore;
using online_booking_and_reservation.Models;

namespace online_booking_and_reservation.Data
{
    public static class DbSeeder
    {
        /// <summary>
        /// Seeds the default admin account if one does not already exist.
        /// Call this once at application startup after migrations are applied.
        /// </summary>
        public static async Task SeedAdminAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // Apply any pending migrations automatically
            await context.Database.MigrateAsync();

            const string adminEmail = "admin@booking.com";

            bool adminExists = await context.Accounts
                .AnyAsync(a => a.Email == adminEmail && a.Role == "Admin");

            if (!adminExists)
            {
                var admin = new Account
                {
                    Id         = Guid.NewGuid(),
                    FullName   = "System Admin",
                    Email      = adminEmail,
                    Role       = "Admin",
                    Password   = "Admin@1234",   // Change this after first login
                    Status     = "Active",
                    CreatedAt  = DateTime.UtcNow
                };

                context.Accounts.Add(admin);
                await context.SaveChangesAsync();

                Console.WriteLine("✅ Admin account seeded successfully.");
                Console.WriteLine($"   Email   : {admin.Email}");
                Console.WriteLine($"   Password: Admin@1234  (please change after first login)");
            }
            else
            {
                Console.WriteLine("ℹ️  Admin account already exists – skipping seed.");
            }
        }
    }
}
