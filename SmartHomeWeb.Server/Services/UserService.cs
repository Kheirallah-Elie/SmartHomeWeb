using MongoDB.Driver;
using BCrypt.Net;

public class UserService
{
    private readonly MongoDBContext _context;

    public UserService(MongoDBContext context)
    {
        _context = context;
    }

    public async Task<List<User>> GetUsersAsync() =>
        await _context.Users.Find(_ => true).ToListAsync();

    public async Task<User> GetUserByIdAsync(string userId) =>
        await _context.Users.Find(user => user.UserId == userId).FirstOrDefaultAsync();

    public async Task<string> CreateUserAsync(User user)
    {
        try
        {
            // Check if the email already exists
            var existingUser = await _context.Users.Find(u => u.Email == user.Email).FirstOrDefaultAsync();
            if (existingUser != null)
            {
                return "Email already in use. Please choose another one.";
            }

            // Hash the password before saving it to the database
            Console.WriteLine($"Registered User: {user.Email}, Password Hash: {user.Password}");
            user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);

            // Insert the user into the MongoDB collection
            await _context.Users.InsertOneAsync(user);
            return "User registered successfully.";
        }
        catch (Exception ex)
        {
            // Log the error for debugging
            Console.WriteLine($"Error occurred while creating user: {ex.Message}");
            throw; // Optionally rethrow the exception or handle it
        }
    }

    public async Task<User> AuthenticateAsync(string email, string password)
    {
        // Find the user in the Db. If the user exists and the provided password matches the hashed password
        User user = await _context.Users.Find(u => u.Email == email).FirstOrDefaultAsync();
        if (user != null && BCrypt.Net.BCrypt.Verify(password, user.Password))
        {
            Console.WriteLine($"Authentication successful for: {email}");
            return user; // Authentication succeeded
        }

        Console.WriteLine($"Authentication failed for: {email}");
        return null; // Authentication failed
    }

    public async Task<bool> UpdateUserAsync(string userId, User updatedUser)
    {
        var result = await _context.Users.ReplaceOneAsync(u => u.UserId == userId, updatedUser);
        return result.IsAcknowledged && result.ModifiedCount > 0;
    }

    public async Task<User> DeleteUserAsync(string id) =>
        await _context.Users.FindOneAndDeleteAsync(user => user.UserId == id);

    
}
