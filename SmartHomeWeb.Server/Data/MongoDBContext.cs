using MongoDB.Driver;

public class MongoDBContext
{
    private readonly IMongoDatabase _database;

    public MongoDBContext(IConfiguration config)
    {
        // Access the "MongoDBSettings" section directly
        var mongoDbSettings = config.GetSection("MongoDBSettings");
        var connectionString = mongoDbSettings.GetValue<string>("ConnectionString");
        var databaseName = mongoDbSettings.GetValue<string>("DatabaseName");

        var client = new MongoClient(connectionString);
        _database = client.GetDatabase(databaseName);
    }

    public IMongoCollection<User> Users => _database.GetCollection<User>("Users");
}
