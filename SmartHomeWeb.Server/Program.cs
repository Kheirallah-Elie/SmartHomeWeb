using Microsoft.Azure.SignalR;

var builder = WebApplication.CreateBuilder(args);

// Retrieve the SignalR connection string
var signalRConnectionString = builder.Configuration["AzureSignalR:ConnectionString"];
builder.Services.AddSignalR().AddAzureSignalR(signalRConnectionString);

// Add other services
builder.Services.AddControllers();
builder.Services.AddHttpClient<UserService>(); // Register HttpClient for UserService
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS services.
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()
        .SetIsOriginAllowed(origin => true); // Allow all origins for testing. Restrict this in production.
    });
});

builder.Services.AddSingleton<MongoDBContext>();
builder.Services.AddSingleton<UserService>();
builder.Services.AddSingleton<HomeService>();
builder.Services.AddSingleton<RoomService>();
builder.Services.AddSingleton<DeviceService>();

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
app.UseCors();
app.MapHub<DeviceHub>("/deviceHub"); // the SignalR pattern


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

app.UseAuthorization();
app.MapControllers();
app.MapFallbackToFile("/index.html");

app.Run();