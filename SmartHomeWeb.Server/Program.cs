using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using SmartHomeWeb.Server;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS ---->>>>> (en gros cest pour permettre à notre site web d'acceder l'api)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin() // Autorise toutes les origines
                   .AllowAnyMethod() // Autorise toutes les méthodes (GET, POST, etc.)
                   .AllowAnyHeader(); // Autorise tous les en-têtes
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

// Enable CORS
app.UseCors("AllowAll"); // Ajoutez cette ligne pour activer CORS

#region CHANGES
app.UseSession();// Enable sessions
#endregion
app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
