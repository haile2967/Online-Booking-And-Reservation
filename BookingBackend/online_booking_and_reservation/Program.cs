using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

// Add DbContext
builder.Services.AddDbContext<online_booking_and_reservation.Data.ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure Email Settings
builder.Services.Configure<online_booking_and_reservation.Models.EmailSettings>(
    builder.Configuration.GetSection("EmailSettings"));

// Register Email Service
builder.Services.AddTransient<online_booking_and_reservation.Services.IEmailService, online_booking_and_reservation.Services.EmailService>();

// Add CORS for frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://localhost:3004", "http://localhost:5173", "http://localhost:5174")
              .SetIsOriginAllowed(origin => true) // Allow production domains dynamically
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Add Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
    // Note: UseHttpsRedirection is NOT needed here because
    // Render handles SSL termination at the proxy level.
    // The container only receives HTTP traffic internally.
}

app.UseStaticFiles();

app.UseRouting();

// Use CORS
app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

// Seed the default admin account
await online_booking_and_reservation.Data.DbSeeder.SeedAdminAsync(app.Services);

app.Run();
