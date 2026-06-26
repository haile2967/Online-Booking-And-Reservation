using Microsoft.EntityFrameworkCore;
using online_booking_and_reservation.Models;

namespace online_booking_and_reservation.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Account> Accounts { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<CancellationPolicy> CancellationPolicies { get; set; }
        public DbSet<Service> Services { get; set; }
        public DbSet<Resource> Resources { get; set; }
        public DbSet<Schedule> Schedules { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Payment> Payments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Account entity
            modelBuilder.Entity<Account>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
                entity.Property(e => e.FullName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Role).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Password).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Status).IsRequired().HasMaxLength(20).HasDefaultValue("Active");
                entity.Property(e => e.CreatedAt).IsRequired().HasDefaultValueSql("NOW()");
            });

            // Configure Category entity
            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasKey(e => e.CategoryId);
                entity.Property(e => e.CategoryId).HasDefaultValueSql("gen_random_uuid()");
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(255);
            });

            // Configure CancellationPolicy entity
            modelBuilder.Entity<CancellationPolicy>(entity =>
            {
                entity.HasKey(e => e.PolicyId);
                entity.Property(e => e.PolicyId).HasColumnName("policy_id").HasDefaultValueSql("gen_random_uuid()");
                entity.Property(e => e.NoticeHours).HasColumnName("notice_hours").IsRequired();
                entity.Property(e => e.RefundPercentage).HasColumnName("refund_percentage").IsRequired().HasDefaultValue(0);
            });

            // Configure Service entity
            modelBuilder.Entity<Service>(entity =>
            {
                entity.HasKey(e => e.ServiceId);
                entity.Property(e => e.ServiceId).HasDefaultValueSql("gen_random_uuid()");
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.BasePrice).IsRequired().HasColumnType("decimal(10,2)");
                entity.Property(e => e.Capacity).IsRequired().HasDefaultValue(1);
                entity.Property(e => e.Status).IsRequired().HasMaxLength(30).HasDefaultValue("Available");

                // Configure foreign key relationships
                entity.HasOne(s => s.Category)
                    .WithMany()
                    .HasForeignKey(s => s.CategoryId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(s => s.CancellationPolicy)
                    .WithMany()
                    .HasForeignKey(s => s.PolicyId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // Configure Resource entity
            modelBuilder.Entity<Resource>(entity =>
            {
                entity.HasKey(e => e.ResourceId);
                entity.Property(e => e.ResourceId).HasDefaultValueSql("gen_random_uuid()");
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Type).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Quantity).IsRequired();
                entity.Property(e => e.Unit).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Address).HasMaxLength(255);

                // Configure foreign key relationship
                entity.HasOne(r => r.Service)
                    .WithMany()
                    .HasForeignKey(r => r.ServiceId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // Configure Schedule entity
            modelBuilder.Entity<Schedule>(entity =>
            {
                entity.HasKey(e => e.ScheduleId);
                entity.Property(e => e.ScheduleId).HasDefaultValueSql("gen_random_uuid()");
                entity.Property(e => e.ServiceId).IsRequired();
                entity.Property(e => e.StartDate).HasColumnType("date").IsRequired();
                entity.Property(e => e.StartTime).HasColumnType("time").IsRequired();
                entity.Property(e => e.EndTime).HasColumnType("time").IsRequired();
                entity.Property(e => e.Status).IsRequired().HasMaxLength(20).HasDefaultValue("Available");

                // Configure foreign key relationship
                entity.HasOne(s => s.Service)
                    .WithMany()
                    .HasForeignKey(s => s.ServiceId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure User entity
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.UserId);
                entity.Property(e => e.UserId).HasMaxLength(50);
                entity.Property(e => e.FullName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Phone).IsRequired().HasMaxLength(15);
                entity.Property(e => e.CreatedAt).IsRequired().HasDefaultValueSql("NOW()");
            });

            // Configure Booking entity
            modelBuilder.Entity<Booking>(entity =>
            {
                entity.HasKey(e => e.BookingId);
                entity.Property(e => e.BookingId).HasDefaultValueSql("gen_random_uuid()");
                entity.Property(e => e.UserId).IsRequired().HasMaxLength(50);
                entity.Property(e => e.ServiceId).IsRequired();
                entity.Property(e => e.ScheduleId).IsRequired();
                entity.Property(e => e.Status).IsRequired().HasMaxLength(20).HasDefaultValue("Pending");
                entity.Property(e => e.TotalAmount).IsRequired().HasColumnType("decimal(10,2)");
                entity.Property(e => e.CreatedAt).IsRequired().HasDefaultValueSql("NOW()");

                // Configure foreign key relationships
                entity.HasOne(b => b.User)
                    .WithMany()
                    .HasForeignKey(b => b.UserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(b => b.Service)
                    .WithMany()
                    .HasForeignKey(b => b.ServiceId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(b => b.Schedule)
                    .WithMany()
                    .HasForeignKey(b => b.ScheduleId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure Payment entity
            modelBuilder.Entity<Payment>(entity =>
            {
                entity.ToTable("Payments");
                entity.HasKey(e => e.PaymentId);
                entity.Property(e => e.PaymentId).HasDefaultValueSql("gen_random_uuid()");
                entity.Property(e => e.BookingId).IsRequired();
                entity.Property(e => e.PaymentMethod).IsRequired().HasMaxLength(50);
                entity.Property(e => e.AmountPaid).IsRequired().HasColumnType("decimal(10,2)");
                entity.Property(e => e.PaymentType).IsRequired().HasMaxLength(20);
                entity.Property(e => e.PaymentDate).IsRequired().HasDefaultValueSql("NOW()");

                // Configure foreign key relationship
                entity.HasOne(p => p.Booking)
                    .WithMany()
                    .HasForeignKey(p => p.BookingId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
} 