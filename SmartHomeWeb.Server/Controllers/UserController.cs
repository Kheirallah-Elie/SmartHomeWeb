using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;

[Route("api/[controller]")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly UserService _userService;

    public UserController(UserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _userService.GetUsersAsync();
        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(string id)
    {
        var user = await _userService.GetUserByIdAsync(id);
        return user == null ? NotFound() : Ok(user);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(User user)
    {
        user.UserId = ObjectId.GenerateNewId().ToString();
        user.Homes = new List<Home>(); // Initialize with an empty list
        //#region CHANGES - Encrypt the Password
        //user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password); // Not necessary for the moment
        //#endregion
        await _userService.CreateUserAsync(user);
        return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, user);
    }


    #region CHANGES
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
    {
        Console.WriteLine($"Login attempt for: {loginRequest.Email}");

        var user = await _userService.AuthenticateAsync(loginRequest.Email, loginRequest.Password);
        if (user == null)
        {
            Console.WriteLine("Login failed: Invalid credentials");
            return Unauthorized(new { message = "Invalid credentials. Please check your email and password." });
        }

        // Store user ID in session upon successful login
        HttpContext.Session.SetString("UserId", user.UserId);

        // Renvoyer l'ID avec un message de succès
        return Ok(new { message = "Login successful", userId = user.UserId });
    }
    #endregion

    #region
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        // Clear session data to log out the user
        HttpContext.Session.Clear();
        return Ok(new { message = "Logout successful" });
    }
    #endregion


    #region
    [HttpGet("isAuthenticated")] 
    // Check if the user is authenticated
    public IActionResult IsAuthenticated()
    {
        // Check if session contains user ID
        bool isAuthenticated = HttpContext.Session.GetString("UserId") != null;
        return Ok(isAuthenticated);
    }
    #endregion

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(string id, User updatedUser)
    {
        var result = await _userService.UpdateUserAsync(id, updatedUser);
        return result ? NoContent() : NotFound();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var user = await _userService.DeleteUserAsync(id);
        return user == null ? NotFound() : NoContent();
    }
}

#region
public class LoginRequest
{
    public string Email { get; set; }
    public string Password { get; set; }
}
#endregion