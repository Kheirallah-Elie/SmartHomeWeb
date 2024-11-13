using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using SmartHomeWeb.Server;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddSignalR();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS ---->>>>> (en gros cest pour permettre à notre site web d'acceder l'api)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigins", builder =>
    {
        builder.WithOrigins("https://localhost:4200", "https://127.0.0.1:4200") // Both origins
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials(); // Required for SignalR with CORS
    });
});

builder.Services.AddSingleton<MongoDBContext>();
builder.Services.AddSingleton<UserService>();

#region CHANGES 
// Add Session support
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30); // Set session timeout (30 minutes)
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});
#endregion

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseRouting(); // Ensure UseRouting is before UseCors, UseSession, and UseEndpoints

#region CHANGES
app.UseSession();// Enable sessions
#endregion

app.UseCors("AllowSpecificOrigins"); // Apply updated CORS policy

app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("/index.html");

// SignalR configuration
app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
    endpoints.MapHub<DeviceHub>("/deviceHub"); // Map SignalR hub
});

app.Run();
